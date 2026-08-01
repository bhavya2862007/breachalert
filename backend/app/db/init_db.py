from app.db.base import Base
from app.db.session import engine

# Import every model here
from app.models.user import User
from app.models.asset import MonitoredAsset
from app.models.breach import BreachFinding


async def init_db():
    async with engine.begin() as conn:
        await conn.run_sync(Base.metadata.create_all)