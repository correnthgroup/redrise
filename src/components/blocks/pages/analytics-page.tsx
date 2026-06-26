import { useState } from 'react'
import { Bell, CheckCircle2, Clock3, LifeBuoy, Loader2, RefreshCw, RouteOff, Sparkles } from 'lucide-react'
import { KpiCards } from '../shared/kpi-cards'
import { ChartTabs } from '../shared/chart-tabs'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { useAnalytics, type AnalyticsData } from '@/hooks/use-analytics'
import { taskExecute } from '@/lib/ai-client'
import { buildKpis } from '@/lib/analytics'
import { useI18n } from '@/hooks/use-i18n'
import type { Flow, FlowSourceType } from '@/types/flow'
import type { Task, TaskStatus } from '@/types/task'
import type { Agent } from '@/types/agent'
import type { Notification } from '@/types/notification'
import { updateSpotlightPosition } from '@/lib/spotlight'

const STATUS_BADGE: Record<string, string> = {
  completed: 'border-[#2F5D5A]/25 bg-[#2F5D5A]/8 text-[#2F5D5A]',
  failed: 'border-primary/18 bg-primary/8 text-primary',
  rejected: 'border-[#B7791F]/18 bg-[#FFF8E1] text-[#7A3E14]',
  running: 'border-blue-200 bg-blue-50 text-blue-700',
  pending: 'border-slate-200 bg-slate-50 text-slate-600',
}

type AnalyticsPageProps = {
  analytics?: AnalyticsData
  flows?: Flow[]
  tasks?: Task[]
  agents?: Agent[]
  notifications?: Notification[]
}

function MetricTile({ icon: Icon, label, value, detail, tone }: { icon: typeof CheckCircle2; label: string; value: string; detail: string; tone: string }) {
  return (
    <Card onPointerMove={updateSpotlightPosition} className="spotlight-card border-border/80 shadow-[0_1px_2px_rgba(16,24,40,0.04),0_10px_24px_rgba(16,24,40,0.06)]">
      <CardContent className="flex items-start gap-3 p-4">
        <div className={`rounded-full p-2 ${tone}`}>
          <Icon className="h-4 w-4" />
        </div>
        <div className="min-w-0">
          <p className="text-xs font-medium uppercase tracking-[0.14em] text-muted-foreground">{label}</p>
          <p className="mt-1 font-mono text-2xl font-semibold tabular-nums">{value}</p>
          <p className="mt-1 text-xs text-muted-foreground">{detail}</p>
        </div>
      </CardContent>
    </Card>
  )
}

function sourceLabelKey(source: FlowSourceType) {
  switch (source) {
    case 'external_llm':
      return 'analytics.source.externalLlm'
    case 'redrise_support':
      return 'analytics.source.redriseSupport'
    case 'system':
      return 'analytics.source.system'
    default:
      return 'analytics.source.user'
  }
}

function AnalyticsContent({ analytics, flows = [], tasks = [], agents = [], notifications = [] }: Required<Pick<AnalyticsPageProps, 'analytics'>> & Omit<AnalyticsPageProps, 'analytics'>) {
  const { t } = useI18n()
  const [selectedAdapterRun, setSelectedAdapterRun] = useState<AnalyticsData['adapterRuns'][number] | null>(null)
  const [retryingRunId, setRetryingRunId] = useState<string | null>(null)
  const [retryMessage, setRetryMessage] = useState<string | null>(null)

  if (analytics.loading) {
    return (
      <div className="flex h-full items-center justify-center">
        <div className="flex flex-col items-center gap-3">
          <Loader2 className="h-6 w-6 animate-spin text-[#2F5D5A]" />
          <p className="text-sm text-muted-foreground">{t('analytics.loading')}</p>
        </div>
      </div>
    )
  }

  const kpis = buildKpis(analytics)
  const officialFlows = flows.filter((flow) => flow.is_official || flow.approval_status === 'approved').length
  const pendingApprovalFlows = flows.filter((flow) => flow.approval_status === 'approval_requested' || flow.approval_status === 'adjustments_requested').length
  const flowApprovalRate = flows.length > 0 ? Math.round((officialFlows / flows.length) * 100) : 0
  const pendingNotifications = notifications.filter((notification) => notification.action_status === 'pending').length
  const unreadNotifications = notifications.filter((notification) => notification.read_status === 'unread').length
  const activeAgents = agents.filter((agent) => agent.status === 'active').length
  const sourceRows: { key: FlowSourceType; label: string; count: number }[] = ['user', 'external_llm', 'redrise_support', 'system'].map((source) => ({
    key: source as FlowSourceType,
    label: t(sourceLabelKey(source as FlowSourceType)),
    count: flows.filter((flow) => flow.source_type === source).length,
  }))
  const taskStatusRows: { key: TaskStatus; label: string; count: number }[] = ['backlog', 'pending', 'in-progress', 'running', 'in-review', 'done', 'error'].map((status) => ({
    key: status as TaskStatus,
    label: t(`tasks.status.${status}`),
    count: tasks.filter((task) => task.status === status).length,
  }))

  async function retryAdapterRun(run: AnalyticsData['adapterRuns'][number]) {
    setRetryingRunId(run.id)
    setRetryMessage(null)
    try {
      const prompt = run.execution_path === 'rise_insider_terminal' || run.execution_path === 'rise_insider_filesystem'
        ? run.execution_path === 'rise_insider_filesystem' ? 'operation: status' : 'command: status'
        : `Retry adapter health check for ${run.execution_path}`
      const result = await taskExecute(
        `Retry adapter run ${run.id}`,
        prompt,
        null,
        undefined,
        'en-US',
        { executionPath: run.execution_path, executionId: run.execution_id ?? undefined, taskId: run.task_id ?? undefined },
      )
      setRetryMessage(result.parse_error ? t('analytics.adapterRetryParseError') : t('analytics.adapterRetrySuccess'))
    } catch (error) {
      setRetryMessage(error instanceof Error ? error.message : t('common.error'))
    } finally {
      setRetryingRunId(null)
    }
  }

  return (
    <div data-testid="analytics-page" className="h-full overflow-y-auto p-6">
      <div className="flex flex-col gap-6">
        <KpiCards items={kpis} count={5} />
        <ChartTabs executionsByDay={analytics.executionsByDay} />

        <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-4">
          <MetricTile icon={CheckCircle2} label={t('analytics.flowGovernance')} value={`${flowApprovalRate}%`} detail={t('analytics.flowGovernanceDetail', { approved: officialFlows, total: flows.length || analytics.flowCount, pending: pendingApprovalFlows })} tone="bg-[#2F5D5A]/10 text-[#2F5D5A]" />
          <MetricTile icon={RouteOff} label={t('analytics.blockedExecutions')} value={String(analytics.blockedExecutions)} detail={t('analytics.blockedExecutionsDetail')} tone="bg-primary/10 text-primary" />
          <MetricTile icon={Bell} label={t('analytics.pendingNotifications')} value={String(pendingNotifications)} detail={t('analytics.pendingNotificationsDetail', { unread: unreadNotifications })} tone="bg-[#FFF8E1] text-[#7A3E14]" />
          <MetricTile icon={Clock3} label={t('analytics.activeAgents')} value={String(activeAgents)} detail={t('analytics.activeAgentsDetail', { total: agents.length || analytics.agentCount })} tone="bg-slate-100 text-slate-700" />
        </div>

        <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
          <Card onPointerMove={updateSpotlightPosition} className="spotlight-card border-border/80 shadow-[0_1px_2px_rgba(16,24,40,0.04),0_10px_24px_rgba(16,24,40,0.06)]">
            <CardHeader><CardTitle className="text-sm font-semibold">{t('analytics.flowSourceMix')}</CardTitle></CardHeader>
            <CardContent className="space-y-3">
              {sourceRows.map((row) => {
                const percent = flows.length > 0 ? Math.round((row.count / flows.length) * 100) : 0
                const Icon = row.key === 'external_llm' ? Sparkles : row.key === 'redrise_support' ? LifeBuoy : CheckCircle2
                return (
                  <div key={row.key} className="space-y-1.5">
                    <div className="flex items-center justify-between gap-3 text-sm">
                      <div className="flex items-center gap-2">
                        <Icon className="h-4 w-4 text-muted-foreground" />
                        <span className="font-medium">{row.label}</span>
                      </div>
                      <span className="font-mono text-xs text-muted-foreground">{row.count} / {flows.length}</span>
                    </div>
                    <div className="h-2 rounded-full bg-muted">
                      <div className="h-2 rounded-full bg-[#2F5D5A]" style={{ width: `${percent}%` }} />
                    </div>
                  </div>
                )
              })}
            </CardContent>
          </Card>

          <Card onPointerMove={updateSpotlightPosition} className="spotlight-card border-border/80 shadow-[0_1px_2px_rgba(16,24,40,0.04),0_10px_24px_rgba(16,24,40,0.06)]">
            <CardHeader><CardTitle className="text-sm font-semibold">{t('analytics.taskStatusMix')}</CardTitle></CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">
                {taskStatusRows.map((row) => (
                  <div key={row.key} className="rounded-lg border bg-muted/20 p-3">
                    <div className="text-xs text-muted-foreground">{row.label}</div>
                    <div className="mt-1 font-mono text-xl font-semibold">{row.count}</div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>

        <Card onPointerMove={updateSpotlightPosition} className="spotlight-card border-border/80 shadow-[0_1px_2px_rgba(16,24,40,0.04),0_10px_24px_rgba(16,24,40,0.06)]">
          <CardHeader><CardTitle className="text-sm font-semibold">{t('analytics.adapterObservability')}</CardTitle></CardHeader>
          <CardContent>
            {analytics.adapterRuns.length === 0 ? (
              <div className="text-center py-8 text-sm text-muted-foreground">{t('analytics.noAdapterRuns')}</div>
            ) : (
              <div className="space-y-2">
                {analytics.adapterRuns.slice(0, 8).map((run) => (
                  <button key={run.id} type="button" onClick={() => setSelectedAdapterRun(run)} className="flex w-full items-center gap-3 rounded-lg border p-3 text-left text-sm transition-colors hover:bg-accent/60">
                    <div className={`h-2 w-2 shrink-0 rounded-full ${run.status === 'success' ? 'bg-[#2F5D5A]' : 'bg-[#A04D1F]'}`} />
                    <div className="min-w-0 flex-1">
                      <div className="flex flex-wrap items-center gap-2">
                        <span className="font-medium">{run.execution_path}</span>
                        <Badge variant="outline" className={`text-[10px] ${run.status === 'success' ? 'border-[#2F5D5A]/25 bg-[#2F5D5A]/8 text-[#2F5D5A]' : 'border-primary/18 bg-primary/8 text-primary'}`}>{run.status}</Badge>
                        <span className="text-xs text-muted-foreground">{run.provider}</span>
                      </div>
                      <div className="mt-0.5 truncate text-xs text-muted-foreground">
                        {run.endpoint_label ?? t('analytics.internalAdapter')} {run.latency_ms !== null ? `· ${run.latency_ms}ms` : ''} {run.error_message ? `· ${run.error_message}` : ''}
                      </div>
                    </div>
                    <div className="shrink-0 text-[10px] text-muted-foreground/60">{new Date(run.created_at).toLocaleString()}</div>
                  </button>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        <Dialog open={Boolean(selectedAdapterRun)} onOpenChange={(open) => { if (!open) { setSelectedAdapterRun(null); setRetryMessage(null) } }}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>{t('analytics.adapterRunDetails')}</DialogTitle>
            </DialogHeader>
            {selectedAdapterRun ? (
              <div className="space-y-3 text-sm">
                <div className="grid grid-cols-2 gap-2">
                  <div><strong>{t('analytics.adapterRunPath')}</strong><br />{selectedAdapterRun.execution_path}</div>
                  <div><strong>{t('analytics.adapterRunProvider')}</strong><br />{selectedAdapterRun.provider}</div>
                  <div><strong>{t('flowRun.status')}</strong><br />{selectedAdapterRun.status}</div>
                  <div><strong>{t('analytics.adapterRunLatency')}</strong><br />{selectedAdapterRun.latency_ms !== null ? `${selectedAdapterRun.latency_ms}ms` : t('common.noData')}</div>
                  <div><strong>{t('analytics.adapterRunStatusCode')}</strong><br />{selectedAdapterRun.status_code ?? t('common.noData')}</div>
                  <div><strong>{t('analytics.adapterRunEndpoint')}</strong><br />{selectedAdapterRun.endpoint_label ?? t('analytics.internalAdapter')}</div>
                </div>
                {selectedAdapterRun.error_message ? <div className="rounded-md border border-primary/20 bg-primary/5 p-3 text-primary">{selectedAdapterRun.error_message}</div> : null}
                {retryMessage ? <div className="rounded-md border bg-muted/30 p-3 text-muted-foreground">{retryMessage}</div> : null}
              </div>
            ) : null}
            <DialogFooter>
              {selectedAdapterRun?.status === 'failed' ? (
                <Button onClick={() => retryAdapterRun(selectedAdapterRun)} disabled={retryingRunId === selectedAdapterRun.id}>
                  {retryingRunId === selectedAdapterRun.id ? <Loader2 className="h-4 w-4 animate-spin" /> : <RefreshCw className="h-4 w-4" />}
                  {t('analytics.retryAdapterRun')}
                </Button>
              ) : null}
              <Button variant="outline" onClick={() => setSelectedAdapterRun(null)}>{t('common.ok')}</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Per-agent breakdown */}
        <Card className="border-border/80 shadow-[0_1px_2px_rgba(16,24,40,0.04),0_10px_24px_rgba(16,24,40,0.06)]">
          <CardHeader><CardTitle className="text-sm font-semibold">{t('analytics.perAgentBreakdown')}</CardTitle></CardHeader>
          <CardContent>
            {analytics.agentBreakdown.length === 0 ? (
              <div className="text-center py-8 text-sm text-muted-foreground">
                {t('analytics.noAgentExecutions')}
              </div>
            ) : (
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b text-left text-muted-foreground">
                    <th className="py-2">{t('analytics.agent')}</th>
                    <th>{t('analytics.model')}</th>
                    <th>{t('analytics.requests')}</th>
                    <th>{t('analytics.errors')}</th>
                    <th>{t('analytics.avgTokens')}</th>
                  </tr>
                </thead>
                <tbody>
                  {analytics.agentBreakdown.map((row) => (
                    <tr key={row.agentId} className="border-b last:border-0">
                      <td className="py-3 font-medium text-foreground">{row.agentName}</td>
                      <td className="text-muted-foreground">{row.model}</td>
                      <td>{row.requests}</td>
                      <td>
                        {row.errors > 0 ? (
                          <Badge variant="outline" className="border-primary/18 bg-primary/8 text-primary">{row.errors}</Badge>
                        ) : (
                          <span className="text-muted-foreground">0</span>
                        )}
                      </td>
                      <td>{row.avgTokens.toLocaleString()}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </CardContent>
        </Card>

        {/* Recent executions */}
        <Card className="border-border/80 shadow-[0_1px_2px_rgba(16,24,40,0.04),0_10px_24px_rgba(16,24,40,0.06)]">
          <CardHeader><CardTitle className="text-sm font-semibold">{t('analytics.recentExecutions')}</CardTitle></CardHeader>
          <CardContent>
            {analytics.recentExecutions.length === 0 ? (
              <div className="text-center py-8 text-sm text-muted-foreground">
                {t('analytics.noExecutions')}
              </div>
            ) : (
              <div className="space-y-2">
                {analytics.recentExecutions.map((exec) => (
                  <div key={exec.id} className="flex items-center gap-3 rounded-lg border p-3 text-sm">
                    <div className={`h-2 w-2 rounded-full shrink-0 ${
                      exec.status === 'completed' ? 'bg-[#2F5D5A]' :
                      exec.status === 'failed' ? 'bg-[#A04D1F]' :
                      exec.status === 'rejected' ? 'bg-amber-500' :
                      'bg-slate-400'
                    }`} />
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <span className="font-medium">{exec.task_id}</span>
                        <Badge variant="outline" className={`text-[10px] ${STATUS_BADGE[exec.status] || ''}`}>{exec.status}</Badge>
                      </div>
                      <div className="text-xs text-muted-foreground mt-0.5">
                        {exec.model} {exec.execution_path ? `· ${exec.execution_path}` : ''} {exec.tokens_used ? `· ${exec.tokens_used} tokens` : ''}
                        {exec.failure_reason ? <span className="ml-1 text-primary">· {exec.failure_reason}</span> : null}
                      </div>
                    </div>
                    <div className="text-[10px] text-muted-foreground/60 shrink-0">
                      {new Date(exec.created_at).toLocaleString()}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

function StandaloneAnalyticsPage() {
  const analytics = useAnalytics()
  return <AnalyticsContent analytics={analytics} />
}

export function AnalyticsPage(props: AnalyticsPageProps) {
  if (!props.analytics) return <StandaloneAnalyticsPage />
  return <AnalyticsContent {...props} analytics={props.analytics} />
}
