from contextlib import asynccontextmanager

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.api.v1.auth import router as auth_router
from app.api.v1.assets import router as assets_router
from app.api.v1.scans import router as scans_router
from app.api.v1.verification import router as verification_router

from app.core.config import settings
from app.db.init_db import init_db
from app.api.v1.reports import router as reports_router
print("✅ reports_router imported")
from app.api.v1.history import router as history_router

from app.scheduler.worker import (
    start_scheduler,
    scheduler,
)


@asynccontextmanager
async def lifespan(app: FastAPI):
    # Create database tables
    await init_db()

    # Start background scheduler
    start_scheduler()

    print("✅ Background Scheduler Started")

    yield

    # Stop scheduler gracefully
    if scheduler.running:
        scheduler.shutdown()
        print("🛑 Background Scheduler Stopped")


app = FastAPI(
    title="BreachAlert API",
    version="1.0.0",
    lifespan=lifespan,
)

origins = [
    "http://localhost:5173",
    "https://breachalert-frontend-1.onrender.com",
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

API_PREFIX = "/api/v1"

app.include_router(auth_router, prefix=API_PREFIX)
app.include_router(assets_router, prefix=API_PREFIX)
app.include_router(scans_router, prefix=API_PREFIX)
app.include_router(verification_router, prefix=API_PREFIX)
app.include_router(reports_router, prefix=API_PREFIX)
app.include_router(history_router, prefix=API_PREFIX)
print("✅ Reports & History routers included")

@app.get("/")
async def root():
    return {
        "message": "BreachAlert Backend Running"
    }


@app.get("/health")
async def health():
    return {
        "status": "ok",
        "env": settings.ENV,
    }