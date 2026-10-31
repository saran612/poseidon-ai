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

