from dotenv import load_dotenv

load_dotenv()
import logging

import uvicorn
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from src.api.endpoints import router as api_router
from src.utils.misc import setup_logging

# Set up logging
setup_logging()
logger = logging.getLogger()  # Get root logger
logger.info("Starting application")
logger.info("Tested updated instance")

# Create FastAPI app
app = FastAPI(title="Procurement explorer API")
app.include_router(api_router)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

if __name__ == "__main__":
    print("Starting webserver...")
    uvicorn.run(app, host="0.0.0.0", port=8000, log_level="info", proxy_headers=True)
