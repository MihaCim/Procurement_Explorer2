from datetime import datetime
from typing import Dict, List, Literal, Optional
from pydantic import BaseModel, ConfigDict, Field


class CompanyProfile(BaseModel):
    Name: str = Field(default="", description="The name of the company.", alias="name")
    Country: str = Field(
        default="", description="The country of the company.", alias="country"
    )
    Industry: str = Field(
        default="", description="The industry of the company.", alias="industry"
    )
    SubIndustries: List[str] = Field(
        default=[],
        description="The sub-industries of the company.",
        alias="subindustries",
    )
    Contact_Information: Dict = Field(
        default={},
        description="Contact details of the company.",
        alias="contact_information",
    )
    Products_Portfolio: List[str] = Field(
        default=[],
        description="Product offerings of the company.",
        alias="products_portfolio",
    )
    Service_Portfolio: List[str] = Field(
        default=[],
        description="Service offerings of the company.",
        alias="service_portfolio",
    )
    Specific_Tools_and_Technologies: List[str] = Field(
        default=[],
        description="Technologies used by the company.",
        alias="specific_tools_and_technologies",
    )
    Specializations: List[str] = Field(
        default=[],
        description="Areas of specialization of the company.",
        alias="specializations",
    )
    Quality_Standards: List[str] = Field(
        default=[],
        description="Quality standards maintained by the company.",
        alias="quality_standards",
    )
    Company_Size: str = Field(
        default="", description="The size of the company.", alias="company_size"
    )
    Company_Profile: str = Field(
        default="",
        description="General profile and overview of the company.",
        alias="company_profile",
    )

    model_config = ConfigDict(
        populate_by_name=True,
    )


class Company(CompanyProfile):
    id: Optional[int] = Field(default=None, alias="id")
    Website: str = Field(alias="website")
    Status: Optional[str] = Field(default="Pending", alias="status")
    Review_Date: Optional[datetime] = Field(default=None, alias="review_date")
    Due_Diligence_Status: Optional[str] = Field(
        default="Not Available", alias="due_diligence_status"
    )
    Added_Timestamp: Optional[datetime] = Field(default=None, alias="added_timestamp")
    Risk_Level: Optional[int] = Field(default=None, alias="risk_level")
    Profile_Last_Updated: Optional[datetime] = Field(
        default=None, alias="profile_last_updated"
    )
    Due_Diligence_Last_Updated: Optional[datetime] = Field(
        default=None, alias="due_diligence_last_updated"
    )
    Description: Optional[str] = Field(default=None, alias="description")
    Verdict: Optional[str] = Field(default=None, alias="verdict")
    
    model_config = ConfigDict(populate_by_name=True)


class DueDiligenceProfile(BaseModel):
    id: Optional[int] = Field(default=None, alias="id")
    name: str = Field(default="", alias="name")
    url: Optional[str] = Field(default=None, alias="website")
    contacts: Optional[dict] = Field(default=None, alias="contacts")
    founded: Optional[int] = Field(default=None, alias="founded")
    founder: Optional[str] = Field(default=None, alias="founder")
    address: Optional[dict] = Field(default=None, alias="address")
    country: Optional[str] = Field(default=None, alias="country")
    last_revision: Optional[datetime] = Field(
        default_factory=datetime.now, alias="last_revision"
    )
    due_diligence_timestamp: Optional[datetime] = Field(
        default_factory=datetime.now, alias="due_diligence_timestamp"
    )
    risk_level: Optional[int] = Field(default=None, alias="risk_level")
    description: Optional[str] = Field(default=None, alias="description")
    key_individuals: Optional[dict] = Field(default=None, alias="key_individuals")
    security_risk: Optional[dict] = Field(default=None, alias="security_risk")
    financial_risk: Optional[dict] = Field(default=None, alias="financial_risk")
    operational_risk: Optional[dict] = Field(default=None, alias="operational_risk")
    key_relationships: Optional[dict] = Field(default=None, alias="key_relationships")
    status: Optional[str] = Field(default=None, alias="status")
    metadata: Optional[dict] = Field(default=None, alias="metadata")
    logs: List[dict] = Field(default=None, alias="logs")

    model_config = ConfigDict(populate_by_name=True)


class DocumentProfile(BaseModel):
    Industry: str = Field(
        default="", description="Industry related to the document.", alias="industry"
    )
    SubIndustries: List[str] = Field(
        default=[],
        description="Sub-industries related to the document.",
        alias="subindustries",
    )
    Products: str = Field(
        default="", description="Products mentioned in the document.", alias="products"
    )
    Services: str = Field(
        default="", description="Services mentioned in the document.", alias="services"
    )
    Criteria: list = Field(
        default=[], description="Criteria mentioned in the document.", alias="criteria"
    )
    Suitable_Company: str = Field(
        default="",
        description="Description of the ideal company profile based on the document.",
        alias="suitable_company",
    )
    model_config = ConfigDict(
        populate_by_name=True,
    )


allowed_fields = Literal[
    "identity_id",
    "full_name",
    "first_name",
    "last_name",
    "vessel_name",
    "birthdate",
    "place_of_birth",
    "country",
    "city",
    "id_number",
]

allowed_country_fields = Literal["eu", "us"]


class SanctionsCheckRequest(BaseModel):
    country: allowed_country_fields
    field: allowed_fields
    value: str


class SanctionsUSDetails(BaseModel):
    id: Optional[int]
    identity_id: Optional[str]
    entity_type: Optional[str]
    entity_type_ref_id: Optional[str]
    sanctions_list: Optional[str]
    sanctions_list_ref_id: Optional[str]
    sanctions_list_id: Optional[str]
    sanctions_list_date_published: Optional[str]
    sanctions_program: Optional[str]
    sanctions_program_ref_id: Optional[str]
    sanctions_program_id: Optional[str]
    full_name: Optional[str]
    first_name: Optional[str]
    last_name: Optional[str]
    vessel_name: Optional[str]
    birthdate: Optional[str]
    gender: Optional[str]
    place_of_birth: Optional[str]
    vessel_flag: Optional[str]
    vessel_type: Optional[str]
    secondary_sanctions_risk: Optional[str]
    country: Optional[str]
    country_ref_id: Optional[str]
    city: Optional[str]
    id_type: Optional[str]
    id_type_ref_id: Optional[str]
    id_number: Optional[str]
    id_country: Optional[str]
    id_country_ref_id: Optional[str]
    relationship_type: Optional[str]
    relationship_type_ref_id: Optional[str]
    related_entity: Optional[str]
    related_entity_id: Optional[str]


class SanctionsResponse(BaseModel):
    is_sanctioned: bool
    details: Optional[list[SanctionsUSDetails]]


class CompanyInput(BaseModel):
    website: str
