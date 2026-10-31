from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
from typing import List, Optional
from backend.core.state import get_system_state

router = APIRouter()
state = get_system_state()


class DeviceRegisterRequest(BaseModel):
    numeric_id: int
    device_code: str
    role: str  # T1, T2, T3, T4
    secret_key_hex: str
    owner_name: str


@router.get("/devices")
async def list_devices():
    result = []
    for num_id, dev in state.router.devices.items():
        result.append({
            "numeric_id": num_id,
            "device_code": dev.device_code,
            "role": dev.role,
            "owner_name": dev.owner_name,
            "is_revoked": dev.is_revoked,
            "reputation": state.trust_engine.get_reputation(dev.device_code),
        })
    return {"devices": result}


@router.post("/devices")
async def register_device(payload: DeviceRegisterRequest):
    try:
        secret_bytes = bytes.fromhex(payload.secret_key_hex)
    except Exception:
        secret_bytes = payload.secret_key_hex.encode("utf-8")

    state.router.register_device(
        numeric_id=payload.numeric_id,
        device_code=payload.device_code,
        role=payload.role,
        secret_key=secret_bytes,
        owner_name=payload.owner_name,
    )
    return {"status": "registered", "device_code": payload.device_code}


@router.post("/devices/{numeric_id}/revoke")
async def revoke_device(numeric_id: int):
    if numeric_id not in state.router.devices:
        raise HTTPException(status_code=404, detail="Device not found")
    state.router.revoke_device(numeric_id)
    return {"status": "revoked", "numeric_id": numeric_id}

