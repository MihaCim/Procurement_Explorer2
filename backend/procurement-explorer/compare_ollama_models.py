import json
import os
import time
from datetime import datetime
from typing import Any
from urllib.parse import quote

import requests
from langchain.prompts import PromptTemplate
from src.services.llm.llm_client import LLMClient
from src.utils.prompt_templates import COMPANY_PROFILE_TEMPLATE

MODELS = [
    # "gemma3:1b",
    # "gemma3:4b",
    # "mistral:latest",
    "qwen3:0.6b",
    "qwen3:1.7b",
    "qwen3:4b",
    "qwen3:8b",
]


COMPANY_SEARCHES = [
    "taha savunma",
    "solvesall",
    "Kerry Logistics (Germany) GmbH",
    "HOVIONE FARMACIÊNCIA, S.A.",
    "NEXPLUS SK s.r.o.",
    "Harvia Finland Oy",
    "PODEMCRANE AD",
    "JOEM AUTO PARTS LIMITED",
    "Airbus Defence and Space GmbH",
    "OU Wartsila BLRT Estonia",
]


EXPLORER_URL = "http://localhost:8000"

CHUNK_SIZE = 1000

os.environ["LLM_TYPE"] = "ollama"
os.environ["OLLAMA_URL"] = "localhost"
os.environ["OLLAMA_PORT"] = "11435"


def model_inference(model: str, company_search_results: dict[str, Any]) -> None:
    folder = model
    if not os.path.exists(folder):
        os.makedirs(folder)

    os.environ["LLM_MODEL"] = model
    llm_client = LLMClient()

    prompt = PromptTemplate.from_template(template=COMPANY_PROFILE_TEMPLATE)

    for company_search in company_search_results:
        fn = f"{folder}/{company_search}.txt"
        if os.path.exists(fn):
            print(f"Skipping {fn=}")
            continue
        prompt_value = prompt.format(
            website_text=str(json.dumps(company_search_results[company_search]))[
                :CHUNK_SIZE
            ]
        )
        print(f"started: {fn=} at {datetime.now()}")
        start = time.monotonic()
        response = llm_client.generate(prompt_value)
        end = time.monotonic()
        total_time = end - start
        print(f"finished: {fn=} in {total_time=}")

        with open(fn, "w") as f:
            f.write(response)

        json_fn = f"{folder}/{company_search}.json"
        with open(json_fn, "w") as f:
            json.dump(company_search_results[company_search], f, indent=4)


def execute_company_searches() -> dict[str, Any]:
    if os.path.exists("companies.json"):
        with open("companies.json", "r") as f:
            company_search_results = json.load(f)
    else:
        company_search_results = dict[str, dict[str, str]]()

    assert isinstance(company_search_results, dict)

    for company_search in COMPANY_SEARCHES:
        if company_search in company_search_results:
            print(f"Skipping {company_search=}")
            continue

        search_url = f"{EXPLORER_URL}/search?query={quote(company_search, safe='')}"
        response = requests.get(search_url)
        if response.status_code == 200:
            company_search_results[company_search] = response.json()
            with open("companies.json", "w") as f:
                f.write(json.dumps(company_search_results))
            print(f"Success {company_search}")

    del_companies = list[str]()
    for company_search in company_search_results:
        if company_search not in COMPANY_SEARCHES:
            print(f"Removing {company_search}")
            del_companies.append(company_search)

    for company_search in del_companies:
        assert company_search in company_search_results
        del company_search_results[company_search]

    return company_search_results


def main() -> None:
    company_search_results = execute_company_searches()

    for model in MODELS:
        print("")
        print(f"Started {model=}")
        model_inference(model, company_search_results)
        print(f"Done {model=}")


if __name__ == "__main__":
    main()
