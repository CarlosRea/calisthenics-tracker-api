# Backlog: Calisthenics Workout Tracker MVP

## 1. Project Scaffolding and Test Environment Setup
Goal: Set up an empty FastAPI project structure with dependency management and a passing smoke test.
Description: Initialize the project dependencies (`fastapi`, `uvicorn`, `pytest`, `httpx`) and configure the basic project layout with an `app/` and `tests/` directory. Create a minimal FastAPI instance with a health check endpoint and write an initial test in `tests/test_api.py` that verifies the app boots and returns HTTP 200. Ensure the test suite passes out of the box.

## 2. Database Connection and Workout Model Definition
Goal: Configure SQLite database connection and define the Workout data model and schemas.
Description: Set up SQLite connectivity using SQLModel (or SQLAlchemy) supporting configuration via the `DATABASE_URL` environment variable with a default of `workouts.db`. Define the Workout model and Pydantic schemas with fields for `id`, `exercise_name`, `category` (enum: "Pull", "Push", "Legs", "Core"), `sets`, `reps`, `added_weight`, and `date`. Implement automatic database table creation on application startup.

## 3. Workout Creation and Deletion API Endpoints
Goal: Implement API endpoints to log new workouts and delete existing entries.
Description: Create `POST /api/workouts` with input validation for sets, reps (> 0), category, and optional added weight defaulting to 0. Implement `DELETE /api/workouts/{id}` to remove an entry by ID, returning a 204 status on success or 404 when not found. Add integration tests using an isolated in-memory SQLite database to verify data persistence and deletion.

## 4. Workout Listing and Query Filtering API Endpoint
Goal: Implement the workout retrieval endpoint supporting ordering and filtering.
Description: Create `GET /api/workouts` returning logged entries sorted by date in descending order (most recent first). Support optional query parameters `category` and `exercise` to filter the returned list accordingly. Write unit and integration tests verifying correct default ordering and query filtering behavior.

## 5. Statistics and PR Summary API Endpoint
Goal: Implement the analytics endpoint to calculate total workouts, total volume, and category PRs.
Description: Create `GET /api/stats/summary` to return deterministic aggregate metrics across all logged workout sessions. Calculate total workouts count, total volume (`sum(sets * reps)`), and the personal record (maximum reps in a single set) for each category ("Pull", "Push", "Legs", "Core"). Add test cases verifying correct calculation on both empty databases and populated datasets.

## 6. Automatic Database Seeding on Startup
Goal: Automatically seed demo workout records on application startup when the database is empty.
Description: Implement a startup lifespan handler that checks if the workout table contains zero records. If empty, insert 4 realistic street workout entries covering different categories so reviewers can evaluate the dashboard immediately without manual input. Write tests verifying that seeding executes when the database is empty and does not create duplicate entries on subsequent restarts.

## 7. Interactive Web Dashboard Frontend
Goal: Build and serve a responsive single-page dashboard interfacing with the API.
Description: Create a React 18 single-page interface styled with Tailwind CSS and Vite, served directly at the root `GET /` via FastAPI static files. Implement KPI summary cards for metrics and PRs, a quick-add form with category and exercise selections, category filter buttons, and a history table with inline delete buttons. Connect the UI directly to the REST API.

## 8. Multi-Stage Docker Containerization and Compose Stack
Goal: Package frontend build and backend execution into an optimized multi-stage Docker image and provide Compose stacks for local and PostgreSQL environments.
Description: Implement a two-stage `Dockerfile` where Node 20 compiles the Vite frontend into static assets and Python 3.12-slim runs FastAPI serving the compiled static assets. Configure `docker-compose.yaml` with a PostgreSQL 16 database container on port 5434 and healthchecks.

## 9. End-to-End Testing Suite with Playwright
Goal: Implement browser end-to-end test scenarios testing key user flows against the containerized stack.
Description: Create Playwright tests in `e2e/tests/app.spec.ts` testing predefined workouts logging, custom exercise entry, category filtering, deletion, and PostgreSQL persistence across browser reloads. Expose test execution through `make e2e`.

## 10. CI/CD Workflows and Independent Dev/Prod Environments
Goal: Establish continuous testing and independent development and production environments.
Description: Define `.github/workflows/ci.yml` for parallel unit testing and image building with short-SHA tags. Configure independent production stack in `docker-compose.prod.yaml` on port 8096 with isolated PostgreSQL database on port 5435. Create manual promotion workflow in `.github/workflows/promote-to-prod.yml`.

## 11. OpenTelemetry Instrumentation & Observability Stack
Goal: Instrument backend with distributed tracing and application metrics exported to an isolated observability stack.
Description: Integrate OpenTelemetry in `backend/app/telemetry.py` capturing requests, DB queries, and domain metrics (`calisthenics_workouts_created_total`, `calisthenics_reps_logged_total`, etc.). Deploy Prometheus (`:9090`), Loki (`:3100`), Tempo (`:3200`), OTel Collector (`:4317/:4318/:8889`), and Grafana (`:3000`) with provisioned datasource and metrics dashboard in `observability/`.

## 12. Actionable Alerting and Prometheus Alert Rules
Goal: Configure actionable alerting for repeated workout creation failures with dynamic environment and version metadata.
Description: Define Prometheus alerting rule `WorkoutComponentCreationFailures` in `observability/alert_rules.yaml` triggering when failures exceed 3 within 2 minutes. Create operational runbook in `docs/runbooks/workout_creation_failures.md` and add Active Firing Alerts stat panel to Grafana dashboard.

## 13. Autonomous On-Call Engineer Worker
Goal: Implement an automated on-call polling worker that intercepts active firing alerts and launches a headless coding agent session.
Description: Create `on-call-engineer/worker.py` polling `http://localhost:9090/api/v1/alerts` every 60s. When an alert fires, format a structured diagnostic prompt with alert metadata, launch the headless agent (`agy -p "..." --dangerously-skip-permissions`), and save incident logs in `on-call-engineer/incidents/`.
