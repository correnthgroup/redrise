# Redrise — Guia-Mestre do App

> Visao completa de cada funcionalidade, seu proposito, importancia no fluxo e como se conecta com o resto do produto.

---

## Sumario

1. [Visao geral do produto](#1-visao-geral-do-produto)
2. [Arquitetura e stack](#2-arquitetura-e-stack)
3. [Fluxo principal do usuario](#3-fluxo-principal-do-usuario)
4. [Modulo: Autenticacao](#4-modulo-autenticacao)
5. [Modulo: Shell (AppFrame + AppShell)](#5-modulo-shell)
6. [Modulo: Sidebar](#6-modulo-sidebar)
7. [Modulo: Dashboard](#7-modulo-dashboard)
8. [Modulo: Flow](#8-modulo-flow)
9. [Modulo: Tasks](#9-modulo-tasks)
10. [Modulo: Agents](#10-modulo-agents)
11. [Modulo: Analytics](#11-modulo-analytics)
12. [Modulo: Settings](#12-modulo-settings)
13. [Blocos compartilhados](#13-blocos-compartilhados)
14. [Mapa de navegacao](#14-mapa-de-navegacao)
15. [Estado atual e proximos passos](#15-estado-atual-e-proximos-passos)

---

## 1. Visao geral do produto

**Redrise** e um SaaS workspace-first para operacoes com IA. O produto permite que equipes criem workspaces, definam flows (processos visuais), executem tasks operacionais e usem agentes de IA com controle humano (HITL).

**Publico-alvo**: equipes que precisam automatizar processos operacionais com IA, mantendo controle humano sobre decisoes criticas.

**Proposito**: unificar modelagem visual (flows), execucao (tasks) e inteligencia artificial (agents) em uma unica plataforma com analytics e governanca.

---

## 2. Arquitetura e stack

| Camada | Tecnologia |
|--------|-----------|
| Build | Vite 8 + `@vitejs/plugin-react` |
| Framework | React 19 + TypeScript 6 |
| Styling | Tailwind CSS v4 via `@tailwindcss/vite` |
| UI primitives | shadcn-style (Radix + CVA + tailwind-merge) |
| Charts | Recharts |
| Flow editor | `@xyflow/react` (React Flow v12+) |
| Routing | State-machine no `AppShell` via `SidebarKey` |
| State | Pure React + `localStorage` |
| Backend | Supabase (projeto `ndfsselzilmdzywcdyoo`) |
| Auth | Supabase Auth (GitHub + email/password) |
| Database | Supabase PostgreSQL com RLS |
| Package manager | `yarn` via `corepack` |
| Testes | Vitest (unit) + Playwright (e2e) |
| Paleta | **Sugestao 2** — primary=#8c1f28, header=#0F172A, secondary=#2F4858 |

---

## 3. Fluxo principal do usuario

O fluxo central do Redrise segue esta jornada:

```
Autenticacao
    |
    v
Dashboard (visor de workspaces)
    |
    +--> Criar Workspace (wizard multi-step)
    |         |
    |         v
    |    Review Workspace (resumo do workspace criado)
    |         |
    |         +--> Flow (modelar processos)
    |         |         |
    |         |         v
    |         |    Flow Editor (React Flow canvas)
    |         |
    |         +--> Tasks (executar trabalho)
    |                   |
    |                   +--> Create Task
    |                   +--> Review Task
    |
    +--> Agents (configurar IA)
    |         |
    |         +--> Agent Create
    |         +--> Agent Detail (acoes de IA com HITL)
    |
    +--> Analytics (monitorar operacao)
    |
    +--> Settings (conta, equipe, integracoes)
```

**Por que esse fluxo importa**: O workspace e a unidade central. Tudo (flows, tasks, agents, analytics) vive dentro de um workspace. O Dashboard e o ponto de entrada que conecta tudo.

---

## 4. Modulo: Autenticacao

**Arquivo**: `src/components/auth/auth-flow.tsx`

**O que e**: Tela de login/cadastro com 3 modos: sign-in, sign-up e confirm-code.

**O que o usuario ve**:
- **Sign-in**: email + senha, botao "Sign in", botao "Sign in with Google" (decorativo), link "Forgot password?" e "Create an account"
- **Sign-up**: nome completo, email, senha com validacao em tempo real (8+ chars, maiuscula, digito, simbolo)
- **Confirm-code**: campo de 6 digitos para verificacao de email

**Importancia no fluxo**: E o gate de entrada. Sem autenticacao, o usuario nao acessa nenhum modulo. A sessao e armazenada em `localStorage` (`app:session`).

**Conexao com outros modulos**: Ao autenticar, o usuario e redirecionado para o `AppShell` que mostra o Dashboard.

**Status atual**: Conectado ao Supabase Auth. Suporta GitHub OAuth e email/password. Sessao gerenciada pelo Supabase.

---

## 5. Modulo: Shell (AppFrame + AppShell)

**Arquivos**:
- `src/components/layout/app-frame.tsx` — container externo com gradiente
- `src/components/layout/app-shell.tsx` — shell autenticado com state-machine

**O que e**: A estrutura que envolve todo o app autenticado. O `AppFrame` e o container visual (painel branco arredondado sobre fundo gradiente). O `AppShell` e o layout funcional (sidebar + topbar + conteudo).

**O que o usuario ve**: Um painel flutuante com sidebar a esquerda, barra de titulo no topo, e area de conteudo no centro.

**Importancia no fluxo**: E a espinha dorsal do produto. Todas as paginas autenticadas vivem dentro dele. O state-machine do `AppShell` controla qual pagina e exibida com base na navegacao da sidebar.

**Estado atual**: Completo e funcional. Navegacao entre 6 modulos + sub-estados funciona. Conectado ao Supabase para workspaces (load, create, delete).

---

## 6. Modulo: Sidebar

**Arquivo**: `src/components/layout/sidebar.tsx`

**O que e**: A navegacao principal do produto. 6 itens fixos com icones, expand/collapse suave, e blocos contextuais por modulo.

**Itens de navegacao**:

| Chave | Label | Icone | Bloco contextual |
|-------|-------|-------|-----------------|
| `dashboard` | Dashboard | LayoutDashboard | Status de workspaces |
| `flow` | Flow | Network | Status de flows |
| `tasks` | Tasks | ListChecks | Resumo de tasks |
| `agents` | Agents | Users | Status de agentes |
| `analytics` | Analytics | BarChart3 | Metricas rapidas |
| `settings` | Settings | SettingsIcon | (nenhum) |

**Comportamentos**:
- **Expandida** (264px): mostra labels, nome "Redrise", bloco contextual, footer do usuario
- **Recolhida** (53px): apenas icones, tooltips no hover (nao no focus)
- **Animacao**: `transition-[width] duration-300 ease-[cubic-bezier(0.22,1,0.36,1)]`
- **Persistencia**: estado salvo em `localStorage` (`app:sidebar:collapsed`)

**Importancia no fluxo**: E o principal meio de navegacao. O usuario troca entre modulos clicando nos itens. Os blocos contextuais dao visibilidade rapida do estado atual sem precisar navegar.

**Conexao com outros modulos**: Cada item da sidebar leva a uma pagina principal. Ao trocar de item, sub-estados resetam para os padroes (board/list).

---

## 7. Modulo: Dashboard

**Arquivo**: `src/components/blocks/pages/dashboard-page.tsx`

**O que e**: O painel de controle principal. Mostra uma visao consolidada de todos os workspaces, metricas operacionais e atividade recente.

**Secoes (de cima para baixo)**:

### 7.1 OnboardingEmpty — Visao de workspaces
- Cartao de boas-vindas com icone Sparkles
- 3 colunas de status: Healthy, Maintenance, Pending
- Cada workspace mostra nome, missao (2 linhas), ID (mono fonte), data de criacao e quantidade de flows
- Clicar em um workspace abre o ReviewWorkspacePage

**Importancia**: E o ponto de entrada para cada workspace. O usuario ve todos os seus workspaces organizados por saude e pode acessar qualquer um deles.

**Status atual**: Conectado ao Supabase. Workspaces reais sao exibidos (ou lista vazia se nenhum existir).

### 7.1.1 Create Workspace (wizard)

**Arquivo**: `src/components/blocks/pages/create-workspace-page.tsx`

**O que e**: Wizard de 4 steps para criar um workspace.

**Steps**:
1. **Basic Info** — nome e missao do workspace (campos obrigatorios)
2. **Health & Team** — placeholder para metricas de saude e equipe inicial
3. **Flows** — placeholder para flows que o workspace tera
4. **Review** — resumo com nome e missao

**Comportamentos**:
- Footer: `[Cancel]` a esquerda, `[Back] [Next]` a direita (ml-auto)
- Botao "Done" no ultimo step (min-w-[120px] para evitar shift de largura)
- Ao criar: salva no Supabase via `addWorkspace()`, exibe ReviewWorkspace

**Importancia**: Formaliza a criacao de um workspace. O nome e a missao sao os dados obrigatorios.

**Status atual**: Persistido no Supabase. Steps 2 e 3 ainda sao placeholders.

### 7.1.2 Review Workspace

**Arquivo**: `src/components/blocks/pages/review-workspace-page.tsx`

**O que e**: Detalhe do workspace com 4 cards: Identity, Mission, Health, Flows.

**O que o usuario ve**:
- Card Identity: ID (mono fonte), nome, status (badge colorido), data de criacao, data de atualizacao (se existir)
- Card Mission: texto da missao (ou "No mission defined" se vazio)
- Card Health: status (badge colorido) e quantidade de flows
- Card Flows: quantidade de flows configurados
- Botao Delete ( Trash2 ) no header: abre dialog de confirmacao
- Topbar mostra o nome do workspace ao inves de "Dashboard"

**Comportamentos**:
- Delete: exige digitar "DELETE" para confirmar, botoes OK/Cancel
- Ao deletar: remove do Supabase via `removeWorkspace()`, dialog fecha, volta para Dashboard
- Botao Cancel: volta para Dashboard, limpa campo de confirmacao
- Cores do badge: healthy=emerald, maintenance=amber, pending=primary

**Importancia**: Permite revisar todos os detalhes do workspace e excluir se necessario.

**Status atual**: Conectado ao Supabase. Todos os dados reais exibidos.

### 7.2 KPI Cards — Metricas operacionais
- 7 cards: Active workspaces, Flow runs, Health score, Blocked tasks, AI requests, Approval rate, Error rate
- Cada card tem valor grande, delta (up/down/flat), e mini sparkline

**Importancia**: Dao visibilidade instantanea do estado operacional. O usuario identifica problemas (tasks bloqueadas, alta taxa de erro) em segundos.

### 7.3 ChartTabs — Visao temporal
- 3 abas: Usage, Errors, Latency
- Cada aba mostra um AreaChart com 12 pontos de dados

**Importancia**: Mostra tendencias ao longo do tempo. Permite identificar picos de uso, aumento de erros ou degradacao de latencia.

### 7.4 OperationsGrid — Detalhes operacionais
- **Linha superior** (3 cards de barras de progresso): Staffing, Model Breakdown, Capacity Mix
- **Linha inferior** (4 cards de listas): Attention Queue, Alerts, Configuration Watch, Operational Indicators

**Importancia**: Da profundidade para quem precisa investigar. Mostra alocacao de recursos, distribuicao de modelos, e filas de atencao.

### 7.5 ActivityFeed — Atividade recente
- 5 colunas: Activity Feed, Alerts, Notifications, Change Log, Audit Trail
- Cada coluna mostra 3-5 eventos com timestamp

**Importancia**: Auditoria e rastreabilidade. O usuario ve o que aconteceu recentemente em todas as dimensoes do produto.

**Conexao com outros modulos**: O Dashboard e o hub. Workspaces levam ao ReviewWorkspace, que liga a Flow e Tasks. O botao "New Workspace" leva ao CreateWorkspacePage.

**Status atual**: Workspaces reais do Supabase sao exibidos no OnboardingEmpty. KPI Cards, ChartTabs, OperationsGrid e ActivityFeed ainda usam dados mockados.

---

## 8. Modulo: Flow

### 8.1 Flow List

**Arquivo**: `src/components/blocks/pages/flow-list-page.tsx`

**O que e**: Listagem de flows (processos) do workspace.

**O que o usuario ve**:
- **Coluna esquerda**: barra de busca + botao "New Flow" + lista de flows placeholder (Sales Qualification, Client Onboarding, Escalation Routing, Delivery Handoff). Cada flow mostra nome, owners (separados por virgula), ID (mono fonte) e badge de status (running/paused/error).
- **Acoes por flow**: 3 icones — ExternalLink (abrir no editor), Pencil (renomear inline), Users (selecionar owners via multi-select dropdown)
- **Selecao**: clicar em um flow seleciona (highlight com ring primary), um por vez
- **Coluna direita**: WorkflowPipeline com cards do flow selecionado, checkboxes (padrao quadrado, unchecked), Select All/Deselect All, e controles play/pause/reset
- **Estado vazio**: quando nenhum flow selecionado, exibe "Select a Flow to Run It"

**Comportamentos**:
- Busca filtra flows por nome (case-insensitive)
- Renomear: clique no icone Pencil, edite inline, Enter confirma, Esc cancela, nome vazio invalidado
- Owners: clique no icone Users, multi-select com dropdown de checkboxes (PLACEHOLDER_MEMBERS)
- Selecionar flow: clique no card, destaque visual, atualiza Pipeline
- Clique novamente para desselecionar

**Importancia**: E onde o usuario gerencia todos os processos do workspace. A busca permite encontrar flows rapidamente. O status indica quais estao ativos, pausados ou com erro.

**Conexao**: Clicar no icone ExternalLink ou em um flow abre o FlowBuilderPage. "New Flow" tambem abre o FlowBuilderPage.

### 8.2 Flow Editor

**Arquivo**: `src/components/blocks/pages/flow-builder-page.tsx`

**O que e**: Editor visual de processos usando React Flow.

**O que o usuario ve**:
- Canvas com fundo de grid pontilhado
- 4 nos iniciais em cadeia horizontal: trigger -> enrich -> decide -> deliver
- Cada no e um `FlowCard` (180px, com handles de entrada/saida) que mostra:
  - Titulo do card
  - Members (se selecionados, "Members: nome1, nome2")
  - Agents (se selecionados, "Agents: agent1, agent2")
  - "Undefined" quando nenhum member/agent selecionado
  - ID do card (mono fonte, ex: "ID: n1")
- Barra superior com icone de edicao (Pencil) ao lado do titulo, atalhos de teclado (Keyboard), e botoes Cancel/Save
- Edicao inline do titulo do flow (clique no Pencil, Enter confirma, Esc cancela)
- Dialog "Edit Card" (clique no icone CheckCircle2 verde-escuro no card):
  - Titulo do card (input)
  - Instrucoes (textarea)
  - Members e Agents lado a lado (grid-cols-2, multi-select dropdowns)
  - ID do card (mono fonte, em baixo)
- Botoes Cancel e Save (Save retorna para a lista de flows)

**Comportamentos**:
- Arrastar nos para reposicionar
- Conectar handles para criar arestas (animadas)
- Zoom via scroll do mouse
- MiniMap para navegacao rapida
- Atalhos de teclado:
  | Atalho | Acao |
  |--------|------|
  | `N` | Criar novo card |
  | `Del` | Deletar card selecionado |
  | `Ctrl+A` | Selecionar todos |
  | `Ctrl+C` | Copiar selecionados |
  | `Ctrl+V` | Colar copiados |
  | `Ctrl+Z` | Desfazer |
  | `Ctrl+Shift+Z` | Refazer |

**Importancia**: E o coracao da modelagem visual. O usuario transforma processos mentais em estruturas visuais que podem ser executadas como flows.

**Status atual**: Editor funcional com dados hardcoded. Save retorna para a lista de flows. Sem persistencia no Supabase.

---

## 9. Modulo: Tasks

### 9.1 Task Board

**Arquivo**: `src/components/blocks/pages/task-board-page.tsx`

**O que e**: Kanban board com 4 colunas para gestao de tarefas.

**Colunas e status**:

| Status | Titulo | Cor visual |
|--------|--------|-----------|
| `backlog` | Backlog | borda escura (secondary), fundo slate |
| `in-progress` | In progress | borda primary, fundo primary claro |
| `in-review` | In review | borda amber, fundo amber claro |
| `done` | Done | borda emerald, fundo emerald claro |

**Comportamentos**:
- Drag and drop nativo (HTML5) entre colunas
- Coluna ativa recebe highlight `ring-1 ring-primary/40`
- Botao "New Task" leva ao CreateTaskPage
- Clicar em uma task leva ao ReviewTaskPage

**Importancia**: E a tela de execucao operacional. O usuario ve todo o trabalho pendente, em progresso, em revisao e concluido. O drag and drop permite mudar status visualmente.

### 9.2 Create Task

**Arquivo**: `src/components/blocks/pages/create-task-page.tsx`

**O que e**: Wizard de 4 steps para criar uma task.

**Steps**:
1. **Basic Info** — campo Titulo
2. **Briefing** — textarea "O que precisa acontecer?"
3. **Team** — placeholder para selecionar responsaveis e revisores
4. **Review** — resumo com Titulo e Briefing

**Importancia**: Formaliza o trabalho que precisa ser feito. O briefing e o contrato mental entre quem pede e quem executa.

### 9.3 Review Task

**Arquivo**: `src/components/blocks/pages/review-task-page.tsx`

**O que e**: Detalhe da task com 4 cards: Identity, Briefing, Team, Reviewers.

**Importancia**: Permite revisar todos os detalhes antes de iniciar a execucao.

**Status atual**: Tasks sao mockadas (12 tasks distribuidas entre colunas). Sem persistencia real.

---

## 10. Modulo: Agents

### 10.1 Agent List

**Arquivo**: `src/components/blocks/pages/agent-list-page.tsx`

**O que e**: Listagem de agentes de IA configurados no workspace.

**O que o usuario ve**:
- Barra de busca + botoes "Invite" e "New Agent"
- Lista de 10 agentes com dots de status coloridos (active=slate-blue, paused=amber, error=crimson, idle=slate)
- Cada agente mostra nome, modelo e badge de status
- Grid inferior: tabela de membros + card de resumo operacional

**Importancia**: Visao de todos os agentes de IA do workspace. O status indica quais estao operacionais, pausados ou com erro.

### 10.2 Agent Create

**Arquivo**: `src/components/blocks/pages/agent-create-page.tsx`

**O que e**: Wizard de 4 steps para criar um agente.

**Steps**:
1. **Basic Info** — nome e briefing do agente
2. **Capabilities** — placeholder para ferramentas e acoes permitidas
3. **Limits** — placeholder para rate limits, token budgets, timeouts
4. **Review** — resumo

**Importancia**: Configurar o agente e definir o contrato de confianca. Limits e capabilities sao as guardrails que impedem o agente de agir indevidamente.

### 10.3 Agent Detail

**Arquivo**: `src/components/blocks/pages/agent-detail-page.tsx`

**O que e**: Detalhe do agente com 4 abas.

**Abas**:
1. **Overview** — atividade recente (3 eventos placeholder)
2. **Sessions** — dispositivos conectados (reutiliza `SessionsList`)
3. **API Keys** — chaves de API (reutiliza `ApiKeysManager`)
4. **Security** — alteracao de senha (reutiliza `ChangePassword`)

**Acoes**: Pause/Restart do agente (decorativos).

**Importancia**: E onde o usuario gerencia um agente especifico. As abas de sessoes e API keys mostram como o agente acessa o sistema.

**Status atual**: 10 agentes mockados com status variados. Sem integracao com IA real.

---

## 11. Modulo: Analytics

**Arquivo**: `src/components/blocks/pages/analytics-page.tsx`

**O que e**: Dashboard de metricas operacionais e de IA.

**Secoes**:
1. **KPI Cards** (5 de 7): Active workspaces, Flow runs, Health score, Blocked tasks, AI requests — cada um com sparkline
2. **ChartTabs**: graficos temporais de Usage, Errors, Latency
3. **Tabela por agente**: 3 agentes (Workspace Summarizer, Task Prioritizer, Flow Reviewer) com colunas Requests, Errors (%), p95 (ms)

**Importancia**: Torna a operacao observavel. O usuario identifica quais agentes estao consumindo mais recursos, quais estao com alta taxa de erro, e onde a latencia e um problema.

**Status atual**: Todos os dados sao mockados. Tabela com 3 agentes placeholder.

---

## 12. Modulo: Settings

**Arquivo**: `src/components/blocks/pages/settings-page.tsx`

**O que e**: Centro de configuracao da conta e do workspace.

**6 Atalhos**:

| Atalho | Descricao | Componente |
|--------|-----------|-----------|
| Personal Information | Avatar, nome, email, telefone, endereco | `AccountBasicInfoPage` |
| Change Password | Alterar senha de acesso | `ChangePassword` |
| Active Sessions | Gerenciar dispositivos conectados | `SessionsList` |
| API Keys | Criar, rotular, revogar chaves de API | `ApiKeysManager` |
| Integration Setup | Conectar Slack, GitHub, Postgres, etc. | `IntegrationSetupWizard` |
| Team Members | Ver membros e convidar novos | `MemberListTable` + `AddMemberModal` |

**Importancia**: E onde o usuario administra acesso, seguranca e integracoes. Cada atalho leva a uma tela dedicada com todas as operacoes daquele dominio.

**Status atual**: Todos os componentes funcionais com dados mockados. IntegrationSetupWizard tem simulacao de teste de conexao.

---

## 13. Blocos compartilhados

Estes componentes sao reutilizados em multiplos modulos:

| Bloco | Usado em | Proposito |
|-------|----------|-----------|
| `KpiCards` | Dashboard, Analytics | Metricas com sparkline |
| `ChartTabs` | Dashboard, Analytics | Graficos temporais |
| `OperationsGrid` | Dashboard | Detalhes operacionais |
| `ActivityFeed` | Dashboard | Feed de atividade |
| `OnboardingEmpty` | Dashboard | Visao de workspaces |
| `WorkflowPipeline` | Flow List | Pipeline visual com checkboxes (padrao quadrado), Select All, members/agents por card, status badge, controles play/pause/reset |
| `SessionsList` | Settings, Agent Detail | Gestao de sessoes |
| `ApiKeysManager` | Settings, Agent Detail | Gestao de chaves |
| `ChangePassword` | Settings, Agent Detail | Alteracao de senha |
| `MemberListTable` | Settings, Agent List | Tabela de membros |
| `AddMemberModal` | Settings, Agent List | Convite de membros |
| `IntegrationSetupWizard` | Settings | Wizard de integracoes |
| `CommandPalette` | (nao usado ainda) | Paleta de comandos |
| `TeamPermissionsMatrix` | (nao usado ainda) | Matriz de permissoes |
| `AvatarUpload` | (nao usado ainda) | Upload de avatar |
| `DropdownFilterByPriority` | (nao usado ainda) | Filtro por prioridade |
| `PaginationFooter` | MemberListTable | Paginacao |

---

## 14. Mapa de navegacao

```
AuthFlow
  sign-in <---> sign-up ---> confirm-code
       |
       v
AppShell
  |
  +-- Dashboard (board)
  |     |-- [click workspace] --> ReviewWorkspace
  |     |-- [New Workspace] --> CreateWorkspace --> ReviewWorkspace
  |
  +-- Flow
  |     |-- [list] --> FlowList
  |     |-- [click flow / New Flow] --> FlowBuilder --> (back)
  |
  +-- Tasks
  |     |-- [board] --> TaskBoard
  |     |-- [New Task] --> CreateTask --> (back)
  |     |-- [click task] --> ReviewTask --> (back)
  |
  +-- Agents
  |     |-- [list] --> AgentList
  |     |-- [New Agent] --> AgentCreate --> (back)
  |     |-- [click agent] --> AgentDetail --> (back)
  |     |-- [Invite] --> AddMemberModal
  |
  +-- Analytics (leaf)
  |
  +-- Settings
        |-- [Personal Info] --> AccountBasicInfo
        |-- [Change Password] --> ChangePassword
        |-- [Active Sessions] --> SessionsList
        |-- [API Keys] --> ApiKeysManager
        |-- [Integrations] --> IntegrationSetupWizard
        |-- [Team Members] --> MemberListTable + AddMemberModal
```

---

## 15. Estado atual e proximos passos

### O que ja existe (Sprint 0 + Sprint 1 + Sprint 2 + Sprint 3 + Sprint 4)

- Shell completo com navegacao funcional
- Sidebar com animacao suave e persistencia
- 14 paginas com placeholders ricos
- Visual consistente com paleta Sugestao 2
- Pipeline de qualidade (lint, typecheck, test, build, test:e2e)
- **Sprint 2**: Dashboard conectado ao Supabase — workspaces reais exibidos, criados e deletados via API
- **Sprint 3**: Wizard de criacao de workspace persistido — cria workspaces no Supabase que sobrevivem a reload
- **Sprint 4**: Review Workspace conectado a dados reais — status badge, health card, topbar mostra nome do workspace, dialog fecha apos delete
- **Flow List**: lista com busca, selecao, edicao de nome/owners, IDs visiveis
- **Flow Editor**: editor React Flow com cards que mostram titulo/members/agents/ID, dialog de edicao completo, atalhos de teclado, arestas animadas
- **WorkflowPipeline**: checkboxes quadrados, Select All, members/agents por card, controles play/pause/reset
- **IDs visiveis**: workspace ID (dashboard, review), flow ID (flow list), card ID (flow editor, pipeline)

### O que falta (Sprint 4+)

| Sprint | O que entrega | Por que importa |
|--------|--------------|-----------------|
| Sprint 4 | Review Workspace conectado a dados reais | Fecha o ciclo Dashboard -> Create -> Review |
| Sprint 5 | Flow List por workspace | Abre a camada de modelagem visual |
| Sprint 6 | Flow Editor persistido | Permite salvar e recarregar flows |
| Sprint 7 | Task Board persistido | Liga modelagem a execucao operacional |
| Sprint 8 | Create/Review Task persistido | Fecha o ciclo de tasks |
| Sprint 9 | Agents base | Prepara a camada de IA |
| Sprint 10 | IA com HITL | Entrega a primeira acao de IA com aprovacao humana |
| Sprint 11 | Analytics basico | Torna a operacao observavel |
| Sprint 12 | Settings e membros | Fecha operacao de conta e equipe |
| Sprint 13 | Integracoes e API keys | Abre o app para ecossistema externo |
| Sprint 14 | Multi-tenant e seguranca | Prepara para uso serio |
| Sprint 15 | Templates | Acelera onboarding de novos usuarios |

### Decisoes tomadas

- **Backend**: Supabase (projeto `ndfsselzilmdzywcdyoo`)
- **Autenticacao**: GitHub + email/password via Supabase Auth
- **RLS**: habilitado na tabela `workspaces` com 4 politicas baseadas em `user_id`
- **State management**: React + localStorage (sem Redux/Zustand)
- **Package manager**: yarn via corepack (nao pnpm, nao npm)
