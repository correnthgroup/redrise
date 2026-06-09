# app

> App scaffold generated from `D:\REDSCALE\_PLANROOT\` Planroot framework.
> The interview was auto-filled by observing `D:\Worthness\Agentra` as a confirmed-fact reference.
> All copy, brand tokens and external URLs are placeholder-only.

## What this is

A modular Vite + React 19 + TypeScript + Tailwind v4 scaffold with:

- **Viewport-locked shell** (`AppFrame`) → outer gray padding + inner white rounded panel
- **Auth gate** (`AuthFlow`) → sign-in, sign-up, confirm-code (3 modes in one 2-column layout)
- **Authenticated shell** (`AppShell`) → sidebar + topbar + main content
- **Idempotent sidebar** (`Sidebar`) → collapsible/expandable, persisted in `localStorage`
- **20 UI primitives** (shadcn-style, Radix + CVA) under `src/components/ui/`
- **28 page/shared blocks** under `src/components/blocks/{pages,shared}/`
- **Thin route shims** under `src/app/` (for future router wiring)

## Z-order (back to front)

Full doc: see `AGENTS.md` § Z-order.

1. Body / root
2. `AppFrame` outer + inner panel
3. Sidebar (left column) + Topbar (top row)
4. Main content + cards / lists / kanban / flow canvas
5. Radix overlays (`z-50`) — Dialog, DropdownMenu, Popover, Select, Tooltip

## Directory map

```
app/
├── public/                              favicon, icons (SVG placeholders)
├── src/
│   ├── main.tsx                         React entry
│   ├── App.tsx                          root gate (auth vs shell)
│   ├── index.css                        Tailwind v4 + theme vars + keyframes
│   ├── lib/utils.ts                     cn() helper
│   ├── components/
│   │   ├── auth/auth-flow.tsx           sign-in | sign-up | confirm-code
│   │   ├── layout/
│   │   │   ├── app-frame.tsx            viewport-locked rounded shell
│   │   │   ├── app-shell.tsx            authenticated shell
│   │   │   ├── sidebar.tsx              idempotent collapsible sidebar
│   │   │   ├── topbar.tsx               per-page topbar
│   │   │   └── card-list.tsx            shared list surface
│   │   ├── ui/                          20 primitives (avatar, button, …)
│   │   └── blocks/
│   │       ├── pages/                   14 page blocks (dashboard, tasks, …)
│   │       └── shared/                  17 shared blocks (kpi-cards, …)
│   └── app/                             route shims (page.tsx each)
├── AGENTS.md                            z-order + invariants
├── README.md                            this file
├── components.json                      shadcn registry config
├── package.json
├── tsconfig.json / tsconfig.app.json / tsconfig.node.json
├── vite.config.ts
├── eslint.config.js
└── index.html
```

## How to run

```powershell
npm install
npm run dev
```

Then open the printed URL.

## How to extend

- **Add a UI primitive**: create `src/components/ui/<name>.tsx` following the existing pattern (Radix + CVA, `cn()` for class merging).
- **Add a shared block**: create `src/components/blocks/shared/<name>.tsx` and re-export it from `shared/index.ts`.
- **Add a page**: create `src/components/blocks/pages/<name>-page.tsx`, then add it to the `pages` prop in `App.tsx` and to `SIDEBAR_KEYS` in `sidebar.tsx`.
- **Add a route shim**: create `src/app/<path>/page.tsx` that re-exports the page block.

## Placeholders

All visible copy is wrapped in `[Placeholder: …]` or `[Token]` so you can grep and replace:

```powershell
rg "\[Placeholder" src/
rg "\[.*?\]" src/ --only-matching
```

## Stack details

- **React 19** with Vite 8
- **Tailwind v4** via `@tailwindcss/vite` (no `tailwind.config.ts`; theme in `src/index.css`)
- **Radix UI** primitives under the hood for `dialog`, `dropdown-menu`, `popover`, `select`, `tabs`, `tooltip`, `switch`, `slider`, `scroll-area`, etc.
- **lucide-react** for icons
- **@xyflow/react** for the flow canvas
- **recharts** for KPI sparklines and area charts
- **react-day-picker** for the calendar widget
- **class-variance-authority** + **tailwind-merge** + **clsx** for the variant system
