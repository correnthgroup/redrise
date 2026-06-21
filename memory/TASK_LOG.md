# TASK_LOG

> Current/future task record only. Past chronological implementation details were removed by request.

## Current Production Snapshot

- Official URL: `https://redrise.onrender.com`.
- Current production deployment: Render.
- Production status: Render static site `redrise` is live.
- Backend: Supabase project `vsaropewydcjsvplpugx`.
- GitHub repository: `https://github.com/correnthgroup/redrise.git`.
- Package manager: Yarn through Corepack.
- Deploy path: Render auto-deploy from GitHub using `render.yaml`; manual deploy was also triggered for commit `6db3eae`.
- Workspace root is now `D:\studio\redrise`; legacy briefing/framework/backlog folders are not active guidance.

## Current App Snapshot

- Auth is Supabase e-mail/password.
- Sign Up suppresses Supabase's automatic session and returns to Sign In.
- OAuth is archived for future provider setup.
- E-mail confirmation is archived for future sender/SMTP/template setup.
- Profiles, active sessions, and team members are Supabase-backed.
- Flow/Tasks member dropdowns use Settings > Team Members data.
- Settings > Plans is not billing yet.

## Last Verified Baseline

- `corepack yarn lint` passed.
- `corepack yarn typecheck` passed.
- `corepack yarn test` passed.
- `corepack yarn build` passed.
- `corepack yarn test:e2e --workers=1` passed with 22/22 tests after adding stable `data-testid` selectors for sidebar navigation and Dashboard `New Workspace`.
- CI E2E now runs in split Playwright processes for smoke/navigation, workspaces, and settings to isolate remote state between groups.
- E2E suite was restructured into 10 Playwright projects by domain/menu: auth-public, auth-session, navigation, dashboard, flow, tasks, agents, analytics, workspaces, settings.
- Local modular matrix passed with 39 tests across all 10 E2E modules.
- `corepack yarn lint`, `corepack yarn typecheck`, `corepack yarn test`, `corepack yarn build`, and `corepack yarn test:e2e` passed after moving all dedicated wizards to shared `WizardShell` and updating the slogan to `Add AI. Enhance Value.` / `Add AI. Agregue Valor.`.
- `C:\Python314\python.exe -m graphify update . --force` produced a clean structural graph with 1012 nodes, 1199 edges, and 142 communities in `graphify-out` after Flow/Task context updates; semantic doc extraction remains pending without Gemini env keys.
- `supabase db push` applied remote migrations 020, 021, and 022 to `vsaropewydcjsvplpugx`; this resolved New Team creation failing because `public.teams` was missing from the remote schema cache.
- `corepack yarn test`, `corepack yarn build`, and `corepack yarn test:e2e` passed after applying remote migrations and fixing New Team wizard labels/error handling.
- `supabase db push` applied remote migration 023 to add `tasks.flow_id`.
- `corepack yarn lint`, `corepack yarn typecheck`, `corepack yarn test`, `corepack yarn build`, and `corepack yarn test:e2e` passed after persisting Flow List rename/member updates, removing card-level member selection in Flow Builder, and adding Workspace/Flow context to New Task.

## Next Tasks

- PRD parte 1 ajuste Team List/Role: Settings renomeia Function para Role/Cargo nos cadastros de membros; Team List mostra tabela por padrão, abre uma tela dedicada de wizard via New Team, e usa Function/Função livre por membro selecionado na etapa 2.
- PRD parte 1 ajuste wizards: New Workspace, New Flow, New Task, New Agent, Integrations e New Team usam `WizardShell` como moldura compartilhada, mantendo individualidades de campos, validações e callbacks em seus próprios componentes.
- PRD parte 1 ajuste slogan: texto mudou de `Adding AI. Enhance Value.` para `Add AI. Enhance Value.` em inglês e `Add AI. Agregue Valor.` em PT-BR.
- PRD parte 1 ajuste Add Member: `AddMemberModal` removeu o campo Function separado, tornou Role/Cargo obrigatório usando a lista oficial de cargos e trocou Team para dropdown padrão carregado das equipes formais atuais.
- PRD parte 1 ajuste New Team: etapas traduzidas, erro de criação explícito, e retorno para Team List após criação bem-sucedida.
- PRD parte 1 ajuste Flow/Tasks: Flow List rename/member changes now persist; Flow Builder cards no longer assign members; New Task requires Workspace and can optionally link to a Flow.
- PRD parte 1 ajuste obrigatório: criado `RequiredLabel` como componente padrão para campos obrigatórios e removidas marcações manuais de Sign Up, New Workspace, New Flow, New Task, Integrations, Add Member e Team List.
- PRD parte 1 ajuste Team List: Team List agora usa `teams` e `team_assignments`, permite criar equipe vazia por wizard de 3 etapas, limita a 7 equipes, permite membro em múltiplas equipes e abre detalhe da equipe com Add Team Member.
- PRD parte 1 continuação: Function oficial padronizada como Owner/Board/Staff/Member/Viewer; Members List virou leitura/convite sem edição; Team List foi adicionada para criar equipes e atribuir membros/funções; Personal Information agora mostra função e equipe atuais como campos não editáveis.
- PRD parte 1 local: Sign Up agora marca todos os campos de registro como obrigatórios, username inicial usa nome completo via migration 020, favicon/título do navegador foram atualizados, Dashboard usa dados vivos de workspaces/flows/tasks/agents, migration 021 recalcula status/contagem do workspace por flows/tasks, Flow Pipeline lê `flow_cards` reais, Plans fica Under Construction em produção, e `docs/USE_CASES.md` registra 7 casos de uso.
- **PRD3 (Update 3.0)**: Resolve Settings menu definitively. 4 phases: Critical Fixes, High-Priority Gaps, Quality/Polish, i18n Completion. See `updates/prd3.md`.
- Keep docs and memory current/future only; do not re-add historical implementation archives as active guidance.
- Finish the remaining Update 2.0 deep-copy conversion outside the current PRD2 test-bundle scope before production deployment.
- Keep `graphify-out/GRAPH_REPORT.md`, `graphify-out/graph.json`, and `graphify-out/graph.html` refreshed after relevant architecture/code/product behavior changes; caches and backups remain local-only.
- Execute `updates/update1.4_colors.md` only if the future auth visual update is approved.
- Implement real Stripe billing only after plan matrix, checkout, webhook, and permission matrix are approved.
- Re-enable OAuth only after official provider credentials exist.
- Re-enable e-mail confirmation only after official transactional e-mail setup exists.
- Keep Render, Supabase Auth redirects, and app allowed origins aligned with the final Render URL.
