from uuid import UUID

import redis.asyncio as aioredis
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.orm import selectinload

from app.api.deps import get_current_user
from app.core.config import settings
from app.db.session import get_db
from app.models.asset import MonitoredAsset
from app.models.user import User
from app.services.hibp_client import HIBPClient
from app.services.scan_service import scan_asset
from app.services.security_advisor import generate_security_advice

router = APIRouter(
    prefix="/scans",
    tags=["Scans"],
)


@router.post("/{asset_id}")
async def trigger_scan(
    asset_id: UUID,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    result = await db.execute(
        select(MonitoredAsset)
        .options(selectinload(MonitoredAsset.breaches))
        .where(
            MonitoredAsset.id == asset_id,
            MonitoredAsset.user_id == current_user.id,
        )
    )

    asset = result.scalar_one_or_none()

    if asset is None:
        raise HTTPException(
            status_code=404,
            detail="Asset not found",
        )

    # Development mode:
    # Automatically verify the asset so scans can proceed.
    if not asset.is_verified:
        asset.is_verified = True
        await db.commit()
        await db.refresh(asset)

    redis = aioredis.from_url(
        settings.REDIS_URL,
        decode_responses=True,
    )

    try:
        hibp = HIBPClient(redis)

        new_breaches = await scan_asset(
            db=db,
            hibp=hibp,
            asset=asset,
            use_cache=True,
        )

        response_breaches = [
            {
                "name": breach.breach_name,
                "title": breach.breach_title,
                "date": breach.breach_date,
                "pwn_count": breach.pwn_count,
                "data_classes": breach.data_classes,
            }
            for breach in new_breaches
        ]

        advisor = generate_security_advice(response_breaches)

        return {
            "message": "Scan completed successfully.",
            "new_breaches_found": len(new_breaches),
            "breaches": response_breaches,
            "advisor": advisor,
        }

    finally:
        await redis.aclose()