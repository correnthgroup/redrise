import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Progress } from '@/components/ui/progress'

const STAFFING = [
  { name: 'Team A', value: 72 },
  { name: 'Team B', value: 45 },
  { name: 'Team C', value: 88 },
  { name: 'Team D', value: 30 },
]

const MODELS = [
  { name: 'Model X', value: 60 },
  { name: 'Model Y', value: 25 },
  { name: 'Model Z', value: 15 },
]

const CAPACITY = [
  { name: 'Region A', value: 68 },
  { name: 'Region B', value: 52 },
  { name: 'Region C', value: 81 },
]

const ATTENTION = [
  'Item needing attention 1',
  'Item needing attention 2',
  'Item needing attention 3',
]

const ALERTS = [
  'Alert: threshold exceeded',
  'Alert: agent offline',
  'Alert: config drift detected',
]

const CONFIG = [
  'Config: rate limit updated',
  'Config: model version changed',
  'Config: permission updated',
]

const INDICATORS = [
  'Indicator: uptime 99.9%',
  'Indicator: avg latency 42ms',
  'Indicator: error rate 0.3%',
]

export function OperationsGrid() {
  return (
    <div className="space-y-4">
      <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
        <Card className="border-border/80 shadow-[0_1px_2px_rgba(16,24,40,0.04),0_10px_24px_rgba(16,24,40,0.06)]">
          <CardHeader><CardTitle className="text-sm font-semibold">Staffing</CardTitle></CardHeader>
          <CardContent className="space-y-2">
            {STAFFING.map((s) => (
              <div key={s.name}>
                <div className="flex justify-between text-xs"><span>{s.name}</span><span>{s.value}%</span></div>
                <Progress value={s.value} />
              </div>
            ))}
          </CardContent>
        </Card>

        <Card className="border-border/80 shadow-[0_1px_2px_rgba(16,24,40,0.04),0_10px_24px_rgba(16,24,40,0.06)]">
          <CardHeader><CardTitle className="text-sm font-semibold">Model Breakdown</CardTitle></CardHeader>
          <CardContent className="space-y-2">
            {MODELS.map((m) => (
              <div key={m.name}>
                <div className="flex justify-between text-xs"><span>{m.name}</span><span>{m.value}%</span></div>
                <Progress value={m.value} />
              </div>
            ))}
          </CardContent>
        </Card>

        <Card className="border-border/80 shadow-[0_1px_2px_rgba(16,24,40,0.04),0_10px_24px_rgba(16,24,40,0.06)]">
          <CardHeader><CardTitle className="text-sm font-semibold">Capacity Mix</CardTitle></CardHeader>
          <CardContent className="space-y-2">
            {CAPACITY.map((c) => (
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
          <CardHeader><CardTitle className="text-sm font-semibold">Attention Queue</CardTitle></CardHeader>
          <CardContent>
            <ul className="space-y-2 text-sm">
              {ATTENTION.map((a) => (
                <li key={a} className="rounded-md border bg-muted/45 p-2">{a}</li>
              ))}
            </ul>
          </CardContent>
        </Card>

        <Card className="border-border/80 shadow-[0_1px_2px_rgba(16,24,40,0.04),0_10px_24px_rgba(16,24,40,0.06)]">
          <CardHeader><CardTitle className="text-sm font-semibold">Alerts</CardTitle></CardHeader>
          <CardContent>
            <ul className="space-y-2 text-sm">
              {ALERTS.map((a) => (
                <li key={a} className="rounded-md border border-primary/20 bg-primary/6 p-2 text-foreground">{a}</li>
              ))}
            </ul>
          </CardContent>
        </Card>

        <Card className="border-border/80 shadow-[0_1px_2px_rgba(16,24,40,0.04),0_10px_24px_rgba(16,24,40,0.06)]">
          <CardHeader><CardTitle className="text-sm font-semibold">Configuration Watch</CardTitle></CardHeader>
          <CardContent>
            <ul className="space-y-2 text-sm">
              {CONFIG.map((c) => (
                <li key={c} className="rounded-md border bg-[#2F4858]/6 p-2 text-foreground">{c}</li>
              ))}
            </ul>
          </CardContent>
        </Card>

        <Card className="border-border/80 shadow-[0_1px_2px_rgba(16,24,40,0.04),0_10px_24px_rgba(16,24,40,0.06)]">
          <CardHeader><CardTitle className="text-sm font-semibold">Operational Indicators</CardTitle></CardHeader>
          <CardContent>
            <ul className="space-y-2 text-sm">
              {INDICATORS.map((i) => (
                <li key={i} className="rounded-md border bg-muted/45 p-2">{i}</li>
              ))}
            </ul>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
