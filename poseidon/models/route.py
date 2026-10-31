from datetime import datetime
from typing import Optional
from sqlalchemy import Boolean, DateTime, Float, ForeignKey, Integer, String, Text
from sqlalchemy.orm import Mapped, mapped_column, relationship
from poseidon.core.database import Base
from poseidon.models.base import CommonModelMixin


class RoadSegment(Base, CommonModelMixin):
    __tablename__ = "road_segments"

    segment_code: Mapped[str] = mapped_column(String(64), unique=True, index=True)
    osm_way_id: Mapped[Optional[str]] = mapped_column(String(64), nullable=True, index=True)
    name: Mapped[str] = mapped_column(String(128), index=True)
    highway_type: Mapped[str] = mapped_column(String(64), default="primary")
    
    # Bridge and flood vulnerability
    is_bridge: Mapped[bool] = mapped_column(Boolean, default=False)
    crosses_waterway: Mapped[Optional[str]] = mapped_column(String(128), nullable=True)

    # Geometry
    start_lat: Mapped[float] = mapped_column(Float)
    start_lon: Mapped[float] = mapped_column(Float)
    end_lat: Mapped[float] = mapped_column(Float)
    end_lon: Mapped[float] = mapped_column(Float)

    # Asymmetric Safety Status
    status: Mapped[str] = mapped_column(String(32), default="OPEN")  # OPEN, CLOSED, RESTRICTED
    status_source_tier: Mapped[str] = mapped_column(String(8), default="T1")
    status_updated_at: Mapped[Optional[datetime]] = mapped_column(DateTime(timezone=True), nullable=True)
    closure_reason: Mapped[Optional[str]] = mapped_column(Text, nullable=True)
    status_evidence_id: Mapped[Optional[str]] = mapped_column(String(64), nullable=True)


class Route(Base, CommonModelMixin):
    __tablename__ = "routes"

    route_code: Mapped[str] = mapped_column(String(64), unique=True, index=True)
    origin_name: Mapped[str] = mapped_column(String(128))
    destination_name: Mapped[str] = mapped_column(String(128))

    origin_lat: Mapped[float] = mapped_column(Float)
    origin_lon: Mapped[float] = mapped_column(Float)
    dest_lat: Mapped[float] = mapped_column(Float)
    dest_lon: Mapped[float] = mapped_column(Float)

    distance_km: Mapped[float] = mapped_column(Float, default=0.0)
    estimated_duration_min: Mapped[float] = mapped_column(Float, default=0.0)
    is_viable: Mapped[bool] = mapped_column(Boolean, default=True)
    invalidated_reason: Mapped[Optional[str]] = mapped_column(Text, nullable=True)

    waypoints_json: Mapped[Optional[str]] = mapped_column(Text, nullable=True)

