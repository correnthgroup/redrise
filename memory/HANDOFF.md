# HANDOFF

> Updated 2026-06-08 after Sprint 0 + Sprint 1 completion.

## What's done

- [x] Project import from `D:\REDSCALE\__ARQUITETURA\app` (Vite 8 + React 19 + TS 6 + Tailwind v4)
- [x] Package manager: `yarn` via `corepack`
- [x] Configs (`package.json`, `vite.config.ts`, `tsconfig.*`, `eslint.config.js`, `index.html`, `components.json`, `.gitignore`)
- [x] Entry (`main.tsx`, `App.tsx`, `index.css`, `lib/utils.ts`)
- [x] Layout primitives (`app-frame`, `app-shell`, `sidebar`, `topbar`, `card-list`)
- [x] 20 UI primitives (shadcn-style, Radix + CVA)
- [x] Auth block (`sign-in | sign-up | confirm-code`)
- [x] 17 shared blocks
- [x] 14 page blocks
- [x] Route shims in `src/app/`
- [x] Public assets (favicon, icons SVG placeholders)
- [x] Docs (`AGENTS.md`, `README.md`, `memory/AGENTS.md`, `memory/CONTEXT.md`, `memory/DECISIONS.md`)
- [x] Quality: `vitest.config.ts`, `playwright.config.ts`, `.env.example`, `src/test/setup.ts`
- [x] Sidebar test + workspaces persistence test (13 tests passing)
- [x] Playwright smoke tests (3 tests: auth, dashboard, workspace creation)
- [x] Quality scripts: `typecheck`, `test`, `test:e2e`
- [x] Sugestão 2 palette applied globally
- [x] Sidebar smooth animation + tooltip-only-on-hover
- [x] Visual consistency across all 14 page blocks
- [x] Sprint 0 and Sprint 1 completed and validated
- [x] **Sprint 2**: Workspace types (`src/types/workspace.ts`)
- [x] **Sprint 2**: Supabase client (`src/lib/supabase.ts`)
- [x] **Sprint 2**: Supabase persistence (`src/lib/workspaces.ts`)
- [x] **Sprint 2**: `useWorkspaces` async hook (`src/hooks/use-workspaces.ts`)
- [x] **Sprint 2**: Dashboard empty state with CTA
- [x] **Sprint 2**: Full flow Dashboard -> Create Workspace -> Review Workspace working
- [x] **Sprint 2**: Supabase Auth with GitHub + email/password
- [x] **Sprint 2**: RLS policies for workspaces table
- [x] **Sprint 2**: Migration SQL (`supabase/migrations/001_create_workspaces.sql`)

## What's open

- [ ] Sprint 3: Wizard de criacao de workspace persistido (formularios multi-step com validacao)
- [ ] Sprint 4: Review Workspace conectado a dados reais
- [ ] Sprint 5: Flow List por workspace
- [ ] Sprint 6: Flow Editor persistido
- [ ] Sprint 7: Task Board persistido
- [ ] Sprint 8: Create/Review Task persistido
- [ ] Sprint 9: Agents base
- [ ] Sprint 10: IA com HITL
- [ ] Sprint 11: Analytics basico
- [ ] Sprint 12: Settings e membros
- [ ] Sprint 13: Integracoes e API keys
- [ ] Sprint 14: Multi-tenant e seguranca
- [ ] Sprint 15: Templates
- [ ] Decide routing: keep state-machine or wire a real router
- [ ] Decide whether "sign in with Google" button should be removed for MVP
- [ ] Add more E2E tests
- [ ] Add CI

## Blockers

- None known. Sprint 2 is ready to start.

## Architecture

- **Stack**: Vite 8 + React 19 + TypeScript 6 + Tailwind v4
- **UI**: shadcn-style (Radix + CVA + tailwind-merge)
- **Routing**: state-machine in `AppShell` via `SidebarKey`
- **State**: pure React + `localStorage`
- **Package manager**: `yarn` via `corepack`
- **Palette**: Sugestão 2 (`primary=#8c1f28`, `header=#0F172A`, `secondary=#2F4858`, `background=#EEF2F6`, `surface=#FFFFFF`)
