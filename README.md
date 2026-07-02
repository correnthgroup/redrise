# Redrise

Workspace-first SaaS for flows, tasks, agents, analytics, settings, team operations, and operational control.

## Stack

| Layer | Technology | Version |
|---|---|---|
| **Framework** | Next.js (App Router) | 16.2.9 |
| **UI Library** | React | 19.2.4 |
| **Language** | TypeScript | ~5.7 |
| **Styling** | Tailwind CSS v4 | 4.x (oklch tokens) |
| **UI Primitives** | shadcn (Radix + CVA) | base-nova style, 44 components |
| **Charts** | Recharts | 3.8 |
| **Tables** | TanStack React Table | 8.21 |
| **Drag & Drop** | @dnd-kit | 6.x |
| **Flow Canvas** | @xyflow/react | 12.11 |
| **Icons** | Lucide React + Tabler Icons | 1.22 / 3.44 |
| **Forms** | Zod | 4.4 |
| **Toasts** | Sonner | 2.0 |
| **Drawers** | Vaul | 1.1 |
| **Font** | Geist (Google Fonts) | — |
| **Backend** | Supabase | 2.108 |
| **Database** | PostgreSQL + RLS | 45 migrations |
| **Edge Functions** | Supabase Edge Functions | 10 functions |
| **Auth** | Supabase Auth | e-mail/password |
| **Billing** | Stripe (via Edge Functions) | — |
| **AI** | OpenRouter proxy | — |
| **Package Manager** | npm | — |
| **Python Tooling** | uv + Python 3.12 | graphify 0.8.31 |
| **Testing** | Playwright (E2E) + Vitest | — |
| **Linting** | ESLint 10 + typescript-eslint | — |

## Architecture

```
Redrise
├── src/app/                          Next.js App Router
│   ├── layout.tsx                    Root layout (Geist font, ThemeProvider, Toaster)
│   ├── page.tsx                      Root → redirect /workstation
│   ├── globals.css                   Tailwind oklch theme (light/dark)
│   ├── (auth)/                       Unauthenticated routes
│   │   ├── layout.tsx                Centered auth layout
│   │   ├── login/page.tsx            Sign in
│   │   └── signup/page.tsx           Sign up
│   └── (dashboard)/                  Authenticated routes
│       ├── layout.tsx                AppLayout (sidebar + breadcrumb)
│       ├── workstation/              Main dashboard
│       │   ├── page.tsx              Dashboard (cards, charts, table)
│       │   ├── workspace/            Space CRUD
│       │   │   ├── page.tsx          Space list (cards, context menu)
│       │   │   ├── new/page.tsx      Create space (form, team, preview)
│       │   │   └── [id]/
│       │   │       ├── edit/page.tsx Edit space
│       │   │       └── resume/page.tsx Space report
│       │   ├── workflow/             Process/flow list
│       │   └── workaction/           Action/task list
│       ├── agents/                   AI agents
│       │   ├── page.tsx              Agent overview
│       │   ├── models/page.tsx       Model configuration
│       │   ├── engine/page.tsx       Engine configuration
│       │   └── analytics/page.tsx    Agent analytics
│       ├── documentation/            Help & docs
│       │   ├── page.tsx              Documentation hub
│       │   ├── introduction/page.tsx Introduction
│       │   ├── get-started/page.tsx  Getting started
│       │   ├── tutorials/page.tsx    Tutorials
│       │   └── changelog/page.tsx    Changelog
│       └── settings/                 Account settings
│           ├── page.tsx              Settings hub
│           ├── general/page.tsx      General settings
│           ├── team/page.tsx         Team management
│           ├── billing/page.tsx      Billing & subscriptions
│           └── limits/page.tsx       Usage limits
├── src/components/
│   ├── app-layout.tsx                SidebarProvider + Breadcrumb header
│   ├── app-sidebar.tsx               Main sidebar navigation
│   ├── nav-main.tsx                  Collapsible nav groups
│   ├── nav-secondary.tsx             Support/Feedback links
│   ├── nav-user.tsx                  User dropdown menu
│   ├── nav-projects.tsx              Projects nav (localStorage)
│   ├── section-cards.tsx             4 KPI cards
│   ├── chart-area-interactive.tsx    Interactive area chart
│   ├── data-table.tsx                Data table with DnD, filtering, drawer
│   ├── multi-select.tsx              Multi-select (Popover + Command)
│   ├── providers/i18n-context.tsx    I18n context (stub)
│   └── ui/                           44 shadcn components
├── src/lib/                          Domain libraries (Supabase-backed)
│   ├── supabase.ts                   Supabase client init
│   ├── utils.ts                      cn() utility
│   ├── agents.ts                     Agent CRUD
│   ├── flows.ts                      Flow CRUD + approval
│   ├── tasks.ts                      Task CRUD + status
│   ├── workspaces.ts                 Workspace CRUD
│   ├── team-members.ts               Team member CRUD
│   ├── billing.ts                    Billing + Stripe
│   ├── ai-client.ts                  OpenRouter proxy + task execution
│   ├── analytics.ts                  KPI builder
│   ├── notifications.ts              Notification CRUD
│   ├── i18n.ts                       Translations (1000+ keys)
│   └── ... (20+ domain files)
├── src/hooks/                        React hooks
│   ├── use-agents.ts                 Agent state
│   ├── use-flows.ts                  Flow state
│   ├── use-tasks.ts                  Task state
│   ├── use-workspaces.ts             Workspace state
│   ├── use-analytics.ts              Analytics data
│   ├── use-notifications.ts          Realtime notifications
│   └── ... (11 hooks)
├── src/types/                        TypeScript types (8 files)
├── supabase/
│   ├── config.toml                   Local dev config
│   ├── migrations/                   45 SQL migrations
│   └── functions/                    10 Edge Functions
├── memory/                           Operational memory (6 files)
├── docs/                             Product docs, PRDs
├── updates/                          Product update specs
├── tests/                            Playwright E2E tests
├── scripts/                          Operational scripts + MCP
└── graphify-out/                     Knowledge graph (1995 nodes)
```

## How Everything Connects

### Frontend ↔ Backend (Supabase)

```
Browser (Next.js)
  │
  ├── Auth ──────────── Supabase Auth (email/password)
  │                        ├── JWT token in headers
  │                        └── Session stored in Supabase
  │
  ├── Data ──────────── Supabase PostgreSQL
  │   ├── src/lib/*.ts     (domain CRUD functions)
  │   ├── src/hooks/*.ts   (React state hooks)
  │   └── src/types/*.ts   (TypeScript interfaces)
  │
  ├── Realtime ──────── Supabase Realtime
  │   └── use-notifications.ts (channel subscription)
  │
  └── Edge Functions ── Supabase Edge Functions
      ├── openrouter-proxy    (AI chat completion)
      ├── task-execute        (AI task execution)
      ├── billing-checkout    (Stripe session)
      ├── billing-webhook     (Stripe events)
      ├── invite-member       (team invites)
      ├── agent-provider-test (provider connections)
      └── validate-api-key    (API key auth)
```

### Database Tables (45 migrations)

| Table | Purpose |
|---|---|
| `profiles` | User profiles (name, username, avatar) |
| `active_sessions` | Remembered sessions |
| `team_members` | Team member roles & access |
| `teams` | Team assignments |
| `team_invite_notifications` | Invite notifications |
| `workspaces` | Spaces/projects |
| `workspace_members` | Workspace membership |
| `flows` | Process/workflow definitions |
| `flow_cards` | Flow node cards |
| `flow_edges` | Flow node connections |
| `flow_runs` | Flow execution history |
| `tasks` | Action items |
| `task_executions` | Task execution history |
| `task_execution_messages` | Execution messages |
| `task_execution_outputs` | Execution outputs |
| `agents` | AI agent definitions |
| `agent_provider_connections` | Provider configs |
| `integrations` | Third-party integrations |
| `api_keys` | API key management |
| `audit_logs` | Audit trail |
| `notifications` | User notifications |
| `billing_subscriptions` | Stripe subscriptions |
| `adapter_runs` | Adapter execution logs |
| `rise_insider_files` | Rise Insider filesystem |

### External Services

| Service | Connection | Purpose |
|---|---|---|
| **Supabase** | JS client (`@supabase/supabase-js`) | Auth, DB, Realtime, Edge Functions |
| **Stripe** | Edge Functions (`billing-checkout`, `billing-webhook`) | Payment processing |
| **OpenRouter** | Edge Function (`openrouter-proxy`) | AI model access |
| **Render** | Git auto-deploy from GitHub | Static site hosting |
| **GitHub** | `correnthgroup/redrise.git` | Source control + CI/CD |

### Deploy Pipeline

```
GitHub (correnthgroup/redrise.git)
  │
  ├── Push to main
  │
  └── Render auto-deploy
      ├── Build: corepack enable && corepack yarn install --frozen-lockfile && corepack yarn build
      ├── Output: ./dist (static)
      ├── SPA rewrite: /* → /index.html
      └── Deploy: https://www.redrise.app
```

### Supabase (Backend-as-a-Service)

```
Supabase Project (integration@correnth.com)
  │
  ├── Auth
  │   ├── Email/password sign-in
  │   ├── Profile creation trigger (on signup)
  │   └── Session management
  │
  ├── PostgreSQL
  │   ├── 45 migrations (001-045)
  │   ├── Row Level Security (RLS)
  │   └── Stored procedures / RPCs
  │
  ├── Edge Functions (Deno)
  │   ├── openrouter-proxy    → AI chat via OpenRouter API
  │   ├── task-execute        → AI task execution
  │   ├── billing-checkout    → Stripe checkout session
  │   ├── billing-webhook     → Stripe event handler
  │   ├── invite-member       → Team invitation emails
  │   ├── agent-provider-test → Provider connectivity test
  │   ├── validate-api-key    → API key authentication
  │   ├── adapter-staging     → Adapter staging
  │   ├── rise-insider-filesystem → FS access for Rise Insider
  │   └── rise-insider-terminal   → Terminal access for Rise Insider
  │
  └── Realtime
      └── Notifications channel subscription
```

### Knowledge Graph (Graphify)

```
graphify-out/
  ├── graph.json        1995 nodes, 2735 edges, 226 communities
  ├── graph.html        Interactive visualization
  └── GRAPH_REPORT.md   Analysis report
  
  Updated via: python -m graphify update . --force
  Query via: /graphify command in AI assistant
```

## Commands

```bash
# Development
npm install              # Install dependencies
npm run dev              # Start dev server (localhost:3000)

# Build & Deploy
npm run build            # Next.js production build
npm run start            # Start production server

# Quality
npm run lint             # ESLint
npm run typecheck        # TypeScript check

# Testing
# (Playwright E2E + Vitest unit tests - to be configured)

# Operations
npm run mcp:redrise-ops  # Operational MCP server

# Knowledge Graph
python -m graphify update . --force   # Refresh graph
```

## Environment Variables

```env
# Supabase (required)
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key

# Supabase Admin (Edge Functions only)
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key

# OpenRouter (AI)
OPENROUTER_API_KEY=your-openrouter-key

# Stripe (billing)
STRIPE_SECRET_KEY=your-stripe-key
STRIPE_WEBHOOK_SECRET=your-webhook-secret

# App
APP_BASE_URL=https://www.redrise.app
```

## Key Files

| File | Purpose |
|---|---|
| `AGENTS.md` | Agent operating rules and project conventions |
| `memory/TECHNICAL.md` | Detailed PT-BR technical map |
| `memory/DECISIONS.md` | Architecture decisions |
| `memory/HANDOFF.md` | Session handoff notes |
| `memory/TASK_LOG.md` | Task log |
| `docs/SHADCN_COMPONENT_GUIDE.md` | shadcn component reference (25KB) |
| `render.yaml` | Render deploy blueprint |
| `components.json` | shadcn configuration |
| `graphify-out/graph.json` | Knowledge graph data |

## References

- Production: https://www.redrise.app
- GitHub: https://github.com/correnthgroup/redrise.git
- Operational account: `integration@correnth.com`
- UI reference: `riseslovecheck/` (template sub-project)
