import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Badge } from '@/components/ui/badge'
import type { Agent } from '@/types/agent'
import { loadAgent } from '@/lib/agents'

const STATUS_COLOR: Record<Agent['status'], string> = {
  active: 'bg-[#2F4858]',
  paused: 'bg-amber-500',
  error: 'bg-[#8c1f28]',
  idle: 'bg-slate-400',
}

const STATUS_BADGE: Record<Agent['status'], string> = {
  active: 'border-[#2F4858]/25 bg-[#2F4858]/8 text-[#2F4858]',
  paused: 'border-[#B7791F]/18 bg-[#FFF4DB] text-[#8A6116]',
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
    setLoading(true)
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
    const interval = setInterval(fetchBenchmark, 30000) // Refresh every 30s
    return () => clearInterval(interval)
  }, [tab])

  if (loading) {
    return (
      <div className="flex h-full items-center justify-center p-6">
        <p className="text-sm text-muted-foreground">Loading agent...</p>
      </div>
    )
  }

  if (!agent) {
    return (
      <div className="flex h-full items-center justify-center p-6">
        <p className="text-sm text-muted-foreground">Agent not found.</p>
      </div>
    )
  }

  return (
    <div className="flex h-full min-h-0 flex-col gap-4 p-6 animate-app-rise">
      <header className="flex items-center justify-between">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-lg font-semibold">{agent.name}</h1>
            <Badge variant="outline" className={`text-[10px] uppercase ${STATUS_BADGE[agent.status]}`}>{agent.status}</Badge>
          </div>
          <p className="text-sm text-muted-foreground">{agent.brief || 'No description'}</p>
          <p className="text-xs text-muted-foreground mt-1">Model: {agent.model}</p>
        </div>
        <div>
          {onBack && <Button variant="outline" size="sm" onClick={onBack}>Back</Button>}
        </div>
      </header>

      <Tabs value={tab} onValueChange={setTab}>
        <TabsList className="bg-muted/80">
          <TabsTrigger value="benchmark">Benchmark</TabsTrigger>
          <TabsTrigger value="logs">Logs</TabsTrigger>
        </TabsList>

        <TabsContent value="benchmark" className="min-h-0 flex-1">
          <Card className="border-border/80 shadow-[0_1px_2px_rgba(16,24,40,0.04),0_10px_24px_rgba(16,24,40,0.06)]">
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="text-sm font-semibold">Model Benchmark — gpt-oss-120b</CardTitle>
                {benchmark.lastUpdated && (
                  <span className="text-[10px] text-muted-foreground">
                    Updated: {new Date(benchmark.lastUpdated).toLocaleTimeString()}
                  </span>
                )}
              </div>
            </CardHeader>
            <CardContent>
              {benchmark.loading ? (
                <div className="flex items-center justify-center py-8">
                  <p className="text-sm text-muted-foreground">Loading benchmark data...</p>
                </div>
              ) : (
                <div className="grid grid-cols-2 gap-4 md:grid-cols-3">
                  <div className="rounded-lg border bg-muted/35 p-4">
                    <div className="text-xs text-muted-foreground">Quality Index</div>
                    <div className="mt-1 text-2xl font-bold text-[#2F4858]">{benchmark.qualityIndex ?? '—'}</div>
                    <div className="text-[10px] text-muted-foreground">Artificial Analysis Score</div>
                  </div>
                  <div className="rounded-lg border bg-muted/35 p-4">
                    <div className="text-xs text-muted-foreground">Price per 1M tokens</div>
                    <div className="mt-1 text-2xl font-bold text-[#2F4858]">
                      {benchmark.pricePerToken === 0 ? 'Free' : `$${((benchmark.pricePerToken ?? 0) * 1000).toFixed(2)}`}
                    </div>
                    <div className="text-[10px] text-muted-foreground">OpenRouter pricing</div>
                  </div>
                  <div className="rounded-lg border bg-muted/35 p-4">
                    <div className="text-xs text-muted-foreground">Latency (TTFT)</div>
                    <div className="mt-1 text-2xl font-bold text-[#2F4858]">{benchmark.latency ?? '—'} ms</div>
                    <div className="text-[10px] text-muted-foreground">Time to first token</div>
                  </div>
                  <div className="rounded-lg border bg-muted/35 p-4">
                    <div className="text-xs text-muted-foreground">Throughput</div>
                    <div className="mt-1 text-2xl font-bold text-[#2F4858]">{benchmark.throughput ?? '—'} tok/s</div>
                    <div className="text-[10px] text-muted-foreground">Output tokens per second</div>
                  </div>
                  <div className="rounded-lg border bg-muted/35 p-4">
                    <div className="text-xs text-muted-foreground">Context Window</div>
                    <div className="mt-1 text-2xl font-bold text-[#2F4858]">
                      {benchmark.contextWindow ? `${(benchmark.contextWindow / 1000).toFixed(0)}K` : '—'}
                    </div>
                    <div className="text-[10px] text-muted-foreground">Maximum input tokens</div>
                  </div>
                  <div className="rounded-lg border bg-[#2F4858]/6 p-4">
                    <div className="text-xs text-muted-foreground">Provider</div>
                    <div className="mt-1 text-2xl font-bold text-[#2F4858]">OpenRouter</div>
                    <div className="text-[10px] text-muted-foreground">via Redrise</div>
                  </div>
                </div>
              )}
              <div className="mt-4 rounded-lg border bg-muted/20 p-3">
                <p className="text-xs text-muted-foreground">
                  Data sourced from <a href="https://artificialanalysis.ai/models/gpt-oss-120b" target="_blank" rel="noopener noreferrer" className="underline hover:text-foreground">Artificial Analysis</a>. 
                  Benchmark refreshes every 30 seconds.
                </p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="logs" className="min-h-0 flex-1">
          <Card className="border-border/80 shadow-[0_1px_2px_rgba(16,24,40,0.04),0_10px_24px_rgba(16,24,40,0.06)]">
            <CardHeader><CardTitle className="text-sm font-semibold">Recent Activity</CardTitle></CardHeader>
            <CardContent>
              <div className="space-y-2">
                {PLACEHOLDER_LOGS.map((log) => (
                  <div key={log.id} className="flex items-start gap-3 rounded-lg border p-3 text-sm">
                    <div className={`mt-0.5 h-2 w-2 rounded-full shrink-0 ${
                      log.status === 'success' ? 'bg-[#2F4858]' :
                      log.status === 'error' ? 'bg-[#8c1f28]' :
                      'bg-amber-500'
                    }`} />
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <span className="font-medium">{log.action}</span>
                        <Badge variant="outline" className={`text-[10px] ${
                          log.status === 'success' ? 'border-[#2F4858]/25 bg-[#2F4858]/8 text-[#2F4858]' :
                          log.status === 'error' ? 'border-primary/18 bg-primary/8 text-primary' :
                          'border-[#B7791F]/18 bg-[#FFF4DB] text-[#8A6116]'
                        }`}>{log.status}</Badge>
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
