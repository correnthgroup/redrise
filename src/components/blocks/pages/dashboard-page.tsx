import type { Workspace } from '@/types/workspace'
import type { Flow } from '@/types/flow'
import type { Task } from '@/types/task'
import type { Agent } from '@/types/agent'
import { FolderOpen, Plus, Sparkles } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { KpiCards } from '../shared/kpi-cards'
import { ChartTabs } from '../shared/chart-tabs'
import { ActivityFeed } from '../shared/activity-feed'
import { OperationsGrid } from '../shared/operations-grid'
import { OnboardingEmpty } from '../shared/onboarding-empty'
import { useI18n } from '@/hooks/use-i18n'

export function DashboardPage({
  firstName,
  onOpenWorkspace,
  onCreateWorkspace,
  workspaces,
  flows,
  tasks,
  agents,
}: {
  firstName?: string
  onOpenWorkspace?: (id: string) => void
  onCreateWorkspace?: () => void
  workspaces: Workspace[]
  flows: Flow[]
  tasks: Task[]
  agents: Agent[]
}) {
  const hasWorkspaces = workspaces.length > 0
  const { t } = useI18n()
  const runningFlows = flows.filter((flow) => flow.status === 'running').length
  const erroredTasks = tasks.filter((task) => task.status === 'error').length
  const activeAgents = agents.filter((agent) => agent.status === 'active').length
  const kpis = [
    { label: t('dashboard.workspacesKpi'), value: String(workspaces.length), delta: t('dashboard.liveFromSupabase'), trend: 'up' as const, series: workspaces.map((_, index) => index + 1) },
    { label: t('dashboard.flowsKpi'), value: String(flows.length), delta: t('dashboard.runningCount', { count: runningFlows }), trend: runningFlows > 0 ? 'up' as const : 'flat' as const, series: flows.map((flow, index) => (flow.status === 'running' ? index + 2 : index + 1)) },
    { label: t('dashboard.tasksKpi'), value: String(tasks.length), delta: t('dashboard.errorCount', { count: erroredTasks }), trend: erroredTasks > 0 ? 'down' as const : 'flat' as const, series: tasks.map((task, index) => (task.status === 'done' ? index + 2 : index + 1)) },
    { label: t('dashboard.agentsKpi'), value: String(agents.length), delta: t('dashboard.activeCount', { count: activeAgents }), trend: activeAgents > 0 ? 'up' as const : 'flat' as const, series: agents.map((agent, index) => (agent.status === 'active' ? index + 2 : index + 1)) },
  ]
  const executionsByDay = tasks.slice(0, 14).map((task) => ({ date: task.updated_at || task.created_at, count: task.status === 'done' ? 3 : task.status === 'error' ? 1 : 2 }))

  return (
    <div data-testid="dashboard-page" className="h-full overflow-y-auto p-6">
      <div className="flex flex-col gap-6">
        <div className="rounded-xl border bg-card px-5 py-4 shadow-[0_1px_2px_rgba(16,24,40,0.04)]">
          <h2 className="text-base font-semibold">{t('dashboard.userWelcome', { name: firstName || 'User' })}</h2>
          <p className="text-sm text-muted-foreground">{t('dashboard.userWelcomeDesc')}</p>
        </div>

        {hasWorkspaces ? (
          <OnboardingEmpty
            workspaces={workspaces}
            onOpenWorkspace={onOpenWorkspace}
          />
        ) : (
          <Card className="border-dashed">
            <CardContent className="flex flex-col items-center justify-center gap-4 py-12 text-center">
              <div className="flex h-14 w-14 items-center justify-center rounded-full bg-accent text-accent-foreground">
                <Sparkles className="h-7 w-7" />
              </div>
              <div className="space-y-1">
                <div className="text-base font-semibold">{t('dashboard.welcome')}</div>
                <div className="text-sm text-muted-foreground">
                  {t('dashboard.welcomeDesc')}
                </div>
              </div>
              {onCreateWorkspace && (
                <Button onClick={onCreateWorkspace} className="mt-2">
                  <Plus className="mr-2 h-4 w-4" />
                  {t('dashboard.newWorkspace')}
                </Button>
              )}
            </CardContent>
          </Card>
        )}

        {hasWorkspaces && (
          <>
            <KpiCards items={kpis} count={7} className="xl:grid-cols-4" />
            <ChartTabs executionsByDay={executionsByDay} />
            <OperationsGrid workspaces={workspaces} flows={flows} tasks={tasks} agents={agents} />
            <ActivityFeed workspaces={workspaces} flows={flows} tasks={tasks} agents={agents} />
          </>
        )}

        {!hasWorkspaces && (
          <Card>
            <CardContent className="flex flex-col items-center justify-center gap-3 py-10 text-center">
              <FolderOpen className="h-8 w-8 text-muted-foreground" />
              <div className="text-sm text-muted-foreground">
                {t('dashboard.willAppear')}
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  )
}
