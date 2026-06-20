# CONTEXT

## Project

- Name: `Redrise`.
- Purpose: workspace-first SaaS for flows, tasks, agents, analytics, settings, team members, plans, and operational control.
- Owner: `Correnth Integration`.
- Base operational account: `integration@correnth.com`.
- GitHub repository: `https://github.com/correnthintegration/redrise.git`.
- Official production URL: `[PENDENTE: dominio]`.
- Supabase project ref: `[PENDENTE: novo projeto]`.
- Vercel project: `[PENDENTE: novo projeto]`.

## Current Product Rules

- Supabase is the source of truth for auth, profiles, active sessions, team members, workspaces, flows, tasks, and agents.
- Browser storage is allowed for UI preferences and short transition notices only.
- Do not store profile, session, team member, workspace, flow, task, or agent domain data in `localStorage`.
- Settings > Team Members is the source for member dropdowns in Flow and Tasks.
- Settings > Plans is UI-only until Stripe checkout, webhook, persisted plan state, and permission matrix exist.
- Admin/Member/Viewer indicators are informational until backend/RLS permission enforcement is implemented.
- OAuth remains future work until GitHub, Google, and Microsoft/Azure provider credentials are configured and tested.
- E-mail confirmation remains future work until official SMTP/sender/template/retry policy exists.
- `memory/TECHNICAL.md` is the human-readable PT-BR map for current behavior and approved future direction.

## Quality Rules

- Use Yarn through Corepack.
- Do not add `package-lock.json`.
- Run lint, typecheck, tests, build, and E2E for auth, settings, navigation, deploy, or cross-screen changes.
- Keep production deploys on the new Vercel project connected to `https://github.com/correnthintegration/redrise.git`.
- Use Vercel GitHub CI/CD as the primary deploy path after the new project is linked.
