# HANDOFF

> Current/future handoff only. Historical implementation logs were removed from this file by request.

## Current State

- **MIGRAÇÃO CONCLUÍDA**: Frontend migrado de Vite 8 para Next.js 16 (App Router).
- **Package manager**: npm (substituiu Yarn/Corepack).
- **Stack atual**: Next.js 16 + React 19 + TypeScript ~5.7 + Tailwind CSS v4 (oklch) + shadcn base-nova.
- **31 rotas** compilando: auth (login/signup), workstation (workspace/workflow/workaction), projects, agents, documentation, settings.
- **44 componentes UI** shadcn copiados de riseslovecheck (agora deletado). `item.tsx` atualizado via `shadcn add item` (ItemMedia, ItemActions, ItemHeader, ItemFooter, ItemSeparator).
- **Sonner + Spinner** implementados em todas as ações CRUD (create/update/delete).
- **Boas práticas** implementadas: SidebarProvider, SidebarInset, SidebarMenuSkeleton, logAuditEvent() em CRUD, createNotification() disponível.
- **Auth pages** (login/signup) usam shadcn login-03 adaptado com Supabase Auth + popup "Coming Soon" para Apple/Google.
- **Supabase client** agora usa Proxy lazy para evitar erros no build time.
- Render.yaml atualizado para Next.js (env vars NEXT_PUBLIC_*).
- rGraphify atualizado: 2060 nós, 2984 arestas, 222 comunidades.

- Settings diferencia Role/Cargo de membro da Function/Função dentro de uma equipe: Role usa lista oficial; Function em Team List é texto livre por associação de equipe.
- Slice atual do PRD Corporate simplificado: breadcrumb global autenticado foi adicionado ao `Topbar` e é derivado do estado do `AppShell`; Settings expõe o detalhe ativo ao shell para mostrar `Settings / Detalhe`.
- Slice atual do PRD Corporate simplificado: Notifications foundation foi adicionada com migration `036_create_notifications.sql`, hook `useNotifications()`, página global Notifications, lâmpada com badge na Sidebar e seção de pendências no detalhe do Workspace.
- Slice atual do PRD Corporate simplificado: Flow approval / official status foi adicionado com migration `037_flow_approval_status.sql`, badges e ações na Flow List, audit logs, notificações e invalidação automática em saves estruturais do Flow Builder.
- Flow List agora usa menu `+` por Flow, no estilo FAB, com ações Abrir/Renomear/Responsável/Solicitar Aprovação; status ficam como texto limpo com ícones e tradução.
- Slice atual do PRD Corporate simplificado: deterministic Task execution path foi adicionado com migration `038_task_execution_path.sql`, campo `execution_path` em New Task, bloqueio sem fallback e `failure_reason` em `task_executions`.
- Slice atual do PRD Corporate simplificado: External LLM Builder foi adicionado no Flow Builder como importação por outline colado, criando cards sequenciais e marcando o Flow salvo como `external_llm` aguardando aprovação.
- Correção Flow Board: ao deletar o Flow selecionado, o bloco Flow Pipeline deixa de mostrar cards antigos; Flows existentes agora carregam cards/edges no estado controlado do React Flow para que atalhos de canvas também funcionem neles.
- Slice atual do PRD Corporate simplificado: Redrise Support source handling foi adicionado como ação simples na Flow List para marcar `source_type = redrise_support` e deixar o Flow aguardando aprovação.
- Slice atual do PRD Corporate simplificado: Corporate Analytics foi adicionado à tela Analytics com métricas de governança de Flow, execuções bloqueadas, notificações pendentes, agentes ativos, origem de Flows e status de Tasks usando dados já carregados pelo AppShell e `useAnalytics()`.
- Slice atual do PRD Corporate simplificado: Rise Insider / deterministic adapters foram adicionados ao `task-execute`; `mock_integration` e `manual_step` executam internamente, e `integration_gateway`, `rise_insider_terminal`, `rise_insider_filesystem`, `browser_automation` e `ui_control` chamam endpoints HTTPS ativos cadastrados em Settings > Integrations.
- Supabase Edge Function `task-execute` foi redeployada no remoto `vsaropewydcjsvplpugx` após adicionar adapters determinísticos.
- Adapter runtime hardening/observability foi adicionado: migration `039_create_adapter_runs.sql`, Analytics mostra Adapter Observability, `rise-insider-terminal` e `adapter-staging` foram publicados com `--no-verify-jwt`, e o smoke do test account passou por `mock_integration`, `manual_step`, `integration_gateway` e `rise_insider_terminal`.
- Adapter pairing/retry/filesystem foi adicionado: Settings > Integrations faz teste POST real e mascara config carregada no frontend; Analytics abre detalhe de `adapter_runs` e permite retry manual sem fallback; migration `040_create_rise_insider_files.sql` cria sandbox persistente para `rise-insider-filesystem`.
- Edge Functions redeployadas no remoto `vsaropewydcjsvplpugx`: `task-execute` e `rise-insider-filesystem --no-verify-jwt`; smoke com `teste@teste.com` passou por write/read/delete via `task-execute` e registrou adapter run `success`.
- Settings > Integration Setup agora abre em uma tela de setups configurados antes do wizard; Admin/Owner/Board veem resumos da equipe e apenas Admin abre parâmetros seguros de setups de outros usuários.
- Remote Supabase migration 041 is applied on `vsaropewydcjsvplpugx`; it adds safe integration setup overview/detail RPCs.
- Backend/RLS enforcement e Settings PRD3 polish foram aplicados: remote migrations 042 e 043 criam helpers de permissão, políticas role-scoped, Change Password real, revoke-all-other sessions, API key delete, integration status/delete/secret rotation e auditoria desses eventos.
- Edge Functions redeployadas no remoto `vsaropewydcjsvplpugx`: `rise-insider-terminal --no-verify-jwt` e `rise-insider-filesystem --no-verify-jwt` após hardening inicial por bearer token opcional/obrigatório via secrets.
- Billing real foundation foi aplicado: remote migration 044 cria `billing_subscriptions`, `billing-checkout` inicia checkout Stripe autenticado, `billing-webhook --no-verify-jwt` persiste eventos Stripe, e Plans lê estado real do Supabase.
- UI polish aplicado: cards de Plans e Analytics usam spotlight/glow follow sutil, controles clicáveis recebem cursor de mãozinha, e Auth/Loading/Error/Dialog/aria labels relevantes usam i18n.
- Agents provider wizard foi aplicado: `New Agent` usa wizard de provedor em 4 etapas, `agent-provider-test` foi publicado, migration 045 foi aplicada, e a lista de Agents tem menu `+` por Agent com Ver Detalhes/Renomear/Deletar com `DELETE`.
- PRD5 (Update 5.0) aplicada: Settings Hub substitui placeholder por página de navegação com 4 itens (General, Team, Billing, Limits) usando `ItemGroup` com active state por `usePathname()`; novo `settings/layout.tsx` renderiza header compartilhado apenas no hub (`/settings`); `item.tsx` atualizado com componentes adicionais (ItemMedia, ItemActions, etc.).
- Remote Supabase migration 040 is applied on `vsaropewydcjsvplpugx`.
- Remote Supabase migration 039 is applied on `vsaropewydcjsvplpugx`.
- Remote Supabase migrations 036, 037, and 038 are applied on `vsaropewydcjsvplpugx`.
- `corepack yarn build` now completes without the previous Vite dynamic-import and chunk-size warnings after manual vendor chunking.
- Fonte viva do PRD Corporate simplificado: `docs/product/current-source-of-truth.md`.
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
- Invite dispatch is centralized in `invite-member`: exact e-mail checking, `team_members` persistence, optional `team_assignments`, existing-user notification, and new-user Resend template e-mail all happen server-side with service role.
- Invite e-mail dispatch uses Resend directly from `invite-member`; sender is `hi.from@redrise.app`, template secret is `RESEND_INVITE_TEMPLATE_ID=invite`, and external links are Sign Up URLs with `invite_token`, not Supabase Auth magic invite links.
- Remote migration 029 is applied on `vsaropewydcjsvplpugx`; it creates `external_member_invites` and updates the Auth signup trigger so external invite membership activates only after Create Account validates the token and e-mail.
- Remote migration 031 is applied on `vsaropewydcjsvplpugx`; it adds `accept_pending_external_invites_for_user()` so signup can repair pending external invites by e-mail when repeated invite sends or missing metadata would otherwise leave a member as `Invited`.
- Members List Admin view includes a trash action for pending invite rows; use it to remove stale test invites.
- When a user has active external membership, Settings context prefers that membership over the self Admin row, but it displays the exact Role/Cargo selected in Add Member.
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
- Python/Graphify tooling is local to the repo: use `.\.tools\uv\uv.exe sync` and `.\.tools\uv\uv.exe run python -m graphify update . --force`; do not use global Python for project operations.
- Detailed local Graphify output is in `graphify-out/`; the latest clean structural update produced 1251 nodes, 1520 edges, and 148 communities after the Agents provider wizard slice.
- Security hardening applied at commit `8db0e60`: `api-keys.ts` uses `crypto.getRandomValues` + SHA-256; `agents.ts`, `flows.ts`, `tasks.ts`, `workspaces.ts`, `flow-cards.ts` had `console.log` removed; `invite-member` has origin-validated CORS and Admin-before-lookup; `rise-insider-terminal` and `rise-insider-filesystem` are fail-closed in production; `validate-api-key` uses SHA-256 validation; `api-keys-manager.tsx` shows secret only at creation; `create-task-page.tsx` validates schedule fields; `i18n.ts` has `secretHidden` key.
- New docs created: `docs/product/agent-task-execution-responsibility-prd.md` (Agent task-only execution responsibility), `docs/product/qdrant-execution-context-notes.md` (Qdrant infra notes for future use), and `docs/product/current-source-of-truth.md` updated to reference the Agent PRD.
- No Builder/Gateway/Governance features exist at this commit; those were in later commits (2d59432, 942bbdd, 77160f0, 1def0fc, fb8c6f0, d7f4a7d, 6f0ca1f) which have been discarded.
- Workspace root is now `D:\studio\redrise`; old briefing/framework/backlog folders are not active guidance.
- Update 2.0 test bundle now covers Create Task, Flow Builder, Agent Detail, Create Workspace, Create Flow, Personal Information field locks/search, and auxiliary `team-members-card` copy.
- Previous deployment targets are legacy and are no longer active targets for this project reset.

## Current Validation Baseline

- `npm run lint` passes.
- `npm run typecheck` passes.
- `npm run build` passes (31 routes).
- E2E tests need reconfiguration for Next.js.

## Open Work

- **PRD3 (Update 3.0)**: Resolve Settings menu definitively. Covers 4 phases: Critical Fixes (Change Password functional, Plans real state, Integration real test), High-Priority Gaps (member removal, revoke all sessions, API key delete, integration management, audit log coverage), Quality/Polish (avatar to Storage, username uniqueness, unsaved-changes warning, audit pagination, polling reduction, dead component cleanup), i18n Completion (hardcoded strings, gender locale-neutral storage). See `updates/prd3.md`.
- **Corporate simplification PRD next order**: validate role-scoped RLS with real multi-role accounts, then deepen Rise Insider production hardening and operational audit UX.
- **Billing next order**: configure Supabase secrets `STRIPE_SECRET_KEY`, `STRIPE_WEBHOOK_SECRET`, `STRIPE_BUSINESS_PRICE_ID`, `STRIPE_CORPORATE_PRICE_ID`; create the Stripe webhook endpoint pointing to `/functions/v1/billing-webhook`; then run a live checkout/webhook smoke.
- **Agents next order**: run authenticated provider smoke with an Admin session and real provider credentials; browser/headless OpenAI profiles currently validate runtime selection, not full ChatGPT account automation.
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
- After relevant code, architecture, or behavior changes, refresh the structural graph with `.\.tools\uv\uv.exe run python -m graphify update . --force` and update memory if counts or architecture changed; semantic doc extraction needs Gemini env keys.

## Operational Rules

- Use npm as package manager.
- Use repository-local Python/Graphify tooling; global Python is not the operational path for this repo.
- Do not add yarn.lock or pnpm-lock.yaml.
- Do not deploy to or document previous deployment aliases as the official URL.
- Use Render auto-deploy as primary deploy path.
- Do not reintroduce `localStorage` persistence for domain data.
- Do not reintroduce OAuth or e-mail confirmation UI without official credentials/configuration.
- After relevant code, architecture, or behavior changes, refresh the structural graph with `python -m graphify update . --force` and update memory if counts or architecture changed.
