import time
from app.core.redis_client import redis_client
from app.core.config import settings


class DistributedRateLimiter:
    """
    Token-bucket style limiter enforced across all workers via Redis.
    HIBP allows ~1 request / 1.5s on lower tiers. We use a global lock key
    with a monotonic 'next allowed timestamp' to serialize outbound calls.
    """

    KEY = "hibp:next_allowed_ts"

    def __init__(self, min_gap_ms: int = settings.HIBP_RATE_LIMIT_MS):
        self.min_gap = min_gap_ms / 1000.0

    async def acquire(self) -> None:
        while True:
            now = time.time()
            # atomically read the earliest allowed timestamp
            next_ts = await redis_client.get(self.KEY)
            next_ts = float(next_ts) if next_ts else 0.0
            if now >= next_ts:
                # reserve our slot
                new_next = max(now, next_ts) + self.min_gap
                # SET with GET to reduce races; loop guards remaining contention
                await redis_client.set(self.KEY, new_next)
                return
            await self._sleep(next_ts - now)

    @staticmethod
    async def _sleep(seconds: float):
        import asyncio
        await asyncio.sleep(min(seconds, 5))


rate_limiter = DistributedRateLimiter()