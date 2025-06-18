# Load configurations
NAICS_SECTORS = [
    "Agriculture, Forestry, Fishing and Hunting",
    "Mining, Quarrying, and Oil and Gas Extraction",
    "Utilities",
    "Construction",
    "Manufacturing",
    "Wholesale Trade",
    "Retail Trade",
    "Transportation and Warehousing",
    "Information",
    "Finance and Insurance",
    "Real Estate and Rental and Leasing",
    "Professional, Scientific, and Technical Services",
    "Management of Companies and Enterprises",
    "Administrative and Support and Waste Management and Remediation Services",
    "Educational Services",
    "Health Care and Social Assistance",
    "Arts, Entertainment, and Recreation",
    "Accommodation and Food Services",
    "Other Services (except Public Administration)",
    "Public Administration",
]

NAICS_SUBSECTORS = [
    # Manufacturing
    "Food Manufacturing",
    "Beverage and Tobacco Product Manufacturing",
    "Textile Mills",
    "Textile Product Mills",
    "Apparel Manufacturing",
    "Leather and Allied Product Manufacturing",
    "Wood Product Manufacturing",
    "Paper Manufacturing",
    "Printing and Related Support Activities",
    "Petroleum and Coal Products Manufacturing",
    "Chemical Manufacturing",
    "Plastics and Rubber Products Manufacturing",
    "Nonmetallic Mineral Product Manufacturing",
    "Primary Metal Manufacturing",
    "Fabricated Metal Product Manufacturing",
    "Machinery Manufacturing",
    "Computer and Electronic Product Manufacturing",
    "Electrical Equipment, Appliance, and Component Manufacturing",
    "Transportation Equipment Manufacturing",
    "Furniture and Related Product Manufacturing",
    "Miscellaneous Manufacturing",
    # Professional, Scientific, and Technical Services
    "Legal Services",
    "Accounting, Tax Preparation, Bookkeeping, and Payroll Services",
    "Architectural, Engineering, and Related Services",
    "Specialized Design Services",
    "Computer Systems Design and Related Services",
    "Management, Scientific, and Technical Consulting Services",
    "Scientific Research and Development Services",
    "Advertising, Public Relations, and Related Services",
    "Other Professional, Scientific, and Technical Services",
    # Information
    "Publishing Industries (except Internet)",
    "Motion Picture and Sound Recording Industries",
    "Broadcasting (except Internet)",
    "Telecommunications",
    "Data Processing, Hosting, and Related Services",
    "Other Information Services",
    # Construction
    "Construction of Buildings",
    "Heavy and Civil Engineering Construction",
    "Specialty Trade Contractors",
    # Transportation and Warehousing
    "Air Transportation",
    "Rail Transportation",
    "Water Transportation",
    "Truck Transportation",
    "Transit and Ground Passenger Transportation",
    "Pipeline Transportation",
    "Scenic and Sightseeing Transportation",
    "Support Activities for Transportation",
    "Postal Service",
    "Couriers and Messengers",
    "Warehousing and Storage",
    "Other",
]

# Prompt templates
DOCUMENT_PROFILE_TEMPLATE = """
    Text Description: {doc_text}.

    Given a document text, your task is to determine the most suitable industry and subindustry based on the context.
    You will also identify key characteristics that make a company an ideal candidate for the given context and extract specific requirements from the document.
    If the document contains list of items or products that the company should provide, extract them as well.
    If the document contains list of services that the company should provide, extract them as well.
    Your analysis should culminate in a profile of the ideal company, highlighting its alignment with the industry, subindustry, and the specified criteria.
    Please follow the structured response format provided below:

    Response Structure:
    - Industry: Identify the general NAICS industry category that best aligns with the description provided in the text. Provide the name of the industry only, without including additional explanation.
    - SubIndustry: Determine the specific NAICS subindustry that accurately reflects the nuances of the text description. Provide the name of the subindustry only, without further details.
    - Products: List the type of specific products or items mentioned in the text, if any. If no products are mentioned, state 'None'.
    - Services: Enumerate the services or solutions required based on the text. If no services are mentioned, state 'None'.
    - Criteria: List the essential characteristics that qualify a company for this context, formatted as a list.
    - Company Profile: Craft a concise profile of the ideal company that explains why it stands as the most suitable candidate within the identified industry and subindustry, based on the criteria listed. Avoid mentioning any specific company names or proprietary information.

 Your analysis should be thorough, focusing on extracting relevant information from the text description to accurately categorize and evaluate the ideal company profile.
 This exercise requires a deep understanding of industry classifications and the ability to discern key business characteristics from descriptive text.
"""  # noqa: E501

DOCUMENT_PROFILE_SUMMARY_TEMPLATE = """
    Text Description: {doc_text}.
    The following text describes several parts of a company profile splited by new line.
    Given the text, your task is to summarize the industry, subindustry, products, services, criteria, and company profile.

    Please follow the structured response format provided below:

    Response Structure:
    - Industry: Identify the general NAICS industry category that best aligns with the description provided in the text. Provide the name of the industry only, without including additional explanation.
    - SubIndustry: Determine the specific NAICS subindustry that accurately reflects the nuances of the text description. Provide the name of the subindustry only, without further details.
    - Products: List the type of specific products or items mentioned in the text, if any. If no products are mentioned, state 'None'.
    - Services: Enumerate the services or solutions required based on the text. If no services are mentioned, state 'None'.
    - Criteria: List the essential characteristics that qualify a company for this context, formatted as a list.
    - Company Profile: Craft a concise profile of the ideal company that explains why it stands as the most suitable candidate within the identified industry and subindustry, based on the criteria listed. Avoid mentioning any specific company names or proprietary information.

 Your analysis should be thorough, focusing on extracting relevant information from the text description to accurately categorize and evaluate the ideal company profile.
 This exercise requires a deep understanding of industry classifications and the ability to discern key business characteristics from descriptive text.
"""  # noqa: E501

COMPANY_PROFILE_TEMPLATE = """
Objective:
    Extract key information from HTML content of a company's website specified as: '{website_text}'.
    Leave any unavailable details as blank.
    Ignore generic website information and focus on company's profile.
    Examples for generic data: Cookies, Privacy Policy, Terms of Service, etc.

You should structure your response as follows without any additional text:
    - Name: Identify the company's name.
    - Country: Identify the country where the company is based  Write the country name only.
    - Industry: Identify the general NAICS industry sectors. Write the industry sector only without code.
    - SubIndustries: Identify the NAICS subindustries. If more than one, make a comma se separated list. Write the subindustry only without code.
    - Contact Information: Find the company's email address or official contact information. Return contact information as JSON object.
    - Products Portfolio: List the company's products.
    - Service Portfolio: List the company's services.
    - Specific Tools and Technologies: Note any specific technologies and tool used by the company.
    - Specializations: Describe the company's specialized areas.
    - Quality Standards: Mention any quality standards or certifications held by the company.
    - Company Size: Estimate the number of employees. If unknown, state 'Unknown'.
    - Company Profile: Provide a detailed description of the company, including industry expertise, certifications, partners, years of operation, operational regions, and offered services and products.
    - Key people: List the key people of the company. Most important to include would be leaders, founders, C-level employees. If unknown, state 'Unknown'.

Note: If information is missing, use 'Unknown'. Responses should be in English.
"""  # noqa: E501

COMPANY_PROFILE_SUMMARY_TEMPLATE = """
Objective:
    Write company profile using provided context: {context}.
    Use additional information from {additional_context} to focus on right details.
    Ignore generic website information and focus on company's profile.

You should structure your response as follows:
    - Name: Identify the company's name.
    - Country: Identify the country where the company is based  Write the country name only.
    - Industry: Identify the general NAICS industry sectors. Write the industry sector only without code.
    - SubIndustries: Identify the NAICS subindustries. If more than one, make a comma se separated list. Write the subindustry only without code.
    - Contact Information: Provide the company's email address or official contact information. If you find multiple contacts, list them all.
    - Products Portfolio: Summarize the company's product offerings.
    - Service Portfolio: Summarize the company's service offerings.
    - Specific Tools and Technologies: List technologies and tools used by the company.
    - Specializations: Describe the company's areas of specialization and expertise.
    - Quality Standards: Mention any quality standards or certifications held by the company.
    - Company Size: Provide the number of employees. If unknown, state 'Unknown'.
    - Company Profile: Write a concise overview, covering industry expertise, quality standars,
    certifications, partners, years of operation, regions of operation and the portfolios of services and products.

If any information is unavailable, use 'Unknown'.
Responses should be in English.
Try to include as much detail as possible and do not provide examples and additional information not provided in the context.
"""  # noqa: E501
