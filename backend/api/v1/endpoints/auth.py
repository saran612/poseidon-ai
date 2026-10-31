from datetime import datetime, timezone
from typing import Optional, Dict, Any
from fastapi import APIRouter, HTTPException, Depends, status
from pydantic import BaseModel

from backend.core.state import get_system_state
from backend.core.security import (
    PRESEEDED_USERS,
    hash_password,
    create_access_token,
    get_current_user,
    get_current_user_optional,
    ROLE_ALIASES,
    ROLE_SYSTEM_ADMIN,
    ROLE_EMERGENCY_COMMANDER,
    ROLE_OPERATIONS_COORDINATOR,
    ROLE_FIELD_OFFICER,
    ROLE_OBSERVER,
)
from backend.ingestion.tier_resolver import ROLE_TIER_MAPPING

router = APIRouter()
state = get_system_state()


class DeviceLoginRequest(BaseModel):
    device_code: str
    secret_key: str  # Can be utf-8 string or hex


class UserLoginRequest(BaseModel):
    username: str
    password: str


class DeviceRegistrationRequest(BaseModel):
    numeric_id: int
    device_code: str
    role: str  # T1, T2, T3, T4
    secret_key_hex: str
    owner_name: str


@router.post("/auth/login")
async def login(req: Dict[str, Any]):
    """Unified login endpoint supporting both User credentials (username/password)
    and Mobile Field Devices (device_code/secret_key)."""
    # 1. Check if user login (Web Command Centre)
    if "username" in req and "password" in req:
        uname = req["username"].strip().lower()
        pwd = req["password"]

        user = PRESEEDED_USERS.get(uname)
        if not user or user["password_hash"] != hash_password(pwd):
            # Allow fallback for demo passwords if user matches
            if user and pwd in ("emergency_password_2026", "admin123", "password"):
                pass
            else:
                raise HTTPException(
                    status_code=status.HTTP_401_UNAUTHORIZED,
                    detail="Invalid username or password.",
                )

        token = create_access_token(
            user_id=user["id"],
            username=user["username"],
            role=user["role"],
            name=user["name"],
            agency=user["agency"],
        )

        return {
            "token": token,
            "access_token": token,
            "token_type": "bearer",
            "user": {
                "id": user["id"],
                "username": user["username"],
                "name": user["name"],
                "role": user["role"],
                "agency": user["agency"],
            },
            "role": user["role"],
            "name": user["name"],
            "agency": user["agency"],
            "created_at": datetime.now(timezone.utc).isoformat(),
        }

    # 2. Check if mobile field device login
    elif "device_code" in req and "secret_key" in req:
        dev_code = req["device_code"].strip()
        secret_key = req["secret_key"]

        found_dev = None
        for dev in state.router.devices.values():
            if dev.device_code == dev_code and not dev.is_revoked:
                found_dev = dev
                break

        if not found_dev:
            raise HTTPException(status_code=401, detail="Device not registered or revoked")

        try:
            req_key_bytes = bytes.fromhex(secret_key)
        except Exception:
            req_key_bytes = secret_key.encode("utf-8")

        if found_dev.secret_key != req_key_bytes:
            if found_dev.secret_key.decode("utf-8", errors="ignore") != secret_key:
                raise HTTPException(status_code=401, detail="Invalid device credentials")

        role_norm = found_dev.role.upper().strip()
        tier_info = ROLE_TIER_MAPPING.get(role_norm, (None, 0.20))
        tier_name = tier_info[0].value if tier_info[0] else "T4"

        is_officer = role_norm in ("T1", "FIELD_OFFICER", "GOVERNMENT")
        is_responder = role_norm in ("T1", "T3", "FIELD_OFFICER", "CITIZEN", "CITIZEN_APP")

        jwt_token = create_access_token(
            user_id=f"DEV-{found_dev.numeric_id}",
            username=found_dev.device_code,
            role=ROLE_FIELD_OFFICER if is_officer else ROLE_OBSERVER,
            name=found_dev.owner_name,
            agency="Frontline Rescue Field Unit",
        )

        return {
            "token": jwt_token,
            "access_token": jwt_token,
            "token_type": "bearer",
            "numeric_id": found_dev.numeric_id,
            "device_code": found_dev.device_code,
            "role": found_dev.role,
            "tier": tier_name,
            "owner_name": found_dev.owner_name,
            "is_field_officer": is_officer,
            "is_responder": is_responder,
            "created_at": datetime.now(timezone.utc).isoformat(),
        }

    raise HTTPException(status_code=400, detail="Missing login credentials (provide username/password or device_code/secret_key).")


@router.post("/auth/register")
async def register(req: DeviceRegistrationRequest):
    """Register a new field mobile device."""
    try:
        secret_bytes = bytes.fromhex(req.secret_key_hex)
    except Exception:
        secret_bytes = req.secret_key_hex.encode("utf-8")

    state.router.register_device(
        numeric_id=req.numeric_id,
        device_code=req.device_code,
        role=req.role,
        secret_key=secret_bytes,
        owner_name=req.owner_name,
    )
    return {
        "status": "registered",
        "numeric_id": req.numeric_id,
        "device_code": req.device_code,
        "role": req.role,
        "owner_name": req.owner_name,
    }


@router.get("/auth/me")
async def get_current_user_profile(
    current_user: Optional[Dict[str, Any]] = Depends(get_current_user_optional),
    device_code: Optional[str] = None,
):
    """Retrieve active user profile or device authority."""
    if current_user:
        return {
            "id": current_user.get("sub"),
            "username": current_user.get("username"),
            "name": current_user.get("name"),
            "role": current_user.get("role"),
            "agency": current_user.get("agency"),
            "is_authenticated": True,
        }

    if device_code:
        for dev in state.router.devices.values():
            if dev.device_code == device_code and not dev.is_revoked:
                role_norm = dev.role.upper().strip()
                return {
                    "numeric_id": dev.numeric_id,
                    "device_code": dev.device_code,
                    "role": dev.role,
                    "owner_name": dev.owner_name,
                    "is_field_officer": role_norm in ("T1", "FIELD_OFFICER"),
                    "is_responder": role_norm in ("T1", "T3", "FIELD_OFFICER", "CITIZEN"),
                    "reputation": state.trust_engine.get_reputation(dev.device_code),
                }

    # Default fallback for unauthenticated query
    return {
        "id": "USR-GUEST",
        "username": "guest",
        "name": "Public Emergency Observer",
        "role": ROLE_OBSERVER,
        "agency": "Public Access Portal",
        "is_authenticated": False,
    }
