import os
import pathlib
from dotenv import load_dotenv

load_dotenv(dotenv_path=os.path.join(os.path.dirname(__file__), '..', '.env'))

from src.services.vector_store_service import VectorStoreService

vs = VectorStoreService(vector_store_name="company_vector_store")
vs.build_vector_collection(
    "company_profile_nomic",
    collection_metadata={"hnsw:space": "cosine"},  # l2, cosine or ip
    chunk_size=4000,
    container="companies",
    cache=False,
)

print(vs.persistent_client.list_collections())
print(vs.get_collection("company_profile_nomic"))
