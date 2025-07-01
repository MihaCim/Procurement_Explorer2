import os

import redis


def get_redis_client() -> redis.Redis:
    redis_host = os.getenv("REDIS_HOST")
    assert redis_host

    redis_port = os.getenv("REDIS_PORT")
    assert redis_port
    redis_port = int(redis_port)

    redis_db = os.getenv("REDIS_DB")
    assert redis_db
    redis_db = int(redis_db)

    return redis.Redis(
        host=redis_host, port=redis_port, db=redis_db, decode_responses=True
    )
