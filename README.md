# Redrise

Workspace-first SaaS for flows, tasks, agents, analytics, settings, team operations, and operational control.

## Current Stack

- Vite 8 + React 19 + TypeScript 6.
- Tailwind CSS v4 through `@tailwindcss/vite`.
- Radix/shadcn-style UI primitives under `src/components/ui/`.
- Supabase Auth, PostgreSQL, RLS, migrations, and Edge Functions.
- Vercel static SPA deployment from `https://github.com/correnthintegration/redrise.git`.
- Yarn via Corepack. Do not add npm lockfiles.

## Current Architecture

- `src/main.tsx`: React entry.
- `src/App.tsx`: Supabase session gate, profile loading, active session registration, authenticated vs unauthenticated render.
- `src/components/auth/auth-flow.tsx`: current Sign In and Sign Up flow.
- `src/components/layout/app-frame.tsx`: viewport-locked outer frame.
- `src/components/layout/app-shell.tsx`: authenticated shell and page state machine.
- `src/components/layout/sidebar.tsx`: primary navigation and profile footer.
- `src/components/layout/topbar.tsx`: page title/actions.
- `src/components/blocks/pages/`: page blocks.
- `src/components/blocks/shared/`: reusable page blocks.
- `src/lib/`: Supabase-backed domain libraries.
- `supabase/migrations/`: database schema and auth/profile/session/team changes.
- `supabase/functions/`: Supabase Edge Functions.
- `memory/`: current/future operational memory for humans and agents.
- `updates/`: active or future product update specs only.

## Current Auth Behavior

- Sign In uses Supabase e-mail/password.
- Sign Up uses First Name, optional Middle Name, optional Last Name, e-mail, password, and confirmation password.
- Supabase Auth e-mail confirmation is currently disabled.
- After Sign Up, the app suppresses the automatic Supabase sign-up session, signs out, and returns to Sign In.
- OAuth buttons are intentionally not shown until official provider credentials exist.
- Active Sessions are stored in Supabase `active_sessions` with `supabase_session_id`, device metadata, and `remembered` flag.

## Commands

```powershell
corepack yarn install
corepack yarn dev
corepack yarn lint
corepack yarn typecheck
corepack yarn test
corepack yarn build
corepack yarn test:e2e
```

## Deploy

- Target GitHub repository: `https://github.com/correnthintegration/redrise.git`.
- Base operational account for GitHub/Vercel/Supabase: `integration@correnth.com`.
- Preferred frontend deploy path is Vercel CI/CD connected to the GitHub repository.
- Build command: `corepack yarn build`.
- Install command: `corepack yarn install --frozen-lockfile`.
- Output directory: `dist`.
- Use the operational MCP when possible: `corepack yarn mcp:redrise-ops`.

## Current References

- Architecture and agent rules: `AGENTS.md`.
- Human-readable technical map: `memory/TECHNICAL.md`.
- Current decisions: `memory/DECISIONS.md`.
- Handoff and next work: `memory/HANDOFF.md`.
- Active/future specs: `updates/`.
