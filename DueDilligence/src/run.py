import json
import os
import sys
from datetime import datetime
from typing import Any

import uvicorn
from cache import AsyncInFlightCache
from company_data import CompanyData
from fastapi import BackgroundTasks, FastAPI, HTTPException
from prompts.prompts2 import Prompts
from pydantic import BaseModel
from redis_connector import get_redis_client
from thread import TaskThread

parent_dir = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
sys.path.append(parent_dir)

app = FastAPI()
prompts = Prompts()
redis_client = get_redis_client()


def get_json_data_from_key(key: str) -> Any | None:
    if redis_client.exists(key):
        data = redis_client.get(key)
        data = json.loads(data)
        if isinstance(data, str):
            data = json.loads(data)
        return data


class DueDiligenceResult(BaseModel):
    logs: list[dict[str, str | datetime]] = list()
    profile: dict[str, Any] = dict()
    errors: list[str] = list()
    started: datetime = datetime.now()
    last_updated: datetime = datetime.now()


class DDLogger:
    def __init__(self, company_name: str, max_log_len: int) -> None:
        self.max_log_len = max_log_len
        self.company_name = company_name
        self.key = f"generate_profile:{company_name}"

    def _get_cache(self) -> DueDiligenceResult:
        if redis_client.exists(self.key):
            json_data = get_json_data_from_key(self.key)
            return DueDiligenceResult.model_validate(json_data)

        return DueDiligenceResult()

    def _set_cache(self, dd_result: DueDiligenceResult) -> None:
        dd_result.last_updated = datetime.now()
        redis_client.set(self.key, json.dumps(dd_result.model_dump_json()))

    def info(self, message: str) -> None:
        try:
            json_data = json.loads(message)
        except Exception:
            return

        dd_result = self._get_cache()
        dd_result.profile = {**dd_result.profile, **json_data}
        dd_result.profile["status"] = "running"
        self._set_cache(dd_result)

    def add_log(self, log: str) -> None:
        dd_result = self._get_cache()
        log_data = dict[str, str | datetime]({"log": log, "timestamp": datetime.now()})
        dd_result.logs.append(log_data)
        if len(dd_result.logs) > self.max_log_len:
            dd_result.logs.pop(0)
        dd_result.profile["status"] = "running"
        self._set_cache(dd_result)

    def error(self, message: str) -> None:
        dd_result = self._get_cache()
        dd_result.errors.append(message)
        dd_result.profile["status"] = "running"
        self._set_cache(dd_result)


cache = AsyncInFlightCache()


async def run_dd_process(company_name: str) -> None:
    system_prompt = prompts.get_system_prompt(company_name)
    key = f"generate_profile:{company_name}"
    dd_result = DueDiligenceResult(profile={"metadata": {"task": system_prompt}})
    redis_client.set(key, json.dumps(dd_result.model_dump_json()))

    company_data = CompanyData()
    logger = DDLogger(company_name=company_name, max_log_len=10)

    logger.add_log("Started DueDiligence")

    taskThread = TaskThread(
        task=system_prompt,
        company_data=company_data,
        logger=logger,
    )
    await taskThread.run()

    json_data = get_json_data_from_key(key)
    dd_result = DueDiligenceResult.model_validate(json_data)
    dd_result.profile["status"] = "finished"
    dd_result.last_updated = datetime.now()
    redis_client.set(key, json.dumps(dd_result.model_dump_json()))


@app.delete("/flush_redis")
async def flush_redis() -> dict[str, str]:
    redis_client.flushdb()
    return {"status": "ok"}


@app.delete("/profile")
async def delete_profile(
    company_name: str | None,
) -> None:
    key = f"generate_profile:{company_name}"
    if not redis_client.exists(key):
        raise HTTPException(status_code=404, detail=f"{key} not found in cache")
    redis_client.delete(key)


@app.get("/profile")
async def get_profile(
    company_name: str | None,
) -> DueDiligenceResult:
    if company_name is None or company_name == "":
        raise HTTPException(
            status_code=400, detail="company_name should be a non-empty string"
        )

    key = f"generate_profile:{company_name}"
    if redis_client.exists(key):
        data = redis_client.get(key)
        if not data:
            raise HTTPException(status_code=500, detail="empty result for cache")

        json_data = get_json_data_from_key(key)

        dd_result = DueDiligenceResult.model_validate(json_data)
        return dd_result

    raise HTTPException(
        status_code=404, detail=f"cache for {company_name} does not exists"
    )


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
