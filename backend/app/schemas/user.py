from uuid import UUID

from pydantic import BaseModel, EmailStr, ConfigDict


class UserOut(BaseModel):
    id: UUID
    email: EmailStr
    full_name: str | None
    plan: str

    model_config = ConfigDict(from_attributes=True)