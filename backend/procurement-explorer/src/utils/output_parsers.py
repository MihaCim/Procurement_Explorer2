import re
from datetime import datetime

from bson import ObjectId
import json

def parse_document_profile(input_text) -> dict:
    """
    Parse the input text using regular expressions.
    """

    def _parse_criteria_regex(criteria_text: str) -> list[str]:
        """
        Parse the criteria text using regular expressions.
        This function is a helper function to extract the criteria from the input text.
        """
        criteria_pattern = r"\d+\.\s*(.*?)(?=\n\d+\.|\Z)"
        criteria_matches = re.findall(criteria_pattern, criteria_text, re.DOTALL)
        criteria = [
            criterion.strip().replace("\n", " ") for criterion in criteria_matches
        ]
        return criteria

    # Regex patterns to capture the various sections
    industry_pattern = r"Industry:\s*(.*?)\n"
    subindustry_pattern = r"SubIndustries:\s*(.*?)\n"
    product_pattern = r"Products:\s*(.*?)\n"
    service_pattern = r"Services:\s*(.*?)\n"
    criteria_pattern = r"Criteria:(.*?)\n\n"
    ideal_company_pattern = r"Company Profile:(.*)"

    # Initialize the parsed data dictionary
    parsed_data = {
        "Industry": "",
        "SubIndustries": "",
        "Products": "",
        "Services": "",
        "Criteria": [],
        "Suitable_Company": "",
    }

    # Extract and assign the industry
    industry_match = re.search(industry_pattern, input_text, re.DOTALL)
    if industry_match:
        parsed_data["Industry"] = industry_match.group(1).strip()

    # Extract and assign the subindustry
    subindustry_match = re.search(subindustry_pattern, input_text, re.DOTALL)
    if subindustry_match:
        parsed_data["SubIndustries"] = subindustry_match.group(1).strip()
        parsed_data["SubIndustries"] = parsed_data["SubIndustries"].split(",")
        parsed_data["SubIndustries"] = [x.strip() for x in parsed_data["SubIndustries"]]
    # Extract and assign the products and services
    product_match = re.search(product_pattern, input_text, re.DOTALL)
    if product_match:
        parsed_data["Products"] = product_match.group(1).strip()

    service_match = re.search(service_pattern, input_text, re.DOTALL)
    if service_match:
        parsed_data["Services"] = service_match.group(1).strip()
    # Extract and assign the criteria
    criteria_section_text_match = re.search(criteria_pattern, input_text, re.DOTALL)
    if criteria_section_text_match:
        criteria_section_text = criteria_section_text_match.group(1).strip()
        parsed_data["Criteria"] = _parse_criteria_regex(criteria_section_text)

    # Extract and assign the ideal company profile
    suitable_company_match = re.search(ideal_company_pattern, input_text, re.DOTALL)
    if suitable_company_match:
        parsed_data["Suitable_Company"] = (
            suitable_company_match.group(1).strip().replace("\n", " ")
        )

    return parsed_data


def parse_company_profile(input_text: str) -> dict:
    """
    Parse the provided text using regular expressions to extract key details about the company.
    Text is expected to be in a specific format with sections separated by specific headers generated by LLM.
    Response formats are defined in the prompt template.
    """  # noqa: E501
    # Clean the input text by removing unwanted characters
    input_text = input_text.replace("*", "").replace("-", "")

    # Define regex patterns for each section
    name_pattern = r"Name:\s*(.*?)\s*Country:"
    country_pattern = r"Country:\s*(.*?)\s*Industry:"
    industry_pattern = r"Industry:\s*(.*?)\s*SubIndustries:"
    subindustry_pattern = r"SubIndustries:\s*(.*?)\s*Contact Information:"
    # location_pattern = r"Location:\s*(.*?)\n"
    contact_pattern = r"Contact Information:\s*(.*?)\s*Products Portfolio:"
    products_pattern = r"Products Portfolio:\s*(.*?)\s*Service Portfolio:"
    service_pattern = r"Service Portfolio:\s*(.*?)\s*Specific Tools and Technologies:"
    technologies_pattern = r"Specific Tools and Technologies:\s*(.*?)\s*Specializations:"
    specializations_pattern = r"Specializations:\s*(.*?)\s*Quality Standards:"
    quality_standards_pattern = r"Quality Standards:\s*(.*?)\s*Company Size:"
    company_size_pattern = r"Company Size:\s*(.*?)\s*Company Profile:"
    company_profile_pattern = r"Company Profile:(.*)"

    # Initialize the dictionary to hold the parsed data
    parsed_data = {
        "Name": "",
        "Country": "",
        "Industry": "",
        "SubIndustries": "",
        # "Location": "",
        "Contact_Information": "",
        "Products_Portfolio": "",
        "Service_Portfolio": "",
        "Specific_Tools_and_Technologies": "",
        "Specializations": "",
        "Quality_Standards": "",
        "Company_Size": "",
        "Company_Profile": "",
    }

    # Helper function to search and assign data
    def search_and_assign(pattern, key,as_array=False):
        match = re.search(pattern, input_text, re.DOTALL)
        if match:
            parsed_data[key] = match.group(1).strip()
            if as_array:
                parsed_data[key] = parsed_data[key].split(",")
                parsed_data[key] = [x.strip() for x in parsed_data[key]]

    # Execute the search and assign operations for each field
    search_and_assign(name_pattern, "Name")
    search_and_assign(country_pattern, "Country")
    search_and_assign(industry_pattern, "Industry")
    search_and_assign(subindustry_pattern, "SubIndustries",True)
    
    # search_and_assign(location_pattern, "Location")
    search_and_assign(contact_pattern, "Contact_Information")
    try:
        parsed_data["Contact_Information"] = json.loads(parsed_data["Contact_Information"])
    except Exception as e:
        print(e)
        parsed_data["Contact_Information"] = {}
    search_and_assign(products_pattern, "Products_Portfolio",True)
    search_and_assign(service_pattern, "Service_Portfolio",True)
    search_and_assign(technologies_pattern, "Specific_Tools_and_Technologies",True)
    search_and_assign(specializations_pattern, "Specializations",True)
    search_and_assign(quality_standards_pattern, "Quality_Standards",True)
    search_and_assign(company_size_pattern, "Company_Size")
    search_and_assign(company_profile_pattern, "Company_Profile")

    return parsed_data


async def mongo_to_json_serializable(obj):
    if isinstance(obj, dict):
        return {k: await mongo_to_json_serializable(v) for k, v in obj.items()}
    elif isinstance(obj, list):
        return [await mongo_to_json_serializable(v) for v in obj]
    elif isinstance(obj, ObjectId):
        return str(obj)
    elif isinstance(obj, datetime):
        return obj.isoformat()
    else:
        return obj
