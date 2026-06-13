import { useCallback, useState } from 'react'
import {
  BarChart3,
  Bot,
  ChevronsLeft,
  Cog,
  LayoutDashboard,
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

export type SidebarKey =
  | 'dashboard'
  | 'flow'
  | 'tasks'
  | 'agents'
  | 'analytics'
  | 'settings'

type SidebarUser = { name: string; email: string; avatarUrl?: string | null }

type SidebarProps = {
  active: SidebarKey
  onSelect: (key: SidebarKey) => void
  user: SidebarUser
  onSignOut: () => void
}

const COLLAPSED_KEY = 'app:sidebar:collapsed'

const NAV_ITEMS: { key: SidebarKey; labelKey: string; icon: React.ComponentType<{ className?: string }> }[] = [
  { key: 'dashboard', labelKey: 'nav.dashboard', icon: LayoutDashboard },
  { key: 'flow', labelKey: 'nav.flow', icon: Network },
  { key: 'tasks', labelKey: 'nav.tasks', icon: ListChecks },
  { key: 'agents', labelKey: 'nav.agents', icon: Users },
  { key: 'analytics', labelKey: 'nav.analytics', icon: BarChart3 },
  { key: 'settings', labelKey: 'nav.settings', icon: SettingsIcon },
]

const CONTEXT_BY_KEY: Record<SidebarKey, { title: string; rows: string[] } | null> = {
  dashboard: {
    title: 'Workspaces status',
    rows: ['Workspace A · healthy', 'Workspace B · warning', 'Workspace C · healthy', 'Workspace D · stopped'],
  },
  flow: {
    title: 'Flow status',
    rows: ['Flow X · running', 'Flow Y · paused', 'Flow Z · running', 'Flow W · error'],
  },
  tasks: {
    title: 'Summary',
    rows: ['12 in backlog', '4 in progress', '3 in review', '27 done this week'],
  },
  agents: {
    title: 'Agent status',
    rows: ['8 running', '2 paused', '1 error', '3 idle'],
  },
  analytics: {
    title: 'Quick stats',
    rows: ['+12% WoW tasks', '+4% active agents', '98.2% uptime', '42ms p95 latency'],
  },
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

export function Sidebar({ active, onSelect, user, onSignOut }: SidebarProps) {
  const [collapsed, setCollapsed] = useState(() => loadCollapsed())
  const { t } = useI18n()
  const showLabels = !collapsed
  const context = CONTEXT_BY_KEY[active]
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
            'flex h-full shrink-0 flex-col border-r border-white/10 bg-header text-header-foreground transition-[width] duration-300 ease-[cubic-bezier(0.22,1,0.36,1)] will-change-[width]',
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
              'flex h-9 w-9 shrink-0 -translate-x-[3.5px] items-center justify-center rounded-full bg-primary text-primary-foreground transition-opacity',
              showLabels ? 'cursor-default' : 'cursor-pointer hover:opacity-90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring',
            )}
          >
            <Bot className="h-4 w-4" />
          </button>

          <div
            className={cn(
              'min-w-0 flex-1 overflow-hidden text-left transition-[opacity] duration-200 ease-out',
              showLabels ? 'opacity-100' : 'opacity-0 pointer-events-none',
            )}
          >
            <div className="truncate text-sm font-semibold leading-tight text-header-foreground">Redrise</div>
            <div className="truncate text-[11px] text-white/60">Operational AI workspace</div>
          </div>

          <Button
            variant="ghost"
            size="icon"
            onClick={toggle}
            aria-label="Collapse sidebar"
              className={cn(
                'h-8 w-8 shrink-0 text-header-foreground transition-opacity duration-150 ease-out hover:bg-white/10 hover:text-white',
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
                    onClick={() => onSelect(item.key)}
                    className={cn(
                      'grid h-9 w-full items-center rounded-md text-sm transition-colors',
                      iconLaneClassName,
                      'text-white/72 hover:bg-white/10 hover:text-white',
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

          {context && showLabels && (
            <div className="mt-4 rounded-lg border border-white/10 bg-[#2f4858]/28 p-3 text-xs">
              <div className="mb-1.5 font-medium text-white">{context.title}</div>
              <ul className="space-y-1 text-white/60">
                {context.rows.map((row) => (
                  <li key={row} className="truncate">{row}</li>
                ))}
              </ul>
            </div>
          )}
        </nav>

        <div className="flex items-center gap-2 p-3">
          <Avatar className="h-9 w-9 shrink-0 -translate-x-[3.5px]">
            {user.avatarUrl ? <AvatarImage src={user.avatarUrl} alt={user.name} /> : null}
            <AvatarFallback className="bg-white/10 text-white">{initials(user.name) || 'U'}</AvatarFallback>
          </Avatar>
          <div
            className={cn(
              'min-w-0 flex-1 overflow-hidden text-left transition-opacity duration-200 ease-out',
              showLabels ? 'opacity-100' : 'opacity-0 pointer-events-none',
            )}
          >
            <div className="truncate text-sm font-medium leading-tight">{user.name}</div>
            <div className="truncate text-xs text-white/60">{user.email}</div>
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
              aria-label="Open settings"
              onClick={() => onSelect('settings')}
              className="h-8 w-8 text-white hover:bg-white/10 hover:text-white"
              tabIndex={showLabels ? 0 : -1}
            >
              <Cog className="h-4 w-4" />
            </Button>
            <Button
              variant="ghost"
              size="icon"
              aria-label="Sign out"
              onClick={onSignOut}
              className="h-8 w-8 text-white hover:bg-white/10 hover:text-white"
              tabIndex={showLabels ? 0 : -1}
            >
              <LogOut className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </aside>
  )
}
