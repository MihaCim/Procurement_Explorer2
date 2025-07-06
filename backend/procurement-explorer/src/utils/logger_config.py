import logging
import os
from logging.handlers import RotatingFileHandler



def setup_logging():

    if logging.getLogger().handlers:
        return
    
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
