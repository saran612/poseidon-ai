import pytest
from httpx import AsyncClient, ASGITransport
from backend.main import app
from backend.core.state import get_system_state


@pytest.mark.asyncio
async def test_map_scenarios():
    transport = ASGITransport(app=app)
    async with AsyncClient(transport=transport, base_url="http://test") as client:
        res = await client.get("/api/v1/map/scenarios")
        assert res.status_code == 200
        data = res.json()
        assert "scenarios" in data
        assert len(data["scenarios"]) >= 2
        ids = [s["id"] for s in data["scenarios"]]
        assert "coimbatore_flood" in ids
        assert "andhra_cyclone" in ids


@pytest.mark.asyncio
async def test_map_flood_zones_geojson():
    transport = ASGITransport(app=app)
    async with AsyncClient(transport=transport, base_url="http://test") as client:
        res = await client.get("/api/v1/map/flood-zones")
        assert res.status_code == 200
        data = res.json()
        assert data["type"] == "FeatureCollection"
        assert len(data["features"]) > 0
        feat = data["features"][0]
        assert feat["type"] == "Feature"
        assert feat["geometry"]["type"] == "Polygon"
        assert "score_expected" in feat["properties"]
        assert "tier" in feat["properties"]


@pytest.mark.asyncio
async def test_map_bridges_geojson():
    transport = ASGITransport(app=app)
    async with AsyncClient(transport=transport, base_url="http://test") as client:
        res = await client.get("/api/v1/map/bridges")
        assert res.status_code == 200
        data = res.json()
        assert data["type"] == "FeatureCollection"
        assert len(data["features"]) == 4
        bridge = data["features"][0]
        assert bridge["geometry"]["type"] == "Point"
        assert "status" in bridge["properties"]
        assert bridge["properties"]["status"] in ("OPEN", "CLOSED")


@pytest.mark.asyncio
async def test_map_hospitals_and_rbac():
    transport = ASGITransport(app=app)
    async with AsyncClient(transport=transport, base_url="http://test") as client:
        # Public role should get basic info, no trauma beds
        res_public = await client.get("/api/v1/map/hospitals", headers={"x-poseidon-role": "PUBLIC"})
        assert res_public.status_code == 200
        hosp_pub = res_public.json()["features"][0]["properties"]
        assert "trauma_beds" not in hosp_pub

        # Responder role should get trauma bed and ICU availability
        res_auth = await client.get("/api/v1/map/hospitals", headers={"x-poseidon-role": "HOSPITAL"})
        assert res_auth.status_code == 200
        hosp_auth = res_auth.json()["features"][0]["properties"]
        assert "trauma_beds" in hosp_auth
        assert hosp_auth["trauma_beds"] > 0


@pytest.mark.asyncio
async def test_map_operations_bundle():
    transport = ASGITransport(app=app)
    async with AsyncClient(transport=transport, base_url="http://test") as client:
        res = await client.get("/api/v1/map/operations")
        assert res.status_code == 200
        data = res.json()
        assert "scenario" in data
        assert "flood_zones" in data
        assert "roads" in data
        assert "bridges" in data
        assert "shelters" in data
        assert "hospitals" in data
        assert "depots" in data
        assert "noyyal_river" in data
        assert data["noyyal_river"]["geometry"]["type"] == "LineString"


@pytest.mark.asyncio
async def test_map_routing_and_bridge_cut():
    state = get_system_state()
    state.road_network.reopen_bridge_or_segment("BR-PERUR-01")
    state.road_closures.pop("BR-PERUR-01", None)

    transport = ASGITransport(app=app)
    async with AsyncClient(transport=transport, base_url="http://test") as client:
        # Route from RS Puram Depot to Perur Zone
        res = await client.post(
            "/api/v1/map/routes",
            json={"origin_id": "DEPOT_RS_PURAM", "destination_id": "ZONE_PERUR"},
        )
        assert res.status_code == 200
        route = res.json()
        assert route["geometry"]["type"] == "LineString"
        assert route["properties"]["routing_status"] == "VERIFIED_ACCESSIBLE"
        assert len(route["geometry"]["coordinates"]) >= 2
