import os
from urllib.parse import quote

import aiohttp
from googlesearch import search
from llm_client import LLMClient

llm_client = LLMClient()


async def summarize_text(text: str) -> str:
    return await llm_client.generate_gemini_response(
        prompt=f"Provide a summary of the given text. Skip any greetings and focus only on the summary. Here is the text: {text}"
    )


def google_search(query: str, pages: int) -> list[str]:
    links = search(query, num_results=pages)
    final_links = list[str]()
    for link in links:
        assert isinstance(link, str), "Search result should be a string"
        final_links.append(link)
    return final_links


async def scrape_webpage(url: str) -> dict[str, str]:
    host = os.getenv("CRAWLER_URL")
    port = os.getenv("CRAWLER_PORT")

    crawler_url = f"http://{host}:{port}/scrape?url={quote(url, safe='')}"

    async with aiohttp.ClientSession() as session:
        async with session.get(crawler_url) as response:
            if response.status != 200:
                raise Exception(f"Failed to fetch data from crawler: {response.status}")

            return await response.json()
