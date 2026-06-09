import { KpiCards } from '../shared/kpi-cards'
import { ChartTabs } from '../shared/chart-tabs'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'

const PLACEHOLDER_ROWS = [
  { agent: 'Workspace Summarizer', requests: '124', errors: '0.6%', p95: '420ms' },
  { agent: 'Task Prioritizer', requests: '96', errors: '0.2%', p95: '310ms' },
  { agent: 'Flow Reviewer', requests: '64', errors: '1.1%', p95: '510ms' },
]

export function AnalyticsPage() {
  return (
    <div className="h-full overflow-y-auto p-6">
      <div className="flex flex-col gap-6">
        <KpiCards count={5} className="xl:grid-cols-5" />
        <ChartTabs />
        <Card className="border-border/80 shadow-[0_1px_2px_rgba(16,24,40,0.04),0_10px_24px_rgba(16,24,40,0.06)]">
          <CardHeader><CardTitle className="text-sm font-semibold">Per-agent breakdown</CardTitle></CardHeader>
          <CardContent>
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b text-left text-muted-foreground">
                  <th className="py-2">Agent</th>
                  <th>Requests</th>
                  <th>Errors</th>
                  <th>p95</th>
                </tr>
              </thead>
              <tbody>
                {PLACEHOLDER_ROWS.map((r) => (
                  <tr key={r.agent} className="border-b last:border-0">
                    <td className="py-3 font-medium text-foreground">{r.agent}</td>
                    <td>{r.requests}</td>
                    <td><Badge variant="outline" className="border-[#2F4858]/25 bg-[#2F4858]/8 text-[#2F4858]">{r.errors}</Badge></td>
                    <td>{r.p95}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
