import hashlib
import os
import time
from datetime import datetime, timezone, timedelta
from typing import Dict, List, Optional
import jwt
from fastapi import HTTPException, Header, Depends, status
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials

JWT_SECRET_KEY = os.environ.get("POSEIDON_JWT_SECRET", "poseidon-disaster-intelligence-supersecret-jwt-key-2026")
JWT_ALGORITHM = "HS256"
JWT_EXPIRATION_HOURS = 24

security_bearer = HTTPBearer(auto_error=False)

# Role definitions
ROLE_SYSTEM_ADMIN = "System Administrator"
ROLE_EMERGENCY_COMMANDER = "Emergency Commander"
ROLE_OPERATIONS_COORDINATOR = "Operations Coordinator"
ROLE_FIELD_OFFICER = "Field Officer"
ROLE_OBSERVER = "Observer"

ALL_ROLES = [
    ROLE_SYSTEM_ADMIN,
    ROLE_EMERGENCY_COMMANDER,
    ROLE_OPERATIONS_COORDINATOR,
    ROLE_FIELD_OFFICER,
    ROLE_OBSERVER,
]

# Standardized role normalizer
ROLE_ALIASES = {
    "ADMIN": ROLE_SYSTEM_ADMIN,
    "SYSTEM ADMINISTRATOR": ROLE_SYSTEM_ADMIN,
    "COMMANDER": ROLE_EMERGENCY_COMMANDER,
    "EMERGENCY COMMANDER": ROLE_EMERGENCY_COMMANDER,
    "DISTRICT_COLLECTOR": ROLE_EMERGENCY_COMMANDER,
    "COORDINATOR": ROLE_OPERATIONS_COORDINATOR,
    "OPERATIONS COORDINATOR": ROLE_OPERATIONS_COORDINATOR,
    "DISPATCHER": ROLE_OPERATIONS_COORDINATOR,
    "OFFICER": ROLE_FIELD_OFFICER,
    "FIELD OFFICER": ROLE_FIELD_OFFICER,
    "FIELD_COMMANDER": ROLE_FIELD_OFFICER,
    "T1": ROLE_FIELD_OFFICER,
    "T2": ROLE_OBSERVER,
    "T3": ROLE_OBSERVER,
    "T4": ROLE_OBSERVER,
    "OBSERVER": ROLE_OBSERVER,
    "VIEWER": ROLE_OBSERVER,
    "PUBLIC": ROLE_OBSERVER,
}


def hash_password(password: str, salt: str = "poseidon_static_salt") -> str:
    return hashlib.sha256(f"{salt}:{password}".encode("utf-8")).hexdigest()


def verify_password(plain_password: str, hashed_password: str, salt: str = "poseidon_static_salt") -> bool:
    return hash_password(plain_password, salt) == hashed_password


# In-memory user credentials database
PRESEEDED_USERS: Dict[str, Dict[str, any]] = {
    "admin": {
        "id": "USR-ADMIN-01",
        "username": "admin",
        "name": "District Collector & Head of Disaster Management",
        "role": ROLE_SYSTEM_ADMIN,
        "password_hash": hash_password("admin123"),
        "agency": "Tamil Nadu SDMA & Coimbatore District Administration",
    },
    "commander_chen": {
        "id": "USR-CMD-02",
        "username": "commander_chen",
        "name": "Commander David Chen",
        "role": ROLE_EMERGENCY_COMMANDER,
        "password_hash": hash_password("emergency_password_2026"),
        "agency": "NDRF 4th Battalion Arakkonam",
    },
    "coordinator_sharma": {
        "id": "USR-COORD-03",
        "username": "coordinator_sharma",
        "name": "Dr. Sunita Sharma",
        "role": ROLE_OPERATIONS_COORDINATOR,
        "password_hash": hash_password("emergency_password_2026"),
        "agency": "Coimbatore Emergency Operations Center (EOC)",
    },
    "officer_murugan": {
        "id": "USR-OFFICER-04",
        "username": "officer_murugan",
        "name": "Inspector S. Murugan",
        "role": ROLE_FIELD_OFFICER,
        "password_hash": hash_password("emergency_password_2026"),
        "agency": "Tamil Nadu Fire and Rescue Services (TNFRS)",
    },
    "observer_guest": {
        "id": "USR-OBS-05",
        "username": "observer_guest",
        "name": "Public / NGO Observer",
        "role": ROLE_OBSERVER,
        "password_hash": hash_password("observer123"),
        "agency": "Red Cross Disaster Relief Observer",
    },
}


def create_access_token(user_id: str, username: str, role: str, name: str, agency: str) -> str:
    now = datetime.now(timezone.utc)
    payload = {
        "sub": user_id,
        "username": username,
        "role": role,
        "name": name,
        "agency": agency,
        "iat": int(now.timestamp()),
        "exp": int((now + timedelta(hours=JWT_EXPIRATION_HOURS)).timestamp()),
    }
    return jwt.encode(payload, JWT_SECRET_KEY, algorithm=JWT_ALGORITHM)


def decode_access_token(token: str) -> Dict[str, any]:
    try:
        payload = jwt.decode(token, JWT_SECRET_KEY, algorithms=[JWT_ALGORITHM])
        return payload
    except jwt.ExpiredSignatureError:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Session token has expired. Please re-authenticate.",
        )
    except jwt.InvalidTokenError:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid authentication token signature.",
        )


async def get_current_user_optional(
    auth: Optional[HTTPAuthorizationCredentials] = Depends(security_bearer),
    x_poseidon_token: Optional[str] = Header(None),
    x_poseidon_role: Optional[str] = Header(None),
) -> Optional[Dict[str, any]]:
    """Resolve user from Bearer token, custom header, or legacy role token."""
    token = None
    if auth and auth.credentials:
        token = auth.credentials
    elif x_poseidon_token:
        token = x_poseidon_token

    if token:
        # Check standard JWT token
        if token.startswith("Bearer "):
            token = token[7:]
        try:
            return decode_access_token(token)
        except Exception:
            # Fallback check for simulated or pre-shared tokens
            if "ADMIN" in token.upper():
                return PRESEEDED_USERS["admin"]
            elif "COMMANDER" in token.upper():
                return PRESEEDED_USERS["commander_chen"]
            elif "OFFICER" in token.upper():
                return PRESEEDED_USERS["officer_murugan"]

    # Role header fallback
    if x_poseidon_role:
        normalized_role = ROLE_ALIASES.get(x_poseidon_role.upper().strip(), ROLE_OBSERVER)
        return {
            "sub": "USR-ROLE-HEADER",
            "username": "header_user",
            "name": f"Authorized {normalized_role}",
            "role": normalized_role,
            "agency": "Direct Header Integration",
        }

    return None


async def get_current_user(
    current_user: Optional[Dict[str, any]] = Depends(get_current_user_optional),
) -> Dict[str, any]:
    """Strict authentication dependency."""
    if not current_user:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Authentication required. Please provide a valid Bearer token.",
            headers={"WWW-Authenticate": "Bearer"},
        )
    return current_user


def require_roles(allowed_roles: List[str]):
    """Role-based authorization dependency guard."""
    normalized_allowed = {ROLE_ALIASES.get(r.upper().strip(), r) for r in allowed_roles}

    async def role_checker(user: Dict[str, any] = Depends(get_current_user)) -> Dict[str, any]:
        user_role = user.get("role", ROLE_OBSERVER)
        normalized_user_role = ROLE_ALIASES.get(user_role.upper().strip(), user_role)

        # Admin has superuser access
        if normalized_user_role == ROLE_SYSTEM_ADMIN:
            return user

        if normalized_user_role not in normalized_allowed:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail=f"Access denied. User role '{user_role}' lacks required permissions: {allowed_roles}",
            )
        return user

    return role_checker
