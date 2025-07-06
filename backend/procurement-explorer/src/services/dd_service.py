import os
from urllib.parse import quote
from ..models.models import DueDiligenceProfile
import aiohttp
from typing import Union
import logging

dd_host = os.getenv("DD_URL")
dd_port = os.getenv("DD_PORT")
base_url = f"http://{dd_host}:{dd_port}"
logger = logging.getLogger(__name__)


async def start_dd_process(company_url: str) -> dict[str, str]:
    url = f"{base_url}/profile?company_name={quote(company_url, safe='')}"

    async with aiohttp.ClientSession() as session:
        async with session.post(url) as response:
            if response.status != 200:
                return {
                    "status": "failed",
                    "msg": f"failed to start DueDiligence for {company_url}",
                }
            return await response.json()


async def get_dd_profile_from_cache(company_url: str) -> Union['DueDiligenceProfile', dict[str, str]]:
    url = f"{base_url}/profile?company_name={quote(company_url, safe='')}"

    try:
        async with aiohttp.ClientSession() as session:
            async with session.get(url, timeout=10) as response:
                logger.info(f"API call for {company_url}: Received response status {response.status}")

                if response.status != 200:
                    error_detail = await response.text()
                    # Log an error if the API returns a non-200 status
                    logger.error(f"Due Diligence API returned non-200 status for {company_url}: {response.status}, Details: {error_detail}")
                    return {
                        "status": "failed",
                        "msg": f"failed to get DueDiligence for {company_url} from cache. Status: {response.status}",
                        "detail": error_detail
                    }
                data = await response.json()
                logger.info(f"Successfully retrieved DueDiligenceProfile for {company_url}")
                return DueDiligenceProfile(**data)
    except aiohttp.ClientConnectorError as e:
        # Log the connection error with traceback
        logger.error(f"Could not connect to the Due Diligence API: {e}", exc_info=True)
        return {
            "status": "failed",
            "msg": f"Failed to connect to DueDiligence cache API",
            "error_detail": str(e)
        }
    except aiohttp.ClientError as e:
        # Log other aiohttp client errors with traceback
        logger.error(f"An aiohttp client error occurred in due diligence API call: {e}", exc_info=True)
        return {
            "status": "failed",
            "msg": f"An unexpected http client error occurred while calling DueDiligence API",
            "error_detail": str(e)
        }
    except Exception as e:
        # Log any other unexpected errors, automatically including traceback
        logger.exception(f"An unexpected error occurred for {company_url}: {e}")
        return {
            "status": "failed",
            "msg": f"An unexpected error occurred while processing DueDiligence API request for {company_url}.",
            "error_detail": str(e)
        }


async def delete_dd_profile_from_cache(company_url: str) -> dict[str, str]:
    url = f"{base_url}/profile?company_name={quote(company_url, safe='')}"

    async with aiohttp.ClientSession() as session:
        async with session.delete(url) as response:
            if response.status != 200:
                return {
                    "status": "failed",
                    "msg": f"failed to delete DueDiligence for {company_url} from cache",
                }
            return await response.json()
