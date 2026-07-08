from datetime import datetime

from pydantic import BaseModel


class BreachOut(BaseModel):
    breach_name: str
    breach_title: str
    breach_date: datetime | None
    pwn_count: int
    data_classes: list[str]
    description: str | None

    model_config = {
        "from_attributes": True
    }