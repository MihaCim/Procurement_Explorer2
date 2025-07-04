from datetime import datetime
from typing import Dict, List, Literal, Optional, Any
from pydantic import BaseModel, ConfigDict, Field

class DueDiligenceCompanyProfile(BaseModel):
    name: str = Field(default="", alias="name")
    url: Optional[str] = Field(default=None, alias="url")
    founded: Optional[str] = Field(default=None, alias="founded")
    founder: Optional[str] = Field(default=None, alias="founder")
    address: Optional[dict] = Field(default=None, alias="address")
    risk_level: Optional[str] = Field(default=None, alias="risk_level")
    description: Optional[str] = Field(default=None, alias="description")
    key_individuals: Optional[dict] = Field(default=None, alias="key_individuals")
    security_risk: Optional[dict] = Field(default=None, alias="security_risk")
    financial_risk: Optional[dict] = Field(default=None, alias="financial_risk")
    operational_risk: Optional[dict] = Field(default=None, alias="operational_risk")
    key_relationships: Optional[dict] = Field(default=None, alias="key_relationships")
    last_revision: Optional[str] = Field(
        default_factory=lambda: datetime.now().isoformat(), alias="last_revision")
    due_diligence_timestamp: Optional[str] = Field(
        default_factory=lambda: datetime.now().isoformat(), alias="due_diligence_timestamp")
    summary: Optional[str] = Field(default=None, alias="summary")
    status: Optional[str] = Field(default="not available", alias="status")
    metadata: Optional[dict] = Field(default=None, alias="metadata")
    logs: Optional[List[dict]] = Field(default=None, alias="logs")
    

class DueDiligenceProfileWrapper(BaseModel):
    # Side card
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
    logs: Optional[List[dict]] = Field(default=None, alias="logs")


class DueDiligenceResult(BaseModel):
    logs: list[dict[str, str | datetime]] = list()
    profile: dict[str, Any] = dict()
    url: str
    errors: list[str] = list()
    started: datetime = datetime.now()
    last_updated: datetime = datetime.now()


def map_company_data_to_profile(data: DueDiligenceResult | None) -> DueDiligenceCompanyProfile:
    
    if data:
        profile = data.profile
    
        kwargs = dict(
            name=profile.get("company_name", ""),
            status=profile.get("status", "not available"),
            url=data.url,
            founded=str(profile.get("founded")) if profile.get("founded") is not None else None,
            founder=profile.get("founder"),
            address=profile.get("address"),
            risk_level=str(profile.get("risk_level_int")) if profile.get("risk_level_int") is not None else None,
            description=profile.get("description"),
            key_individuals=profile.get("key_individuals"),
            security_risk=profile.get("security_risks"),
            financial_risk=profile.get("financial_risks"),
            operational_risk=profile.get("operational_risks"),
            key_relationships=profile.get("key_relationships"),
            summary=profile.get("summary"),
            metadata=profile.get("metadata"),
            last_revision=(data.last_updated.isoformat()
                    if isinstance(data.last_updated, datetime)
                    else str(data.last_updated) or datetime.now().isoformat()),
            due_diligence_timestamp=(data.started.isoformat()
                    if isinstance(data.started, datetime)
                    else str(data.started) or datetime.now().isoformat()),
            logs=data.logs if data.logs else None,
        )
        return DueDiligenceCompanyProfile(**kwargs)
    return None
