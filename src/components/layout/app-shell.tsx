import { useState, type ReactNode } from 'react'
import { Plus } from 'lucide-react'
import { useWorkspaces } from '@/hooks/use-workspaces'
import { DashboardPage } from '@/components/blocks/pages/dashboard-page'
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
  user: { name: string; email: string }
  onSignOut: () => void
  defaultPage?: SidebarKey
}

const PAGE_TITLES: Record<SidebarKey, { title: string; subtitle: string }> = {
  dashboard: { title: 'Dashboard', subtitle: 'Overview of workspaces, agents and tasks.' },
  flow: { title: 'Flow', subtitle: 'Build and inspect operational flows.' },
  tasks: { title: 'Tasks', subtitle: 'Track work across backlog and execution.' },
  agents: { title: 'Agents', subtitle: 'Manage AI agents with human control.' },
  analytics: { title: 'Analytics', subtitle: 'Operational metrics, cost and trends.' },
  settings: { title: 'Settings', subtitle: 'Workspace, account and integrations.' },
}

export function AppShell({ user, onSignOut, defaultPage = 'dashboard' }: AppShellProps) {
  const [active, setActive] = useState<SidebarKey>(defaultPage)
  const [dashboardView, setDashboardView] = useState<'board' | 'create-workspace' | 'review-workspace'>('board')
  const [flowView, setFlowView] = useState<'list' | 'builder'>('list')
  const [taskView, setTaskView] = useState<'board' | 'create' | 'review'>('board')
  const [agentView, setAgentView] = useState<'list' | 'create' | 'detail'>('list')
  const [selectedWorkspaceId, setSelectedWorkspaceId] = useState<string | null>(null)
  const { workspaces, addWorkspace } = useWorkspaces()

  function selectPage(next: SidebarKey) {
    setActive(next)
    if (next !== 'dashboard') {
      setDashboardView('board')
      setSelectedWorkspaceId(null)
    }
    if (next !== 'flow') setFlowView('list')
    if (next !== 'tasks') setTaskView('board')
    if (next !== 'agents') setAgentView('list')
  }

  const pageMeta = PAGE_TITLES[active]
  const selectedWorkspace = workspaces.find((workspace) => workspace.id === selectedWorkspaceId)

  let body: ReactNode
  if (active === 'dashboard') {
    body = dashboardView === 'create-workspace'
      ? (
          <CreateWorkspacePage
            onBack={() => setDashboardView('board')}
            onCreate={async ({ name, mission }) => {
              const workspace = await addWorkspace({ name, mission })
              if (workspace) {
                setSelectedWorkspaceId(workspace.id)
                setDashboardView('review-workspace')
              }
            }}
          />
        )
      : dashboardView === 'review-workspace'
        ? <ReviewWorkspacePage workspace={selectedWorkspace} onBack={() => setDashboardView('board')} />
        : (
            <DashboardPage
              workspaces={workspaces}
              onOpenWorkspace={(id) => {
                setSelectedWorkspaceId(id)
                setDashboardView('review-workspace')
              }}
              onCreateWorkspace={() => setDashboardView('create-workspace')}
            />
          )
  } else if (active === 'flow') {
    body = flowView === 'builder'
      ? <FlowBuilderPage onBack={() => setFlowView('list')} />
      : <FlowListPage onCreate={() => setFlowView('builder')} onOpen={() => setFlowView('builder')} />
  } else if (active === 'tasks') {
    body = taskView === 'create'
      ? <CreateTaskPage onBack={() => setTaskView('board')} />
      : taskView === 'review'
        ? <ReviewTaskPage onBack={() => setTaskView('board')} />
        : <TaskBoardPage onCreateTask={() => setTaskView('create')} onOpenTask={() => setTaskView('review')} />
  } else if (active === 'agents') {
    body = agentView === 'create'
      ? <AgentCreatePage onBack={() => setAgentView('list')} />
      : agentView === 'detail'
        ? <AgentDetailPage onBack={() => setAgentView('list')} />
        : <AgentListPage onCreateAgent={() => setAgentView('create')} onOpenAgent={() => setAgentView('detail')} />
  } else if (active === 'analytics') {
    body = <AnalyticsPage />
  } else {
    body = <SettingsPage />
  }

  const topbarActions = active === 'dashboard' && dashboardView === 'board' ? (
    <Button onClick={() => setDashboardView('create-workspace')}>
      <Plus className="h-4 w-4" />
      New Workspace
    </Button>
  ) : null

  return (
    <div className="flex h-full w-full min-h-0">
      <Sidebar active={active} onSelect={selectPage} user={user} onSignOut={onSignOut} />
      <div className="flex min-w-0 flex-1 flex-col">
        <Topbar title={pageMeta.title} subtitle={pageMeta.subtitle} actions={topbarActions} />
        <main className="min-w-0 flex-1 overflow-hidden">{body}</main>
      </div>
    </div>
  )
}
