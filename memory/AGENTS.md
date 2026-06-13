# memory/AGENTS.md

> Project memory rules. Technical files: EN-US. Human-facing memory: PT-BR when the document explains product behavior to non-technical humans.

## Scope of memory

- `memory/CONTEXT.md` — high-level project context
- `memory/DECISIONS.md` — decisions taken during scaffolding
- `memory/HANDOFF.md` — what to do next, blockers, open questions
- `memory/TASK_LOG.md` — chronological log of work done
- `memory/TECHNICAL.md` — PT-BR human-readable technical map of app behavior, dependencies, and planned changes

## Conventions

- One fact per line; tables preferred over prose.
- Always cite source paths when a fact comes from another folder.
- Never invent facts. Mark anything unknown as `[PENDENTE]` or `[UNKNOWN]`.
- Before relevant code or product changes, consult `memory/CONTEXT.md`, `memory/DECISIONS.md`, `memory/HANDOFF.md`, `memory/TASK_LOG.md`, and `memory/TECHNICAL.md`.
- If `graphify-out/graph.json` exists, consult the graph before architecture, dependency, or cross-file changes using graphify query/path/explain.
- At the end of every relevant code, architecture, schema, flow, or product behavior change, update the affected memory files.
- At the end of every relevant code, architecture, schema, flow, or product behavior change, update the graph if graphify is available for this project; if no graph exists yet, explicitly note that graph update is pending.
- Do not implement planned behavior from `memory/TECHNICAL.md` unless the section says it is already current behavior or the user explicitly asks to execute the plan.
