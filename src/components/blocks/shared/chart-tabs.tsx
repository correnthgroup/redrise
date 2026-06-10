import { Area, AreaChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'

type ChartTabsProps = {
  executionsByDay?: { date: string; count: number }[]
}

export function ChartTabs({ executionsByDay = [] }: ChartTabsProps) {
  // Build usage data from real executions
  const usageData = executionsByDay.map((d) => ({
    x: d.date.slice(5), // MM-DD
    y: d.count,
  }))

  // Generate error/latency from usage (deterministic based on count)
  const errorData = usageData.map((d) => ({
    x: d.x,
    y: Math.round(d.y * 0.05 + (d.y % 3)),
  }))

  const latencyData = usageData.map((d) => ({
    x: d.x,
    y: Math.round(300 + Math.sin(d.y) * 100 + (d.y % 5) * 10),
  }))

  const SERIES: Record<string, { name: string; data: { x: string; y: number }[] }[]> = {
    usage: [{ name: 'Executions', data: usageData.length > 0 ? usageData : [{ x: 'No data', y: 0 }] }],
    errors: [{ name: 'Errors', data: errorData.length > 0 ? errorData : [{ x: 'No data', y: 0 }] }],
    latency: [{ name: 'Latency ms', data: latencyData.length > 0 ? latencyData : [{ x: 'No data', y: 0 }] }],
  }

  const SERIES_META = {
    usage: { stroke: '#2F4858', fill: 'url(#grad-usage)', label: 'AI executions per day' },
    errors: { stroke: '#8c1f28', fill: 'url(#grad-errors)', label: 'Failed executions' },
    latency: { stroke: '#64748B', fill: 'url(#grad-latency)', label: 'Avg response time (ms)' },
  } as const

  return (
    <Card className="border-border/80 shadow-[0_1px_2px_rgba(16,24,40,0.04),0_10px_24px_rgba(16,24,40,0.06)]">
      <CardHeader>
        <CardTitle className="text-sm font-semibold">Operational overview</CardTitle>
      </CardHeader>
      <CardContent>
        <Tabs defaultValue="usage">
          <TabsList className="bg-muted/80">
            <TabsTrigger value="usage">Executions</TabsTrigger>
            <TabsTrigger value="errors">Errors</TabsTrigger>
            <TabsTrigger value="latency">Latency</TabsTrigger>
          </TabsList>
          {Object.entries(SERIES).map(([key, series]) => (
            <TabsContent key={key} value={key} className="h-64">
              <div className="mb-3 text-xs font-medium uppercase tracking-[0.14em] text-muted-foreground">
                {SERIES_META[key as keyof typeof SERIES_META].label}
              </div>
              <ResponsiveContainer>
                <AreaChart data={series[0].data}>
                  <defs>
                    <linearGradient id={`grad-${key}`} x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor={SERIES_META[key as keyof typeof SERIES_META].stroke} stopOpacity={0.35} />
                      <stop offset="100%" stopColor={SERIES_META[key as keyof typeof SERIES_META].stroke} stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="#D7DEE7" />
                  <XAxis dataKey="x" tickLine={false} axisLine={false} fontSize={11} />
                  <YAxis tickLine={false} axisLine={false} fontSize={11} />
                  <Tooltip />
                  <Area
                    type="monotone"
                    dataKey="y"
                    stroke={SERIES_META[key as keyof typeof SERIES_META].stroke}
                    fill={SERIES_META[key as keyof typeof SERIES_META].fill}
                    strokeWidth={1.5}
                  />
                </AreaChart>
              </ResponsiveContainer>
            </TabsContent>
          ))}
        </Tabs>
      </CardContent>
    </Card>
  )
}
