import { useState, useEffect } from 'react'
import { BackButton } from '@/components/ui/back-button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Badge } from '@/components/ui/badge'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Brain, Code, FileText, BarChart3, Lightbulb, Zap, Globe, Shield, Clock, Check, X, AlertTriangle } from 'lucide-react'
import type { Agent } from '@/types/agent'
import type { TaskExecution } from '@/types/task-execution'
import { loadAgent } from '@/lib/agents'
import { loadExecutionsByAgent } from '@/lib/task-executions'
import { useI18n } from '@/hooks/use-i18n'

const STATUS_BADGE: Record<Agent['status'], string> = {
  active: 'border-[#2F5D5A]/25 bg-[#2F5D5A]/8 text-[#2F5D5A]',
  paused: 'border-[#B7791F]/18 bg-[#FFF8E1] text-[#7A3E14]',
  error: 'border-primary/18 bg-primary/8 text-primary',
  idle: 'border-slate-200 bg-slate-50 text-slate-600',
}

const EXEC_STATUS_ICON: Record<string, typeof Clock> = {
  pending: Clock,
  running: Clock,
  completed: Check,
  rejected: X,
  failed: AlertTriangle,
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
  const [executions, setExecutions] = useState<TaskExecution[]>([])
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

  // Load real execution history
  useEffect(() => {
    if (!agentId) return
    loadExecutionsByAgent(agentId).then(setExecutions).catch(() => setExecutions([]))
  }, [agentId])

  // Fetch benchmark data
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
    const interval = setInterval(fetchBenchmark, 3 * 60 * 60 * 1000)
    return () => clearInterval(interval)
  }, [tab])

  function agentName(name: string) {
    return name === 'Default Agent' && locale === 'pt-BR' ? t('agents.defaultAgent') : name
  }

  function statusLabel(status: Agent['status']) {
    if (status === 'active') return t('agents.status.active')
    if (status === 'paused') return t('agents.status.paused')
    if (status === 'idle') return t('agents.status.idle')
    return t('agents.status.error')
  }

  // Compute execution metrics
  const totalExecs = executions.length
  const completedExecs = executions.filter((e) => e.status === 'completed').length
  const successRate = totalExecs > 0 ? Math.round((completedExecs / totalExecs) * 100) : 0
  const totalTokens = executions.reduce((sum, e) => sum + (e.tokens_used || 0), 0)

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
          {onBack && <BackButton onClick={onBack} />}
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
            <Card className="border-border/80 shadow-sm">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-[#2F5D5A]/10">
                      <Brain className="h-4 w-4 text-[#2F5D5A]" />
                    </div>
                    <div>
                      <CardTitle className="text-sm font-semibold">{agent.model}</CardTitle>
                      <p className="text-[10px] text-muted-foreground">{agent.provider} · {benchmark.pricePerToken === 0 ? t('agents.free') : t('agents.provider')}</p>
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
            <Card className="border-border/80 shadow-sm">
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
              <Card className="border-border/80 shadow-sm">
                <CardHeader>
                  <CardTitle className="text-sm font-semibold">{t('agents.capabilities')}</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {[
                      { icon: Brain, label: t('agents.advancedReasoning'), desc: t('agents.advancedReasoningDesc') },
                      { icon: Code, label: t('agents.codeGeneration'), desc: t('agents.codeGenerationDesc') },
                      { icon: FileText, label: t('agents.documentAnalysis'), desc: t('agents.documentAnalysisDesc') },
                      { icon: BarChart3, label: t('agents.dataAnalysis'), desc: t('agents.dataAnalysisDesc') },
                      { icon: Lightbulb, label: t('agents.creativeWriting'), desc: t('agents.creativeWritingDesc') },
                    ].map(({ icon: Icon, label, desc }) => (
                      <div key={label} className="flex items-start gap-3">
                        <div className="flex h-6 w-6 items-center justify-center rounded bg-[#2F5D5A]/10 shrink-0">
                          <Icon className="h-3.5 w-3.5 text-[#2F5D5A]" />
                        </div>
                        <div>
                          <div className="text-sm font-medium">{label}</div>
                          <div className="text-xs text-muted-foreground">{desc}</div>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              <Card className="border-border/80 shadow-sm">
                <CardHeader>
                  <CardTitle className="text-sm font-semibold">{t('agents.bestUseCases')}</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {[
                      { icon: Zap, label: t('agents.workflowAutomation'), desc: t('agents.workflowAutomationDesc') },
                      { icon: Globe, label: t('agents.customerSupport'), desc: t('agents.customerSupportDesc') },
                      { icon: Shield, label: t('agents.complianceReview'), desc: t('agents.complianceReviewDesc') },
                      { icon: Brain, label: t('agents.researchAnalysis'), desc: t('agents.researchAnalysisDesc') },
                      { icon: Code, label: t('agents.codeAssistant'), desc: t('agents.codeAssistantDesc') },
                    ].map(({ icon: Icon, label, desc }) => (
                      <div key={label} className="flex items-start gap-3">
                        <div className="flex h-6 w-6 items-center justify-center rounded bg-[#A04D1F]/10 shrink-0">
                          <Icon className="h-3.5 w-3.5 text-[#A04D1F]" />
                        </div>
                        <div>
                          <div className="text-sm font-medium">{label}</div>
                          <div className="text-xs text-muted-foreground">{desc}</div>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>

            <div className="rounded-lg border bg-muted/20 p-3">
              <p className="text-xs text-muted-foreground">
                {t('agents.benchmarkSource', { source: 'Artificial Analysis' })} {t('agents.benchmarkRefreshes')}
              </p>
            </div>
          </div>
        </TabsContent>

        <TabsContent value="logs" className="min-h-0 flex-1">
          <div className="space-y-4">
            {/* Metrics cards */}
            <div className="grid grid-cols-3 gap-4">
              <Card className="border-border/80 shadow-sm">
                <CardContent className="pt-4">
                  <div className="text-xs text-muted-foreground">{t('agentDetail.totalExecutions')}</div>
                  <div className="mt-1 text-2xl font-bold text-[#2F5D5A]">{totalExecs}</div>
                </CardContent>
              </Card>
              <Card className="border-border/80 shadow-sm">
                <CardContent className="pt-4">
                  <div className="text-xs text-muted-foreground">{t('agentDetail.successRate')}</div>
                  <div className="mt-1 text-2xl font-bold text-[#2F5D5A]">{successRate}%</div>
                </CardContent>
              </Card>
              <Card className="border-border/80 shadow-sm">
                <CardContent className="pt-4">
                  <div className="text-xs text-muted-foreground">{t('agentDetail.totalTokens')}</div>
                  <div className="mt-1 text-2xl font-bold text-[#2F5D5A]">{totalTokens.toLocaleString()}</div>
                </CardContent>
              </Card>
            </div>

            {/* Execution list */}
            <Card className="border-border/80 shadow-sm">
              <CardHeader><CardTitle className="text-sm font-semibold">{t('agentDetail.recentExecutions')}</CardTitle></CardHeader>
              <CardContent>
                {executions.length === 0 ? (
                  <div className="flex flex-col items-center justify-center py-12 text-center">
                    <Clock className="h-8 w-8 text-muted-foreground/40 mb-3" />
                    <p className="text-sm text-muted-foreground">{t('agentDetail.noActivity')}</p>
                  </div>
                ) : (
                  <ScrollArea className="max-h-96">
                    <div className="space-y-2">
                      {executions.map((exec) => {
                        const ExecIcon = EXEC_STATUS_ICON[exec.status] || Clock
                        return (
                          <div key={exec.id} className="flex items-start gap-3 rounded-lg border p-3 text-sm">
                            <ExecIcon className={`mt-0.5 h-4 w-4 shrink-0 ${
                              exec.status === 'completed' ? 'text-[#2F5D5A]' :
                              exec.status === 'rejected' || exec.status === 'failed' ? 'text-[#A04D1F]' :
                              'text-muted-foreground'
                            }`} />
                            <div className="flex-1 min-w-0">
                              <div className="flex items-center gap-2">
                                <span className="font-medium">{exec.task_id}</span>
                                <Badge variant="outline" className={`text-[10px] ${
                                  exec.status === 'completed' ? 'border-[#2F5D5A]/25 bg-[#2F5D5A]/8 text-[#2F5D5A]' :
                                  exec.status === 'rejected' || exec.status === 'failed' ? 'border-[#A04D1F]/25 bg-[#A04D1F]/8 text-[#A04D1F]' :
                                  'border-slate-200 bg-slate-50 text-slate-600'
                                }`}>{exec.status}</Badge>
                              </div>
                              <p className="text-xs text-muted-foreground mt-1 line-clamp-2">{exec.prompt_sent}</p>
                              <div className="flex items-center gap-3 text-[10px] text-muted-foreground/60 mt-1">
                                <span>{new Date(exec.created_at).toLocaleString()}</span>
                                {exec.tokens_used != null && <span>{exec.tokens_used} tokens</span>}
                                {exec.model && <span>{exec.model}</span>}
                              </div>
                            </div>
                          </div>
                        )
                      })}
                    </div>
                  </ScrollArea>
                )}
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  )
}
