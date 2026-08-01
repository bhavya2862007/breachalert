import json
import httpx
from app.core.config import settings
from app.core.redis_client import redis_client
from app.core.security import email_hash
from app.core.logging import logger
from app.services.rate_limiter import rate_limiter


class HIBPError(Exception):
    pass


class HIBPClient:
    """
    Isolated module responsible ONLY for talking to Have I Been Pwned.
    Includes: Redis caching (24h), distributed rate limiting, retries.
    """

    def __init__(self):
        self.base = settings.HIBP_BASE_URL
        self.headers = {
            "hibp-api-key": settings.HIBP_API_KEY,
            "user-agent": "BreachAlert-Monitor/1.0",
        }

    def _cache_key(self, email: str) -> str:
        return f"hibp:breaches:{email_hash(email)}"

    async def get_breaches(self, email: str, use_cache: bool = True) -> list[dict]:
        """Return list of breach metadata for an email (may be empty)."""
        ck = self._cache_key(email)

        if use_cache:
            cached = await redis_client.get(ck)
            if cached is not None:
                logger.info("HIBP cache hit", extra={"email_hash": email_hash(email)})
                return json.loads(cached)

        result = await self._request_with_retry(email)
        # Cache both HITs and empty results for 24h to protect rate limits
        await redis_client.setex(ck, settings.HIBP_CACHE_TTL, json.dumps(result))
        return result

    async def _request_with_retry(self, email: str, attempts: int = 3) -> list[dict]:
        url = f"{self.base}/breachedaccount/{httpx.URL(email).raw_path.decode() if False else email}"
        params = {"truncateResponse": "false"}

        for attempt in range(1, attempts + 1):
            await rate_limiter.acquire()
            try:
                async with httpx.AsyncClient(timeout=20) as client:
                    resp = await client.get(
                        f"{self.base}/breachedaccount/{email}",
                        headers=self.headers,
                        params=params,
                    )
            except httpx.RequestError as e:
                logger.warning(f"HIBP network error attempt {attempt}: {e}")
                continue

            if resp.status_code == 200:
                return self._normalize(resp.json())
            if resp.status_code == 404:
                return []  # No breaches — good news
            if resp.status_code == 429:
                retry_after = int(resp.headers.get("retry-after", "3"))
                logger.warning(f"HIBP 429 — backing off {retry_after}s")
                import asyncio
                await asyncio.sleep(retry_after)
                continue
            if resp.status_code in (401, 403):
                raise HIBPError("Invalid or unauthorized HIBP API key")
            resp.raise_for_status()

        raise HIBPError("HIBP request failed after retries")

    @staticmethod
    def _normalize(raw: list[dict]) -> list[dict]:
        """Keep only non-sensitive metadata fields."""
        return [
            {
                "name": b.get("Name"),
                "title": b.get("Title"),
                "domain": b.get("Domain"),
                "breach_date": b.get("BreachDate"),
                "pwn_count": b.get("PwnCount", 0),
                "description": (b.get("Description") or "")[:1900],
                "data_classes": b.get("DataClasses", []),
            }
            for b in raw
        ]


hibp_client = HIBPClient()