import os
import sys
import json
from datetime import datetime
import asyncio
from typing import Any
from data_models import DueDiligenceCompanyProfile, DueDiligenceResult
from data_models import map_company_data_to_profile
from dotenv import load_dotenv
import uvicorn
from company_data import CompanyData
from fastapi import FastAPI, HTTPException
from prompts.prompts2 import Prompts
from redisStore import RedisStore
from thread import TaskThread
from logger import DDLogger
from concurrent.futures import ThreadPoolExecutor

load_dotenv()
parent_dir = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
sys.path.append(parent_dir)
MAXIMUM_CALLS_THREAD = int(os.getenv("MAX_CONCURRENT_JOBS", 10))

app = FastAPI()
prompts = Prompts()
redis = RedisStore()
executor = ThreadPoolExecutor(max_workers=MAXIMUM_CALLS_THREAD)


def run_dd_process_sync_wrapper(company_name: str):
    """A synchronous wrapper that runs the async run_dd_process."""
    asyncio.run(run_dd_process(company_name))


async def run_dd_process(company_name: str) -> None:
    system_prompt = prompts.get_system_prompt(company_name)
    key = f"generate_profile:{company_name}"
    dd_result = DueDiligenceResult(
        profile={"metadata": {"task": system_prompt}},
        url=company_name,
        started=datetime.now(),
        last_updated=datetime.now(),
    )

    redis.set_json(key, dd_result.model_dump_json())
    logger = DDLogger(company_name=company_name, max_log_len=10, RedisStore=redis)
    logger.add_log(
        '{"agent name":"system","agent response": "Started generating new profile"}'
    )

    taskThread = TaskThread(
        task=system_prompt,
        company_data=CompanyData(),
        logger=logger,
    )
    await taskThread.run()

    json_data = redis.get_json(key)
    dd_result = DueDiligenceResult.model_validate(json_data)
    dd_result.profile["status"] = "generated"
    dd_result.last_updated = datetime.now()
    redis.set_json(key, dd_result.model_dump_json())


@app.delete("/redis")
async def flush_redis() -> dict[str, str]:
    redis.flush_db()
    return {"status": "ok"}


@app.get("/redis{company_name}")
async def read_redis(company_name:str) -> dict[str, str] | None:
    key = f"generate_profile:{company_name}"
    return json.dump(redis.get_json(key))


@app.delete("/profile")
async def delete_profile(
    company_name: str | None,
) -> None:
    key = f"generate_profile:{company_name}"
    redis.delete_json(key)


@app.get("/profile")
async def get_profile(
    company_name: str | None,
) -> DueDiligenceCompanyProfile | None:
    if company_name is None or company_name == "":
        raise HTTPException(
            status_code=400, detail="company_name should be a non-empty string"
        )

    key = f"generate_profile:{company_name}"
    json_data = redis.get_json(key)
    if not json_data:
        print("REQUEST QUERY: ", key)
        raise HTTPException(
            status_code=404, detail=f"cache for {company_name} does not exists"
        )
    dd_result = DueDiligenceResult.model_validate(json_data)
    return map_company_data_to_profile(dd_result)


@app.post("/profile")
async def generate_profile(company_name: str | None) -> dict[str, str]:
    if company_name is None or company_name == "":
        raise HTTPException(
            status_code=400, detail="company_name should be a non-empty string"
        )

    key = f"generate_profile:{company_name}"
    redis_client = redis.get_client()
    if not redis_client.exists(key):
        # Create an initial record with "queued" status and save to Redis
        queued_result = DueDiligenceResult(
            profile={"status": "queued", "metadata": {"task": "Profile generation queued"}},
            url=company_name,
            started=datetime.now(),
            last_updated=datetime.now(),
        )
        redis.set_json(key, queued_result.model_dump_json())

        # Submit the job to the thread pool
        loop = asyncio.get_running_loop()
        loop.run_in_executor(executor, run_dd_process_sync_wrapper, company_name)
        
        return {
            "status": "ok",
            "msg": f"started DueDiligence process for {company_name}",
        }
    else:
        return {
            "status": "ok",
            "msg": f"DueDiligence process for {company_name} has already been started"
        }


if __name__ == "__main__":
    uvicorn.run(app, host="0.0.0.0", port=8501)