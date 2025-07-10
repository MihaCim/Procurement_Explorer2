import { DueDiligenceLog, DueDiligenceProfile } from './DueDiligenceProfile';

export const EDDA_PROFILE = {
  name: 'Edda Luxembourg',
  url: 'www.edda.lu',
  founded: '2008',
  founder: 'Christophe Cypers (CEO)',
  address: {
    street: "3, rue de l'Industrie",
    city: 'Windhof',
    country: 'Luxembourg',
  },
  description:
    'Edda Luxembourg is an ICT company providing software development, data intelligence, and cloud solutions. Key personnel include Christophe Cypers. The company partners with Dealroom and ITnation, and collaborates with the European Parliament on projects such as digitally transforming the EU Parliament. Risks include cybersecurity threats common to the ICT sector, potential vulnerabilities due to reliance on consultants, and risks associated with handling sensitive data for the European Parliament. Further risks may stem from subcontracts or partnerships with other entities. The risk level is assessed as 3, indicating a moderate level of risk. Additional investigation should focus on the security protocols and data protection measures implemented for the European Parliament project and the vetting process for consultants and subcontractors.',
  key_individuals: {
    'Christophe Cypers': {
      description:
        'Managing Partner. Contact: christophe.cypers@edda.lu, (+352) 621 169 408',
      'critical project': 'None',
      'other relevant details': 'Managing Partner at Edda Luxembourg',
    },
  },
  security_risk: {},
  financial_risk: {},
  operational_risk: {
    'Operational risks associated with software development, data intelligence, infrastructure & cloud, enterprise content management, and experience design, including potential delays or quality issues.':
      'Company description',
  },
  key_relationships: {},
  risk_level: {},
  risk_level_int: 3,
  status: 'generated',
} as DueDiligenceProfile;

export const EDDA_LOGS: DueDiligenceLog[] = [
  {
    log: JSON.stringify({
      'agent name': 'Nora Caldwell (Researcher)',
      'agent response': `Provided initial company data for Edda Luxembourg:
<companydata> <company_name>Edda Luxembourg</company_name> <founded>2008</founded> <founder/> <description>Edda Luxembourg is an ICT company headquartered in Windhof. As of today, Edda Luxembourg has more than 100 consultants under contract. They offer expertise in software development, data intelligence, infrastructure & cloud, enterprise content management, and experience design, utilizing an end-to-end approach for client success. They provide consulting, project-based development (outsourcing via their software factory), and multidisciplinary team-led project handling. They emphasize resilient and flexible IT systems, cutting-edge data solutions, customized ECM solutions, and user-oriented design. They focus on Business Intelligence and data management.</description> <key_individuals/> <security_risks/> <financial_risks/> <key_relationships/> <operational_risks/> <address>3, rue de l'Industrie, Windhof, Luxembourg</address> <risk_level/> <risk_level_int/> <summary/></companydata>`,
    }),
    timestamp: new Date().toISOString(),
  },
  {
    log: JSON.stringify({
      'agent name': 'Julian Frost (Risk Analyst)',
      'agent response': `Okay, I have reviewed the initial company data provided by Nora. Here's my assessment and planned actions:
Assessment:
The provided data gives a good overview of Edda Luxembourg's business activities. However, several fields are missing or incomplete, particularly concerning risks, key individuals, and relationships. The risk level also needs to be determined.
Planned Actions:

Website Crawl: Attempt to extract text from the company website (www.edda.lu) again, as the previous attempt failed. This is crucial for gathering more detailed information directly from the source.
Risk Assessment:
Sanctions Search: Conduct a focused search for any sanctions, financial issues, or associations with blacklisted individuals or countries related to Edda Luxembourg.
Operational Risks: Analyze the company's activities (software development, data intelligence, etc.) to identify potential operational risks, such as project delays or quality issues.
Key Relationships: Investigate any political, operational, or other ties with sanctioned individuals or entities.
People Data: Identify and gather information on key individuals associated with Edda Luxembourg.
Update Company Data: Populate the missing fields in the company data structure with the information gathered.
Determine Risk Level: Based on the identified risks, assign an appropriate risk level.
Provide Feedback: Offer constructive feedback on the report's quality and completeness.
Record Risks: Ensure all identified risks are accurately recorded and aligned with the analysis.
Execution:
I will now execute the website crawl and searches.`,
    }),
    timestamp: new Date().toISOString(),
  },
  {
    log: JSON.stringify({
      'agent name': 'Julian Frost (Risk Analyst)',
      'agent response': `Code executed:
extract_text_from_url(url='www.edda.lu')
search_google(query='Edda Luxembourg security risks sanctions')
search_google(query='Edda Luxembourg')
extract_text_from_url(url='https://www.edda.lu/')
search_google(query='Edda Luxembourg key people')
search_google(query='Edda Luxembourg political ties')`,
    }),
    timestamp: new Date().toISOString(),
  },
  {
    log: JSON.stringify({
      'agent name': 'Evelyn Fields (Documentation Specialist)',
      'agent response': `Okay, I will now process the information and fill in the missing fields in the company data for Edda Luxembourg.
First, I need to address the missing information regarding the founding date and founder. The founding date has been updated from the initial data by Nora Caldwell with "2008" I will look for the founder's name online.
Second, I will use the search queries provided by Julian Frost to find information regarding security risks, key relationships, and operational risks. I'll start by searching for sanctions, financial issues, or associations with blacklisted individuals or countries. Then, I'll investigate potential operational risks related to their services. Finally, I will identify key individuals and their potential political or operational ties.
Third, based on the gathered information, I will assess and assign a risk level with detailed reasoning.
Here's the updated company data based on available information:
<companydata><company_name>Edda Luxembourg</company_name><founded>2008</founded><founder>Need to find online</founder><description>Edda Luxembourg is an ICT company headquartered in Windhof. As of today, Edda Luxembourg has more than 100 consultants under contract. They offer expertise in software development, data intelligence, infrastructure &amp; cloud, enterprise content management, and experience design, utilizing an end-to-end approach for client success. They provide consulting, project-based development (outsourcing via their software factory), and multidisciplinary team-led project handling. They emphasize resilient and flexible IT systems, cutting-edge data solutions, customized ECM solutions, and user-oriented design. They focus on Business Intelligence and data management.</description><key_individuals>To be determined based on search results.</key_individuals> <security_risks>To be determined based on search results.</security_risks> <financial_risks>To be determined based on search results.</financial_risks> <key_relationships>To be determined based on search results.</key_relationships> <operational_risks> <Operational_risks_associated_with_software_development_data_intelligence_infrastructure__cloud_enterprise_content_management_and_experience_design_including_potential_delays_or_quality_issues.>Risks associated with software development, data intelligence, infrastructure &amp; cloud, enterprise content management, and experience design, including potential delays or quality issues, need to be further investigated based on project details and client information. Supply chain vulnerabilities in software components and data breaches are potential concerns. Further research is needed to determine the specifics of their risk management strategies and compliance with industry standards like ISO 27001 or GDPR.</Operational_risks_associated_with_software_development_data_intelligence_infrastructure__cloud_enterprise_content_management_and_experience_design_including_potential_delays_or_quality_issues.> </operational_risks><address><street>3, rue de l'Industrie</street><city>Windhof</city><country>Luxembourg</country></address><risk_level>To be determined based on search results.</risk_level><risk_level_int>2</risk_level_int><summary>Edda Luxembourg is an ICT company offering various IT solutions. The risk level is currently set to 2, but further investigation is needed to assess security, financial, and operational risks, as well as key relationships, to provide a comprehensive risk profile.</summary></companydata>
Now I will search the web to find the founder of the company and update information to other missing sections`,
    }),
    timestamp: new Date().toISOString(),
  },
  {
    log: JSON.stringify({
      'agent name': 'Evelyn Fields (Documentation Specialist)',
      'agent response': `Code executed:
search_google(query='Who is the founder of Edda Luxembourg?')
search_google(query='Edda Luxembourg key people')
search_google(query='Edda Luxembourg security risks sanctions')`,
    }),
    timestamp: new Date().toISOString(),
  },
  {
    log: JSON.stringify({
      'agent name': 'Ethan Pierce (Product Manager)',
      'agent response': `I have updated the report with the information provided by Evelyn. Now, I will perform a final document completeness check before finalizing the report. I will focus on founder information, key individuals, security risks, financial risks, and key relationships. After the check I will finalize the report and call the response function.`,
    }),
    timestamp: new Date().toISOString(),
  },
  {
    log: JSON.stringify({
      'agent name': 'Ethan Pierce (Product Manager)',
      'agent response': `Code executed:
is_finished()`,
    }),
    timestamp: new Date().toISOString(),
  },
  {
    log: JSON.stringify({
      'agent name': 'Nora Caldwell (Researcher)',
      'agent response':
        'Finalizing the report with the collected information and presenting it to the user.',
    }),
    timestamp: new Date().toISOString(),
  },
  {
    log: JSON.stringify({
      'agent name': 'Julian Frost (Risk Analyst)',
      'agent response':
        'I am using the response function to communicate the findings of the risk analysis report for Edda Luxembourg to the user.',
    }),
    timestamp: new Date().toISOString(),
  },
  {
    log: JSON.stringify({
      'agent name': 'Evelyn Fields (Documentation Specialist)',
      'agent response': `Okay, I will now process the information and fill in the missing fields in the company data for Edda Luxembourg.
I will update the information based on the search results from previous queries and new searches focused on finding the founder, key people, security risks, and sanctions.
Here's the updated company data based on available information:
<companydata><company_name>Edda Luxembourg</company_name><founded>2008</founded><founder>Based on available information, the founder(s) is not explicitly mentioned in the search results. Further investigation might be needed to determine the founder(s).</founder><description>Edda Luxembourg is an ICT company headquartered in Windhof. As of today, Edda Luxembourg has more than 100 consultants under contract. They offer expertise in software development, data intelligence, infrastructure &amp; cloud, enterprise content management, and experience design, utilizing an end-to-end approach for client success. They provide consulting, project-based development (outsourcing via their software factory), and multidisciplinary team-led project handling. They emphasize resilient and flexible IT systems, cutting-edge data solutions, customized ECM solutions, and user-oriented design. They focus on Business Intelligence and data management.</description><key_individuals>Christophe Cypers - Managing Partner (christophe.cypers@edda.lu, (+352) 621 169 408) (Source: itnation.lu/partner/edda/). Olivier Jacques (Source: linkedin.com/in/olivier-jacques-96b7863). Mathieu Grétry (Source: rocketreach.co/mathieu-gretry-email_49515031). Anthony Crovella (Contact: crovellaanthony@gmail.com or anthony.crovella@sigi.lu) (Source: contactout.com/anthony-crovella-38588)</key_individuals><security_risks>Based on the search results, there are no direct mentions of specific security risks or sanctions related to Edda Luxembourg. However, as an ICT company, they are inherently exposed to risks associated with data breaches, cyberattacks, and software vulnerabilities. A general assessment of these risks is included in the operational risks section. Further specific risks would need to be ascertained through detailed audits and security assessments.</security_risks><financial_risks>No specific financial risks were identified in the search results. The company's turnover is listed as between 250,001 - 500,000 EUR (Source: editus.lu/en/edda-luxembourg-sa-windhof-koerich-1298923). Further analysis would require financial statements and credit reports.</financial_risks><key_relationships>Partnerships: ITnation (itnation.lu/partner/edda/), Dealroom (edda.co/integration-dealroom). Consortium with CGI and Uni Systems for the European Parliament (martel-innovate.prowly.com/183875-le-parlement-europeen-choisit-un-consortium-compose-de-cgi-uni-systems-et-edda-luxembourg-pour-gerer-et-transformer-numeriquement-ses-systemes-centraux). Clients: The search results generally mention serving private and public customers (itnation.lu/partner/edda/), but specific client names are not readily available. Further investigation may involve reviewing their portfolio or case studies.</key_relationships><operational_risks><Operational_risks_associated_with_software_development_data_intelligence_infrastructure__cloud_enterprise_content_management_and_experience_design_including_potential_delays_or_quality_issues.>Risks associated with software development, data intelligence, infrastructure &amp; cloud, enterprise content management, and experience design, including potential delays or quality issues, need to be further investigated based on project details and client information. Supply chain vulnerabilities in software components and data breaches are potential concerns. Further research is needed to determine the specifics of their risk management strategies and compliance with industry standards like ISO 27001 or GDPR. As the company is involved in digital transformation for the European Parliament, any delays, security breaches, or failures in these projects could have significant repercussions.</Operational_risks_associated_with_software_development_data_intelligence_infrastructure__cloud_enterprise_content_management_and_experience_design_including_potential_delays_or_quality_issues.></operational_risks><address><street>3, rue de l'Industrie</street><city>Windhof</city><country>Luxembourg</country></address><risk_level>Level 3: The company's risk level is assessed as Level 3. This is based on the following factors: They are an ICT company that is inherently exposed to cybersecurity risks. The company has partnerships with significant organizations, including the European Parliament, increasing the potential impact of operational failures or security breaches. No direct sanctions or financial irregularities were found, but a comprehensive risk assessment would require further financial and security audits. The company's reliance on consultants (over 100) also introduces a dependency risk.</risk_level><risk_level_int>3</risk_level_int><summary>Edda Luxembourg is an ICT company offering various IT solutions, including software development, data intelligence, and cloud services. Key personnel include Christophe Cypers and Olivier Jacques. They have partnerships with ITnation and Dealroom and are involved in digital transformation projects for the European Parliament. The risk level is currently assessed as 3, reflecting inherent cybersecurity risks, partnerships with important organizations, and a reliance on consultants. Further investigation is recommended to assess specific client relationships, conduct financial and security audits, and determine the company's compliance with relevant industry standards.</summary></companydata>`,
    }),
    timestamp: new Date().toISOString(),
  },
  {
    log: JSON.stringify({
      'agent name': 'Evelyn Fields (Documentation Specialist)',
      'agent response': `Code executed:
update_company_data(companydata=companydata)`,
    }),
    timestamp: new Date().toISOString(),
  },
  {
    log: JSON.stringify({
      'agent name': 'Ethan Pierce (Product Manager)',
      'agent response':
        'I am responding to the user, informing them that the requested information is still being gathered by Julian and Evelyn and that I will update them once it is available.',
    }),
    timestamp: new Date().toISOString(),
  },

  {
    log: JSON.stringify({
      'agent name': 'Evelyn Fields (Documentation Specialist)',
      'agent response': 'Responding with the completed due diligence report.',
    }),
    timestamp: new Date().toISOString(),
  },
];
