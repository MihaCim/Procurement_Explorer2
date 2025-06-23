import inspect
import json
import os
import re
import traceback
from textwrap import dedent
from typing import Any, Callable

import tiktoken
from browse_tools import extract_text_from_url, search_google
from company_data import CompanyData
from dotenv import load_dotenv
from fastapi import FastAPI
from llm_client import LLMClient
from logger import Logger, logger
from prompts.prompts2 import Prompts

# import uvicorn
OPENAI_API_KEY = os.getenv("OPENAI_API_KEY")
LLM_TYPE = os.getenv("LLM_TYPE")
app = FastAPI()

load_dotenv()
llm_client = LLMClient()
prompts = Prompts()

CHAT_MODEL_SMALL = "gpt-4o-mini"
CHAT_MODEL_BIG = "gpt-4o"
CHAT_MODEL = CHAT_MODEL_BIG

CONTEXT_LIMIT = 10000
MAXIMUM_CALLS_AGENT = 8
MAXIMUM_CALLS_THREAD = 15


async def call_llm(prompt: str) -> str:
    if LLM_TYPE == "gemini":
        return await llm_client.generate_gemini_response(prompt)
    elif LLM_TYPE == "azure":
        return await llm_client.generate_azure_response(prompt)
    else:
        return await llm_client.generate_openai_response(prompt)


def maybe_remove_json_code_block_markers(input_string: str) -> str:
    if input_string.startswith("```json"):
        input_string = input_string.removeprefix("```json")

    if input_string.endswith("```"):
        input_string = input_string.removesuffix("```")

    input_string = input_string.strip()
    return input_string


def num_tokens_from_string(string: str, encoding_name: str = "cl100k_base") -> int:
    """Returns the number of tokens in a text string."""
    encoding = tiktoken.get_encoding(encoding_name)
    num_tokens = len(encoding.encode(string))
    return num_tokens


async def create_final_report(data: dict[str, str]) -> str:
    prompt = f"""
                    Prepare company profile report. This are final data about the company:
                            {json.dumps(data)}
                            ----------------
                   Create a markup text to be printed on the web UI with streamlit. 
                   Here is an example of the structure to follow:

                   3. Description
                   4. Security risks
                   6. Operational risks
                   7. Key relationships
                   8. Risk Level

                   Make the report verbose and descriptive in a form of a document. 
                   Make text in paragraph. 
                   The final output should be in markup format.
                    """.strip()
    report = await call_llm(prompt)
    return report


async def summarize_with_intent(texts: list[str], intent: str) -> str:
    return await call_llm(
        f"""
        Summarize the following texts with the intent of '{intent}', 
        ensuring to keep important information such as URLs, numbers, decisions, 
        and other critical details: \n{" ".join(set(texts))}
    """.strip()
    )


class FunctionalAgent:
    def __init__(
        self,
        logger: Logger,
        name: str = "Agent",
        system_prompt: str = None,
        model: str = CHAT_MODEL,
        functions: list[Callable[..., Any]] | None = None,
    ):
        self.registry = dict[str, dict[str, Any]]()
        self.maximum_calls = MAXIMUM_CALLS_AGENT
        self.model = model
        self.name = name
        self.system_prompt = system_prompt or (
            f"You are a {name}. You can call any of the following functions."
        )
        self.logger = logger
        self.buffer = list[str]()
        self.register(self.response)
        if functions:
            for func in functions:
                self.register(func)

    def set_system_prompt(self, prompt: str):
        self.system_prompt = prompt

    def get_system_prompt(self):
        return self.system_prompt

    def clear_buffer(self):
        """Clears the agent's buffer."""
        self.buffer = list[str]()

    def register(self, func: Callable[..., Any]) -> None:
        if func.__name__ in self.registry:
            raise ValueError("Function already registered")
        function_params = {
            param_name: param.annotation.__name__
            for param_name, param in inspect.signature(func).parameters.items()
        }
        self.registry[func.__name__] = {
            "description": func.__doc__,
            "params": function_params,
            "function": func,  # Store the function itself
        }

    async def call_function(self, func_name: str, **kwargs: Any):
        """Dynamically call a function from the registry."""
        if func_name in self.registry:
            func_info = self.registry[func_name]
            return await func_info["function"](**kwargs)
        else:
            raise ValueError(f"Function not found in the registry {func_name}")

    async def map_function_call(self, ai_output_raw: str, funct_registry: str) -> str:
        prompt = dedent(f"""
                        You are tasked with: mapping the existing function to one of the registry functions available.
                        Here is the existing definition:
                                ----------------
                                {ai_output_raw}
                                ----------------
                        Map it to the appropriate function from the registry, that best fits the description:
                                ----------------
                                <functions registry>
                                {funct_registry}
                                </Functions registry>
                    Create final response as valid json with this structure: 
                    "name": "function_name",
                    "output": "explain what does calling this function do eg. I am updating the value for user x.",
                    "reasoning": "explain why you are calling this function eg. I need to update the user's value.", 
                    "parameters": "a dictionary with parameters to call the function. if no parameters, make empty dict."
                    Do not call function is_finished unless the function is explicitly mentioned.
                        """)
        function_mapped = await call_llm(prompt)
        return function_mapped

    def generate_functions_for_prompt(self) -> str:
        """Generates a JSON formatted string listing all functions and their metadata for the AI to process."""
        functions_list = [
            {
                "name": name,
                "description": info["description"],
                "parameters": [
                    {param_name: param_type}
                    for param_name, param_type in info["params"].items()
                ],
            }
            for name, info in self.registry.items()
        ]
        return f"{json.dumps(functions_list)}"

    def output_format(self):
        example_output = {
            "name": "function_name",
            "output": "explain what does calling this function do eg. I am updating the value for user x.",
            "reasoning": "explain why you are calling this function eg. I need to update the user's value.",
            "parameters": {
                "message": "message to pass to the function",
                "id": 12334,
                "address": "1234 Main St.",
                "ratio": 0.5,
            },
        }
        str = json.dumps(example_output)
        return f"Output should have a valid JSON object without any wrappers in the following format:\n{str}"

    async def reduce_buffer(self) -> str:
        if len(self.buffer) > 0:
            while num_tokens_from_string("\n".join(self.buffer)) > CONTEXT_LIMIT:
                summary = await summarize_with_intent(self.buffer, "shorten")
                self.buffer = [summary]
        return "\n".join(self.buffer)

    async def run(self, input_string: str = "") -> str:
        """Process the input string, call LLM, parse output, and execute function until the final function is called."""
        output = ""
        buffer_str = ""
        functions_definitions = self.generate_functions_for_prompt()
        for _ in range(self.maximum_calls):
            try:
                buffer_str = await self.reduce_buffer()
                prompt = f"""\
                {self.get_system_prompt()}
                ----------------
                You can use the following functions as tools and nothing else. 
                <Functions>
                {functions_definitions}
                </Functions>
                ----------------
                Take a deep break and think step by step.
                Call response function when you are satisfied with the output and share the satified output to response function as message.
                ----------------
                <Knowledge>
                {buffer_str}
                </Knowledge>
                ----------------
                <CurrentInputAndHistory> 
                {input_string}
                </CurrentInputAndHistory>
                ----------------
                Using the function definitions, provide the function name and parameters in a valid JSON format.
                {self.output_format()}
                ----------------
                OUTPUT:
                """
                prompt = re.sub(r"^\s+", "", prompt, flags=re.MULTILINE).strip()
                prompt = dedent(prompt).strip()

                ai_output_raw = await self.call_llm(prompt)

                ai_output = maybe_remove_json_code_block_markers(
                    await self.map_function_call(ai_output_raw, functions_definitions)
                )

                try:
                    function_output = json.loads(ai_output)
                except Exception as e:
                    print("void json.loads")
                    print(ai_output)
                    self.buffer.append(f"Error occurred: {e}.")
                    continue

                if "reasoning" in function_output:
                    pass

                if "name" in function_output:
                    func_name = function_output.get("name", None)
                    output = function_output.get("output", "")
                    if func_name == "response":
                        return output

                    self.buffer.append(output)
                    kwargs = function_output.get("parameters", {})
                    try:
                        function_response = await self.call_function(
                            func_name, **kwargs
                        )
                    except Exception as e:
                        function_response = f"{e}"

                    logger.info(
                        f"""TOOL_USAGE: {self.name} used tool {func_name} 
                        with parameters {str(kwargs)[:30]}... 
                        and got {str(function_response)[:30]}..."""
                    )
                    self.buffer.append(
                        f"<FUNCTION_RESULT>{func_name}: {str(function_response)}</FUNCTION_RESULT>"
                    )
                else:
                    self.buffer.append("Strictly follow the output format.")
            except Exception as e:
                print(f"Error: {e}")
                traceback.print_exc()

        if len(output) == 0:
            print("No output generated.")
        try:
            prompt = f"""\
                {self.get_system_prompt()}
                ----------------
                Take a deep break and think step by step.
                ----------------
                <Knowledge>
                {buffer_str}
                </Knowledge>
                ----------------
                <CurrentInputAndHistory> 
                {input_string}
                </CurrentInputAndHistory>
                ----------------
                Using the given information generate a response text.
                ----------------
                OUTPUT:
                """
            prompt = re.sub(r"^\s+", "", prompt, flags=re.MULTILINE).strip()
            prompt = dedent(prompt).strip()
            output = await self.call_llm(prompt)
        except Exception as e:
            # print(f"Error: {e}")
            # traceback.print_exc()
            self.buffer.append(f"Error occurred: {e}.")
        return output

    async def call_llm(self, input_string: str) -> str:
        try:
            response = await call_llm(input_string)
            return response
        except Exception as e:
            print(f"Error while calling LLM. {e}")
            print("input string: ", input_string)
            return "{}"

    async def response(self, message: str) -> str:
        """Response function to end the process and speak. message will be shown to the user. The message parameter should be detailed response to the given input or task."""

        return message


async def evaluate_situation(situation: str):
    """Evaluate the situation and provide a response."""
    return f"Situation evaluated: {situation}"


async def store_inner_thought(thought: str) -> str:
    """
    Stores an inner thought to use later. Ideal for when you are in the process of making a decision
    and want to record various thoughts for subsequent reflection and iteration.

    Parameters:
    thought (str): The inner thought to be stored, capturing a consideration or idea you are currently
                   pondering.

    Returns:
    str: A string formatted as 'Inner thought: {thought}', which facilitates easy retrieval and review
         of the thought.
    """
    return f"Inner thought: {thought}"


class TaskThread:
    def __init__(
        self,
        logger: Logger,
        task: str = "",
        channel: str = "",
        company_data: CompanyData = CompanyData(),
    ):
        self.task = task
        self.is_finished = False
        self.channel = channel
        self.buffer = []
        self.agents = dict[str, FunctionalAgent]()
        self.result = "No result"
        self.task_manager_name = ""
        self.company_data = company_data
        self.logger = logger

        taskManager = FunctionalAgent(
            name="Ethan Pierce (Product Manager)",
            logger=logger,
            system_prompt=prompts.Ethan,
            model=CHAT_MODEL,
            functions=[
                self.set_finished,
                self.update_report,
                self.get_report,
                store_inner_thought,
                self.company_data.read_company_data,
            ],
        )

        researcher = FunctionalAgent(
            name="Nora Caldwell (Researcher)",
            logger=logger,
            system_prompt=prompts.Nora,
            model=CHAT_MODEL,
            functions=[
                search_google,
                extract_text_from_url,
                store_inner_thought,
                self.company_data.update_company_name,
                self.company_data.update_founded,
                self.company_data.update_founder,
                self.company_data.add_address,
                self.company_data.update_key_individual,
                self.company_data.update_description,
                self.company_data.read_company_data,
                self.company_data.update_security_risk,
                self.company_data.add_financial_risk,
                self.company_data.update_operational_risk,
                self.company_data.add_key_relationships,
                self.company_data.update_risk_level,
                self.company_data.update_risk_level_int,
            ],
        )
        critic = FunctionalAgent(
            name="Julian Frost (Risk Analyst)",
            logger=logger,
            system_prompt=prompts.Julian,
            model=CHAT_MODEL,
            functions=[
                store_inner_thought,
                search_google,
                extract_text_from_url,
                self.company_data.read_company_data,
                self.company_data.update_security_risk,
                self.company_data.add_financial_risk,
                self.company_data.update_operational_risk,
                self.company_data.add_key_relationships,
                self.company_data.update_risk_level,
                self.company_data.update_risk_level_int,
            ],
        )

        document_manager = FunctionalAgent(
            name="Evelyn Fields (Documentation Specialist)",
            logger=logger,
            system_prompt=prompts.Evelin,
            model=CHAT_MODEL,
            functions=[
                store_inner_thought,
                search_google,
                extract_text_from_url,
                self.company_data.read_company_data,
                self.company_data.update_key_individual,
                self.company_data.update_security_risk,
                self.company_data.add_financial_risk,
                self.company_data.update_operational_risk,
                self.company_data.add_key_relationships,
                self.company_data.update_risk_level,
                self.company_data.update_company_name,
                self.company_data.update_founded,
                self.company_data.update_founder,
                self.company_data.add_address,
                self.company_data.update_description,
                self.company_data.update_summary,
                self.company_data.update_risk_level_int,
            ],
        )

        self.agents.update(
            {
                taskManager.name: taskManager,
                researcher.name: researcher,
                critic.name: critic,
                document_manager.name: document_manager,
            }
        )
        self.task_manager_name = taskManager.name

    def get_agent_names(self):
        return ", ".join(list(self.agents.keys()))

    async def set_finished(self, is_finished: bool = True):
        """
        Marks the task as finished and returns a message reflecting the task's result. This method should be called
        when a task is concluded, especially when a comprehensive and satisfactory report of the task is
        already prepared.

        Parameters:
        is_finished (bool): A flag to indicate whether the task should be marked as finished (default is True).

        Returns:
        str: A message indicating that the task has been marked as finished, accompanied by the task's result.
        """
        if not self.result or len(self.result) == 0:
            return "Provide a detailed report before marking the task as finished."
        self.is_finished = is_finished
        return f"Task finished with result: {self.result}"

    async def update_report(self, report: str = ""):
        """
        Set or update the report associated with a specific task.

        This method allows for setting or updating the content of a report that will be
        evaluated by a higher-level manager. The quality and clarity of this report are crucial
        for assessing the success of the task it describes.
        The report should focus exclusively on the task outcomes and not on the individuals involved.
        Make sure to include all the intormation, aggregated from various steps, and include also links, dates, numbers, and names that are relevant.
        Make the report as verbose as posible, where relevant inlcuded also explanation and reasoning behing the statements.
        Ensure the report is updated frequently to accurately reflect the most recent status of the task.

        Parameters:
        report (dict): The content of the report must follow a structured json format. Here is an example oth the schema:
        {
        "company_name": "",
        "founded": "",
        "founder": "",
        "description": "",
        "website":"",
        "country": "",
        "key_individuals": {
            {
            "name": "",
            "background": ""
            },
        },
        "security_risks": {
            risk: ,
            ref:
            },
        "financial_risks": {
            risk: ,
            ref:
            },
        "key relationships": {
            name: ,
            details:
            },

        "operational_risks": {
            risk: ,
            ref:
            },
        "address": {
            "street": "",
            "city": "",
            "state":,
        },
        "risk_level": {},
        "risk_level_int": ,
        "summary": ""
        }
        This is a sample schema, populate it with company data. Make sure to add Risk level assement and Risk_level-int value
        Returns:
        str: A confirmation message indicating that the report has been successfully set or updated.
        """
        self.result = report
        return f"{report}"

    async def get_report(self):
        """Get the report of the task."""
        if len(self.result) == 0:
            return "No report available yet."
        return self.result

    def get_buffer_str_raw(self):
        return "\n".join(self.buffer)

    async def get_buffer_str(self):
        while len(self.get_buffer_str_raw()) > CONTEXT_LIMIT:
            summary = await summarize_with_intent(
                self.buffer,
                f"shorten keeping information about task: {self.task}",
            )
            self.buffer = [summary]
        return self.get_buffer_str_raw()

    async def run(self) -> str:
        for agent in self.agents.values():
            agent.clear_buffer()

        self.buffer = list[str]()
        self.is_finished = False

        for _ in range(0, MAXIMUM_CALLS_AGENT):
            if self.is_finished:
                break

            for agent_name, agent in self.agents.items():
                if self.is_finished:
                    break
                buffer_str = await self.get_buffer_str()
                # Calculate the conversation part first
                conversation_part = (
                    f"\n\n<Conversation>\n{buffer_str}\n</Conversation>\n"
                    if buffer_str
                    else "\n"
                )

                # Now construct the agent_input as a multiline string
                agent_input = dedent(f"""\
                You are working on the following task:
                <Task>{self.task}</Task>
                You are in a conversation with the following colleagues:
                {self.get_agent_names()}
                If you are not sure about your response, ask for feedback.
                {conversation_part}
                """)
                agent_response = await agent.run(input_string=agent_input)
                if agent_response and len(agent_response) > 0:
                    self.buffer.append(
                        f"<MESSAGE>{agent_name}: {agent_response}</MESSAGE>"
                    )
                    self.logger.add_log(f"{agent_name}: {agent_response}")
                    self.logger.info(self.result)

        buffer_str = await self.get_buffer_str()
        self.logger.info(self.result)
        conversation_part = (
            f"\n\n<Conversation>\n{buffer_str}\n</Conversation>\n" if buffer_str else ""
        )
        # Now construct the agent_input as a multiline string
        agent_input = dedent(f"""\
        You are working on the following task:
        <Task>{self.task}</Task>
        You are in a conversation with the following colleagues:
        {self.get_agent_names()}
        If you are unsure about your response, ask for feedback from your colleagues.
        Write a detailed report for the task.
        {conversation_part}
        """)
        await self.agents.get(self.task_manager_name).run(input_string=agent_input)
        self.logger.info(self.result)
        # self.is_finished = True
        print("Final report: ", self.result)

        return self.result


if __name__ == "__main__":
    # asyncio.run(main())
    print("Thread started")
