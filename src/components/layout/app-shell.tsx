import { useState, type ReactNode } from 'react'
import { Plus, Loader2 } from 'lucide-react'
import { useWorkspaces } from '@/hooks/use-workspaces'
import { useFlows } from '@/hooks/use-flows'
import { useTasks } from '@/hooks/use-tasks'
import { useAgents } from '@/hooks/use-agents'
import { useAnalytics } from '@/hooks/use-analytics'
import { useI18n } from '@/hooks/use-i18n'
import { DashboardPage } from '@/components/blocks/pages/dashboard-page'
import { CreateFlowPage } from '@/components/blocks/pages/create-flow-page'
import { FlowBuilderPage } from '@/components/blocks/pages/flow-builder-page'
import { FlowListPage } from '@/components/blocks/pages/flow-list-page'
import { TaskBoardPage } from '@/components/blocks/pages/task-board-page'
import { CreateTaskPage } from '@/components/blocks/pages/create-task-page'
import { ReviewTaskPage } from '@/components/blocks/pages/review-task-page'
import { AgentListPage } from '@/components/blocks/pages/agent-list-page'
import { AgentCreatePage } from '@/components/blocks/pages/agent-create-page'
import { AgentDetailPage } from '@/components/blocks/pages/agent-detail-page'
import { AnalyticsPage } from '@/components/blocks/pages/analytics-page'
import { SettingsPage } from '@/components/blocks/pages/settings-page'
import { CreateWorkspacePage } from '@/components/blocks/pages/create-workspace-page'
import { ReviewWorkspacePage } from '@/components/blocks/pages/review-workspace-page'
import { Button } from '@/components/ui/button'
import { Sidebar, type SidebarKey } from './sidebar'
import { Topbar } from './topbar'

type AppShellProps = {
  user: { id: string; name: string; firstName: string; email: string; avatarUrl?: string | null }
  onSignOut: () => void | Promise<void>
  defaultPage?: SidebarKey
}

const PAGE_TITLE_KEYS: Record<SidebarKey, { titleKey: string; subtitleKey: string }> = {
  dashboard: { titleKey: 'dashboard.title', subtitleKey: 'dashboard.subtitle' },
  flow: { titleKey: 'flow.title', subtitleKey: 'flow.subtitle' },
  tasks: { titleKey: 'tasks.title', subtitleKey: 'tasks.subtitle' },
  agents: { titleKey: 'agents.title', subtitleKey: 'agents.subtitle' },
  analytics: { titleKey: 'analytics.title', subtitleKey: 'analytics.subtitle' },
  settings: { titleKey: 'settings.title', subtitleKey: 'settings.subtitle' },
}

export function AppShell({ user, onSignOut, defaultPage = 'dashboard' }: AppShellProps) {
  const [active, setActive] = useState<SidebarKey>(defaultPage)
  const [dashboardView, setDashboardView] = useState<'board' | 'create-workspace' | 'review-workspace'>('board')
  const [flowView, setFlowView] = useState<'list' | 'builder' | 'create'>('list')
  const [taskView, setTaskView] = useState<'board' | 'create' | 'review'>('board')
  const [agentView, setAgentView] = useState<'list' | 'create' | 'detail'>('list')
  const [selectedWorkspaceId, setSelectedWorkspaceId] = useState<string | null>(null)
  const [selectedFlowId, setSelectedFlowId] = useState<string | null>(null)
  const [selectedAgentId, setSelectedAgentId] = useState<string | null>(null)
  const { workspaces, loading: workspacesLoading, addWorkspace, removeWorkspace } = useWorkspaces()
  const { flows, loading: flowsLoading, addFlow, updateFlow, removeFlow } = useFlows()
  const { tasks, loading: tasksLoading, addTask, moveTask, removeTask } = useTasks()
  const { agents, loading: agentsLoading, addAgent, removeAgent } = useAgents()
  const analytics = useAnalytics()
  const { t } = useI18n()

  const isDataLoading = workspacesLoading || flowsLoading || tasksLoading || agentsLoading || analytics.loading

  function selectPage(next: SidebarKey) {
    setActive(next)
    if (next !== 'dashboard') {
      setDashboardView('board')
      setSelectedWorkspaceId(null)
    }
    if (next !== 'flow') setFlowView('list')
    if (next !== 'tasks') setTaskView('board')
    if (next !== 'agents') {
      setAgentView('list')
      setSelectedAgentId(null)
    }
  }

  const selectedWorkspace = workspaces.find((workspace) => workspace.id === selectedWorkspaceId)
  const pageTitleKeys = PAGE_TITLE_KEYS[active]
  const pageMeta = active === 'dashboard' && dashboardView === 'review-workspace' && selectedWorkspace
    ? { title: selectedWorkspace.name, subtitle: t('workspace.details') }
    : { title: t(pageTitleKeys.titleKey), subtitle: t(pageTitleKeys.subtitleKey) }

  let body: ReactNode

  if (isDataLoading) {
    body = (
      <div className="flex h-full items-center justify-center">
        <div className="flex flex-col items-center gap-3">
          <Loader2 className="h-6 w-6 animate-spin text-[#2F5D5A]" />
          <p className="text-sm text-muted-foreground">{t('common.loadingData')}</p>
        </div>
      </div>
    )
  } else if (active === 'dashboard') {
    body = dashboardView === 'create-workspace'
      ? (
          <CreateWorkspacePage
            onBack={() => setDashboardView('board')}
            onCreate={async ({ name, mission }) => {
              const result = await addWorkspace({ name, mission })
              if (result) {
                setDashboardView('board')
              }
              return result
            }}
          />
        )
      : dashboardView === 'review-workspace'
        ? <ReviewWorkspacePage workspace={selectedWorkspace} onBack={() => setDashboardView('board')} onDelete={async () => {
            if (selectedWorkspace?.id) {
              await removeWorkspace(selectedWorkspace.id)
            }
            setDashboardView('board')
          }} />
        : (
            <DashboardPage
              firstName={user.firstName}
              workspaces={workspaces}
              flows={flows}
              tasks={tasks}
              agents={agents}
              onOpenWorkspace={(id) => {
                setSelectedWorkspaceId(id)
                setDashboardView('review-workspace')
              }}
              onCreateWorkspace={() => setDashboardView('create-workspace')}
            />
          )
  } else if (active === 'flow') {
    const selectedFlow = flows.find((f) => f.id === selectedFlowId)
    body = flowView === 'builder'
      ? <FlowBuilderPage flowId={selectedFlowId} flowName={selectedFlow?.name} onBack={() => { setFlowView('list'); setSelectedFlowId(null) }} onSave={() => { setFlowView('list'); setSelectedFlowId(null) }} />
      : flowView === 'create'
        ? <CreateFlowPage
            onBack={() => setFlowView('list')}
            workspaces={workspaces}
            onCreate={async ({ name, workspaceId, members }) => {
              const result = await addFlow({ name, workspace_id: workspaceId, members })
              if (result) {
                setFlowView('list')
              }
              return result
            }}
          />
        : <FlowListPage flows={flows} onUpdate={updateFlow} onDelete={removeFlow} onOpen={(id) => { setSelectedFlowId(id); setFlowView('builder') }} />
  } else if (active === 'tasks') {
    body = taskView === 'create'
      ? <CreateTaskPage
          onBack={() => setTaskView('board')}
          onCreate={async (input) => {
            const result = await addTask(input)
            if (result) {
              setTaskView('board')
            }
            return result
          }}
        />
      : taskView === 'review'
        ? <ReviewTaskPage onBack={() => setTaskView('board')} />
        : <TaskBoardPage tasks={tasks} agents={agents} workspaces={workspaces} flows={flows} onMoveTask={moveTask} onDeleteTask={removeTask} />
  } else if (active === 'agents') {
    body = agentView === 'create'
      ? <AgentCreatePage
          onBack={() => setAgentView('list')}
          onCreate={async (input) => {
            const result = await addAgent(input)
            if (result) {
              setAgentView('list')
            }
            return result
          }}
        />
      : agentView === 'detail'
        ? <AgentDetailPage agentId={selectedAgentId ?? ''} onBack={() => { setAgentView('list'); setSelectedAgentId(null) }} />
        : <AgentListPage
            agents={agents}
            loading={agentsLoading}
            onDeleteAgent={async (id) => {
              await removeAgent(id)
            }}
            onOpenAgent={(id) => {
              setSelectedAgentId(id)
              setAgentView('detail')
            }}
          />
  } else if (active === 'analytics') {
    body = <AnalyticsPage />
  } else {
    body = <SettingsPage user={user} />
  }

  const topbarActions = active === 'dashboard' && dashboardView === 'board' ? (
    <Button data-testid="dashboard-new-workspace" onClick={() => setDashboardView('create-workspace')}>
      <Plus className="h-4 w-4" />
      {t('dashboard.newWorkspace')}
    </Button>
  ) : active === 'flow' && flowView === 'list' ? (
    <Button data-testid="flow-new-flow" onClick={() => setFlowView('create')}>
      <Plus className="h-4 w-4" />
      {t('flow.newFlow')}
    </Button>
  ) : active === 'tasks' && taskView === 'board' ? (
    <Button data-testid="tasks-new-task" onClick={() => setTaskView('create')}>
      <Plus className="h-4 w-4" />
      {t('tasks.newTask')}
    </Button>
  ) : active === 'agents' && agentView === 'list' ? (
    <Button data-testid="agents-new-agent" onClick={() => setAgentView('create')}>
      <Plus className="h-4 w-4" />
      {t('agents.newAgent')}
    </Button>
  ) : null

  return (
    <div className="flex h-full w-full min-h-0">
      <Sidebar active={active} onSelect={selectPage} user={user} onSignOut={onSignOut} workspaces={workspaces} flows={flows} tasks={tasks} agents={agents} analytics={analytics} />
      <div className="flex min-w-0 flex-1 flex-col">
        <Topbar title={pageMeta.title} subtitle={pageMeta.subtitle} actions={topbarActions} />
        <main className="min-w-0 flex-1 overflow-hidden">{body}</main>
      </div>
    </div>
  )
}
