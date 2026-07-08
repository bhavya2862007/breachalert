from datetime import datetime

from pydantic import BaseModel, EmailStr


class AssetCreate(BaseModel):
    email: EmailStr
    label: str = "personal"


class AssetOut(BaseModel):
    id: str
    label: str
    email_masked: str
    status: str
    last_scanned_at: datetime | None
    breach_count: int

    model_config = {
        "from_attributes": True
    }