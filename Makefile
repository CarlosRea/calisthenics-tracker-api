.PHONY: run test frontend-dev frontend-test test-all install docker-build docker-run compose-up compose-down prod-up prod-down postgres-start run-postgres e2e observability-up observability-down help

PORT ?= 8093
DOCKER_PORT ?= 8095
IMAGE_NAME ?= calisthenics-tracker:latest

POSTGRES_PORT ?= 5434
POSTGRES_USER ?= calisthenics
POSTGRES_PASSWORD ?= calisthenics
POSTGRES_DB ?= calisthenics
POSTGRES_CONTAINER ?= calisthenics-postgres-db

help:
	@echo "Available commands:"
	@echo "  make run            - Run FastAPI backend development server (SQLite default) on port $(PORT)"
	@echo "  make run-postgres   - Run FastAPI backend against PostgreSQL on port $(POSTGRES_PORT)"
	@echo "  make postgres-start - Start local PostgreSQL 16 container on port $(POSTGRES_PORT)"
	@echo "  make test           - Run backend pytest suite"
	@echo "  make frontend-dev   - Start Vite frontend dev server"
	@echo "  make frontend-test  - Run Vitest frontend test suite"
	@echo "  make test-all       - Run both backend and frontend test suites"
	@echo "  make install        - Install dependencies for both backend and frontend"
	@echo "  make docker-build   - Build multi-stage Docker image ($(IMAGE_NAME))"
	@echo "  make docker-run     - Run container on port $(DOCKER_PORT) with persistent volume"

run:
	cd backend && uv run uvicorn app.main:app --reload --port $(PORT)

postgres-start:
	@if docker ps --format '{{.Names}}' | grep -q "^$(POSTGRES_CONTAINER)$$"; then \
	  echo "Postgres container already running on port $(POSTGRES_PORT)"; \
	elif docker ps -a --format '{{.Names}}' | grep -q "^$(POSTGRES_CONTAINER)$$"; then \
	  docker start $(POSTGRES_CONTAINER); \
	else \
	  docker run -d --name $(POSTGRES_CONTAINER) \
	    -e POSTGRES_USER=$(POSTGRES_USER) \
	    -e POSTGRES_PASSWORD=$(POSTGRES_PASSWORD) \
	    -e POSTGRES_DB=$(POSTGRES_DB) \
	    -p $(POSTGRES_PORT):5432 \
	    -v calisthenics-pgdata:/var/lib/postgresql/data \
	    postgres:16-alpine; \
	fi

run-postgres: postgres-start
	cd backend && DATABASE_URL="postgresql://$(POSTGRES_USER):$(POSTGRES_PASSWORD)@localhost:$(POSTGRES_PORT)/$(POSTGRES_DB)" uv run uvicorn app.main:app --reload --port $(PORT)

test:
	cd backend && uv run pytest

frontend-dev:
	cd frontend && npm run dev

frontend-test:
	cd frontend && npm test

test-all: test frontend-test

install:
	cd backend && uv sync
	cd frontend && npm install

docker-build:
	docker build -t $(IMAGE_NAME) .

docker-build-tagged:
	@TAG="$$(date +'%Y%m%d-%H%M%S')-$$(git rev-parse --short HEAD)"; \
	echo "Building tagged image: $(IMAGE_NAME):$$TAG"; \
	docker build -t $(IMAGE_NAME):$$TAG -t $(IMAGE_NAME):latest .

docker-run:
	docker run --rm -p $(DOCKER_PORT):$(DOCKER_PORT) \
	  -v calisthenics-data:/data \
	  -e DATABASE_URL=sqlite:////data/workouts.db \
	  --name calisthenics-app $(IMAGE_NAME)

compose-up:
	docker compose up --build -d

compose-down:
	docker compose down

prod-up:
	docker compose -f docker-compose.prod.yaml up --build -d

prod-down:
	docker compose -f docker-compose.prod.yaml down

e2e:
	cd e2e && npx playwright test

observability-up:
	docker compose -f observability/docker-compose.yaml up -d

observability-down:
	docker compose -f observability/docker-compose.yaml down
