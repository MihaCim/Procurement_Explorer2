from ..connectors.postgres_conector import PostgresConnector

class SanctionsChecker:
    def __init__(self):
        self.db = PostgresConnector()

    def check_us_sanctions(self, field, value):
        query = f"""
        SELECT * FROM sanctions_us
        WHERE {field} = %s
        """
        results = self.db.execute_query(query, (value,))
        return results is not None and len(results) > 0

    def get_us_sanctions_details(self, field, value):
        query = f"""
        SELECT * FROM sanctions_us
        WHERE {field} = %s
        """
        return self.db.execute_query(query, (value,))

    def check_eu_sanctions(self, field, value):
        query = f"""
        SELECT * FROM sanctions_eu
        WHERE {field} = %s
        """
        results = self.db.execute_query(query, (value,))
        return results is not None and len(results) > 0

    def get_eu_sanctions_details(self, field, value):
        query = f"""
        SELECT * FROM sanctions_eu
        WHERE {field} = %s
        """
        return self.db.execute_query(query, (value,))

