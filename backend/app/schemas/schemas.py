from datetime import datetime
from typing import Optional

from pydantic import BaseModel, EmailStr, Field


class UserCreate(BaseModel):
    email: EmailStr
    password: str = Field(min_length=8, max_length=128)
    full_name: Optional[str] = None


class UserOut(BaseModel):
    id: str
    email: EmailStr
    full_name: str
    plan: str

    class Config:
        from_attributes = True


class TokenResponse(BaseModel):
    access_token: str
    refresh_token: str
    token_type: str = "bearer"


class AssetCreate(BaseModel):
    email: EmailStr
    label: str = Field(default="personal", max_length=50)


class FindingOut(BaseModel):
    breach_name: str
    title: str
    breach_date: Optional[str]
    data_classes: list[str]
    pwn_count: int
    discovered_at: datetime


class AssetOut(BaseModel):
    id: str
    label: str
    email_masked: str
    status: str
    last_scanned_at: Optional[datetime]
    breach_count: int
    findings: list[FindingOut]
    advice: list[dict]