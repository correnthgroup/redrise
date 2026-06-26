# AGENTS

> Project-level operating rules for AI agents and humans working on this codebase.

## Stack

- **Build**: Vite 8 + `@vitejs/plugin-react`
- **Framework**: React 19 + TypeScript 6
- **Styling**: Tailwind CSS v4 via `@tailwindcss/vite` (CSS variables, no `tailwind.config.ts`)
- **UI primitives**: shadcn-style components under `src/components/ui/` (Radix + CVA + tailwind-merge)
- **Routing**: state machine in `src/components/layout/app-shell.tsx` via `SidebarKey` + thin route shims in `src/app/`
- **State**: React hooks + Supabase-backed domain libraries; `localStorage` only for UI preferences such as sidebar collapse
- **Backend**: Supabase Auth, PostgreSQL, RLS, migrations, and Edge Functions. The active project must be the new `integration@correnth.com` owned Redrise project.
- **Hosting**: Render static site, built from `https://github.com/correnthgroup/redrise.git` under `integration@correnth.com`.
- **Package manager**: Yarn via Corepack. Do not add npm lockfiles.
- **Operational MCP**: `redrise-ops` in `scripts/mcp/redrise-ops.mjs`

## Entry points

- App entry: `src/main.tsx`
- Root component: `src/App.tsx`
- Outer shell: `src/components/layout/app-frame.tsx`
- Auth gate: `src/components/auth/auth-flow.tsx`
- Authenticated shell: `src/components/layout/app-shell.tsx`
- Sidebar (idempotent): `src/components/layout/sidebar.tsx`
- Topbar: `src/components/layout/topbar.tsx`
- Page blocks: `src/components/blocks/pages/`
- Shared blocks: `src/components/blocks/shared/`
- UI primitives: `src/components/ui/`
- Domain libraries: `src/lib/`
- Hooks: `src/hooks/`
- Supabase migrations/functions: `supabase/`
- Human/product memory: `memory/`
- Product updates: `updates/`
- Operational docs: `docs/`

## Architecture blocks (modular)

Everything is a block. The hierarchy is:

```
App
└── AppFrame                    [Z-0: outer container / viewport lock]
    ├── AuthFlow                [Z-1: sign-in | sign-up, when no session]
    └── AppShell                [Z-1: when authenticated]
        ├── Sidebar             [Z-default, layout column, left]
        │   ├── Logo row
        │   ├── Nav (6 items, fixed order)
        │   ├── Contextual block (per nav key)
        │   └── Profile footer
        ├── Topbar              [Z-default, top, per-page title + actions]
        └── main → page block   [Z-default, scroll container]
            ├── DashboardPage
            ├── FlowListPage
            ├── FlowBuilderPage
            ├── TaskBoardPage
            ├── AgentListPage
            ├── AgentCreatePage
            ├── AgentDetailPage
            ├── AnalyticsPage
            ├── SettingsPage
            ├── PlansPage
            ├── AccountBasicInfoPage
            ├── CreateTaskPage
            ├── CreateWorkspacePage
            ├── ReviewTaskPage
            └── ReviewWorkspacePage
```

## Z-order (back to front)

| Layer | Z-index | Where | File |
|---|---|---|---|
| **0 - Body** | (root) | `<html>`, `<body>`, root background | `src/index.css` |
| **1 - Outer frame** | (root) | gray padding around the panel | `src/components/layout/app-frame.tsx` + `.module.css` |
| **2 - Panel** | (root) | white rounded surface, only authoritative clip | `src/components/layout/app-frame.tsx` + `.module.css` |
| **3 - Sidebar / Topbar** | default | layout columns, in normal flow | `src/components/layout/{sidebar,topbar}.tsx` |
| **4 - Main content** | default | page-level content, in normal flow | `src/components/blocks/pages/*.tsx` |
| **5 - Cards / Lists** | default | `<Card>`, `<CardList>`, tables, kanban, flow canvas | `src/components/ui/card.tsx`, `src/components/layout/card-list.tsx` |
| **6 - Overlays** | `z-50` | Radix `Dialog` overlay, content, header, footer | `src/components/ui/dialog.tsx` |
| **7 - Popovers / Menus** | `z-50` | Radix `Popover`, `DropdownMenu`, `Select`, `Tooltip` content | `src/components/ui/{popover,dropdown-menu,select,tooltip}.tsx` |
| **8 - Toasts (future)** | `z-[60]` | not implemented; reserved | — |

Rules:
- **No global scroll.** Only local `ScrollArea` blocks own their own scroll.
- **Viewport-locked shell.** The `AppFrame` is `h-full` and never scrolls itself.
- **Sidebar is a layout column**, not a sticky/floating element.
- **All Radix portal content** (dialog, dropdown, popover, select, tooltip) uses `z-50`.

## Sources Of Truth

| Domain | Source | Primary files |
|---|---|---|
| Auth session | Supabase Auth | `src/App.tsx`, `src/components/auth/auth-flow.tsx` |
| Profile | Supabase `profiles` | `src/lib/user-profile.ts`, `AccountBasicInfoPage` |
| Remembered sessions | Supabase `active_sessions` | `src/lib/user-profile.ts`, `SessionsList` |
| Team members | Supabase `team_members` | `src/lib/team-members.ts`, `use-team-member-options.ts`, `MemberListTable` |
| Workspaces | Supabase | `src/lib/workspaces.ts`, `use-workspaces.ts` |
| Flows | Supabase | `src/lib/flows.ts`, `use-flows.ts` |
| Tasks | Supabase | `src/lib/tasks.ts`, `use-tasks.ts` |
| Agents | Supabase | `src/lib/agents.ts`, `use-agents.ts` |
| Plans | UI placeholder only for now | `src/components/blocks/pages/plans-page.tsx` |

## localStorage Keys

| Key | Type | Owner | Purpose |
|---|---|---|---|
| `app:sidebar:collapsed` | `"0" \| "1"` | `sidebar.tsx` | sidebar collapse state (idempotent) |

## Invariants

- Exactly one authenticated user per session.
- `core_always` blocks (sidebar + topbar + main) are always present when authenticated.
- Sidebar collapse state is **idempotent** — multiple toggles produce the same final state.
- No external CDN asset dependencies. Assets should be local or `data:` URIs.
- Settings detail screens keep one Back control in the detail header.
- Any member picker/dropdown must use Settings > Team Members as the source through `loadTeamMembers()` or `useTeamMemberOptions()`.
- **All dropdown triggers** (Select, DropdownMenu, future pickers) must use `DROPDOWN_TRIGGER_CLASSES` from `src/lib/styles.ts`. When using `Button` as trigger, always pass `variant="outline"` alongside the constant so CVA hover classes align. Do not hardcode trigger classes inline.
- Profile edits must preserve the `redrise:profile-updated` event so Sidebar and Dashboard update.
- Plans UI must not unlock paid features from frontend-only state; real billing requires backend checkout, webhook, and persisted plan state.
- Permission badges/notices are informational until enforced by backend/RLS.
- Do not reintroduce profile/session/team member persistence in `localStorage`.

## Memory And Graph Rules

- Before relevant code, architecture, schema, flow, permission, billing, deploy, or product behavior changes, consult `memory/CONTEXT.md`, `memory/DECISIONS.md`, `memory/HANDOFF.md`, `memory/TASK_LOG.md`, and `memory/TECHNICAL.md`.
- `memory/TECHNICAL.md` is the detailed PT-BR human-readable map of app behavior and cross-screen dependencies.
- If `graphify-out/graph.json` exists, consult graphify before cross-file architecture/dependency changes.
- After relevant changes, update affected memory files.
- After relevant changes, update graphify if available. If only code graph updates are possible, record pending semantic doc re-extraction.

## Commands

```powershell
corepack yarn install
corepack yarn dev          # vite dev server
corepack yarn build        # tsc -b && vite build
corepack yarn lint         # eslint .
corepack yarn typecheck    # tsc -b --pretty false
corepack yarn test         # vitest run --coverage
corepack yarn test:e2e     # playwright test
corepack yarn preview      # vite preview (serve dist/)
corepack yarn mcp:redrise-ops
corepack yarn mcp:redrise-ops:self-test
.\.tools\uv\uv.exe sync  # install local Python 3.12 tooling
.\.tools\uv\uv.exe run python -m graphify update . --force  # refresh graphify
```

## Python Tooling

- Python tooling is local to this repository through `uv`, pinned by `.python-version` to Python 3.12.
- Use `.\.tools\uv\uv.exe` in this workspace; do not call a global `python.exe`, `python`, or `graphify` for project operations.
- Python dependencies are declared in `pyproject.toml` and locked in `uv.lock`.
- `.venv/` and `.tools/` are local-only and ignored by git.

## Deploy

- Preferred frontend deploy: Render auto-deploy from `https://github.com/correnthgroup/redrise.git`, configured by `render.yaml`.
- Render settings must use `corepack enable && corepack yarn install --frozen-lockfile && corepack yarn build` and publish directory `dist`.
- The `redrise-ops` MCP exposes validation/build, Supabase status/deploy, graph status, and memory note tools.
- Supabase Edge Functions are deployed with Supabase CLI after linking the new `integration@correnth.com` owned Supabase project.

## Language

- Technical files: **EN-US**
- Human-facing product docs for non-technical readers may be **PT-BR**, especially under `memory/TECHNICAL.md`.
- UI copy currently mixes existing English literals and i18n keys; preserve established copy unless changing the specific screen.
- Mojibake is forbidden. Use valid UTF-8 text.
