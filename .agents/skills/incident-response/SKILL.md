---
name: incident-response
description: Investigate, triage, reproduce, and fix alerts and runtime incidents in the application.
---

# Incident Response Skill

Use this skill when an alert fires or an incident is reported in development or production.

## Incident Workflow

1. **Inspect Alert Metadata & Metrics**:
   - Query Prometheus alerts at `http://localhost:9090/api/v1/alerts`.
   - Identify the alert name, severity, affected environment (`development` or `production`), and metric count.
   - Open the [Grafana Metrics Dashboard](http://localhost:3000/d/calisthenics-metrics/calisthenics-tracker-application-metrics?var-environment=development).

2. **Consult the Runbook**:
   - Check `docs/runbooks/` for alert-specific guidance (e.g. `docs/runbooks/workout_creation_failures.md`).

3. **Check Logs**:
   - Inspect container logs via Loki or Docker:
     ```bash
     docker logs calisthenics-app --tail 100
     docker logs calisthenics-app-prod --tail 100
     ```

4. **Reproduce the Issue**:
   - Write a minimal script or curl request replicating the failure.
   - Check database status (`calisthenics-db` on 5434 / `calisthenics-db-prod` on 5435).

5. **Remediate**:
   - If a real code bug: Make the smallest possible correction.
   - Run backend and frontend tests (`make test-all`).
   - Commit the fix with a clear commit message referencing the alert.
   - If a false positive or transient load: Document why without altering application logic.
