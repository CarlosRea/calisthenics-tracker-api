import sys
import unittest
from pathlib import Path
from unittest.mock import MagicMock, patch

sys.path.insert(0, str(Path(__file__).resolve().parent))
from worker import format_agent_prompt, get_firing_alerts, run_headless_agent


class TestOnCallWorker(unittest.TestCase):
    def setUp(self):
        self.sample_alert = {
            "state": "firing",
            "activeAt": "2026-10-26T21:33:48Z",
            "value": "4.5",
            "labels": {
                "alertname": "WorkoutComponentCreationFailures",
                "severity": "critical",
                "service": "calisthenics-tracker-api",
                "environment": "production",
                "version": "1.0.0",
                "owner": "team-calisthenics-core",
            },
            "annotations": {
                "summary": "Repeated workout component creation failures detected",
                "description": "Workout creation failed 4 times over the last 2 minutes.",
                "dashboard_url": "http://localhost:3000/d/calisthenics-metrics",
            },
        }

    def test_format_agent_prompt_structure(self):
        prompt = format_agent_prompt(self.sample_alert)
        self.assertIn("You are the on-call engineer for this repository. An alert just fired.", prompt)
        self.assertIn("Alert: WorkoutComponentCreationFailures (Severity: critical)", prompt)
        self.assertIn("Service: calisthenics-tracker-api", prompt)
        self.assertIn("Environment: production", prompt)
        self.assertIn("Deployed Version: 1.0.0", prompt)
        self.assertIn("Owner: team-calisthenics-core", prompt)
        self.assertIn("Summary: Repeated workout component creation failures detected", prompt)
        self.assertIn("Description: Workout creation failed 4 times over the last 2 minutes.", prompt)
        self.assertIn("Dashboard: http://localhost:3000/d/calisthenics-metrics", prompt)
        self.assertIn("Investigate the root cause. Read the code and reproduce the failure.", prompt)
        self.assertIn("If you find a real bug, make the smallest correction, run the backend tests,", prompt)
        self.assertIn("and commit the fix with a clear message.", prompt)
        self.assertIn("If the alert is a false positive, explain why and do not change the code.", prompt)

    @patch("urllib.request.urlopen")
    def test_get_firing_alerts_filtering(self, mock_urlopen):
        mock_response = MagicMock()
        mock_response.status = 200
        mock_response.read.return_value = b"""{
            "status": "success",
            "data": {
                "alerts": [
                    {"state": "firing", "labels": {"alertname": "WorkoutComponentCreationFailures"}},
                    {"state": "pending", "labels": {"alertname": "PendingAlert"}}
                ]
            }
        }"""
        mock_response.__enter__.return_value = mock_response
        mock_urlopen.return_value = mock_response

        firing = get_firing_alerts("http://fake-alert-api")
        self.assertEqual(len(firing), 1)
        self.assertEqual(firing[0]["labels"]["alertname"], "WorkoutComponentCreationFailures")

    def test_run_headless_agent_dry_run(self):
        prompt = format_agent_prompt(self.sample_alert)
        success = run_headless_agent(prompt, "WorkoutComponentCreationFailures", dry_run=True)
        self.assertTrue(success)


if __name__ == "__main__":
    unittest.main()
