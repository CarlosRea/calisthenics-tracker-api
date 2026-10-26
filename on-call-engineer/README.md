# On-Call Engineer Automated Worker

The On-Call Engineer Worker is a daemon that continuously monitors the Prometheus Alert API and automatically starts an autonomous headless coding agent when an active alert fires.

---

## Architecture & Lifecycle

```
+---------------------------+
| Prometheus Alerting Rule  |  (Threshold: 3 failures in 2 min, for 30s)
+-------------+-------------+
              | (state: "firing")
              v
+---------------------------+
| on-call-engineer/worker.py|  (Polls /api/v1/alerts every 60 seconds)
+-------------+-------------+
              |
              | Formats prompt with incident metadata
              v
+---------------------------+
|  Headless Coding Agent    |  (Invokes: agy -p "..." --dangerously-skip-permissions)
|         (agy)             |
+-------------+-------------+
              |
              +--> 1. Read codebase & reproduce failure
              +--> 2. Apply smallest fix if real bug
              +--> 3. Run backend tests (make test)
              +--> 4. Commit fix with clear message
              +--> 5. If false positive, explain without code change
              +--> 6. Save incident log in incidents/
```

---

## Agent Incident Prompt Template
When an alert triggers, the worker invokes the headless agent with the prompt:

```text
You are the on-call engineer for this repository. An alert just fired.

Alert Details:
- Alert: <ALERT_NAME> (Severity: <SEVERITY>)
- Service: <SERVICE>
- Environment: <ENVIRONMENT>
- Deployed Version: <VERSION>
- Owner: <OWNER>
- Value / Metric Count: <VALUE>
- Summary: <SUMMARY>
- Description: <DESCRIPTION>
- Dashboard: <DASHBOARD_URL>
- Firing Since: <ACTIVE_AT>

Investigate the root cause. Read the code and reproduce the failure.
If you find a real bug, make the smallest correction, run the backend tests,
and commit the fix with a clear message.

If the alert is a false positive, explain why and do not change the code.
```

---

## Running the Worker

### Run Continuously (Every 60s)
```bash
make on-call-worker
# Or directly:
python3 on-call-engineer/worker.py
```

### Run One-Shot Check
```bash
make on-call-test
# Or directly:
python3 on-call-engineer/worker.py --once
```

### Dry-Run Mode (Simulate without launching agent)
```bash
python3 on-call-engineer/worker.py --once --dry-run
```

### CLI Arguments
- `--url`: Prometheus Alert API URL (default: `http://localhost:9090/api/v1/alerts`).
- `--interval`: Polling interval in seconds (default: `60`).
- `--once`: Poll once and exit immediately.
- `--dry-run`: Simulate and print prompt without launching agent.
- `--agent-cmd`: Custom agent CLI command template.
