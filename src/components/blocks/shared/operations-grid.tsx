import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Progress } from '@/components/ui/progress'
import { useI18n } from '@/hooks/use-i18n'

const STAFFING = [
  { nameKey: 'dashboard.teamA', value: 72 },
  { nameKey: 'dashboard.teamB', value: 45 },
  { nameKey: 'dashboard.teamC', value: 88 },
  { nameKey: 'dashboard.teamD', value: 30 },
]

const MODELS = [
  { nameKey: 'dashboard.modelX', value: 60 },
  { nameKey: 'dashboard.modelY', value: 25 },
  { nameKey: 'dashboard.modelZ', value: 15 },
]

const CAPACITY = [
  { nameKey: 'dashboard.regionA', value: 68 },
  { nameKey: 'dashboard.regionB', value: 52 },
  { nameKey: 'dashboard.regionC', value: 81 },
]

const ATTENTION = [
  'dashboard.attentionItem1',
  'dashboard.attentionItem2',
  'dashboard.attentionItem3',
]

const ALERTS = [
  'dashboard.alertThreshold',
  'dashboard.alertAgentOffline',
  'dashboard.alertConfigDrift',
]

const CONFIG = [
  'dashboard.configRateLimit',
  'dashboard.configModelVersion',
  'dashboard.configPermission',
]

const INDICATORS = [
  'dashboard.indicatorUptime',
  'dashboard.indicatorLatency',
  'dashboard.indicatorErrorRate',
]

export function OperationsGrid() {
  const { t } = useI18n()

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
        <Card className="border-border/80 shadow-[0_1px_2px_rgba(16,24,40,0.04),0_10px_24px_rgba(16,24,40,0.06)]">
          <CardHeader><CardTitle className="text-sm font-semibold">{t('dashboard.staffing')}</CardTitle></CardHeader>
          <CardContent className="space-y-2">
            {STAFFING.map((s) => (
              <div key={s.nameKey}>
                <div className="flex justify-between text-xs"><span>{t(s.nameKey)}</span><span>{s.value}%</span></div>
                <Progress value={s.value} />
              </div>
            ))}
          </CardContent>
        </Card>

        <Card className="border-border/80 shadow-[0_1px_2px_rgba(16,24,40,0.04),0_10px_24px_rgba(16,24,40,0.06)]">
          <CardHeader><CardTitle className="text-sm font-semibold">{t('dashboard.modelBreakdown')}</CardTitle></CardHeader>
          <CardContent className="space-y-2">
            {MODELS.map((m) => (
              <div key={m.nameKey}>
                <div className="flex justify-between text-xs"><span>{t(m.nameKey)}</span><span>{m.value}%</span></div>
                <Progress value={m.value} />
              </div>
            ))}
          </CardContent>
        </Card>

        <Card className="border-border/80 shadow-[0_1px_2px_rgba(16,24,40,0.04),0_10px_24px_rgba(16,24,40,0.06)]">
          <CardHeader><CardTitle className="text-sm font-semibold">{t('dashboard.capacityMix')}</CardTitle></CardHeader>
          <CardContent className="space-y-2">
            {CAPACITY.map((c) => (
              <div key={c.nameKey}>
                <div className="flex justify-between text-xs"><span>{t(c.nameKey)}</span><span>{c.value}%</span></div>
                <Progress value={c.value} />
              </div>
            ))}
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 gap-4 xl:grid-cols-4">
        <Card className="border-border/80 shadow-[0_1px_2px_rgba(16,24,40,0.04),0_10px_24px_rgba(16,24,40,0.06)]">
          <CardHeader><CardTitle className="text-sm font-semibold">{t('dashboard.attentionQueue')}</CardTitle></CardHeader>
          <CardContent>
            <ul className="space-y-2 text-sm">
              {ATTENTION.map((a) => (
                <li key={a} className="rounded-md border bg-muted/45 p-2">{t(a)}</li>
              ))}
            </ul>
          </CardContent>
        </Card>

        <Card className="border-border/80 shadow-[0_1px_2px_rgba(16,24,40,0.04),0_10px_24px_rgba(16,24,40,0.06)]">
          <CardHeader><CardTitle className="text-sm font-semibold">{t('dashboard.alerts')}</CardTitle></CardHeader>
          <CardContent>
            <ul className="space-y-2 text-sm">
              {ALERTS.map((a) => (
                <li key={a} className="rounded-md border border-primary/20 bg-primary/6 p-2 text-foreground">{t(a)}</li>
              ))}
            </ul>
          </CardContent>
        </Card>

        <Card className="border-border/80 shadow-[0_1px_2px_rgba(16,24,40,0.04),0_10px_24px_rgba(16,24,40,0.06)]">
          <CardHeader><CardTitle className="text-sm font-semibold">{t('dashboard.configurationWatch')}</CardTitle></CardHeader>
          <CardContent>
            <ul className="space-y-2 text-sm">
              {CONFIG.map((c) => (
                <li key={c} className="rounded-md border bg-[#2F5D5A]/6 p-2 text-foreground">{t(c)}</li>
              ))}
            </ul>
          </CardContent>
        </Card>

        <Card className="border-border/80 shadow-[0_1px_2px_rgba(16,24,40,0.04),0_10px_24px_rgba(16,24,40,0.06)]">
          <CardHeader><CardTitle className="text-sm font-semibold">{t('dashboard.operationalIndicators')}</CardTitle></CardHeader>
          <CardContent>
            <ul className="space-y-2 text-sm">
              {INDICATORS.map((i) => (
                <li key={i} className="rounded-md border bg-muted/45 p-2">{t(i)}</li>
              ))}
            </ul>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
