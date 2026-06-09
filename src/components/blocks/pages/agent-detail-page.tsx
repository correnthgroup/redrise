import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Badge } from '@/components/ui/badge'
import { SessionsList } from '../shared/sessions-list'
import { ApiKeysManager } from '../shared/api-keys-manager'
import { ChangePassword } from '../shared/change-password'

export function AgentDetailPage({ onBack }: { onBack?: () => void }) {
  const [tab, setTab] = useState('overview')

  return (
    <div className="flex h-full min-h-0 flex-col gap-4 p-6 animate-app-rise">
      <header className="flex items-center justify-between">
        <div>
          <div className="flex items-center gap-2">
            {onBack && <Button variant="ghost" size="sm" onClick={onBack}>Back</Button>}
            <h1 className="text-lg font-semibold">Agent name</h1>
            <Badge variant="outline" className="border-[#2F4858]/25 bg-[#2F4858]/8 text-[#2F4858]">active</Badge>
          </div>
          <p className="text-sm text-muted-foreground">agent description placeholder</p>
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
