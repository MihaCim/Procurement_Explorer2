import logging
import os
import signal
from logging.handlers import RotatingFileHandler


class TimeoutException(Exception):
    def __init__(self, message=None):
        if message is None:
            message = "Function execution has timed out"
        super().__init__(message)


# Timeout handler
def timeout_handler(signum, frame):
    raise TimeoutException("The function has timed out and will be terminated")


# Function decorator to add timeout
def timeout(seconds):
    def decorator(func):
        def wrapper(*args, **kwargs):
            signal.signal(signal.SIGALRM, timeout_handler)
            signal.alarm(seconds)
            try:
                result = func(*args, **kwargs)
            finally:
                signal.alarm(0)
            return result

        return wrapper

    return decorator


def setup_logging():
    # Get the absolute path of the directory where this script is located
    script_dir = os.path.abspath(os.path.dirname(__file__))
    base_dir = os.path.dirname(os.path.dirname(script_dir))
    log_directory = os.path.join(base_dir, "logs")
    if not os.path.exists(log_directory):
        os.makedirs(log_directory)

    # log_file_path = os.path.join(log_directory, "app.log")
    # file_handler = RotatingFileHandler(log_file_path, maxBytes=10485760, backupCount=10)
    # file_handler.setLevel(logging.INFO)
    formatter = logging.Formatter(
        "%(asctime)s - %(name)s - %(levelname)s - %(message)s"
    )
    # file_handler.setFormatter(formatter)

    root_logger = logging.getLogger()
    root_logger.setLevel(logging.INFO)
    #root_logger.addHandler(file_handler)

    console_handler = logging.StreamHandler()
    console_handler.setFormatter(formatter)
    root_logger.addHandler(console_handler)
