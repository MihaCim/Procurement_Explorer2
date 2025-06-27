# Importing the json module to handle JSON data
import json, re
import xml.etree.ElementTree as ET
from collections.abc import Mapping, Sequence
# Importing ElementTree from the xml.etree package to handle XML data creation


class PersonData:
    def __init__(self):
        # Initializing the company data fields with default values
        self.name = ""
        self.nationality = ""
        self.education = ""
        self.key_work = {}  # Key work experiences, employments and carrer path
        self.security_risks = {}  # Potential data leckagage 
        self.financial_risks = {}  # Susceptibility to coruption and financial influence
        self.key_relationships = {}  # Key companies and people that person has relationships with
        self.behavioural_type = {}  # Behavioral charasteristics
        self.political_views = {}  # Political affiliations and views
        self.legal_risk = {}  # Dictionary to store risk level and argumentation
        self.risk_level = None  # Estimated final risk level
        self.summary = ""  # The final summary of personal profile

    async def update_name(self, name: str) -> str:
        """
        Updates the name.

        Parameters:
        name (str): The new name.

        Returns:
        str: Confirmation message with the last name updated.
        """
        self.name = name
        return f"Name updated to: {name}"

    async def update_nationality(self, year_place: str) -> str:
        """
        Updates the year and place of the birth, including nationality.

        Parameters:
        year_place (str): The year and place of the birth (e.g., '2017, Ljublana, Slovenia').

        Returns:
        str: Confirmation message with the updated birth place and time.
        """
        self.nationality = year_place
        return f"Born on: {year_place}"

    async def update_education(self, education: str) -> str:
        """
        Updates the education information.

        Parameters:
        education (str): A list of all educations and key competences.

        Returns:
        str: Confirmation message with the updated education information.
        """
        self.education = education
        return f"Founder updated to: {education}"

    async def update_key_work(self, key_work: str) -> str:
        """
        Updates the description with a list of all work experiences. Including also key projects, technologies, companies and stakeholders
        (such as governmetns and or political parites included).
        Include also all the number, names, links and other details available.

        Parameters:
        key_work (str): A list of objects each including detailed description individual work experience and references.

        Returns:
        str: Confirmation message with the updated key_work description.
        """
        self.key_work = key_work
        return f"Key_work updated to: {key_work}"

    async def update_key_relationships(
        self, person_name: str, details: dict[str, str | int]
    ) -> str:
        """
        Updates information about a key people and companies, governments, organization that this person has connections to.
        Make sure not to lose information from existing description.Include also all the number, names, links and other details available.

        Parameters:
        name (str): The name of the key individual or organization (e.g., 'John Doe').
        details (dict): A dictionary containing details about the individual. It should include:
            - description: description of this person/organization.
            - type of relatinship (str): What is the nature of this relatinships, based on which coooperation or events.
            - other relevant details (e.g., 'since': '2017', 'sanctions': 'None').

        Returns:
        str: Confirmation message with the added or updated key individual details.
        """
        self.key_relationships[person_name] = details
        return f"Key individual added/updated: {person_name}"

    async def update_security_risk(self, risk: str, ref: str) -> str:
        """
        Updates information on security risk for working this person. Check if company is on any of sanctions list,
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
        Adds or updates a financial risk. Information related to any risky capital connections, legal issues or regulative issues.
        Make sure not to lose information from existing description.Include also all the number, names, links and other details available.

        Parameters:
        risk (str): A brief description of the financial risk (e.g., 'Capital conneciton to Banks under russian authoriy.').
        ref (str): A reference to the source of the information (e.g., 'URL of the source or document name.').

        Returns:
        str: Confirmation message with the added financial risk and reference.
        """
        self.financial_risks[risk] = ref
        return f"Financial risk added: {risk} with reference: {ref}"
    
    async def add_legal_risk(self, risk: str, ref: str) -> str:
        """
        Adds or updates a legal risk. Information related to any risky capital connections, legal issues or regulative issues.
        Make sure not to lose information from existing description.Include also all the number, names, links and other details available.

        Parameters:
        risk (str): Description of the legal risk (e.g., 'Legal law suits open, preocesuted, issues with ilegal projects, business, etc..').
        ref (str): A reference to the source of the information (e.g., 'URL of the source or document name.').

        Returns:
        str: Confirmation message with the added legal risk and reference.
        """
        self.legal_risk[risk] = ref
        return f"Financial risk added: {risk} with reference: {ref}"

    async def update_behavioural_type(self, behavioural_type: dict[str, str],) -> str:
        """
        Updates behaioural profile description
        Make sure not to lose information from existing description.Include also all the number, names, links and other details available.


        Parameters:
        behavioural_type (dict): {
        Description(str): detailed description of behavioural profile, such as: 
        - level of risk taking / risk averse
        - key competences and skills
        - pychological profile
        - integrity and compliance
        ref (str): A references to the sources of the information (e.g., 'URL of the source or document name.').
        }

        Returns:
        str: Confirmation message with the added behavioural profile.
        """
        self.behavioural_type = behavioural_type
        return f"behavioural profile added: {behavioural_type}"

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

    # async def update_risk_level_int(self, level: int) -> str:
    #     """
    #     Updates the final estimation of risk level. The values are on the scale from 1 to 5,
    #     where 5 is extreme risk (sanctioned company or key people), 4 is high likelihood or risk, 3 medium risk or
    #     difficult to evaluate, 2 high likelihood and potentially good supplier, 1 is No detected risk and very reliable supplier

    #     Parameters:
    #     level (int): An numerical value of estimated final risk (e.g., 1).

    #     Returns:
    #     str: Confirmation message with numerical value of risk level.
    #     """
    #     self.risk_level_int = level
    #     return f"Risk level numerical value added: {level}."

    async def update_political_views(self, politics: str, details: str) -> str:

        """
        Adds or updates a political or external relationships, views and political afinities.
        This any relatins or expressed afinities to political, governmental, ideological views.
        Make sure not to lose information from existing description.Include also all the number, names, links and other details available.


        Parameters:
        politics (str): The name of the political or external entity (e.g., a country or organization, or a person).
        details (dict): A dictionary containing details about the relationship. It can include:
            - description (str): description of the political afinities.
            
        Returns:
        str: Confirmation message with the added or updated political views.
        """
        self.key_relationships[politics] = details
        return f"political_views added/updated: {details}"

    async def update_lega_risk(self, street: str, city: str, country: str) -> str:
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
        Updates final summary of risk profile. Add all critical information and key reasoning behind each conclusion nad assesment.
        Make sure not to lose information - only append new additional information to existing description.
        Include also all the number, names, links and other details available.
        Make the summary very verbose and informational, including causalities, key entities related and future potential impact in case of cooperation.

        Parameters:
        name (str): Summary of risk profile.

        Returns:
        str: Confirmation message with the updated summary.
        """
        self.summary = summary
        return f"Summary updated: {summary}"

    async def read_data(self) -> str:
        """
        Retrieves the current profile data in XML format. Use this to figure out missing data.

        Returns:
        str: The XML string of the profile's current data.
        """
        data = self.to_xml()
        print("XML data profile:", data)
        return data

    def to_json(self) -> str:
        """
        Converts the current company data to JSON format.

        Returns:
        str: A JSON string representation of the company data.
        """
        # Creating a dictionary with all the current company data
        data = {
            "name": self.name,
            "nationality": self.nationality,
            "education": self.education,
            "key_work": self.key_work,
            "security_risks": self.security_risks,
            "financial_risks": self.financial_risks,
            "key_relationships": self.key_relationships,
            "behavioural_type": self.behavioural_type,
            "political_views": self.political_views,
            "legal_risk": self.legal_risk,
            "risk_level": self.risk_level,
            "summary": self.summary,
        }
        # Returning the dictionary as a formatted JSON string
        return json.dumps(data, indent=4)


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
        
 