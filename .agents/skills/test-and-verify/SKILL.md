---
name: test-and-verify
description: Run the complete test suite including backend pytest, frontend vitest, and Playwright end-to-end tests against Docker Compose.
---

# Test and Verify Skill

Use this skill to validate code changes, ensure no regressions are introduced, and verify acceptance criteria.

## Verification Checklist

1. **Backend Tests**:
   - Run: `cd backend && uv run pytest`
   - Checks: SQLAlchemy models, Auth JWT, Statistics calculation, OpenTelemetry metrics and tracing.

2. **Frontend Tests**:
   - Run: `cd frontend && npm test`
   - Checks: Mock and API workout service, KPI calculations, component contracts.

3. **Combined Suite**:
   - Shortcut: `make test-all`

4. **End-to-End Tests**:
   - Prerequisites: Ensure the dev stack is running (`make compose-up`).
   - Run: `make e2e`
   - Scenarios tested:
     - Dashboard and seeded workouts loading
     - Adding predefined and custom calisthenics exercises
     - Category filtering and search substring queries
     - Deleting workouts and verifying KPI updates
     - PostgreSQL database persistence across page reloads
