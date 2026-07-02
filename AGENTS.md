# AGENTS

> Project-level operating rules for AI agents and humans working on this codebase.

## Stack

- **Build**: Next.js 16 (Turbopack) + `next build`
- **Framework**: React 19 + TypeScript ~5.7
- **Styling**: Tailwind CSS v4 via `@tailwindcss/postcss` (oklch CSS variables, no `tailwind.config.ts`)
- **UI primitives**: shadcn components under `src/components/ui/` (Radix + CVA + tailwind-merge, base-nova style)
- **Routing**: Next.js App Router with route groups `(auth)` and `(dashboard)`
- **State**: React hooks + Supabase-backed domain libraries; `localStorage` only for UI preferences
- **Backend**: Supabase Auth, PostgreSQL, RLS, migrations, and Edge Functions. The active project must be the `integration@correnth.com` owned Redrise project.
- **Hosting**: Render static site, built from `https://github.com/correnthgroup/redrise.git` under `integration@correnth.com`.
- **Package manager**: npm. Do not add yarn.lock or pnpm-lock.yaml.
- **Operational MCP**: `redrise-ops` in `scripts/mcp/redrise-ops.mjs`

## Entry points

- App entry: `src/app/layout.tsx` (root layout with Geist font, ThemeProvider, Toaster)
- Root page: `src/app/page.tsx` (redirects to `/workstation`)
- Auth layout: `src/app/(auth)/layout.tsx` (centered container)
- Dashboard layout: `src/app/(dashboard)/layout.tsx` (AppLayout with sidebar + breadcrumb)
- Sidebar: `src/components/app-sidebar.tsx`
- Sidebar nav: `src/components/nav-main.tsx` (collapsible groups)
- App layout: `src/components/app-layout.tsx` (SidebarProvider + Breadcrumb header)
- UI primitives: `src/components/ui/` (44 shadcn components)
- Domain libraries: `src/lib/`
- Hooks: `src/hooks/`
- Types: `src/types/`
- Supabase migrations/functions: `supabase/`
- Human/product memory: `memory/`
- Product updates: `updates/`
- Operational docs: `docs/`
- Knowledge graph: `graphify-out/`

## Architecture

```
App (Next.js App Router)
├── Root Layout                    [Geist font, ThemeProvider, Toaster]
│   ├── page.tsx                   [redirect → /workstation]
│   └── globals.css                [Tailwind oklch theme, light/dark]
│
├── (auth)/                        [Unauthenticated]
│   ├── layout.tsx                 [centered flex container]
│   ├── login/page.tsx
│   └── signup/page.tsx
│
└── (dashboard)/                   [Authenticated]
    ├── layout.tsx                 [AppLayout → SidebarProvider + SidebarInset + Breadcrumb]
    │
    ├── workstation/
    │   ├── page.tsx               [Dashboard: SectionCards, ChartAreaInteractive, DataTable]
    │   ├── workspace/
    │   │   ├── page.tsx           [Space list with cards, context menu, delete dialog]
    │   │   ├── new/page.tsx       [Create space: form, team roles, preview]
    │   │   └── [id]/
    │   │       ├── edit/page.tsx  [Edit space]
    │   │       └── resume/page.tsx [Space report]
    │   ├── workflow/page.tsx      [Process/flow list]
    │   └── workaction/page.tsx    [Action/task list]
    │
    ├── agents/
    │   ├── page.tsx               [Agent overview]
    │   ├── models/page.tsx        [Model configuration]
    │   ├── engine/page.tsx        [Engine configuration]
    │   └── analytics/page.tsx     [Agent analytics]
    │
    ├── documentation/
    │   ├── page.tsx               [Documentation hub]
    │   ├── introduction/page.tsx
    │   ├── get-started/page.tsx
    │   ├── tutorials/page.tsx
    │   └── changelog/page.tsx
    │
    └── settings/
        ├── page.tsx               [Settings hub]
        ├── general/page.tsx
        ├── team/page.tsx
        ├── billing/page.tsx
        └── limits/page.tsx
```

## Sidebar Navigation

The sidebar follows the official Redrise menu structure:

| Group | Items | Route |
|---|---|---|
| **Workstation** | Space, Process, Action | `/workstation/*` |
| **Agents** | Models, Engine, Analytics | `/agents/*` |
| **Documentation** | Introduction, Get Started, Tutorials, Changelog | `/documentation/*` |
| **Settings** | General, Team, Billing, Limits | `/settings/*` |

Nav groups are collapsible with localStorage persistence.

## Sources Of Truth

| Domain | Source | Primary files |
|---|---|---|
| Auth session | Supabase Auth | `src/app/(auth)/*`, `src/lib/supabase.ts` |
| Profile | Supabase `profiles` | `src/lib/user-profile.ts` |
| Team members | Supabase `team_members` | `src/lib/team-members.ts`, `src/hooks/use-team-member-options.ts` |
| Workspaces | Supabase | `src/lib/workspaces.ts`, `src/hooks/use-workspaces.ts` |
| Flows | Supabase | `src/lib/flows.ts`, `src/hooks/use-flows.ts` |
| Tasks | Supabase | `src/lib/tasks.ts`, `src/hooks/use-tasks.ts` |
| Agents | Supabase | `src/lib/agents.ts`, `src/hooks/use-agents.ts` |
| Notifications | Supabase Realtime | `src/lib/notifications.ts`, `src/hooks/use-notifications.ts` |

## Invariants

- Exactly one authenticated user per session.
- Sidebar + breadcrumb are always present when authenticated.
- No external CDN asset dependencies. Assets should be local or `data:` URIs.
- Any member picker/dropdown must use Settings > Team Members as the source through `loadTeamMembers()` or `useTeamMemberOptions()`.
- Plans UI must not unlock paid features from frontend-only state; real billing requires backend checkout, webhook, and persisted plan state.
- Do not reintroduce profile/session/team member persistence in `localStorage` beyond UI preferences.

## Environment Variables

| Variable | Required | Purpose |
|---|---|---|
| `NEXT_PUBLIC_SUPABASE_URL` | Yes | Supabase project URL |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Yes | Supabase anonymous key |
| `SUPABASE_SERVICE_ROLE_KEY` | Edge Functions | Admin access |
| `OPENROUTER_API_KEY` | Edge Functions | AI model access |
| `STRIPE_SECRET_KEY` | Edge Functions | Payment processing |
| `STRIPE_WEBHOOK_SECRET` | Edge Functions | Stripe events |
| `APP_BASE_URL` | Edge Functions | App base URL |

## Memory And Graph Rules

- Before relevant code, architecture, schema, flow, permission, billing, deploy, or product behavior changes, consult `memory/CONTEXT.md`, `memory/DECISIONS.md`, `memory/HANDOFF.md`, `memory/TASK_LOG.md`, and `memory/TECHNICAL.md`.
- `memory/TECHNICAL.md` is the detailed PT-BR human-readable map of app behavior and cross-screen dependencies.
- If `graphify-out/graph.json` exists, consult graphify before cross-file architecture/dependency changes.
- After relevant changes, update affected memory files.
- After relevant changes, run `python -m graphify update . --force` to refresh the knowledge graph.

## Commands

```bash
npm install              # Install dependencies
npm run dev              # Start dev server (localhost:3000)
npm run build            # Next.js production build
npm run start            # Start production server
npm run lint             # ESLint
npm run typecheck        # TypeScript check
npm run mcp:redrise-ops  # Operational MCP server
python -m graphify update . --force  # Refresh knowledge graph
```

## Deploy

- Preferred frontend deploy: Render auto-deploy from `https://github.com/correnthgroup/redrise.git`, configured by `render.yaml`.
- Render build: `corepack enable && corepack yarn install --frozen-lockfile && corepack yarn build`
- Output directory: `dist`
- The `redrise-ops` MCP exposes validation/build, Supabase status/deploy, graph status, and memory note tools.
- Supabase Edge Functions are deployed with Supabase CLI after linking the `integration@correnth.com` owned Supabase project.

## Language

- Technical files: **EN-US**
- Human-facing product docs for non-technical readers may be **PT-BR**, especially under `memory/TECHNICAL.md`.
- UI copy currently mixes existing English literals and i18n keys; preserve established copy unless changing the specific screen.
- Mojibake is forbidden. Use valid UTF-8 text.
