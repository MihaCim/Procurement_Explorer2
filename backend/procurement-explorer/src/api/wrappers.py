import logging
from datetime import datetime
from typing import Dict, List, Optional

from fastapi import UploadFile
from pydantic import BaseModel, ConfigDict
from ..services.document_service import get_due_diligence_status

from ..models.models import (
    Company,
    CompanyProfile,
    DocumentProfile,
    DueDiligenceProfile,
)

logger = logging.getLogger(__name__)


class DetailsWrapper(BaseModel):  
    subindustry: str
    productPortfolio: List[str]
    servicePortfolio: List[str]
    specializations: List[str]
    companySize: str
    qualityStandards: List[str]
    specific_tools_and_technologies: List[str]


class CompanyWrapper(BaseModel):
    id: int
    name: Optional[str] = None
    website: str
    status: Optional[str] = "Not Available"
    industry: Optional[str] = None
    country: Optional[str] = None
    review_date: Optional[str] = None
    products: Optional[List[str]] = None
    contact_information: Optional[Dict[str, str]] = None
    risk_level: Optional[int] = None
    added_timestamp: Optional[datetime] = None
    details: Optional[DetailsWrapper] = None


class DueDiligenceProfileWrapper(BaseModel):
    # Side card
    id: Optional[int] = None
    name: Optional[str] = None
    url: Optional[str] = None  # Add URL field
    email: Optional[str] = None  # Add email field
    founded: Optional[int] = None
    founder: Optional[str] = None
    address: Optional[Dict[str, str]] = (
        None  # Address as a dictionary (street and city)
    )
    country: Optional[str] = None  # Add country field
    Last_revision: Optional[str] = None  # Add last revision field
    risk_level: Optional[int] = None
    status: Optional[str] = None  # Add URL field

    # Upper card
    description: Optional[str] = None

    # Lower card
    key_individuals: Optional[Dict] = None  # Dictionary for key individuals
    security_risk: Optional[Dict] = None  # Dictionary for security risk
    financial_risk: Optional[Dict] = None  # Dictionary for financial risk
    operational_risk: Optional[Dict] = None  # Dictionary for operational risk
    key_relationships: Optional[Dict] = None  # Dictionary for key relationships

    # Timestamps and other fields
    due_diligence_timestamp: Optional[datetime] = None
    metadata: Optional[dict] = None
    status: Optional[str] = None
    logs: Optional[List[dict]] = None

    model_config = ConfigDict(populate_by_name=True)


class FileWrapper(BaseModel):
    id: int
    file: Optional[UploadFile] = None
    status: Optional[str] = "Pending"
    industry: Optional[str] = None
    products: Optional[List[str]] = None
    suitable_company: Optional[str] = None
    added_timestamp: Optional[datetime] = None


class WebsiteWrapper(BaseModel):
    id: int
    website: str
    status: Optional[str] = "Pending"
    added_timestamp: Optional[datetime] = None
    scraped_timestamp: Optional[datetime] = None
    created_company_id: Optional[int] = None


class CompanyDetailsWrapper(BaseModel):
    Subindustry: List[str]
    Products_portfolio: List[str]
    Service_portfolio: List[str]
    Specific_tools_and_technologies: List[str]
    Specializations: List[str]
    Quality_standards: List[str]
    Company_size: str
    Company_profile: str


class searchCompaniesWrapper(BaseModel):
    id: int
    Company_name: Optional[str] = None
    progress: str
    added_timestamp: datetime
    details: CompanyDetailsWrapper


async def map_company_to_wrapper(company: Company) -> CompanyWrapper | None:
    
    dd_profile = None
    if company and company.Website:
        dd_profile: DueDiligenceProfile = await get_due_diligence_status(company.Website)
    
    try:
        kwargs = dict(
            id=company.id,
            name=company.Name,
            website=company.Website,
            industry=company.Industry,
            country=company.Country,
            review_date=(
                company.Review_Date.isoformat() if company.Review_Date else None
            ),
            products=company.Products_Portfolio,
            contact_information=company.Contact_Information,
            risk_level=company.Risk_Level,
            added_timestamp=company.Added_Timestamp,
            details=DetailsWrapper(
                subindustry=", ".join(company.SubIndustries),
                productPortfolio=company.Products_Portfolio,
                servicePortfolio=company.Service_Portfolio,
                specializations=company.Specializations,
                companySize=company.Company_Size,
                qualityStandards=company.Quality_Standards,
                specific_tools_and_technologies=company.Specific_Tools_and_Technologies
            ),
        )
        if dd_profile and dd_profile.status is not None:
            kwargs["status"] = dd_profile.status
            kwargs["risk_level"] = dd_profile.risk_level
        else:
            kwargs["status"] = "not available"
        return CompanyWrapper(**kwargs)
    
    except Exception as e:
        logger.info(f"company status: {company.Status}")
        logger.error(f"Error mapping company to wrapper: {e}", exc_info=True)
        return None
    

async def map_companywrapper_to_company(wrapper: CompanyWrapper) -> Optional[Company]:
    try:
        def maybe(key, value):
            return {key: value} if value is not None else {}

        kwargs = {
            "id": wrapper.id,
            "website": wrapper.website,
            **maybe("name", wrapper.name),
            **maybe("status", wrapper.status),
            **maybe("industry", wrapper.industry),
            **maybe("country", wrapper.country),
            **maybe("products_portfolio", wrapper.products),
            **maybe("contact_information", wrapper.contact_information),
            **maybe("risk_level", wrapper.risk_level),
            **maybe("added_timestamp", wrapper.added_timestamp),
        }

        if wrapper.review_date:
            kwargs["review_date"] = datetime.fromisoformat(wrapper.review_date)

        details = wrapper.details
        if details:
            kwargs.update(
                maybe("service_portfolio", details.servicePortfolio)
            )
            kwargs.update(
                maybe("specializations", details.specializations)
            )
            kwargs.update(
                maybe("company_size", details.companySize)
            )
            kwargs.update(
                maybe("quality_standards", details.qualityStandards)
            )
            kwargs.update(
                maybe("specific_tools_and_technologies", details.specific_tools_and_technologies)
            )
            if details.subindustry:
                kwargs["subindustries"] = [s.strip() for s in details.subindustry.split(",")]

        return Company(**kwargs)

    except Exception as e:
        logger.error(f"Error mapping CompanyWrapper to Company: {e}", exc_info=True)
        return None

def map_company_profile_to_details(
    company_profile: CompanyProfile,
) -> CompanyDetailsWrapper:
    return CompanyDetailsWrapper(
        Subindustry=company_profile.SubIndustries,
        Products_portfolio=company_profile.Products_Portfolio,
        Service_portfolio=company_profile.Service_Portfolio,
        Specific_tools_and_technologies=company_profile.Specific_Tools_and_Technologies,
        Specializations=company_profile.Specializations,
        Quality_standards=company_profile.Quality_Standards,
        Company_size=company_profile.Company_Size,
        Company_profile=company_profile.Company_Profile,
    )


def map_document_profile_to_file_wrapper(document: DocumentProfile) -> FileWrapper:
    return FileWrapper(
        id=document.id,
        status=document.Status,
        industry=document.Industry,
        products=document.Products,
        suitable_company=document.Suitable_Company,
        added_timestamp=document.Added_Timestamp,
    )


def map_company_to_search_company(company: Company) -> searchCompaniesWrapper:
    return searchCompaniesWrapper(
        id=company.id,
        Company_name=company.Name,  # Mapping Name to Company_name
        progress=company.Status,
        added_timestamp=company.Added_Timestamp,  # Mapping Added_Timestamp
        details=CompanyDetailsWrapper(
            Subindustry=company.SubIndustries,
            Products_portfolio=company.Products_Portfolio,
            Service_portfolio=company.Service_Portfolio,
            Specific_tools_and_technologies=company.Specific_Tools_and_Technologies,
            Specializations=company.Specializations,
            Quality_standards=company.Quality_Standards,
            Company_size=company.Company_Size,
            Company_profile=company.Company_Profile,
        ),
    )


def map_due_diligence_to_wrapper(
    profile: DueDiligenceProfile, company: Company = None
) -> DueDiligenceProfileWrapper:
    
    def to_int(value):
        try:
            value = int(value)
            return value
        except (TypeError, ValueError):
            return None
        
    try:
        return DueDiligenceProfileWrapper(
            id=profile.id if profile.id else None,
            name=company.Name if company else profile.name,
            url=profile.url,
            email=str(
                profile.contacts
            ),  
            # company.Contact_Information if company else str(profile.contacts),
            founded=to_int(profile.founded),
            founder=profile.founder,
            address=profile.address,
            country=company.Country if company else "",
            Last_revision=str(profile.last_revision),
            risk_level=to_int(profile.risk_level),
            status=profile.status,
            description=profile.description,
            key_individuals=profile.key_individuals,
            security_risk=profile.security_risk,
            financial_risk=profile.financial_risk,
            operational_risk=profile.operational_risk,
            key_relationships=profile.key_relationships,
            due_diligence_timestamp=profile.due_diligence_timestamp,
            metadata=profile.metadata,
            logs=profile.logs
        )
    except Exception as e:
        logger.error(f"Failed to serialilze DueDiligenceProfile from data for {profile.url}: {e}", exc_info=True)
        return None

def map_wrapper_to_due_diligence(
    wrapper: DueDiligenceProfileWrapper,
) -> DueDiligenceProfile:
    
    # Map fields from DueDiligenceProfileWrapper to DueDiligenceProfile
    return DueDiligenceProfile(
        id=wrapper.id if wrapper.id else None,
        name=wrapper.name or "",
        url=wrapper.url,
        contacts={"email": wrapper.email} if wrapper.email else None,
        founded=wrapper.founded,
        founder=wrapper.founder,
        address=wrapper.address,
        country=wrapper.country,
        last_revision=wrapper.Last_revision,
        risk_level=wrapper.risk_level,
        description=wrapper.description,
        key_individuals=wrapper.key_individuals,
        security_risk=wrapper.security_risk,
        financial_risk=wrapper.financial_risk,
        operational_risk=wrapper.operational_risk,
        key_relationships=wrapper.key_relationships,
        due_diligence_timestamp=wrapper.due_diligence_timestamp,
        metadata=wrapper.metadata,
        logs=wrapper.logs or [],
        status=wrapper.status
    )
