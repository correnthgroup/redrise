# DECISIONS

## Current Architecture Decisions

- Frontend stack is Vite 8, React 19, TypeScript 6, and Tailwind CSS v4.
- Package manager is Yarn through Corepack.
- Routing is currently an app-shell state machine through `SidebarKey`; route shims may support a future router but are not the active navigation source.
- UI primitives follow the local Radix/shadcn-style component pattern under `src/components/ui/`.
- Sidebar collapse state may persist in `localStorage` because it is a UI preference.
- Domain data must be Supabase-backed, not browser-storage-backed.
- **All dropdown triggers share a single class constant** `DROPDOWN_TRIGGER_CLASSES` defined in `src/lib/styles.ts`. Both `SelectTrigger` (Radix Select) and `MultiSelectDropdown` (Button + DropdownMenu) use this constant. Button triggers must use `variant="outline"` so CVA hover classes align with the constant.

## Current Backend Decisions

- Supabase must be recreated or relinked under the `integration@correnth.com` operational account; the previous project is no longer the active target.
- `profiles` stores personal information, avatar, language, presence, and profile fields used by Dashboard/Sidebar/Settings.
- `active_sessions` stores authenticated session metadata, `supabase_session_id`, `remembered`, last activity, and revoke state.
- `team_members` stores Settings > Team Members and feeds member pickers in Flow and Tasks.
- `invite-member` is the allowlisted Supabase Edge Function for team invitations and exact-email existing-account lookup.
- Migrations are kept because they define and audit the current remote schema.

## Current Auth Decisions

- Sign In uses Supabase e-mail/password.
- Sign Up collects First Name, optional Middle Name, optional Last Name, e-mail, password, and confirmation password.
- Supabase e-mail confirmation is disabled for the current flow.
- Sign Up must not leave the user in Dashboard automatically; the app suppresses Supabase's automatic sign-up session and returns to Sign In.
- OAuth buttons and `/auth/callback` UI are archived until official provider credentials exist.
- E-mail confirmation and resend UI are archived until official sender, SMTP, template, and resend policy exist.

## Current Product Decisions

- The official production host is Render for now; expected service URL is `https://redrise.onrender.com` if Render confirms the subdomain.
- Settings > Plans remains a placeholder-like planning surface only; it must not unlock paid features from frontend state.
- Real billing requires Stripe checkout, webhook, persisted plan state, and permission matrix.
- Admin/Member/Viewer labels remain informational until backend/RLS enforcement is approved.
- Existing-account team matching must happen server-side by exact e-mail only.
- Authenticated UI language must use `profiles.language` from Supabase as source of truth; `localStorage` is not the language source for signed-in app copy.

## Future Decisions Already Approved

- Re-enable OAuth only after GitHub, Google, and Microsoft/Azure credentials are configured in Supabase and provider dashboards.
- Re-enable e-mail confirmation only after official transactional e-mail setup exists.
- Prefer Render auto-deploy from `https://github.com/correnthgroup/redrise.git` using `render.yaml`.
- Keep `memory/TECHNICAL.md` as PT-BR operational documentation for humans and deterministic agents.
