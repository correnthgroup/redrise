# HANDOFF

> Current/future handoff only. Historical implementation logs were removed from this file by request.

## Current State

- App is a Vite/React/TypeScript/Tailwind SPA backed by Supabase.
- Official production URL is `https://redrise-app.vercel.app`.
- Current production deployment is `dpl_E9vNusUPSEmHbB7ipu1teUJsY2iD`, status `Ready`.
- Auth flow is simplified: e-mail/password Sign In, account creation through Sign Up, no OAuth buttons, no e-mail confirmation UI.
- Sign Up returns to Sign In and must not flash Dashboard.
- Active Sessions use Supabase `active_sessions` with current-session detection through `supabase_session_id`.
- Team Members use Supabase `team_members`; Flow/Tasks member dropdowns must read that source.
- Settings > Plans is not billing yet; it is a future-plan surface.
- `redrise-ops` MCP exists for validation, prebuilt deploys, status checks, Supabase function deploy, graph status, and memory notes.
- Graphify code graph exists and should be updated after relevant code/architecture/product behavior changes; latest code update produced 1193 nodes, 1270 edges, and 201 communities.
- Workspace root `D:\REDSCALE\_REDRISE` should remain focused on `redrise-app/`; old briefing/framework/backlog folders are not active guidance.
- Update 2.0 test bundle now covers Create Task, Flow Builder, Agent Detail, Create Workspace, Create Flow, Personal Information field locks/search, and auxiliary `team-members-card` copy.
- Update 2.0 preview deployment: `dpl_3LmZgiWhD2xWCXk2uCVW8QvvMDB3`, `https://redrise-ea332zxti-worth-team-s-projects.vercel.app`, status `Ready`; preview fetch can return Vercel 401 because preview protection is enabled.

## Current Validation Baseline

- `corepack yarn lint` passes.
- `corepack yarn typecheck` passes.
- `corepack yarn test` passes.
- `corepack yarn build` passes.
- `corepack yarn test:e2e tests/settings.spec.ts` passes after the PRD2 Personal Information/read-only/i18n adjustments.

## Open Work

- Execute the future auth visual update in `updates/update1.4_colors.md` if approved.
- Finish Update 2.0 deep-copy pass for remaining auxiliary blocks, wizards, menus, and placeholders not covered by the current PRD2 test-bundle pass.
- Replace Settings > Plans with real plan matrix after business approval.
- Add Stripe checkout Edge Function and webhook.
- Persist real plan state and enforce permissions in backend/RLS.
- Decide whether existing-account team member additions require explicit acceptance before becoming active.
- Add CI.
- Normalize Vercel settings/team attribution so normal deploys can replace the non-git prebuilt workaround.
- Integrate custom domain after acquisition.
- Re-enable OAuth after official provider credentials are configured and tested.
- Re-enable e-mail confirmation after official SMTP/sender/template policy is configured.
- Rebuild/update `graphify-out` after the latest PRD2 code changes; the local session confirmed `graphify-out/graph.json` exists, but `graphify` CLI was unavailable in PATH during this update.

## Operational Rules

- Use Yarn/Corepack only.
- Do not add npm lockfiles.
- Do not deploy to or document `https://redrise.vercel.app` as the official URL.
- Use prebuilt Vercel deployment from a temporary directory without `.git` until deployment settings are normalized.
- Do not reintroduce `localStorage` persistence for domain data.
- Do not reintroduce OAuth or e-mail confirmation UI without official credentials/configuration.
