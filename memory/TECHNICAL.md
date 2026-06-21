# TECHNICAL

> Documento em PT-BR para humanos não técnicos e agentes determinísticos. Ele explica como o app funciona, como as telas se conectam, quais fontes de dados cada elemento usa, e quais mudanças futuras estão planejadas mas ainda não implementadas.

## Como Usar Este Documento

- Leia este arquivo antes de alterar navegação, menus, permissões, membros, planos, pagamentos, perfil, sessões, flows, tasks, agents ou analytics.
- Não trate itens da seção **Planejado** como comportamento já existente no código.
- Se alterar uma tela, atualize também as seções deste arquivo que citam essa tela.
- Se criar ou alterar tabelas no Supabase, explique aqui em linguagem simples o que cada tabela guarda.
- Se criar ou alterar botões, explique aqui para onde eles levam, o que salvam, o que carregam e que outras telas dependem deles.
- `CTA` significa chamada para ação: normalmente um botão principal que guia o usuário para o próximo passo.
- `UI` significa interface do usuário: tudo que aparece visualmente na tela.
- `RLS` significa Row Level Security: regra do Supabase que limita quais linhas do banco cada usuário pode ver ou alterar.
- `E2E` significa teste de ponta a ponta: teste automatizado que simula um usuário usando o app no navegador.
- `MVP` significa primeira versão funcional do produto, com o mínimo necessário para operar.

## Visão Geral Do App

- Redrise é um app SaaS de operação por workspaces, flows, tasks, agents, analytics e settings.
- `SaaS` significa software acessado pela internet com conta de usuário.
- O público-alvo são equipes que precisam automatizar processos operacionais com IA mantendo controle humano em decisões críticas.
- O propósito do produto é unir modelagem visual, execução operacional, agentes de IA, analytics e governança em uma única plataforma.
- `IA` significa Inteligência Artificial.
- `HITL` significa Human-in-the-loop: humanos revisam, aprovam ou bloqueiam ações importantes antes da execução final.
- O app usa Supabase para autenticação, banco de dados e funções de backend.
- O app usa Render como hospedagem pública atual.
- A URL oficial é `https://redrise.onrender.com`.
- A navegação principal fica na Sidebar à esquerda.
- O título da tela atual fica na Topbar no topo.
- O conteúdo principal fica no centro, dentro do `main` do AppShell.
- A navegação atual é uma máquina de estados em React, não uma URL real por página.
- Máquina de estados significa que o app troca a tela exibida guardando um valor interno, como `dashboard`, `flow`, `tasks`, `agents`, `analytics` ou `settings`.

## Jornada Principal Do Usuário

- O usuário entra por AuthFlow.
- Após login, o usuário cai no Dashboard.
- O Dashboard é o hub para criar e revisar workspaces.
- Workspace é a unidade operacional principal.
- Flows representam processos visuais dentro do ambiente operacional.
- Tasks representam trabalho executável e acompanhável em board.
- Agents representam agentes de IA que ajudam na execução e automação.
- Analytics mostra sinais operacionais e métricas.
- Settings centraliza conta, segurança, integrações, membros, planos e auditoria.
- Fluxo resumido: AuthFlow -> Dashboard -> Workspace -> Flow/Tasks/Agents/Analytics/Settings.

## Fontes De Verdade

- Usuário logado: Supabase Auth.
- Perfil pessoal: tabela Supabase `profiles`.
- Sessões autenticadas e flag Remember Me: tabela Supabase `active_sessions`.
- Lista global de membros da equipe: tabela Supabase `team_members`.
- Workspaces: Supabase via `src/lib/workspaces.ts`.
- Flows: Supabase via `src/lib/flows.ts`.
- Tasks: Supabase via `src/lib/tasks.ts`.
- Agents: Supabase via `src/lib/agents.ts`.
- Preferência visual da Sidebar colapsada: `localStorage`.
- Não recriar `localStorage` para perfil, sessões ou membros; esses dados já usam Supabase.

## Estrutura Principal

- `src/App.tsx` carrega a sessão do Supabase.
- Se não houver usuário logado, `src/App.tsx` mostra `AuthFlow`.
- Se houver usuário logado, `src/App.tsx` carrega `profiles` e mostra `AppShell`.
- `AppShell` controla a navegação principal e as subvisões internas.
- `Sidebar` recebe o usuário atual e permite trocar entre Dashboard, Flow, Tasks, Agents, Analytics e Settings.
- `Topbar` mostra o título e, em algumas telas, o botão de ação principal.
- Cada página recebe dados e callbacks do `AppShell`; não deve buscar tudo sozinha se o dado já vem do shell.
- `AppFrame` é o painel visual externo com área arredondada e controle de viewport.
- `AppShell` é a estrutura autenticada com Sidebar, Topbar e área de conteúdo.
- Ao trocar de item na Sidebar, subestados internos são resetados para padrões seguros, como board ou list.

## Autenticação

- A tela de login e cadastro fica em `src/components/auth/auth-flow.tsx`.
- Sign in usa e-mail e senha via Supabase Auth.
- Remember Me não é mais condição para registrar metadados de sessão; ele marca a sessão como lembrada/confiável via campo `remembered`.
- Sign in registra metadados de sessão em `active_sessions`; o campo `remembered` indica se o usuário marcou Remember Me.
- Sign up usa First Name, Middle Name, Last Name, e-mail, senha e confirmação de senha como campos obrigatórios visualmente e via HTML `required`.
- Após criar conta, o app faz logout imediato e volta ao Sign In com o aviso `Account created. Sign in with the credentials you just created.`
- O cadastro não exige confirmação por e-mail no estado atual; `enable_confirmations=false` no Supabase Auth.
- Login/cadastro OAuth com GitHub, Google e Microsoft está arquivado até existirem Client IDs/secrets válidos no Supabase e nos provedores.
- O fluxo `/auth/callback` e o diálogo OAuth foram removidos da UI atual; reintroduzir apenas junto com credenciais oficiais.
- A tela inicial usa loading inteligente com delayed reveal de 200ms e mensagens curtas como `Verifying your session...`, `Loading your profile...` e `Preparing your workspace...`.
- Ao fazer login, `App.tsx` chama `loadUserProfile()` e `touchPresence()`.
- `touchPresence()` atualiza `last_seen_at` no perfil para ajudar a calcular status Online/Offline na equipe.

## Dashboard

- Dashboard é a tela padrão após login.
- O texto `Welcome to your workspace, {firstName}.` usa o primeiro nome vindo de `profiles.first_name`.
- Quando Settings > Personal Information salva um novo primeiro nome, o dashboard deve atualizar através do evento `redrise:profile-updated`.
- Dashboard mostra workspaces carregados por `useWorkspaces()`.
- Se não houver workspaces, mostra estado vazio com CTA para criar workspace.
- O botão `New Workspace` na Topbar aparece quando o usuário está em Dashboard na visão principal.
- Ao clicar em `New Workspace`, `AppShell` muda `dashboardView` para `create-workspace`.
- Ao criar workspace com sucesso, `AppShell` volta para a visão principal do Dashboard.
- Ao abrir um workspace, `AppShell` guarda `selectedWorkspaceId` e muda `dashboardView` para `review-workspace`.
- `ReviewWorkspacePage` recebe o workspace selecionado e pode voltar para o Dashboard.
- Deletar workspace chama `removeWorkspace()` vindo do hook de workspaces.
- `KpiCards`, `ChartTabs`, `OperationsGrid` e `ActivityFeed` aparecem no Dashboard como blocos de leitura operacional.
- `KpiCards` no Dashboard usa contagens vivas de workspaces, flows, tasks e agents carregadas pelo `AppShell`.
- `ChartTabs` no Dashboard recebe série derivada das tasks carregadas e não usa mais gráfico estático sem entrada.
- `OperationsGrid` no Dashboard calcula Staffing, Model Breakdown, Capacity Mix, Attention Queue, Alerts, Configuration Watch e Operational Indicators a partir de workspaces, flows, tasks e agents.
- `ActivityFeed` no Dashboard calcula Activity Feed, Alerts, Notifications, Change Log e Audit Trail a partir de workspaces, flows, tasks e agents.
- Os títulos dos blocos operacionais do Dashboard têm ícones à esquerda e usam chaves do provider de i18n.
- A migration 021 adiciona triggers que recalculam `workspaces.flows` e `workspaces.status` quando flows ou tasks são criados, atualizados ou removidos.
- A regra atual de status do workspace é: `maintenance` se houver flow/task com erro, `healthy` se houver flow/task sem erro, e `pending` se não houver trabalho ligado ao workspace.
- Os workspaces exibidos no Dashboard mostram identificação, missão, data e contagem de flows quando disponível.
- IDs visíveis ajudam suporte e auditoria a identificar registros rapidamente.

## Flow

- A aba Flow tem três visões internas: lista, criação e builder.
- A Topbar mostra `New Flow` quando o usuário está na lista de flows.
- Clicar em `New Flow` muda `flowView` para `create`.
- `CreateFlowPage` cria flow em duas etapas: Basic Info e Review.
- Em `CreateFlowPage`, o campo Workspace lista os workspaces atuais.
- Em `CreateFlowPage`, Team Members usa `useTeamMemberOptions()`.
- `useTeamMemberOptions()` lê a sessão atual do Supabase e chama `loadTeamMembers(user.id)`.
- Portanto, os membros selecionáveis em Flow vêm de Settings > Team Members.
- O picker de Team Members em Create Flow agora usa dropdown multi-select com `Select All` em vez de chips placeholder.
- Se Settings > Team Members muda, o hook carregará a lista atual na próxima montagem da tela.
- Não substituir essa fonte por lista fixa; isso quebraria a regra global de Member List.
- Ao finalizar criação de flow, `CreateFlowPage` chama `onCreate()` recebido do `AppShell`.
- `AppShell` chama `addFlow()` e volta para a lista se criar com sucesso.
- `FlowListPage` lista flows e permite busca por nome.
- `FlowListPage` mostra o nome do flow, membros associados e ID.
- O botão de abrir flow com ícone externo chama `onOpen(id)` e leva para `FlowBuilderPage`.
- O botão de lápis em FlowListPage persiste renomeação via `updateFlow()` em `src/lib/flows.ts`.
- O dropdown com ícone de usuários em FlowListPage usa `useTeamMemberOptions()` e persiste responsáveis do flow via `updateFlow()`.
- O botão de lixeira abre confirmação de delete.
- Delete Flow exige digitar `DELETE`; isso evita exclusão acidental.
- `FlowPipeline` à direita mostra os cards reais salvos em `flow_cards` para o flow selecionado na lista.
- Ao selecionar um flow em `FlowListPage`, a tela chama `loadFlowCards(flowId)` e exibe loading até os cards chegarem.
- Se o flow selecionado não tiver cards salvos, o bloco mostra mensagem de vazio traduzida.
- `FlowPipeline` tem checkboxes quadrados, seleção geral e controles visuais de play, pause e reset.
- O flow selecionado na lista usa borda vermelha forte `#8F1D1D` com ring no mesmo tom.
- `FlowBuilderPage` é a tela de edição visual do flow.
- `FlowBuilderPage` passou a carregar agentes reais via `loadAgents()` para o editor de cards, substituindo a lista placeholder anterior.
- O editor de cards do Flow Builder não permite mais selecionar membros por card; responsáveis ficam no Flow List/board no nível do flow.
- O botão voltar em `FlowBuilderPage` retorna para a lista.
- O botão salvar em `FlowBuilderPage` retorna para a lista conforme callback do `AppShell`.
- `FlowBuilderPage` usa `@xyflow/react`, também conhecido como React Flow, para canvas visual.
- `@xyflow/react` é a biblioteca que permite arrastar nós, conectar linhas e navegar no canvas de fluxo.
- Cards do Flow Builder devem preservar título, membros, agentes e ID visível.
- Atalhos do Flow Builder, quando ativos, devem continuar previsíveis: criar, selecionar, copiar, colar, desfazer e refazer.

## Tasks

- A aba Tasks tem visão de board, criação e review.
- A Topbar mostra `New Task` quando o usuário está no board de tasks.
- Clicar em `New Task` muda `taskView` para `create`.
- `CreateTaskPage` tem três etapas: Briefing, Team & Agent, Review.
- Na etapa Briefing, Objective e Prompt são obrigatórios visualmente.
- A área Documents aceita arrastar arquivos ou escolher arquivos; atualmente guarda nomes de arquivos no estado da tela.
- Remover documento tira o nome da lista local antes da criação.
- Na etapa Team & Agent, Workspace é obrigatório e Flow é opcional.
- Workspace em New Task usa `useWorkspaces()` e persiste em `tasks.workspace_id`.
- Flow em New Task usa `useFlows()` filtrado pelo workspace selecionado e persiste em `tasks.flow_id` quando informado.
- Na etapa Team & Agent, o dropdown de membros usa `useTeamMemberOptions()`.
- Portanto, membros atribuíveis a tasks vêm de Settings > Team Members.
- O dropdown de Agents carrega agents por `loadAgents()`.
- Create Task agora traduz os textos da tela pelo provider de i18n e usa dropdown multi-select com `Select All` para Team Members.
- Priority usa os valores Min, Med e High mapeados para low, medium e high.
- Kanban Column escolhe a coluna inicial: Backlog, In Progress, In Review ou Done.
- Recurrence escolhe recorrência: Occasionally, Daily, Weekly ou Monthly.
- Week days e month days guardam dias recorrentes no estado da task.
- Ao finalizar, `CreateTaskPage` chama `onCreate()` recebido do `AppShell`.
- `AppShell` chama `addTask()` e volta para o board se criar com sucesso.
- `TaskBoardPage` recebe tasks e agents carregados pelo `AppShell`.
- Mover card no board chama `moveTask()`.
- Deletar task chama `removeTask()`.
- `ReviewTaskPage` existe como visão futura de revisão, mas o fluxo atual do board precisa ser verificado antes de assumir persistência completa nessa tela.
- Task Board é um board estilo Kanban.
- Kanban significa organizar trabalho em colunas por status.
- As colunas principais são Backlog, In Progress, In Review e Done.
- Drag and drop move tasks entre colunas e deve persistir a mudança de status quando conectado ao hook atual.
- Cada task deve manter ID visível ou rastreável para suporte e auditoria.

## Agents

- A aba Agents tem lista, criação e detalhe.
- A Topbar mostra `New Agent` quando o usuário está na lista de agents.
- Clicar em `New Agent` muda `agentView` para `create`.
- `AgentListPage` recebe agents do hook `useAgents()`.
- Ao abrir agent, `AppShell` guarda `selectedAgentId` e muda para detalhe.
- Ao deletar agent, `AgentListPage` chama `removeAgent()` recebido do `AppShell`.
- `AgentCreatePage` chama `addAgent()` recebido do `AppShell`.
- Se criar com sucesso, volta para a lista.
- `AgentDetailPage` recebe `agentId` e callback de voltar.
- Existe trigger legado no Supabase para criar um Default Agent ao criar usuário; ele foi endurecido pela migration 018.
- Agent Detail pode reutilizar blocos compartilhados como SessionsList, ApiKeysManager e ChangePassword quando o contexto exigir.
- Ações de pausa/restart de agente não devem ser tratadas como reais sem integração backend explícita.
- OpenRouter aparece no histórico técnico como provedor planejado/usado para IA; qualquer chave de IA deve ficar fora do frontend.

## Analytics

- A aba Analytics mostra cards, gráficos e indicadores operacionais.
- `ChartTabs` usa SVG simples, não Recharts.
- Recharts foi removido do uso do app e da dependência do projeto.
- Os gráficos atuais são visuais operacionais e devem ser tratados como placeholders até conectarem em métricas reais.
- `KpiCards`, `ChartTabs`, `OperationsGrid` e `ActivityFeed` compõem blocos de leitura.
- Não conectar pagamentos, planos ou permissões em Analytics sem antes definir quais métricas mudam por plano.
- Analytics existe para tornar a operação observável.
- Observabilidade significa conseguir entender volume, erro, latência, uso, gargalos e atividade recente.

## Settings

- Settings começa com uma grade de atalhos.
- Cada atalho muda o estado interno `active` em `SettingsPage`.
- Quando `active` está preenchido, Settings mostra uma tela de detalhe com botão Back no topo.
- O botão Back volta para a grade de atalhos.
- Atualmente os submenus são Personal Information, Change Password, Active Sessions, API Keys, Integrations, Members List, Team List e Audit Log.
- O submenu Plans aparece como `Under Construction` fora do ambiente de desenvolvimento e fica desabilitado em produção.

## Settings > Personal Information

- A tela fica em `AccountBasicInfoPage`.
- Ela carrega o perfil com `loadUserProfile()`.
- Ela salva com `saveUserProfile()`.
- O perfil salvo atualiza a tabela Supabase `profiles`.
- Após salvar, `saveUserProfile()` emite o evento `redrise:profile-updated`.
- `App.tsx` escuta esse evento e atualiza o usuário exibido na Sidebar e no Dashboard.
- O campo First Name alimenta o cumprimento do Dashboard.
- O campo Username alimenta o nome visível na Sidebar.
- O campo Email alimenta a Sidebar e a identificação do perfil.
- Avatar, quando definido, alimenta a Sidebar e Member List para o próprio usuário.
- Language altera o idioma via provider de i18n quando o perfil é salvo.
- O idioma autenticado deve vir de `profiles.language`, carregado por `App.tsx` e passado para `I18nProvider`; `localStorage` não deve ser a fonte de verdade do idioma.
- Update 2.0 iniciou a migração de textos literais para i18n; não promover produção enquanto restarem textos autenticados fora do provider nas telas listadas em `updates/update2.0.md`.
- Location é um seletor de país, não cidade livre.
- Location agora tem busca/autocomplete por nome do país antes da seleção final.
- Timezone é preenchido automaticamente conforme o país selecionado e fica desabilitado.
- Phone é salvo no perfil.
- O carregamento remoto não deve sobrescrever campos já editados antes de salvar; isso é protegido por `dirtyRef`.
- Username e Email Address são campos somente leitura na UI de Personal Information.
- A tela de Personal Information segura o primeiro paint até o perfil remoto chegar para evitar flicker de valores intermediários como username/first name e timezone.

## Settings > Change Password

- `ChangePassword` é um bloco de UI para troca de senha.
- O texto com mojibake foi corrigido e não deve voltar.
- A seção de boas práticas de segurança usa cores definidas pela identidade visual.
- Antes de conectar troca real de senha, usar Supabase Auth update password e validar sessão ativa.

## Settings > Active Sessions

- `SessionsList` lê `active_sessions` pelo `userId` atual.
- A tela mostra sessões autenticadas registradas em `active_sessions`, com badge `Remembered` quando aplicável.
- A sessão atual é identificada por `supabase_session_id` extraído do JWT do Supabase.
- Se linhas antigas não tiverem `supabase_session_id`, a UI usa `current=true` ou a sessão mais recente como fallback.
- Cada sessão mostra browser, OS, país/localização, IP mascarado e última atividade conhecida.
- O botão `Refresh` refaz a busca manualmente.
- Sessões remotas têm botão `Revoke` com `AlertDialog` de confirmação.
- Revogar sessão atual não é permitido por essa UI.

## Settings > API Keys

- `ApiKeysManager` existe como bloco de configuração.
- Antes de salvar chaves reais, garantir que segredo nunca fique exposto no frontend.
- Para chaves sensíveis, o ideal é backend/Edge Function e armazenamento seguro no Supabase.
- Não salvar chaves secretas em `localStorage`.

## Settings > Integrations

- `IntegrationSetupWizard` é o fluxo visual de integração.
- Ele possui etapas de configuração e campos como endpoint.
- Antes de ativar integração real, validar URL, autenticação e permissões por plano.
- Integrações futuras devem respeitar o plano ativo do usuário ou equipe.

## Settings > Team Members

- A tela usa `TeamMembersView`, que junta `MemberListTable` e `AddMemberModal`.
- `MemberListTable` carrega membros com `loadTeamMembers(user.id)`.
- Isso significa que a lista visível é filtrada pelo dono da equipe ativa: `owner_user_id = user.id`.
- A tabela mostra Name, Function, Status, Team e Joined.
- Search filtra por nome, e-mail, função e time.
- A paginação mostra 7 membros por página.
- A tabela recarrega automaticamente a cada 30 segundos.
- O botão `Add Member` abre `AddMemberModal`.
- `AddMemberModal` pede e-mail, Role/Cargo obrigatório e equipe inicial opcional.
- Em Settings, o campo antes chamado `Function` para membros agora aparece como `Role` / `Cargo`.
- A lista oficial de cargos é `Owner`, `Board`, `Staff`, `Member` e `Viewer`.
- Em PT-BR, os cargos aparecem como `Sócio`, `Diretor`, `Equipe`, `Membro` e `Visualizador`.
- Os valores persistidos de cargo continuam em inglês para manter consistência técnica e tradução apenas na UI.
- Ao enviar, `addTeamMember()` chama a Edge Function `invite-member`.
- A Edge Function persiste a linha em `team_members` antes de tentar enviar e-mail.
- Role/Cargo do convite usa a mesma lista oficial de cargos e persiste em `team_members.function`; a permissão técnica enviada para a Edge Function é derivada desse cargo.
- O campo Function/Função por associação não aparece em `AddMemberModal`; ele deve ser preenchido em Settings > Team List dentro da equipe.
- Team no `AddMemberModal` é um dropdown padrão do app carregado por `loadTeams(user.id)` com as equipes formais criadas atualmente; quando selecionado, salva o nome da equipe em `team_members.team` como referência inicial.
- Se o Supabase limitar envio de e-mail, o convite ainda aparece na lista como `Invited`.
- Quando um convidado cria conta com o mesmo e-mail, o trigger de signup conecta a linha convidada ao novo `member_user_id`.
- Status `Invited` vem de `team_members.status = invited`.
- Status `Online` é calculado se o perfil do membro teve `last_seen_at` nos últimos 2 minutos.
- Status `Offline` aparece quando não está convidado e não está online.
- Members List não possui mais botão de edição; ela é apenas lista geral de membros e entrada para convite.
- A edição de Team e Function de membros existentes foi movida para Settings > Team List.
- Não duplicar lista de membros em outras telas; use `loadTeamMembers()` ou `useTeamMemberOptions()`.

## Settings > Team List

- A tela usa `TeamListTable`.
- `TeamListTable` carrega membros com `loadTeamMembers(user.id)` e equipes formais com `loadTeams(user.id)`.
- Ao abrir Team List, a tela mostra uma tabela de equipes semelhante à Members List.
- O wizard de criação abre apenas pelo botão `New Team` / `Nova Equipe` e troca a área de Team List para uma tela dedicada, no mesmo padrão dos fluxos `New ...`.
- As etapas do wizard aparecem como `Team identity` / `Identidade da equipe`, `Members and functions` / `Membros e funções`, e Review/Revisão.
- Criar equipe é um wizard de 3 etapas: Nome da Equipe e Descrição, Selecionar Membros existentes com Function livre por membro, Revisão.
- Nome da Equipe é obrigatório; Descrição é opcional.
- Selecionar membros na criação é opcional, então é possível criar uma equipe vazia.
- Na etapa 2, cada membro disponível aparece em linha com checkbox, identificação e campo `Function` / `Função`.
- O campo `Function` na etapa 2 é texto livre, obrigatório apenas quando o respectivo membro está selecionado, e fica desabilitado quando o membro não está selecionado.
- O limite atual é 7 equipes por owner, validado na UI e por trigger no Supabase.
- Ao finalizar com `Create Team`, a UI cria registro em `teams`, cria assignments opcionais em `team_assignments`, recarrega a lista e volta para Team List; se o insert falhar, mostra erro traduzido.
- O mesmo membro pode participar de várias equipes porque a associação fica em `team_assignments`, não no campo único `team_members.team`.
- Clicar no nome/card da equipe abre o detalhe da equipe com lista de membros e funções daquela equipe.
- O botão `Add Team Member` no detalhe abre uma tela/modal com membros cadastrados atualmente que ainda não fazem parte daquela equipe.
- Ao adicionar membro à equipe, a UI cria ou atualiza registros em `team_assignments` com a função livre escolhida para aquela equipe.
- A função de um membro dentro de uma equipe é texto livre e pode ser ajustada no detalhe da equipe sem alterar necessariamente a função dele em outras equipes.

## Como A Member List Alimenta Outros Menus

- Settings > Members List usa `team_members` como cadastro geral de membros.
- Settings > Team List usa `teams` para equipes e `team_assignments` para membros/funções dentro de cada equipe.
- Flow > New Flow > Team Members lê essa lista via `useTeamMemberOptions()`.
- Flow > Flow List > dropdown de usuários lê essa lista via `useTeamMemberOptions()`.
- Flow > Flow Builder lê essa lista via `useTeamMemberOptions()`.
- Tasks > New Task > Team Members lê essa lista via `useTeamMemberOptions()`.
- Qualquer novo dropdown de membros deve usar a mesma fonte.
- Se um membro é removido futuramente, as telas que mostram atribuições antigas precisam decidir se mantêm texto histórico ou limpam atribuições.
- Essa decisão ainda está `[PENDENTE]`.

## Settings > Audit Log

- `AuditLogCard` existe como bloco visual.
- Antes de conectar auditoria real, definir quais eventos são gravados: login, convite, alteração de perfil, mudança de plano, criação/deleção de workspace, flow, task e agent.
- Auditoria deve ser append-only: agentes não devem editar logs antigos sem regra explícita.
- Append-only significa que logs novos são adicionados, mas logs antigos não são alterados silenciosamente.

## Blocos Compartilhados

- `DROPDOWN_TRIGGER_CLASSES` é a constante em `src/lib/styles.ts` que define as classes padrão para todos os triggers de dropdown do app.
- Tanto `SelectTrigger` (Radix Select) quanto `MultiSelectDropdown` (Button + DropdownMenu) usam essa constante.
- Ao criar um novo dropdown, importar `DROPDOWN_TRIGGER_CLASSES` de `@/lib/styles` e aplicar no trigger.
- Quando o trigger for um `Button`, usar `variant="outline"` junto com a constante para que o hover do CVA alinhe com `hover:bg-accent hover:text-accent-foreground`.
- A constante garante: mesma cor de fundo, borda, padding, fonte, sombra, hover laranja com texto claro, focus ring, transição e estado disabled em todos os dropdowns.
- `RequiredLabel` em `src/components/ui/required-label.tsx` é o componente padrão para rótulos de campos obrigatórios.
- Todo campo obrigatório deve usar `RequiredLabel` em vez de criar asterisco/classe manual.
- `RequiredLabel` usa o mesmo padrão visual dos wizards operacionais: texto e asterisco em `#A04D1F`.
- Atualmente `RequiredLabel` é usado em Sign In, Sign Up, New Workspace, New Flow, New Task, Integrations, Add Member e Team List.
- `WizardShell` em `src/components/blocks/shared/wizard-shell.tsx` é o shell compartilhado para wizards dedicados com título, progresso, card de etapa e rodapé de ações.
- Todos os wizards dedicados atuais devem usar `WizardShell` em vez de recriar header, progress, card e footer localmente; os campos, validações e parâmetros de cada wizard continuam dentro de cada componente específico.
- `WizardShell` é usado por New Workspace, New Flow, New Task, New Agent, Settings > Integrations e Settings > Team List > New Team.
- `KpiCards` é usado em Dashboard e Analytics para métricas com sparkline.
- Sparkline é um gráfico pequeno, usado para mostrar tendência rapidamente.
- `ChartTabs` é usado em Dashboard e Analytics para alternar gráficos por tema.
- `OperationsGrid` é usado no Dashboard para detalhes operacionais.
- `ActivityFeed` é usado no Dashboard para atividade recente.
- `OnboardingEmpty` é usado no Dashboard para listar workspaces e guiar criação inicial.
- `FlowPipeline` é usado na Flow List para listar os cards reais do flow selecionado.
- `SessionsList` é usado em Settings e pode ser reutilizado em Agent Detail.
- `ApiKeysManager` é usado em Settings e pode ser reutilizado em Agent Detail.
- `ChangePassword` é usado em Settings e pode ser reutilizado em Agent Detail.
- `MemberListTable` é usado em Settings > Team Members.
- `AddMemberModal` é usado para convidar membros.
- `IntegrationSetupWizard` é usado em Settings > Integrations.
- `PaginationFooter` é usado na tabela de membros.
- `CommandPalette`, `TeamPermissionsMatrix`, `AvatarUpload` e filtros compartilhados existem como blocos auxiliares; antes de expor no produto, verificar se estão conectados ao fluxo atual.

## Sidebar

- Sidebar contém logo, navegação principal, bloco contextual e rodapé de perfil.
- O estado colapsado é persistido em `localStorage`.
- O colapso deve ser idempotente: clicar várias vezes deve sempre refletir o estado final correto.
- Tooltips da Sidebar só aparecem em hover após delay; não reintroduzir tooltip em foco automático.
- O rodapé usa dados do perfil carregado em `App.tsx`.
- O botão Sign out chama `supabase.auth.signOut()` pelo callback do `AppShell`.

## Topbar

- Topbar mostra título e subtítulo com base na aba ativa.
- Dashboard, Flow, Tasks e Agents podem mostrar botão de criação conforme a visão interna.
- Settings e Analytics não têm CTA na Topbar atualmente.
- Se adicionar Plans, não colocar CTA global na Topbar sem regra de produto explícita.

## Mapa De Navegação

- AuthFlow alterna entre sign-in e sign-up.
- Sign-up confirmado leva o usuário a autenticar antes de acessar o app.
- AppShell contém Dashboard, Flow, Tasks, Agents, Analytics e Settings.
- Dashboard board pode abrir ReviewWorkspace ou CreateWorkspace.
- Flow list pode abrir CreateFlow ou FlowBuilder.
- Tasks board pode abrir CreateTask ou ReviewTask.
- Agents list pode abrir AgentCreate ou AgentDetail.
- Analytics é uma tela de leitura.
- Settings abre submenus internos com botão Back.
- Settings > Personal Information pode abrir Settings > Plans via botão Details do aviso de acesso.
- Settings > Team Members pode abrir AddMemberModal.

## Banco Supabase Atual

- `profiles`: guarda informações pessoais do usuário.
- `profiles.middle_name`: guarda o Middle Name opcional do cadastro e Settings.
- `active_sessions`: guarda sessões autenticadas, metadados do device, flag `remembered`, `supabase_session_id`, última atividade e revogação.
- `team_members`: guarda relação entre dono da equipe, usuário membro, e-mail convidado, papel, função, time e status.
- `teams`: guarda equipes formais criadas em Settings > Team List, com nome, descrição e limite de 7 por owner.
- `team_assignments`: guarda quais membros estão em quais equipes e qual função livre exercem naquela equipe; permite o mesmo membro em múltiplas equipes.
- As migrations `020`, `021` e `022` foram aplicadas no Supabase remoto `vsaropewydcjsvplpugx` via `supabase db push` após confirmação por `supabase migration list`.
- A migration `023` também foi aplicada no Supabase remoto `vsaropewydcjsvplpugx` via `supabase db push` e adiciona `tasks.flow_id`.
- `workspaces`: guarda workspaces do usuário.
- `workspaces.flows` e `workspaces.status` são recalculados pelos triggers da migration 021 quando flows/tasks mudam.
- `flows`: guarda flows associados a workspace.
- `tasks`: guarda tasks.
- `tasks.flow_id`: vincula uma task opcionalmente a um flow; foi adicionado pela migration 023.
- `agents`: guarda agents.
- Triggers de criação de usuário criam perfil, linha de owner em team_members e Default Agent.
- As migrations 017 e 018 endurecem triggers com `public.` e `search_path` para evitar falha no Auth API.
- `workspace_members`, `audit_logs`, `integrations`, `api_keys`, `task_executions`, `flow_cards` e `flow_edges` aparecem no histórico de migrations e devem ser revisados antes de alterações nesses domínios.
- Service role key nunca deve receber prefixo `VITE_` porque variáveis `VITE_` ficam expostas no frontend.
- `VITE_SUPABASE_URL` e `VITE_SUPABASE_ANON_KEY` podem ser usados no frontend porque são públicos por design do Supabase.

## Edge Function invite-member

- Recebe e-mail e role.
- Verifica o usuário logado pelo token enviado pelo frontend.
- Persiste ou atualiza a linha em `team_members`.
- Tenta enviar convite via Supabase Auth.
- Retorna `ok: true` quando a linha foi persistida.
- Retorna `emailSent: false` e `emailError` quando o e-mail não saiu, por exemplo por rate limit.
- A UI atual fecha o modal se `ok: true`, mesmo que `emailSent` seja falso.
- Se for importante avisar o usuário sobre e-mail não enviado, criar aviso futuro sem impedir a criação da linha.

## Settings > Plans

- O submenu `Plans` existe em Settings, mas fica acionável apenas em ambiente de desenvolvimento local (`import.meta.env.DEV`).
- Em produção, o atalho Plans aparece como `Under Construction` e o botão fica desabilitado.
- O botão `Details` do aviso de acesso em Personal Information só abre Plans quando Plans está habilitado no ambiente.
- Enquanto Plans estiver desabilitado, o usuário não acessa a página de planos em produção.
- O submenu aparece na grade de atalhos de Settings.
- O submenu tem três colunas: Free, Business e Corporate.
- Cada coluna destaca vantagens, limites e recursos com placeholders.
- Free mostra estado de plano atual placeholder.
- Business tem CTA `Join Now`.
- Corporate tem CTA `Join Now`.
- O CTA de Business e Corporate ainda não inicia checkout real; ele mostra mensagem de placeholder até Stripe ser configurado.
- Stripe é a plataforma de pagamento; checkout é a página segura de pagamento.
- O checkout deve ser iniciado pelo backend, não diretamente só pelo frontend.
- Backend recomendado: Supabase Edge Function para criar sessão de checkout Stripe.
- Após pagamento aprovado, Stripe deve chamar webhook backend.
- Webhook é uma chamada automática da Stripe para informar que o pagamento foi concluído.
- O webhook deve atualizar no Supabase o plano ativo do usuário ou da equipe.
- Ao voltar para o app depois do pagamento, a UI deve detectar sucesso e mostrar aviso.
- Aviso planejado: `Restart the app for the new features to take effect.`
- Abaixo do aviso existe botão `Restart Now`.
- Ao clicar em `Restart Now`, o app recarrega na origem atual.
- Após reiniciar, o app deve mostrar recursos conforme o plano pago.
- O plano deve ser armazenado no Supabase, não apenas no frontend.
- A UI deve evitar liberar recurso pago só por estado local.
- A tabela futura sugerida é `subscriptions` ou `billing_accounts`; nome final `[PENDENTE]`.

## Planejado: Conteúdo Dos Planos

- Free deve servir para teste inicial e uso limitado.
- Business deve liberar recursos profissionais de operação.
- Corporate deve liberar controles avançados, segurança e escala.
- Recursos a detalhar por plano: número de workspaces, número de membros, número de flows, número de tasks, número de agents, integrações, auditoria, suporte e analytics.
- A matriz exata de limites ainda está `[PENDENTE]`.
- Não implementar bloqueio de recurso sem matriz aprovada.

## Planejado: OAuth E E-mail De Confirmação

- Reativar GitHub, Google e Microsoft/Azure no Sign In/Sign Up somente depois de configurar Client ID e Client Secret oficiais em Supabase Authentication > Providers.
- Callback autorizado nos provedores deve apontar para o callback do novo projeto Supabase: `https://[NOVO_PROJECT_REF].supabase.co/auth/v1/callback`.
- Redirects do app devem incluir `http://localhost:5173/auth/callback`, `http://127.0.0.1:5173/auth/callback` e o callback do novo domínio quando OAuth voltar.
- Reativar confirmação de e-mail somente depois de configurar remetente oficial, SMTP/template e política de reenvio.

## Aviso De Acesso Em Personal Information

- Settings > Personal Information mostra aviso indicando o acesso ativo: Admin, Member ou Viewer.
- O texto é clicável.
- Ao clicar, aparece aviso flutuante explicando o que esse acesso permite.
- O aviso flutuante contém botão `Details`.
- Clicar em `Details` leva para Settings > Plans.
- Settings > Plans deve detalhar o que cada acesso pode fazer em cada plano.
- O papel deve vir de `team_members.role` da equipe ativa.
- Se o usuário é dono da própria equipe, o papel técnico `owner` aparece como Admin na UI.
- Viewer está escrito errado na solicitação como Viewver; no código e produto deve ser `Viewer`.
- Não confiar apenas no aviso visual para permissões; ações sensíveis também precisam ser protegidas por RLS/backend.

## Planejado: Mecanismo De Equipe E Convites

- Member List deve mostrar apenas membros da equipe da conta ativa.
- A equipe ativa hoje é representada por linhas de `team_members` onde `owner_user_id` é o usuário logado.
- Futuramente, o ideal é criar uma entidade explícita de equipe ou workspace organizacional; decisão `[PENDENTE]`.
- Cenário 1: convidar e-mail que ainda não tem conta.
- Nesse cenário, Add Member cria linha `invited` com e-mail e role selecionado.
- Quando a pessoa criar conta com o mesmo e-mail, o trigger conecta o usuário à linha convidada.
- A pessoa deve entrar já fazendo parte daquele grupo e com o nível de acesso escolhido no convite.
- Cenário 2: adicionar pessoa que já criou conta pelo caminho normal.
- Nesse cenário, `invite-member` procura conta existente por e-mail exato no backend.
- A busca procura em `profiles.email` usando service role dentro da Edge Function.
- Não expor busca aberta de todos os usuários sem controle; isso pode vazar e-mails.
- Se encontrar usuário existente, a função cria ou atualiza linha em `team_members` com `member_user_id` preenchido.
- Ao convidar usuário existente, o status atual fica `active`.
- Se for exigir aceite do usuário existente, status deve ficar `invited` até aceitar.
- Se o produto exigir consentimento no futuro, alterar esse status e adicionar aceite explícito.
- Quando o membro for adicionado por busca de e-mail existente, o nível de acesso deve ser configurado manualmente na UI.
- O papel manual deve aceitar Admin, Member ou Viewer.
- A UI de edição de membro deve passar a expor role se esse fluxo for implementado.
- A lista de membros não deve misturar membros de equipes diferentes.
- Dropdowns de Flow e Tasks devem continuar recebendo apenas a equipe ativa.
- Convites duplicados para o mesmo e-mail e owner devem atualizar linha existente, não criar duplicata.
- Quando um membro aceitar convite, atualizar `member_user_id`, `status`, `joined_at` e `updated_at`.

## Solução Moderna Para Riscos Ao Alterar

- Usar contratos finos por domínio: perfil em `user-profile`, membros em `team-members`, billing futuro em biblioteca própria.
- Não deixar telas buscarem dados críticos por caminhos alternativos quando já existe fonte única.
- Tratar Plans como leitura/checkout até webhook confirmar pagamento no backend.
- Tratar aviso de acesso como informativo até existir matriz de permissões validada em backend/RLS.
- Fazer busca de usuários existentes apenas por e-mail exato em Edge Function autenticada.
- Manter dropdowns de membros acoplados a `useTeamMemberOptions()`.
- Criar testes E2E para cada ligação nova entre menus antes de deploy.

## Regras De Permissão Futuras

- Admin pode gerenciar membros, flows, tasks e agentes conforme plano.
- Member pode criar e operar itens permitidos conforme plano.
- Viewer deve ver dados permitidos, mas não editar itens sensíveis.
- Owner representa dono técnico da equipe atual.
- A matriz exata por plano e papel ainda está `[PENDENTE]`.
- Não implementar bloqueios parciais sem matriz aprovada, pois pode travar fluxos existentes.

## Riscos Ao Alterar

- Alterar `team_members` pode quebrar dropdowns de Flow e Tasks.
- Alterar `profiles` pode quebrar Dashboard, Sidebar e Member List.
- Alterar Auth triggers pode quebrar signup.
- Alterar `invite-member` pode quebrar convites por e-mail e linhas convidadas.
- Alterar `AppShell` pode quebrar navegação de todas as abas.
- Alterar Settings sem manter o botão Back pode prender o usuário no detalhe.
- Alterar idioma sem atualizar `i18n.ts` pode criar textos misturados.
- Alterar dados de plano apenas no frontend pode liberar recursos pagos indevidamente.

## Checklist Para Agentes Antes De Editar

- Identifique se a mudança é comportamento atual ou planejamento futuro.
- Verifique se a tela usa dados do `AppShell`, hook próprio ou Supabase direto.
- Se mexer em membros, preserve `loadTeamMembers()` e `useTeamMemberOptions()` como fonte principal.
- Se mexer em perfil, preserve evento `redrise:profile-updated`.
- Se mexer em sessões, preserve `supabase_session_id` como fonte da sessão atual e `remembered` como flag de acesso lembrado.
- Se mexer no Sign Up, preserve a supressão da sessão automática do Supabase para evitar flash do Dashboard antes do Sign In explícito.
- Se mexer em planos, não implemente pagamento sem backend e webhook.
- Se mexer em permissões, não dependa apenas da UI.
- Rode validação adequada após mudanças: lint, typecheck, test, build e E2E quando afetar fluxo visual.

## MCP Redrise Ops

- O projeto possui MCP próprio chamado `redrise-ops`.
- O servidor fica em `scripts/mcp/redrise-ops.mjs`.
- A documentação fica em `docs/REDRISE_OPS_MCP.md`.
- O comando para iniciar é `corepack yarn mcp:redrise-ops`.
- O MCP encapsula operações seguras para validação, build, deploy de Edge Function Supabase, status Supabase, status graphify e notas de memória.
- O MCP não substitui Supabase CLI; ele chama a CLI com caminhos allowlistados.
- O MCP não executa comandos shell arbitrários.
- O deploy frontend é feito pela Render a partir do GitHub usando `render.yaml`.

## Infraestrutura, Deploy E Qualidade

- Produção oficial atual: `https://redrise.onrender.com`.
- O frontend é uma SPA estática.
- SPA significa Single Page Application: o navegador carrega um app único e o React troca as telas internamente.
- Deploy frontend normal deve usar Render conectado a `https://github.com/correnthgroup/redrise.git`.
- O serviço Render é `redrise` (`srv-d8rjudj6sc1c73bc9fu0`) e possui rewrite `/*` para `/index.html` para suportar rotas SPA.
- Supabase project ref atual: `vsaropewydcjsvplpugx`.
- Validação mínima para mudança relevante: `corepack yarn lint`, `corepack yarn typecheck`, `corepack yarn test`, `corepack yarn build`.
- Validação para mudança de fluxo visual: também rodar `corepack yarn test:e2e`.
- Testes unitários usam Vitest.
- Testes E2E usam Playwright.
- O setup autenticado do Playwright cria uma conta nova via Sign Up e depois faz Sign In, evitando dependência de senha fixa para usuário compartilhado.
- A suíte E2E agora é modular por projeto Playwright e por domínio/menu: `auth-public`, `auth-session`, `navigation`, `dashboard`, `flow`, `tasks`, `agents`, `analytics`, `workspaces` e `settings`.
- `tests/support/app.ts` centraliza abertura autenticada, reset de estado visual da Sidebar e navegação modular.
- Cada menu principal possui pelo menos um marcador estável de página via `data-testid`: `dashboard-page`, `flow-list-page`, `task-board-page`, `agent-list-page`, `analytics-page`, `settings-page`.
- CTAs principais da Topbar também possuem `data-testid`: `dashboard-new-workspace`, `flow-new-flow`, `tasks-new-task`, `agents-new-agent`.
- O CI roda E2E em matriz por módulo para reduzir interferência entre fluxos, facilitar diagnóstico e evitar que uma falha de menu esconda o estado dos demais menus.

## Graphify Local

- O grafo detalhado do app fica em `graphify-out/` dentro deste repositório.
- Artefatos consultáveis versionáveis: `graphify-out/GRAPH_REPORT.md`, `graphify-out/graph.json` e `graphify-out/graph.html`.
- Caches, backups datados, manifestos internos e arquivos `.graphify_*` ficam locais e não devem ser tratados como documentação canônica.
- A última atualização estrutural foi feita com `C:\Python314\python.exe -m graphify update . --force`.
- Resultado da última atualização estrutural limpa: 1012 nós, 1199 relações e 142 comunidades.
- A atualização estrutural cobriu código; reextração semântica de docs/memória segue pendente até existir `GEMINI_API_KEY` ou `GOOGLE_API_KEY` no ambiente.
- A extração semântica completa depende de chave LLM no ambiente; sem chave, o grafo estrutural AST continua válido para navegação técnica e relações de código.
- A matriz em `D:\graphify\repos\redrise\` mantém apenas catálogo macro e deve apontar para este grafo local quando for necessário investigar detalhes.

## Convenções De IDs

- IDs curtos ajudam depuração visual, suporte e auditoria.
- Workspaces usam prefixo `w`.
- Flows usam prefixo `f`.
- Tasks usam prefixo `t`.
- Cards usam prefixo `c`.
- Edges usam prefixo `e`.
- Agents usam prefixo `a`.
- Executions usam prefixo `x`.
- Integrations usam prefixo `ig`.
- API keys usam prefixo `ak`.
- Audit logs usam prefixo `al`.
- Workspace members usam prefixo `wm`.
- Antes de mudar formato de ID, verificar migrations, testes, UI, logs e dados já persistidos.

## Organização De Arquivos Na Raiz

- Arquivos essenciais de ferramenta devem ficar soltos na raiz quando a ferramenta espera esse local.
- Exemplos essenciais: `package.json`, `yarn.lock`, `index.html`, `vite.config.ts`, `vitest.config.ts`, `playwright.config.ts`, `eslint.config.js`, `tsconfig*.json`, `components.json`, `render.yaml`, `.env`, `.env.example`, `.gitignore`, `README.md`, `AGENTS.md`.
- Documentos operacionais atuais devem ficar em `docs/` ou `memory/`.
- Atualizações de produto atuais ou futuras devem ficar em `updates/`.
- Scripts utilitários devem ficar em `scripts/`.
- Não mover `src`, `public`, `supabase`, `tests`, `memory`, `docs`, `scripts`, `updates`, `.github` ou `render.yaml` sem revisar deploy, testes e CLIs.
