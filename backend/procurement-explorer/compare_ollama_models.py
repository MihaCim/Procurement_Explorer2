import json
import os
import time
from shutil import rmtree
from typing import Any

import psycopg2
from langchain.prompts import PromptTemplate
from psycopg2.extensions import connection as PGConnecton
from psycopg2.extensions import cursor as PGCursor
from src.services.llm.llm_client import LLMClient
from src.utils.prompt_templates import COMPANY_PROFILE_TEMPLATE

MODELS = [
    "gemma3:1b",
    "gemma3:4b",
    # "qwen3:4b",
    # "mistral:latest",
]

DB_URL = "localhost"
DB_NAME = "explorer"
DB_PORT = 5435
DB_USER = "uporabnik11"
DB_PASSWORD = "oJy5VNA9Qu"

CHUNK_SIZE = 1000


def get_connection() -> PGConnecton:
    return psycopg2.connect(
        dbname=DB_NAME,
        user=DB_USER,
        password=DB_PASSWORD,
        host=DB_URL,
        port=DB_PORT,
    )


def fetch_companies(conn: PGConnecton) -> list[tuple[Any, ...]]:
    cursor: PGCursor | None = None
    try:
        cursor = conn.cursor()

        # Execute a simple query
        cursor.execute("SELECT * FROM companies;")

        # Fetch all results
        results = cursor.fetchall()

        # Convert to a list of tuples
        return results

    except Exception as e:
        print("Error:", e)
        return []

    finally:
        if cursor:
            cursor.close()


def fetch_raw_data(conn: PGConnecton) -> list[tuple[Any, ...]]:
    cursor: PGCursor | None = None
    try:
        cursor = conn.cursor()

        # Execute a simple query
        cursor.execute("SELECT * FROM raw_data;")

        # Fetch all results
        results = cursor.fetchall()

        # Convert to a list of tuples
        return results

    except Exception as e:
        print("Error:", e)
        return []

    finally:
        if cursor:
            cursor.close()


def set_model(model: str) -> None:
    os.environ["LLM_TYPE"] = "ollama"
    os.environ["LLM_MODEL"] = model
    os.environ["OLLAMA_URL"] = "localhost"
    os.environ["OLLAMA_PORT"] = "11435"


def get_name(c: list[Any]) -> str:
    url = c[2]
    assert isinstance(url, str)
    return url.split("//")[-1].split("/")[0][4:]


def model_inference(model: str, companies: list[list[Any]]) -> None:
    folder = model
    if os.path.exists(folder):
        rmtree(folder)
    os.makedirs(folder)

    set_model(model)
    llm_client = LLMClient()
    response = llm_client.generate("Hello, how are you?")

    prompt = PromptTemplate.from_template(template=COMPANY_PROFILE_TEMPLATE)

    for company in companies:
        fn = f"{folder}/{get_name(company)}.txt"
        prompt_value = prompt.format(website_text=company[-1][:CHUNK_SIZE])
        print(f"started: {fn=}")
        start = time.monotonic()
        response = llm_client.generate(prompt_value)
        end = time.monotonic()
        total_time = end - start
        print(f"finished: {fn=} in {total_time=}")

        with open(fn, "w") as f:
            f.write(response)


def main() -> None:
    connection = get_connection()
    companies = [list(company) for company in fetch_companies(connection)]
    raw_data = fetch_raw_data(connection)

    for idx, company in enumerate(companies):
        name = f"{get_name(company)}.json"
        for rd in raw_data:
            if rd[1] == name:
                data = str(json.loads(rd[2].tobytes().decode("utf-8")))
                companies[idx].append(data)

    for model in MODELS:
        model_inference(model, companies)


if __name__ == "__main__":
    main()
