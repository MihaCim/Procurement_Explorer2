import inspect
import json
import asyncio
from textwrap import dedent
import traceback
from typing import Any, Callable
import tiktoken
import re
from openai import AsyncOpenAI
from dotenv import load_dotenv
import os
from prompts.prompts2 import Prompts
from llm_client import  LLMClient
from browse_tools import extract_text_from_url, search_google
from company_data import CompanyData
from fastapi import FastAPI, HTTPException, UploadFile, Query
from fastapi.middleware.cors import CORSMiddleware
from datetime import datetime
#import uvicorn
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


class Logger:
    def __init__(self):
        pass

    def info(self, message):
        print(message)


async def call_llm(prompt: str) -> str:
    if LLM_TYPE not in ["openai", "gemini", "azure"]:
        print("You have to setup LLM_TYPE to: ollama/openai/azure")

    elif LLM_TYPE == "gemini":
        return await llm_client.generate_gemini_response(prompt)
    elif LLM_TYPE == "azure":
        return await llm_client.generate_azure_response(prompt)
    else:
        return await llm_client.generate_openai_response(prompt)


def remove_code_block_markers(input_string):
    # Check if the string starts with ```json and ends with ```
    if input_string.startswith("```json") and input_string.endswith("```"):
        # Remove the first 7 characters (```json) and the last 3 characters (```)
        return input_string[7:-3].strip()
    return input_string  # Return the original if the markers are not present

def num_tokens_from_string(string: str, encoding_name: str = "cl100k_base") -> int:
    """Returns the number of tokens in a text string."""
    encoding = tiktoken.get_encoding(encoding_name)
    num_tokens = len(encoding.encode(string))
    return num_tokens

async def create_final_report(data):
    prompt1 = f"""
                This are final data about the company:
                        {json.dumps(data)}
                        ----------------
               Create a final report as a markup text to be printed on the web UI with streamlit. 
               Here is an example of the structure to follow:
               1. Company Information:
                - company name
                - founded
                - founder
                - Address
               2. Description 
               3. Key Individuals
               4. Security risks
               5. Financial Risks
               6. Operational risks
               7. Key relationships
               8. Risk Level

               Make the report verbose and descriptive in a form of a document. Make text in paragraph. 
                """
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

                   Make the report verbose and descriptive in a form of a document. Make text in paragraph. 
                   The final output should be in markup format.
                    """
    report = await call_llm(prompt)
    print("FINAL REPORT RAW:\n", report)
    return report

async def summarize_with_intent(texts: list, intent: str) -> str:
    # Combine texts into a single string and remove duplicates
    combined_text = " ".join(set(texts))

    # Prepare the prompt with intent, specifically asking to keep important information like URLs and numbers
    prompt = f"Summarize the following texts with the intent of '{intent}', ensuring to keep important information such as URLs, numbers, decisions, and other critical details:\n{combined_text}"

    # Call the LLM asynchronously with the prepared prompt
    summary = await call_llm(prompt)

    return summary


class FunctionalAgent:
    def __init__(
        self,
        logger_main: Logger,
        logger_logs: Logger,
        name: str = "Agent",
        system_prompt: str = None,
        model: str = CHAT_MODEL,
        functions=None,
    ):
        self.registry = {}
        self.maximum_calls = MAXIMUM_CALLS_AGENT
        self.model = model
        self.name = name
        self.system_prompt = system_prompt or (
            f"You are a {name}. You can call any of the following functions."
        )
        self.logger_main = logger_main
        self.logger_logs = logger_logs
        self.buffer = []
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
        self.buffer = []

    def register(self, func):
        """Registers a function with parameter types and description."""
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

    def deregister(self, func_name):
        """Remove a function from the registry."""
        if func_name in self.registry:
            del self.registry[func_name]
        else:
            raise ValueError("Function not found in the registry")

    async def call_function(self, func_name, **kwargs):
        """Dynamically call a function from the registry."""
        if func_name in self.registry:
            func_info = self.registry[func_name]
            return await func_info["function"](**kwargs)
        else:
            raise ValueError(f"Function not found in the registry {func_name}")

    async def map_function_call(self, ai_output_raw1, funct_registry):

        prompt = dedent(f"""
                        You are tasked with: mapping the existing function to one of the registry functions available.
                        Here is the existing definition:
                                ----------------
                                {json.dumps(ai_output_raw1)}
                                ----------------
                        Map it to the appropriate function from the registry, that best fits the description:
                                ----------------
                                <functions registry>
                                {json.dumps(funct_registry)}
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

    def generate_functions_for_prompt(self):
        """Generates a JSON formatted string listing all functions and their metadata for the AI to process."""
        functions_list = [
            {                "name": name,
                "description": info["description"],
                "parameters": [
                    {param_name: param_type}
                    for param_name, param_type in info["params"].items()
                ],
            }
            for name, info in self.registry.items()
        ]
        return f"You can use the following functions and nothing else:\n{json.dumps(functions_list)}"

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

    async def run(self, input_string: str = "") -> str:
        """Process the input string, call LLM, parse output, and execute function until the final function is called."""
        current_input = input_string
        call_count = 0
        output = ""
        buffer_str = ""
        while True and call_count < self.maximum_calls:
            call_count += 1
            try:
                functions_definitions = self.generate_functions_for_prompt()
                if len(self.buffer) > 0:
                    while (
                        num_tokens_from_string("\n".join(self.buffer)) > CONTEXT_LIMIT
                    ):
                        summary = await summarize_with_intent(
                            self.buffer, output if len(output) > 0 else "shorten"
                        )
                        # self.buffer.pop(0)
                        self.buffer = [summary]
                    buffer_str = "\n".join(self.buffer)
                current_input = input_string
                prompt = f"""\
                {self.get_system_prompt()}
                ----------------
                You can call any of the following functions as tools:
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
                {current_input}
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
                #print(f"AI MODEL OUTPUT RAW:\n {ai_output_raw}")
                #map function calling
                ai_output = await self.map_function_call(ai_output_raw, functions_definitions)
                #ai_output = ai_output_raw
                #print(f"AI MODEL OUTPUT MAPPED:\n {ai_output_raw}")
                try:
                    json.loads(ai_output)
                except ValueError:
                    ai_output = remove_code_block_markers(ai_output)
                try:
                    function_output = json.loads(ai_output)  # TODO: Fix load
                except Exception as e:
                    print ("void json.loads")
                    self.buffer.append(f"Error occurred: {e}.")
                    continue
                #print ("FUNCTION OUTPUT: ", function_output)
                if "reasoning" in function_output:
                    pass
                    #self.logger_logs.info(f"{self.name} is thinking:\n {function_output.get('reasoning', None)}")
                if "name" in function_output:
                    # Check if the model has called a function
                    func_name = function_output.get("name", None)
                    output = function_output.get("output", "")
                    if func_name == "response":
                        return output
                    #print("FUNCTION OUTPUT: ", function_output)

                    self.buffer.append(output)
                    kwargs = function_output.get("parameters", {})
                    #self.logger_logs.info(f"{self.name} action: {func_name}: Params: {kwargs}")
                    function_response = await self.call_function(func_name, **kwargs)
                    #self.logger_main.info("")
                    self.buffer.append(f"<FUNCTION_RESULT>{func_name}: {str(function_response)}</FUNCTION_RESULT>")
                else:
                    self.buffer.append("Strictly follow the output format.")
            except Exception as e:
                print(f"Error: {e}")
                traceback.print_exc()
                #self.buffer.append(f"Error occurred: {e}.")
            #self.logger_main.info("")
        if len(output) == 0:
            print("No output generated.")
        try:
            current_input = input_string
            prompt = f"""\
                {self.get_system_prompt()}
                ----------------
                Take a deep break and think step by step.
                ----------------
                <Knowledge>
                {buffer_str}
                </Klowledge>
                ----------------
                <CurrentInputAndHistory> 
                {current_input}
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
            #print(f"Error: {e}")
            #traceback.print_exc()
            self.buffer.append(f"Error occurred: {e}.")
        return output

    async def call_llm(self, input_string):
        try:
            model = self.model
            response = await call_llm(input_string)
            return response
        except Exception as e:
            print(f"Error while calling LLM. {e}")
            print("input string: ", input_string)
            return '{}'

    async def response(self, message: str):
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
        logger_main: Logger,
        logger_logs: Logger,
        task: str = "",
        channel: str = "",
        entity: str = "",
        subject_entity: str = "",
        context: dict = {},
        data: CompanyData = CompanyData(),
        chat: dict = {"Agents": "Manager Enthan Pierce receiveing the task"}
    ):
        self.task = task
        self.is_finished = False
        self.entity = entity
        self.subject_entity = subject_entity
        self.context = context
        self.channel = channel
        self.buffer = []
        self.agents = {}
        self.result = {"Report":"No Result"}
        self.task_manager_name = ""
        self.data = data
        self.chat = chat
        self.logger_main = logger_main
        self.logger_logs = logger_logs

        taskManager = FunctionalAgent(
            name="Ethan Pierce (Product Manager)",
            logger_main=logger_main,
            logger_logs=logger_logs,
            system_prompt=prompts.Ethan,
            model=CHAT_MODEL,
            functions=[
                self.set_finished,
                self.update_report,
                self.get_report,
                store_inner_thought,
                self.data.read_company_data,
            ],
        )

        researcher = FunctionalAgent(
            name="Nora Caldwell (Researcher)",
            logger_main=logger_main,
            logger_logs=logger_logs,
            system_prompt=prompts.Nora,
            model=CHAT_MODEL,
            functions=[
                search_google,
                extract_text_from_url,
                store_inner_thought,
                self.data.update_company_name,
                self.data.update_founded,
                self.data.update_founder,
                self.data.add_address,
                self.data.update_key_individual,
                self.data.update_description,
                self.data.read_company_data,
                self.data.update_security_risk,
                self.data.add_financial_risk,
                self.data.update_operational_risk,
                self.data.add_key_relationships,
                self.data.update_risk_level,
                self.data.update_risk_level_int,
            ],
        )
        critic = FunctionalAgent(
            name="Julian Frost (Risk Analyst)",
            logger_main=logger_main,
            logger_logs=logger_logs,
            system_prompt=prompts.Julian,
            model=CHAT_MODEL,
            functions=[
                store_inner_thought,
                search_google,
                extract_text_from_url,
                self.data.read_company_data,
                self.data.update_security_risk,
                self.data.add_financial_risk,
                self.data.update_operational_risk,
                self.data.add_key_relationships,
                self.data.update_risk_level,
                self.data.update_risk_level_int,
            ],
        )

        document_manager = FunctionalAgent(
            name="Evelyn Fields (Documentation Specialist)",
            logger_main=logger_main,
            logger_logs=logger_logs,
            system_prompt=prompts.Evelin,
            model=CHAT_MODEL,
            functions=[
                store_inner_thought,
                search_google,
                extract_text_from_url,
                self.data.read_company_data,
                self.data.update_key_individual,
                self.data.update_security_risk,
                self.data.add_financial_risk,
                self.data.update_operational_risk,
                self.data.add_key_relationships,
                self.data.update_risk_level,
                self.data.update_company_name,
                self.data.update_founded,
                self.data.update_founder,
                self.data.add_address,
                self.data.update_description,
                self.data.update_summary,
                self.data.update_risk_level_int
            ],
        )

        self.agents.update(
            {
                taskManager.name: taskManager,
                researcher.name: researcher,
                critic.name: critic,
                document_manager.name: document_manager
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

    async def check_if_task_is_finished(self):
        """Check if the task is finished."""
        if self.is_finished:
            return "Task is finished."
        return "Task is not finished yet. Check with other colleagues and ask for more work if needed."

    async def explain_task_state_if_not_finished(self, str):
        """Explain the task state if it is not finished."""
        return str

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

        #self.logger_logs.info(self.task)
        #self.logger_main.info(self.result)
        for agent in self.agents.values():
            agent.clear_buffer()

        self.buffer = []
        #self.data = CompanyData() #Start every tast with empty data
        self.is_finished = False

        counter = MAXIMUM_CALLS_THREAD
        while not self.is_finished and counter > 0:
            counter -= 1
            for agent_name, agent in self.agents.items():
                if self.is_finished:
                    break
                buffer_str = await self.get_buffer_str()
                # Calculate the conversation part first
                conversation_part = f"\n\n<Conversation>\n{buffer_str}\n</Conversation>\n" if buffer_str else "\n"

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
                    print(f"{agent_name}: {agent_response}")
                    self.buffer.append(f"<MESSAGE>{agent_name}: {agent_response}</MESSAGE>")
                    self.logger_logs.info(f"{agent_name}: {agent_response}")
                    self.logger_main.info(self.result)
                    self.chat = f"{agent_name}: {agent_response}"

        buffer_str = await self.get_buffer_str()
        self.logger_main.info(self.result)
        conversation_part = f"\n\n<Conversation>\n{buffer_str}\n</Conversation>\n" if buffer_str else ""
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
        self.logger_main.info(self.result)
        #self.is_finished = True
        print ("Final report: ", self.result)
            
        return self.result

        final_report = await create_final_report(self.result)
        return self.data #result #final_report

if __name__ == "__main__":
    #asyncio.run(main())
    print("Thread started")