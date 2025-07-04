import logging
import sys, json
from typing import Protocol, Any
from data_models import DueDiligenceResult
from datetime import datetime

LOGGING_LEVEL = logging.INFO

logger = logging.getLogger(__name__)
logger.setLevel(LOGGING_LEVEL)

handler = logging.StreamHandler(sys.stdout)
handler.setLevel(LOGGING_LEVEL)
formatter = logging.Formatter(
    "%(asctime)s - %(name)s - %(levelname)s - %(funcName)s - %(lineno)s - %(message)s"
)
handler.setFormatter(formatter)
logger.addHandler(handler)


class Logger(Protocol):
    def update_profile(self, message: str) -> None: ...

    def error(self, message: str) -> None: ...

    def add_log(self, log: str) -> None: ...


class BasicLogger:
    def info(self, message: str) -> None:
        logger.info(message)

    def error(self, message: str) -> None:
        logger.error(message)

    def add_log(self, log: str) -> None:
        pass


class DDLogger:
    def __init__(self, company_name: str, max_log_len: int, RedisStore) -> None:
        self.max_log_len = max_log_len
        self.company_name = company_name
        self.key = f"generate_profile:{company_name}"
        self.redis = RedisStore

    def _get_cache(self) -> DueDiligenceResult:
        json_data = self.redis.get_json(self.key)
        if json_data:
            return DueDiligenceResult.model_validate(json_data)
        return DueDiligenceResult()

    def _set_cache(self, dd_result: DueDiligenceResult) -> None:
        dd_result.last_updated = datetime.now()
        #self.redis_client.set(self.key, json.dumps(dd_result.model_dump_json()))
        self.redis.set_json(self.key, json.dumps(dd_result.model_dump_json()))
    
    def update_profile(self, message: str) -> None:
        try:
            json_data = json.loads(message)
        except Exception:
            return

        dd_result = self._get_cache()
        dd_result.profile = {**dd_result.profile, **json_data}
        dd_result.profile["status"] = "running"
        self._set_cache(dd_result)

    def add_log(self, log: dict[str, str]) -> None:
        dd_result = self._get_cache()
        log_data = dict[str, Any]({"log": log, "timestamp": datetime.now()})
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
