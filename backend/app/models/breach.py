import uuid
from datetime import datetime

from sqlalchemy import DateTime, ForeignKey, Integer, JSON, String, func
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.db.base import Base


class BreachFinding(Base):
    __tablename__ = "breach_findings"

    id: Mapped[uuid.UUID] = mapped_column(
        primary_key=True,
        default=uuid.uuid4,
    )

    asset_id: Mapped[uuid.UUID] = mapped_column(
        ForeignKey("monitored_assets.id", ondelete="CASCADE")
    )

    breach_name: Mapped[str] = mapped_column(String(255))
    breach_title: Mapped[str] = mapped_column(String(255))

    breach_date: Mapped[datetime | None] = mapped_column(
        DateTime(timezone=True),
        nullable=True,
    )

    pwn_count: Mapped[int] = mapped_column(Integer, default=0)

    data_classes: Mapped[list] = mapped_column(JSON)

    description: Mapped[str | None] = mapped_column(
        String,
        nullable=True,
    )

    discovered_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True),
        server_default=func.now(),
    )

    asset = relationship(
        "MonitoredAsset",
        back_populates="breaches",
    )