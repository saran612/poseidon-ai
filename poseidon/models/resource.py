from typing import Optional
from sqlalchemy import Boolean, Float, ForeignKey, Integer, String, Text
from sqlalchemy.orm import Mapped, mapped_column, relationship
from poseidon.core.database import Base
from poseidon.models.base import CommonModelMixin


class Depot(Base, CommonModelMixin):
    __tablename__ = "depots"

    depot_code: Mapped[str] = mapped_column(String(64), unique=True, index=True)
    name: Mapped[str] = mapped_column(String(128), index=True)
    latitude: Mapped[float] = mapped_column(Float)
    longitude: Mapped[float] = mapped_column(Float)
    is_operational: Mapped[bool] = mapped_column(Boolean, default=True)

    capacity_boats: Mapped[int] = mapped_column(Integer, default=5)
    capacity_medical_kits: Mapped[int] = mapped_column(Integer, default=100)
    capacity_ration_packs: Mapped[int] = mapped_column(Integer, default=500)
    capacity_rescue_teams: Mapped[int] = mapped_column(Integer, default=4)

    resources: Mapped[list["Resource"]] = relationship("Resource", back_populates="depot")


class Resource(Base, CommonModelMixin):
    __tablename__ = "resources"

    depot_id: Mapped[str] = mapped_column(String(64), ForeignKey("depots.id"), index=True)
    resource_type: Mapped[str] = mapped_column(String(64), index=True)  # BOAT, MEDICAL_KIT, RATION_PACK, RESCUE_TEAM
    quantity_available: Mapped[int] = mapped_column(Integer, default=0)
    quantity_allocated: Mapped[int] = mapped_column(Integer, default=0)
    unit: Mapped[str] = mapped_column(String(32), default="units")

    depot: Mapped["Depot"] = relationship("Depot", back_populates="resources")


class Shelter(Base, CommonModelMixin):
    __tablename__ = "shelters"

    shelter_code: Mapped[str] = mapped_column(String(64), unique=True, index=True)
    name: Mapped[str] = mapped_column(String(128), index=True)
    latitude: Mapped[float] = mapped_column(Float)
    longitude: Mapped[float] = mapped_column(Float)

    capacity_people: Mapped[int] = mapped_column(Integer, default=200)
    current_occupancy: Mapped[int] = mapped_column(Integer, default=0)
    has_medical_station: Mapped[bool] = mapped_column(Boolean, default=True)
    has_power_backup: Mapped[bool] = mapped_column(Boolean, default=True)
    is_accessible: Mapped[bool] = mapped_column(Boolean, default=True)
    contact_phone: Mapped[Optional[str]] = mapped_column(String(32), nullable=True)

