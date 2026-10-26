# ==========================================
# Stage 1: Build the React Frontend
# ==========================================
FROM node:20-alpine AS frontend-builder

WORKDIR /app/frontend

COPY frontend/package.json frontend/package-lock.json ./
RUN npm ci

COPY frontend/ ./
RUN npm run build

# ==========================================
# Stage 2: Python Backend with Static Assets
# ==========================================
FROM python:3.12-slim AS runner

# Install uv for fast, reliable Python dependency management
COPY --from=ghcr.io/astral-sh/uv:latest /uv /bin/uv

WORKDIR /app

# Install backend dependencies
COPY backend/pyproject.toml backend/uv.lock ./
RUN uv sync --frozen --no-dev

# Copy backend application code
COPY backend/app ./app

# Copy compiled frontend from Stage 1 into static files folder
COPY --from=frontend-builder /app/frontend/dist ./static

# Configure environment defaults
ENV PYTHONUNBUFFERED=1 \
    STATIC_DIR=/app/static \
    DATABASE_URL=sqlite:////data/workouts.db \
    PORT=8095

# Persistent data directory for SQLite
VOLUME ["/data"]

EXPOSE 8095

# Launch FastAPI via uvicorn
CMD ["uv", "run", "uvicorn", "app.main:app", "--host", "0.0.0.0", "--port", "8095"]
