import asyncio
import time
from collections import OrderedDict
from typing import Any, Awaitable, Callable


class AsyncInFlightCache:
    def __init__(self, max_size: int = 1000):
        self.cache = OrderedDict[str, Any]()
        self.in_flight = dict[str, asyncio.Future[Any]]()
        self.lock = asyncio.Lock()
        self.max_size = max_size

    def check_if_exists(self, key: str) -> bool:
        return key in self.cache or key in self.in_flight

    def update_cache(self, key: str, data: Any) -> None:
        self.cache[key] = data

    def get_from_cache(self, key: str) -> Any:
        return self.cache[key]

    async def get_or_wait(
        self,
        key: str,
        compute_coroutine: Callable[[], Awaitable[Any]],
    ) -> Any:
        async with self.lock:
            if key in self.cache:
                return self.cache[key]

            if key in self.in_flight:
                fut = self.in_flight[key]
            else:
                fut = asyncio.Future()
                self.in_flight[key] = fut

        if not fut.done():
            try:
                result = await compute_coroutine()

                async with self.lock:
                    self.cache[key] = result
                    self.cache.move_to_end(key)
                    if len(self.cache) > self.max_size:
                        self.cache.popitem(last=False)

                    fut.set_result(result)
                    del self.in_flight[key]
            except Exception as e:
                async with self.lock:
                    fut.set_exception(e)
                    del self.in_flight[key]
                raise

        return await fut


class Cache:
    def __init__(
        self, cache: dict[str, dict[str, Any]] = dict(), expiration_s: int = 1000
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