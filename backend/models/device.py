from datetime import datetime
from typing import Optional
from sqlalchemy import BigInteger, Boolean, DateTime, ForeignKey, Integer, String, Text
from sqlalchemy.orm import Mapped, mapped_column, relationship
from backend.core.database import Base
from backend.models.base import CommonModelMixin


class Device(Base, CommonModelMixin):
    __tablename__ = "devices"

    numeric_id: Mapped[int] = mapped_column(Integer, unique=True, index=True)
    device_code: Mapped[str] = mapped_column(String(64), unique=True, index=True)
    role: Mapped[str] = mapped_column(String(32), default="T3")  # T1, T2, T3, T4
    owner_name: Mapped[Optional[str]] = mapped_column(String(128), nullable=True)
    organization: Mapped[Optional[str]] = mapped_column(String(128), nullable=True)
    status: Mapped[str] = mapped_column(String(32), default="ACTIVE")  # ACTIVE, REVOKED, SUSPENDED

    # Replay protection state
    highest_counter: Mapped[int] = mapped_column(BigInteger, default=0)
    replay_bitmap: Mapped[int] = mapped_column(BigInteger, default=0)  # 64-bit window bitmask
    last_seen_at: Mapped[Optional[datetime]] = mapped_column(DateTime(timezone=True), nullable=True)

    credentials: Mapped[list["DeviceCredential"]] = relationship(
        "DeviceCredential", back_populates="device", cascade="all, delete-orphan"
    )


class DeviceCredential(Base, CommonModelMixin):
    __tablename__ = "device_credentials"

    device_id: Mapped[str] = mapped_column(String(64), ForeignKey("devices.id"), index=True)
    pre_shared_key: Mapped[str] = mapped_column(String(256))  # Hex or base64 key
    algorithm: Mapped[str] = mapped_column(String(32), default="HMAC-SHA256")
    is_revoked: Mapped[bool] = mapped_column(Boolean, default=False)
    revoked_reason: Mapped[Optional[str]] = mapped_column(Text, nullable=True)

    device: Mapped["Device"] = relationship("Device", back_populates="credentials")

