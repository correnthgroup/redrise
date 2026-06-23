# Graph Report - .  (2026-06-22)

## Corpus Check
- 134 files · ~51,682 words
- Verdict: corpus is large enough that graph structure adds value.

## Summary
- 671 nodes · 880 edges · 103 communities (86 shown, 17 thin omitted)
- Extraction: 87% EXTRACTED · 13% INFERRED · 0% AMBIGUOUS · INFERRED: 115 edges (avg confidence: 0.8)
- Token cost: 0 input · 0 output

## CLI Usage (Current Directory)

This graph was generated from `D:\studio\redrise`. To use graphify CLI from this directory:

```powershell
# Ensure graphify is installed
pip install graphifyy

# Verify installation
graphify --help

# Query the graph (natural language)
graphify query "How does authentication work?"
graphify query "What calls loadUserProfile()?"
graphify query "Trace the data flow through tasks"

# Find shortest path between concepts
graphify path "AuthModule" "Database"

# Explain a specific node
graphify explain "WizardShell"

# Rebuild graph (full)
graphify .

# Incremental update (only new/changed files)
graphify . --update

# Re-cluster only (no re-extraction)
graphify . --cluster-only

# Export formats
graphify export html          # interactive HTML (already generated)
graphify export obsidian      # Obsidian vault
graphify export graphml       # Gephi/yEd
graphify export neo4j         # Cypher for Neo4j
```

### Python Interpreter (if graphify CLI is not on PATH)

```powershell
# Find the Python that has graphify installed
python -c "import graphify; print(__file__)"

# Or use the saved interpreter path
$GRAPHIFY_PYTHON = Get-Content graphify-out\.graphify_python
& $GRAPHIFY_PYTHON -m graphify query "How does auth work?"
```

### Environment Variables

```powershell
# Optional: set Gemini API key for semantic extraction (code-only corpus doesn't need it)
$env:GEMINI_API_KEY = "your-key-here"

# The OpenRouter API key for Redrise AI features (stored in .env, not graphify)
# See .env file for OPENROUTER_API_KEY
```

## Community Hubs (Navigation)
- [[_COMMUNITY_UI Components|UI Components]]
- [[_COMMUNITY_User Profile & Onboarding|User Profile & Onboarding]]
- [[_COMMUNITY_Wizard & Creation Pages|Wizard & Creation Pages]]
- [[_COMMUNITY_Hooks & Shared Blocks|Hooks & Shared Blocks]]
- [[_COMMUNITY_Page Definitions|Page Definitions]]
- [[_COMMUNITY_Settings & Admin Panels|Settings & Admin Panels]]
- [[_COMMUNITY_App Layout Shell|App Layout Shell]]
- [[_COMMUNITY_Data Hooks & Routing|Data Hooks & Routing]]
- [[_COMMUNITY_Team Members Library|Team Members Library]]
- [[_COMMUNITY_Shared UI Blocks|Shared UI Blocks]]
- [[_COMMUNITY_Teams Library|Teams Library]]
- [[_COMMUNITY_Dashboard & Onboarding|Dashboard & Onboarding]]
- [[_COMMUNITY_Flow Cards Library|Flow Cards Library]]
- [[_COMMUNITY_Workspaces Library|Workspaces Library]]
- [[_COMMUNITY_Analytics & Charts|Analytics & Charts]]
- [[_COMMUNITY_Agents Library|Agents Library]]
- [[_COMMUNITY_API Keys Library|API Keys Library]]
- [[_COMMUNITY_Flows Library|Flows Library]]
- [[_COMMUNITY_Integrations Library|Integrations Library]]
- [[_COMMUNITY_Flow List & Pipeline|Flow List & Pipeline]]
- [[_COMMUNITY_UI Table|UI Table]]
- [[_COMMUNITY_Error Boundary|Error Boundary]]
- [[_COMMUNITY_AI Client & Supabase|AI Client & Supabase]]
- [[_COMMUNITY_Audit Logs Library|Audit Logs Library]]
- [[_COMMUNITY_Task Executions Library|Task Executions Library]]
- [[_COMMUNITY_Tasks Library|Tasks Library]]
- [[_COMMUNITY_Team Invites Library|Team Invites Library]]
- [[_COMMUNITY_Member List & Pagination|Member List & Pagination]]
- [[_COMMUNITY_Auth Flow|Auth Flow]]
- [[_COMMUNITY_i18n Admin Terms|i18n Admin Terms]]
- [[_COMMUNITY_Task Types|Task Types]]
- [[_COMMUNITY_UI Card|UI Card]]
- [[_COMMUNITY_UI Select|UI Select]]
- [[_COMMUNITY_i18n Provider|i18n Provider]]
- [[_COMMUNITY_Flow Card Types|Flow Card Types]]
- [[_COMMUNITY_Analytics Library|Analytics Library]]
- [[_COMMUNITY_Cities Library|Cities Library]]
- [[_COMMUNITY_i18n Core|i18n Core]]
- [[_COMMUNITY_Member Functions Library|Member Functions Library]]
- [[_COMMUNITY_Command Palette|Command Palette]]
- [[_COMMUNITY_Priority Filter|Priority Filter]]
- [[_COMMUNITY_Agent Types|Agent Types]]
- [[_COMMUNITY_Flow Types|Flow Types]]
- [[_COMMUNITY_Workspace Types|Workspace Types]]
- [[_COMMUNITY_UI Avatar|UI Avatar]]
- [[_COMMUNITY_UI Tabs|UI Tabs]]
- [[_COMMUNITY_Loading Screen|Loading Screen]]
- [[_COMMUNITY_i18n Agent|i18n: Agent]]
- [[_COMMUNITY_i18n Analytics|i18n: Analytics]]
- [[_COMMUNITY_i18n Audit Log|i18n: Audit Log]]
- [[_COMMUNITY_i18n Gender|i18n: Gender]]
- [[_COMMUNITY_i18n Birth Date|i18n: Birth Date]]
- [[_COMMUNITY_i18n Dashboard|i18n: Dashboard]]
- [[_COMMUNITY_i18n Email|i18n: Email]]
- [[_COMMUNITY_i18n First Name|i18n: First Name]]
- [[_COMMUNITY_i18n Flow|i18n: Flow]]
- [[_COMMUNITY_i18n Health Check|i18n: Health Check]]
- [[_COMMUNITY_i18n Language|i18n: Language]]
- [[_COMMUNITY_i18n Last Name|i18n: Last Name]]
- [[_COMMUNITY_i18n Location|i18n: Location]]
- [[_COMMUNITY_i18n Member|i18n: Member]]
- [[_COMMUNITY_i18n Middle Name|i18n: Middle Name]]
- [[_COMMUNITY_i18n Personal Info|i18n: Personal Info]]
- [[_COMMUNITY_i18n Phone|i18n: Phone]]
- [[_COMMUNITY_i18n Plan|i18n: Plan]]
- [[_COMMUNITY_i18n Select All|i18n: Select All]]
- [[_COMMUNITY_i18n Session|i18n: Session]]
- [[_COMMUNITY_i18n Staff|i18n: Staff]]
- [[_COMMUNITY_i18n Task|i18n: Task]]
- [[_COMMUNITY_i18n Team Members|i18n: Team Members]]
- [[_COMMUNITY_i18n Timezone|i18n: Timezone]]
- [[_COMMUNITY_i18n Username|i18n: Username]]
- [[_COMMUNITY_i18n Viewer|i18n: Viewer]]
- [[_COMMUNITY_i18n Workspace|i18n: Workspace]]
- [[_COMMUNITY_App Frame|App Frame]]
- [[_COMMUNITY_Task Execution Types|Task Execution Types]]
- [[_COMMUNITY_UI Label|UI Label]]
- [[_COMMUNITY_UI Scroll Area|UI Scroll Area]]
- [[_COMMUNITY_UI Checkbox|UI Checkbox]]
- [[_COMMUNITY_UI Input|UI Input]]
- [[_COMMUNITY_UI Popover|UI Popover]]
- [[_COMMUNITY_UI Progress|UI Progress]]
- [[_COMMUNITY_UI Separator|UI Separator]]
- [[_COMMUNITY_UI Slider|UI Slider]]
- [[_COMMUNITY_UI Switch|UI Switch]]
- [[_COMMUNITY_UI Textarea|UI Textarea]]
- [[_COMMUNITY_UI Tooltip|UI Tooltip]]

## God Nodes (most connected - your core abstractions)
1. `t()` - 43 edges
2. `useI18n()` - 42 edges
3. `logAuditEvent()` - 22 edges
4. `supabase` - 17 edges
5. `cn()` - 14 edges
6. `WizardShell()` - 8 edges
7. `AppShell()` - 8 edges
8. `CreateTaskPage()` - 7 edges
9. `loadUserProfile()` - 7 edges
10. `AccountBasicInfoPage()` - 6 edges

## Surprising Connections (you probably didn't know these)
- `AnalyticsPage()` --calls--> `buildKpis()`  [INFERRED]
  src/components/blocks/pages/analytics-page.tsx → src/lib/analytics.ts
- `formatLastActive()` --calls--> `t()`  [INFERRED]
  src/components/blocks/shared/sessions-list.tsx → src/lib/i18n.ts
- `AnalyticsPage()` --calls--> `useI18n()`  [INFERRED]
  src/components/blocks/pages/analytics-page.tsx → src/hooks/use-i18n.ts
- `AnalyticsPage()` --calls--> `t()`  [INFERRED]
  src/components/blocks/pages/analytics-page.tsx → src/lib/i18n.ts
- `CreateFlowPage()` --calls--> `useI18n()`  [INFERRED]
  src/components/blocks/pages/create-flow-page.tsx → src/hooks/use-i18n.ts

## Import Cycles
- 1-file cycle: `src/app/analytics/page.tsx -> src/app/analytics/page.tsx`
- 1-file cycle: `src/app/dashboard/page.tsx -> src/app/dashboard/page.tsx`
- 1-file cycle: `src/app/settings/page.tsx -> src/app/settings/page.tsx`

## Communities (103 total, 17 thin omitted)

### Community 0 - "UI Components"
Cohesion: 0.05
Nodes (36): CardList(), CardListProps, cn(), AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter() (+28 more)

### Community 1 - "User Profile & Onboarding"
Cohesion: 0.09
Nodes (26): createFlow(), createDefaultProfile(), decodeJwtPayload(), ensureCurrentUserTeamMember(), fromSupabaseProfile(), getSessionLocation(), getSupabaseSessionId(), loadRememberedSessions() (+18 more)

### Community 2 - "Wizard & Creation Pages"
Cohesion: 0.09
Nodes (21): STEP_KEYS, STEP_KEYS, COLUMNS, MONTH_DAYS, PRIORITIES, RECURRENCES, STEP_KEYS, WEEK_DAYS (+13 more)

### Community 3 - "Hooks & Shared Blocks"
Cohesion: 0.11
Nodes (21): useFlowCards(), useI18n(), t(), getMemberFunctionLabelKey(), AccountBasicInfoPage(), AgentCreatePage(), AgentDetailPage(), AgentListPage() (+13 more)

### Community 4 - "Page Definitions"
Cohesion: 0.08
Nodes (17): ACCESS_COPY_KEYS, accessLabelKey(), AccountUser, COUNTRIES, BenchmarkData, LogEntry, PLACEHOLDER_LOGS, STATUS_BADGE (+9 more)

### Community 5 - "Settings & Admin Panels"
Cohesion: 0.09
Nodes (19): Plan, PLANS, PlansPage(), ADMIN_ONLY_SETTINGS, SettingKey, SettingShortcut, SettingsPage(), SettingsUser (+11 more)

### Community 6 - "App Layout Shell"
Cohesion: 0.11
Nodes (12): AppShellProps, PAGE_TITLE_KEYS, CONTEXT_BY_KEY, initials(), NAV_ITEMS, Sidebar(), SidebarAgent, SidebarKey (+4 more)

### Community 7 - "Data Hooks & Routing"
Cohesion: 0.11
Nodes (13): useAgents(), AnalyticsData, useAnalytics(), useDropdownClose(), useFlows(), useTasks(), useTeamMemberOptions(), useWorkspaces() (+5 more)

### Community 8 - "Team Members Library"
Cohesion: 0.11
Nodes (9): AccessRole, loadCurrentTeamAssignment(), normalizeTeamName(), ProfileRow, SettingsAdminContext, TeamAssignmentTeamRow, TeamMember, TeamMemberRole (+1 more)

### Community 9 - "Shared UI Blocks"
Cohesion: 0.16
Nodes (9): ActivityFeed(), ActivityFeedProps, latest(), AvatarUpload(), AvatarUploadProps, initials(), MEMBERS, TeamPermissionsMatrix() (+1 more)

### Community 10 - "Teams Library"
Cohesion: 0.19
Nodes (9): AssignmentRow, createTeam(), generateShortId(), loadCurrentTeamAssignments(), mapTeam(), normalizeFallbackTeam(), Team, TeamAssignment (+1 more)

### Community 11 - "Dashboard & Onboarding"
Cohesion: 0.21
Nodes (8): DashboardPage(), ChartTabs(), COLUMN_META, COLUMN_ORDER, OnboardingEmpty(), OperationsGrid(), OperationsGridProps, percent()

### Community 12 - "Flow Cards Library"
Cohesion: 0.22
Nodes (4): createFlowCard(), createFlowEdge(), generateEdgeShortId(), generateShortId()

### Community 13 - "Workspaces Library"
Cohesion: 0.31
Nodes (8): createWorkspace(), deleteWorkspace(), generateShortId(), generateUniqueId(), getWorkspace(), isIdUnique(), loadWorkspaces(), mockFrom

### Community 14 - "Analytics & Charts"
Cohesion: 0.24
Nodes (8): STATUS_BADGE, areaPath(), ChartTabsProps, SimpleAreaChart(), Kpi, KpiCard(), KpiCards(), sparklinePath()

### Community 15 - "Agents Library"
Cohesion: 0.31
Nodes (5): createAgent(), deleteAgent(), generateShortId(), generateUniqueId(), isIdUnique()

### Community 16 - "API Keys Library"
Cohesion: 0.28
Nodes (7): ApiKey, createApiKey(), CreateApiKeyInput, deleteApiKey(), generateApiKeySecret(), generateShortId(), revokeApiKey()

### Community 17 - "Flows Library"
Cohesion: 0.33
Nodes (6): logAuditEvent(), deleteFlow(), generateShortId(), generateUniqueId(), isIdUnique(), updateFlow()

### Community 18 - "Integrations Library"
Cohesion: 0.25
Nodes (6): createIntegration(), CreateIntegrationInput, deleteIntegration(), generateShortId(), Integration, IntegrationStatus

### Community 19 - "Flow List & Pipeline"
Cohesion: 0.25
Nodes (6): FlowListPage(), PipelineNode, PLACEHOLDER_NODES, STATUS_STYLES, WorkflowPipeline(), WorkflowPipelineProps

### Community 20 - "UI Table"
Cohesion: 0.22
Nodes (8): Table, TableBody, TableCaption, TableCell, TableFooter, TableHead, TableHeader, TableRow

### Community 21 - "Error Boundary"
Cohesion: 0.25
Nodes (3): ErrorBoundary, Props, State

### Community 22 - "AI Client & Supabase"
Cohesion: 0.29
Nodes (5): ChatCompletionResponse, ChatMessage, supabase, supabaseAnonKey, supabaseUrl

### Community 23 - "Audit Logs Library"
Cohesion: 0.25
Nodes (5): AuditAction, AuditEntityType, AuditLog, generateShortId(), LogInput

### Community 25 - "Tasks Library"
Cohesion: 0.36
Nodes (5): createTask(), deleteTask(), generateShortId(), generateUniqueId(), isIdUnique()

### Community 26 - "Team Invites Library"
Cohesion: 0.25
Nodes (3): InviteRow, ProfileRow, TeamInviteNotification

### Community 27 - "Member List & Pagination"
Cohesion: 0.29
Nodes (5): CurrentUser, MemberListTable(), ROLE_MAP, PaginationFooter(), PaginationFooterProps

### Community 28 - "Auth Flow"
Cohesion: 0.33
Nodes (5): ART_QUOTES, AuthFlow(), AuthMode, isValidEmail(), PASSWORD_RULES

### Community 29 - "i18n Admin Terms"
Cohesion: 0.29
Nodes (6): admin, en-US, pt-BR, API keys, en-US, pt-BR

### Community 30 - "Task Types"
Cohesion: 0.29
Nodes (6): CreateTaskInput, RecurrenceType, Task, TaskFlow, TaskPriority, TaskStatus

### Community 31 - "UI Card"
Cohesion: 0.29
Nodes (6): Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle

### Community 32 - "UI Select"
Cohesion: 0.33
Nodes (5): SelectContent, SelectItem, SelectLabel, SelectSeparator, SelectTrigger

### Community 34 - "Flow Card Types"
Cohesion: 0.40
Nodes (4): CreateFlowCardInput, CreateFlowEdgeInput, FlowCard, FlowEdge

### Community 35 - "Analytics Library"
Cohesion: 0.50
Nodes (3): AnalyticsForKpi, buildKpis(), Kpi

### Community 36 - "Cities Library"
Cohesion: 0.50
Nodes (3): CITIES, CityData, searchCities()

### Community 37 - "i18n Core"
Cohesion: 0.50
Nodes (3): Locale, LOCALES, translations

### Community 39 - "Command Palette"
Cohesion: 0.50
Nodes (3): CommandPalette(), CommandPaletteProps, PaletteItem

### Community 40 - "Priority Filter"
Cohesion: 0.50
Nodes (3): DropdownFilterByPriority(), PRIORITIES, PRIORITY_KEYS

### Community 41 - "Agent Types"
Cohesion: 0.50
Nodes (3): Agent, AgentStatus, CreateAgentInput

### Community 42 - "Flow Types"
Cohesion: 0.50
Nodes (3): CreateFlowInput, Flow, FlowStatus

### Community 43 - "Workspace Types"
Cohesion: 0.50
Nodes (3): CreateWorkspaceInput, Workspace, WorkspaceStatus

### Community 44 - "UI Avatar"
Cohesion: 0.50
Nodes (3): Avatar, AvatarFallback, AvatarImage

### Community 45 - "UI Tabs"
Cohesion: 0.50
Nodes (3): TabsContent, TabsList, TabsTrigger

### Community 47 - "i18n: Agent"
Cohesion: 0.67
Nodes (3): agent, en-US, pt-BR

### Community 48 - "i18n: Analytics"
Cohesion: 0.67
Nodes (3): analytics, en-US, pt-BR

### Community 49 - "i18n: Audit Log"
Cohesion: 0.67
Nodes (3): audit log, en-US, pt-BR

### Community 50 - "i18n: Gender"
Cohesion: 0.67
Nodes (3): biological gender, en-US, pt-BR

### Community 51 - "i18n: Birth Date"
Cohesion: 0.67
Nodes (3): birth date, en-US, pt-BR

### Community 52 - "i18n: Dashboard"
Cohesion: 0.67
Nodes (3): dashboard, en-US, pt-BR

### Community 53 - "i18n: Email"
Cohesion: 0.67
Nodes (3): email address, en-US, pt-BR

### Community 54 - "i18n: First Name"
Cohesion: 0.67
Nodes (3): first name, en-US, pt-BR

### Community 55 - "i18n: Flow"
Cohesion: 0.67
Nodes (3): flow, en-US, pt-BR

### Community 56 - "i18n: Health Check"
Cohesion: 0.67
Nodes (3): health check, en-US, pt-BR

### Community 57 - "i18n: Language"
Cohesion: 0.67
Nodes (3): language, en-US, pt-BR

### Community 58 - "i18n: Last Name"
Cohesion: 0.67
Nodes (3): last name, en-US, pt-BR

### Community 59 - "i18n: Location"
Cohesion: 0.67
Nodes (3): location, en-US, pt-BR

### Community 60 - "i18n: Member"
Cohesion: 0.67
Nodes (3): member, en-US, pt-BR

### Community 61 - "i18n: Middle Name"
Cohesion: 0.67
Nodes (3): middle name, en-US, pt-BR

### Community 62 - "i18n: Personal Info"
Cohesion: 0.67
Nodes (3): personal information, en-US, pt-BR

### Community 63 - "i18n: Phone"
Cohesion: 0.67
Nodes (3): phone, en-US, pt-BR

### Community 64 - "i18n: Plan"
Cohesion: 0.67
Nodes (3): plan, en-US, pt-BR

### Community 65 - "i18n: Select All"
Cohesion: 0.67
Nodes (3): select all, en-US, pt-BR

### Community 66 - "i18n: Session"
Cohesion: 0.67
Nodes (3): session, en-US, pt-BR

### Community 67 - "i18n: Staff"
Cohesion: 0.67
Nodes (3): staff, en-US, pt-BR

### Community 68 - "i18n: Task"
Cohesion: 0.67
Nodes (3): task, en-US, pt-BR

### Community 69 - "i18n: Team Members"
Cohesion: 0.67
Nodes (3): team members, en-US, pt-BR

### Community 70 - "i18n: Timezone"
Cohesion: 0.67
Nodes (3): timezone, en-US, pt-BR

### Community 71 - "i18n: Username"
Cohesion: 0.67
Nodes (3): username, en-US, pt-BR

### Community 72 - "i18n: Viewer"
Cohesion: 0.67
Nodes (3): viewer, en-US, pt-BR

### Community 73 - "i18n: Workspace"
Cohesion: 0.67
Nodes (3): workspace, en-US, pt-BR

## Knowledge Gaps
- **269 isolated node(s):** `AuthMode`, `PASSWORD_RULES`, `ART_QUOTES`, `LoadingScreenProps`, `AccountUser` (+264 more)
  These have ≤1 connection - possible missing edges or undocumented components.
- **17 thin communities (<3 nodes) omitted from report** — run `graphify query` to explore isolated nodes.

## Suggested Questions
_Questions this graph is uniquely positioned to answer:_

- **Why does `cn()` connect `UI Components` to `User Profile & Onboarding`, `Wizard & Creation Pages`, `App Layout Shell`, `Analytics & Charts`, `Member List & Pagination`?**
  _High betweenness centrality (0.259) - this node is a cross-community bridge._
- **Why does `t()` connect `Hooks & Shared Blocks` to `Page Definitions`, `i18n Core`, `App Layout Shell`, `Data Hooks & Routing`, `Settings & Admin Panels`, `Shared UI Blocks`, `Command Palette`, `Dashboard & Onboarding`, `Priority Filter`, `Flow List & Pipeline`, `Member List & Pagination`?**
  _High betweenness centrality (0.092) - this node is a cross-community bridge._
- **Why does `Sidebar()` connect `App Layout Shell` to `UI Components`, `Hooks & Shared Blocks`?**
  _High betweenness centrality (0.089) - this node is a cross-community bridge._
- **Are the 42 inferred relationships involving `t()` (e.g. with `AppShell()` and `Sidebar()`) actually correct?**
  _`t()` has 42 INFERRED edges - model-reasoned connections that need verification._
- **Are the 41 inferred relationships involving `useI18n()` (e.g. with `AppShell()` and `Sidebar()`) actually correct?**
  _`useI18n()` has 41 INFERRED edges - model-reasoned connections that need verification._
- **Are the 13 inferred relationships involving `cn()` (e.g. with `CardList()` and `Sidebar()`) actually correct?**
  _`cn()` has 13 INFERRED edges - model-reasoned connections that need verification._
- **What connects `AuthMode`, `PASSWORD_RULES`, `ART_QUOTES` to the rest of the system?**
  _269 weakly-connected nodes found - possible documentation gaps or missing edges._