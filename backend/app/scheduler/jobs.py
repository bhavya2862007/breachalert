from sqlalchemy import select
from sqlalchemy.orm import selectinload

import redis.asyncio as aioredis

from app.db.session import AsyncSessionLocal
from app.models.asset import MonitoredAsset
from app.services.hibp_client import HIBPClient
from app.services.scan_service import scan_asset
from app.core.config import settings


async def scan_all_assets():
    print("🚀 Starting scheduled scan...")

    async with AsyncSessionLocal() as db:

        result = await db.execute(
    select(MonitoredAsset)
    .options(selectinload(MonitoredAsset.breaches))
    .where(MonitoredAsset.is_verified == True)
)

        assets = result.scalars().all()

        if not assets:
            print("📭 No verified assets found.")
            return

        redis = aioredis.from_url(
            settings.REDIS_URL,
            decode_responses=True,
        )

        hibp = HIBPClient(redis)

        try:

            for asset in assets:
                print(f"🔍 Scanning {asset.label}")

                try:
                    await scan_asset(
                        db=db,
                        hibp=hibp,
                        asset=asset,
                        use_cache=True,
                    )

                except Exception as e:
                    print(
                        f"❌ Failed scanning {asset.id}: {e}"
                    )

        finally:
            await redis.aclose()

    print("✅ Scheduled scan completed.")