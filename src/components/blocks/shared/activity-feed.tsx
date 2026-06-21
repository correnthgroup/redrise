import type { ComponentType } from 'react'
import type { Workspace } from '@/types/workspace'
import type { Flow } from '@/types/flow'
import type { Task } from '@/types/task'
import type { Agent } from '@/types/agent'
import { Activity, AlertTriangle, Bell, History, ScrollText } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { useI18n } from '@/hooks/use-i18n'

function FeedCard({
  title,
  items,
  icon: Icon,
}: {
  title: string
  items: string[]
  icon: ComponentType<{ className?: string }>
}) {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-sm font-semibold">
          <Icon className="h-4 w-4 text-primary" />
          {title}
        </CardTitle>
      </CardHeader>
      <CardContent>
        <ul className="space-y-2 text-xs text-muted-foreground">
          {items.map((item) => (
            <li key={item} className="truncate">
              {item}
            </li>
          ))}
        </ul>
      </CardContent>
    </Card>
  )
}

type ActivityFeedProps = {
  workspaces: Workspace[]
  flows: Flow[]
  tasks: Task[]
  agents: Agent[]
}

function latest<T extends { created_at: string; updated_at?: string }>(items: T[], format: (item: T) => string) {
  return [...items]
    .sort((a, b) => new Date(b.updated_at ?? b.created_at).getTime() - new Date(a.updated_at ?? a.created_at).getTime())
    .slice(0, 5)
    .map(format)
}

export function ActivityFeed({ workspaces, flows, tasks, agents }: ActivityFeedProps) {
  const { t } = useI18n()
  const events = [
    ...latest(workspaces, (workspace) => t('dashboard.workspaceUpdated', { name: workspace.name, status: workspace.status })),
    ...latest(flows, (flow) => t('dashboard.flowUpdated', { name: flow.name, status: flow.status })),
    ...latest(tasks, (task) => t('dashboard.taskUpdated', { name: task.title, status: task.status })),
  ].slice(0, 5)
  const alerts = [
    ...tasks.filter((task) => task.status === 'error').map((task) => t('dashboard.taskNeedsAttention', { name: task.title })),
    ...agents.filter((agent) => agent.status === 'error').map((agent) => t('dashboard.agentNeedsAttention', { name: agent.name })),
    ...workspaces.filter((workspace) => workspace.status === 'maintenance').map((workspace) => t('dashboard.workspaceNeedsAttention', { name: workspace.name })),
  ].slice(0, 5)
  const notifications = [
    t('dashboard.workspaceCountNotification', { count: workspaces.length }),
    t('dashboard.flowCountNotification', { count: flows.length }),
    t('dashboard.taskCountNotification', { count: tasks.length }),
    t('dashboard.agentCountNotification', { count: agents.length }),
  ]
  const changeLog = [
    ...latest(flows, (flow) => t('dashboard.flowChanged', { name: flow.name })),
    ...latest(tasks, (task) => t('dashboard.taskChanged', { name: task.title })),
  ].slice(0, 5)
  const auditTrail = [
    ...latest(workspaces, (workspace) => t('dashboard.workspaceAudit', { id: workspace.id, name: workspace.name })),
    ...latest(flows, (flow) => t('dashboard.flowAudit', { id: flow.id, name: flow.name })),
    ...latest(tasks, (task) => t('dashboard.taskAudit', { id: task.id, name: task.title })),
  ].slice(0, 5)
  const empty = [t('dashboard.noLiveEvents')]

  return (
    <div className="grid grid-cols-1 gap-4 2xl:grid-cols-5">
      <FeedCard title={t('dashboard.activityFeed')} items={events.length > 0 ? events : empty} icon={Activity} />
      <FeedCard title={t('dashboard.alerts')} items={alerts.length > 0 ? alerts : [t('dashboard.noAlerts')]} icon={AlertTriangle} />
      <FeedCard title={t('dashboard.notifications')} items={notifications} icon={Bell} />
      <FeedCard title={t('dashboard.changeLog')} items={changeLog.length > 0 ? changeLog : empty} icon={History} />
      <FeedCard title={t('dashboard.auditTrail')} items={auditTrail.length > 0 ? auditTrail : empty} icon={ScrollText} />
    </div>
  )
}
