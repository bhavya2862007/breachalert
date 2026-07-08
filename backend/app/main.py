from contextlib import asynccontextmanager

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.core.config import settings
from app.api.v1 import auth


@asynccontextmanager
async def lifespan(app: FastAPI):
    yield


app = FastAPI(
    title="BreachAlert API",
    version="1.0.0",
    lifespan=lifespan,
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=[settings.FRONTEND_URL],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

API = "/api/v1"

# Only register routes that currently exist
app.include_router(auth.router, prefix=API)


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