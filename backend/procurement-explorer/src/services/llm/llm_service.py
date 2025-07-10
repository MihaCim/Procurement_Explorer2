import base64
import logging
from typing import Union

from langchain.prompts import PromptTemplate
from langchain_core.documents import Document
from langchain_core.output_parsers import StrOutputParser
from langchain_text_splitters import RecursiveCharacterTextSplitter
from pydantic import ValidationError

from ...models.models import CompanyProfile, DocumentProfile
from ...utils.output_parsers import parse_company_profile
from ...utils.prompt_templates import (
    COMPANY_PROFILE_SUMMARY_TEMPLATE,
    COMPANY_PROFILE_TEMPLATE,
    DOCUMENT_PROFILE_SUMMARY_TEMPLATE,
    DOCUMENT_PROFILE_TEMPLATE,
)
from .llm_client import LLMClient

logger = logging.getLogger(__name__)

# Instantiate the LLM client based on environment configuration
llm_client = LLMClient()


def generate_document_profile(
    document: str, chunk_size=5000
) -> Union[DocumentProfile, dict]:
    """Generate a response for a given document."""
    text_splitter = RecursiveCharacterTextSplitter(
        chunk_size=chunk_size, chunk_overlap=300
    )
    docs = text_splitter.split_text(document)
    num_of_chunks = len(docs)

    try:
        response = ""
        prompt_template = PromptTemplate.from_template(
            template=DOCUMENT_PROFILE_TEMPLATE
        )
        output_parser = StrOutputParser()

        for doc in docs:
            # Format the prompt with the document chunk text
            prompt_text = prompt_template.format(doc_text=doc)
            # Pass the formatted prompt string to the LLM client
            result = llm_client.generate(prompt_text)
            parsed_result = output_parser.parse(result)
            response += parsed_result

            # If document is split into multiple chunks, summarize the chunks
        if num_of_chunks > 1:
            summary_prompt_template = PromptTemplate.from_template(
                template=DOCUMENT_PROFILE_SUMMARY_TEMPLATE
            )
            summary_prompt_text = summary_prompt_template.format(doc_text=response)
            response = llm_client.generate(summary_prompt_text)
            response = output_parser.parse(response)

    except ValidationError as ve:
        logger.error(f"Validation error when creating DocumentProfile: {ve}")
        return {"error": "Validation error", "details": str(ve)}
    except Exception as e:
        logger.error(f"Error generating document profile: {e}")
        return {"error": "Error generating document profile", "details": str(e)}

    return str(response)  # parsed_response #document_profile


def generate_company_profile(
    document: Document, chunk_size=7000
) -> Union[CompanyProfile, dict]:
    try:
        prompt = PromptTemplate.from_template(template=COMPANY_PROFILE_TEMPLATE)
        chain = prompt | llm_client.generate | StrOutputParser()

        # Only process the first 7000 characters if the document is too long
        response = chain.invoke({"website_text": document.page_content[:chunk_size]})

        # Parse the response into the company profile
        parsed_response = parse_company_profile(response)

        # Validate and create a CompanyProfile instance
        company_profile = CompanyProfile(**parsed_response)
        return company_profile

    except ValidationError as ve:
        logger.error(f"Validation error when creating CompanyProfile: {ve}")
        return {"error": "Validation error", "details": str(ve)}

    except Exception as e:
        logger.error(f"Error generating company profile: {e}")
        return {"error": "Error generating company profile", "details": str(e)}


def new_generate_company_profile(
    document: Document, chunk_size=1000
) -> Union[CompanyProfile, dict]:
    try:
        prompt = PromptTemplate.from_template(template=COMPANY_PROFILE_TEMPLATE)
        # chain = prompt | llm_client.generate# | StrOutputParser()

        # Only process the first 7000 characters if the document is too long
        # breakpoint()
        data = document.get("data")
        data = bytes(data)
        try:
            data_decoded = data.decode("utf-8")
        except Exception as e:
            print(e)
            try:
                data_decoded = base64.b64decode(data)
            except Exception as e:
                print(e)

        # Render the template to get the actual string prompt
        prompt_value = prompt.format(website_text=data_decoded[:chunk_size])

        # Ensure you are passing a list of strings (as required by LLM)
        response = llm_client.generate(prompt_value)

        # response = chain.invoke({"website_text": data_decoded})

        # Parse the response into the company profile
        parsed_response = parse_company_profile(response)

        # Validate and create a CompanyProfile instance
        company_profile = CompanyProfile(**parsed_response)
        return company_profile

    except ValidationError as ve:
        logger.error(f"Validation error when creating company profile: {ve}")
        return {"error": "Validation error", "details": str(ve)}

    except Exception as e:
        logger.error(f"Error generating company profile: {e}")
        return {"error": "Error generating company profile", "details": str(e)}


def generate_full_company_profile(
    website_content, max_words=12000, additional_info: dict = {}
):
    """
    Generate a company profile based on the website content.
    This function is used by the summarize_profiles.py script.
    """
    prompt = PromptTemplate.from_template(template=COMPANY_PROFILE_TEMPLATE)
    chain = prompt | llm_client.generate | StrOutputParser()
    responses = ""

    for index, doc in enumerate(website_content):
        print(f"Processing chunk {index + 1} of {len(website_content)}")
        print(f"Text length: {len(doc.page_content)}")
        response = chain.invoke({"website_text": doc.page_content})
        responses += "\n====================\n"  # Add ===== to separate the responses
        responses += response
        if len(responses) > max_words:
            break

    summary_prompt = PromptTemplate.from_template(
        template=COMPANY_PROFILE_SUMMARY_TEMPLATE
    )
    chain = summary_prompt | llm_client.generate | StrOutputParser()
    response = chain.invoke(
        {"context": responses, "additional_context": str(additional_info)}
    )

    return response
