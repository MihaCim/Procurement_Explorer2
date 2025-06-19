import asyncio
import io
import json
import logging
import os
import sys
from datetime import datetime
from typing import List, Optional, Union
from urllib.parse import urlparse

import aiohttp
import docx2txt
from fastapi import HTTPException
from langchain_community.document_loaders.async_html import AsyncHtmlLoader
from langchain_community.document_transformers.html2text import Html2TextTransformer
from langchain_core.documents import Document
from pypdf import PdfReader
from src.connectors.postgres_conector import PostgresConnector
from src.models.models import Company, CompanyProfile, DueDiligenceProfile

from ..services.vector_store_service import VectorStoreService

logging.basicConfig(
    level=logging.INFO,  # Set the logging level to INFO or DEBUG
    format="%(asctime)s - %(levelname)s - %(message)s",
    handlers=[
        logging.StreamHandler(sys.stdout),  # Output to stdout
    ],
)

vs = VectorStoreService(vector_store_name="company_vector_store")

logger = logging.getLogger(__name__)


def get_text(document: bytes, file_type: str) -> str:
    """Get the text content from the document based on the file type.

    Parameters
    ----------
    document : bytes
        The document content
    file_type : str
        The file type (e.g. pdf, docx)

    Returns
    -------
    str
        The text content of the document
    """
    if (
        file_type
        == "application/vnd.openxmlformats-officedocument.wordprocessingml.document"
    ):
        return get_text_from_docx(document)
    elif file_type == "application/pdf":
        return get_text_from_pdf(document)
    else:
        return ""


def get_text_from_docx(document: bytes) -> str:
    """
    Extract text from a DOCX (Word) document provided as a bytes object.

    This function reads a DOCX file from a bytes object, extracts the text using the docx2txt library,
    and returns the extracted text. It handles DOCX files directly from memory using a BytesIO stream.

    Parameters
    ----------
    document : bytes
        The DOCX document as a byte stream.

    Returns
    -------
    str
        Extracted text from the DOCX file or an empty string if extraction fails.
    """
    try:
        text = docx2txt.process(io.BytesIO(document))
        logger.info("Successfully extracted text from DOCX document.")
        return text
    except Exception as e:
        logger.error(f"Error extracting text from DOCX document: {e}")
        return ""


def get_text_from_pdf(document: bytes) -> str:
    """
    Extract text from a PDF document provided as a bytes object.

    Reads a PDF from bytes, extracts text from each page, and concatenates it into a single string.
    Logs an error and returns an empty string if the text extraction fails.

    Parameters
    ----------
    document : bytes
        The PDF document as a byte stream.

    Returns
    -------
    str
        Concatenated text from the PDF or an empty string if extraction fails.
    """
    text = ""
    try:
        with io.BytesIO(document) as stream:
            pdf_reader = PdfReader(stream)
            for page in pdf_reader.pages:
                if page.extract_text():
                    text += page.extract_text()
    except Exception as e:
        logger.error(f"Error extracting text from PDF document: {e}")
    return text


def normalize_url(url):
    # If the URL doesn't start with a scheme, add the default scheme
    if "://" not in url and url.startswith(("http:/", "https:/")):
        url = url.split(":", 1)[1].lstrip("/")

    # Use urlparse to handle the URL
    parsed = urlparse(url)

    # If there's a netloc, use it; otherwise, use the path
    domain = parsed.netloc or parsed.path

    # Remove www. if present
    if domain.startswith("www."):
        domain = domain[4:]

    # Remove port if present
    domain = domain.split(":", 1)[0]

    return domain


def get_text_from_url(url: str) -> Optional[Document]:
    """Asynchronously load HTML content from a URL and transform it to a structured text document.

    Parameters
    ----------
    url : str
        Website URL

    Returns
    -------
    Optional[Document]
        The structured Document object or None if an error occurs.
    """
    if not url.startswith("http"):
        url = f"https://{url}"
    try:
        loader = AsyncHtmlLoader(web_path=url)
        docs = loader.load()
        html2text = Html2TextTransformer()
        docs_transformed = html2text.transform_documents(docs)
        return docs_transformed[0] if docs_transformed else None
    except Exception as e:
        logger.error(f"Error loading and transforming HTML content from {url}: {e}")
        return None


async def get_text_from_crawler(
    website: str,
    source: PostgresConnector = PostgresConnector(),
) -> Optional[Document]:
    domain = normalize_url(website)
    host = os.getenv("CRAWLER_URL")
    port = os.getenv("CRAWLER_PORT")
    url = f"http://{host}:{port}/sites"

    async with aiohttp.ClientSession() as session:
        async with session.post(
            url, json=[{"website": website, "name": domain}]
        ) as response:
            if response.status != 204:
                raise HTTPException(
                    status_code=400, detail="Failed to submit URL for crawling"
                )

        for _ in range(180):  # Check for 5 minutes (60 * 5 seconds)
            async with session.get(f"http://{host}:{port}/sites") as response:
                if response.status == 200:
                    sites = await response.json()
                    for site in sites:
                        # print(site)
                        if site["Url"] == website and site["Status"] == "done":
                            docs = source.get_document("raw_data", site["Name"])

                            return docs

            await asyncio.sleep(5)  # Wait for 5 seconds before checking again


def build_company_model_from_company_profile(
    website: str, company_profile: CompanyProfile | dict, status
) -> Company:
    if isinstance(company_profile, CompanyProfile):
        company_profile_dict = company_profile.model_dump()
    else:
        company_profile_dict = company_profile

    return Company(
        **company_profile_dict,
        website=website,
        status=status,
        review_date=datetime.now(),
        due_diligence_status="Not Available",
        added_timestamp=datetime.now(),
        risk_level=None,
        profile_last_updated=None,
        due_diligence_last_updated=None,
    )


def build_initial_company_model(
    website: str,
) -> Company:
    return Company(
        name=website,
        website=website,
        status="In Progress",
        review_date=datetime.now(),
        due_diligence_status="Not Available",
        added_timestamp=datetime.now(),
        risk_level=None,
        profile_last_updated=None,
        due_diligence_last_updated=None,
        verdict="NOT CONFIRMED",
    )


async def set_company(
    response: Company, source: PostgresConnector = PostgresConnector()
):
    dump = response.model_dump()
    dump["Contact_Information"] = json.dumps(dump["Contact_Information"])
    if "id" in dump:
        del dump["id"]
    docs = source.upload_document("companies", dump)
    return docs


async def update_company_verdict(
    company_id: int,
    verdict: str = "CONFIRMED",
    source: PostgresConnector = PostgresConnector(),
):
    print("updating verdict")
    source.update_document("companies", company_id, {"verdict": verdict})
    return await get_company(company_id, source)


async def update_company_status(
    company_id: int, status: str, source: PostgresConnector = PostgresConnector()
):
    source.update_document("companies", company_id, {"status": status})
    return await get_company(company_id, source)


async def update_company(
    company_id: int, response: Company, source: PostgresConnector = PostgresConnector()
) -> Company | None:
    response.Profile_Last_Updated = datetime.now()
    dump = response.model_dump()
    dump["Contact_Information"] = json.dumps(dump["Contact_Information"])
    source.update_document("companies", company_id, dump)
    company = await get_company(str(company_id))
    vs.update_document_in_vector_store(str(company_id), company)
    return company


async def delete_company(
    company_id: int, source: PostgresConnector = PostgresConnector()
):
    if company is None:
        logger.error(f"Company with ID {company_id} does not exist.")
        return False
    # remove company from companies table
    source.delete_document("companies", str(company_id))
    # remove company from sites table
    website = company.Website
    query = "DELETE FROM sites WHERE url = %s;"
    source.execute_query(query, (website,))
    vs.delete_document_in_vector_store(str(company_id), company)
    return True


async def get_company(
    document_id: str, source: PostgresConnector = PostgresConnector()
) -> Company | None:
    doc = source.read_json_document("companies", document_id)
    if doc is None:
        return None
    try:
        company = Company(**doc)
    except Exception as e:
        logger.error(f"Error loading company from document: {e}")
        return None
    return company


async def get_company_by_website(
    website: str, source: PostgresConnector = PostgresConnector()
) -> Company | None:
    query = "SELECT * FROM companies WHERE website = %s;"
    result = source.execute_query(query, (website,), fetchone=True)
    if not result:
        return None
    company = Company(**result)
    return company


async def get_company_by_name(
    name: str, source: PostgresConnector = PostgresConnector()
) -> Company | None:
    query = """
        SELECT * FROM companies
        WHERE LOWER(name) ILIKE $1
    """
    result = source.execute_query(query, (name.lower(),), fetch=True)
    if not result:
        return None
    companies = [Company(**doc) for doc in result]
    return companies


async def company_exists(
    website: str, source: PostgresConnector = PostgresConnector()
) -> bool:
    return await get_company_by_website(website, source) is not None


async def query_companies(
    source: PostgresConnector = PostgresConnector(),
    query: Optional[str] = None,
    status: Optional[Union[str, List[str]]] = None,
    industry: Optional[Union[str, List[str]]] = None,
    country: Optional[Union[str, List[str]]] = None,
    verdict: Optional[Union[str, List[str]]] = None,
    limit: Optional[int] = 100,
    offset: Optional[int] = 0,
):
    # Start with a basic SQL query
    sql_query = "SELECT * FROM companies WHERE TRUE"
    params = []

    # If a general search query is provided, apply it to multiple fields
    if query:
        # Extended query
        sql_query += """
            AND (
                LOWER(name) ILIKE %s OR
                LOWER(website) ILIKE %s OR
                LOWER(status) ILIKE %s OR
                LOWER(due_diligence_status) ILIKE %s OR
                LOWER(risk_level::TEXT) ILIKE %s OR
                LOWER(country) ILIKE %s OR
                LOWER(industry) ILIKE %s OR
                EXISTS (SELECT 1 FROM unnest(subindustries) AS sub WHERE LOWER(sub) ILIKE %s) OR
                EXISTS (SELECT 1 FROM unnest(products_portfolio) AS product WHERE LOWER(product) ILIKE %s) OR
                EXISTS (SELECT 1 FROM unnest(service_portfolio) AS service WHERE LOWER(service) ILIKE %s) OR
                EXISTS (SELECT 1 FROM unnest(specific_tools_and_technologies) AS tool WHERE LOWER(tool) ILIKE %s) OR
                EXISTS (SELECT 1 FROM unnest(specializations) AS spec WHERE LOWER(spec) ILIKE %s) OR
                EXISTS (SELECT 1 FROM unnest(quality_standards) AS standard WHERE LOWER(standard) ILIKE %s) OR
                LOWER(company_size) ILIKE %s OR
                LOWER(company_profile) ILIKE %s OR
                LOWER(description) ILIKE %s OR
                LOWER(verdict) ILIKE %s OR
                EXISTS (
                    SELECT 1 FROM jsonb_each_text(contact_information)
                    WHERE LOWER(value) ILIKE %s
                )
            )
        """
        # Extend the params list with the query string for each field
        params = [f"%{query.lower()}%"] * 18

    # Apply individual filters for status
    if status:
        if isinstance(status, list) and status:
            placeholders = ", ".join(["%s"] * len(status))
            sql_query += f" AND status IN ({placeholders})"
            params.extend(status)  # Make sure status is lowercased if needed
        else:
            sql_query += " AND LOWER(status) = %s"
            params.append(status.lower())

    # Apply filters for industry
    if industry:
        if isinstance(industry, list) and industry:
            placeholders = ", ".join(["%s"] * len(industry))
            sql_query += f" AND industry IN ({placeholders})"
            params.extend(industry)  # Make sure industry is lowercased if needed
        else:
            sql_query += " AND LOWER(industry) = %s"
            params.append(industry.lower())

    # Apply filters for country
    if country:
        if isinstance(country, list) and country:
            placeholders = ", ".join(["%s"] * len(country))
            sql_query += f" AND country IN ({placeholders})"
            params.extend(country)  # Make sure country is lowercased if needed
        else:
            sql_query += " AND LOWER(country) = %s"
            params.append(country.lower())
    if verdict:
        if isinstance(verdict, list) and verdict:
            placeholders = ", ".join(["%s"] * len(verdict))
            sql_query += f" AND verdict IN ({placeholders})"
            params.extend(verdict)
        else:
            sql_query += " AND verdict = %s"
            params.append(verdict)

    sql_query += " ORDER BY id DESC"

    if limit:
        sql_query += " LIMIT %s"
        params.append(limit)

    if offset:
        sql_query += " OFFSET %s"
        params.append(offset)

    # Execute the query
    result = source.execute_query(sql_query, params, fetch=True)

    if not result:
        return []

    companies = [Company(**doc) for doc in result]

    return companies


async def get_companies_similarity_profiles(
    metadata_list: List[dict],
) -> List[Company]:
    companies_list = []
    for metadata in metadata_list:
        company = await get_company_by_website(metadata["Website"])
        companies_list.append(company)
    return companies_list


async def get_due_diligence_by_website(
    url: str, source: PostgresConnector = PostgresConnector()
) -> DueDiligenceProfile | None:
    query = "SELECT * FROM due_diligence_profiles WHERE url = %s;"
    result = source.execute_query(query, (url,), fetchone=True)
    if not result:
        return None
    due_diligence_profile = DueDiligenceProfile(**result)
    return due_diligence_profile


async def set_due_diligence_profile(
    dd_profile: DueDiligenceProfile, source: PostgresConnector = PostgresConnector()
):
    old_profile = await get_due_diligence_by_website(dd_profile.url)

    dd_profile.last_revision = datetime.now().isoformat()
    dump = dd_profile.model_dump()
    # Serialize dictionary fields to JSON if they exist
    json_fields = [
        "contacts",
        "address",
        "key_individuals",
        "security_risk",
        "financial_risk",
        "operational_risk",
        "key_relationships",
    ]
    for field in json_fields:
        if dump.get(field) is not None:
            dump[field] = json.dumps(dump[field])  # Convert dict to JSON string
    # update profile
    if old_profile:
        dump["id"] = old_profile.id
        source.update_document("due_diligence_profiles", dump["id"], dump)
        return dump["id"]
    # create new profile
    else:
        if dump["id"] is None:
            del dump["id"]
        profile_id = source.upload_document("due_diligence_profiles", dump)
        dd_profile.id = profile_id
        return dd_profile.id


async def get_last_n_profiles(
    limit: int, source: PostgresConnector = PostgresConnector()
):
    docs = source.get_last_n_documents("companies", limit)
    companies = [Company(**doc) for doc in docs]
    return companies


async def get_count_documents(source: PostgresConnector = PostgresConnector()):
    count = source.count_documents("companies")

    return count
