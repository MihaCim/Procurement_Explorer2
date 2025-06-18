import time
from typing import Any


class Cache:
    def __init__(
        self, cache: dict[str, dict[str, Any]] = dict(), expiration_s: int = 1800
    ) -> None:
        self.cache = cache
        self.expiration_s = expiration_s

    def eval_cache_value(self, cache_value: dict[str, Any]) -> bool:
        assert "result" in cache_value
        assert "time" in cache_value

        if time.time() - cache_value["time"] < self.expiration_s:
            return True
        else:
            return False

    def clean_cache(self) -> None:
        for endpoint in self.cache:
            for cache_str in self.cache[endpoint]:
                cache_value = self.cache[endpoint][cache_str]
                if not self.eval_cache_value(cache_value):
                    self.delete_cache(endpoint, cache_str)

    def delete_cache(self, endpoint: str, cache_str: str) -> None:
        assert endpoint in self.cache
        assert cache_str in self.cache[endpoint]
        del self.cache[endpoint][cache_str]
        self.clean_cache()

    def add_cache(self, endpoint: str, cache_str: str, result: Any) -> None:
        self.cache.setdefault(endpoint, {})[cache_str] = {
            "time": time.time(),
            "result": result,
        }
        self.clean_cache()

    def get_cache(self, endpoint: str, cache_str: str) -> Any | None:
        cache_endpoint = self.cache.setdefault(endpoint, {})
        if cache_str not in cache_endpoint:
            self.clean_cache()
            return None

        cache_value = cache_endpoint[cache_str]
        if self.eval_cache_value(cache_value):
            self.clean_cache()
            return cache_value["result"]
        else:
            self.delete_cache(endpoint, cache_str)

        self.clean_cache()
        return None
