import logging
import sys
from typing import Protocol

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
    def info(self, message: str) -> None: ...

    def error(self, message: str) -> None: ...

    def add_log(self, log: str) -> None: ...


class BasicLogger:
    def info(self, message: str) -> None:
        logger.info(message)

    def error(self, message: str) -> None:
        logger.error(message)

    def add_log(self, log: str) -> None:
        pass
