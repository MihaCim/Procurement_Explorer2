import json
import os
import sys
from datetime import datetime
from typing import Any
from data_models import DueDiligenceCompanyProfile, DueDiligenceResult
from data_models import map_company_data_to_profile
import uvicorn
from cache import AsyncInFlightCache
from company_data import CompanyData
from fastapi import BackgroundTasks, FastAPI, HTTPException
from prompts.prompts2 import Prompts
from pydantic import BaseModel
from redis_connector import RedisStore
from thread import TaskThread
from logger import DDLogger

parent_dir = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
sys.path.append(parent_dir)

app = FastAPI()
prompts = Prompts()
redis = RedisStore()
#redis_client = get_redis_client()

#cache = AsyncInFlightCache()


async def run_dd_process(company_name: str) -> None:
    system_prompt = prompts.get_system_prompt(company_name)
    key = f"generate_profile:{company_name}"
    dd_result = DueDiligenceResult(
        profile={"metadata": {"task": system_prompt}},
        url = company_name,
        started=datetime.now(),
        last_updated=datetime.now(),
        )
    redis.set_json(key, dd_result.model_dump_json())
    #redis_client.set(key, json.dumps(dd_result.model_dump_json()))

    logger = DDLogger(company_name=company_name, max_log_len=10, RedisStore=redis)
    logger.add_log("Started new DueDiligence Profile")

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
    #redis_client.set(key, json.dumps(dd_result.model_dump_json()))
    redis.set_json(key, dd_result.model_dump_json())

@app.delete("/flush_redis")
async def flush_redis() -> dict[str, str]:
    redis.flush_db()
    return {"status": "ok"}


@app.delete("/profile")
async def delete_profile(
    company_name: str | None,
) -> None:
    key = f"generate_profile:{company_name}"
    # redis_client = redis.get_client()
    # if not redis_client.exists(key):
    #     raise HTTPException(status_code=404, detail=f"{key} not found in cache")
    # redis_client.delete(key)
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
    #redis_client = redis.get_client()
    #if redis_client.exists(key):
    #    data = redis_client.get(key)
    json_data = redis.get_json(key)
    if not json_data:
        raise HTTPException(status_code=404, detail=f"cache for {company_name} does not exists")
    print("**************************************")
    print ("cashed data json: ", json_data)
    dd_result = DueDiligenceResult.model_validate(json_data)
    return map_company_data_to_profile (dd_result)


@app.post("/profile")
async def generate_profile(
    company_name: str | None,
    background_tasks: BackgroundTasks,
) -> dict[str, str]:
    if company_name is None or company_name == "":
        raise HTTPException(
            status_code=400, detail="company_name should be a non-empty string"
        )

    key = f"generate_profile:{company_name}"
    redis_client = redis.get_client()
    if not redis_client.exists(key):
        background_tasks.add_task(run_dd_process, company_name)
        return {
            "status": "ok",
            "msg": f"started DueDiligence process for {company_name}",
        }
    else:
        return {
            "status": "ok",
            "msg": f"DueDiligence process for {company_name} has already been started",
        }


if __name__ == "__main__":
    uvicorn.run(app, host="0.0.0.0", port=8501, workers=4)
