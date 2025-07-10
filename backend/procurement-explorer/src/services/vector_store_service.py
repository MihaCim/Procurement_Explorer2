import json
import os
import uuid
from pathlib import Path
from typing import Any, List, Literal, Tuple

import chromadb
from chromadb import QueryResult
from langchain_community.embeddings.ollama import OllamaEmbeddings
from langchain_text_splitters import RecursiveCharacterTextSplitter

from ..connectors.postgres_conector import PostgresConnector
from ..models.models import Company


class VectorStoreService:
    OLLAMA_URL = os.getenv("OLLAMA_URL", "http://localhost")
    OLLAMA_PORT = os.getenv("OLLAMA_PORT", "11434")
    print(f"http://{OLLAMA_URL}:{OLLAMA_PORT}")
    PERSISTENT_DIR_PATH = Path(__file__).parent.parent.parent / "data"
    DEFAULT_EMBEDDING_MODEL = OllamaEmbeddings(
        model=os.getenv("EMBEDDING_MODEL", "mxbai-embed-large"),
        base_url=f"http://{OLLAMA_URL}:{OLLAMA_PORT}",
    )

    def __init__(
        self,
        persistent_dir: str = str(PERSISTENT_DIR_PATH),
        vector_store_name: str = "temp_vector_store",
    ) -> None:
        # If the persistent directory does not exist, create it
        if not Path(persistent_dir).exists():
            Path(persistent_dir).mkdir(parents=True)

        self.persistent_dir = persistent_dir
        self.vector_store_name = vector_store_name
        self.persistent_client = chromadb.PersistentClient(
            path=f"{persistent_dir}/{vector_store_name}"
        )

    def _read_cache(self) -> dict[str, Any]:
        """
        Read the cache.
        """
        if os.path.exists(f"{self.persistent_dir}/{self.vector_store_name}_cache.json"):
            with open(
                f"{self.persistent_dir}/{self.vector_store_name}_cache.json", "r"
            ) as f:
                return json.load(f)
        return {}

    def _write_cache(self, cache_data: dict[str, Any]):
        """
        Write the cache.
        """
        with open(
            f"{self.persistent_dir}/{self.vector_store_name}_cache.json", "w"
        ) as f:
            json.dump(cache_data, f)

    def add_document_to_collection(
        self,
        collection: chromadb.Collection,
        embedding_splitter: RecursiveCharacterTextSplitter,
        blob: str,
        profile: dict[str, str],
        embedding_model: OllamaEmbeddings = DEFAULT_EMBEDDING_MODEL,
    ) -> None:
        """
        Add a document to a collection.
        """
        metadata, texts_to_embed = self._process_json_blob(blob, profile)
        # Split to chunks of 512 tokens
        chunks = embedding_splitter.create_documents(texts_to_embed)
        print(f"Processing {len(chunks)} chunks")
        # Get the embeddings
        embeddings = embedding_model.embed_documents(
            [str(chunk.page_content) for chunk in chunks]
        )
        for id, chunk in enumerate(chunks):
            collection.add(
                ids=str(uuid.uuid4()),
                documents=chunk.page_content,
                embeddings=embeddings[id],
                metadatas=metadata,
            )
        return metadata

    def _get_company_dict(self, company: Company) -> dict[str, str]:
        company_dict = dict[str, str]()
        company_dump = company.model_dump()
        for key in company_dump:
            company_dict[key.lower()] = str(company_dump[key])
        return company_dict

    def update_document_in_vector_store(self, id: str, company: Company) -> None:
        self.delete_document_in_vector_store(id, company)
        self.add_document_to_vector_store(id, company)

    def delete_document_in_vector_store(self, id: str, company: Company) -> None:
        collection = self.get_collection("company_profile_nomic")

        company_dict = self._get_company_dict(company)
        assert "name" in company_dict

        collection.delete(where={"name": company_dict["name"]})

        cache_data = self._read_cache()
        if id in cache_data:
            del cache_data[id]
            self._write_cache(cache_data)

    def add_document_to_vector_store(
        self,
        id: str,
        company: Company,
    ):
        print(f"add_document_to_vector_store({id=}, {company=})")
        cache_data = self._read_cache()
        collection = self.get_collection("company_profile_nomic")
        embedding_splitter = RecursiveCharacterTextSplitter(
            chunk_size=4000, chunk_overlap=0
        )
        company_dict = self._get_company_dict(company)
        metadata = self.add_document_to_collection(
            collection,
            embedding_splitter,
            id,
            company_dict,
        )
        cache_data.update({id: metadata})
        self._write_cache(cache_data)

    def create_collection_from_scratch(
        self,
    ):
        return self.build_vector_collection(
            "company_profile_nomic",
            collection_metadata={"hnsw:space": "cosine"},  # l2, cosine or ip
            chunk_size=4000,
            container="companies",
            cache=False,
        )

    def build_vector_collection(
        self,
        collection_name: str,
        collection_metadata: dict = {},  # Eg. {"hnsw:space": "l2"}
        embedding_model: OllamaEmbeddings = DEFAULT_EMBEDDING_MODEL,
        source: PostgresConnector = PostgresConnector(),
        container: str = "companies",
        chunk_size: int = 512,
        cache: bool = True,
    ) -> chromadb.Collection:
        """
        Build a vector store collection.
        """
        print(f"BUILDING COLLECTION: {collection_name} USING {embedding_model.model}")
        cache_data = self._read_cache()
        self._store_old_collection(collection_name)
        collection = self.create_collection(collection_name, collection_metadata)
        embedding_splitter = RecursiveCharacterTextSplitter(
            chunk_size=chunk_size, chunk_overlap=0
        )
        try:
            company_profiles = source.list_documents(container)
        except Exception as e:
            print(f"Failed to list blobs in container {container}: {e}")
            raise Exception(f"Failed to list blobs in container {container}: {e}")

        for id, blob in enumerate(company_profiles):
            if cache and blob in cache_data:
                print(f"Skipping blob {blob} ({id + 1}/{len(company_profiles)})")
                continue

            print(f"Processing blob {blob} ({id + 1}/{len(company_profiles)})")
            try:
                profile = source.read_json_document(container, blob)
            except Exception as e:
                print(f"Failed to read blob {blob}: {e}")
                continue
            metadata = self.add_document_to_collection(
                collection, embedding_splitter, blob, profile
            )

            cache_data.update({blob: metadata})
            self._write_cache(cache_data)

        return collection

    def _process_json_blob(self, blob: str, profile: dict) -> Tuple[dict, List[str]]:
        """
        Process a JSON blob.
        """
        metadata = {
            "id": blob,
            "name": profile.get("name", ""),
            "website": profile.get("website", ""),
            "country": profile.get("country", ""),
            "due_diligence_status": profile.get("due_diligence_status", ""),
            "risk_level": profile.get("risk_level", ""),
        }

        texts_to_embed = []
        fields_to_embed = [
            "name",
            "industry",
            "subindustries",
            "country",
            "company_profile",
            "description",
        ]
        for field in fields_to_embed:
            if field in profile:
                texts_to_embed.append(str(profile[field]))
                metadata[field] = profile.get(field, "")
        if len(texts_to_embed) == 0:
            profile_without_data = {k: v for k, v in profile.items()}
            texts_to_embed.append(str(profile_without_data))
        # delete empty fields
        keys = list(metadata.keys())
        for key in keys:
            if not metadata[key]:
                del metadata[key]
            elif type(metadata[key]) == list:
                metadata[key] = ", ".join(metadata[key])
            elif type(metadata[key]) == dict:
                metadata[key] = str(metadata[key])
        return metadata, texts_to_embed

    def query_vector_collection(
        self,
        query: str,
        collection_name: str,
        k: int = 5,
        embedding_model: OllamaEmbeddings = DEFAULT_EMBEDDING_MODEL,
        multiplier: int = 10,
        distance_metric: Literal["cosine", "l2", "ip"] = "l2",
    ) -> List[dict]:
        """
        Query a vector store collection.
        """
 
        collection = self.persistent_client.get_collection(collection_name)
        if collection is None:
            return []
  
        embeddings = embedding_model.embed_query(query) 
        result = collection.query(
            query_embeddings=embeddings, n_results=k * multiplier, include=["distances", "metadatas"]
        )
        # Filter out duplicate metadata
        unique_metadata = self._filter_unique_metadata_scores(result)
    
        #return unique_metadata
        return unique_metadata[:k]

    def _store_old_collection(self, collection_name: str):
        """
        Store the old collection.
        """
        for collection in self.persistent_client.list_collections():
            if f"{collection_name}_old" in collection.name:
                self.persistent_client.delete_collection(f"{collection_name}_old")
        if collection_name in self.persistent_client.list_collections():
            collection = self.persistent_client.get_collection(collection_name)
            collection.modify(f"{collection_name}_old")

    def create_collection(
        self,
        collection_name: str,
        collection_metadata: dict = {},
    ) -> chromadb.Collection:
        """
        Create a collection.
        """
        return self.persistent_client.get_or_create_collection(
            name=collection_name,
            metadata=collection_metadata,
        )

    def get_collection(self, collection_name: str) -> chromadb.Collection:
        """
        Get a collection.
        """
        try:
            collection = self.persistent_client.get_collection(collection_name)
        except:
            collection = self.create_collection_from_scratch()
        return collection

    @staticmethod
    def _filter_unique_metadata_scores(query_result: QueryResult) -> List[dict]:
        """
        Filter out the unique metadata scores.
        """
        distances = query_result.get("distances", [])
        distance = distances[0] if distances else []
        metadatas = query_result.get("metadatas", [])
        metadata = metadatas[0] if metadatas else []

        # Pair each metadata with its distance and document id
        paired_data = zip(distance, metadata)

        # Sort by distance (ascending)
        sorted_data = sorted(paired_data, key=lambda x: x[0])

        # Use a dictionary to keep track of the unique metadata with the smallest distance
        unique_metadata = {}
        for distance, metadata in sorted_data:
            metadata_key = tuple(metadata.items())
            if metadata_key not in unique_metadata:
                unique_metadata[metadata_key] = (metadata, distance)

        # Convert the dictionary to a formatted list of dictionaries as per the requirement
        unique_metadata_list = []
        for metadata, distance in unique_metadata.values():
            unique_metadata_list.append(
                {
                    "Name": metadata.get("name", ""),
                    "Country": metadata.get("country", ""),
                    "Website": metadata.get("website", ""),
                    "Score": distance,
                }
            )

        return unique_metadata_list
