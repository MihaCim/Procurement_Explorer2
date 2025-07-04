import os, json
import redis
from typing import Dict, List, Literal, Optional, Any
from fastapi import HTTPException

# def get_redis_client() -> redis.Redis:
#     redis_host = os.getenv("REDIS_HOST")
#     assert redis_host

#     redis_port = os.getenv("REDIS_PORT")
#     assert redis_port
#     redis_port = int(redis_port)

#     redis_db = os.getenv("REDIS_DB")
#     assert redis_db
#     redis_db = int(redis_db)

#     return redis.Redis(
#         host=redis_host, port=redis_port, db=redis_db, decode_responses=True
#     )

# def get_json_data_from_key(key: str) -> Any | None:
#     if redis_client.exists(key):
#         data = redis_client.get(key)
#         data = json.loads(data)
#         if isinstance(data, str):
#             data = json.loads(data)
#         return data



class RedisStore:

    _client: Optional[redis.Redis] = None  # class‑level singleton

    @classmethod
    def get_client(cls) -> redis.Redis:
        """Return the singleton redis.Redis client, creating it on first call."""
        if cls._client is None:
            redis_host = os.getenv("REDIS_HOST")
            redis_port = int(os.getenv("REDIS_PORT", "6379"))
            redis_db   = int(os.getenv("REDIS_DB", "0"))

            if not redis_host:
                raise RuntimeError("REDIS_HOST env var is required")

            cls._client = redis.Redis(
                host=redis_host,
                port=redis_port,
                db=redis_db,
                decode_responses=True,  # → str instead of bytes
            )

        return cls._client


    @classmethod
    def get_json(cls, key: str) -> Any | None:
        
        client = cls.get_client()
        if not client.exists(key):
            return None

        raw = client.get(key)
        try:
            data = json.loads(raw)
            while isinstance(data, str):
                data = json.loads(data)
            return data
        except json.JSONDecodeError:
            return raw

    @classmethod
    def set_json(cls, key: str, value: Any, **redis_kwargs) -> None:
        """
        Convenience wrapper: dumps `value` to JSON and writes to Redis.
        Extra kwargs (e.g. `ex=60`) are passed to `set`.
        """
        client = cls.get_client()
        client.set(key, json.dumps(value), **redis_kwargs)
    
    @classmethod
    def flush_db(cls) -> None:
        client = cls.get_client()
        client.flushdb()


    @classmethod
    def delete_json(cls, key: str) -> None:
        client = cls.get_client()
        if not client.exists(key):
            raise HTTPException(status_code=404, detail=f"{key} not found in cache")
        client.delete(key)