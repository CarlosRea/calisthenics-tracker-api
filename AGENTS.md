# AGENTS.md

## Backend Commands
- `uv sync` - install and sync dependencies
- `uv add <PACKAGE-NAME>` - add a dependency to pyproject.toml
- `uv run python <PYTHON-FILE>` - run a Python script
- `uv run pytest` - run the whole backend test suite
- `uv run uvicorn app.main:app --reload` - run the development server

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
