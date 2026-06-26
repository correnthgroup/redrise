import { useEffect, useState, useRef, type ReactNode } from 'react'
import { Plus, Loader2, Filter } from 'lucide-react'
import { useWorkspaces } from '@/hooks/use-workspaces'
import { useFlows } from '@/hooks/use-flows'
import { useTasks } from '@/hooks/use-tasks'
import { useAgents } from '@/hooks/use-agents'
import { useAnalytics } from '@/hooks/use-analytics'
import { useNotifications } from '@/hooks/use-notifications'
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
import { NotificationsPage } from '@/components/blocks/pages/notifications-page'
import { SettingsPage } from '@/components/blocks/pages/settings-page'
import { SETTING_TITLE_KEYS, type SettingKey } from '@/lib/settings-keys'
import { CreateWorkspacePage } from '@/components/blocks/pages/create-workspace-page'
import { ReviewWorkspacePage } from '@/components/blocks/pages/review-workspace-page'
import { Button } from '@/components/ui/button'
import { BackButton } from '@/components/ui/back-button'
import { AlertDialog, AlertDialogAction, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from '@/components/ui/alert-dialog'
import { Sidebar, type SidebarKey } from './sidebar'
import { Topbar, type TopbarBreadcrumbItem } from './topbar'
import { loadAgentAccessContext, type AgentAccessContext } from '@/lib/team-members'

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
  notifications: { titleKey: 'notifications.title', subtitleKey: 'notifications.subtitle' },
  settings: { titleKey: 'settings.title', subtitleKey: 'settings.subtitle' },
}

export function AppShell({ user, onSignOut, defaultPage = 'dashboard' }: AppShellProps) {
  const [active, setActive] = useState<SidebarKey>(defaultPage)
  const [dashboardView, setDashboardView] = useState<'board' | 'create-workspace' | 'review-workspace'>('board')
  const [flowView, setFlowView] = useState<'list' | 'builder' | 'create'>('list')
  const [taskView, setTaskView] = useState<'board' | 'create' | 'review'>('board')
  const [agentView, setAgentView] = useState<'list' | 'create' | 'detail'>('list')
  const [settingsActive, setSettingsActive] = useState<SettingKey | null>(null)
  const [selectedWorkspaceId, setSelectedWorkspaceId] = useState<string | null>(null)
  const [selectedFlowId, setSelectedFlowId] = useState<string | null>(null)
  const [selectedAgentId, setSelectedAgentId] = useState<string | null>(null)
  const [selectedTaskId, setSelectedTaskId] = useState<string | null>(null)
  const [agentAccess, setAgentAccess] = useState<AgentAccessContext>({ ownerUserId: user.id, function: '', canConfigureAgents: false, canUseAgents: false })
  const [agentAccessLoading, setAgentAccessLoading] = useState(true)
  const [agentAdminDialogOpen, setAgentAdminDialogOpen] = useState(false)
  const flowBuilderSaveRef = useRef<(() => Promise<void>) | null>(null)
  const [flowBuilderSaving, setFlowBuilderSaving] = useState(false)
  const { workspaces, loading: workspacesLoading, addWorkspace, removeWorkspace } = useWorkspaces()
  const { flows, loading: flowsLoading, addFlow, updateFlow, requestApproval, approve, requestAdjustments, markExternalLlm, markRedriseSupport, removeFlow } = useFlows()
  const { tasks, loading: tasksLoading, addTask, moveTask, removeTask } = useTasks()
  const { agents, loading: agentsLoading, addAgent, removeAgent, updateAgent } = useAgents(agentAccess.ownerUserId, agentAccess.canUseAgents)
  const notifications = useNotifications(user.id)
  const analytics = useAnalytics()
  const { t } = useI18n()
  const [taskFiltersOpen, setTaskFiltersOpen] = useState(false)
  const [taskWorkspaceFilter, setTaskWorkspaceFilter] = useState('all')
  const [taskFlowFilter, setTaskFlowFilter] = useState('all')
  const [taskAgentFilter, setTaskAgentFilter] = useState('all')
  const hasActiveTaskFilter = taskWorkspaceFilter !== 'all' || taskFlowFilter !== 'all' || taskAgentFilter !== 'all'

  useEffect(() => {
    let cancelled = false
    void loadAgentAccessContext(user.id).then((context) => {
      if (!cancelled) setAgentAccess(context)
    }).finally(() => {
      if (!cancelled) setAgentAccessLoading(false)
    })
    return () => { cancelled = true }
  }, [user.id])

  const isDataLoading = workspacesLoading || flowsLoading || tasksLoading || agentsLoading || agentAccessLoading || analytics.loading

  function selectPage(next: SidebarKey) {
    setActive(next)
    if (next !== 'dashboard') {
      setDashboardView('board')
      setSelectedWorkspaceId(null)
    }
    if (next !== 'flow') setFlowView('list')
    if (next !== 'tasks') {
      setTaskView('board')
      setSelectedTaskId(null)
    }
    if (next !== 'agents') {
      setAgentView('list')
      setSelectedAgentId(null)
    }
    if (next !== 'settings') setSettingsActive(null)
  }

  const selectedWorkspace = workspaces.find((workspace) => workspace.id === selectedWorkspaceId)
  const selectedFlow = flows.find((flow) => flow.id === selectedFlowId)
  const selectedTask = tasks.find((task) => task.id === selectedTaskId)
  const selectedAgent = agents.find((agent) => agent.id === selectedAgentId)
  const selectedWorkspaceNotifications = selectedWorkspaceId
    ? notifications.notifications.filter((notification) => notification.workspace_id === selectedWorkspaceId && notification.action_status === 'pending')
    : []
  const pageTitleKeys = PAGE_TITLE_KEYS[active]
  const pageMeta = active === 'dashboard' && dashboardView === 'review-workspace' && selectedWorkspace
    ? { title: selectedWorkspace.name, subtitle: t('workspace.details') }
    : { title: t(pageTitleKeys.titleKey), subtitle: t(pageTitleKeys.subtitleKey) }

  const breadcrumbs: TopbarBreadcrumbItem[] = (() => {
    if (active === 'dashboard') {
      if (dashboardView === 'create-workspace') {
        return [
          { label: t('dashboard.title'), onClick: () => setDashboardView('board') },
          { label: t('workspace.new') },
        ]
      }

      if (dashboardView === 'review-workspace') {
        return [
          { label: t('dashboard.title'), onClick: () => setDashboardView('board') },
          { label: selectedWorkspace?.name ?? t('workspace.details') },
        ]
      }

      return [{ label: t('dashboard.title') }]
    }

    if (active === 'flow') {
      if (flowView === 'create') {
        return [
          { label: t('flow.title'), onClick: () => setFlowView('list') },
          { label: t('flow.newFlow') },
        ]
      }

      if (flowView === 'builder') {
        return [
          { label: t('flow.title'), onClick: () => { setFlowView('list'); setSelectedFlowId(null) } },
          { label: selectedFlow?.name ?? t('flow.title') },
        ]
      }

      return [{ label: t('flow.title') }]
    }

    if (active === 'tasks') {
      if (taskView === 'create') {
        return [
          { label: t('tasks.title'), onClick: () => setTaskView('board') },
          { label: t('tasks.newTask') },
        ]
      }

      if (taskView === 'review') {
        return [
          { label: t('tasks.title'), onClick: () => { setTaskView('board'); setSelectedTaskId(null) } },
          { label: selectedTask?.title ?? t('tasks.title') },
        ]
      }

      return [{ label: t('tasks.title') }]
    }

    if (active === 'agents') {
      if (agentView === 'create') {
        return [
          { label: t('agents.title'), onClick: () => setAgentView('list') },
          { label: t('agents.newAgent') },
        ]
      }

      if (agentView === 'detail') {
        return [
          { label: t('agents.title'), onClick: () => { setAgentView('list'); setSelectedAgentId(null) } },
          { label: selectedAgent?.name ?? t('agents.title') },
        ]
      }

      return [{ label: t('agents.title') }]
    }

    if (active === 'settings') {
      if (settingsActive) {
        return [
          { label: t('settings.title'), onClick: () => setSettingsActive(null) },
          { label: t(SETTING_TITLE_KEYS[settingsActive]) },
        ]
      }

      return [{ label: t('settings.title') }]
    }

    if (active === 'notifications') return [{ label: t('notifications.title') }]

    return [{ label: t('analytics.title') }]
  })()

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
        ? <ReviewWorkspacePage workspace={selectedWorkspace} notifications={selectedWorkspaceNotifications} onMarkNotificationRead={notifications.markRead} onMarkNotificationUnread={notifications.markUnread} onResolveNotification={notifications.resolve} onBack={() => setDashboardView('board')} onDelete={async () => {
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
    body = flowView === 'builder'
      ? <FlowBuilderPage flowId={selectedFlowId} onSaveRef={flowBuilderSaveRef} onSave={() => { setFlowView('list'); setSelectedFlowId(null) }} onMarkExternalLlm={markExternalLlm} />
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
        : <FlowListPage flows={flows} onUpdate={updateFlow} onDelete={removeFlow} onRequestApproval={requestApproval} onApprove={approve} onRequestAdjustments={requestAdjustments} onMarkRedriseSupport={markRedriseSupport} onOpen={(id) => { setSelectedFlowId(id); setFlowView('builder') }} />
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
        ? <ReviewTaskPage taskId={selectedTaskId ?? ''} onBack={() => { setTaskView('board'); setSelectedTaskId(null) }} />
        : <TaskBoardPage tasks={tasks} agents={agents} workspaces={workspaces} flows={flows} onMoveTask={moveTask} onDeleteTask={removeTask} onOpenTask={(id) => { setSelectedTaskId(id); setTaskView('review') }} filtersOpen={taskFiltersOpen} workspaceFilter={taskWorkspaceFilter} flowFilter={taskFlowFilter} agentFilter={taskAgentFilter} onWorkspaceFilterChange={setTaskWorkspaceFilter} onFlowFilterChange={setTaskFlowFilter} onAgentFilterChange={setTaskAgentFilter} />
  } else if (active === 'agents') {
    body = agentView === 'create'
      ? <AgentCreatePage
          ownerUserId={agentAccess.ownerUserId}
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
            canManageAgents={agentAccess.canConfigureAgents}
            canUseAgents={agentAccess.canUseAgents}
            onDeleteAgent={async (id) => {
              await removeAgent(id)
            }}
            onRenameAgent={async (id, name) => {
              return await updateAgent(id, { name })
            }}
            onOpenAgent={(id) => {
              setSelectedAgentId(id)
              setAgentView('detail')
            }}
          />
  } else if (active === 'analytics') {
    body = <AnalyticsPage analytics={analytics} flows={flows} tasks={tasks} agents={agents} notifications={notifications.notifications} />
  } else if (active === 'notifications') {
    body = (
      <NotificationsPage
        notifications={notifications.notifications}
        loading={notifications.loading}
        onMarkRead={notifications.markRead}
        onMarkUnread={notifications.markUnread}
        onResolve={notifications.resolve}
      />
    )
  } else {
    body = <SettingsPage user={user} activeSetting={settingsActive} onActiveSettingChange={setSettingsActive} />
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
  ) : active === 'flow' && flowView === 'builder' ? (
    <>
      <BackButton onClick={() => { setFlowView('list'); setSelectedFlowId(null) }} label={t('common.cancel')} />
      <Button size="sm" onClick={async () => { setFlowBuilderSaving(true); await flowBuilderSaveRef.current?.(); setFlowBuilderSaving(false) }} disabled={flowBuilderSaving}>
        {flowBuilderSaving ? t('flowBuilder.saving') : t('common.save')}
      </Button>
    </>
  ) : active === 'tasks' && taskView === 'board' ? (
    <>
      <Button variant="outline" size="sm" onClick={() => setTaskFiltersOpen((prev) => !prev)} className="relative gap-1.5">
        <Filter className="h-4 w-4" />
        {t('tasks.filters')}
        {hasActiveTaskFilter && (
          <span className="absolute -top-1 -right-1 h-2 w-2 rounded-full bg-red-500" />
        )}
      </Button>
      <Button data-testid="tasks-new-task" onClick={() => setTaskView('create')}>
        <Plus className="h-4 w-4" />
        {t('tasks.newTask')}
      </Button>
    </>
  ) : active === 'agents' && agentView === 'list' ? (
    <Button data-testid="agents-new-agent" onClick={() => agentAccess.canConfigureAgents ? setAgentView('create') : setAgentAdminDialogOpen(true)}>
      <Plus className="h-4 w-4" />
      {t('agents.newAgent')}
    </Button>
  ) : null

  return (
    <div className="flex h-full w-full min-h-0">
      <Sidebar active={active} onSelect={selectPage} user={user} onSignOut={onSignOut} workspaces={workspaces} flows={flows} tasks={tasks} agents={agents} analytics={analytics} pendingNotificationsCount={notifications.pendingCount} />
      <div className="flex min-w-0 flex-1 flex-col">
        <Topbar title={pageMeta.title} subtitle={pageMeta.subtitle} breadcrumbs={breadcrumbs} actions={topbarActions} />
        <main className="min-w-0 flex-1 overflow-hidden">{body}</main>
      </div>
      <AlertDialog open={agentAdminDialogOpen} onOpenChange={setAgentAdminDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>{t('agents.contactAdminTitle')}</AlertDialogTitle>
            <AlertDialogDescription>{t('agents.contactAdminDesc')}</AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogAction>{t('common.ok')}</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}
