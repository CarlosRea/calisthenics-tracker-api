# Development Process

## Core Engineering Rules
- **Task Isolation:** Work on well-defined backlog issues with clear file boundaries.
- **Acceptance Criteria:** Every issue must have explicit, checkable acceptance criteria before implementation starts.
- **Continuous Validation:** Run automated test suites (`make test-all`, `make e2e`) before merging any branch.
- **Granular Commits:** Make descriptive git commits after each passing test or milestone.

---

## Agentic Building Blocks

### 1. Discoverable Skills (`.agents/skills/`)
Skills provide structured, repeatable procedures that agents discover and execute automatically:
- [`incident-response`](file:///home/ubuntu/calisthenics-tracker-api/.agents/skills/incident-response/SKILL.md): Triage, reproduce, and resolve active alerts.
- [`release`](file:///home/ubuntu/calisthenics-tracker-api/.agents/skills/release/SKILL.md): Bump versions, build tagged multi-stage images, and verify releases.
- [`test-and-verify`](file:///home/ubuntu/calisthenics-tracker-api/.agents/skills/test-and-verify/SKILL.md): Execute backend, frontend, and Playwright E2E suites.

### 2. Specialized Subagents (`.agents/agents/`)
Specialized roles execute in fresh context windows to eliminate context rot and cognitive bias:
- [`product-manager`](file:///home/ubuntu/calisthenics-tracker-api/.agents/agents/product-manager.md): Grooms raw user stories into specifications with checkable criteria (`docs/team/pm.md`).
- [`software-engineer`](file:///home/ubuntu/calisthenics-tracker-api/.agents/agents/software-engineer.md): Implements groomed tasks and writes comprehensive tests (`docs/team/software-engineer.md`).
- [`qa-engineer`](file:///home/ubuntu/calisthenics-tracker-api/.agents/agents/qa-engineer.md): Validates finished work against acceptance criteria and returns a strict verdict (`PASS` or `FAIL`) (`docs/team/qa-engineer.md`).
- [`devops`](file:///home/ubuntu/calisthenics-tracker-api/.agents/agents/devops.md): Manages Docker Compose stacks, CI/CD workflows, and OpenTelemetry instrumentation (`docs/team/devops.md`).
- [`on-call-engineer`](file:///home/ubuntu/calisthenics-tracker-api/.agents/agents/on-call-engineer.md): Investigates alerts polled from the Prometheus Alert API.

---

## Orchestrator & Parallel Execution

The main coding session serves as the **Task Orchestrator**. It coordinates the workflow and never implements or tests issues itself.

### Sequential Task Lifecycle
```
[ Backlog Issue ]
       │
       ▼
[ Product Manager (PM) ] ── (Grooms specs & acceptance criteria)
       │
       ▼
[ Software Engineer (SWE) ] ◄──┐
       │                       │
       ▼                       │
[ QA Engineer (QA) ] ──────────┘
       │
       ├─► FAIL: Return QA failure log to SWE
       └─► PASS: Orchestrator closes issue & merges code
```

### Parallel Execution with Git Worktrees
When working on multiple independent issues simultaneously, the orchestrator parallelizes work across isolated git worktrees (running up to five agents in parallel):

```
                      +-------------------+
                      |   Orchestrator    |
                      +---------+---------+
                                │
       ┌────────────────────────┼────────────────────────┐
       ▼                        ▼                        ▼
+--------------+         +--------------+         +--------------+
| Worktree #1  |         | Worktree #2  |         | Worktree #3  |
| Issue #101   |         | Issue #102   |         | Issue #103   |
| (PM->SWE->QA)|         | (PM->SWE->QA)|         | (PM->SWE->QA)|
+-------+------+         +-------+------+         +-------+------+
        │                        │                        │
        └────────────────────────┼────────────────────────┘
                                 ▼
                     Sequential Merge into main
```

#### Orchestrator Responsibilities:
1. **Backlog Partitioning:** Split backlog into independent, non-overlapping issue tracks.
2. **Worktree Provisioning:** Create an isolated git worktree for each task (`git worktree add ../wt-issue-101 -b feat/issue-101`).
3. **Capacity Management:** Keep up to 5 agent slots active while eligible backlog items remain.
4. **Independent Review:** Dispatch completed implementation to a fresh QA subagent.
5. **Feedback Loop:** On `FAIL`, send reproduction steps and failed criteria back to the implementer in that worktree.
6. **Sequential Merge:** On `PASS`, merge approved worktree branches into `main` one at a time, verify tests, and prune the worktree (`git worktree remove`).
7. **Zero Scope Creep:** Coordinate the work; never edit code directly in the orchestrator session.
