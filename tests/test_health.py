import pytest
from httpx import AsyncClient


@pytest.mark.asyncio
async def test_info_endpoint(client: AsyncClient):
    response = await client.get("/api/info")
    assert response.status_code == 200
    data = response.json()
    assert data["platform"] == "POSEIDON AI"
    assert "tagline" in data


@pytest.mark.asyncio
async def test_root_endpoint(client: AsyncClient):
    # Test request with JSON accept
    response = await client.get("/", headers={"Accept": "application/json"})
    assert response.status_code == 200
    data = response.json()
    assert data["platform"] == "POSEIDON AI"


@pytest.mark.asyncio
async def test_health_check(client: AsyncClient):
    response = await client.get("/api/v1/health")
    assert response.status_code == 200
    data = response.json()
    assert data["status"] == "operational"
    assert data["mode"] == "offline-first"
    assert data["database"]["status"] == "healthy"
    assert data["geospatial_bounds"]["region"] == "Coimbatore Noyyal Corridor"
