# HANDOFF

> Current/future handoff only. Historical implementation logs were removed from this file by request.

## Current State

- Settings diferencia Role/Cargo de membro da Function/Função dentro de uma equipe: Role usa lista oficial; Function em Team List é texto livre por associação de equipe.
- Campos obrigatórios agora devem usar `RequiredLabel`; não reintroduzir asterisco manual nem classes locais para obrigatoriedade.
- Wizards dedicados agora devem usar `WizardShell`; não recriar header/progress/card/footer localmente em novos wizards, mas manter campos e regras específicas no componente do fluxo.
- Slogan atual: EN `Add AI. Enhance Value.`; PT-BR `Add AI. Agregue Valor.`.
- Add Member usa Role/Cargo obrigatório com a lista oficial `Admin/Owner/Board/Staff/Member/Viewer`; Function/Função livre por associação fica somente em Team List.
- Add Member usa dropdown padrão para Team, alimentado por `loadTeams(user.id)`.
- Remote Supabase migrations 020, 021, and 022 are applied on `vsaropewydcjsvplpugx`; New Team now depends on remote `teams` and `team_assignments` existing.
- New Team wizard step labels are translated and successful creation returns to Team List after refreshing teams.
- Flow List rename and responsible member changes persist via `updateFlow()`.
- Flow Builder card editor no longer assigns members per card; flow-level responsible members stay on Flow List.
- New Task requires Workspace and optionally links to Flow; migration 023 adds `tasks.flow_id` and is applied remotely.
- Current PRD implementation is ready for user/team validation but must not be marked concluded until that validation confirms it.
- Sign Up now treats Middle Name as optional and keeps First Name, Last Name, e-mail, password and confirmation required.
- Members List now edits Role/Cargo, includes Admin before Owner, lists all formal teams through `team_assignments`, and avoids duplicated role display.
- Existing-account invites create pending in-app notifications through `team_invite_notifications`; accepting/declining uses SQL function `respond_to_team_invite()`.
- Invite dispatch is centralized in `invite-member`: exact e-mail checking, `team_members` persistence, optional `team_assignments`, existing-user notification, and new-user Supabase invite e-mail all happen server-side with service role.
- Invite e-mail dispatch now uses Resend directly from `invite-member`; sender is `hi.from@redrise.app`, with link generation still handled by Supabase Auth Admin.
- `APP_BASE_URL` for Edge Functions is `https://www.redrise.app`; `APP_ALLOWED_ORIGINS` includes `https://www.redrise.app`, `https://redrise.onrender.com`, and `http://localhost:5173`.
- Migrations 026, 027, and 028 enforce B2B settings access: `Admin` can manage Members List, Team List, and API Keys; `Owner` and `Board` can view Members List without Add Member/role edits and can manage Team List.
- Admin/Owner/Board users operate the organization owner context from `team_members.owner_user_id`; non-manager members cannot open Members List, Team List, or API Keys from Settings.
- `team_invite_notifications` is enabled for Supabase Realtime by migration 025; `TeamInviteDialog` subscribes to recipient-specific changes and still polls every 30 seconds as fallback.
- Remote migration 024 is applied on `vsaropewydcjsvplpugx`, and `invite-member` was redeployed after adding notification creation and returning `teamMemberId`.
- Remote migration 025 is applied on `vsaropewydcjsvplpugx`; `invite-member` was redeployed after centralizing invite dispatch.
- Remote migrations 026 and 027 are applied on `vsaropewydcjsvplpugx`; `invite-member` was redeployed after switching unregistered-user e-mail delivery to Resend.
- Task Board filters by Workspace, Flow and Agent with All/Tudo options.
- Team List foi ajustado para equipes formais: migration 022 cria `teams` e `team_assignments`; criação abre uma tela dedicada com wizard de 3 etapas, aceita equipe vazia, limita a 7 equipes e permite mesmo membro em várias equipes.
- PRD parte 1 continuação aplicada localmente: Settings tem Members List para visualizar/convidar, Team List para criar equipe e atribuir membros/funções, e Personal Information mostra função/equipe atuais como leitura.
- PRD parte 1 local foi aplicada no workspace: Dashboard operacional saiu de placeholders estáticos para dados derivados de Supabase já carregados pelo shell; Flow Pipeline lê cards reais de `flow_cards`; Plans fica desabilitado fora de dev.
- App is a Vite/React/TypeScript/Tailwind SPA backed by Supabase.
- Official production URL is `https://www.redrise.app`.
- Current production deployment target is Render.
- Render service is `redrise` (`srv-d8rjudj6sc1c73bc9fu0`) with rewrite route `/*` to `/index.html`.
- GitHub repository is `https://github.com/correnthgroup/redrise.git`.
- GitHub, Render, and Supabase should use the base operational account `integration@correnth.com`.
- Auth flow is simplified: e-mail/password Sign In, account creation through Sign Up, no OAuth buttons, no e-mail confirmation UI.
- Sign Up returns to Sign In and must not flash Dashboard.
- Active Sessions use Supabase `active_sessions` with current-session detection through `supabase_session_id`.
- Team Members use Supabase `team_members`; Flow/Tasks member dropdowns must read that source.
- Settings > Plans is not billing yet; it is a future-plan surface.
- `redrise-ops` MCP exists for validation, build/status checks, Supabase function deploy, graph status, and memory notes.
- Detailed local Graphify output is in `graphify-out/`; the latest clean structural update produced 1029 nodes, 1223 edges, and 137 communities.
- Workspace root is now `D:\studio\redrise`; old briefing/framework/backlog folders are not active guidance.
- Update 2.0 test bundle now covers Create Task, Flow Builder, Agent Detail, Create Workspace, Create Flow, Personal Information field locks/search, and auxiliary `team-members-card` copy.
- Previous deployment targets are legacy and are no longer active targets for this project reset.

## Current Validation Baseline

- `corepack yarn lint` passes.
- `corepack yarn typecheck` passes.
- `corepack yarn test` passes.
- `corepack yarn build` passes.
- `corepack yarn test:e2e` passed with 27/27 tests after the shared WizardShell refactor and slogan update; it has not been rerun for the current PRD by instruction.
- E2E is modularized by Playwright project: `auth-public`, `auth-session`, `navigation`, `dashboard`, `flow`, `tasks`, `agents`, `analytics`, `workspaces`, and `settings`.
- E2E local modular matrix passes with 39 tests across the 10 modules.

## Open Work

- **PRD3 (Update 3.0)**: Resolve Settings menu definitively. Covers 4 phases: Critical Fixes (Change Password functional, Plans real state, Integration real test), High-Priority Gaps (member removal, revoke all sessions, API key delete, integration management, audit log coverage), Quality/Polish (avatar to Storage, username uniqueness, unsaved-changes warning, audit pagination, polling reduction, dead component cleanup), i18n Completion (hardcoded strings, gender locale-neutral storage). See `updates/prd3.md`.
- Execute the future auth visual update in `updates/update1.4_colors.md` if approved.
- Finish Update 2.0 deep-copy pass for remaining auxiliary blocks, wizards, menus, and placeholders not covered by the current PRD2 test-bundle pass.
- Add Stripe checkout Edge Function and webhook.
- Persist real plan state and enforce permissions in backend/RLS.
- Validate the current PRD manually with the team; only then treat it as concluded and decide whether to run the final E2E pass.
- Configure the custom domain `www.redrise.app` on Render and add `https://www.redrise.app` to Supabase Auth redirect/site URL settings if not already done in the dashboards; no Render API key/CLI is available in this environment.
- Supabase Auth config was pushed from `supabase/config.toml`; Site URL is `https://www.redrise.app` and additional redirects include the new domain, Render fallback, and local dev URLs.
- Field labels use shared `Label` line-height `leading-5`; optional field labels should not use native `<label>` when placed beside `RequiredLabel`.
- Keep GitHub push access working for `integration@correnth.com` on `correnthgroup/redrise`.
- Keep Render deployment connected to the `Redrise` project/workspace.
- Keep Supabase project `vsaropewydcjsvplpugx` migrations, Auth redirects, and secrets aligned with production.
- Keep Supabase Auth redirects and edge-function origins aligned with the final Render URL.
- Re-enable OAuth after official provider credentials are configured and tested.
- Re-enable e-mail confirmation after official SMTP/sender/template policy is configured.
- After relevant code, architecture, or behavior changes, refresh the structural graph with `C:\Python314\python.exe -m graphify update .` and update memory if counts or architecture changed; semantic doc extraction needs Gemini env keys.

## Operational Rules

- Use Yarn/Corepack only.
- Do not add npm lockfiles.
- Do not deploy to or document previous deployment aliases as the official URL.
- Use Render auto-deploy as primary deploy path.
- Do not reintroduce `localStorage` persistence for domain data.
- Do not reintroduce OAuth or e-mail confirmation UI without official credentials/configuration.
- Keep E2E coverage modular by menu/domain instead of grouping all authenticated flows into one long runner process.
