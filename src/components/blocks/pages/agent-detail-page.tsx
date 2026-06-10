import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Badge } from '@/components/ui/badge'
import { SessionsList } from '../shared/sessions-list'
import { ApiKeysManager } from '../shared/api-keys-manager'
import { ChangePassword } from '../shared/change-password'
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

export function AgentDetailPage({
  agentId,
  onBack,
}: {
  agentId: string
  onBack?: () => void
}) {
  const [tab, setTab] = useState('overview')
  const [agent, setAgent] = useState<Agent | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!agentId) return
    setLoading(true)
    loadAgent(agentId).then((data) => {
      setAgent(data)
      setLoading(false)
    })
  }, [agentId])

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
            {onBack && <Button variant="ghost" size="sm" onClick={onBack}>Cancel</Button>}
            <span className={`h-2.5 w-2.5 rounded-full ${STATUS_COLOR[agent.status]}`} aria-hidden />
            <h1 className="text-lg font-semibold">{agent.name}</h1>
            <Badge variant="outline" className={`text-[10px] uppercase ${STATUS_BADGE[agent.status]}`}>{agent.status}</Badge>
          </div>
          <p className="text-sm text-muted-foreground">{agent.brief || 'No description'}</p>
          <p className="text-xs text-muted-foreground mt-1">Model: {agent.model}</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" size="sm">Pause</Button>
          <Button size="sm">Restart</Button>
        </div>
      </header>

      <Tabs value={tab} onValueChange={setTab}>
        <TabsList className="bg-muted/80">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="sessions">Sessions</TabsTrigger>
          <TabsTrigger value="keys">API keys</TabsTrigger>
          <TabsTrigger value="security">Security</TabsTrigger>
        </TabsList>
        <TabsContent value="overview" className="min-h-0 flex-1">
          <Card className="border-border/80 shadow-[0_1px_2px_rgba(16,24,40,0.04),0_10px_24px_rgba(16,24,40,0.06)]">
            <CardHeader><CardTitle className="text-sm font-semibold">Recent activity</CardTitle></CardHeader>
            <CardContent className="space-y-2 text-sm text-muted-foreground">
              <div className="rounded-lg border bg-muted/35 p-3">Run summary generated for workspace handoff.</div>
              <div className="rounded-lg border bg-[#2F4858]/6 p-3">Priority suggestion reviewed by human approver.</div>
              <div className="rounded-lg border bg-muted/35 p-3">Task description refined for operational clarity.</div>
            </CardContent>
          </Card>
        </TabsContent>
        <TabsContent value="sessions"><SessionsList /></TabsContent>
        <TabsContent value="keys"><ApiKeysManager /></TabsContent>
        <TabsContent value="security"><ChangePassword /></TabsContent>
      </Tabs>
    </div>
  )
}
