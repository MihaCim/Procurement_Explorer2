import json
import os
from typing import Literal, Dict, List
from typing import Optional
from pathlib import Path
from datetime import datetime
from ..models.models import CompanyProfile, DueDiligenceProfile


def parse_company_profile(json_data: Dict, idx: int) -> [CompanyProfile, str]:
    # Extract data from nested fields
    data = json_data.get("data", {})
    short_profile = json_data.get("short_profile", {})

    # Function to safely get values with defaults
    def get_value(dictionary, key, default):
        return dictionary[key] if key in dictionary else default

    # Parse contact information (from 'data' and 'short_profile')
    contact_info = {
        "data_contact": get_value(data, "Contact_Information", "N/A"),  # Default to "N/A" if missing
        "short_profile_contact": get_value(short_profile, "Contact_Information", "N/A")  # Default to "N/A" if missing
    }

    # Create a dictionary that will map to CompanyProfile fields
    parsed_data = {
        "name": get_value(json_data, "name", "Unknown Company"),  # Default to "Unknown Company"
        "country": get_value(json_data, "country", "Unknown Country"),  # Default to "Unknown Country"
        "industry": get_value(data, "Industry", "Unknown Industry") or get_value(short_profile, "Industry", "Unknown Industry"),  # Default to "Unknown Industry"
        "subindustries": [
            get_value(data, "SubIndustry", "General") or get_value(short_profile, "SubIndustry", "General")
        ],  # Default to "General"
        "contact_information": contact_info,
        "products_portfolio": [
            get_value(data, "Products_Portfolio", "No Products") or get_value(short_profile, "Products_Portfolio", "No Products")
        ],  # Default to "No Products"
        "service_portfolio": [
            get_value(data, "Service_Portfolio", "No Services") or get_value(short_profile, "Service_Portfolio", "No Services")
        ],  # Default to "No Services"
        "specific_tools_and_technologies": [
            get_value(data, "Specific_Tools_and_Technologies", "No Tools") or get_value(short_profile, "Specific_Tools_and_Technologies", "No Tools")
        ],  # Default to "No Tools"
        "specializations": [
            get_value(data, "Specializations", "None") or get_value(short_profile, "Specializations", "None")
        ],  # Default to "None"
        "quality_standards": [
            get_value(data, "Quality_Standards", "No Standards") or get_value(short_profile, "Quality_Standards", "No Standards")
        ],  # Default to "No Standards"
        "company_size": get_value(data, "Company_Size", "Size Unknown") or get_value(short_profile, "Company_Size", "Size Unknown"),  # Default to "Size Unknown"
        "company_profile": get_value(data, "Company_Profile", "No Profile Available") or get_value(short_profile, "Company_Profile", "No Profile Available")  # Default to "No Profile Available"
    }

    # Set the website variable for UUID
    website = get_value(json_data, "Website", get_value(json_data, "name", f"website{idx}"))

    # Parse into the CompanyProfile model
    return CompanyProfile(**parsed_data), website

def parse_due_diligence_profile(data: dict) -> DueDiligenceProfile:
    return DueDiligenceProfile(
        name=data.get("company_name", ""),
        url=data.get("website", None),
        founded=int(data["founded"]) if "founded" in data else None,
        founder=data.get("founder", None),
        address=data.get("address", {}),
        contacts={"email":data.get("website", "")},
        country=data.get("country", None),
        risk_level=data.get("risk_level_int", None),
        description=data.get("description", None),
        key_individuals={
            "name": data["key_individuals"].get("name", ""),
            "background": data["key_individuals"].get("background", "")
        } if "key_individuals" in data else None,
        security_risk={
            "description": data.get("security_risks", "")
        },
        financial_risk={
            "description": data.get("financial_risks", "")
        },
        operational_risk={
            "description": data.get("operational_risks", "")
        },
        key_relationships={
            "description": data.get("key_relationships", "")
        },
        due_diligence_timestamp=datetime.now()
    )

@staticmethod
def get_initialization_data() -> Dict:
    path = os.getenv("POSTGREST_INITIAL_LOADING_DATA")
    with open(path) as file:
        return json.load(file)


@staticmethod
def load_dd_profiles() -> Dict:
    # Extract data from nested fields
    path = os.getenv("DD_INITIAL_LOADING_DATA")
    with open(path) as file:
       return json.load(file)

