# Update 4.0 - Task Execution Architecture + Flow Builder + Global Member Filtering

> Test-first update. All changes must pass lint/typecheck before commit.

## Overview

Major architectural update implementing 4-level task execution persistence, deterministic task ordering, upstream artifact chaining, structured AI output parsing, full UI rebuild for task execution and agent detail, Flow Builder improvements (Edit button, Approvers dropdown, card persistence fix), Task wizard overhaul (Card + Queue Position, Agent from card, layout swaps), global member filtering (only active members in dropdowns), and AI response formatting with language support.

---

## Phase 1 — Database & RLS (Migrations 032–034)

### Migration 032: Task Execution Architecture

**Tables created:**
| Table | Purpose |
|-------|---------|
| `task_executions` | Execution lifecycle: status, model, prompt, output, tokens |
| `task_execution_messages` | Ordered message history (context/prompt/response) |
| `task_execution_outputs` | Structured outputs with raw/parsed data |
| `flow_runs` | Flow-level execution tracking |
| `flow_run_steps` | Per-card step within a flow run |

**Columns added:**
| Table | Column | Type | Default |
|-------|--------|------|---------|
| `tasks` | `run_order` | `integer` | `NULL` |
| `flow_cards` | `run_order` | `integer` | `NULL` |
| `flow_cards` | `execution_policy` | `text` | `'sequential'` |

**Security:**
- `security.can_access_flow_run(flow_run_id)` helper function for RLS
- RLS policies on all 5 new tables
- Auto-populate `task_execution_messages.user_id` via trigger from `task_executions`
- Indexes on `task_id`, `execution_id`, `flow_run_id`, `card_node_id`

### Migration 033: Task Flow Card & Queue Position

**Columns added:**
| Table | Column | Type | Default |
|-------|--------|------|---------|
| `tasks` | `flow_card_id` | `uuid` | `NULL` |
| `tasks` | `queue_position` | `integer` | `NULL` |

**Purpose:** Link tasks to flow cards and allow queue positioning within cards.

### Migration 034: Flow Card Approvers

**Columns added:**
| Table | Column | Type | Default |
|-------|--------|------|---------|
| `flow_cards` | `approvers` | `jsonb` | `'[]'::jsonb` |

**Purpose:** Store approvers list per card. Fixes persistence bug where `approvers` was in frontend types but not in database.

---

## Phase 2 — Edge Function

### `supabase/functions/task-execute/index.ts`

**Functionality:**
- Receives `objective`, `prompt`, `upstreamContext`, `model`, `language`
- Builds structured system prompt with JSON schema enforcement
- Supports **language-aware responses** (`pt-BR`, `en-US`)
- Calls OpenRouter API with structured output schema
- Parses and validates JSON response
- Returns `{ raw_output, parsed_output, parse_error, tokens_used }`

**Structured Output Schema:**
```json
{
  "final_answer": "string — complete answer or result",
  "decision_summary": "string — brief summary",
  "steps_summary": ["string — each step taken"],
  "evidence_used": ["string — sources and data"],
  "open_questions": ["string — unresolved items"],
  "confidence": "number 0-1",
  "handoff_notes": "string — context for downstream tasks"
}
```

**Language Support:**
- `pt-BR` → "Responda em Português do Brasil."
- `en-US` → "Respond in English."
- AI instructed to format `final_answer` with newlines, bold, numbered lists

---

## Phase 3 — Frontend

### Types Updated

**`src/types/task.ts`:**
- Added `flow_card_id?: string | null`
- Added `queue_position?: number | null`
- Added `run_order?: number | null`

**`src/types/flow-card.ts`:**
- Added `approvers?: string[]`
- Added `run_order?: number | null`
- Added `execution_policy?: string`

**`src/types/task-execution.ts`:**
- `TaskExecutionMessage` — id, execution_id, seq, role, kind, content, user_id, created_at
- `TaskExecutionOutput` — id, execution_id, kind, content, parsed_data, raw_output, approved, approved_at, created_at
- `StructuredOutput` — interface matching schema

**`src/types/flow-run.ts`:**
- `FlowRun` — id, flow_id, triggered_by, status, started_at, completed_at, error
- `FlowRunStep` — id, flow_run_id, card_node_id, execution_id, status, started_at, completed_at

### Libraries

**`src/lib/task-executions.ts`:**
- `createExecution()` — create execution record
- `completeExecution()` — mark done with output
- `rejectExecution()` — mark rejected
- `failExecution()` — mark failed with error
- `approveExecution()` — approve execution
- `addMessage()` — add ordered message
- `addOutput()` — add structured output
- `loadOutputs()` — load outputs for execution
- `approveOutput()` — approve specific output
- `resolveUpstreamContext()` — find upstream tasks by `flow_id` + `run_order < current`
- `loadExecutionsByAgent()` — load execution history for agent detail

**`src/lib/flow-runs.ts`:**
- `createFlowRun()` — create flow run
- `getFlowRun()` — get by id
- `updateFlowRunStatus()` — update status
- `createFlowRunStep()` — create step
- `updateFlowRunStepStatus()` — update step status

**`src/lib/tasks.ts`:**
- Updated `createTask()` to include `flow_card_id`, `queue_position`
- Fixed `loadTasksByCard()` to filter by `flow_card_id`

**`src/lib/flow-cards.ts`:**
- Updated `syncFlowEditor()` to include `approvers` in insert/update
- Updated `loadCardsByFlowOrdered()` to return cards ordered by `run_order`

**`src/lib/ai-client.ts`:**
- `taskExecute()` — calls Edge Function with `language` parameter
- `TaskExecuteResult` type
- `resolveUpstreamContext()` — client-side wrapper

### Task Run Dialog (`task-run-dialog.tsx`)

**Complete rewrite:**
- Uses `taskExecute()` instead of `generateText()`
- Resolves upstream context automatically
- Persists messages and structured outputs
- Displays **formatted AI response**:
  - `final_answer` as main text
  - `steps_summary` as numbered list
  - `handoff_notes` below
  - Confidence badge and decision summary in header
- Accepts `language` prop for localized responses

### Review Task Page (`review-task-page.tsx`)

**Complete rebuild:**
- Full task detail with execution history
- Messages timeline with role/kind badges
- Structured outputs with approval workflow
- Upstream context display
- Task metadata (workspace, flow, card, priority, status)

### Agent Detail Page (`agent-detail-page.tsx`)

**Complete rewrite:**
- Real execution history via `loadExecutionsByAgent()`
- Metrics: total executions, tokens used, avg confidence, success rate
- Execution list with status, model, confidence, tokens
- Click execution to open task detail

### App Shell (`app-shell.tsx`)

- Added `selectedTaskId` state
- Added `onOpenTask` callback wiring

### Task Board Page (`task-board-page.tsx`)

- ArrowRight key opens task detail
- Passes `locale` to TaskRunDialog for language support

### i18n (`src/lib/i18n.ts`)

**~80+ new keys added (en-US + pt-BR):**
- `taskRun.*` — task execution dialog labels
- `reviewTask.*` — task detail page labels
- `agentDetail.*` — agent detail page labels
- `flowBuilder.tasks`, `flowBuilder.noTasksForCard`, `flowBuilder.missingRequiredFields*`, `flowBuilder.unnamedCard`
- `tasks.flowCard`, `tasks.queuePosition`, `tasks.selectCard`, `tasks.selectPosition`, `tasks.selectFlowFirst`, `tasks.selectCardFirst`
- `app.loading.*` — loading screen messages

---

## Phase 4 — Flow Builder Improvements

### Edit Button

**Before:** Icon (`CheckCircle2`) in top-right corner
**After:** Text "Edit"/"Editar" button at **bottom of card**
- Small compact size
- Hover: white text on orange background (`hover:text-white hover:bg-[#A04D1F]`)

### Approvers Dropdown

- Added `approvers` field to FlowCard type
- Card editor dialog includes MultiSelectDropdown for approvers
- `syncFlowEditor()` persists approvers to Supabase
- `createFlowCard()` and `updateFlowCard()` include approvers
- Canvas displays approver count

### Card Editor — Required Fields

- Title, Agents, Approvers marked with `RequiredLabel` (red asterisk)
- Save button disabled if any required field is empty
- Instructions textarea **removed**, replaced with Tasks table

### Card Editor — Tasks Table

- Shows tasks linked to this card (filtered by `flow_card_id`)
- Columns: #, Title, Status
- Max height with scroll
- "No tasks for this card" when empty

### Save Validation

- When saving flow, validates **all cards** for missing required fields
- If any card missing Title, Agents, or Approvers → shows popup listing each card and missing fields
- Flow save blocked until all cards pass validation

### Persistence Fix

**Root cause:** `approvers` column added to frontend types and `syncFlowEditor()` but never to `flow_cards` database table. Inserts failed silently.

**Fix:** Migration 034 adding `approvers jsonb NOT NULL DEFAULT '[]'::jsonb` to `flow_cards`

---

## Phase 5 — Task Wizard Overhaul

### New Task Wizard (`create-task-page.tsx`)

**Layout (step 2):**
| Row | Left | Right |
|-----|------|-------|
| 1 | Workspace | Flow |
| 2 | **Flow Card** (required) | **Priority** |
| 3 | **Queue Position** (required, disabled until Card selected) | **Kanban Column** |
| 4 | Agent (read-only, from card) | — |

**Key changes:**
- Agent dropdown **removed** — agent comes from flow card (read-only)
- Flow Card is **required**
- Queue Position is **required**, disabled until Card selected
- Priority and Kanban Column swapped to second row
- `agent_id` auto-set from card's agents on creation

---

## Phase 6 — Global Member Filtering

### `use-team-member-options.ts`

- Added `.filter((m) => m.status !== 'Invited')` — only active members in all dropdowns
- `loadTeamMembers()` still returns all members for Settings pages

---

## Phase 7 — Loading Screen Translation

### `src/App.tsx`

- `fetchUserLanguage(userId)` — queries just `language` from Supabase `profiles` table before full profile load
- Loading messages update dynamically as language resolves
- No localStorage — all data persisted in Supabase

### Loading Messages

| Phase | en-US | pt-BR |
|-------|-------|-------|
| Session check | Verifying your session... | Verificando sua sessão... |
| Profile load | Loading your profile... | Carregando seu perfil... |
| Workspace init | Preparing your workspace... | Preparando seu workspace... |
| Error | Unable to verify your session. | Não foi possível verificar sua sessão. |

---

## Validation

All changes pass:
- ✅ `corepack yarn lint`
- ✅ `corepack yarn typecheck`
- ✅ `corepack yarn build`

---

## Files Changed (Complete List)

### New Files
- `supabase/migrations/032_task_execution_architecture.sql`
- `supabase/migrations/033_add_task_flow_card_and_queue_position.sql`
- `supabase/migrations/034_add_flow_card_approvers.sql`
- `supabase/functions/task-execute/index.ts`
- `src/types/task-execution.ts`
- `src/types/flow-run.ts`
- `src/lib/task-executions.ts`
- `src/lib/flow-runs.ts`

### Modified Files
- `src/types/task.ts` — flow_card_id, queue_position, run_order
- `src/types/flow-card.ts` — approvers, run_order, execution_policy
- `src/lib/tasks.ts` — includes flow_card_id, queue_position; fixed loadTasksByCard
- `src/lib/flow-cards.ts` — syncFlowEditor includes approvers
- `src/lib/ai-client.ts` — taskExecute(), language param
- `src/lib/i18n.ts` — ~80+ new keys
- `src/lib/team-members.ts` — loadTeamMembers returns all
- `src/hooks/use-team-member-options.ts` — filters to active members only
- `src/components/blocks/shared/task-run-dialog.tsx` — complete rewrite
- `src/components/blocks/pages/review-task-page.tsx` — complete rebuild
- `src/components/blocks/pages/agent-detail-page.tsx` — complete rewrite
- `src/components/blocks/pages/flow-builder-page.tsx` — edit button, approvers, validation, tasks table
- `src/components/blocks/pages/create-task-page.tsx` — card+queue, agent from card, layout swaps
- `src/components/blocks/pages/task-board-page.tsx` — onOpenTask, locale prop
- `src/components/layout/app-shell.tsx` — selectedTaskId state
- `src/app/tasks/review/page.tsx` — passes empty taskId
- `src/App.tsx` — fetchUserLanguage, translated loading messages
- `memory/TECHNICAL.md` — updated for all architecture changes

---

## Pending

- [ ] Commit & push all changes
- [ ] Deploy Edge Function (`supabase functions deploy task-execute`)
- [ ] Run E2E tests after validation
