# Runbook: Workout Creation Failures (`WorkoutComponentCreationFailures`)

## Overview
- **Alert Name**: `WorkoutComponentCreationFailures`
- **Severity**: `critical`
- **Service**: `calisthenics-tracker-api`
- **Owner**: `team-calisthenics-core`
- **Trigger Condition**: `increase(calisthenics_workout_errors_total{operation="create_workout"}[2m]) >= 3` for `30s`
- **User Impact**: Repeated failures prevent users from saving and logging calisthenics workouts, causing data loss and degraded user experience.

---

## Alert Annotations & Labels
When this alert fires, it carries the following metadata:
- **`service`**: `calisthenics-tracker-api`
- **`environment`**: Target environment (`development` or `production`)
- **`deployed_version`**: Version tag of the deployed release (e.g., `1.0.0`)
- **`owner`**: `team-calisthenics-core`
- **`dashboard_url`**: Direct link to the Grafana application dashboard filtered by environment:  
  `http://localhost:3000/d/calisthenics-metrics/calisthenics-tracker-application-metrics?var-environment=<ENVIRONMENT>`

---

## Triage & Troubleshooting Steps

### 1. Check Application Dashboard
Open the [Grafana Metrics Dashboard](http://localhost:3000/d/calisthenics-metrics/calisthenics-tracker-application-metrics) and review:
- **Failures & Errors** KPI card.
- **Workouts Logged by Category** graph for sudden drops in created sessions.
- Filter by the alerted `environment` (`development` or `production`).

### 2. Inspect Active Prometheus Alerts
Verify the active alert state and exact error count at:
[Prometheus Alerts Page](http://localhost:9090/alerts)

### 3. Check Service Logs via Loki or Docker
Query recent error logs to inspect the failure cause:
```bash
# For Development
docker logs calisthenics-app --tail 100

# For Production
docker logs calisthenics-app-prod --tail 100
```
Or in Grafana Explore with Loki:
```logql
{service="calisthenics-tracker-api"} |= "error"
```

### 4. Verify Database Health
Ensure the PostgreSQL container is responding and healthy:
```bash
# Check Dev Database (Port 5434)
docker exec calisthenics-db pg_isready -U calisthenics -d calisthenics

# Check Prod Database (Port 5435)
docker exec calisthenics-db-prod pg_isready -U calisthenics_prod -d calisthenics_prod
```

### 5. Remediation
- If database connection pool is saturated or stopped, restart the database service:
  ```bash
  docker compose restart db
  ```
- If a bad release introduced unhandled validation errors, roll back to the previously deployed image version:
  ```bash
  make prod-down && make prod-up
  ```
