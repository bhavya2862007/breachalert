"""
HIBP integration layer.
Uses real HIBP API when a real API key is configured.
If HIBP_API_KEY=test, returns mock data for development.
"""

import asyncio
import json
import logging
from typing import Optional

import httpx
import redis.asyncio as aioredis

from app.core.config import settings

logger = logging.getLogger("hibp")

RATE_LIMIT_LOCK_KEY = "hibp:ratelimit:lock"
CACHE_PREFIX = "hibp:cache:"


class HIBPError(Exception):
    pass


class HIBPRateLimited(HIBPError):
    def __init__(self, retry_after: int):
        self.retry_after = retry_after
        super().__init__(f"Rate limited, retry after {retry_after}s")


class HIBPClient:
    def __init__(self, redis: aioredis.Redis):
        self.redis = redis
        self._headers = {
            "hibp-api-key": settings.HIBP_API_KEY,
            "user-agent": settings.HIBP_USER_AGENT,
            "Accept": "application/json",
        }

    async def _acquire_rate_slot(self):
        interval = settings.HIBP_RATE_LIMIT_MS / 1000

        while True:
            ok = await self.redis.set(
                RATE_LIMIT_LOCK_KEY,
                "1",
                nx=True,
                px=int(interval * 1000),
            )

            if ok:
                return

            ttl = await self.redis.pttl(RATE_LIMIT_LOCK_KEY)
            await asyncio.sleep(max(ttl, 50) / 1000)

    async def _cache_get(self, key: str):
        return await self.redis.get(CACHE_PREFIX + key)

    async def _cache_set(self, key: str, payload: str):
        await self.redis.set(
            CACHE_PREFIX + key,
            payload,
            ex=settings.HIBP_CACHE_TTL,
        )

    async def get_breaches_for_account(
        self,
        email: str,
        email_bidx: str,
        use_cache: bool = True,
    ):
        #
        # DEVELOPMENT MODE
        #
        if settings.HIBP_API_KEY.lower() == "test":
            logger.info("Using mock HIBP response.")

            return [
                {
                    "Name": "Adobe",
                    "Title": "Adobe",
                    "BreachDate": "2013-10-04",
                    "PwnCount": 152445165,
                    "DataClasses": [
                        "Email addresses",
                        "Passwords",
                        "Usernames",
                    ],
                    "Description": "Mock breach returned for development.",
                }
            ]

        if use_cache:
            cached = await self._cache_get(email_bidx)

            if cached:
                return json.loads(cached)

        url = f"{settings.HIBP_BASE_URL}/breachedaccount/{email}"

        params = {
            "truncateResponse": "false",
        }

        result = await self._request_with_retry(url, params)

        await self._cache_set(
            email_bidx,
            json.dumps(result),
        )

        return result

    async def _request_with_retry(
        self,
        url,
        params,
        max_retries=3,
    ):
        for attempt in range(max_retries):
            await self._acquire_rate_slot()

            try:
                async with httpx.AsyncClient(timeout=20) as client:
                    response = await client.get(
                        url,
                        headers=self._headers,
                        params=params,
                    )

                if response.status_code == 200:
                    return response.json()

                if response.status_code == 404:
                    return []

                if response.status_code == 429:
                    retry = int(
                        response.headers.get(
                            "retry-after",
                            2,
                        )
                    )

                    await asyncio.sleep(retry)
                    continue

                if response.status_code == 401:
                    raise HIBPError("Invalid API key")

                response.raise_for_status()

            except httpx.RequestError:
                await asyncio.sleep(2**attempt)

        raise HIBPError("HIBP request failed.")


async def get_redis():
    return aioredis.from_url(
        settings.REDIS_URL,
        decode_responses=True,
    )