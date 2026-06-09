# DECISIONS

## 2026-06-07 — Initial scaffold

- **Auto-filled interview**: the Planroot interview was auto-filled by observing `D:\Worthness\Agentra` as confirmed fact, rather than running the interactive interview. Rationale: the user already has a working reference and wanted the output scaffold directly.
- **Stack**: Vite 8 + React 19 + TS + Tailwind v4 (same as reference).
- **UI primitives**: shadcn-style with Radix under the hood (same as reference).
- **No router**: state-machine routing in `AppShell` via `Sidebar`. Route shims in `src/app/` are present but not wired.
- **Colors**: switched from violet/orange (Agentra brand) to neutral slate (standard). Per user request: "esquema de fonts/cores etc. padrão".
- **Fonts**: kept Inter / system stack.
- **External links**: removed (pravatar CDN, GitHub remote, etc.). All assets are local.
- **Auth**: 3 modes (sign-in | sign-up | confirm-code) consolidated in one component; not the 4 separate flows the user listed (sign in / up / password / confirmation). Confirmation is folded into `confirm-code`; password change is a separate `ChangePassword` block in Settings.
- **Sidebar collapse**: state persisted under `app:sidebar:collapsed`; idempotent.
- **All copy**: wrapped in `[Placeholder: …]` so it can be grepped and replaced.
- **Z-order doc**: in `AGENTS.md` § Z-order (back-to-front).
- **Modular blocks**: every visible piece is a block — `auth-flow`, `sidebar`, `topbar`, `app-frame`, `app-shell`, 20 UI primitives, 14 page blocks, 17 shared blocks.

## 2026-06-08 — Redrise prototype import

- **Prototype source**: `redrise-app` was fully replaced from `D:\REDSCALE\__ARQUITETURA\app` without editing the origin folder. Rationale: the user wants implementation to start from the real current prototype UI.
- **Package manager**: switched from `pnpm` to `yarn` via `corepack`. Rationale: explicit user request.
- **Validation fixes**: only minimal fixes were applied to the imported prototype so `yarn lint` and `yarn build` pass.
- **Saved color checkpoint**: Sugestao 2 was applied and validated before the next visual comparison. Source: user-provided palette block on 2026-06-08.
- **Sugestao 2 tokens**: `primary=#8c1f28`, `header=#0F172A`, `secondary=#2F4858`, `background=#EEF2F6`, `surface=#FFFFFF`, `text-primary=#101828`, `text-secondary=#475467`.

## 2026-06-08 — Supabase migration

- **Backend**: migrated from localStorage to Supabase (project: `ndfsselzilmdzywcdyoo`).
- **Auth**: Supabase Auth with GitHub OAuth (primary) + email/password (secondary).
- **Database**: `workspaces` table with RLS policies (user_id based).
- **RLS**: enabled with 4 policies (select, insert, update, delete) scoped to authenticated user.
- **Service role key**: stored in `.env` for future admin operations (currently unused).
- **Decision**: migrate to Supabase after Sprint 2 to build all subsequent features on real persistence.
