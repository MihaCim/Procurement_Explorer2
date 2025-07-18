import os

from cache import AsyncInFlightCache
from logger import logger
from tools import google_search, scrape_webpage, summarize_text

# Load environment variables from .env file


# Get the API key from environment variables
APIFY_API_KEY = os.getenv("APIFY_API_KEY")
maxCrawlPages = os.getenv("MAXCRAWLPAGES")
maxCrawlDepth = os.getenv("MAXCRAWLDEPTH")


cache = AsyncInFlightCache()


def get_run_input(url: str) -> dict:
    print("paramd: ", maxCrawlPages, maxCrawlDepth)
    return {
        "aggressivePrune": False,
        "clickElementsCssSelector": '[aria-expanded="false"]',
        "clientSideMinChangePercentage": 15,
        "crawlerType": "playwright:adaptive",
        "debugLog": False,
        "debugMode": False,
        "ignoreCanonicalUrl": False,
        "maxSessionRotations": 3,  # This is depth of the crawler
        "proxyConfiguration": {"useApifyProxy": True},
        "readableTextCharThreshold": 100,
        "removeCookieWarnings": True,
        "removeElementsCssSelector": 'nav, footer, script, style, noscript, svg,\n[role="alert"],\n[role="banner"],\n[role="dialog"],\n[role="alertdialog"],\n[role="region"][aria-label*="skip" i],\n[aria-modal="true"]',
        "renderingTypeDetectionPercentage": 10,
        "maxCrawlDepth": 6,
        "maxCrawlPages": 15,
        "saveFiles": False,
        "saveHtml": False,
        "saveMarkdown": True,
        "saveScreenshots": False,
        "startUrls": [{"url": url}],
        "useSitemaps": False,
    }


# async def extract_text_from_url(url: str) -> str:
#     """
#     - Extract text content from a given URL using a content crawler and return it in markdown format.
#     - Call this function only with a valid url input.

#     Parameters:
#         url (str): A valid URL from which to extract text content.

#     Returns:
#         str: The extracted text content in markdown format.

#     """

#     apify_client_async = ApifyClientAsync(APIFY_API_KEY)
#     actor = apify_client_async.actor("apify/website-content-crawler")
#     run_input = get_run_input(url)
#     call_result = await actor.call(run_input=run_input, wait_secs=480)

#     # Assuming your dictionary is named 'data'
#     if "finishedAt" in call_result and call_result["finishedAt"]:
#         logger.info(f"Reading {url} process has finished.")
#     else:
#         logger.info(f"Reading {url} process is still running.")
#     # print(results)
#     if "defaultDatasetId" not in call_result:
#         return f"Reading {url} process failed or taking too long."
#     dataset_id = call_result["defaultDatasetId"]
#     dataset = apify_client_async.dataset(dataset_id)
#     output = ""
#     async for item in dataset.iterate_items():
#         if "markdown" in item:
#             output += item["markdown"]

#     logger.info("************************************ ")
#     logger.info("OUTPUT FROM APIFY CRAWLER: ")
#     logger.info(output)
#     logger.info("************************************ ")
#     return output


def get_search_input(query: str) -> dict:
    return {
        "queries": query,
        "resultsPerPage": 10,
        "maxPagesPerQuery": 1,
        "languageCode": "en",
        "mobileResults": False,
        "includeUnfilteredResults": False,
        "saveHtml": False,
        "saveHtmlToKeyValueStore": False,
    }


def analyze_search_data_markdown(data):
    # Extract main details
    request_info = data.get("#debug", {})
    search_query = data.get("searchQuery", {})
    results = data.get("organicResults", [])
    related_queries = data.get("relatedQueries", [])
    people_also_ask = data.get("peopleAlsoAsk", [])
    error_status = data.get("#error", False)

    # Start building the Markdown report
    markdown_output = "### Search Report\n\n"
    markdown_output += "**Request Details:**\n"
    # markdown_output += f"- Request ID: {request_info.get('requestId', 'N/A')}\n"
    markdown_output += f"- Search Term: {search_query.get('term', 'N/A')}\n"
    markdown_output += f"- Search URL: [{search_query.get('url', 'N/A')}]({search_query.get('url', 'N/A')})\n"
    # markdown_output += f"- Total Results: {data.get('resultsTotal', 'N/A')}\n"
    # markdown_output += f"- Has Next Page: {'Yes' if data.get('hasNextPage', False) else 'No'}\n"
    markdown_output += f"- Error Status: {'Yes' if error_status else 'No'}\n\n"

    # Results section
    markdown_output += "**Search Results:**\n"
    for res in results:
        title = res.get("title", "N/A")
        url = res.get("url", "N/A")
        description = res.get("description", "No description provided.")
        keywords = ", ".join(res.get("emphasizedKeywords", []))
        markdown_output += f"- **Title**: [{title}]({url})\n"
        markdown_output += f"  - **Description**: {description}\n"
        markdown_output += (
            f"  - **Emphasized Keywords**: {keywords if keywords else 'None'}\n"
        )

    # Related queries section
    if related_queries:
        markdown_output += "\n**Related Queries:**\n"
        for rq in related_queries:
            markdown_output += f"- {rq.get('title', 'N/A')}\n"

    # People Also Ask section
    if people_also_ask:
        markdown_output += "\n**People Also Ask:**\n"
        for item in people_also_ask:
            question = item.get("question", "N/A")
            answer = item.get("answer", "No answer provided.")
            markdown_output += f"- **Question**: {question}\n"
            markdown_output += f"  - **Answer**: {answer}\n"

    return markdown_output


# async def search_google(query: str) -> str:
#     """
#     Extract search results with given query using Google Search and return it in markdown format.

#     Parameters:
#         query (str): Search Query for Google.

#     Returns:
#         str: The extracted search results in markdown format.

#     """

#     apify_client_async = ApifyClientAsync(APIFY_API_KEY)
#     actor = apify_client_async.actor("apify/google-search-scraper")
#     run_input = get_search_input(query)
#     call_result = await actor.call(run_input=run_input, wait_secs=480)

#     # Assuming your dictionary is named 'data'
#     if "finishedAt" in call_result and call_result["finishedAt"]:
#         logger.info(f'Searching "{query}" process has finished.')
#     else:
#         logger.info(f'Searching "{query}"  process is still running.')
#     # print(results)
#     if "defaultDatasetId" not in call_result:
#         return f'Searching "{query}"  process failed or taking too long.'

#     dataset_id = call_result["defaultDatasetId"]
#     dataset = apify_client_async.dataset(dataset_id)
#     output = ""
#     print("Reading items...")
#     async for item in dataset.iterate_items():
#         output += analyze_search_data_markdown(item)
#     if not output or len(output) == 0:
#         print(f'No search results found for "{query}".')
#         return f'No search results found for "{query}".'

#     logger.info("************************************ ")
#     logger.info("OUTPUT FROM APIFY CRAWLER: ")
#     print(output)
#     logger.info("************************************ ")
#     return output


cache = AsyncInFlightCache()


async def extract_text_from_url(url: str) -> str:
    """
    - Extract text content from a given URL using a content crawler and return it in text format.
    - Call this function only with a valid url input. make sure the url is in fully qualified domain format, such as: https://www.google.com/ 

    Parameters:
        url (str): A valid URL from which to extract text content. Make sure the url is in fully qualified format, like: https://www.google.com/
    Returns:
        str: The extracted text content in markdown format.
    Raises:
        Returns a string describing the error if the request fails.

    """

    try:

        async def compute():
            crawler_result = await scrape_webpage(url)
            assert "Data" in crawler_result
            return await summarize_text(crawler_result["Data"])

        return await cache.get_or_wait(f"url:{url}", compute)

    except Exception as e:
        logger.error(f"Error using extract_text_from_url: {e}")
        return f"{e}"


async def search_google(query: str) -> list[dict[str, str]]:
    """
    Extract search results with given query using Google Search and return it in markdown format.

    Parameters:
        query (str): Search Query for Google.

    Returns:
        list[dict[str, str]]: List of dicts, where each dict contains 'url', 'title' and 'description'. Each dict is a result of the Google query.

    """

    pages = 10
    try:

        async def compute() -> list[dict[str, str]]:
            return await google_search(query, pages)

        return await cache.get_or_wait(f"search:{query}", compute)

    except Exception as e:
        logger.error(f"Error using search_google: {e}")
        return [{"url": f"{e}", "title": f"{e}", "description": f"{e}"}]
