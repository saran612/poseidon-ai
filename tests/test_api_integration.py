import pytest
from httpx import AsyncClient


@pytest.mark.asyncio
async def test_api_devices_and_evidence(client: AsyncClient):
    # 1. List pre-seeded devices
    resp = await client.get("/api/v1/devices")
    assert resp.status_code == 200
    devices = resp.json()["devices"]
    assert len(devices) >= 3
    officer = next(d for d in devices if d["role"] == "T1")
    assert officer["device_code"] == "DEV-OFFICER-PERUR"

    # 2. Get situation zones
    z_resp = await client.get("/api/v1/situation/zones")
    assert z_resp.status_code == 200
    zones = z_resp.json()["zones"]
    assert len(zones) == 5

    # 3. Get candidate bridges
    b_resp = await client.get("/api/v1/situation/bridges")
    assert b_resp.status_code == 200
    bridges = b_resp.json()["bridges"]
    assert len(bridges) == 4


@pytest.mark.asyncio
async def test_api_full_20_step_demo_scenario(client: AsyncClient):
    """Verify execution of the full 20-step synthetic flood scenario."""
    resp = await client.post("/api/v1/simulation/run-demo-scenario")
    assert resp.status_code == 200
    data = resp.json()
    assert data["total_steps"] == 20
    assert data["is_synthetic"] is True

    step1 = data["steps"][0]
    assert step1["step"] == 1
    assert "Noyyal" in step1["description"]

    step6 = data["steps"][5]
    assert step6["step"] == 6
    assert step6["receipts_logged"] == 3

    step16 = data["steps"][15]
    assert step16["step"] == 16
    assert step16["version_number"] == 2

    step19 = data["steps"][18]
    assert step19["step"] == 19
    assert step19["status"] == "APPROVED"

    step20 = data["steps"][19]
    assert step20["step"] == 20
    assert "t_ingested_avg_ms" in step20["processing_metrics"]


@pytest.mark.asyncio
async def test_api_gis_network_and_replanning_lifecycle(client: AsyncClient):
    """Verify GIS network layers, bridge cut cascading impact, and approval workflow."""
    # 1. Fetch GIS infrastructure network
    net_resp = await client.get("/api/v1/situation/network")
    assert net_resp.status_code == 200
    net_data = net_resp.json()
    assert len(net_data["depots"]) == 2
    assert len(net_data["shelters"]) == 2
    assert len(net_data["noyyal_river"]) >= 10
    assert len(net_data["edges"]) >= 8

    # 2. Simulate bridge closure
    close_resp = await client.post(
        "/api/v1/replanning/close-bridge",
        json={
            "plan_id": "PLAN-OPERATIONAL-01",
            "bridge_id": "BR-UKKADAM-01",
            "closure_reason": "Overflow depth 1.2m at Sungam bypass",
            "operator_role": "FIELD_COMMANDER",
        },
    )
    assert close_resp.status_code == 200
    close_data = close_resp.json()
    assert close_data["status"] == "PENDING_APPROVAL"
    assert close_data["requires_human_approval"] is True
    assert "comparison" in close_data

    # 3. Approve revised plan version
    app_resp = await client.post(
        "/api/v1/replanning/approve",
        json={
            "plan_id": "PLAN-OPERATIONAL-01",
            "version_number": close_data["revised_version"],
            "operator_id": "DISTRICT_COLLECTOR_CBE",
        },
    )
    assert app_resp.status_code == 200
    assert app_resp.json()["status"] == "APPROVED"

    # 4. Reopen bridge
    reopen_resp = await client.post(
        "/api/v1/replanning/reopen-bridge",
        json={
            "bridge_id": "BR-UKKADAM-01",
            "plan_id": "PLAN-OPERATIONAL-01",
        },
    )
    assert reopen_resp.status_code == 200
    assert reopen_resp.json()["status"] == "REOPENED"


@pytest.mark.asyncio
async def test_api_mobile_auth_and_assignments(client: AsyncClient):
    """Verify field mobile authentication and assignment acknowledgement workflow."""
    # 1. Login with valid T1 Officer credentials
    login_resp = await client.post(
        "/api/v1/auth/login",
        json={
            "device_code": "DEV-OFFICER-PERUR",
            "secret_key": "poseidon-field-officer-key-32b!",
        },
    )
    assert login_resp.status_code == 200
    auth_data = login_resp.json()
    assert auth_data["device_code"] == "DEV-OFFICER-PERUR"
    assert auth_data["is_field_officer"] is True
    assert auth_data["role"] == "T1"
    assert "token" in auth_data

    # 2. Login with invalid credentials rejects with 401
    bad_login = await client.post(
        "/api/v1/auth/login",
        json={
            "device_code": "DEV-OFFICER-PERUR",
            "secret_key": "wrong-secret-key",
        },
    )
    assert bad_login.status_code == 401

    # 3. Retrieve operational assignments
    asgn_resp = await client.get("/api/v1/assignments")
    assert asgn_resp.status_code == 200
    assignments = asgn_resp.json()["assignments"]
    assert len(assignments) >= 1
    asgn_id = assignments[0]["assignment_id"]

    # 4. Responder acknowledges assignment
    ack_resp = await client.post(
        f"/api/v1/assignments/{asgn_id}/acknowledge",
        json={
            "device_id": "DEV-OFFICER-PERUR",
            "status": "ACCEPTED",
            "transport": "WIFI",
            "notes": "Unit dispatched to Perur bridgehead.",
        },
    )
    assert ack_resp.status_code == 200
    ack_data = ack_resp.json()
    assert ack_data["status"] == "ACKNOWLEDGED"
    assert ack_data["current_status"] == "ACCEPTED"


