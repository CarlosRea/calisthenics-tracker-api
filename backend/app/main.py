import os
from contextlib import asynccontextmanager
from pathlib import Path

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles

from app.database import init_db
from app.routers import auth, stats, workouts


@asynccontextmanager
async def lifespan(app: FastAPI):
    # Ensure tables exist and demo data is seeded on startup
    init_db()
    yield


app = FastAPI(
    title="Calisthenics Workout Tracker API",
    version="1.0.0",
    description="Backend API for logging calisthenics workouts, calculating volume, and tracking personal records.",
    lifespan=lifespan,
)

# Configure CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Mount API routers first so they take precedence over static files
app.include_router(workouts.router)
app.include_router(stats.router)
app.include_router(auth.router)


@app.get("/api/health", tags=["Health"])
def health_check():
    return {"status": "healthy", "service": "calisthenics-tracker-api"}


# Mount frontend static files if present (e.g. In Docker container)
static_dir = os.environ.get("STATIC_DIR", str(Path(__file__).resolve().parent.parent / "static"))
if os.path.exists(static_dir):
    app.mount("/", StaticFiles(directory=static_dir, html=True), name="static")
