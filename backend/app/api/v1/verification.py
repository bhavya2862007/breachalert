from datetime import datetime

from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.db.session import get_db
from app.models.asset import MonitoredAsset

router = APIRouter(
    prefix="/verify",
    tags=["Verification"],
)


@router.get("/{token}")
async def verify_email(
    token: str,
    db: AsyncSession = Depends(get_db),
):
    result = await db.execute(
        select(MonitoredAsset).where(
            MonitoredAsset.verification_token == token
        )
    )

    asset = result.scalar_one_or_none()

    if asset is None:
        raise HTTPException(
            status_code=404,
            detail="Invalid verification token."
        )

    if (
        asset.verification_expires_at
        and asset.verification_expires_at < datetime.now()
    ):
        raise HTTPException(
            status_code=400,
            detail="Verification token expired."
        )

    asset.is_verified = True
    asset.verification_token = None
    asset.verification_expires_at = None

    await db.commit()

    return {
        "message": "Email verified successfully ✅"
    }