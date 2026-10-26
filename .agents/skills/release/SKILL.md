---
name: release
description: Release a new version of the Calisthenics Tracker application, bump versions, build images, and verify deployments.
---

# Release Skill

Use this skill when preparing and deploying a new release of the application.

## Release Procedure

1. **Verify Test Suites**:
   - Run all backend tests: `cd backend && uv run pytest`
   - Run all frontend tests: `cd frontend && npm test`
   - Run Playwright E2E tests: `make e2e`

2. **Bump Version in Sources of Truth**:
   - Update version in `backend/pyproject.toml`
   - Update version in `frontend/package.json`
   - Update version in `backend/app/main.py`
   - Update `SERVICE_VERSION` in `docker-compose.yaml` and `docker-compose.prod.yaml`

3. **Build Tagged Multi-stage Docker Image**:
   - Generate tag following `YYYYMMDD-HHMMSS-shortsha` pattern:
     ```bash
     make docker-build-tagged
     ```

4. **Verify Health & Observability**:
   - Deploy to development or production:
     ```bash
     make compose-up   # Dev on :8095
     make prod-up      # Prod on :8096
     ```
   - Check health endpoint: `curl -s http://localhost:8095/api/health`
   - Check Grafana dashboard deployed version filter displays the new version tag.

5. **Commit and Tag in Git**:
   - Commit version bumps with a descriptive message.
   - Tag git release: `git tag -a v<VERSION> -m "Release v<VERSION>"`
