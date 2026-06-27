# PRD: Agent Task Execution Responsibility

## Status

- Owner: Redrise product/engineering.
- Date: 2026-06-27.
- Status: active realignment PRD.
- Source request: Agents in Redrise must have one operational responsibility: execute Tasks. Remove product surfaces that turn Agents into builders or process modelers.

## Decision

- Agents execute Tasks only.
- Users model Workspaces, Flows, Flow cards, Tasks, approval rules, branches, retries, loops, and human gates through the Redrise UI.
- Agents do not create, draft, propose, or alter Workspaces, Flows, Flow cards, Tasks, process definitions, approval rules, branches, retries, loops, or orchestration logic.
- Agents do not decide the next Task.
- The Execution Engine decides the next operational step from the published Flow definition.

## Execution Contract

```text
Task
    ↓
Agent executes
    ↓
Structured output
    ↓
Execution Engine interprets result
```

An Agent returns structured execution data only:

- produced output;
- execution status;
- evidence when applicable;
- generated artifacts;
- continuity information needed by the Flow.

The Execution Engine may then:

- start the next Task;
- return to a previous Task;
- repeat the same Task as loop or retry;
- follow a conditional branch;
- start a child Flow;
- wait for human intervention;
- interrupt execution;
- finish the Flow.

## Removed Scope

- Agent Builder chat for creating Workspaces, Flows, Tasks, checklists, or proposals.
- Builder sessions, Builder messages, proposed changes, and Builder deletion approval workflow.
- Tool Gateway and external LLM write governance.
- AI outline import in Flow Builder.
- Any UI copy suggesting Agents model the process instead of executing Tasks.

## Retained Scope

- Agent provider/model connection and status management.
- Agent detail and execution history.
- Task execution through deterministic `execution_path` and `task-execute`.
- Task execution output review and Task Board status synchronization.
- Qdrant configuration may remain as backend infrastructure for future execution-context retrieval, but it must not expose a Builder/product-modeling surface.

## Acceptance Criteria

- Agent list has no `Build` / `Construir` action.
- No route or component opens an Agent Builder page.
- No frontend library applies Agent-generated Workspace/Flow/Task proposals.
- Flow Builder has no `Import AI outline` action.
- Settings has no AI Governance / Tool Gateway configuration screen.
- Memory and source-of-truth docs identify this PRD as the current Agent behavior reference.
