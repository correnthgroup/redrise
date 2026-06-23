import { useState } from 'react'
import { ArrowRight, Trash2, Play } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'
import type { Task, TaskStatus } from '@/types/task'
import type { Agent } from '@/types/agent'
import type { Workspace } from '@/types/workspace'
import type { Flow } from '@/types/flow'
import { TaskRunDialog } from '@/components/blocks/shared/task-run-dialog'
import { useI18n } from '@/hooks/use-i18n'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { DROPDOWN_TRIGGER_CLASSES } from '@/lib/styles'

const COLUMNS: { id: TaskStatus; titleKey: string }[] = [
  { id: 'backlog', titleKey: 'tasks.backlog' },
  { id: 'in-progress', titleKey: 'tasks.inProgress' },
  { id: 'in-review', titleKey: 'tasks.inReview' },
  { id: 'done', titleKey: 'tasks.done' },
]

const STATUS_TONE: Record<TaskStatus, string> = {
  backlog: 'border-[#2F5D5A]/20 bg-[#2F5D5A]/6',
  'in-progress': 'border-primary/18 bg-primary/6',
  'in-review': 'border-[#B7791F]/18 bg-[#FFF8E1]',
  done: 'border-emerald-200 bg-emerald-50',
  error: 'border-primary/18 bg-primary/8',
  pending: 'border-slate-200 bg-slate-50',
  running: 'border-[#2F5D5A]/18 bg-[#2F5D5A]/8',
}

export function TaskBoardPage({
  tasks,
  agents,
  workspaces,
  flows,
  onMoveTask,
  onDeleteTask,
  filtersOpen,
  workspaceFilter,
  flowFilter,
  agentFilter,
  onWorkspaceFilterChange,
  onFlowFilterChange,
  onAgentFilterChange,
}: {
  tasks: Task[]
  agents: Agent[]
  workspaces: Workspace[]
  flows: Flow[]
  onMoveTask?: (id: string, status: TaskStatus) => Promise<boolean>
  onDeleteTask?: (id: string) => Promise<boolean>
  filtersOpen: boolean
  workspaceFilter: string
  flowFilter: string
  agentFilter: string
  onWorkspaceFilterChange: (value: string) => void
  onFlowFilterChange: (value: string) => void
  onAgentFilterChange: (value: string) => void
}) {
  const [dragging, setDragging] = useState<string | null>(null)
  const [runTaskId, setRunTaskId] = useState<string | null>(null)
  const { t } = useI18n()

  const filteredTasks = tasks.filter((task) => {
    if (workspaceFilter !== 'all' && task.workspace_id !== workspaceFilter) return false
    if (flowFilter !== 'all' && task.flow_id !== flowFilter) return false
    if (agentFilter !== 'all' && task.agent_id !== agentFilter) return false
    return true
  })

  const runTask = runTaskId ? tasks.find((t) => t.id === runTaskId) : null
  const runAgent = runTask?.agent_id ? agents.find((a) => a.id === runTask.agent_id) ?? null : null

  function handleMove(id: string, status: TaskStatus) {
    onMoveTask?.(id, status)
  }

  return (
    <div data-testid="task-board-page" className="flex h-full min-h-0 flex-col gap-4 p-6 animate-app-rise">
      <div
        className="grid overflow-hidden transition-all duration-300 ease-in-out"
        style={{ gridTemplateRows: filtersOpen ? '1fr' : '0fr', opacity: filtersOpen ? 1 : 0 }}
      >
        <div className="min-h-0">
          <div className="grid grid-cols-1 gap-2 pb-2 sm:grid-cols-3">
            <Select value={workspaceFilter} onValueChange={(value) => { onWorkspaceFilterChange(value); onFlowFilterChange('all') }}>
              <SelectTrigger className={DROPDOWN_TRIGGER_CLASSES} aria-label={t('tasks.workspaceFilter')}><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="all">{t('tasks.allWorkspaces')}</SelectItem>
                {workspaces.map((workspace) => <SelectItem key={workspace.id} value={workspace.id}>{workspace.name}</SelectItem>)}
              </SelectContent>
            </Select>
            <Select value={flowFilter} onValueChange={onFlowFilterChange}>
              <SelectTrigger className={DROPDOWN_TRIGGER_CLASSES} aria-label={t('tasks.flowFilter')}><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="all">{t('tasks.allFlows')}</SelectItem>
                {flows.filter((flow) => workspaceFilter === 'all' || flow.workspace_id === workspaceFilter).map((flow) => <SelectItem key={flow.id} value={flow.id}>{flow.name}</SelectItem>)}
              </SelectContent>
            </Select>
            <Select value={agentFilter} onValueChange={onAgentFilterChange}>
              <SelectTrigger className={DROPDOWN_TRIGGER_CLASSES} aria-label={t('tasks.agentFilter')}><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="all">{t('tasks.allAgents')}</SelectItem>
                {agents.map((agent) => <SelectItem key={agent.id} value={agent.id}>{agent.name}</SelectItem>)}
              </SelectContent>
            </Select>
          </div>
        </div>
      </div>
      <div className="grid min-h-0 flex-1 grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-4">
        {COLUMNS.map((col) => {
          const items = filteredTasks.filter((t) => t.status === col.id)
          return (
            <Card
              key={col.id}
              className={cn('flex min-h-0 flex-col rounded-xl border-border/80 shadow-[0_1px_2px_rgba(16,24,40,0.04),0_10px_24px_rgba(16,24,40,0.05)]', dragging && 'ring-1 ring-primary/40')}
              onDragOver={(e) => e.preventDefault()}
              onDrop={() => {
                if (dragging) {
                  handleMove(dragging, col.id)
                  setDragging(null)
                }
              }}
            >
              <CardHeader className={cn('flex-row items-center justify-between rounded-t-xl border-b py-2', STATUS_TONE[col.id])}>
                <CardTitle className="text-xs font-semibold uppercase tracking-wide">{t(col.titleKey)}</CardTitle>
                <span className="text-xs text-muted-foreground">{items.length}</span>
              </CardHeader>
              <CardContent className="min-h-0 flex-1 space-y-2 overflow-y-auto p-2">
                {items.length === 0 ? (
                  <p className="text-xs text-muted-foreground text-center py-4">{t('tasks.noTasks')}</p>
                ) : (
                  items.map((task) => (
                    <article
                      key={task.id}
                      draggable
                      onDragStart={() => setDragging(task.id)}
                      onDragEnd={() => setDragging(null)}
                      onClick={() => setRunTaskId(task.id)}
                      className="cursor-grab rounded-lg border bg-card p-3 text-left text-sm shadow-sm transition-colors hover:bg-accent/40 active:cursor-grabbing"
                    >
                      <div className="flex items-start justify-between gap-2">
                        <span className="font-medium text-foreground">{task.title}</span>
                        <div className="flex items-center gap-1 shrink-0">
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-5 w-5 text-[#2F5D5A] hover:text-[#2F5D5A] hover:bg-[#2F5D5A]/10"
                            onClick={(e) => { e.stopPropagation(); setRunTaskId(task.id) }}
                            title={t('agents.runTaskWithAi')}
                          >
                            <Play className="h-3 w-3" />
                          </Button>
                          <ArrowRight className="mt-0.5 h-3.5 w-3.5 text-muted-foreground" />
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-5 w-5 text-destructive hover:text-destructive"
                            onClick={(e) => { e.stopPropagation(); onDeleteTask?.(task.id) }}
                          >
                            <Trash2 className="h-3 w-3" />
                          </Button>
                        </div>
                      </div>
                      {task.brief && (
                        <div className="mt-2 text-xs text-muted-foreground line-clamp-2">{task.brief}</div>
                      )}
                      <div className="mt-1 text-[10px] text-muted-foreground/60 font-mono">{t('common.id', { id: task.id })}</div>
                    </article>
                  ))
                )}
              </CardContent>
            </Card>
          )
        })}
      </div>

      {runTask && (
        <TaskRunDialog
          task={runTask}
          agent={runAgent}
          open={!!runTaskId}
          onOpenChange={(open) => { if (!open) setRunTaskId(null) }}
          onComplete={() => { setRunTaskId(null) }}
        />
      )}
    </div>
  )
}
