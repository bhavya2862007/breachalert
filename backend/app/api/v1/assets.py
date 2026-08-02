from uuid import UUID
import secrets
from datetime import datetime, timedelta, timezone

from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.orm import selectinload

from app.api.deps import get_current_user
from app.core.config import settings
from app.core.security import (
    encrypt_email,
    decrypt_email,
    email_hash,
)
from app.db.session import get_db
from app.models.asset import MonitoredAsset
from app.models.user import User
from app.schemas.asset import (
    AssetCreate,
    AssetOut,
    AssetCreateResponse,
)
from app.services.email import (
    send_email,
    verification_email_html,
)

router = APIRouter(
    prefix="/assets",
    tags=["Assets"],
)


def mask_email(email: str) -> str:
    local, domain = email.split("@")

    if len(local) <= 2:
        masked = local[0] + "*"
    else:
        masked = (
            local[0]
            + "*" * (len(local) - 2)
            + local[-1]
        )

    return f"{masked}@{domain}"


# -------------------------------------------------------
# Create Asset
# -------------------------------------------------------

@router.post(
    "",
    response_model=AssetCreateResponse,
)
async def create_asset(
    body: AssetCreate,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    hashed = email_hash(body.email)

    existing = (
        await db.execute(
            select(MonitoredAsset).where(
                MonitoredAsset.user_id == current_user.id,
                MonitoredAsset.email_hash == hashed,
            )
        )
    ).scalar_one_or_none()

    if existing:
        raise HTTPException(
            status_code=400,
            detail="This email is already being monitored.",
        )

    token = secrets.token_urlsafe(32)

    asset = MonitoredAsset(
        user_id=current_user.id,
        email_encrypted=encrypt_email(body.email),
        email_hash=hashed,
        label=body.label,
        is_verified=False,
        verification_token=token,
        verification_expires_at=datetime.now(timezone.utc)
        + timedelta(hours=24),
    )

    db.add(asset)
    await db.commit()
    await db.refresh(asset)

    # Verification link
    verify_link = f"{settings.FRONTEND_URL}/verify/{token}"

    # Send verification email
    await send_email(
        to=body.email,
        subject="Verify your BreachAlert email",
        html=verification_email_html(verify_link),
    )

    return AssetCreateResponse(
        asset=AssetOut(
            id=str(asset.id),
            label=asset.label,
            email_masked=mask_email(body.email),
            status="Pending Verification",
            last_scanned_at=asset.last_scanned_at,
            breach_count=0,
        ),
        verification_url=verify_link,
    )


# -------------------------------------------------------
# List Assets
# -------------------------------------------------------

@router.get(
    "",
    response_model=list[AssetOut],
)
async def list_assets(
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    result = await db.execute(
        select(MonitoredAsset)
        .options(selectinload(MonitoredAsset.breaches))
        .where(
            MonitoredAsset.user_id == current_user.id
        )
    )

    assets = result.scalars().all()

    response = []

    for asset in assets:
        email = decrypt_email(asset.email_encrypted)

        response.append(
            AssetOut(
                id=str(asset.id),
                label=asset.label,
                email_masked=mask_email(email),
                status=(
                    "Verified"
                    if asset.is_verified
                    else "Pending Verification"
                ),
                last_scanned_at=asset.last_scanned_at,
                breach_count=len(asset.breaches),
            )
        )

    return response


# -------------------------------------------------------
# Delete Asset
# -------------------------------------------------------

@router.delete("/{asset_id}")
async def delete_asset(
    asset_id: UUID,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    result = await db.execute(
        select(MonitoredAsset).where(
            MonitoredAsset.id == asset_id,
            MonitoredAsset.user_id == current_user.id,
        )
    )

    asset = result.scalar_one_or_none()

    if asset is None:
        raise HTTPException(
            status_code=404,
            detail="Asset not found.",
        )

    await db.delete(asset)
    await db.commit()

    return {
        "message": "Asset deleted successfully."
    }