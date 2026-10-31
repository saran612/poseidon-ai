import pytest
from httpx import AsyncClient
from backend.core.security import create_access_token, decode_access_token, verify_password
from backend.core.state import state
from backend.core.persistence import persist_road_closure, load_state_from_db


@pytest.mark.asyncio
async def test_auth_jwt_login_and_roles(client: AsyncClient):
    """Test 1: Commander and Coordinator JWT login, token verification, and /auth/me lookup."""
    # Commander Login
    resp = await client.post(
        "/api/v1/auth/login",
        json={"username": "commander_chen", "password": "emergency_password_2026"},
    )
    assert resp.status_code == 200
    token_data = resp.json()
    assert "access_token" in token_data
    token = token_data["access_token"]
    assert token_data["role"] == "EMERGENCY_COMMANDER"

    payload = decode_access_token(token)
    assert payload is not None
    assert payload["sub"] == "commander_chen"
    assert payload["role"] == "EMERGENCY_COMMANDER"

    # Fetch /auth/me with valid Bearer token
    me_resp = await client.get(
        "/api/v1/auth/me",
        headers={"Authorization": f"Bearer {token}"},
    )
    assert me_resp.status_code == 200
    me_data = me_resp.json()
    assert me_data["username"] == "commander_chen"
    assert me_data["name"] == "Commander Sarah Chen"
    assert me_data["role"] == "EMERGENCY_COMMANDER"


@pytest.mark.asyncio
async def test_auth_rejection_on_invalid_credentials(client: AsyncClient):
    """Test 2: Rejection of invalid passwords."""
    resp = await client.post(
        "/api/v1/auth/login",
        json={"username": "commander_chen", "password": "wrong_password_xyz"},
    )
    assert resp.status_code == 401
    assert "Invalid credentials" in resp.json()["detail"]


@pytest.mark.asyncio
async def test_frontend_connected_external_endpoints(client: AsyncClient):
    """Test 3: Verify all new live endpoints required by the React frontend and Flutter app."""
    # 1. Live Weather endpoint
    w_resp = await client.get("/api/v1/weather/live?lat=11.0168&lon=76.9558")
    assert w_resp.status_code == 200
    w_data = w_resp.json()
    assert "weather" in w_data
    assert w_data["weather"]["city"] == "Coimbatore"
    assert "temperature_c" in w_data["weather"]

    # 2. Weather Alerts endpoint
    wa_resp = await client.get("/api/v1/weather/alerts")
    assert wa_resp.status_code == 200
    wa_data = wa_resp.json()
    assert "alerts" in wa_data
    assert len(wa_data["alerts"]) >= 1
    assert wa_data["alerts"][0]["severity"] in ["CRITICAL", "HIGH", "MEDIUM"]

    # 3. Dynamic Shelters endpoint
    sh_resp = await client.get("/api/v1/shelters")
    assert sh_resp.status_code == 200
    sh_data = sh_resp.json()
    assert "shelters" in sh_data
    assert len(sh_data["shelters"]) >= 3
    assert "current_occupancy" in sh_data["shelters"][0]

    # 4. Sensor Telemetry endpoint
    sens_resp = await client.get("/api/v1/sensors")
    assert sens_resp.status_code == 200
    sens_data = sens_resp.json()
    assert "sensors" in sens_data
    assert len(sens_data["sensors"]) >= 3
    assert sens_data["sensors"][0]["reading_value"] > 0


@pytest.mark.asyncio
async def test_dynamic_replanning_bridge_severance_and_diff(client: AsyncClient):
    """Test 4: Sever Perur Bridge and verify OR-Tools CP-SAT resynthesis and diff generation."""
    # 1. Initial Plan History
    init_resp = await client.get("/api/v1/replanning/plans/PLAN-OPERATIONAL-01")
    assert init_resp.status_code == 200
    init_data = init_resp.json()
    assert init_data["versions_count"] >= 1

    # 2. Sever Bridge BR-PERUR-01
    sever_resp = await client.post(
        "/api/v1/replanning/close-bridge",
        json={
            "plan_id": "PLAN-OPERATIONAL-01",
            "bridge_id": "BR-PERUR-01",
            "closure_reason": "0.95m flood overtopping - corridor impassable",
            "operator_role": "EMERGENCY_COMMANDER",
        },
    )
    assert sever_resp.status_code == 200
    replan_result = sever_resp.json()

    assert replan_result["status"] == "PENDING_APPROVAL"
    assert replan_result["new_version"] >= 2
    assert "diff" in replan_result
    assert replan_result["diff"]["rerouted_count"] >= 1
    assert len(replan_result["rerouted_assignments"]) >= 1

    # Verify affected assignment was safely rerouted via alternative bypass
    rerouted = replan_result["rerouted_assignments"][0]
    assert rerouted["zone_id"] == "ZONE_PERUR"
    assert rerouted["new_travel_time"] > 0

    # Verify road network reports bridge is closed
    assert state.road_network.is_bridge_closed("BR-PERUR-01") is True


@pytest.mark.asyncio
async def test_human_in_the_loop_approval_and_reopen(client: AsyncClient):
    """Test 5: Human Commander plan authorization and bridge reopening."""
    # 1. Approve Plan v2 as Commander
    appr_resp = await client.post(
        "/api/v1/replanning/approve",
        json={
            "plan_id": "PLAN-OPERATIONAL-01",
            "version_number": 2,
            "operator_id": "commander_chen",
        },
    )
    assert appr_resp.status_code == 200
    appr_data = appr_resp.json()
    assert appr_data["status"] == "APPROVED"
    assert appr_data["approved_by"] == "commander_chen"

    # 2. Reopen Bridge
    reopen_resp = await client.post(
        "/api/v1/replanning/reopen-bridge",
        json={
            "bridge_id": "BR-PERUR-01",
            "plan_id": "PLAN-OPERATIONAL-01",
        },
    )
    assert reopen_resp.status_code == 200
    assert reopen_resp.json()["status"] == "REOPENED"
    assert state.road_network.is_bridge_closed("BR-PERUR-01") is False


@pytest.mark.asyncio
async def test_discrete_vehicle_callsigns_and_zero_overlap(client: AsyncClient):
    """Test 6: Verify individual callsigns (e.g. BOAT-RS-01) with zero double allocation."""
    resp = await client.get("/api/v1/assignments")
    assert resp.status_code == 200
    assignments = resp.json()["assignments"]
    assert len(assignments) >= 5

    callsigns = [a["unit_callsign"] for a in assignments]
    # Verify no generic placeholders remain
    assert all("Relief Unit" not in c for c in callsigns)
    # Verify distinct unit callsigns
    assert len(callsigns) == len(set(callsigns)), "Double allocation detected: identical callsign assigned twice!"
    # Verify fleet callsign nomenclature
    assert any(c.startswith("BOAT-RS-") or c.startswith("BOAT-PEEL-") for c in callsigns)


@pytest.mark.asyncio
async def test_shelter_dynamic_occupancy_update(client: AsyncClient):
    """Test 7: Dynamic shelter occupancy update and capacity validation."""
    shelter_id = "SHELTER-01"
    patch_resp = await client.post(
        f"/api/v1/shelters/{shelter_id}/occupancy",
        json={"current_occupancy": 580},
    )
    assert patch_resp.status_code == 200
    data = patch_resp.json()
    assert data["shelter"]["current_occupancy"] == 580
    assert data["shelter"]["occupancy_pct"] > 90.0


@pytest.mark.asyncio
async def test_state_persistence_and_db_recovery():
    """Test 8: Verify persistence helper saves road closure and recovers state across restarts."""
    await persist_road_closure("BR-TEST-99", "Severe erosion", is_closed=True, actor="TEST_AGENT")
    
    # Simulate fresh boot recovery
    recovered_closures = await load_state_from_db()
    assert "BR-TEST-99" in recovered_closures
    assert recovered_closures["BR-TEST-99"] == "Severe erosion"

    # Cleanup
    await persist_road_closure("BR-TEST-99", "Reopened", is_closed=False, actor="TEST_AGENT")
