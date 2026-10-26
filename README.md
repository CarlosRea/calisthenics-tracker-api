# Calisthenics & Street Workout Tracker

Full-stack, API-first application designed for street workout athletes to log training sessions, calculate volume metrics, track personal records (PRs), and monitor system health with OpenTelemetry, Prometheus, and Grafana.

---

## Features

- **Workout Logging**: Quick logging of predefined calisthenics exercises (Pull-ups, Muscle-ups, Dips, Handstand Push-ups, Pistol Squats, Dragon Flags) or custom movements.
- **Categorization**: Strict functional movement classification (`Pull`, `Push`, `Legs`, `Core`).
- **Volume & PR Analytics**: Automatic calculation of total sessions, accumulated volume ($\text{sets} \times \text{reps}$), and category personal records.
- **Filtering & Search**: Real-time filtering by category and substring search by exercise name.
- **JWT Authentication**: Secure user registration and login using PBKDF2-HMAC-SHA256 password hashing and Bearer tokens.
- **Auto-Seeding**: Automatic initialization with 4 realistic street workout entries on startup if the database is empty.
- **Full Observability**: OpenTelemetry distributed tracing and application metrics exported to Prometheus, Loki, Tempo, and Grafana.
- **Automated On-Call Worker**: Python daemon polling active Prometheus alert rules and dispatching incident details to a headless coding agent.

---

## Architecture & Tech Stack

```
                                  +-----------------------------+
                                  |     React 18 + Vite UI      | (Port 8095 / 5173)
                                  +--------------+--------------+
                                                 │ REST API
                                                 ▼
+-----------------------------+   +-----------------------------+   +-----------------------------+
|    PostgreSQL 16 Database   |◄──┤       FastAPI Backend       ├──►|    OpenTelemetry Collector  | (Ports 4317/4318)
|     (Port 5434 / 5435)      |   |    (SQLAlchemy + Pydantic)  |   +--------------+--------------+
+-----------------------------+   +-----------------------------+                  │
                                                                       ┌───────────┼───────────┐
                                                                       ▼           ▼           ▼
                                                                  Prometheus     Tempo       Loki
                                                                    (:9090)     (:3200)     (:3100)
                                                                       └───────────┼───────────┘
                                                                                   ▼
                                                                           Grafana Dashboard
                                                                                (:3000)
```

- **Backend**: Python 3.12, FastAPI, Pydantic v2, SQLAlchemy, `uv` package manager.
- **Frontend**: React 18, TypeScript, Vite, Tailwind CSS, Lucide icons.
- **Database**: SQLite (default local development) and PostgreSQL 16 (Docker Compose & Production).
- **Containerization**: Multi-stage Dockerfile (Node 20 Alpine builder $\rightarrow$ Python 3.12-slim runtime).
- **Testing**: Pytest (backend), Vitest (frontend), and Playwright (end-to-end against containers).
- **Observability**: OpenTelemetry SDK, Prometheus, Grafana, Loki, and Tempo.

---

## API Contract (`openapi.yaml`)

The API follows the OpenAPI 3.1.0 specification defined in [`openapi.yaml`](file:///home/ubuntu/calisthenics-tracker-api/openapi.yaml):

| Method | Endpoint | Description |
|---|---|---|
| `GET` | `/api/health` | Service health status |
| `POST` | `/api/workouts` | Log a new workout session (Validates sets $\ge 1$, reps $\ge 1$, category enum) |
| `GET` | `/api/workouts` | Retrieve workouts sorted by date descending (supports `?category=` and `?exercise=`) |
| `DELETE` | `/api/workouts/{id}` | Delete a workout by ID |
| `GET` | `/api/stats/summary` | Aggregate stats: total sessions, total volume, and category PRs |
| `POST` | `/api/auth/register` | Register a new user |
| `POST` | `/api/auth/login` | Authenticate user and receive JWT bearer token |
| `GET` | `/api/auth/me` | Fetch authenticated user profile |

---

## Quick Start

### Prerequisites
- [Docker](https://docs.docker.com/get-docker/) & Docker Compose
- Optional for local development: [Node.js 20+](https://nodejs.org/), [Python 3.12+](https://www.python.org/), and [`uv`](https://github.com/astral-sh/uv).

---

### 1. Run with Docker Compose (Recommended)
Starts the multi-stage application container and PostgreSQL 16 database:

```bash
make compose-up
```

- **Web Dashboard**: [http://localhost:8095](http://localhost:8095)
- **API Swagger Documentation**: [http://localhost:8095/docs](http://localhost:8095/docs)
- **Default Credentials**: `admin` / `calisthenics123`

To stop:
```bash
make compose-down
```

---

### 2. Run in Local Development Mode (Hot-Reload)

**Backend** (SQLite default on port 8093):
```bash
make run
```

**Frontend** (Vite on port 5173):
```bash
make frontend-dev
```
Open [http://localhost:5173](http://localhost:5173) in your browser.

---

### 3. Run Production Stack
Starts the production environment on port 8096 with independent database on port 5435:

```bash
make prod-up
```
- **Prod Web UI**: [http://localhost:8096](http://localhost:8096)

To stop:
```bash
make prod-down
```

---

## Observability & Monitoring

The repository includes a decoupled observability stack in [`observability/`](file:///home/ubuntu/calisthenics-tracker-api/observability/):

```bash
make observability-up
```

| Service | Port | Description |
|---|---|---|
| **Grafana** | `3000` | Pre-provisioned dashboards and datasources (`admin` / `admin`) |
| **Prometheus** | `9090` | Scrapes application metrics and evaluates alert rules |
| **Tempo** | `3200` | Ingests and stores distributed request traces |
| **Loki** | `3100` | Log aggregation |
| **OTel Collector** | `4317` / `4318` | OTLP gRPC/HTTP receivers, exports metrics on `:8889` |

To stop the observability stack:
```bash
make observability-down
```

### On-Call Engineer Worker
The on-call worker monitors the Prometheus alert API (`http://localhost:9090/api/v1/alerts`) and launches an autonomous coding agent when alerts fire:

```bash
# Run one-shot test check
make on-call-test

# Run continuous monitoring daemon (every 60s)
make on-call-worker
```

---

## Testing

```bash
# Run backend pytest suite (20 tests)
make test

# Run frontend Vitest suite (10 tests)
make frontend-test

# Run all unit tests
make test-all

# Run Playwright End-to-End tests against Docker Compose
make e2e
```

---

## Makefile Shortcuts Reference

| Command | Action |
|---|---|
| `make run` | Run local FastAPI backend (SQLite) on port `8093` |
| `make run-postgres` | Run local FastAPI backend against PostgreSQL on port `5434` |
| `make frontend-dev` | Start Vite frontend dev server with hot-reload |
| `make compose-up` | Build and run development stack (App on `:8095`, DB on `:5434`) |
| `make compose-down` | Stop development stack |
| `make prod-up` | Build and run production stack (App on `:8096`, DB on `:5435`) |
| `make prod-down` | Stop production stack |
| `make observability-up` | Start Grafana, Prometheus, Tempo, Loki, and OTel Collector |
| `make observability-down`| Stop observability stack |
| `make on-call-worker` | Run continuous Prometheus alert monitoring worker |
| `make on-call-test` | Check Prometheus alerts once |
| `make test-all` | Run all backend and frontend unit tests |
| `make e2e` | Run Playwright browser end-to-end suite |
| `make install` | Install all backend (`uv sync`) and frontend (`npm i`) dependencies |

---

## License

MIT
