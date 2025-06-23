import os
import re
import sys

from prompts.prompts2 import Prompts

# Get the parent directory of the current file
parent_dir = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
sys.path.append(parent_dir)

import asyncio
import json

import streamlit as st
from company_data import CompanyData
from logger import logger
from thread import TaskThread

data = CompanyData().to_json()
company_data = CompanyData()


st.sidebar.title("AI Agents Communication Stream")
st.sidebar.title("Agents:")
st.sidebar.text("Ethan Pierce (Manager)")
st.sidebar.text("Nora Caldwell (Senior Researcher)")
st.sidebar.text("Julian Frost (Risk Analyst)")
st.sidebar.text("Evelin Fields (Documentarist)")

st.title("Due Diligence Profile")
st.write(
    "Risk Levels: 1 - no risk, 2 - moderate risk, 3 - medium/not defined, 4 - high risk, 5 - extreeme risk"
)
user_input = st.text_input("Enter company:")

json_placeholder = st.empty()


class StLogger:
    def __init__(
        self,
    ) -> None:
        self.logs = list[dict[str, str | bool]]()

    def info(
        self,
        message: str | None,
    ) -> None:
        # if message:
        #     st.empty().markdown(f"**Final Report:** {message}")

        if company_data:
            data = json.loads(company_data.to_json())
            json_placeholder.json(data)

    def add_log(self, log: str) -> None:
        self.logs.append({"log": f"{log} <br><br>", "rendered": False})
        self.render_logs()

    def render_logs(self) -> None:
        code_block_pattern = re.compile(
            r"(```\w+\s+<.*?>\s+```)|(```\w+\s+<.*?>)", re.DOTALL
        )
        for i, _ in enumerate(self.logs):
            assert "log" in self.logs[i]
            assert "rendered" in self.logs[i]
            if self.logs[i]["rendered"]:
                continue

            text = self.logs[i]["log"]
            assert isinstance(text, str)

            matches = list(code_block_pattern.finditer(text))
            last_end = 0
            for match in matches:
                if match.start() > last_end:
                    non_code_text = text[last_end : match.start()].strip()
                    if non_code_text:
                        st.sidebar.empty().markdown(
                            non_code_text, unsafe_allow_html=True
                        )

                code = text[match.start() : match.end()]
                if code.endswith("```"):
                    code = code.removesuffix("```")
                st.sidebar.empty().markdown(code)

                last_end = match.end()

            if last_end < len(text):
                remaining_text = text[last_end:].strip()
                if remaining_text:
                    st.sidebar.empty().markdown(remaining_text, unsafe_allow_html=True)
            self.logs[i]["rendered"] = True

    def error(self, message: str) -> None:
        logger.error(message)


stlogger = StLogger()


def display_profile(profile_data: dict | str | None) -> None:
    # Ensure profile_data is a dictionary
    if profile_data is None:
        profile_data = {}
    elif isinstance(profile_data, str):
        try:
            profile_data = json.loads(profile_data)
        except json.JSONDecodeError:
            st.error("Invalid JSON format.")
            return

    # Section 1: General Information
    general_info_keys = [
        "company_name",
        "founded",
        "founder",
        "website",
        "address",
        "country",
    ]
    general_info = {key: profile_data.get(key, "") for key in general_info_keys}

    st.markdown("## Company Information")
    general_info_text = (
        f"**Company Name**: {general_info['company_name']}  \n"
        f"**Founded**: {general_info['founded']}  \n"
        f"**Founder**: {general_info['founder']}  \n"
        f"**Website**: {general_info['website']}  \n"
        f"**Address**: {general_info.get('address', {}).get('street', '')}, "
        f"{general_info.get('address', {}).get('city', '')}, "
        f"{general_info.get('address', {}).get('state', '')}  \n"
        f"**Country**: {general_info['country']}"
    )
    st.markdown(general_info_text)

    # Section 2: Description
    st.markdown("## Description")
    st.markdown(profile_data.get("description", "No description available"))

    # Section 3: Risks and Ties
    st.markdown("## Risks and Critical Connections")

    bullet_points = dict[str, str | int]()

    def add_bullet_point(key: str, risk_type: str, default: str | int) -> None:
        bullet_points[key] = default
        risk = profile_data.get(risk_type, {})
        if risk is not None and isinstance(risk, dict):
            bullet_points[key] = risk.get("risk", default)

    add_bullet_point("Security risks", "security_risks", "None noted")
    add_bullet_point("Operational risks", "security_risks", "None noted")
    add_bullet_point("Financial risks", "security_risks", "None noted")

    profile_data["Ties"] = "No known ties with sanctioned entities"
    ties = profile_data.get("ties", {})
    if ties is not None and isinstance(ties, dict) and "details" in ties:
        profile_data["Ties"] = ties["details"]

    profile_data["Risk level"] = "Low"
    if "risk_level" in profile_data and profile_data["risk_level"] is not None:
        profile_data["Risk level"] = profile_data["risk_level"]

    profile_data["Risk level Int"] = 1
    if "risk_level_int" in profile_data and profile_data["risk_level_int"] is not None:
        profile_data["Risk level Int"] = profile_data["risk_level_int"]

    for key, value in bullet_points.items():
        st.markdown(f"- **{key}:** {value}")

    # Section 4: Summary
    st.markdown("## Summary")
    st.markdown(profile_data.get("summary", "No summary available"))


prompts = Prompts()


async def run_task_thread(user_input):
    system_prompt = prompts.get_system_prompt(user_input)
    taskThread = TaskThread(
        task=system_prompt,
        company_data=company_data,
        logger=stlogger,
    )
    logger.info("Task thread started...")
    return await taskThread.run()


if user_input:
    logger.info(f"Received input: {user_input}")
    report = asyncio.run(run_task_thread(user_input))

    st.write("DueDiligence Profile Created")
    print("final report data\n", report)

    display_profile(report)
    st.success("Process completed.")
