# AGENTS.md

## Commands
- `uv sync` - install dependencies
- `uv run pytest` - run the whole test suite
- `uv run pytest tests/test_api.py` - run a specific test file
- `uv run uvicorn app.main:app --reload` - run the development server

## Rules
- Dependencies are added in `pyproject.toml`. Do not add one without asking.
- Work on one GitHub issue / task at a time.
- Always run and pass the tests before completing a task.
- Commit regularly with meaningful messages.

## Documents
- `_docs/process.md` - how work is organized
- `_docs/plan.md` - project specification and product scope
- `_docs/tasks.md` - backlog tasks and GitHub issues mapping
- Before writing tests, read `_docs/testing-guidelines.md`
- For anything touching the UI, read `_docs/design-system.md`
- For API specifications and endpoints, read `_docs/api.md`
