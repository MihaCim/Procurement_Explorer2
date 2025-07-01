import os
import json, requests
import aiohttp
from google import genai
from dotenv import load_dotenv
from openai import AsyncOpenAI

load_dotenv()
GEMINI_API_KEY = os.getenv("GEMINI_API_KEY")
OPENAI_API_KEY = os.getenv("OPENAI_API_KEY")
AZURE_API_KEY = os.getenv("OPENAI_API_KEY")


class LLMClient: 
    def __init__(self):
        self.model_endpoint = "http://10.123.123.1:11434/api/generate"
        self.temperature = 0
        self.system_prompt = ""
        self.headers = {"Content-Type": "application/json"}
        self.stop_token = None
        self.client_gemini = genai.Client(api_key=GEMINI_API_KEY)
        self.client_openai = AsyncOpenAI(api_key=OPENAI_API_KEY, timeout=300.0)
        self.client_openai = AsyncOpenAI(api_key=AZURE_API_KEY, timeout=300.0)


    async def generate_gemini_response(self, prompt: str) -> str:
    
        response = self.client_gemini.models.generate_content(
                model="gemini-2.0-flash",
                contents=prompt,
            )
        return response.text

    async def generate_openai_response(
        self,
        prompt: str,
        temperature: float = 1.0,   
        ) -> str:

        try:
            response = await self.client_openai.chat.completions.create(
                model="gpt-4o",
                messages=[{"role": "system", "content": prompt}],
                stream=False,     
            )
            return response.choices[0].message.content

        except Exception as e:
            print(f"Error in OpenAI call: {e}")   


    async def generate_azure_response(self, prompt: str, temperature: float = 1.0):
        """Sends a request to Azure OpenAI GPT-4o and returns the response."""
        
        headers = {
            "Content-Type": "application/json",
            "api-key": self.azure_key
        }

        payload = {
            "messages": [{"role": "system", "content": prompt}],
            "temperature": temperature,
            "max_tokens": 5000
        }

        try:
            async with aiohttp.ClientSession() as session:
                async with session.post(self.azure_url, headers=headers, json=payload) as response:
                    
                    response_json = await response.json()
                    return response_json["choices"][0]["message"]["content"]

        except Exception as e:
            return f"Error: {str(e)}"
        