from datetime import datetime
from typing import List, Optional, Any
from pydantic import BaseModel, Field
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


def map_company_data_to_profile(data: DueDiligenceResult | None) -> DueDiligenceCompanyProfile:
    
    if data:
        profile = data.profile
    
        kwargs = dict(
            name=profile.get("company_name", None),
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

# def _process_jsonb_value(value: Any, target_pydantic_type: type) -> Any:
#     """
#     Helper to process values coming from JSONB fields to conform to Pydantic types.
#     - Converts empty dicts `{}` to `None` for dict fields or `[]` for list fields.
#     - Attempts to `json.loads` strings if the target type is dict or list.
#     """
#     # Handle `None` explicitly first
#     if value is None:
#         return None

#     # Case 1: Value is an empty dictionary {}
#     if isinstance(value, dict) and not value:
#         if target_pydantic_type is list:
#             return None

#     # Case 2: Value is a string, attempt to parse if target is dict or list
#     if isinstance(value, str):
#         try:
#             parsed_value = json.loads(value)
#             # Ensure parsed value matches the expected target Pydantic type
#             if (target_pydantic_type is dict and isinstance(parsed_value, dict)) or \
#                (target_pydantic_type is list and isinstance(parsed_value, list)):
#                 return parsed_value
#         except json.JSONDecodeError:
#             # It's a string, but not valid JSON, so Pydantic will handle
#             # validation based on the original type hint if it's not a string field.
#             pass
    
#     # Case 3: Value is already in the correct Python type (dict, list) or a non-JSON string
#     return value

