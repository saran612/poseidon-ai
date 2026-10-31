from datetime import datetime
from typing import Optional
from sqlalchemy import Boolean, DateTime, Float, ForeignKey, Integer, String, Text
from sqlalchemy.orm import Mapped, mapped_column, relationship
from poseidon.core.database import Base
from poseidon.models.base import CommonModelMixin


class Message(Base, CommonModelMixin):
    __tablename__ = "messages"

    origin_id: Mapped[str] = mapped_column(String(64), index=True)
    device_id: Mapped[Optional[str]] = mapped_column(String(64), ForeignKey("devices.id"), nullable=True, index=True)
    
    # Timing
    observed_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), index=True)
    received_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), index=True)

    # Auth & Tier
    authenticated: Mapped[bool] = mapped_column(Boolean, default=False)
    authentication_status: Mapped[str] = mapped_column(String(32), default="UNVERIFIED")
    source_tier: Mapped[str] = mapped_column(String(8), default="T4")  # T1, T2, T3, T4

    # Geospatial
    latitude: Mapped[Optional[float]] = mapped_column(Float, nullable=True)
    longitude: Mapped[Optional[float]] = mapped_column(Float, nullable=True)
    location_precision_meters: Mapped[float] = mapped_column(Float, default=10.0)

    # Protocol
    sequence_number: Mapped[int] = mapped_column(Integer, default=0)
    protocol_version: Mapped[int] = mapped_column(Integer, default=1)
    message_type: Mapped[int] = mapped_column(Integer, default=1)
    people_affected: Mapped[int] = mapped_column(Integer, default=0)
    flags: Mapped[int] = mapped_column(Integer, default=0)

    # Payloads
    raw_payload_hex: Mapped[str] = mapped_column(Text)
    payload_json: Mapped[Optional[str]] = mapped_column(Text, nullable=True)
    is_synthetic: Mapped[bool] = mapped_column(Boolean, default=False)

    receipts: Mapped[list["TransportReceipt"]] = relationship(
        "TransportReceipt", back_populates="message", cascade="all, delete-orphan"
    )


class TransportReceipt(Base, CommonModelMixin):
    __tablename__ = "transport_receipts"

    message_id: Mapped[str] = mapped_column(String(64), ForeignKey("messages.id"), index=True)
    transport: Mapped[str] = mapped_column(String(32), index=True)  # WIFI, SMS, LORA
    received_at: Mapped[datetime] = mapped_column(DateTime(timezone=True))
    gateway_id: Mapped[Optional[str]] = mapped_column(String(64), nullable=True)
    signal_metrics_json: Mapped[Optional[str]] = mapped_column(Text, nullable=True)
    raw_packet_hex: Mapped[str] = mapped_column(Text)

    message: Mapped["Message"] = relationship("Message", back_populates="receipts")

