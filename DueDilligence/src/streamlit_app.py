import sys
import os
from prompts.prompts2 import Prompts
# Get the parent directory of the current file
parent_dir = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
sys.path.append(parent_dir)

import streamlit as st
import asyncio
import json
from thread import TaskThread
from company_data import CompanyData

data = CompanyData().to_json()
company_data = CompanyData()


st.sidebar.title("AI Agents Communication Stream")
st.sidebar.title("Agents:")
st.sidebar.text("Ethan Pierce (Manager)")
st.sidebar.text("Nora Caldwell (Senior Researcher)")
st.sidebar.text("Julian Frost (Risk Analyst)")
st.sidebar.text("Evelin Fields (Documentarist)")

st.title("Due Diligence Profile")
st.write("Risk Levels: 1 - no risk, 2 - moderate risk, 3 - medium/not defined, 4 - high risk, 5 - extreeme risk")
user_input = st.text_input("Enter company:")


# Placeholder for the JSON object display & logs
json_placeholder = st.empty()
log_placeholder = st.sidebar.empty()

# Logger class to handle log messages using chat
class Logger_main:
    def __init__(self):
        pass
    def info(self, message: str or None):
        self.log_container = st.empty()

        if message:
            self.log_container.markdown(f"**Final Report:** {message}")
        if company_data:
            data = json.loads(company_data.to_json())
            json_placeholder.json(data)

class Logger_logs:
    def __init__(self):
        self.logs = []
    def info(self, message):
        self.logs.append(message + "<br><br>")
        log_placeholder.markdown("\n".join(self.logs), unsafe_allow_html=True)

logger_main = Logger_main()
logger_logs = Logger_logs()


def display_profile(profile_data):
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
    general_info_keys = ["company_name", "founded", "founder", "website", "address", "country"]
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
    bullet_points = {
        "Security risks": profile_data.get("security_risks", {}).get("risk", "None noted"),
        "Operational risks": profile_data.get("operational_risks", {}).get("risk", "None indicated"),
        "Financial risks": profile_data.get("financial_risks", {}).get("risk", "None indicated"),
        "Ties": profile_data.get("ties", {}).get("details", "No known ties with sanctioned entities"),
        "Risk level": profile_data.get("risk_level", "Low"),
        "Risk level Int": profile_data.get("risk_level_int", 1),
    }

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
        data=company_data,
        logger_main=logger_main,
        logger_logs=logger_logs,
    )
    logger_logs.info("Task thread started...")
    return await taskThread.run()


if user_input:
    
    logger_logs.info(f"Received input: {user_input}")
    report = asyncio.run(run_task_thread(user_input))

    st.write("DueDiligence Profile Created")
    print ("final report data\n", report)
   
    display_profile(report)
    st.success("Process completed.")
