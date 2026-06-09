import { Area, AreaChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'

const SERIES: Record<string, { name: string; data: { x: string; y: number }[] }[]> = {
  usage: [{ name: 'Usage', data: makeSeries(12) }],
  errors: [{ name: 'Errors', data: makeSeries(12) }],
  latency: [{ name: 'Latency ms', data: makeSeries(12) }],
}

const SERIES_META = {
  usage: { stroke: '#2F4858', fill: 'url(#grad-usage)', label: 'Workspace activity' },
  errors: { stroke: '#8c1f28', fill: 'url(#grad-errors)', label: 'Operational errors' },
  latency: { stroke: '#64748B', fill: 'url(#grad-latency)', label: 'System latency' },
} as const

function makeSeries(n: number) {
  return Array.from({ length: n }, (_, i) => ({
    x: `D${i + 1}`,
    y: Math.round(40 + Math.sin(i / 2) * 15 + Math.random() * 10),
  }))
}

export function ChartTabs() {
  return (
    <Card className="border-border/80 shadow-[0_1px_2px_rgba(16,24,40,0.04),0_10px_24px_rgba(16,24,40,0.06)]">
      <CardHeader>
        <CardTitle className="text-sm font-semibold">Operational overview</CardTitle>
      </CardHeader>
      <CardContent>
        <Tabs defaultValue="usage">
          <TabsList className="bg-muted/80">
            <TabsTrigger value="usage">Usage</TabsTrigger>
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
