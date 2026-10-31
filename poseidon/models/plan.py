from datetime import datetime
from typing import Optional
from sqlalchemy import Boolean, DateTime, Float, ForeignKey, Integer, String, Text
from sqlalchemy.orm import Mapped, mapped_column, relationship
from poseidon.core.database import Base
from poseidon.models.base import CommonModelMixin


class Plan(Base, CommonModelMixin):
    __tablename__ = "plans"

    plan_code: Mapped[str] = mapped_column(String(64), unique=True, index=True)
    title: Mapped[str] = mapped_column(String(128))
    status: Mapped[str] = mapped_column(String(32), default="DRAFT")  # DRAFT, ACTIVE, SUPERSEDED
    active_version_number: Mapped[int] = mapped_column(Integer, default=1)

    versions: Mapped[list["PlanVersion"]] = relationship("PlanVersion", back_populates="plan", cascade="all, delete-orphan")


class PlanVersion(Base, CommonModelMixin):
    __tablename__ = "plan_versions"

    plan_id: Mapped[str] = mapped_column(String(64), ForeignKey("plans.id"), index=True)
    version_number: Mapped[int] = mapped_column(Integer, index=True)
    
    trigger_event: Mapped[str] = mapped_column(String(64))  # INITIAL_OPTIMIZATION, BRIDGE_CLOSURE_REPLAN
    trigger_description: Mapped[Optional[str]] = mapped_column(Text, nullable=True)

    # Operational Metrics
    total_resources_allocated: Mapped[int] = mapped_column(Integer, default=0)
    unmet_demand_count: Mapped[int] = mapped_column(Integer, default=0)
    fairness_index: Mapped[float] = mapped_column(Float, default=1.0)
    travel_penalty_score: Mapped[float] = mapped_column(Float, default=0.0)

    # Human-In-The-Loop Approval Authority
    status: Mapped[str] = mapped_column(String(32), default="PENDING_APPROVAL")  # PENDING_APPROVAL, APPROVED, REJECTED
    approved_by: Mapped[Optional[str]] = mapped_column(String(64), nullable=True)
    approved_at: Mapped[Optional[datetime]] = mapped_column(DateTime(timezone=True), nullable=True)

    # Explainability & Diff
    diff_summary_json: Mapped[Optional[str]] = mapped_column(Text, nullable=True)

    plan: Mapped["Plan"] = relationship("Plan", back_populates="versions")
    assignments: Mapped[list["Assignment"]] = relationship("Assignment", back_populates="plan_version", cascade="all, delete-orphan")


class Assignment(Base, CommonModelMixin):
    __tablename__ = "assignments"

    plan_version_id: Mapped[str] = mapped_column(String(64), ForeignKey("plan_versions.id"), index=True)
    depot_id: Mapped[str] = mapped_column(String(64), ForeignKey("depots.id"), index=True)
    zone_id: Mapped[str] = mapped_column(String(64), ForeignKey("zones.id"), index=True)
    route_id: Mapped[Optional[str]] = mapped_column(String(64), ForeignKey("routes.id"), nullable=True)

    resource_type: Mapped[str] = mapped_column(String(64))
    quantity_allocated: Mapped[int] = mapped_column(Integer, default=0)
    travel_time_min: Mapped[float] = mapped_column(Float, default=0.0)

    status: Mapped[str] = mapped_column(String(32), default="SCHEDULED")  # SCHEDULED, DISPATCHED, ACKNOWLEDGED, COMPLETED, CANCELLED
    underserved_reason: Mapped[Optional[str]] = mapped_column(String(64), nullable=True)  # supply_exhausted, no_feasible_route, deadline_infeasible

    plan_version: Mapped["PlanVersion"] = relationship("PlanVersion", back_populates="assignments")
    acknowledgements: Mapped[list["Acknowledgement"]] = relationship("Acknowledgement", back_populates="assignment")


class Acknowledgement(Base, CommonModelMixin):
    __tablename__ = "acknowledgements"

    assignment_id: Mapped[str] = mapped_column(String(64), ForeignKey("assignments.id"), index=True)
    device_id: Mapped[Optional[str]] = mapped_column(String(64), ForeignKey("devices.id"), nullable=True)
    transport: Mapped[str] = mapped_column(String(32), default="WIFI")  # WIFI, SMS, LORA
    status: Mapped[str] = mapped_column(String(32), default="RECEIVED")  # RECEIVED, ACCEPTED, EN_ROUTE, DELIVERED
    notes: Mapped[Optional[str]] = mapped_column(Text, nullable=True)

    assignment: Mapped["Assignment"] = relationship("Assignment", back_populates="acknowledgements")

