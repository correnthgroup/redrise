# CONTEXT

## Project

- Name: `Redrise`.
- Purpose: workspace-first SaaS for flows, tasks, agents, analytics, settings, team members, plans, and operational control.
- Owner: `Correnth Group`.
- Base operational account: `integration@correnth.com`.
- GitHub repository: `https://github.com/correnthgroup/redrise.git`.
- Official production URL: `https://www.redrise.app`.
- Invite sender domain: `hi.from@redrise.app` through Resend.
- Supabase project ref: `vsaropewydcjsvplpugx`.
- Render project/workspace: `Redrise`.
- Render service: `redrise` (`srv-d8rjudj6sc1c73bc9fu0`).

## Current Product Rules

- Supabase is the source of truth for auth, profiles, active sessions, team members, workspaces, flows, tasks, and agents.
- Supabase is also the source of truth for operational notifications through `notifications`.
- Flow approval and official status are Supabase-backed fields on `flows`.
- Browser storage is allowed for UI preferences and short transition notices only.
- Do not store profile, session, team member, workspace, flow, task, or agent domain data in `localStorage`.
- Settings > Team Members is the source for member dropdowns in Flow and Tasks.
- Settings > Plans is UI-only until Stripe checkout, webhook, persisted plan state, and permission matrix exist.
- Admin/Member/Viewer indicators are informational until backend/RLS permission enforcement is implemented.
- OAuth remains future work until GitHub, Google, and Microsoft/Azure provider credentials are configured and tested.
- E-mail confirmation remains future work until official SMTP/sender/template/retry policy exists.
- `memory/TECHNICAL.md` is the human-readable PT-BR map for current behavior and approved future direction.
- Current Corporate simplification PRD source pointer is `docs/product/current-source-of-truth.md`.
- Agent behavior source: `docs/product/agent-task-execution-responsibility-prd.md` (Agents execute Tasks only; no Builder, no Gateway, no Governance surfaces).
- Qdrant infra notes: `docs/product/qdrant-execution-context-notes.md` (retained for future execution-context retrieval only).

## Quality Rules

- Use Yarn through Corepack.
- Use repository-local Python tooling through `.\.tools\uv\uv.exe`; Python is pinned to 3.12 by `.python-version` and dependencies are locked in `uv.lock`.
- Do not add `package-lock.json`.
- Run lint, typecheck, tests, build, and E2E for auth, settings, navigation, deploy, or cross-screen changes.
- Keep production deploys on Render.
- Use Render auto-deploy from GitHub as the primary deploy path.
