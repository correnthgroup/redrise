import { useCallback, useState } from 'react'
import {
  BarChart3,
  ChevronsLeft,
  Cog,
  LayoutDashboard,
  Lightbulb,
  ListChecks,
  LogOut,
  Network,
  Settings as SettingsIcon,
  Users,
} from 'lucide-react'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'
import { useI18n } from '@/hooks/use-i18n'
import type { Workspace } from '@/types/workspace'
import type { Flow } from '@/types/flow'
import type { Task } from '@/types/task'
import type { AnalyticsData } from '@/hooks/use-analytics'

export type SidebarAgent = {
  id: string
  name: string
  status: 'active' | 'paused' | 'error' | 'idle'
}

export type SidebarKey =
  | 'dashboard'
  | 'flow'
  | 'tasks'
  | 'agents'
  | 'analytics'
  | 'notifications'
  | 'settings'

type SidebarUser = { name: string; email: string; avatarUrl?: string | null }

type SidebarProps = {
  active: SidebarKey
  onSelect: (key: SidebarKey) => void
  user: SidebarUser
  onSignOut: () => void | Promise<void>
  workspaces?: Workspace[]
  flows?: Flow[]
  tasks?: Task[]
  agents?: SidebarAgent[]
  analytics?: AnalyticsData
  pendingNotificationsCount?: number
}

const COLLAPSED_KEY = 'app:sidebar:collapsed'

type MainSidebarKey = Exclude<SidebarKey, 'notifications'>

const NAV_ITEMS: { key: MainSidebarKey; labelKey: string; icon: React.ComponentType<{ className?: string }> }[] = [
  { key: 'dashboard', labelKey: 'nav.dashboard', icon: LayoutDashboard },
  { key: 'flow', labelKey: 'nav.flow', icon: Network },
  { key: 'tasks', labelKey: 'nav.tasks', icon: ListChecks },
  { key: 'agents', labelKey: 'nav.agents', icon: Users },
  { key: 'analytics', labelKey: 'nav.analytics', icon: BarChart3 },
  { key: 'settings', labelKey: 'nav.settings', icon: SettingsIcon },
]

const CONTEXT_BY_KEY: Record<SidebarKey, { titleKey: string; rows: { key: string; params?: Record<string, string | number> }[] } | null> = {
  dashboard: null,
  flow: null,
  tasks: null,
  agents: null,
  analytics: null,
  notifications: null,
  settings: null,
}

function loadCollapsed(): boolean {
  if (typeof window === 'undefined') return false
  try {
    return window.localStorage.getItem(COLLAPSED_KEY) === '1'
  } catch {
    return false
  }
}

function persistCollapsed(v: boolean) {
  if (typeof window === 'undefined') return
  try {
    window.localStorage.setItem(COLLAPSED_KEY, v ? '1' : '0')
  } catch {
    /* ignore */
  }
}

function initials(name: string) {
  return name
    .split(/\s+/)
    .map((p) => p[0])
    .filter(Boolean)
    .slice(0, 2)
    .join('')
    .toUpperCase()
}

export function Sidebar({ active, onSelect, user, onSignOut, workspaces = [], flows = [], tasks = [], agents = [], analytics, pendingNotificationsCount = 0 }: SidebarProps) {
  const [collapsed, setCollapsed] = useState(() => loadCollapsed())
  const { t } = useI18n()
  const showLabels = !collapsed
  const context = CONTEXT_BY_KEY[active]
  const dashboardContext = active === 'dashboard' ? {
    titleKey: 'sidebar.workspacesStatus',
    rows: workspaces.length === 0
      ? [{ key: 'sidebar.wsEmpty' as string, params: undefined }]
      : workspaces.slice(0, 4).map((ws) => ({
          key: ws.status === 'healthy' ? 'sidebar.wsHealthy' : ws.status === 'maintenance' ? 'sidebar.wsWarning' : 'sidebar.wsPending',
          params: { name: ws.name },
        })),
  } : null
  const flowContext = active === 'flow' ? {
    titleKey: 'sidebar.flowStatus',
    rows: flows.length === 0
      ? [{ key: 'sidebar.flowEmpty' as string, params: undefined }]
      : flows.slice(0, 4).map((f) => ({
          key: f.status === 'running' ? 'sidebar.flowRunning' : f.status === 'paused' ? 'sidebar.flowPaused' : 'sidebar.flowError',
          params: { name: f.name },
        })),
  } : null
  const taskContext = active === 'tasks' ? {
    titleKey: 'sidebar.summary',
    rows: tasks.length === 0
      ? [{ key: 'sidebar.wsEmpty' as string, params: undefined }]
      : (() => {
          const now = new Date()
          const weekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000)
          const backlog = tasks.filter((t) => t.status === 'backlog').length
          const inProgress = tasks.filter((t) => t.status === 'in-progress').length
          const inReview = tasks.filter((t) => t.status === 'in-review').length
          const doneWeek = tasks.filter((t) => t.status === 'done' && new Date(t.updated_at) >= weekAgo).length
          return [
            { key: 'sidebar.tasksInBacklog' as string, params: { count: String(backlog) } },
            { key: 'sidebar.tasksInProgress' as string, params: { count: String(inProgress) } },
            { key: 'sidebar.tasksInReview' as string, params: { count: String(inReview) } },
            { key: 'sidebar.tasksDoneWeek' as string, params: { count: String(doneWeek) } },
          ]
        })(),
  } : null
  const agentsContext = active === 'agents' && agents && agents.length > 0 ? {
    titleKey: 'sidebar.agentStatus',
    rows: [
      {
        key: 'sidebar.agentsRunning',
        params: { count: String(agents.filter((agent) => agent.status === 'active').length) },
      },
      {
        key: 'sidebar.agentsPaused',
        params: { count: String(agents.filter((agent) => agent.status === 'paused').length) },
      },
      {
        key: 'sidebar.agentsError',
        params: { count: String(agents.filter((agent) => agent.status === 'error').length) },
      },
      {
        key: 'sidebar.agentsIdle',
        params: { count: String(agents.filter((agent) => agent.status === 'idle').length) },
      },
    ],
  } : null

  const analyticsContext = active === 'analytics' && analytics && !analytics.loading && analytics.taskCount >= 0 && analytics.agentCount >= 0 ? {
    titleKey: 'sidebar.quickStats',
    rows: [
      { key: 'sidebar.statWowTasks', params: { value: String(analytics.taskCount) } },
      { key: 'sidebar.statActiveAgents', params: { value: String(analytics.agentCount) } },
      { key: 'sidebar.statUptime', params: { value: String(analytics.approvalRate) } },
      { key: 'sidebar.statLatency', params: { value: String(analytics.errorRate) } },
    ],
  } : null

  const activeContext = active === 'dashboard' ? dashboardContext : active === 'flow' ? flowContext : active === 'tasks' ? taskContext : active === 'analytics' ? analyticsContext : active === 'agents' ? agentsContext : context
  const iconLaneClassName = 'grid-cols-[37px_minmax(0,1fr)]'

  const toggle = useCallback(() => {
    if (document.activeElement instanceof HTMLElement) {
      document.activeElement.blur()
    }

    setCollapsed((prev) => {
      const next = !prev
      persistCollapsed(next)
      return next
    })
  }, [])

  return (
        <aside
          data-collapsed={showLabels ? 'false' : 'true'}
          className={cn(
            'flex h-full shrink-0 flex-col border-r border-border bg-header text-header-foreground transition-[width] duration-300 ease-[cubic-bezier(0.22,1,0.36,1)] will-change-[width]',
            showLabels ? 'w-64' : 'w-[53px]',
          )}
          aria-label="Primary navigation"
      >
        <div className="flex h-16 items-center gap-2 px-3">
          <button
            type="button"
            onClick={showLabels ? undefined : toggle}
            aria-label={showLabels ? 'Brand mark' : 'Expand sidebar'}
            className={cn(
              'flex h-8 w-8 shrink-0 -translate-x-[1.6px] items-center justify-center rounded-full transition-opacity',
              showLabels ? 'cursor-default' : 'cursor-pointer hover:opacity-90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring',
            )}
          >
            <img src="/logo-32.png" alt="Redrise" className="h-8 w-8 rounded-full object-cover" />
          </button>

          <div
            className={cn(
              'min-w-0 flex-1 overflow-hidden text-left transition-[opacity] duration-200 ease-out',
              showLabels ? 'opacity-100' : 'opacity-0 pointer-events-none',
            )}
          >
            <div className="truncate text-sm font-semibold leading-tight text-header-foreground">Redrise</div>
            <div className="truncate text-[11px] text-muted-foreground">{t('sidebar.brandTagline')}</div>
          </div>

          <Button
            variant="ghost"
            size="icon"
            onClick={toggle}
            aria-label={t('sidebar.collapse')}
              className={cn(
                'h-8 w-8 shrink-0 text-header-foreground transition-opacity duration-150 ease-out hover:bg-muted hover:text-foreground',
                showLabels ? 'opacity-100' : 'pointer-events-none opacity-0',
              )}
            tabIndex={showLabels ? 0 : -1}
          >
            <ChevronsLeft className="h-4 w-4" />
          </Button>
        </div>

        <nav className="flex-1 overflow-y-auto p-2">
          <ul className="flex flex-col gap-1">
            {NAV_ITEMS.map((item) => {
              const Icon = item.icon
              const isActive = item.key === active

              return (
                <li key={item.key}>
                  <button
                    type="button"
                    data-testid={`sidebar-nav-${item.key}`}
                    onClick={() => onSelect(item.key)}
                    className={cn(
                      'grid h-9 w-full items-center rounded-md text-sm transition-colors',
                      iconLaneClassName,
                      'text-muted-foreground hover:bg-muted hover:text-foreground',
                      'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring',
                      isActive && 'bg-primary text-primary-foreground font-medium',
                    )}
                    aria-current={isActive ? 'page' : undefined}
                  >
                    <span className="flex h-4 w-4 justify-self-center">
                      <Icon className="h-4 w-4 shrink-0" />
                    </span>
                    <span
                      className={cn(
                        'min-w-0 overflow-hidden whitespace-nowrap transition-opacity duration-200 ease-out',
                        showLabels ? 'opacity-100' : 'opacity-0',
                      )}
                    >
                      <span className="block truncate pl-2 pr-2 text-left">{t(item.labelKey)}</span>
                    </span>
                  </button>
                </li>
              )
            })}
          </ul>

          <div className="my-3 border-t border-border/70 pt-3">
            <button
              type="button"
              data-testid="sidebar-nav-notifications"
              onClick={() => onSelect('notifications')}
              className={cn(
                'grid h-9 w-full items-center rounded-md text-sm transition-colors',
                iconLaneClassName,
                'text-muted-foreground hover:bg-muted hover:text-foreground',
                'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring',
                active === 'notifications' && 'bg-primary text-primary-foreground font-medium',
              )}
              aria-current={active === 'notifications' ? 'page' : undefined}
              aria-label={t('notifications.title')}
            >
              <span className="relative flex h-4 w-4 justify-self-center">
                <Lightbulb className="h-4 w-4 shrink-0" />
                {pendingNotificationsCount > 0 && (
                  <span className="absolute -right-1.5 -top-1.5 h-2.5 w-2.5 rounded-full bg-red-500 ring-2 ring-header" />
                )}
              </span>
              <span
                className={cn(
                  'min-w-0 overflow-hidden whitespace-nowrap transition-opacity duration-200 ease-out',
                  showLabels ? 'opacity-100' : 'opacity-0',
                )}
              >
                <span className="flex min-w-0 items-center justify-between gap-2 pl-2 pr-2 text-left">
                  <span className="truncate">{t('notifications.title')}</span>
                  {pendingNotificationsCount > 0 && (
                    <span className="rounded-full bg-red-500 px-1.5 py-0.5 text-[10px] font-medium leading-none text-white">
                      {pendingNotificationsCount > 99 ? '99+' : pendingNotificationsCount}
                    </span>
                  )}
                </span>
              </span>
            </button>
          </div>

          {activeContext && showLabels && (
            <div className="mt-4 rounded-lg border border-border bg-muted p-3 text-xs">
              <div className="mb-1.5 font-medium text-foreground">{t(activeContext.titleKey)}</div>
              <ul className="space-y-1 text-muted-foreground">
                {activeContext.rows.map((row) => (
                  <li key={row.key + JSON.stringify(row.params ?? {})} className="truncate">{t(row.key, row.params)}</li>
                ))}
              </ul>
            </div>
          )}
        </nav>

        <div className="flex items-center gap-2 p-3">
          <Avatar className="h-8 w-8 shrink-0 -translate-x-[1.6px]">
            {user.avatarUrl ? <AvatarImage src={user.avatarUrl} alt={user.name} /> : null}
            <AvatarFallback className="bg-border text-foreground">{initials(user.name) || 'U'}</AvatarFallback>
          </Avatar>
          <div
            className={cn(
              'min-w-0 flex-1 overflow-hidden text-left transition-opacity duration-200 ease-out',
              showLabels ? 'opacity-100' : 'opacity-0 pointer-events-none',
            )}
          >
            <div className="truncate text-sm font-medium leading-tight">{user.name}</div>
            <div className="truncate text-xs text-muted-foreground">{user.email}</div>
          </div>
          <div
            className={cn(
              'flex shrink-0 items-center gap-1 overflow-hidden transition-[opacity,max-width] duration-150 ease-out',
              showLabels ? 'max-w-20 opacity-100' : 'pointer-events-none max-w-0 opacity-0',
            )}
          >
            <Button
              variant="ghost"
              size="icon"
              aria-label={t('sidebar.openSettings')}
              onClick={() => onSelect('settings')}
              className="h-8 w-8 text-muted-foreground hover:bg-muted hover:text-foreground"
              tabIndex={showLabels ? 0 : -1}
            >
              <Cog className="h-4 w-4" />
            </Button>
            <Button
              variant="ghost"
              size="icon"
              aria-label={t('sidebar.signOut')}
              onClick={onSignOut}
              className="h-8 w-8 text-muted-foreground hover:bg-muted hover:text-foreground"
              tabIndex={showLabels ? 0 : -1}
            >
              <LogOut className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </aside>
  )
}
