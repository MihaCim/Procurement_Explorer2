import os
from urllib.parse import quote
from models.models import DueDiligenceProfile
import aiohttp

dd_host = os.getenv("DD_URL")
dd_port = os.getenv("DD_PORT")
base_url = f"http://{dd_host}:{dd_port}"


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


async def get_dd_profile_from_cache(company_url: str) -> dict[str, str]:
    url = f"{base_url}/profile?company_name={quote(company_url, safe='')}"

    async with aiohttp.ClientSession() as session:
        async with session.get(url) as response:
            if response.status != 200:
                return {
                    "status": "failed",
                    "msg": f"failed to get DueDiligence for {company_url}",
                }
            return await response.json()


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
