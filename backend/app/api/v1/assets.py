print("1")
from fastapi import APIRouter, Depends, HTTPException

print("2")
from sqlalchemy.ext.asyncio import AsyncSession

print("3")
from sqlalchemy import select, func

print("4")
from app.db.session import get_db

print("5")
from app.api.deps import get_current_user

print("6")
from app.models.user import User

print("7")
from app.models.asset import MonitoredAsset

print("8")
from app.schemas.asset import AssetCreate, AssetOut

print("9")
from app.core.security import (
    encrypt_email,
    email_hash,
    make_verify_token,
    read_verify_token,
)

print("10")
from app.core.config import settings

print("11")
from app.services.notifier import send_email, verification_email_html

print("12")
from app.workers.tasks import scan_asset

print("13")
router = APIRouter(prefix="/assets", tags=["assets"])