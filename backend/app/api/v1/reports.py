from uuid import UUID

from fastapi import APIRouter, Depends, HTTPException
from fastapi.responses import StreamingResponse
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.orm import selectinload

from app.api.deps import get_current_user
from app.db.session import get_db
from app.models.asset import MonitoredAsset
from app.models.user import User
from app.services.report_service import generate_pdf

router = APIRouter(
    prefix="/reports",
    tags=["Reports"],
)


@router.get("/{asset_id}")
async def download_report(
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
            detail="Asset not found.",
        )

    pdf = generate_pdf(
        asset=asset,
        breaches=asset.breaches,
    )

    return StreamingResponse(
        pdf,
        media_type="application/pdf",
        headers={
            "Content-Disposition":
            f'attachment; filename="BreachAlert_{asset.label}_Report.pdf"'
        },
    )