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

## 2026-06-11 — Atualizacao#1 patch

- **Global typography**: moved `Segoe UI` to the first global font-family position per `D:\REDSCALE\_REDRISE\Atualizacao#1.pdf`.
- **Profile persistence**: added local profile persistence under `redrise:user-profile:{userId}` as an immediate UI fix until a Supabase `profiles` table is designed.
- **Remember Me sessions**: added local remembered-session records under `redrise:remembered-sessions` only when Sign In uses Remember Me; this avoids showing fake Active Sessions.
- **Settings detail back action**: Settings submenus keep one Back control in the detail header; no separate Cancel button is shown in the submenu header.
- **Flow delete confirmation**: Flow deletion now follows the Delete Workspace pattern requiring `DELETE` confirmation.

## 2026-06-11 — Real backend for Atualizacao#1

- **Profiles backend**: added Supabase `profiles` table for Personal Information, sidebar identity, dashboard first name, avatar, language, and presence timestamp.
- **Active Sessions backend**: added Supabase `active_sessions` table; Sign In with Remember Me now inserts real remembered sessions and Settings can revoke them.
- **Team Members backend**: added Supabase `team_members` table for global Settings > Team Members, including invite email, role, function, team, joined date, and presence-based online status.
- **Migration history**: remote Supabase project `ndfsselzilmdzywcdyoo` already had schema 001-013 but no migration history; repaired remote migration history for 001-015 after applying 014-015.
- **Production URL**: keep `https://redrise-app.vercel.app` as the official public URL until a custom domain is acquired and integrated.

## 2026-06-12 — Auth and invite hardening

- **Auth triggers**: hardened both auth user triggers with explicit `public.` schema references and `SET search_path = public` to avoid Auth API runtime search-path failures.
- **Invite persistence**: Team Member invites persist the `team_members` row before attempting Supabase Auth email delivery. Rationale: Supabase email rate limits should not lose the visible invite record.
- **Email delivery validation**: E2E can confirm the signup/invite UI paths, but repeated remote email attempts may return Supabase rate-limit errors until SMTP/rate limits are adjusted.

## 2026-06-12 — Memory and planned billing/team behavior

- **Technical memory language**: `memory/TECHNICAL.md` is PT-BR because it is intended for non-technical humans and deterministic agents.
- **Plans implementation status**: Settings > Plans is planned but not implemented until plan limits, Stripe backend, webhook behavior, and permission matrix are approved.
- **Team lookup privacy**: Existing-account lookup by e-mail must use a privacy-safe backend flow rather than exposing unrestricted client-side user search.

## 2026-06-12 — Atualização#2 implementation

- **Plans placeholder**: Implemented Settings > Plans with placeholder plan content and non-billing CTA messages so no paid feature is unlocked before Stripe webhook persistence exists.
- **Access notice**: Personal Information shows Admin/Member/Viewer as an informational layer only; backend/RLS permission enforcement remains future work.
- **Existing-account invite**: `invite-member` performs exact e-mail lookup server-side and adds existing profiles as active members, avoiding open user directory search.
- **App MCP**: Added `redrise-ops` as an app-owned MCP server that wraps existing CLIs with allowlisted operational tools instead of replacing Vercel CLI or Supabase CLI.
