import os
from urllib.parse import quote

import aiohttp
from googlesearch import search

from ..services.llm.llm_client import LLMClient

llm_client = LLMClient()


def google_search(query: str) -> list[str]:
    links = search(query, num_results=10)
    final_links = list[str]()
    for link in links:
        assert isinstance(link, str), "Search result should be a string"
        final_links.append(link)
    return final_links


async def generate_webpage_summary(url: str) -> str:
    host = os.getenv("CRAWLER_URL")
    port = os.getenv("CRAWLER_PORT")

    crawler_url = f"http://{host}:{port}/scrape?url={quote(url, safe='')}"

    crawler_result = None
    async with aiohttp.ClientSession() as session:
        async with session.get(crawler_url) as response:
            if response.status != 200:
                raise Exception(f"Failed to fetch data from crawler: {response.status}")

            crawler_result = await response.json()

    assert crawler_result is not None
    assert "Data" in crawler_result
    return llm_client.generate(
        prompt=f"Provide a summary of the given text. Skip any greetings and focus only on the summary. Here is the text: {crawler_result['Data']}"
    )
