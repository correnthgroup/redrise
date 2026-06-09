import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Progress } from '@/components/ui/progress'
import { Textarea } from '@/components/ui/textarea'

const STEPS = ['Basic Info', 'Capabilities', 'Limits', 'Review'] as const

export function AgentCreatePage({ onBack }: { onBack?: () => void }) {
  const [step, setStep] = useState(0)
  const [name, setName] = useState('')
  const [brief, setBrief] = useState('')

  return (
    <div className="mx-auto flex h-full max-w-3xl flex-col gap-4 p-6 animate-app-rise">
      <header className="flex items-center justify-between">
        <div>
          <h1 className="text-lg font-semibold">New Agent</h1>
          <p className="text-sm text-muted-foreground">Step {step + 1} of {STEPS.length} · {STEPS[step]}</p>
        </div>
        {onBack && <Button variant="ghost" size="sm" onClick={onBack}>Cancel</Button>}
      </header>
      <Progress value={((step + 1) / STEPS.length) * 100} />

      <Card className="flex-1 border-border/80 shadow-[0_1px_2px_rgba(16,24,40,0.04),0_10px_24px_rgba(16,24,40,0.06)]">
        <CardHeader><CardTitle className="text-sm font-semibold">{STEPS[step]}</CardTitle></CardHeader>
        <CardContent className="space-y-3">
          {step === 0 && (
            <>
              <div className="space-y-1">
                <Label htmlFor="agent-name">Name</Label>
                <Input id="agent-name" value={name} onChange={(e) => setName(e.target.value)} placeholder="agent name" />
              </div>
              <div className="space-y-1">
                <Label htmlFor="agent-brief">Brief</Label>
                <Textarea id="agent-brief" value={brief} onChange={(e) => setBrief(e.target.value)} placeholder="what does this agent do?" />
              </div>
            </>
          )}
          {step === 1 && <div className="rounded-lg border bg-[#2F4858]/6 p-4 text-sm text-muted-foreground">Pick capabilities, tools and allowed actions with a conservative scope first.</div>}
          {step === 2 && <div className="rounded-lg border bg-muted/40 p-4 text-sm text-muted-foreground">Define rate limits, token budgets and timeout rules before enabling repeated usage.</div>}
          {step === 3 && (
            <div className="space-y-2 rounded-lg border bg-muted/35 p-4 text-sm">
              <div><strong>Name:</strong> {name || 'empty'}</div>
              <div><strong>Brief:</strong> {brief || 'empty'}</div>
            </div>
          )}
        </CardContent>
      </Card>

      <footer className="flex justify-between">
        <Button variant="ghost" disabled={step === 0} onClick={() => setStep((s) => s - 1)}>Back</Button>
        <Button onClick={() => setStep((s) => Math.min(STEPS.length - 1, s + 1))}>
          {step === STEPS.length - 1 ? 'Finish' : 'Next'}
        </Button>
      </footer>
    </div>
  )
}
