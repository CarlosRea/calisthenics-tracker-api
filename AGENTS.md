# AGENTS.md

## Makefile Shortcuts
- `make run` - run FastAPI backend server on port 8093 (`http://localhost:8093/docs`)
- `make run-postgres` - run FastAPI backend against PostgreSQL on port 5434
- `make test` - run backend test suite
- `make frontend-dev` - start Vite frontend server
- `make frontend-test` - run frontend Vitest suite
- `make test-all` - run all backend and frontend tests
- `make compose-up` - build and run full stack in Docker Compose (FastAPI + React on port 8095, PostgreSQL on port 5434)
- `make compose-down` - stop Docker Compose services
- `make e2e` - run Playwright end-to-end tests against Docker Compose
- `make observability-up` - start OpenTelemetry Collector, Prometheus, Loki, Tempo, Grafana
- `make observability-down` - stop Observability stack
- `make on-call-worker` - start On-Call engineer alert polling worker
- `make on-call-test` - test On-Call worker once against Prometheus alert API
- `make install` - install all dependencies

## Backend Commands
- `uv sync` - install and sync dependencies
- `uv add <PACKAGE-NAME>` - add a dependency to pyproject.toml
- `uv run python <PYTHON-FILE>` - run a Python script
- `uv run pytest` - run the whole backend test suite
- `uv run uvicorn app.main:app --reload --port 8093` - run the development server

## Frontend Commands
- `cd frontend && npm i` - install frontend dependencies
- `cd frontend && npm run dev` - start Vite development server
- `cd frontend && npm test` - run frontend Vitest test suite
- `cd frontend && npm run build` - build production assets

## Engineering Rules
- Regularly commit code to git with meaningful messages after each step.
- Work on one GitHub issue / task at a time.
- `openapi.yaml` is the single source of truth and contract between frontend and backend.
- Backend code lives inside `/backend`, frontend lives inside `/frontend`.
- Dependencies are declared in `pyproject.toml` (backend) and `package.json` (frontend).

## Documents
- `docs/process.md` - development lifecycle, orchestrator, and agent roles
- `docs/spec.md` - project specification and product scope
- `docs/tasks.md` - backlog tasks and GitHub issues mapping
- `openapi.yaml` - explicit API contract shared by frontend and backend
