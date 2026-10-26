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
Description: Create an HTML5 single-page interface styled with Tailwind CSS (via CDN) and Vanilla JS, served directly at the root `GET /` via FastAPI static files. Implement KPI summary cards for metrics and PRs, a quick-add form with category and exercise selections, category filter buttons, and a history table with inline delete buttons. Connect the UI directly to the REST API using native `fetch` calls.
