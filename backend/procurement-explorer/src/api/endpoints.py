import os
from datetime import datetime
from functools import lru_cache
from typing import Annotated, List, Optional, Union

from fastapi import APIRouter, BackgroundTasks, File, HTTPException
from fastapi.encoders import jsonable_encoder
from fastapi.responses import JSONResponse
from langchain_core.documents import Document
from pydantic import BaseModel, ValidationError

from ..models.models import Company, CompanyInput, DueDiligenceProfile
from ..services.database_initialization import (
    get_initialization_data,
    load_dd_profiles,
    parse_company_profile,
)
from ..services.document_service import (
    build_company_model_from_company_profile,
    build_initial_company_model,
    delete_company,
    get_companies_similarity_profiles,
    get_company,
    get_company_by_name,
    get_company_by_website,
    get_count_documents,
    get_due_diligence_by_website,
    get_text,
    get_text_from_crawler,
    query_companies,
    set_company,
    set_due_diligence_profile,
    update_company,
    update_company_status,
    update_company_verdict,
)
from ..services.llm.llm_service import (
    generate_document_profile,
    new_generate_company_profile,
)
from ..services.sanctions_checker_service import SanctionsChecker
from ..services.vector_store_service import VectorStoreService
from .dummy import due_diligence_db
from .tools import generate_webpage_summary, google_search
from .wrappers import (
    CompanyWrapper,
    DueDiligenceProfileWrapper,
    map_company_to_search_company,
    map_company_to_wrapper,
    map_due_diligence_to_wrapper,
    map_wrapper_to_due_diligence,
)

router = APIRouter()
sanctions_checker = SanctionsChecker()
vs = VectorStoreService(vector_store_name="company_vector_store")


async def insert_company(id: int, url: str):
    url_text: Document | None = await get_text_from_crawler(str(url))
    if url_text is None:
        return JSONResponse(
            content={"error": "Failed to extract text from the provided URL."}
        )
    print("received request add company")

    # Step 1: Generate company profile
    response = new_generate_company_profile(url_text)
    if isinstance(response, dict):
        return response

    # Step 2: Build company object out of the company profile
    company = build_company_model_from_company_profile(
        url, response, status="Waiting for Review"
    )
    # Step 3: Add source to the company object
    company.Verdict = "NOT CONFIRMED"
    company.id = id
    company.Status = "Waiting for Review"
    # Step 4: Store the company object in the database
    company = await update_company(id, company)
    # Step 5: Generate the embeddings for the company profile
    # vs.add_document_to_vector_store(id, company)
    # return company
    return {"id": id, "status": company.Status}


@router.post("/companies/add")
async def add_company(
    input: CompanyInput,  # TODO: Check the CompanyInput model
    background_tasks: BackgroundTasks,
):
    print("received request companies/add")
    url = input.website
    # Step 0: Check if the company already exists in the database
    company: Optional[Company] = await get_company_by_website(url)
    if company is not None:
        return {"id": company.id, "status": company.Status}
    # Step 1: Insert the company
    initial_company = build_initial_company_model(url)
    id = await set_company(initial_company)
    # Step 2: use insert_company to get the company profile, running it as a background task
    background_tasks.add_task(insert_company, id, url)
    return {"id": id, "status": initial_company.Status}


@router.get("/companies/id/{id}", response_model=CompanyWrapper)
async def get_company_info(
    id: str,
):
    company: Optional[Company] = await get_company(id)
    if company is None:
        raise HTTPException(status_code=404, detail="Company not found")
    # Map the company model to the CompanyWrapper
    return map_company_to_wrapper(company)


@router.get("/companies/name/{name}")
async def find_company_by_name(name: str):
    companies: Optional[List[Company]] = await get_company_by_name(name)
    if companies is None:
        raise HTTPException(status_code=404, detail="Company not found")
    # Map each company to the wrapper
    companies_wrapped = [map_company_to_wrapper(company) for company in companies]

    return companies_wrapped


@router.get("/companies/{id}/status")
async def get_company_status(id: int):
    company: Optional[Company] = await get_company(id)
    if company is None:
        raise HTTPException(status_code=404, detail="Company not found")
    print(company)
    return {"id": id, "status": company.Due_Diligence_Status}


@router.put("/companies/{id}/status")
async def update_status(website: str, status: str):
    company: Optional[Company] = await get_company_by_website(website)
    if company is None:
        raise HTTPException(status_code=404, detail="Company not found")
    company = await update_company_status(company.id, status)
    return company.Status


@router.get("/companies/count")
async def get_company_count() -> JSONResponse:
    count = await get_count_documents()
    return {"count": count}


@router.put("/companies/{id}/verdict")
async def update_company_verdict_status(id: str, verdict: str):
    print("is confirmed: ", verdict)
    if verdict == "true":
        company = await update_company_verdict(id)
        vs.add_document_to_vector_store(id, company)
        return {"id": id, "status": company.Verdict}
    else:
        await delete_company(id)
        return {"id": id, "status": "COMPANY DELETED"}


# TODO cleanup after testing
class CompanyQuery(BaseModel):
    query: Optional[str] = None
    status: Optional[Union[str, List[str]]] = None
    industry: Optional[Union[str, List[str]]] = None
    country: Optional[Union[str, List[str]]] = None
    limit: Optional[int] = 10


@router.get("/companies")
async def get_companies(
    query: Optional[str] = None,
    status: Optional[Union[str, List[str]]] = None,
    industry: Optional[Union[str, List[str]]] = None,
    country: Optional[Union[str, List[str]]] = None,
    limit: Optional[int] = 20,
):
    companies = await query_companies(
        query=query,
        status=status,
        industry=industry,
        country=country,
        verdict="CONFIRMED",
        limit=limit,
    )
    # Map each company to the wrapper
    companies_wrapped = [map_company_to_wrapper(company) for company in companies]
    companies_wrapped = jsonable_encoder(companies_wrapped)
    return companies_wrapped


@router.get("/companies/similar")
async def find_similar_companies(text: str, k: int = 10):
    """
    Find companies similar to the input company.
    """
    response = vs.query_vector_collection(
        text, collection_name="company_profile_nomic", k=k
    )
    companies = await get_companies_similarity_profiles(response)
    companies_wrapped = [
        map_company_to_wrapper(company) for company in companies if company is not None
    ]
    companies_wrapped = jsonable_encoder(companies_wrapped)
    return companies_wrapped


@router.post("/companies/by-document")
async def find_companies_by_document(
    file: Annotated[bytes, File(description="A file read as bytes")],
    content_type="application/pdf",
    k: int = 10,
):
    print("received request files/upload")
    document_text = get_text(file, content_type)
    print(document_text)
    # create document profile for similarity search
    doc_profile = generate_document_profile(document_text)
    # Based on the document profile search vector store for suitable companies
    response = vs.query_vector_collection(
        doc_profile, collection_name="company_profile_nomic", k=k
    )
    companies = await get_companies_similarity_profiles(response)
    companies_wrapped = [
        map_company_to_wrapper(company) for company in companies if company is not None
    ]
    companies_wrapped = jsonable_encoder(companies_wrapped)
    return {"companies_list": companies_wrapped, "document_profile": doc_profile}


@router.get("/get/allAddedCompanies")
async def get_all_added_companies():
    companies = await query_companies(verdict="NOT CONFIRMED", limit=100)
    companies_wrapped = [
        map_company_to_search_company(company) for company in companies
    ]
    return companies_wrapped


@router.get(
    "/due-diligence/profile/{id}"
)  # , response_model=DueDiligenceProfileWrapper})
async def get_due_diligence_prof(id: int):
    company = await get_company(id)
    if company:
        due_diligence_profile = await get_due_diligence_by_website(company.Website)
        return (
            map_due_diligence_to_wrapper(due_diligence_profile, company)
            if due_diligence_profile
            else "File does not exist"
        )
    else:
        return "company id does not exist"


@router.put("/due-diligence/profile/{id}")
async def update_due_diligence_profile(updated_profile: DueDiligenceProfileWrapper):
    print("update request: ", updated_profile)
    dd_profile = map_wrapper_to_due_diligence(updated_profile)

    dd_profile_id = await set_due_diligence_profile(dd_profile)
    # update company profile dd_status #TODO: put this part into document_services
    company = await get_company_by_website(dd_profile.url)
    if company:
        company.Due_Diligence_Status = "Available"
        company.Due_Diligence_Last_Updated = datetime.now()
        await update_company(company.id, company)

    return {"id": dd_profile_id, "status": updated_profile.status}


@router.get("/companies/{id}/due_diligence/status")
# get status of risk level for the company: 1-5
async def due_diligence_status(id: int):
    for profile in due_diligence_db:
        if profile.id == id:
            return {profile.risk_level}
    raise HTTPException(status_code=404, detail="Company not found")


@lru_cache(maxsize=100)
@router.get("/scrape")
async def scrape(url: str) -> str:
    try:
        return await generate_webpage_summary(url)
    except Exception as e:
        print(f"Error while scraping {url}: {e}")
        raise HTTPException(
            status_code=500, detail="Error while trying to generate summary"
        )


@router.get("/search")
async def search(query: str) -> list[str]:
    try:
        return google_search(query)
    except Exception as e:
        print(f"Error while trying to search {query}: {e}")
        raise HTTPException(
            status_code=500, detail="Error while trying to perform search"
        )


@router.post("/database/load")
async def initial_db_loading(
    password: str,
):
    print("received data loading request")
    # only possible with authentication
    if password != os.getenv("POSTGRES_PASSWORD"):
        return "Access Denied: Wrong Password"

    start_time = datetime.now()
    companies = get_initialization_data()
    num_inserts = 0
    # companies = companies[:100]

    # run the inserts for each company in loading file
    for idx, company in enumerate(companies[:1000]):
        # Step 1: Parse company profile
        company_profile, website = parse_company_profile(company, idx)

        print("website: ", website)
        existing_company = await get_company_by_website(website)
        # Step 3
        # : If company is already in database, skipp
        if existing_company:
            continue

        # Step 3: Build company object out of the company profile
        company = build_company_model_from_company_profile(
            website, company_profile, status="Accepted"
        )
        company.Verdict = "CONFIRMED"
        # Step 3: Store the company object in the database
        id = await set_company(company)
        # Step 4: Generate the embeddings for the company profile
        vs.add_document_to_vector_store(id, company)
        num_inserts += 1
        # return company
    return {"duration": datetime.now() - start_time, "num_inserts": num_inserts}


@router.post("/database/due-diligence/load")
async def initial_dd_loading_dd_profiles(
    password: str,
):
    print("received data loading request")
    # only possible with authentication
    if password != os.getenv("POSTGRES_PASSWORD"):
        return "Access Denied: Wrong Password"

    start_time = datetime.now()
    # companies = get_initialization_data()
    num_inserts = 0

    # run the inserts for each company in loading file
    profiles = load_dd_profiles()
    new_profiles = []

    for profile_data in profiles:
        print("insert: ", num_inserts)
        try:
            dd_profile = DueDiligenceProfile(**profile_data)
            # dd_profile = parse_due_diligence_profile(profile_data)
            dd_profile_id = await set_due_diligence_profile(dd_profile)
            # update company profile dd_status
            company = await get_company_by_website(dd_profile.url)
            if company:
                company.Due_Diligence_Status = "Available"
                company.Due_Diligence_Last_Updated = datetime.now()
                await update_company(company.id, company)
            num_inserts += 1
            new_profiles.append(dd_profile_id)
        except ValidationError as e:
            # Skip the profile if validation fails
            print(f"Data insert for dueDiligence failed, Error: {e}")
            continue

    if new_profiles:
        return new_profiles
    return {"duration": datetime.now() - start_time, "num_inserts": num_inserts}
