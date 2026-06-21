import type { ComponentType } from 'react'
import type { Workspace } from '@/types/workspace'
import type { Flow } from '@/types/flow'
import type { Task } from '@/types/task'
import type { Agent } from '@/types/agent'
import { AlertTriangle, Bell, Bot, Gauge, ListChecks, Settings2, Users } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Progress } from '@/components/ui/progress'
import { useI18n } from '@/hooks/use-i18n'

type OperationsGridProps = {
  workspaces: Workspace[]
  flows: Flow[]
  tasks: Task[]
  agents: Agent[]
}

function percent(value: number, total: number) {
  if (total <= 0) return 0
  return Math.round((value / total) * 100)
}

function OperationTitle({ icon: Icon, children }: { icon: ComponentType<{ className?: string }>; children: string }) {
  return <CardTitle className="flex items-center gap-2 text-sm font-semibold"><Icon className="h-4 w-4 text-primary" />{children}</CardTitle>
}

export function OperationsGrid({ workspaces, flows, tasks, agents }: OperationsGridProps) {
  const { t } = useI18n()
  const workspaceTotal = Math.max(workspaces.length, 1)
  const flowTotal = Math.max(flows.length, 1)
  const taskTotal = Math.max(tasks.length, 1)
  const agentTotal = Math.max(agents.length, 1)

  const staffing = [
    { name: t('dashboard.workspaceOwners'), value: percent(workspaces.length, workspaceTotal) },
    { name: t('dashboard.assignedMembers'), value: percent(new Set([...flows.flatMap((flow) => flow.members), ...tasks.flatMap((task) => task.team_members)]).size, Math.max(workspaces.length + flows.length + tasks.length, 1)) },
    { name: t('dashboard.activeAgents'), value: percent(agents.filter((agent) => agent.status === 'active').length, agentTotal) },
  ]
  const modelBreakdown = Object.entries(agents.reduce<Record<string, number>>((acc, agent) => {
    acc[agent.model || t('dashboard.unassignedModel')] = (acc[agent.model || t('dashboard.unassignedModel')] ?? 0) + 1
    return acc
  }, {})).map(([name, count]) => ({ name, value: percent(count, agentTotal) }))
  const capacity = [
    { name: t('dashboard.workspaceCapacity'), value: percent(workspaces.filter((workspace) => workspace.status === 'healthy').length, workspaceTotal) },
    { name: t('dashboard.flowCapacity'), value: percent(flows.filter((flow) => flow.status === 'running').length, flowTotal) },
    { name: t('dashboard.taskCapacity'), value: percent(tasks.filter((task) => task.status === 'done').length, taskTotal) },
  ]
  const attention = [
    t('dashboard.pendingWorkspacesCount', { count: workspaces.filter((workspace) => workspace.status === 'pending').length }),
    t('dashboard.reviewTasksCount', { count: tasks.filter((task) => task.status === 'in-review').length }),
    t('dashboard.pausedFlowsCount', { count: flows.filter((flow) => flow.status === 'paused').length }),
  ]
  const alerts = [
    t('dashboard.errorTasksCount', { count: tasks.filter((task) => task.status === 'error').length }),
    t('dashboard.errorAgentsCount', { count: agents.filter((agent) => agent.status === 'error').length }),
    t('dashboard.maintenanceWorkspacesCount', { count: workspaces.filter((workspace) => workspace.status === 'maintenance').length }),
  ]
  const config = [
    t('dashboard.configuredFlowsCount', { count: flows.length }),
    t('dashboard.workspaceFlowLinksCount', { count: new Set(flows.map((flow) => flow.workspace_id)).size }),
    t('dashboard.agentProviderCount', { count: new Set(agents.map((agent) => agent.provider)).size }),
  ]
  const indicators = [
    t('dashboard.operationalHealthValue', { value: percent(workspaces.filter((workspace) => workspace.status === 'healthy').length + flows.filter((flow) => flow.status === 'running').length + agents.filter((agent) => agent.status === 'active').length, workspaceTotal + flowTotal + agentTotal) }),
    t('dashboard.backlogTasksCount', { count: tasks.filter((task) => task.status === 'backlog').length }),
    t('dashboard.doneTasksCount', { count: tasks.filter((task) => task.status === 'done').length }),
  ]

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
        <Card className="border-border/80 shadow-[0_1px_2px_rgba(16,24,40,0.04),0_10px_24px_rgba(16,24,40,0.06)]">
          <CardHeader><OperationTitle icon={Users}>{t('dashboard.staffing')}</OperationTitle></CardHeader>
          <CardContent className="space-y-2">
            {staffing.map((s) => (
              <div key={s.name}>
                <div className="flex justify-between text-xs"><span>{s.name}</span><span>{s.value}%</span></div>
                <Progress value={s.value} />
              </div>
            ))}
          </CardContent>
        </Card>

        <Card className="border-border/80 shadow-[0_1px_2px_rgba(16,24,40,0.04),0_10px_24px_rgba(16,24,40,0.06)]">
          <CardHeader><OperationTitle icon={Bot}>{t('dashboard.modelBreakdown')}</OperationTitle></CardHeader>
          <CardContent className="space-y-2">
            {(modelBreakdown.length > 0 ? modelBreakdown : [{ name: t('dashboard.noAgentsConfigured'), value: 0 }]).map((m) => (
              <div key={m.name}>
                <div className="flex justify-between text-xs"><span>{m.name}</span><span>{m.value}%</span></div>
                <Progress value={m.value} />
              </div>
            ))}
          </CardContent>
        </Card>

        <Card className="border-border/80 shadow-[0_1px_2px_rgba(16,24,40,0.04),0_10px_24px_rgba(16,24,40,0.06)]">
          <CardHeader><OperationTitle icon={Gauge}>{t('dashboard.capacityMix')}</OperationTitle></CardHeader>
          <CardContent className="space-y-2">
            {capacity.map((c) => (
              <div key={c.name}>
                <div className="flex justify-between text-xs"><span>{c.name}</span><span>{c.value}%</span></div>
                <Progress value={c.value} />
              </div>
            ))}
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 gap-4 xl:grid-cols-4">
        <Card className="border-border/80 shadow-[0_1px_2px_rgba(16,24,40,0.04),0_10px_24px_rgba(16,24,40,0.06)]">
          <CardHeader><OperationTitle icon={ListChecks}>{t('dashboard.attentionQueue')}</OperationTitle></CardHeader>
          <CardContent>
            <ul className="space-y-2 text-sm">
              {attention.map((a) => (
                <li key={a} className="rounded-md border bg-muted/45 p-2">{a}</li>
              ))}
            </ul>
          </CardContent>
        </Card>

        <Card className="border-border/80 shadow-[0_1px_2px_rgba(16,24,40,0.04),0_10px_24px_rgba(16,24,40,0.06)]">
          <CardHeader><OperationTitle icon={AlertTriangle}>{t('dashboard.alerts')}</OperationTitle></CardHeader>
          <CardContent>
            <ul className="space-y-2 text-sm">
              {alerts.map((a) => (
                <li key={a} className="rounded-md border border-primary/20 bg-primary/6 p-2 text-foreground">{a}</li>
              ))}
            </ul>
          </CardContent>
        </Card>

        <Card className="border-border/80 shadow-[0_1px_2px_rgba(16,24,40,0.04),0_10px_24px_rgba(16,24,40,0.06)]">
          <CardHeader><OperationTitle icon={Settings2}>{t('dashboard.configurationWatch')}</OperationTitle></CardHeader>
          <CardContent>
            <ul className="space-y-2 text-sm">
              {config.map((c) => (
                <li key={c} className="rounded-md border bg-[#2F5D5A]/6 p-2 text-foreground">{c}</li>
              ))}
            </ul>
          </CardContent>
        </Card>

        <Card className="border-border/80 shadow-[0_1px_2px_rgba(16,24,40,0.04),0_10px_24px_rgba(16,24,40,0.06)]">
          <CardHeader><OperationTitle icon={Bell}>{t('dashboard.operationalIndicators')}</OperationTitle></CardHeader>
          <CardContent>
            <ul className="space-y-2 text-sm">
              {indicators.map((i) => (
                <li key={i} className="rounded-md border bg-muted/45 p-2">{i}</li>
              ))}
            </ul>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
