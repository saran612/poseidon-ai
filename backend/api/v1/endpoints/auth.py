from datetime import datetime, timezone
from typing import Optional
from fastapi import APIRouter, HTTPException, Depends
from pydantic import BaseModel
from backend.core.state import get_system_state
from backend.ingestion.tier_resolver import ROLE_TIER_MAPPING

router = APIRouter()
state = get_system_state()


class LoginRequest(BaseModel):
    device_code: str
    secret_key: str  # Can be utf-8 string or hex


class DeviceRegistrationRequest(BaseModel):
    numeric_id: int
    device_code: str
    role: str  # T1, T2, T3, T4
    secret_key_hex: str
    owner_name: str


class SessionResponse(BaseModel):
    token: str
    numeric_id: int
    device_code: str
    role: str
    tier: str
    owner_name: str
    is_field_officer: bool
    is_responder: bool
    created_at: str


@router.post("/auth/login")
async def login(req: LoginRequest):
    """Authenticate a field device or responder using pre-shared device credentials."""
    found_dev = None
    for dev in state.router.devices.values():
        if dev.device_code == req.device_code and not dev.is_revoked:
            found_dev = dev
            break

    if not found_dev:
        raise HTTPException(status_code=401, detail="Device not registered or revoked")

    # Match key either directly or as hex
    try:
        req_key_bytes = bytes.fromhex(req.secret_key)
    except Exception:
        req_key_bytes = req.secret_key.encode("utf-8")

    if found_dev.secret_key != req_key_bytes:
        # Also check utf-8 encoded secret key representation
        if found_dev.secret_key.decode("utf-8", errors="ignore") != req.secret_key:
            raise HTTPException(status_code=401, detail="Invalid device credentials")

    role_norm = found_dev.role.upper().strip()
    tier_info = ROLE_TIER_MAPPING.get(role_norm, (None, 0.20))
    tier_name = tier_info[0].value if tier_info[0] else "T4"

    is_officer = role_norm in ("T1", "FIELD_OFFICER", "GOVERNMENT")
    is_responder = role_norm in ("T1", "T3", "FIELD_OFFICER", "CITIZEN", "CITIZEN_APP")

    token = f"poseidon-token-{found_dev.device_code}-{datetime.now(timezone.utc).timestamp()}"

    return {
        "token": token,
        "numeric_id": found_dev.numeric_id,
        "device_code": found_dev.device_code,
        "role": found_dev.role,
        "tier": tier_name,
        "owner_name": found_dev.owner_name,
        "is_field_officer": is_officer,
        "is_responder": is_responder,
        "created_at": datetime.now(timezone.utc).isoformat(),
    }


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
async def get_current_device_profile(device_code: str = "DEV-OFFICER-PERUR"):
    """Get active device profile and authority."""
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
    raise HTTPException(status_code=404, detail="Device not found")
