import { Area, AreaChart, ResponsiveContainer } from 'recharts'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { cn } from '@/lib/utils'

type Kpi = {
  label: string
  value: string
  delta: string
  trend: 'up' | 'down' | 'flat'
  series: number[]
}

const PLACEHOLDER_KPIS: Kpi[] = [
  { label: 'Active workspaces', value: '12', delta: '+8% vs last week', trend: 'up', series: [4, 6, 5, 8, 7, 9, 11] },
  { label: 'Flow runs', value: '48', delta: '+5% vs last week', trend: 'up', series: [3, 4, 4, 5, 6, 6, 7] },
  { label: 'Health score', value: '81%', delta: 'stable this week', trend: 'flat', series: [7, 7, 6, 7, 7, 8, 7] },
  { label: 'Blocked tasks', value: '6', delta: '-12% vs last week', trend: 'down', series: [9, 8, 7, 7, 6, 6, 5] },
  { label: 'AI requests', value: '284', delta: '+14% vs last week', trend: 'up', series: [2, 3, 5, 4, 6, 8, 9] },
  { label: 'Approval rate', value: '92%', delta: 'no change', trend: 'flat', series: [6, 6, 7, 7, 6, 6, 7] },
  { label: 'Error rate', value: '0.8%', delta: '-0.2pp vs last week', trend: 'down', series: [8, 8, 7, 6, 6, 5, 4] },
]

function KpiCard({ kpi }: { kpi: Kpi }) {
  const data = kpi.series.map((v, i) => ({ i, v }))
  const stroke =
    kpi.trend === 'up' ? '#2F4858' : kpi.trend === 'down' ? '#8c1f28' : '#64748B'
  return (
    <Card className="border-border/80 shadow-[0_1px_2px_rgba(16,24,40,0.04),0_10px_24px_rgba(16,24,40,0.06)]">
      <CardHeader className="pb-2">
        <CardTitle className="text-xs font-medium text-muted-foreground">{kpi.label}</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="font-mono text-2xl font-bold tabular-nums tracking-tight text-foreground">{kpi.value}</div>
        <div className="mt-1 text-xs text-muted-foreground">{kpi.delta}</div>
        <div className="mt-3 h-12 w-full">
          <ResponsiveContainer>
            <AreaChart data={data} margin={{ top: 4, right: 0, bottom: 0, left: 0 }}>
              <Area type="monotone" dataKey="v" stroke={stroke} fill={stroke} fillOpacity={0.15} strokeWidth={1.5} />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  )
}

export function KpiCards({
  items = PLACEHOLDER_KPIS,
  count = items.length,
  className,
}: {
  items?: Kpi[]
  count?: number
  className?: string
}) {
  return (
    <div className={cn('grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4', className)}>
      {items.slice(0, count).map((k) => (
        <KpiCard key={k.label} kpi={k} />
      ))}
    </div>
  )
}
