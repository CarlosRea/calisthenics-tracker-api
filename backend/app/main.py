from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.routers import auth, stats, workouts

app = FastAPI(
    title="Calisthenics Workout Tracker API",
    version="1.0.0",
    description="Backend API for logging calisthenics workouts, calculating volume, and tracking personal records.",
)

# Configure CORS so the React frontend on localhost:5173 can interact seamlessly
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Mount routers
app.include_router(workouts.router)
app.include_router(stats.router)
app.include_router(auth.router)


@app.get("/api/health", tags=["Health"])
def health_check():
    return {"status": "healthy", "service": "calisthenics-tracker-api"}
