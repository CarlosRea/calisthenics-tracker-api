# Development Process

- **One Task at a Time:** Work on GitHub issues sequentially, one at a time.
- **Acceptance Criteria:** Read the acceptance criteria before starting a task and verify all criteria are satisfied before closing the issue.
- **Commit Regularly:** Make granular git commits after each meaningful decision, passing test, or completed feature.
- **Maintain Documents:** Update documentation in `docs/` whenever architectural, testing, or design decisions evolve.

## Roles

- **PM:** Grooms a task before anyone implements it, follows `docs/team/pm.md`.
- **Engineer:** Implements one groomed task, follows `docs/team/software-engineer.md`.
- **QA:** Checks the result against the acceptance criteria, follows `docs/team/qa-engineer.md`.
- **DevOps:** Maintains the CI/CD pipeline, container infrastructure, and automated release validation, follows `docs/team/devops.md`.

## Orchestrator

The main session is the orchestrator. It launches the PM, the engineer and QA as subagents. It does not groom, implement or test itself.

### Lifecycle

1. Pick the next open issue from the backlog
2. PM grooms it
3. Engineer implements it
4. QA verifies it
5. On FAIL, back to step 3 with the QA comment as input
6. On PASS, close the issue
7. Repeat until the backlog is empty

### Rules

- Do not skip step 2
- The engineer does not close the issue
- QA does not fix the code, only outputs PASS or FAIL
- The orchestrator closes the issue only after QA outputs PASS
