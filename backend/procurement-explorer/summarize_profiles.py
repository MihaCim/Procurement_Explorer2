import json
import logging
import os
import re


from langchain_core.documents import Document
from langchain_text_splitters import RecursiveCharacterTextSplitter

from procurement_explorer.explorer.app import AzureBlobConnector
from procurement_explorer.explorer.app import get_text_from_url
from procurement_explorer.explorer.app import generate_full_company_profile
from procurement_explorer.explorer.app import TimeoutException, timeout
from procurement_explorer.explorer.app import parse_company_profile

# Configuration
INPUT_CONTAINER = os.getenv("WEBSITE_CONTAINER", "web-scraper-v3")
COMPANY_CONTAINER = os.getenv("COMPANY_PROFILE_CONTAINER", "company-profiles")
CHUNK_SIZE = 7000

# Initialize
text_splitter = RecursiveCharacterTextSplitter(
    chunk_size=CHUNK_SIZE,
    chunk_overlap=0,
    length_function=len,
    is_separator_regex=False,
)
azure_connector = AzureBlobConnector()


def process_blob(blob, azure_connector, text_splitter):
    json_data = azure_connector.read_json_blob(INPUT_CONTAINER, blob)
    # Long profile
    try:
        json_data = handle_full_profile(json_data, text_splitter)
    except TimeoutException:
        print(f"Timeout processing {blob}")
    # Short profile
    try:
        handle_short_profile(json_data)
    except TimeoutException:
        print(f"Timeout processing {blob}")
    save_data(blob, json_data, azure_connector)


@timeout(1200)
def handle_full_profile(json_data, text_splitter):
    data = json_data.get("data", {})
    additional_info = {
        "dnb_industry": json_data.get("industry", ""),
        "dnb_company_name": json_data.get("name", ""),
    }
    if data:
        text = ""
        for item in data:
            text += item["content"]
        texts = text_splitter.create_documents([text])
        full_profile = generate_full_company_profile(
            texts, max_words=12000, additional_info=additional_info
        )
        json_data["data"] = parse_company_profile(full_profile)
    return json_data


def handle_short_profile(json_data):
    website = json_data.get("Website", "")
    # Set timer for website processing
    if website:
        process_website_data(website, json_data)


def _get_dnb_info(json_data):
    # Get all keys values exepct data
    dnb_info = {k: v for k, v in json_data.items() if k != "data"}
    return dnb_info


@timeout(300)
def process_website_data(website, json_data):
    if not re.match(r"^https?://", website):
        website = f"http://{website}"

    docs_transformed = []
    doc_transformed = get_text_from_url(website)
    # Handle long first page
    if doc_transformed and len(doc_transformed.page_content) > CHUNK_SIZE:
        doc_transformed.page_content = doc_transformed.page_content[:CHUNK_SIZE]
        docs_transformed.append(doc_transformed)

    dnb_info = str(_get_dnb_info(json_data))
    # Cut the DNB info to fit the 12000 words limit
    if len(dnb_info) > CHUNK_SIZE:
        dnb_info = dnb_info[:CHUNK_SIZE]
        info_doc = Document(page_content=dnb_info)
        docs_transformed.append(info_doc)  # type: ignore

    first_page_profile = generate_full_company_profile(
        docs_transformed,
        max_words=12000,
        additional_info={
            "dnb_industry": json_data.get("industry", ""),
            "dnb_company_name": json_data.get("name", ""),
        },
    )
    json_data["short_profile"] = parse_company_profile(first_page_profile)


def save_data(blob, json_data, azure_connector: AzureBlobConnector):
    try:
        result_file_name = f"{blob}.json"
        file_path = f"explorer/app/data/{result_file_name}"
        with open(file_path, "w") as f:
            json.dump(json_data, f)
        azure_connector.upload_blob(COMPANY_CONTAINER, result_file_name, file_path)
    except Exception as e:
        logging.error(f"Error saving data for {blob}: {e}")


if __name__ == "__main__":
    all_blobs = azure_connector.list_blobs(INPUT_CONTAINER)
    processed_blobs = azure_connector.list_blobs(COMPANY_CONTAINER)
    for index, blob in enumerate(all_blobs):
        if f"{blob}.json" in processed_blobs:
            print(f"Skipping {blob} {index} of {len(all_blobs)}")
            continue
        print(f"Processing {blob}: {index} of {len(all_blobs)}")
        process_blob(blob, azure_connector, text_splitter)
