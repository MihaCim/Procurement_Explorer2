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
        default_factory=lambda: datetime.now().isoformat(), alias="start")
    summary: Optional[str] = Field(default=None, alias="summary")
    status: Optional[str] = Field(default="not available", alias="status")
    metadata: Optional[dict] = Field(default=None, alias="metadata")
    logs: Optional[List[dict]] = Field(default=None, alias="logs")
    

class DueDiligenceResult(BaseModel):
    logs: list[dict[str, str | datetime]] = list()
    profile: dict[str, Any] = dict()
    url: str
    errors: list[str] = list()
    started: datetime = datetime.now()
    last_updated: datetime = datetime.now()

def empty_str_to_none(value):
    return None if value is None or (isinstance(value, str) and value.strip() == '') else value

def map_company_data_to_profile(data: DueDiligenceResult | None) -> DueDiligenceCompanyProfile:
    
    if data:
        profile = data.profile
    
        kwargs = dict(
            name=profile.get("company_name", ""),
            status=profile.get("status", "not available"),
            url=data.url,
            founded=empty_str_to_none(str(profile.get("founded"))),
            founder=profile.get("founder"),
            address=profile.get("address"),
            risk_level=empty_str_to_none(str(profile.get("risk_level_int"))),
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
