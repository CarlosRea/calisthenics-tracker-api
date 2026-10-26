.PHONY: run test frontend-dev frontend-test test-all install help

PORT ?= 8093

help:
	@echo "Available commands:"
	@echo "  make run           - Run FastAPI backend development server on port $(PORT)"
	@echo "  make test          - Run backend pytest suite"
	@echo "  make frontend-dev  - Start Vite frontend dev server"
	@echo "  make frontend-test - Run Vitest frontend test suite"
	@echo "  make test-all      - Run both backend and frontend test suites"
	@echo "  make install       - Install dependencies for both backend and frontend"

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
