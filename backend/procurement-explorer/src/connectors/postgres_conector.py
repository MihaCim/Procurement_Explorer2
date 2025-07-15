from typing import Optional, List
import os
import psycopg2
from psycopg2.extras import RealDictCursor
from typing import Optional


class PostgresConnector:
    def __init__(self, database_name: Optional[str] = None):
        """
        Initialize the PostgresConnector with environment variables.
        :param database_name: The database name can be passed, but it will use the one from env if not provided.
        """
        self.conn_params = {
            "dbname": database_name if database_name else os.getenv("POSTGRES_DB"),
            "user": os.getenv("POSTGRES_USER"),
            "password": os.getenv("POSTGRES_PASSWORD"),
            "host": os.getenv("POSTGRES_URL"),
            "port": os.getenv("POSTGRES_PORT"),
        }
        self.connection = None

    def connect(self):
        """
        Establishes a connection to the PostgreSQL database.
        :raises psycopg2.Error: If the connection fails.
        """
        if self.connection is None or self.connection.closed:
            try:
                self.connection = psycopg2.connect(**self.conn_params)
            except psycopg2.Error as e:
                raise e
        return self.connection

    def execute_query(self, query, params=None, fetch=False, fetchone=False):
        """
        Executes a raw SQL query and returns the results if needed.
        :param query: The SQL query to execute.
        :param params: Parameters for the SQL query.
        :param fetch: If True, fetch all results. Default is False.
        :param fetchone: If True, fetch a single result. Default is False.
        :return: Query results or None if not fetching.
        :raises psycopg2.Error: If the query fails.
        """
        conn = self.connect()
        try:
            with conn.cursor(cursor_factory=RealDictCursor) as cur:
                cur.execute(query, params)

                if fetchone:
                    result = cur.fetchone()
                    conn.commit()
                    return result
                if fetch:
                    result = cur.fetchall()
                    conn.commit()
                    return result

                conn.commit()  # Commit if it's an insert, update, or delete query
                return None  # No result needed if not fetching
        except psycopg2.Error as e:
            if conn:
                conn.rollback()  # Rollback the transaction if there's an error
            raise e
        finally:
            if conn:
                conn.close()  # Always close the connection after executing the query

    # ------------------ MongoDB-like Interface --------------------

    def upload_document(self, collection_name: str, document: dict) -> str:
        """
        Inserts a document into the specified table (collection).
        :param collection_name: The name of the table in PostgreSQL.
        :param document: The dictionary of data to insert.
        :return: The ID of the inserted document.
        """
        columns = ", ".join(document.keys())
        values = ", ".join([f"%({k})s" for k in document.keys()])
        query = (
            f"INSERT INTO {collection_name} ({columns}) VALUES ({values}) RETURNING id;"
        )
        result = self.execute_query(
            query, document, fetchone=True
        )  # Fetch one to get the returned ID
        return str(result["id"]) if result else ""

    def download_document(self, collection_name: str, document_id: str) -> dict:
        """
        Retrieves a document by ID from the specified table (collection).
        :param collection_name: The name of the table in PostgreSQL.
        :param document_id: The ID of the document to retrieve.
        :return: The document data as a dictionary.
        """
        query = f"SELECT * FROM {collection_name} WHERE id = %s;"
        result = self.execute_query(query, (document_id,), fetchone=True)
        return result if result else {}

    def update_document(
        self, collection_name: str, document_id: str, update_data: dict
    ) -> None:
        """
        Updates a document in a table by ID.
        :param collection_name: The name of the table in PostgreSQL.
        :param document_id: The ID of the document to update.
        :param update_data: The dictionary of fields to update.
        """
        set_clause = ", ".join([f"{k} = %({k})s" for k in update_data.keys()])
        query = f"UPDATE {collection_name} SET {set_clause} WHERE id = %(document_id)s;"
        update_data["document_id"] = document_id
        self.execute_query(query, update_data)

    def read_json_document(self, collection_name: str, document_id: str) -> dict:
        """
        Reads a JSON document and returns it as a dictionary.
        :param collection_name: The name of the table.
        :param document_id: The document ID to fetch.
        :return: The document as a dictionary.
        """
        return self.download_document(collection_name, document_id)

    def list_documents(self, collection_name: str) -> List[str]:
        """
        Lists all documents (by ID) in a specified table.
        :param collection_name: The name of the table in PostgreSQL.
        :return: A list of document IDs.
        """
        query = f"SELECT id FROM {collection_name};"
        results = self.execute_query(query, fetch=True)
        return [str(row["id"]) for row in results] if results else []

    def check_document_exists(self, collection_name: str, document_id: str) -> bool:
        """
        Checks if a document exists in the table by ID.
        :param collection_name: The name of the table in PostgreSQL.
        :param document_id: The document ID to check.
        :return: True if the document exists, False otherwise.
        """
        query = f"SELECT 1 FROM {collection_name} WHERE id = %s;"
        result = self.execute_query(query, (document_id,), fetchone=True)
        return result is not None

    def get_last_n_documents(self, collection_name: str, limit: int) -> List[dict]:
        """
        Retrieves the most recently added documents from a table.
        :param collection_name: The name of the table in PostgreSQL.
        :param limit: The number of documents to retrieve.
        :return: A list of the most recent documents.
        """
        query = f"SELECT * FROM {collection_name} ORDER BY id DESC LIMIT %s;"
        return self.execute_query(query, (limit,), fetch=True)

    def count_documents(self, collection_name: str) -> int:
        """
        Counts the number of documents in a table.
        :param collection_name: The name of the table in PostgreSQL.
        :return: The count of documents in the table.
        """
        query = f"SELECT COUNT(*) FROM {collection_name};"
        result = self.execute_query(query, fetchone=True)
        return result["count"] if result else 0

    def get_document(self, collection_name: str, name: str) -> Optional[dict]:
        """
        Retrieves a document by its name from a table.
        :param collection_name: The name of the table in PostgreSQL.
        :param name: The name of the document.
        :return: The document data as a dictionary.
        """
        query = f"SELECT * FROM {collection_name} WHERE name = %s;"
        return self.execute_query(query, (name + ".json",), fetchone=True)

    def delete_document(self, collection_name: str, document_id: str) -> None:
        """
        Deletes a document from a table by ID.
        :param collection_name: The name of the table in PostgreSQL.
        :param document_id: The ID of the document to delete.
        """
        query = f"DELETE FROM {collection_name} WHERE id = %s;"
        self.execute_query(query, (document_id,))

    def close_connection(self) -> None:
        """
        Closes the PostgreSQL connection.
        """
        if self.connection:
            self.connection.close()
            self.connection = None
