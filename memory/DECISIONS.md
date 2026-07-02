# DECISIONS

## Current Architecture Decisions

- Frontend stack is Next.js 16 (App Router), React 19, TypeScript ~5.7, and Tailwind CSS v4 (oklch tokens).
- Package manager is npm.
- Python tooling uses repository-local Python 3.12; project Python dependencies live in `pyproject.toml`.
- Routing uses Next.js App Router with route groups `(auth)` and `(dashboard)`.
- Authenticated breadcrumbs are derived from URL pathname via `app-layout.tsx` using `usePathname()`.
- Authenticated breadcrumbs render in `SidebarInset` header with `SidebarTrigger` and `Separator`.
- UI primitives follow shadcn base-nova style under `src/components/ui/` (44 components).
- Sidebar collapse state persists in `localStorage` because it is a UI preference.
- Domain data must be Supabase-backed, not browser-storage-backed.
- All action buttons use Sonner toasts (`position="top-center"`) and Spinner for loading states.
- `logAuditEvent()` is called on all CRUD actions (create/update/delete) for workspaces and projects.
- `createNotification()` is available in `lib/notifications.ts` for relevant flows.
- Supabase client uses lazy Proxy to avoid build-time errors when env vars are missing.
- Auth pages (login/signup) use shadcn login-03 pattern adapted to Redrise with Supabase Auth.
- Apple/Google sign-in buttons show "Coming Soon" dialog instead of actual OAuth.
- Operational notifications use `notifications.owner_user_id` as the current organization context until a dedicated organizations table is introduced.
- Notification `read_status` (`unread`/`read`) is independent from `action_status` (`pending`/`resolved`/`archived`).
- Flow official status is simple and field-based: `published_at` plus `approval_status = approved` plus `is_official = true` represents an official approved Flow.
- Structural Flow Builder saves invalidate official status; title/member edits in Flow List do not invalidate official status.
- Vite build warnings were resolved by replacing an ineffective dynamic import with a static import and adding manual vendor chunks in `vite.config.ts`.
- Flow List status indicators use plain translated text with leading icons instead of badge backgrounds.
- Task execution is deterministic by `tasks.execution_path`; currently only `api_gateway` executes, and unavailable paths fail explicitly with `failure_reason` and a notification.
- External LLM Builder is paste/import based for now: users paste an outline from an external LLM into Flow Builder, Redrise creates sequential cards, and the Flow is marked `source_type = external_llm` only when saved.
- Redrise Support source handling is label-based only: Flow List can mark a Flow as `source_type = redrise_support` and pending approval, without support staging, ticketing, rollback, or versioning.
- Corporate Analytics uses existing Supabase-backed app data and the existing `useAnalytics()` execution query; no billing analytics, forecast, new schema, or invented metrics were added.
- Deterministic adapters execute through the deployed `task-execute` Edge Function: `api_gateway` calls OpenRouter, `mock_integration` and `manual_step` return built-in structured outputs, and external runtime paths call active HTTPS integration endpoints with no fallback.
- Adapter observability is stored in `adapter_runs`; only endpoint origin/path labels are stored, not tokens or query secrets.
- Rise Insider Terminal execution is intentionally command-set based (`status`, `echo`, `date`, `inspect`) rather than arbitrary shell execution.
- Rise Insider Filesystem execution uses allowlisted operations (`status`, `list`, `read`, `write`, `append`, `delete`) against the Supabase-backed `rise_insider_files` sandbox; it does not expose arbitrary filesystem access.
- Manual adapter retry in Analytics reuses the same `execution_path` and records a new adapter run; it does not replay stored payloads or attempt fallback.
- Settings > Integration Setup starts with a configured-setups overview before the wizard; Admin/Owner/Board can view team setup summaries, while only Admin can inspect safe parameters for another user's setup.
- Integration setup visibility uses `SECURITY DEFINER` RPCs with sanitized fields instead of broad table SELECT policies, so Owner/Board do not receive raw integration config.
- Backend/RLS permission enforcement uses `can_view_user_scoped_data()` for Admin/Owner/Board read access in the same owner context and `can_manage_user_scoped_data()` for Admin write access; self-access remains allowed.
- Change Password uses Supabase Auth and the same password rules as Sign Up: at least 8 characters, one letter, and one number.
- Rise Insider runtime adapters can require bearer-token authentication through `RISE_INSIDER_REQUIRE_TOKEN=true` and runtime token secrets.
- Billing state is persisted in Supabase `billing_subscriptions`; Plans UI must read this state and must not unlock paid features from frontend-only state.
- Stripe checkout starts only through the `billing-checkout` Edge Function; Stripe plan changes are persisted by `billing-webhook`, not by frontend redirects.
- The ReactBits-inspired visual pattern selected for Redrise is a restrained spotlight/glow follow on high-signal cards, not broad decorative animation.
- Agent provider connections are stored as `integrations.category = agent_provider`; Admin-created Agents use the organization `owner_user_id`, are usable by active non-Viewer roles, and are configurable only by function `Admin`.
- UI primitives follow the local Radix/shadcn-style component pattern under `src/components/ui/`.
- Sidebar collapse state may persist in `localStorage` because it is a UI preference.
- Domain data must be Supabase-backed, not browser-storage-backed.
- **All dropdown triggers share a single class constant** `DROPDOWN_TRIGGER_CLASSES` defined in `src/lib/styles.ts`. Both `SelectTrigger` (Radix Select) and `MultiSelectDropdown` (Button + DropdownMenu) use this constant. Button triggers must use `variant="outline"` so CVA hover classes align with the constant.
- Agent execution responsibility is task-only: Agents execute Tasks and return structured output; they do not create, draft, propose, or alter Workspaces, Flows, Flow cards, Tasks, process definitions, approval rules, branches, retries, loops, or orchestration logic. Source: `docs/product/agent-task-execution-responsibility-prd.md`.
- `invite-member` CORS is origin-validated using `APP_ALLOWED_ORIGINS` env var plus localhost defaults; `*` is no longer used as the Allow-Origin header.
- `invite-member` validates Admin status before any profile lookup to prevent email enumeration.
- `rise-insider-terminal` and `rise-insider-filesystem` are fail-closed in production: when `DENO_DEPLOYMENT_ID` is set and no token env is configured, the function rejects requests instead of allowing unauthenticated access.
- API key secrets use `crypto.getRandomValues` for generation and SHA-256 hashing for storage; raw secrets are shown once at creation and never again.
- `validate-api-key` validates incoming keys against SHA-256 hashes, not plaintext.
- Schedule validation on Create Task requires Start Date and Time when `hasSchedule` is enabled; End Date is optional and defaults to Start Date for one-time schedules.

## Current Backend Decisions

- Supabase must be recreated or relinked under the `integration@correnth.com` operational account; the previous project is no longer the active target.
- `profiles` stores personal information, avatar, language, presence, and profile fields used by Dashboard/Sidebar/Settings.
- `active_sessions` stores authenticated session metadata, `supabase_session_id`, `remembered`, last activity, and revoke state.
- `team_members` stores Settings > Team Members and feeds member pickers in Flow and Tasks.
- `invite-member` is the allowlisted Supabase Edge Function for team invitations and exact-email existing-account lookup.
- Migrations are kept because they define and audit the current remote schema.
- `rise_insider_files` stores persistent sandbox text files for the `rise-insider-filesystem` Edge Function by owner key and relative path.
- Integration setup overview/detail RPCs are defined by migration 041 and enforce role-aware visibility from `team_members.function`.
- Migrations 042 and 043 enforce role-scoped operational RLS and Settings PRD3 management helpers.
- Migration 044 creates persisted billing subscription state and role-scoped billing RLS.
- Migration 045 adds Agent provider connection fields, organization-scoped Agent RLS, and Admin-only `agent_provider` integration insert/view policies.

## Current Auth Decisions

- Sign In uses Supabase e-mail/password.
- Sign Up collects required First Name, Last Name, e-mail, password, and confirmation password; Middle Name is optional.
- Supabase e-mail confirmation is disabled for the current flow.
- Sign Up must not leave the user in Dashboard automatically; the app suppresses Supabase's automatic sign-up session and returns to Sign In.
- OAuth buttons and `/auth/callback` UI are archived until official provider credentials exist.
- E-mail confirmation and resend UI are archived until official sender, SMTP, template, and resend policy exist.

## Current Product Decisions

- The official production host is Render at `https://www.redrise.app`.
- Settings > Plans remains a placeholder-like planning surface only; it must not unlock paid features from frontend state.
- Real billing requires Stripe checkout, webhook, persisted plan state, and permission matrix.
- Admin/Member/Viewer labels remain informational until backend/RLS enforcement is approved.
- Existing-account team matching must happen server-side by exact e-mail only.
- Existing-account team invitations require explicit in-app acceptance before the membership becomes active.
- Unregistered-user invites are sent by Resend from `hi.from@redrise.app`; Supabase Auth remains responsible for generating the secure invite link.
- B2B settings administration is represented by `team_members.function`; `Admin` manages Members List, Team List, and API Keys, while `Owner` and `Board` can view Members List and manage Team List only.
- Authenticated UI language must use `profiles.language` from Supabase as source of truth; `localStorage` is not the language source for signed-in app copy.

## Future Decisions Already Approved

- Re-enable OAuth only after GitHub, Google, and Microsoft/Azure credentials are configured in Supabase and provider dashboards.
- Re-enable e-mail confirmation only after official transactional e-mail setup exists.
- Prefer Render auto-deploy from `https://github.com/correnthgroup/redrise.git` using `render.yaml`.
- Keep `memory/TECHNICAL.md` as PT-BR operational documentation for humans and deterministic agents.
- The Corporate simplification PRD is the active source for the post-MVP roadmap; older roadmap details are historical when they conflict with `docs/product/current-source-of-truth.md`.
