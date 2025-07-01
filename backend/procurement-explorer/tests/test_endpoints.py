import asyncio
from copy import deepcopy
from typing import Any

import aiohttp

MODEL: dict[str, Any] = {
    "metadata": {
        "task": "You are part of an AI system designed to generate a comprehensive due diligence report focused \n            on security risks for defense procurement related to the company: https://www.tahasavunma.com/. \n            Your goal is to ensure that the report is thorough, accurate, and well-documented. The report must include:\n            Company Information:Name, founding date, founder(s), address, and a brief description.\n            Security Risks:Links to sanctions, financial issues, or associations with blacklisted individuals or countries under EU regulations.\n            Operational Risks:Risks linked to projects, activities, or connections to sanctioned persons or entities.\n            Key Relationships:Political, operational, or other ties with sanctioned individuals or entities.\n            Description: Abstract of company portfolio and security profile.\n            Start by reading existing report data and search for missing information online.\n            Always extract whole company page text as a start reference. \n            Think step by step and process the task to final complete report"
    },
    "status": "finished",
    "company_name": "Taha Savunma",
    "founded": "2017",
    "founder": "Hayri TAHİRBEYOĞLU",
    "description": "Taha Defense, founded in 2017, specializes in developing cutting-edge defense technologies and customized security solutions. They offer a range of products including military textiles, ammunition, weapons, drones, and explosives. They are involved in various projects including the development of manned and unmanned semi-submersible vessels, 155mm unmanned howitzers, and electromagnetic rail guns aimed at enhancing defense capabilities. The company emphasizes innovation, customer needs, and high standards to deliver advanced defense systems.",
    "url": "https://www.tahasavunma.com/",
    "country": "Türkiye",
    "key_individuals": {},
    "security_risks": {},
    "financial_risks": {},
    "key_relationships": {},
    "operational_risks": {},
    "address": {
        "street": "İçerenköy Mah. Küçükbakkalköy Yolu Cad. Cemre Apt. No: 33/1",
        "city": "Ataşehir/İstanbul",
        "state": "",
    },
    "risk_level": 5,
    "summary": "Taha Savunma is an extreme risk company due to sanctions.",
    "logs": [
        {"log": "Started DueDiligence", "timestamp": "2025-06-30T12:01:32.789720"},
        {
            "log": "Ethan Pierce (Product Manager): I am responding to the user to inform them that the due diligence report requires further information and cannot be finalized yet due to missing details.",
            "timestamp": "2025-06-30T12:01:48.445632",
        },
        {
            "log": "Nora Caldwell (Researcher): ```xml\n<company_data>\n  <company_name>Taha Savunma</company_name>\n  <founded>2017</founded>\n  <founder>Hayri TAHİRBEYOĞLU</founder>\n  <address>İçerenköy Mah. Küçükbakkalköy Yolu Cad. Cemre Apt. No: 33/1, Ataşehir/İstanbul, Türkiye</address>\n  <description>Taha Defense, founded in 2017, specializes in developing cutting-edge defense technologies and customized security solutions. They offer a range of products including military textiles, ammunition, weapons, drones, and explosives. They are involved in various projects including the development of manned and unmanned semi-submersible vessels, 155mm unmanned howitzers, and electromagnetic rail guns aimed at enhancing defense capabilities. The company emphasizes innovation, customer needs, and high standards to deliver advanced defense systems.</description>\n  <Due_Diligence_Analysis/>\n  <key_individuals/>\n  <security_risks>\n  </security_risks>\n  <financial_risks/>\n  <operational_risks/>\n  <key_relationships/>\n  <risk_level/>\n</company_data>\n```",
            "timestamp": "2025-06-30T12:02:16.590398",
        },
        {
            "log": "Julian Frost (Risk Analyst): Responding that the company is sanctioned and presents an extreme risk, requiring no further analysis.",
            "timestamp": "2025-06-30T12:02:31.336057",
        },
        {
            "log": "Evelyn Fields (Documentation Specialist): Responding to the user that the due diligence report for Taha Savunma is complete and the company summary has been updated.",
            "timestamp": "2025-06-30T12:02:47.153001",
        },
        {
            "log": "Ethan Pierce (Product Manager): I am responding to the user with the final due diligence report outcome.",
            "timestamp": "2025-06-30T12:02:58.166795",
        },
        {
            "log": "Nora Caldwell (Researcher): Finalizing the due diligence report and providing the conclusion that the company presents an extreme risk due to sanctions.",
            "timestamp": "2025-06-30T12:03:10.181320",
        },
        {
            "log": "Julian Frost (Risk Analyst): I am providing the final due diligence report outcome, stating that the company presents an extreme risk due to sanctions and no further analysis is needed.",
            "timestamp": "2025-06-30T12:03:13.401098",
        },
        {
            "log": "Evelyn Fields (Documentation Specialist): I am responding to the user with the final report status.",
            "timestamp": "2025-06-30T12:03:15.884437",
        },
        {
            "log": "Ethan Pierce (Product Manager): Responding to the user with the final due diligence report outcome, stating that the company presents an extreme risk due to sanctions and no further analysis is needed.",
            "timestamp": "2025-06-30T12:03:20.861662",
        },
        {
            "log": "Nora Caldwell (Researcher): Responding that the due diligence report for Taha Savunma is complete and presents an extreme risk.",
            "timestamp": "2025-06-30T12:03:23.284351",
        },
        {
            "log": "Julian Frost (Risk Analyst): Responding to the user that the due diligence report is complete and the company presents an extreme risk due to sanctions, requiring no further analysis.",
            "timestamp": "2025-06-30T12:03:26.431494",
        },
        {
            "log": "Evelyn Fields (Documentation Specialist): Responding to the user with the due diligence report result.",
            "timestamp": "2025-06-30T12:03:29.293925",
        },
        {
            "log": "Ethan Pierce (Product Manager): Responding with the final due diligence report outcome, confirming the company presents an extreme risk due to sanctions, thus requiring no further analysis.",
            "timestamp": "2025-06-30T12:03:34.948450",
        },
        {
            "log": "Nora Caldwell (Researcher): Responding that the due diligence report for Taha Savunma is complete and presents an extreme risk.",
            "timestamp": "2025-06-30T12:03:37.691338",
        },
        {
            "log": "Julian Frost (Risk Analyst): Responding to the user with the completed due diligence report findings, stating the company's extreme risk due to sanctions.",
            "timestamp": "2025-06-30T12:03:40.454859",
        },
        {
            "log": "Evelyn Fields (Documentation Specialist): Responding to the user with the final due diligence report outcome.",
            "timestamp": "2025-06-30T12:03:43.217114",
        },
        {
            "log": "Ethan Pierce (Product Manager): Responding to the user with the final due diligence report outcome, indicating extreme risk and completion of the analysis.",
            "timestamp": "2025-06-30T12:03:48.344508",
        },
        {
            "log": "Nora Caldwell (Researcher): I am providing a response indicating that the due diligence report is complete and the company presents an extreme risk due to sanctions.",
            "timestamp": "2025-06-30T12:03:50.755625",
        },
        {
            "log": "Julian Frost (Risk Analyst): I am using the response function to provide the final answer to the user, indicating the due diligence report's conclusion.",
            "timestamp": "2025-06-30T12:03:53.426389",
        },
        {
            "log": "Evelyn Fields (Documentation Specialist): I am using the response function to provide the final answer to the user.",
            "timestamp": "2025-06-30T12:03:56.125726",
        },
        {
            "log": "Ethan Pierce (Product Manager): Responding to the user with the final due diligence report outcome, indicating extreme risk and completion of the analysis.",
            "timestamp": "2025-06-30T12:04:01.966100",
        },
        {
            "log": "Nora Caldwell (Researcher): I am responding to the user with the final assessment of Taha Savunma's due diligence report.",
            "timestamp": "2025-06-30T12:04:04.679514",
        },
        {
            "log": "Julian Frost (Risk Analyst): Responding to the user with the final due diligence report outcome.",
            "timestamp": "2025-06-30T12:04:07.389324",
        },
        {
            "log": "Evelyn Fields (Documentation Specialist): Responding that the due diligence report for Taha Savunma is complete.",
            "timestamp": "2025-06-30T12:04:10.896112",
        },
        {
            "log": "Ethan Pierce (Product Manager): Responding to the user that the due diligence report for Taha Savunma is complete and presents an extreme risk due to sanctions, therefore, requiring no further analysis.",
            "timestamp": "2025-06-30T12:04:16.797581",
        },
        {
            "log": "Nora Caldwell (Researcher): Responding to the user with the final assessment of Taha Savunma's due diligence report.",
            "timestamp": "2025-06-30T12:04:19.583549",
        },
        {
            "log": "Julian Frost (Risk Analyst): Responding with the due diligence report conclusion.",
            "timestamp": "2025-06-30T12:04:26.298959",
        },
        {
            "log": "Evelyn Fields (Documentation Specialist): Responding to the user with the final report summary.",
            "timestamp": "2025-06-30T12:04:29.716481",
        },
        {
            "log": "Ethan Pierce (Product Manager): Responding with the due diligence report conclusion that Taha Savunma presents an extreme risk due to sanctions, finalizing the report.",
            "timestamp": "2025-06-30T12:04:39.857380",
        },
        {
            "log": "Nora Caldwell (Researcher): Responding with the due diligence report conclusion.",
            "timestamp": "2025-06-30T12:04:42.495517",
        },
        {
            "log": "Julian Frost (Risk Analyst): Responding with the final due diligence report conclusion.",
            "timestamp": "2025-06-30T12:04:45.275515",
        },
        {
            "log": "Evelyn Fields (Documentation Specialist): Responding with the final due diligence report conclusion, indicating that the assessment of Taha Savunma is complete and presents an extreme risk. No further analysis is required.",
            "timestamp": "2025-06-30T12:04:48.794329",
        },
    ],
}

MODEL_URL = "https%3A%2F%2Fwww.tahasavunma.com%2F"

HOST = "localhost"
PORT = "8000"

BASE_URL = f"http://{HOST}:{PORT}"
URL = f"{BASE_URL}/due-diligence/profile?company_url={MODEL_URL}"


async def create_model() -> dict[str, Any]:
    async with aiohttp.ClientSession() as session:
        async with session.post(URL, json=MODEL) as response:
            if response.status != 200:
                return {
                    "status": "failed",
                    "msg": f"failed to create DueDiligence for {URL}",
                }
            return await response.json()


async def get_model() -> dict[str, Any]:
    async with aiohttp.ClientSession() as session:
        async with session.get(URL) as response:
            if response.status != 200:
                return {
                    "status": "failed",
                    "msg": f"failed to get DueDiligence for {URL}",
                }
            return await response.json()


async def delete_model() -> dict[str, Any]:
    async with aiohttp.ClientSession() as session:
        async with session.delete(URL) as response:
            if response.status != 200:
                return {
                    "status": "failed",
                    "msg": f"failed to delete DueDiligence for {URL}",
                }
            return await response.json()


async def update_model(model: dict[str, Any]) -> dict[str, Any]:
    async with aiohttp.ClientSession() as session:
        async with session.put(URL, json=model) as response:
            if response.status != 200:
                return {
                    "status": "failed",
                    "msg": f"failed to update DueDiligence for {URL}",
                }
            return await response.json()


async def main() -> None:
    result = await delete_model()
    assert "status" in result
    assert result["status"] == "failed"

    result = await get_model()
    assert "status" in result
    assert result["status"] == "failed"

    result = await create_model()

    assert "status" in result
    assert "id" in result
    assert result["status"] == "finished"
    id = result["id"]

    result = await create_model()
    assert "status" in result
    assert result["status"] == "failed"

    result = await get_model()
    assert "status" in result
    assert "id" in result
    assert int(id) == int(result["id"])

    model = deepcopy(MODEL)
    model["name"] = "Test"
    result = await update_model(model)
    assert "status" in result
    assert "id" in result
    assert int(id) == int(result["id"])

    result = await get_model()
    assert "status" in result
    assert "id" in result
    assert int(id) == int(result["id"])
    assert result["name"] == "Test"

    result = await delete_model()
    assert result is None

    result = await get_model()
    assert "status" in result
    assert result["status"] == "failed"

    print("TEST PASSED")


if __name__ == "__main__":
    asyncio.run(main())
