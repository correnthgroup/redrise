# HANDOFF

> Updated 2026-06-12 after Supabase auth trigger and invite fixes.

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
- [x] **Atualizacao#1**: Profile UI persistence via local profile store pending Supabase `profiles` table
- [x] **Atualizacao#1**: Remember Me registers local active-session entries only when selected
- [x] **Atualizacao#1**: Personal Information field order and visible field list updated
- [x] **Atualizacao#1**: Change Password mojibake and Security Best Practices styling fixed
- [x] **Atualizacao#1**: Flow delete uses `DELETE` confirmation dialog
- [x] **Atualizacao#1 backend**: Supabase `profiles`, `active_sessions`, and `team_members` added and applied remotely
- [x] **Atualizacao#1 backend**: remote migration history repaired for 001-015
- [x] **Atualizacao#1 backend**: auth user triggers hardened with migrations 017-018
- [x] **Team invites**: `invite-member` Edge Function deployed and persists invited rows before attempting email delivery
- [x] **Team member dropdowns**: Flow/Tasks member dropdowns use Settings > Team Members data
- [x] **Memory**: `memory/TECHNICAL.md` documents app behavior and future Plans/team access planning in PT-BR
- [x] **Memory rules**: `memory/AGENTS.md` instructs agents to consult memory/graph and update memory/graph after relevant changes
- [x] **Atualização#2**: `Settings > Plans` placeholder UI, Personal Information access notice, and exact-email existing-account team invite handling implemented
- [x] **MCP**: `redrise-ops` app-owned MCP server added for safe validation, prebuilt deploy, Supabase function deploy, status checks, graph status, and memory notes
- [x] **Docs organization**: former `GUIDE_MESTRE.md` merged into `memory/TECHNICAL.md`; root utility script moved to `scripts/maintenance/`
- [x] **Graphify**: code graph updated after docs/root organization; semantic doc re-extraction remains pending.
- [x] **Agent rules**: root `AGENTS.md` refreshed to current project architecture and operations.
- [x] **Production URL**: keep `https://redrise-app.vercel.app` as the official public URL until custom domain integration

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
- [ ] Wire `redrise-ops` into the preferred MCP client configuration if desired.
- [ ] Run semantic `/graphify --update` when an LLM-backed graphify update path is available, so documentation-only changes are fully reflected in the graph.
- [ ] Deploy the new frontend bundle to Vercel production after resolving Vercel CLI deployments stuck as `UNKNOWN`.
- [ ] Integrate a real custom domain after acquisition.
- [ ] Finish full-app i18n coverage; many strings outside current Settings/Nav/Dashboard scope remain literal English.
- [ ] Replace Settings > Plans placeholder content after plan matrix, Stripe backend, webhook, and permission matrix are approved.
- [ ] Add real Stripe checkout Edge Function and webhook.
- [ ] Decide whether existing-account team member additions require explicit acceptance before status becomes active.

## Blockers

- Vercel CLI production deployments for `redrise-app` previously created `UNKNOWN` deployments with build `0ms`; local build and E2E pass, and Supabase remote is migrated.
- Atualização#2 frontend production deployed on 2026-06-12 via Vercel prebuilt Build Output API; official alias `https://redrise-app.vercel.app` points to `dpl_BkpB7XcJUbtqC4edKWEdzBEW5oQZ`, status `Ready`.
- Vercel project settings still show `Install Command npm install` and `Build Command npm run build`; normal non-prebuilt deploys may still fail until these settings are changed to Yarn/Corepack in the dashboard or via authorized API access.
- Supabase Auth real email delivery can hit provider rate limits during repeated E2E/signup/invite attempts; app persists invites and reports email delivery status from the function.
- No `graphify-out/graph.json` exists yet for this project; graph update is pending until graphify is initialized.
- Temporary `https://redrise.vercel.app` alias was removed. Keep `https://redrise-app.vercel.app` for now.

## Architecture

- **Stack**: Vite 8 + React 19 + TypeScript 6 + Tailwind v4
- **UI**: shadcn-style (Radix + CVA + tailwind-merge)
- **Routing**: state-machine in `AppShell` via `SidebarKey`
- **State**: React hooks + Supabase-backed domain libraries; localStorage remains for UI preferences.
- **Package manager**: `yarn` via `corepack`
- **Palette**: Sugestão 2 (`primary=#8c1f28`, `header=#0F172A`, `secondary=#2F4858`, `background=#EEF2F6`, `surface=#FFFFFF`)
