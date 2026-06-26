# Current Product Source Of Truth

## Active PRD

- Source: `PRD + Roadmap - Redrise Corporate simplificado e orientado ao graph.html` shared on 2026-06-24.
- Scope: post-MVP Business/Corporate roadmap, operational notifications, Flow approval, deterministic execution, external LLM builder, Redrise Support label, Corporate analytics, and Rise Insider.
- Status: active planning and implementation reference.

## Implementation Rule

- This PRD supersedes older roadmap details when they conflict with its simplification rules.
- Before creating a new issue or feature, check the app, memory, and `graphify-out/` to avoid duplicating existing behavior.
- Do not add full versioning, rollback, Redrise Support staging, internal support tickets, hidden execution fallback, or granular permission systems unless a later approved PRD explicitly moves them back into scope.

## Immediate Slice

- First implementation slice: global authenticated breadcrumb using the existing `AppShell` state machine and `Topbar`.
- Second implementation slice: Notifications foundation with Supabase-backed `notifications`, Sidebar lightbulb badge, global Notifications page, and Workspace pending cards.
- Third implementation slice: Flow approval and official status with simple field-based governance, Flow List actions, audit logs, notifications, and structural invalidation from Flow Builder saves.
- Fourth implementation slice: deterministic Task execution path with explicit `execution_path`, no fallback, failure reasons, and notifications for blocked execution.
- Fifth implementation slice: External LLM Builder capability with paste/import of an external outline into Flow Builder cards, persisted `source_type = external_llm`, approval-request status, audit log, and notification on save.
- Sixth implementation slice: Redrise Support source handling with a simple Flow List action that marks `source_type = redrise_support`, keeps the Flow pending approval, and does not introduce support staging, internal tickets, rollback, or versioning.
- Seventh implementation slice: Corporate Analytics uses existing app data to show Flow governance, blocked deterministic executions, pending notifications, active agents, Flow source mix, and task status mix without adding billing analytics or new schema.
- Eighth implementation slice: Rise Insider / deterministic adapters execute through `task-execute`: `api_gateway` uses OpenRouter, `mock_integration` and `manual_step` are deterministic built-in adapters, and external paths call active HTTPS integration endpoints without fallback.
- Ninth implementation slice: adapter runtime hardening/observability adds `adapter_runs`, deployed `rise-insider-terminal` and `adapter-staging` Edge Functions, active staging integrations for the smoke account, and successful smoke coverage for mock/manual/staging/terminal paths.
- Tenth implementation slice: adapter pairing/retry/filesystem adds real POST-based pairing tests in Settings > Integrations, masks loaded integration config in the frontend, adds Adapter Run details and manual retry in Analytics, and deploys `rise-insider-filesystem` backed by the persistent `rise_insider_files` sandbox table with allowlisted operations.
- Eleventh implementation slice: Settings > Integration Setup now opens on a configured setups overview before the wizard; Admin/Owner/Board can see team setup summaries, and Admin can inspect safe parameters for a selected team user's setup without exposing secrets.
- Twelfth implementation slice: backend/RLS permission enforcement and Settings PRD3 polish added role-scoped operational RLS, real Change Password with Sign Up password rules, revoke-all-other sessions, API key delete, integration status/delete/secret rotation, and initial Rise Insider token hardening.
- Thirteenth implementation slice: real Billing foundation adds persisted `billing_subscriptions`, Stripe checkout/webhook Edge Functions, Plans UI backed by Supabase billing state, public Auth i18n coverage, clickable cursor defaults, and subtle spotlight/glow microinteractions on Plans/Analytics cards.
- Validation for this slice: `corepack yarn lint` and `corepack yarn build` only; E2E, commit, and push are deferred until product validation.

## Next Ordered Slices

- Next: configure Stripe secrets and price IDs in Supabase, create the Stripe webhook endpoint for `billing-webhook`, and run a live checkout/webhook smoke.
- Then: validate role-scoped RLS with real Admin/Owner/Board/Member/Viewer accounts and decide whether frontend organization-wide views should broaden beyond Integration Setup.
- Then: next Rise Insider layer: require runtime secrets in production environments, expand operational audit views, and validate adapter secret rotation end-to-end.
