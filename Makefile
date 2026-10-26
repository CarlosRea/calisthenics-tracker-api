.PHONY: run test frontend-dev frontend-test test-all install docker-build docker-run help

PORT ?= 8093
DOCKER_PORT ?= 8095
IMAGE_NAME ?= calisthenics-tracker:latest

help:
	@echo "Available commands:"
	@echo "  make run           - Run FastAPI backend development server on port $(PORT)"
	@echo "  make test          - Run backend pytest suite"
	@echo "  make frontend-dev  - Start Vite frontend dev server"
	@echo "  make frontend-test - Run Vitest frontend test suite"
	@echo "  make test-all      - Run both backend and frontend test suites"
	@echo "  make install       - Install dependencies for both backend and frontend"
	@echo "  make docker-build  - Build multi-stage Docker image ($(IMAGE_NAME))"
	@echo "  make docker-run    - Run container on port $(DOCKER_PORT) with persistent volume"

run:
	cd backend && uv run uvicorn app.main:app --reload --port $(PORT)

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

docker-run:
	docker run --rm -p $(DOCKER_PORT):$(DOCKER_PORT) \
	  -v calisthenics-data:/data \
	  -e DATABASE_URL=sqlite:////data/workouts.db \
	  --name calisthenics-app $(IMAGE_NAME)
