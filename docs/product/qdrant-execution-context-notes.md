# Qdrant Execution Context Notes

## Status

- Owner: Redrise product/engineering.
- Date: 2026-06-27.
- Status: retained infrastructure note.

## Decision

- Qdrant configuration may remain useful for future execution-context retrieval.
- Qdrant must not power an Agent Builder, process modeler, Workspace creator, Flow creator, Task creator, or proposal generator.
- Any future use must support Task execution context only, where an Agent executes the current Task and returns structured output.

## Allowed Future Direction

- Retrieve approved operational context for the current Task.
- Retrieve prior approved Task outputs or evidence needed by the current Task.
- Keep retrieval scoped by organization owner context, Agent, Flow, and Task where applicable.
- Keep provider, Qdrant, and embedding secrets backend-only.

## Blocked Direction

- Builder chat.
- Automatic Flow/Task/Workspace drafting.
- Tool Gateway writes.
- External LLM process modeling.
- Agent-decided orchestration or next-step selection.
