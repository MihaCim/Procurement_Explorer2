import os
from langchain_community.llms.ollama import Ollama
from langchain_openai import OpenAI
OPENAI_API_KEY = os.getenv("OPENAI_API_KEY")

class LLMClient:
    def __init__(self):
        self.llm_type = os.getenv("LLM_TYPE", "ollama")  # Use Ollama as default
        
        if self.llm_type == "openai":
            if not OPENAI_API_KEY:
                raise ValueError("OPENAI_API_KEY environment variable is not set.")
            self.llm = OpenAI(
                model_name=os.getenv("OPENAI_MODEL", "gpt-3.5-turbo-instruct"),
                api_key=os.getenv("OPENAI_API_KEY")
            )
        else:
            ollama_url = os.getenv("OLLAMA_URL", "http://localhost")
            ollama_port = os.getenv("OLLAMA_PORT", "11434")
            self.llm = Ollama(
                model=os.getenv("LLM_MODEL", "mistral:latest"),
                temperature=0,
                top_k=30,
                top_p=0.1,
                num_ctx=2048,
                base_url=f"http://{ollama_url}:{ollama_port}"
            )

    def generate(self, prompt: str) -> str:
        return self.llm(prompt)


