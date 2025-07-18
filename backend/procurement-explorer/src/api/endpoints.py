import os
from datetime import datetime
from typing import Annotated, Any, List, Optional, Union
import logging
from fastapi import APIRouter, BackgroundTasks, File, HTTPException
from fastapi.encoders import jsonable_encoder
from fastapi.responses import JSONResponse
from langchain_core.documents import Document
from pydantic import BaseModel, ValidationError

from ..models.models import Company, CompanyInput, DueDiligenceProfile, DueDiligenceProfileInvalidError
from ..services.database_initialization import (
    get_initialization_data,
    load_dd_profiles,
    parse_company_profile
)
from ..services.dd_service import (
    delete_dd_profile_from_cache,
    get_dd_profile_from_cache,
    start_dd_process,
)
from ..services.document_service import (
    build_company_model_from_company_profile,
    build_initial_company_model,
    delete_company,
    delete_due_diligence_profile_db,
    get_companies_similarity_profiles,
    get_company,
    get_company_by_name,
    get_company_by_website,
    get_count_documents,
    get_due_diligence_by_website_db,
    get_text,
    get_text_from_crawler,
    query_companies,
    set_company,
    update_company,
    update_company_status,
    update_due_diligence_profile,
)
from ..services.llm.llm_service import (
    generate_document_profile,
    new_generate_company_profile,
)
from ..services.sanctions_checker_service import SanctionsChecker
from ..services.vector_store_service import VectorStoreService
from .dummy import due_diligence_db
from .wrappers import (
    CompanyWrapper,
    DueDiligenceProfileWrapper,
    map_company_to_wrapper,
    map_due_diligence_to_wrapper,
    map_wrapper_to_due_diligence,
    map_companywrapper_to_company
)

router = APIRouter()
sanctions_checker = SanctionsChecker()
vs = VectorStoreService(vector_store_name="company_vector_store")
logger = logging.getLogger(__name__)


async def insert_company(id: int, url: str):
    url_text: Document | None = await get_text_from_crawler(str(url))
    if url_text is None:
        return JSONResponse(
            content={"error": "Failed to extract text from the provided URL."}
        )

    # Step 1: Generate company profile
    response = new_generate_company_profile(url_text)
    if isinstance(response, dict):
        return response

    # Step 2: Build company object out of the company profile
    company = build_company_model_from_company_profile(
        url, response, status="Waiting for Review"
    )

   #company.Verdict = "NOT CONFIRMED"
    company.id = id
    company.Status = "Waiting for Review"
    company = await update_company(id, company)
   
    return {"id": id, "status": company.Status}


@router.post("/companies/add")
async def add_company(
    input: CompanyInput,  # TODO: Check the CompanyInput model
    background_tasks: BackgroundTasks,
):
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


@router.get("/companies")
async def get_companies(
    query: Optional[str] = None,
    status: Optional[Union[str, List[str]]] = ["CONFIRMED"],
    industry: Optional[Union[str, List[str]]] = None,
    country: Optional[Union[str, List[str]]] = None,
    limit: int = 20,
    offset: int = 0,
) -> dict[str, list[Any] | int]:
    companies = await query_companies(
        query=query,
        status=status,
        industry=industry,
        country=country,
        #verdict="CONFIRMED",
        limit=limit,
        offset=offset,
    )

    companies_all = await query_companies(
        query=query,
        status=status,
        industry=industry,
        country=country,
        #verdict="CONFIRMED"
    )

    companies_wrapped = [await map_company_to_wrapper(company) for company in companies]
    companies_wrapped = jsonable_encoder(companies_wrapped)

    return {
        "total": len(companies_all),
        "offset": offset,
        "limit": limit,
        "companies": companies_wrapped,
    }


@router.get("/get/allAddedCompanies")
async def get_all_added_companies(
    limit: int = 20,
    offset: int = 0,
) -> dict[str, list[Any] | int]:
    companies = await query_companies(
        exclude_status=["CONFIRMED"], 
        limit=limit,
        offset=offset,
        )
    companies_all = await query_companies(
        exclude_status=["CONFIRMED"],
        )
    companies_wrapped = [
        await map_company_to_wrapper(company) for company in companies
    ]
    return{
        "total": len(companies_all),
        "offset": offset,
        "limit": limit,
        "companies": companies_wrapped,
    }


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
        await map_company_to_wrapper(company) for company in companies if company is not None
    ]
    companies_wrapped = jsonable_encoder(companies_wrapped)
    return companies_wrapped

@router.get("/companies/id/{id}", response_model=CompanyWrapper)
async def get_company_info(
    id: str,
):
    company: Optional[Company] = await get_company(id)
    
    if company is None:
        raise HTTPException(status_code=404, detail="Company not found")
   
    return await map_company_to_wrapper(company)


@router.get("/companies/name/{name}")
async def find_company_by_name(name: str):
    companies: Optional[List[Company]] = await get_company_by_name(name)
    if companies is None:
        raise HTTPException(status_code=404, detail="Company not found")
    # Map each company to the wrapper
    companies_wrapped = [await map_company_to_wrapper(company) for company in companies]

    return companies_wrapped


@router.get("/companies/count")
async def get_company_count() -> JSONResponse:
    count = await get_count_documents()
    return {"count": count}


@router.post("/companies/by-document")
async def find_companies_by_document(
    file: Annotated[bytes, File(description="A file read as bytes")],
    content_type="application/pdf",
    k: int = 10,
):
    document_text = get_text(file, content_type)
    # create document profile for similarity search
    doc_profile = generate_document_profile(document_text)

    response = vs.query_vector_collection(
         doc_profile, collection_name="company_profile_nomic", k=k
    )
    companies = await get_companies_similarity_profiles(response)
    companies.append(None)
    
    companies_wrapped = [
         await map_company_to_wrapper(company) for company in companies if company is not None
     ]
    companies_wrapped = jsonable_encoder(companies_wrapped)
    return {"companies_list": companies_wrapped, "document_profile": doc_profile}
    

@router.put("/companies/{id}/status")
async def update_status(website: str, status: str):
    company: Optional[Company] = await get_company_by_website(website)
    if company is None:
        raise HTTPException(status_code=404, detail="Company not found")
    
    try:
        company = await update_company_status(company.id, status)
        return company.Status
    except Exception as e:
        logger.error(f"Failed to update company status: {e}")
        raise HTTPException(status_code=500, detail="Failed to update company status")


@router.put("/companies")
async def save_company_profile(companyWrapped: CompanyWrapper):
    
    if not companyWrapped.website:
        raise HTTPException(status_code=404, detail="No valid url on Company profile")
    
    try:
        company = await map_companywrapper_to_company(companyWrapped)
        if company is None:
            raise HTTPException(
                status_code=422,
                detail="Error: Could not process company data.",
            )

        existing_company = await get_company_by_website(company.Website)
        saved_company = None

        if existing_company:
            company.id = existing_company.id
            saved_company = await update_company(existing_company.id, company)
            vs.update_document_in_vector_store(str(company.id), company)
        else:
            new_company_id = await set_company(company)
            if new_company_id:
                saved_company = await get_company(new_company_id)

        if not isinstance(saved_company, Company):
             raise HTTPException(status_code=500, detail=f"Failed to save company to database.")

        return {
            "status": "ok",
            "msg": f"Company {saved_company.Website} updated on {saved_company.Added_Timestamp}",
        }
    
    except Exception as e:
        logger.error(f"Error saving company: {e}", exc_info=True)
        raise HTTPException(
            status_code=500,
            detail="Error while saving the company",
        )

@router.delete("/companies/{id}")
async def delete_company_by_id(id: str):
    
    await delete_company(id)
    return {"id": id, "status": "COMPANY DELETED"}

#****************DD_ENDPOINTS******************

@router.get("/due-diligence/profile")
async def get_due_diligence_profile(
    company_url: str,
    cached: Optional[bool] = None,
    saved: Optional[bool] = None
    ):

    if company_url is None or '':
        return {
            "status": "failed",
            "msg": f"profile url not defined",
            }
    if cached:
    # check for profile in cache
        dd_result = await get_dd_profile_from_cache(company_url)
        if isinstance(dd_result, DueDiligenceProfile):
            return map_due_diligence_to_wrapper(dd_result)
    
    #check for profile in database
    if saved:
        if due_diligence_profile := await get_due_diligence_by_website_db(company_url):
            return map_due_diligence_to_wrapper(due_diligence_profile)
    
    return {
            "status": "failed",
            "msg": f"No DueDiligence for {company_url} found in system",
            }


@router.post("/due-diligence/start")
async def create_dd_profile_(company_url: str):
    return await start_dd_process(company_url)


@router.put("/due-diligence/profile")
async def save_due_diligence_profile_(
    updated_profile: DueDiligenceProfileWrapper,
) -> dict[str, str]:

    if not updated_profile.url or updated_profile.url.strip() == "":
        raise HTTPException(status_code=400, detail="Error: Profile url is not defined")
    
    try:
        dd_profile = map_wrapper_to_due_diligence(updated_profile)
    except ValidationError as e:
        raise HTTPException(
            status_code=422,
            detail=f"Validation error on profile schema: {e.errors()}"
        )

    try:
        result = await update_due_diligence_profile(dd_profile)
    except DueDiligenceProfileInvalidError as e:
        raise HTTPException(status_code=422, detail={"validation_error": e.errors})
    
    if result["status"] == "failed":
        raise HTTPException(status_code=400, detail=result["msg"])
    
    await delete_dd_profile_from_cache(updated_profile.url)
    
    return {"id": f"{result['msg']}", "status": updated_profile.status}


@router.delete("/due-diligence/profile")
async def delete_due_diligence_profile_(
    company_url: str,
    cached: Optional[bool] = None,
    saved: Optional[bool] = None,
    ):

    if cached :
        await delete_dd_profile_from_cache(company_url)
    if saved:    
        await delete_due_diligence_profile_db(company_url)         




# @router.post("/chat")
# async def chat(
#     request: Request,
#     stream: bool = True,
#     companies: str | None = None,
# ) -> StreamingResponse:
#     # TODO: Add context from user input eg. what company profiles is he currently looking at
#     client_request_json = await request.json()

#     # Force streaming mode
#     client_request_json["stream"] = stream

#     llm_type = os.getenv("LLM_TYPE", "ollama")
#     headers = {}
#     if llm_type == "ollama":
#         llm_url = os.getenv("OLLAMA_URL", "localhost")
#         llm_port = os.getenv("OLLAMA_PORT", "11434")
#         llm_url = f"{llm_url}:{llm_port}/api/chat"
#         if not llm_url.startswith("http://"):
#             llm_url = f"http://{llm_url}"

#     elif llm_type == "openai":
#         llm_url = "https://api.openai.com/v1/chat/completions"
#         headers = {
#             "Authorization": f"Bearer {os.getenv('OPENAI_API_KEY')}",
#         }
#     else:
#         raise HTTPException(status_code=500, detail="Cannot determine LLM host")

#     async def stream_response():
#         async with httpx.AsyncClient(timeout=None) as client:
#             async with client.stream(
#                 "POST",
#                 llm_url,
#                 json=client_request_json,
#                 headers=headers,
#             ) as response:
#                 async for chunk in response.aiter_lines():
#                     if chunk.strip():  # Only send non-empty lines
#                         yield f"data: {chunk}\n\n"
#                     await asyncio.sleep(0)  # Yield control to event loop

#     return StreamingResponse(stream_response(), media_type="text/event-stream")


@router.post("/database/load")
async def initial_db_loading(
    password: str,
):
    # only possible with authentication
    if password != os.getenv("POSTGRES_PASSWORD"):
        return "Access Denied: Wrong Password"

    start_time = datetime.now()
    companies = get_initialization_data()
    num_inserts = 0

    # run the inserts for each company in loading file
    for idx, company in enumerate(companies[:1000]):
        
        company_profile, website = parse_company_profile(company, idx)
        existing_company = await get_company_by_website(website)
       
        # : If company is already in database, skipp
        if existing_company:
            continue

        # Step 3: Build company object out of the company profile
        company = build_company_model_from_company_profile(
            website, company_profile, status="CONFIRMED"
        )
        #company.Status = "CONFIRMED"
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
    num_inserts = 0
    profiles = load_dd_profiles()
    new_profiles = []

    for profile_data in profiles:
        print ("DD_PROFILE_INSERT: ", profile_data)
        print("insert: ", num_inserts)
        profile = DueDiligenceProfileWrapper(**profile_data) 
        dd_profile = map_wrapper_to_due_diligence(profile)
        dd_profile.status = "approved"
        result = await update_due_diligence_profile(dd_profile)
        if result["status"] == "ok":  
            num_inserts += 1
            new_profiles.append(result["msg"])
        
    return {"duration": datetime.now() - start_time, "num_inserts": num_inserts}
