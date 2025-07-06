import logging
from datetime import datetime
from typing import Dict, List, Optional

from fastapi import UploadFile
from pydantic import BaseModel, ConfigDict

from ..models.models import (
    Company,
    CompanyProfile,
    DocumentProfile,
    DueDiligenceProfile,
)

logger = logging.getLogger(__name__)


# for testing proposes added by Marcio  #
class DetailsWrapper(BaseModel):  # TODO: needs to be mapped to mockupAPI model
    subindustry: str
    productPortfolio: List[str]
    servicePortfolio: List[str]
    specializations: List[str]
    companySize: str
    qualityStandards: List[str]


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
    # for testing proposes added by Marcio  #
    details: Optional[DetailsWrapper] = None
    # end added by Marcio  #


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


def map_company_to_wrapper(company: Company, dd_profile: DueDiligenceProfile | None ) -> CompanyWrapper | None:
    
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
            ),
        )
        # only set status if we actually have one
        if dd_profile and dd_profile.status is not None:
            kwargs["status"] = dd_profile.status
        return CompanyWrapper(**kwargs)
    
    except Exception as e:
        logger.info(f"company status: {company.Status}")
        logger.error(f"Error mapping company to wrapper: {e}", exc_info=True)
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
        logger.error(f"Failed to serialilze DueDiligenceProfile from data for {url}: {e}", exc_info=True)
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
        logs=wrapper.logs or []
    )
