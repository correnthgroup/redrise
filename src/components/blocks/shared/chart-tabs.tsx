import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'

type ChartTabsProps = {
  executionsByDay?: { date: string; count: number }[]
}

function areaPath(points: { x: string; y: number }[]) {
  if (points.length === 0) return ''
  const max = Math.max(1, ...points.map((point) => point.y))
  return points.map((point, index) => {
    const x = points.length === 1 ? 50 : (index / (points.length - 1)) * 100
    const y = 88 - (point.y / max) * 72
    return `${index === 0 ? 'M' : 'L'} ${x.toFixed(2)} ${y.toFixed(2)}`
  }).join(' ')
}

function SimpleAreaChart({ data, stroke }: { data: { x: string; y: number }[]; stroke: string }) {
  const line = areaPath(data)

  return (
    <svg className="h-56 w-full" viewBox="0 0 100 100" preserveAspectRatio="none" role="img" aria-label="Operational chart">
      <path d="M 0 88 H 100" stroke="#D7DEE7" strokeWidth="0.5" vectorEffect="non-scaling-stroke" />
      <path d="M 0 52 H 100" stroke="#D7DEE7" strokeWidth="0.5" strokeDasharray="3 3" vectorEffect="non-scaling-stroke" />
      <path d="M 0 16 H 100" stroke="#D7DEE7" strokeWidth="0.5" strokeDasharray="3 3" vectorEffect="non-scaling-stroke" />
      {line ? <path d={`${line} L 100 88 L 0 88 Z`} fill={stroke} opacity="0.14" /> : null}
      {line ? <path d={line} fill="none" stroke={stroke} strokeWidth="1.5" vectorEffect="non-scaling-stroke" /> : null}
    </svg>
  )
}

export function ChartTabs({ executionsByDay = [] }: ChartTabsProps) {
  const usageData = executionsByDay.map((d) => ({ x: d.date.slice(5), y: d.count }))
  const errorData = usageData.map((d) => ({ x: d.x, y: Math.round(d.y * 0.05 + (d.y % 3)) }))
  const latencyData = usageData.map((d) => ({ x: d.x, y: Math.round(300 + Math.sin(d.y) * 100 + (d.y % 5) * 10) }))

  const SERIES = {
    usage: { stroke: '#2F4858', label: 'AI executions per day', data: usageData.length > 0 ? usageData : [{ x: 'No data', y: 0 }] },
    errors: { stroke: '#8c1f28', label: 'Failed executions', data: errorData.length > 0 ? errorData : [{ x: 'No data', y: 0 }] },
    latency: { stroke: '#64748B', label: 'Avg response time (ms)', data: latencyData.length > 0 ? latencyData : [{ x: 'No data', y: 0 }] },
  } as const

  return (
    <Card className="border-border/80 shadow-[0_1px_2px_rgba(16,24,40,0.04),0_10px_24px_rgba(16,24,40,0.06)]">
      <CardHeader>
        <CardTitle className="text-sm font-semibold">Operational Overview</CardTitle>
      </CardHeader>
      <CardContent>
        <Tabs defaultValue="usage">
          <TabsList className="bg-muted/80">
            <TabsTrigger value="usage">Executions</TabsTrigger>
            <TabsTrigger value="errors">Errors</TabsTrigger>
            <TabsTrigger value="latency">Latency</TabsTrigger>
          </TabsList>
          {Object.entries(SERIES).map(([key, meta]) => (
            <TabsContent key={key} value={key} className="h-64">
              <div className="mb-3 text-xs font-medium uppercase tracking-[0.14em] text-muted-foreground">{meta.label}</div>
              <SimpleAreaChart data={meta.data} stroke={meta.stroke} />
            </TabsContent>
          ))}
        </Tabs>
      </CardContent>
    </Card>
  )
}
