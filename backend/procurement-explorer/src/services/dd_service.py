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
                logger.info(f"Failed Due Diligence API call for {company_url}")

                if response.status != 200:
                    #error_detail = await response.text()
                    #logger.error(f"Due Diligence API returned non-200 status for {company_url}: {response.status}, Details: {error_detail}")
                    return None
                
                #return the existing profile 
                data = await response.json()
                logger.info(f"Successfully retrieved DueDiligenceProfile for {company_url}")
                return DueDiligenceProfile(**data)
    
    except aiohttp.ClientConnectorError as e:
        logger.error(f"Could not connect to the Due Diligence API", exc_info=True)
        return None

    except aiohttp.ClientError as e:
        logger.error(f"An aiohttp client error occurred in due diligence API call", exc_info=True)
        return None
    
    except Exception as e:
        logger.exception(f"An unexpected error occurred calling DD API.")
        return None


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
