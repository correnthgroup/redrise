type Kpi = {
  label: string
  value: string
  delta: string
  trend: 'up' | 'down' | 'flat'
  series: number[]
}

type AnalyticsForKpi = {
  workspaceCount: number
  flowCount: number
  taskCount: number
  agentCount: number
  executionCount: number
  completedExecutions: number
  failedExecutions: number
  approvalRate: number
  errorRate: number
}

export function buildKpis(analytics: AnalyticsForKpi): Kpi[] {
  return [
    {
      label: 'Workspaces',
      value: String(analytics.workspaceCount),
      delta: `${analytics.flowCount} flows across all`,
      trend: 'flat',
      series: [],
    },
    {
      label: 'Tasks',
      value: String(analytics.taskCount),
      delta: `${analytics.executionCount} total executions`,
      trend: 'flat',
      series: [],
    },
    {
      label: 'Agents',
      value: String(analytics.agentCount),
      delta: `${analytics.completedExecutions} completed`,
      trend: 'up',
      series: [],
    },
    {
      label: 'Approval rate',
      value: `${analytics.approvalRate}%`,
      delta: `${analytics.completedExecutions} approved`,
      trend: analytics.approvalRate >= 80 ? 'up' : 'down',
      series: [],
    },
    {
      label: 'Error rate',
      value: `${analytics.errorRate}%`,
      delta: `${analytics.failedExecutions} failed`,
      trend: analytics.errorRate <= 5 ? 'down' : 'up',
      series: [],
    },
  ]
}
