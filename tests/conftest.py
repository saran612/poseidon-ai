import pytest_asyncio
from httpx import ASGITransport, AsyncClient
from backend.main import app
from backend.core.database import init_db
from backend.ml.model_loader import get_model_loader


@pytest_asyncio.fixture(autouse=True)
async def setup_db():
    await init_db()
    get_model_loader().load_models()
    yield


@pytest_asyncio.fixture
async def client():
    async with AsyncClient(
        transport=ASGITransport(app=app), base_url="http://test"
    ) as ac:
        yield ac
