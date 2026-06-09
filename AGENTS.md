# AGENTS

> Project-level operating rules for AI agents and humans working on this codebase.
> Inherits from any parent `AGENTS.md` and the framework docs in `D:\REDSCALE\_PLANROOT\`.

## Stack

- **Build**: Vite 8 + `@vitejs/plugin-react`
- **Framework**: React 19 + TypeScript
- **Styling**: Tailwind CSS v4 via `@tailwindcss/vite` (CSS variables, no `tailwind.config.ts`)
- **UI primitives**: shadcn-style components under `src/components/ui/` (Radix + CVA + tailwind-merge)
- **Routing**: state machine in `src/components/layout/sidebar.tsx` + thin route shims in `src/app/`
- **State**: pure React + `localStorage` (no Redux, no Zustand)

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

## Architecture blocks (modular)

Everything is a block. The hierarchy is:

```
App
└── AppFrame                    [Z-0: outer container / viewport lock]
    ├── AuthFlow                [Z-1: sign-in | sign-up | confirm-code, when no session]
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

## Persistence keys (localStorage)

| Key | Type | Owner | Purpose |
|---|---|---|---|
| `app:session` | `{ user: { name, email } }` | `App.tsx` | auth session |
| `app:sidebar:collapsed` | `"0" \| "1"` | `sidebar.tsx` | sidebar collapse state (idempotent) |

## Invariants

- Exactly one authenticated user per session.
- `core_always` blocks (sidebar + topbar + main) are always present when authenticated.
- Sidebar collapse state is **idempotent** — multiple toggles produce the same final state.
- All copy is `[Placeholder: …]` until content is approved.
- No external CDN URLs (pravatar, etc.). All assets are local or `data:` URIs.

## Commands

```powershell
npm install
npm run dev          # vite dev server
npm run build        # tsc -b && vite build
npm run lint         # eslint .
npm run preview      # vite preview (serve dist/)
```

## Language

- Technical files: **EN-US**
- Human-facing copy in this scaffold: **EN-US with `[Placeholder: …]` tokens** — replace per language.
