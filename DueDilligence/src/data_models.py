from datetime import datetime
from typing import List, Optional, Any
from pydantic import BaseModel, Field, ConfigDict
import json

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
    status: Optional[str] = Field(default=None, alias="status")
    metadata: Optional[dict] = Field(default=None, alias="metadata")
    logs: Optional[List[dict]] = Field(default=None, alias="logs")    
    model_config = ConfigDict(populate_by_name=True)

class DueDiligenceResult(BaseModel):
    logs: list[dict[str, str | datetime]] = list()
    profile: dict[str, Any] = dict()
    url: str
    errors: list[str] = list()
    started: datetime = datetime.now()
    last_updated: datetime = datetime.now()


def empty_str_to_none(value: Any) -> Any:
    """
    Converts None, empty strings, or the string 'None' (case-insensitive) to Python's None.
    Retains other values.
    """
    if value is None:
        return None
    if isinstance(value, str):
        stripped_value = value.strip()
        if stripped_value == '' or stripped_value.lower() == 'none':
            return None
    return value


def replace_none_with_empty(obj: Any) -> Any:
    """
    Recursively replaces None with empty string in dicts and lists.
    """
    if obj is None:
        return ""
    elif isinstance(obj, dict):
        return {k: replace_none_with_empty(v) for k, v in obj.items()}
    elif isinstance(obj, list):
        return [replace_none_with_empty(item) for item in obj]
    else:
        return obj
    
def safe_get_dict(value: Any, default: dict = {}) -> dict:
    """
    Ensures the returned value is a dictionary; otherwise returns the default.
    """
    if isinstance(value, dict):
        return value
    return default


def safe_get_list(value: Any, default: list = []) -> list:
    """
    Ensures the returned value is a list; otherwise returns the default.
    """
    if isinstance(value, list):
        return value
    return default


def map_company_data_to_profile(data: DueDiligenceResult | None) -> DueDiligenceCompanyProfile:
    if data:
        profile = data.profile

        kwargs = dict(
            name=profile.get("company_name", ""),
            status=profile.get("status", "Not Available"),
            url=data.url or "",
            founded=empty_str_to_none(str(profile.get("founded"))),
            founder=profile.get("founder") or "",
            address=replace_none_with_empty(safe_get_dict(profile.get("address"))),
            risk_level=empty_str_to_none(str(profile.get("risk_level_int"))),
            description=profile.get("description") or "",
            key_individuals=replace_none_with_empty(safe_get_dict(profile.get("key_individuals"))),
            security_risk=replace_none_with_empty(safe_get_dict(profile.get("security_risks"))),
            financial_risk=replace_none_with_empty(safe_get_dict(profile.get("financial_risks"))),
            operational_risk=replace_none_with_empty(safe_get_dict(profile.get("operational_risks"))),
            key_relationships=replace_none_with_empty(safe_get_dict(profile.get("key_relationships"))),
            summary=profile.get("summary") or "",
            metadata=replace_none_with_empty(profile.get("metadata", {})),
            last_revision=(
                data.last_updated.isoformat()
                if isinstance(data.last_updated, datetime)
                else str(data.last_updated) or datetime.now().isoformat()
            ),
            due_diligence_timestamp=(
                data.started.isoformat()
                if isinstance(data.started, datetime)
                else str(data.started) or datetime.now().isoformat()
            ),
            logs=replace_none_with_empty(safe_get_list(data.logs)),
        )

        return DueDiligenceCompanyProfile(**kwargs)
    
    return None
