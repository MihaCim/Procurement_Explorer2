# Importing the json module to handle JSON data
import json, re
import xml.etree.ElementTree as ET

from collections.abc import Mapping, Sequence

# Importing ElementTree from the xml.etree package to handle XML data creation


class CompanyData:
    def __init__(self):
        # Initializing the company data fields with default values
        self.company_name = ""
        self.founded = ""
        self.founder = ""
        self.description = ""
        self.key_individuals = {}  # Dictionary to store key people and their details
        self.security_risks = {}  # Dictionary to store security risks and references
        self.financial_risks = {}  # Dictionary to store financial risks and references
        self.key_relationships = {}  # Dictionary to store political/external relationships and their details
        self.operational_risks = {}  # Dictionary to store operational risks and references
        self.address = {}  # Dictionary to store address details
        self.risk_level = {}  # Dictionary to store risk level and argumentation
        self.risk_level_int = None  # The int value for Risk level
        self.summary = ""  # The final summary of risk profile

    async def update_company_name(self, name: str) -> str:
        """
        Updates the company name.

        Parameters:
        name (str): The new name of the company.

        Returns:
        str: Confirmation message with the updated company name.
        """
        self.company_name = name
        return f"Company name updated to: {name}"

    async def update_founded(self, year: str) -> str:
        """
        Updates the year the company was founded.

        Parameters:
        year (str): The year the company was founded (e.g., '2017').

        Returns:
        str: Confirmation message with the updated founding year.
        """
        self.founded = year
        return f"Founded year updated to: {year}"

    async def update_founder(self, founder: str) -> str:
        """
        Updates the founder's information.

        Parameters:
        founder (str): The name of the founder of the company.

        Returns:
        str: Confirmation message with the updated founder information.
        """
        self.founder = founder
        return f"Founder updated to: {founder}"

    async def update_description(self, description: str) -> str:
        """
        Updates the description of the company, making a general company profiles with services and technologies they offer
        and general description. Make sure not to lose information - only append new additional information to existing description.
        Include also all the number, names, links and other details available.

        Parameters:
        description (str): A brief description of the company's focus and operations.

        Returns:
        str: Confirmation message with the updated company description.
        """
        self.description = description
        return f"Description updated to: {description}"

    async def update_key_individual(
        self, person_name: str, details: dict[str, str | int]
    ) -> str:
        """
        Updates information about a key individual in the company that present potential risk.
        Make sure not to lose information from existing description.Include also all the number, names, links and other details available.

        Parameters:
        person_name (str): The name of the key individual (e.g., 'John Doe').
        details (dict): A dictionary containing details about the individual. It should include:
            - description (str): The individual's role within the company and his activity and relations that pose threat (e.g., 'Chairman of the Board of Directors').
            - critical project: list any potential ptohject or technology that could present security risk for defence procurement
            - other relevant details (e.g., 'since': '2017', 'sanctions': 'None').

        Returns:
        str: Confirmation message with the added or updated key individual details.
        """
        self.key_individuals[person_name] = details
        return f"Key individual added/updated: {person_name}"

    async def update_security_risk(self, risk: str, ref: str) -> str:
        """
        Updates information on security risk for working with the company. Check if company is on any of sanctions list,
        or is working with companies, organization, individuals, or governments, that could present security risk.
        Make sure not to lose information from existing description.Include also all the number, names, links and other details available.


        Parameters:
        risk (str): A brief description of the security risk (e.g., 'Sanctions under Executive Order 14024').
        ref (str): A reference to the source of the information (e.g., 'US Treasury press release or URL of source').

        Returns:
        str: Confirmation message with the added security risk and reference.
        """
        self.security_risks[risk] = ref
        return f"Security risk added: {risk} with reference: {ref}"

    async def add_financial_risk(self, risk: str, ref: str) -> str:
        """
        Adds or updates a financial risk for the company. Information related to any risky capital connections, legal issues or regulative issues.
        Make sure not to lose information from existing description.Include also all the number, names, links and other details available.

        Parameters:
        risk (str): A brief description of the financial risk (e.g., 'Capital conneciton to Banks under russian authoriy.').
        ref (str): A reference to the source of the information (e.g., 'URL of the source or document name.').

        Returns:
        str: Confirmation message with the added financial risk and reference.
        """
        self.financial_risks[risk] = ref
        return f"Financial risk added: {risk} with reference: {ref}"

    async def update_operational_risk(self, risk: str, ref: str) -> str:
        """
        Updates all projects and activities related to executing the defence procurement and critical issues
        (such as regulatory compliance, etc) that present risk in procurement.
        Make sure not to lose information from existing description.Include also all the number, names, links and other details available.


        Parameters:
        risk (str): A brief description of the operational risk (e.g., 'Risk of not delivering on time. Risk of low
        quality due to missing quality standards').
        ref (str): A reference to the source of the information (e.g., 'URL of the source or document name.').

        Returns:
        str: Confirmation message with the added financial risk and reference.
        """
        self.operational_risks[risk] = ref
        return f"Operational risk added: {risk} with reference: {ref}"

    async def update_risk_level(self, risk_level: int, summary: str) -> str:
        """
        the method updates an assesment of final risk level of the company. The values are on the scale from 1 to 5,
        where 5 is extreme risk (sanctioned company or key people), 4 is high likelihood or risk, 3 medium risk or
        difficult to evaluate, 2 high likelihood and potentially good supplier, 1 is No detected risk and very reliable supplier
        summary (str): A description and the root cause for the risk level assessment. Make it verbose and detailed
        including the reasoning behind the assessment.

        Parameters:s
        risk level (int): 1 - Extreme risk
        summary (str): This company presents extreme risk for procurement process since it is listed as sanctioned on US sanction list.

        Returns:
        str: Confirmation message with the added risk_level and summary.
        """
        self.risk_level[risk_level] = summary
        return f"Risk Level added: {risk_level} with description: {summary}"

    async def update_risk_level_int(self, level: int) -> str:
        """
        Updates the final estimation of risk level. The values are on the scale from 1 to 5,
        where 5 is extreme risk (sanctioned company or key people), 4 is high likelihood or risk, 3 medium risk or
        difficult to evaluate, 2 high likelihood and potentially good supplier, 1 is No detected risk and very reliable supplier

        Parameters:
        level (int): An numerical value of estimated final risk (e.g., 1).

        Returns:
        str: Confirmation message with numerical value of risk level.
        """
        self.risk_level_int = level
        return f"Risk level numerical value added: {level}."

    async def add_key_relationships(
        self, relationship_name: str, details: dict[str, str | int]
    ) -> str:
        """
        Adds or updates a political or external relationships of the company to the country, organization, people that could present security risk.
        This includes all essential cooperation and partnerships even if no direct security thread is exposed.
        Make sure not to lose information from existing description.Include also all the number, names, links and other details available.


        Parameters:
        relationship_name (str): The name of the political or external entity (e.g., a country or organization, or a person).
        details (dict): A dictionary containing details about the relationship. It can include:
            - description (str): description of the type of entity and key activities.
            - connection (str): The nature of the connection (e.g., 'Supplier').
            - sanctioned (str): Whether this relationship is sanctioned or not (e.g., 'Yes' or 'No').

        Returns:
        str: Confirmation message with the added or updated relationship details.
        """
        self.key_relationships[relationship_name] = details
        return f"Key_relationships added/updated: {relationship_name}"

    async def add_address(self, street: str, city: str, country: str) -> str:
        """
        Adds or updates the address of the company.

        Parameters:
        street (str): The street address.
        city (str): The city where the company is located.
        country (str): The country where the company is located.

        Returns:
        str: Confirmation message with the updated address.
        """
        self.address = {"street": street, "city": city, "country": country}
        return f"Address updated: {street}, {city}, {country}"

    async def update_summary(self, summary: str) -> str:
        """
        Updates final summary of company risk profile. Add all critical information and key reasoning behind each conclusion nad assesment.
        Make sure not to lose information - only append new additional information to existing description.
        Include also all the number, names, links and other details available.
        Make the summary very verbose and informational, including causalities, key entities related and future potential impact in case of cooperation.

        Parameters:
        name (str): Summary of risk profile.

        Returns:
        str: Confirmation message with the updated company name.
        """
        self.summary = summary
        return f"Company name updated to: {summary}"

    async def read_company_data(self) -> str:
        """
        Retrieves the current company data in XML format. Use this to figure out missing data.

        Returns:
        str: The XML string of the company's current data.
        """
        return self.to_xml()

    def to_json(self) -> str:
        """
        Converts the current company data to JSON format.

        Returns:
        str: A JSON string representation of the company data.
        """
        # Creating a dictionary with all the current company data
        data = {
            "company_name": self.company_name,
            "founded": self.founded,
            "founder": self.founder,
            "address": self.address,
            "description": self.description,
            "key_individuals": self.key_individuals,
            "security_risks": self.security_risks,
            "financial_risks": self.financial_risks,
            "operational_risks": self.operational_risks,
            "key_relationship": self.key_relationships,
            "risk_level": self.risk_level,
            "risk_level_int": self.risk_level_int,
            "description": self.summary,
        }
        # Returning the dictionary as a formatted JSON string
        return json.dumps(data, indent=4)

    # def to_xml(self) -> str:
    #     """
    #     Converts the current company data to XML format.

    #     Returns:
    #     str: An XML string representation of the company data.
    #     """
    #     root = ET.Element("company_data")

    #     # Adding child elements for basic company details
    #     ET.SubElement(root, "company_name").text = self.company_name
    #     ET.SubElement(root, "founded").text = self.founded
    #     ET.SubElement(root, "founder").text = self.founder
    #     ET.SubElement(root, "Due Diligence Analysis").text = self.description

    #     # Adding address
    #     if self.address:
    #         address_element = ET.SubElement(root, "address")
    #         ET.SubElement(address_element, "street").text = self.address.get(
    #             "street", ""
    #         )
    #         ET.SubElement(address_element, "city").text = self.address.get("city", "")
    #         ET.SubElement(address_element, "country").text = self.address.get(
    #             "country", ""
    #         )

    #     # Adding key individuals
    #     key_individuals_element = ET.SubElement(root, "key_individuals")
    #     for person_name, details in self.key_individuals.items():
    #         person_element = ET.SubElement(
    #             key_individuals_element, "person", name=person_name
    #         )
    #         for key, value in details.items():
    #             ET.SubElement(person_element, key).text = str(value)

    #     # Adding security risks
    #     security_risks_element = ET.SubElement(root, "security_risks")
    #     for risk, ref in self.security_risks.items():
    #         risk_element = ET.SubElement(security_risks_element, "risk", ref=ref)
    #         risk_element.text = risk

    #     # Adding financial risks
    #     financial_risks_element = ET.SubElement(root, "financial_risks")
    #     for risk, ref in self.financial_risks.items():
    #         risk_element = ET.SubElement(financial_risks_element, "risk", ref=ref)
    #         risk_element.text = risk

    #     # Adding operational_risks
    #     operational_risk_element = ET.SubElement(root, "operational_risks")
    #     for risk, ref in self.operational_risks.items():
    #         risk_element = ET.SubElement(operational_risk_element, "risk", ref=ref)
    #         risk_element.text = risk

    #     # Adding key relationships
    #     key_relationships_element = ET.SubElement(root, "key_relationships")
    #     for relationship, details in self.key_relationships.items():
    #         rel_element = ET.SubElement(
    #             key_relationships_element, "key_relationship", name=relationship
    #         )
    #         for key, value in details.items():
    #             ET.SubElement(rel_element, key).text = str(value)

    #     # TODO: handle exception where items:str - enforce a dict response
    #     # Adding Risk Level
    #     risk_levels_element = ET.SubElement(root, "risk_level")
    #     for risk_level, details in self.risk_level.items():
    #         if isinstance(details, dict):
    #             level_element = ET.SubElement(
    #                 risk_levels_element, "risk_level", name=risk_level
    #             )
    #             for key, value in details.items():
    #                 ET.SubElement(level_element, key).text = str(value)
    #         else:
    #             ET.SubElement(
    #                 risk_levels_element, "risk_level"
    #             ).text = f"{risk_level}: {details}"

    #     # Returning the XML as a string
    #     return ET.tostring(root, encoding="unicode", method="xml")

    def to_xml(self, pretty: bool = False) -> str:
        root = ET.Element(self.__class__.__name__.lower())
        for attr, val in vars(self).items():
            self._build_xml(root, attr, val)

        xml_str = ET.tostring(root, encoding="unicode")
        if pretty:
            from xml.dom import minidom
            xml_str = minidom.parseString(xml_str).toprettyxml(indent="  ")
        return xml_str
    

    def _build_xml(self, parent: ET.Element, tag: str, value):
        def _make_tag(s: str) -> str:
            s = re.sub(r'\s+', '_', s)
            s = re.sub(r'[^A-Za-z0-9_.-]', '', s)
            if re.match(r'^[0-9\-]', s):
                s = f'_{s}'
            return s or "item"

        tag = _make_tag(tag)

        if isinstance(value, Mapping):
            elem = ET.SubElement(parent, tag)
            if value:
                for k, v in value.items():
                    self._build_xml(elem, _make_tag(str(k)), v)

        elif isinstance(value, Sequence) and not isinstance(value, (str, bytes, bytearray)):
            elem = ET.SubElement(parent, tag)
            if value:
                for item in value:
                    self._build_xml(elem, "item", item)

        else:
            elem = ET.SubElement(parent, tag)
            if value is not None:
                elem.text = str(value)
        
    