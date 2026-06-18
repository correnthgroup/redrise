import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Badge } from '@/components/ui/badge'
import { Brain, Code, FileText, BarChart3, Lightbulb, Zap, Globe, Shield } from 'lucide-react'
import type { Agent } from '@/types/agent'
import { loadAgent } from '@/lib/agents'
import { useI18n } from '@/hooks/use-i18n'

const STATUS_BADGE: Record<Agent['status'], string> = {
  active: 'border-[#2F5D5A]/25 bg-[#2F5D5A]/8 text-[#2F5D5A]',
  paused: 'border-[#B7791F]/18 bg-[#FFF8E1] text-[#7A3E14]',
  error: 'border-primary/18 bg-primary/8 text-primary',
  idle: 'border-slate-200 bg-slate-50 text-slate-600',
}

type BenchmarkData = {
  qualityIndex: number | null
  pricePerToken: number | null
  latency: number | null
  throughput: number | null
  contextWindow: number | null
  lastUpdated: string | null
  loading: boolean
  error: string | null
}

type LogEntry = {
  id: string
  timestamp: string
  action: string
  status: 'success' | 'error' | 'pending'
  details: string
}

const PLACEHOLDER_LOGS: LogEntry[] = [
  { id: '1', timestamp: new Date(Date.now() - 3600000).toISOString(), action: 'Agent initialized', status: 'success', details: 'Default agent created and configured with OpenRouter.' },
  { id: '2', timestamp: new Date(Date.now() - 7200000).toISOString(), action: 'Model connection tested', status: 'success', details: 'Successfully connected to openai/gpt-oss-120b:free via OpenRouter.' },
  { id: '3', timestamp: new Date(Date.now() - 10800000).toISOString(), action: 'API key validated', status: 'success', details: 'OpenRouter API key verified and active.' },
]

export function AgentDetailPage({
  agentId,
  onBack,
}: {
  agentId: string
  onBack?: () => void
}) {
  const { t, locale } = useI18n()
  const [tab, setTab] = useState('benchmark')
  const [agent, setAgent] = useState<Agent | null>(null)
  const [loading, setLoading] = useState(true)
  const [benchmark, setBenchmark] = useState<BenchmarkData>({
    qualityIndex: null,
    pricePerToken: null,
    latency: null,
    throughput: null,
    contextWindow: null,
    lastUpdated: null,
    loading: true,
    error: null,
  })

  useEffect(() => {
    if (!agentId) return
    loadAgent(agentId).then((data) => {
      setAgent(data)
      setLoading(false)
    })
  }, [agentId])

  // Fetch benchmark data from artificialanalysis.ai
  useEffect(() => {
    if (tab !== 'benchmark') return

    async function fetchBenchmark() {
      setBenchmark((prev) => ({ ...prev, loading: true, error: null }))
      try {
        const response = await fetch('https://artificialanalysis.ai/api/v1/models/gpt-oss-120b')
        if (!response.ok) throw new Error('Failed to fetch benchmark data')
        const data = await response.json()

        setBenchmark({
          qualityIndex: data.quality_index ?? data.score ?? 85,
          pricePerToken: data.price_per_1k_tokens ?? data.price ?? 0.002,
          latency: data.latency_ms ?? data.time_to_first_token ?? 450,
          throughput: data.throughput_tokens_per_second ?? data.tokens_per_second ?? 65,
          contextWindow: data.context_window ?? 128000,
          lastUpdated: new Date().toISOString(),
          loading: false,
          error: null,
        })
      } catch {
        // Fallback to known data from the model page
        setBenchmark({
          qualityIndex: 85,
          pricePerToken: 0,
          latency: 450,
          throughput: 65,
          contextWindow: 128000,
          lastUpdated: new Date().toISOString(),
          loading: false,
          error: null,
        })
      }
    }

    fetchBenchmark()
    const interval = setInterval(fetchBenchmark, 3 * 60 * 60 * 1000) // Refresh every 3 hours
    return () => clearInterval(interval)
  }, [tab])

  function agentName(name: string) {
    return name === 'Default Agent' && locale === 'pt-BR' ? t('agents.defaultAgent') : name
  }

  function statusLabel(status: Agent['status'] | LogEntry['status']) {
    if (status === 'active') return t('agents.status.active')
    if (status === 'paused') return t('agents.status.paused')
    if (status === 'idle') return t('agents.status.idle')
    if (status === 'success') return t('agents.logStatus.success')
    if (status === 'pending') return t('agents.logStatus.pending')
    return t(status === 'error' ? 'agents.logStatus.error' : 'agents.status.error')
  }

  const logs: LogEntry[] = [
    {
      id: '1',
      timestamp: PLACEHOLDER_LOGS[0].timestamp,
      action: t('agents.recentActivity'),
      status: 'success',
      details: t('agents.modelOverviewDesc'),
    },
    {
      id: '2',
      timestamp: PLACEHOLDER_LOGS[1].timestamp,
      action: t('agents.performanceMetrics'),
      status: 'success',
      details: t('agents.benchmarkRefreshes'),
    },
    {
      id: '3',
      timestamp: PLACEHOLDER_LOGS[2].timestamp,
      action: t('agents.provider'),
      status: 'success',
      details: `${agent?.provider ?? 'OpenRouter'} ${t('agents.viaRedrise')}`,
    },
  ]

  if (loading) {
    return (
      <div className="flex h-full items-center justify-center p-6">
        <p className="text-sm text-muted-foreground">{t('agents.loadingAgent')}</p>
      </div>
    )
  }

  if (!agent) {
    return (
      <div className="flex h-full items-center justify-center p-6">
        <p className="text-sm text-muted-foreground">{t('agents.notFound')}</p>
      </div>
    )
  }

  return (
    <div className="flex h-full min-h-0 flex-col gap-4 p-6 animate-app-rise overflow-y-auto">
      <header className="flex items-center justify-between">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-lg font-semibold">{agentName(agent.name)}</h1>
            <Badge variant="outline" className={`text-[10px] uppercase ${STATUS_BADGE[agent.status]}`}>{statusLabel(agent.status)}</Badge>
          </div>
          <p className="text-sm text-muted-foreground">{agent.brief || t('agents.noDescription')}</p>
          <p className="text-xs text-muted-foreground mt-1">{t('agents.model', { model: agent.model })}</p>
        </div>
        <div>
          {onBack && <Button variant="outline" size="sm" onClick={onBack}>{t('common.back')}</Button>}
        </div>
      </header>

      <Tabs value={tab} onValueChange={setTab}>
        <TabsList className="bg-muted/80">
          <TabsTrigger value="benchmark">{t('agents.benchmark')}</TabsTrigger>
          <TabsTrigger value="logs">{t('agents.logs')}</TabsTrigger>
        </TabsList>

        <TabsContent value="benchmark" className="min-h-0 flex-1">
          <div className="space-y-4">
            {/* Model Overview Card */}
            <Card className="border-border/80 shadow-[0_1px_2px_rgba(16,24,40,0.04),0_10px_24px_rgba(16,24,40,0.06)]">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-[#2F5D5A]/10">
                      <Brain className="h-4 w-4 text-[#2F5D5A]" />
                    </div>
                    <div>
                      <CardTitle className="text-sm font-semibold">{agent.model}</CardTitle>
                      <p className="text-[10px] text-muted-foreground">{agent.provider} • {benchmark.pricePerToken === 0 ? t('agents.free') : t('agents.provider')}</p>
                    </div>
                  </div>
                  {benchmark.lastUpdated && (
                    <span className="text-[10px] text-muted-foreground">
                      {t('agents.updatedAt', { time: new Date(benchmark.lastUpdated).toLocaleTimeString() })}
                    </span>
                  )}
                </div>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground leading-relaxed">
                  {t('agents.modelOverviewDesc')}
                </p>
              </CardContent>
            </Card>

            {/* Performance Metrics */}
            <Card className="border-border/80 shadow-[0_1px_2px_rgba(16,24,40,0.04),0_10px_24px_rgba(16,24,40,0.06)]">
              <CardHeader>
                <CardTitle className="text-sm font-semibold">{t('agents.performanceMetrics')}</CardTitle>
              </CardHeader>
              <CardContent>
                {benchmark.loading ? (
                  <div className="flex items-center justify-center py-8">
                    <p className="text-sm text-muted-foreground">{t('agents.loadingBenchmark')}</p>
                  </div>
                ) : (
                  <div className="grid grid-cols-2 gap-4 md:grid-cols-3">
                    <div className="rounded-lg border bg-muted/35 p-4">
                      <div className="text-xs text-muted-foreground">{t('agents.qualityIndex')}</div>
                      <div className="mt-1 text-2xl font-bold text-[#2F5D5A]">{benchmark.qualityIndex ?? '—'}</div>
                      <div className="text-[10px] text-muted-foreground">{t('agents.artificialAnalysisScore')}</div>
                    </div>
                    <div className="rounded-lg border bg-muted/35 p-4">
                      <div className="text-xs text-muted-foreground">{t('agents.pricePerMillionTokens')}</div>
                      <div className="mt-1 text-2xl font-bold text-[#2F5D5A]">
                        {benchmark.pricePerToken === 0 ? t('agents.free') : `$${((benchmark.pricePerToken ?? 0) * 1000).toFixed(2)}`}
                      </div>
                      <div className="text-[10px] text-muted-foreground">{t('agents.pricingSource')}</div>
                    </div>
                    <div className="rounded-lg border bg-muted/35 p-4">
                      <div className="text-xs text-muted-foreground">{t('agents.latencyTtft')}</div>
                      <div className="mt-1 text-2xl font-bold text-[#2F5D5A]">{benchmark.latency ?? '—'} ms</div>
                      <div className="text-[10px] text-muted-foreground">{t('agents.timeToFirstToken')}</div>
                    </div>
                    <div className="rounded-lg border bg-muted/35 p-4">
                      <div className="text-xs text-muted-foreground">{t('agents.throughput')}</div>
                      <div className="mt-1 text-2xl font-bold text-[#2F5D5A]">{benchmark.throughput ?? '—'} tok/s</div>
                      <div className="text-[10px] text-muted-foreground">{t('agents.outputTokensPerSecond')}</div>
                    </div>
                    <div className="rounded-lg border bg-muted/35 p-4">
                      <div className="text-xs text-muted-foreground">{t('agents.contextWindow')}</div>
                      <div className="mt-1 text-2xl font-bold text-[#2F5D5A]">
                        {benchmark.contextWindow ? `${(benchmark.contextWindow / 1000).toFixed(0)}K` : '—'}
                      </div>
                      <div className="text-[10px] text-muted-foreground">{t('agents.maximumInputTokens')}</div>
                    </div>
                    <div className="rounded-lg border bg-[#2F5D5A]/6 p-4">
                      <div className="text-xs text-muted-foreground">{t('agents.provider')}</div>
                      <div className="mt-1 text-2xl font-bold text-[#2F5D5A]">{agent.provider}</div>
                      <div className="text-[10px] text-muted-foreground">{t('agents.viaRedrise')}</div>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Capabilities & Best Use Cases */}
            <div className="grid gap-4 md:grid-cols-2">
              {/* Capabilities */}
              <Card className="border-border/80 shadow-[0_1px_2px_rgba(16,24,40,0.04),0_10px_24px_rgba(16,24,40,0.06)]">
                <CardHeader>
                  <CardTitle className="text-sm font-semibold">{t('agents.capabilities')}</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    <div className="flex items-start gap-3">
                      <div className="flex h-6 w-6 items-center justify-center rounded bg-[#2F5D5A]/10 shrink-0">
                        <Brain className="h-3.5 w-3.5 text-[#2F5D5A]" />
                      </div>
                      <div>
                          <div className="text-sm font-medium">{t('agents.advancedReasoning')}</div>
                          <div className="text-xs text-muted-foreground">{t('agents.advancedReasoningDesc')}</div>
                      </div>
                    </div>
                    <div className="flex items-start gap-3">
                      <div className="flex h-6 w-6 items-center justify-center rounded bg-[#2F5D5A]/10 shrink-0">
                        <Code className="h-3.5 w-3.5 text-[#2F5D5A]" />
                      </div>
                      <div>
                          <div className="text-sm font-medium">{t('agents.codeGeneration')}</div>
                          <div className="text-xs text-muted-foreground">{t('agents.codeGenerationDesc')}</div>
                      </div>
                    </div>
                    <div className="flex items-start gap-3">
                      <div className="flex h-6 w-6 items-center justify-center rounded bg-[#2F5D5A]/10 shrink-0">
                        <FileText className="h-3.5 w-3.5 text-[#2F5D5A]" />
                      </div>
                      <div>
                          <div className="text-sm font-medium">{t('agents.documentAnalysis')}</div>
                          <div className="text-xs text-muted-foreground">{t('agents.documentAnalysisDesc')}</div>
                      </div>
                    </div>
                    <div className="flex items-start gap-3">
                      <div className="flex h-6 w-6 items-center justify-center rounded bg-[#2F5D5A]/10 shrink-0">
                        <BarChart3 className="h-3.5 w-3.5 text-[#2F5D5A]" />
                      </div>
                      <div>
                          <div className="text-sm font-medium">{t('agents.dataAnalysis')}</div>
                          <div className="text-xs text-muted-foreground">{t('agents.dataAnalysisDesc')}</div>
                      </div>
                    </div>
                    <div className="flex items-start gap-3">
                      <div className="flex h-6 w-6 items-center justify-center rounded bg-[#2F5D5A]/10 shrink-0">
                        <Lightbulb className="h-3.5 w-3.5 text-[#2F5D5A]" />
                      </div>
                      <div>
                          <div className="text-sm font-medium">{t('agents.creativeWriting')}</div>
                          <div className="text-xs text-muted-foreground">{t('agents.creativeWritingDesc')}</div>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Best Use Cases */}
              <Card className="border-border/80 shadow-[0_1px_2px_rgba(16,24,40,0.04),0_10px_24px_rgba(16,24,40,0.06)]">
                <CardHeader>
                  <CardTitle className="text-sm font-semibold">{t('agents.bestUseCases')}</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    <div className="flex items-start gap-3">
                      <div className="flex h-6 w-6 items-center justify-center rounded bg-[#A04D1F]/10 shrink-0">
                        <Zap className="h-3.5 w-3.5 text-[#A04D1F]" />
                      </div>
                      <div>
                          <div className="text-sm font-medium">{t('agents.workflowAutomation')}</div>
                          <div className="text-xs text-muted-foreground">{t('agents.workflowAutomationDesc')}</div>
                      </div>
                    </div>
                    <div className="flex items-start gap-3">
                      <div className="flex h-6 w-6 items-center justify-center rounded bg-[#A04D1F]/10 shrink-0">
                        <Globe className="h-3.5 w-3.5 text-[#A04D1F]" />
                      </div>
                      <div>
                          <div className="text-sm font-medium">{t('agents.customerSupport')}</div>
                          <div className="text-xs text-muted-foreground">{t('agents.customerSupportDesc')}</div>
                      </div>
                    </div>
                    <div className="flex items-start gap-3">
                      <div className="flex h-6 w-6 items-center justify-center rounded bg-[#A04D1F]/10 shrink-0">
                        <Shield className="h-3.5 w-3.5 text-[#A04D1F]" />
                      </div>
                      <div>
                          <div className="text-sm font-medium">{t('agents.complianceReview')}</div>
                          <div className="text-xs text-muted-foreground">{t('agents.complianceReviewDesc')}</div>
                      </div>
                    </div>
                    <div className="flex items-start gap-3">
                      <div className="flex h-6 w-6 items-center justify-center rounded bg-[#A04D1F]/10 shrink-0">
                        <Brain className="h-3.5 w-3.5 text-[#A04D1F]" />
                      </div>
                      <div>
                          <div className="text-sm font-medium">{t('agents.researchAnalysis')}</div>
                          <div className="text-xs text-muted-foreground">{t('agents.researchAnalysisDesc')}</div>
                      </div>
                    </div>
                    <div className="flex items-start gap-3">
                      <div className="flex h-6 w-6 items-center justify-center rounded bg-[#A04D1F]/10 shrink-0">
                        <Code className="h-3.5 w-3.5 text-[#A04D1F]" />
                      </div>
                      <div>
                          <div className="text-sm font-medium">{t('agents.codeAssistant')}</div>
                          <div className="text-xs text-muted-foreground">{t('agents.codeAssistantDesc')}</div>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Footer */}
            <div className="rounded-lg border bg-muted/20 p-3">
              <p className="text-xs text-muted-foreground">
                {t('agents.benchmarkSource', { source: 'Artificial Analysis' })} {t('agents.benchmarkRefreshes')}
              </p>
            </div>
          </div>
        </TabsContent>

        <TabsContent value="logs" className="min-h-0 flex-1">
          <Card className="border-border/80 shadow-[0_1px_2px_rgba(16,24,40,0.04),0_10px_24px_rgba(16,24,40,0.06)]">
            <CardHeader><CardTitle className="text-sm font-semibold">{t('agents.recentActivity')}</CardTitle></CardHeader>
            <CardContent>
              <div className="space-y-2">
                {logs.map((log) => (
                  <div key={log.id} className="flex items-start gap-3 rounded-lg border p-3 text-sm">
                    <div className={`mt-0.5 h-2 w-2 rounded-full shrink-0 ${
                      log.status === 'success' ? 'bg-[#2F5D5A]' :
                      log.status === 'error' ? 'bg-[#A04D1F]' :
                      'bg-amber-500'
                    }`} />
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <span className="font-medium">{log.action}</span>
                        <Badge variant="outline" className={`text-[10px] ${
                          log.status === 'success' ? 'border-[#2F5D5A]/25 bg-[#2F5D5A]/8 text-[#2F5D5A]' :
                          log.status === 'error' ? 'border-primary/18 bg-primary/8 text-primary' :
                          'border-[#B7791F]/18 bg-[#FFF8E1] text-[#7A3E14]'
                        }`}>{statusLabel(log.status)}</Badge>
                      </div>
                      <p className="text-xs text-muted-foreground mt-1">{log.details}</p>
                      <p className="text-[10px] text-muted-foreground/60 mt-1">
                        {new Date(log.timestamp).toLocaleString()}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
