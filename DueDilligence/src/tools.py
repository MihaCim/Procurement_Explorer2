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


async def google_search(query: str, pages: int) -> list[dict[str, str]]:
    search_results = search(query, advanced=True, num_results=pages)
    final_results = list[str]()
    for search_result in search_results:
        assert hasattr(search_result, "url")
        assert hasattr(search_result, "title")
        assert hasattr(search_result, "description")
        final_results.append(
            {
                "url": search_result.url,
                "title": search_result.title,
                "description": search_result.description,
            }
        )

    return final_results


async def scrape_webpage(url: str) -> dict[str, str]:
    host = os.getenv("CRAWLER_URL")
    port = os.getenv("CRAWLER_PORT")

    crawler_url = f"http://{host}:{port}/scrape?url={quote(url, safe='')}"

    async with aiohttp.ClientSession() as session:
        async with session.get(crawler_url) as response:
            if response.status != 200:
                raise Exception(f"Failed to fetch data from crawler: {response.status}")

            return await response.json()
