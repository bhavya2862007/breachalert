from pydantic import BaseModel, EmailStr


class UserOut(BaseModel):
    id: str
    email: EmailStr
    full_name: str | None
    plan: str

    model_config = {
        "from_attributes": True
    }