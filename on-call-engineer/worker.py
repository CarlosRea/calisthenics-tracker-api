#!/usr/bin/env python3
"""
On-Call Engineer Automated Worker
Polls the Prometheus Observability Alert API and launches a headless coding agent
when an active firing alert is detected.
"""

import argparse
import datetime
import json
import logging
import os
import subprocess
import sys
import time
import urllib.error
import urllib.request
from pathlib import Path
from typing import Any, Dict, List, Set

# Configuration defaults
DEFAULT_ALERT_API_URL = os.environ.get("ALERT_API_URL", "http://localhost:9090/api/v1/alerts")
DEFAULT_POLL_INTERVAL = int(os.environ.get("POLL_INTERVAL", "60"))
INCIDENT_LOGS_DIR = Path(__file__).resolve().parent / "incidents"

logging.basicConfig(
    level=logging.INFO,
    format="[%(asctime)s] [%(levelname)s] [On-Call-Worker] %(message)s",
    datefmt="%Y-%m-%d %H:%M:%S",
)
logger = logging.getLogger("on_call_worker")


def get_firing_alerts(alert_api_url: str) -> List[Dict[str, Any]]:
    """Polls the Prometheus Alert API and returns a list of actively firing alerts."""
    try:
        req = urllib.request.Request(
            alert_api_url,
            headers={"User-Agent": "OnCallWorker/1.0", "Accept": "application/json"},
        )
        with urllib.request.urlopen(req, timeout=10) as response:
            if response.status != 200:
                logger.warning(f"Unexpected HTTP status {response.status} from {alert_api_url}")
                return []
            payload = json.loads(response.read().decode("utf-8"))
            alerts = payload.get("data", {}).get("alerts", [])
            # Only process alerts that are actively firing
            firing_alerts = [a for a in alerts if a.get("state") == "firing"]
            return firing_alerts
    except urllib.error.URLError as e:
        logger.warning(f"Failed to connect to alert API ({alert_api_url}): {e}")
        return []
    except Exception as e:
        logger.error(f"Error fetching alerts: {e}")
        return []


def format_agent_prompt(alert: Dict[str, Any]) -> str:
    """Builds the instruction prompt for the headless on-call coding agent."""
    labels = alert.get("labels", {})
    annotations = alert.get("annotations", {})

    alert_name = labels.get("alertname", "UnknownAlert")
    severity = labels.get("severity", "critical")
    service = labels.get("service", annotations.get("service", "calisthenics-tracker-api"))
    environment = labels.get("environment", annotations.get("environment", "unknown"))
    version = labels.get("version", labels.get("deployed_version", annotations.get("deployed_version", "unknown")))
    owner = labels.get("owner", annotations.get("owner", "team-calisthenics-core"))
    summary = annotations.get("summary", "No summary provided")
    description = annotations.get("description", "No description provided")
    dashboard_url = annotations.get("dashboard_url", "http://localhost:3000")
    active_at = alert.get("activeAt", str(datetime.datetime.now(datetime.timezone.utc)))
    value = alert.get("value", "N/A")

    prompt = f"""You are the on-call engineer for this repository. An alert just fired.

Alert Details:
- Alert: {alert_name} (Severity: {severity})
- Service: {service}
- Environment: {environment}
- Deployed Version: {version}
- Owner: {owner}
- Value / Metric Count: {value}
- Summary: {summary}
- Description: {description}
- Dashboard: {dashboard_url}
- Firing Since: {active_at}

Investigate the root cause. Read the code and reproduce the failure.
If you find a real bug, make the smallest correction, run the backend tests,
and commit the fix with a clear message.

If the alert is a false positive, explain why and do not change the code."""
    return prompt.strip()


def run_headless_agent(prompt: str, alert_name: str, dry_run: bool = False, custom_cmd: str = None) -> bool:
    """Dispatches the alert prompt to the headless coding agent (agy or custom command)."""
    INCIDENT_LOGS_DIR.mkdir(parents=True, exist_ok=True)
    timestamp = datetime.datetime.now().strftime("%Y%m%d_%H%M%S")
    log_file = INCIDENT_LOGS_DIR / f"incident_{timestamp}_{alert_name}.log"

    logger.info(f"==> Launching Headless On-Call Agent for [{alert_name}]...")
    logger.info(f"==> Incident Session Log: {log_file}")

    if dry_run:
        logger.info("[DRY RUN] Would execute headless agent with prompt:")
        print("-" * 60)
        print(prompt)
        print("-" * 60)
        with open(log_file, "w") as f:
            f.write(f"DRY RUN - Prompt:\n\n{prompt}\n")
        return True

    # Determine command to invoke
    if custom_cmd:
        cmd = custom_cmd.format(prompt=prompt)
    else:
        # Default: Antigravity CLI in print / headless auto-approve mode
        cmd = ["agy", "-p", prompt, "--dangerously-skip-permissions"]

    try:
        with open(log_file, "w") as out_f:
            out_f.write(f"=== ON-CALL INCIDENT SESSION: {alert_name} ===\n")
            out_f.write(f"Timestamp: {timestamp}\n")
            out_f.write(f"Prompt:\n{prompt}\n\n")
            out_f.write("=== AGENT EXECUTION OUTPUT ===\n")
            out_f.flush()

            process = subprocess.Popen(
                cmd if isinstance(cmd, list) else cmd,
                shell=isinstance(cmd, str),
                stdout=subprocess.PIPE,
                stderr=subprocess.STDOUT,
                text=True,
            )

            # Stream output both to console and file
            for line in process.stdout:
                sys.stdout.write(line)
                sys.stdout.flush()
                out_f.write(line)
                out_f.flush()

            process.wait()

            out_f.write(f"\n=== SESSION FINISHED (Exit Code: {process.returncode}) ===\n")

        if process.returncode == 0:
            logger.info(f"Agent finished investigation for [{alert_name}] successfully.")
            return True
        else:
            logger.error(f"Agent session exited with non-zero code {process.returncode}.")
            return False

    except Exception as e:
        logger.error(f"Failed to execute headless agent: {e}")
        return False


def poll_alerts_loop(
    alert_api_url: str,
    interval: int,
    once: bool = False,
    dry_run: bool = False,
    custom_cmd: str = None,
):
    """Continuous polling loop that monitors the Alert API and invokes the agent on firing alerts."""
    logger.info(f"Starting On-Call Engineer worker")
    logger.info(f"Monitoring Alert API: {alert_api_url}")
    logger.info(f"Polling Interval: {interval} seconds")
    if dry_run:
        logger.info("Running in DRY-RUN mode (agent commands will be simulated)")

    handled_alert_fingerprints: Set[str] = set()

    while True:
        try:
            firing_alerts = get_firing_alerts(alert_api_url)

            if not firing_alerts:
                logger.info("Polling Alert API: No active firing alerts. System healthy.")
            else:
                logger.warning(f"ALERT DETECTED: {len(firing_alerts)} firing alert(s) found!")

                for alert in firing_alerts:
                    labels = alert.get("labels", {})
                    alert_name = labels.get("alertname", "UnknownAlert")
                    env = labels.get("environment", "unknown")
                    active_at = alert.get("activeAt", "")
                    fingerprint = f"{alert_name}_{env}_{active_at}"

                    # Avoid spawning duplicate agent sessions for the same active firing event
                    if fingerprint in handled_alert_fingerprints:
                        logger.info(f"Alert [{alert_name}] ({env}) already being addressed. Skipping re-trigger.")
                        continue

                    handled_alert_fingerprints.add(fingerprint)
                    prompt = format_agent_prompt(alert)
                    run_headless_agent(prompt, alert_name, dry_run=dry_run, custom_cmd=custom_cmd)

            if once:
                logger.info("One-shot poll complete (--once flag passed). Exiting worker.")
                break

            time.sleep(interval)

        except KeyboardInterrupt:
            logger.info("Received interrupt signal. On-Call worker exiting gracefully.")
            break
        except Exception as e:
            logger.error(f"Unexpected error in polling loop: {e}")
            if once:
                break
            time.sleep(interval)


def main():
    parser = argparse.ArgumentParser(description="On-Call Engineer Observability Alert Worker")
    parser.add_argument(
        "--url",
        default=DEFAULT_ALERT_API_URL,
        help=f"Prometheus Alert API URL (default: {DEFAULT_ALERT_API_URL})",
    )
    parser.add_argument(
        "--interval",
        type=int,
        default=DEFAULT_POLL_INTERVAL,
        help=f"Polling interval in seconds (default: {DEFAULT_POLL_INTERVAL})",
    )
    parser.add_argument(
        "--once",
        action="store_true",
        help="Poll once and exit immediately (useful for testing and CI)",
    )
    parser.add_argument(
        "--dry-run",
        action="store_true",
        help="Simulate alert processing and print prompt without invoking the agent",
    )
    parser.add_argument(
        "--agent-cmd",
        default=None,
        help="Custom agent CLI command template (e.g. 'agy -p \"{prompt}\"')",
    )

    args = parser.parse_args()
    poll_alerts_loop(
        alert_api_url=args.url,
        interval=args.interval,
        once=args.once,
        dry_run=args.dry_run,
        custom_cmd=args.agent_cmd,
    )


if __name__ == "__main__":
    main()
