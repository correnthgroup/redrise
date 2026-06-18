import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { cn } from '@/lib/utils'

type Kpi = {
  label: string
  value: string
  delta: string
  trend: 'up' | 'down' | 'flat'
  series: number[]
}

function sparklinePath(series: number[]) {
  if (series.length === 0) return ''
  const min = Math.min(...series)
  const max = Math.max(...series)
  const range = Math.max(1, max - min)
  return series.map((value, index) => {
    const x = series.length === 1 ? 100 : (index / (series.length - 1)) * 100
    const y = 44 - ((value - min) / range) * 38
    return `${index === 0 ? 'M' : 'L'} ${x.toFixed(2)} ${y.toFixed(2)}`
  }).join(' ')
}

function KpiCard({ kpi }: { kpi: Kpi }) {
  const stroke = kpi.trend === 'up' ? '#2F5D5A' : kpi.trend === 'down' ? '#A04D1F' : '#64748B'
  const line = sparklinePath(kpi.series)

  return (
    <Card className="border-border/80 shadow-[0_1px_2px_rgba(16,24,40,0.04),0_10px_24px_rgba(16,24,40,0.06)]">
      <CardHeader className="pb-2">
        <CardTitle className="text-xs font-medium text-muted-foreground">{kpi.label}</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="font-mono text-2xl font-bold tabular-nums tracking-tight text-foreground">{kpi.value}</div>
        <div className="mt-1 text-xs text-muted-foreground">{kpi.delta}</div>
        {line ? (
          <svg className="mt-3 h-12 w-full" viewBox="0 0 100 48" preserveAspectRatio="none" aria-hidden="true">
            <path d={`${line} L 100 48 L 0 48 Z`} fill={stroke} opacity="0.15" />
            <path d={line} fill="none" stroke={stroke} strokeWidth="1.5" vectorEffect="non-scaling-stroke" />
          </svg>
        ) : null}
      </CardContent>
    </Card>
  )
}

export function KpiCards({
  items,
  count = 5,
  className,
}: {
  items?: Kpi[]
  count?: number
  className?: string
}) {
  if (!items) return null
  return (
    <div className={cn('grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-5', className)}>
      {items.slice(0, count).map((k) => (
        <KpiCard key={k.label} kpi={k} />
      ))}
    </div>
  )
}
