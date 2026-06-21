import { Loader2 } from 'lucide-react'
import { KpiCards } from '../shared/kpi-cards'
import { ChartTabs } from '../shared/chart-tabs'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { useAnalytics } from '@/hooks/use-analytics'
import { buildKpis } from '@/lib/analytics'
import { useI18n } from '@/hooks/use-i18n'

const STATUS_BADGE: Record<string, string> = {
  completed: 'border-[#2F5D5A]/25 bg-[#2F5D5A]/8 text-[#2F5D5A]',
  failed: 'border-primary/18 bg-primary/8 text-primary',
  rejected: 'border-[#B7791F]/18 bg-[#FFF8E1] text-[#7A3E14]',
  running: 'border-blue-200 bg-blue-50 text-blue-700',
  pending: 'border-slate-200 bg-slate-50 text-slate-600',
}

export function AnalyticsPage() {
  const { t } = useI18n()
  const analytics = useAnalytics()

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

  return (
    <div data-testid="analytics-page" className="h-full overflow-y-auto p-6">
      <div className="flex flex-col gap-6">
        <KpiCards items={kpis} count={5} />
        <ChartTabs executionsByDay={analytics.executionsByDay} />

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
                        {exec.model} {exec.tokens_used ? `· ${exec.tokens_used} tokens` : ''}
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
