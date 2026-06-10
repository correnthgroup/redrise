import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Progress } from '@/components/ui/progress'
import { Textarea } from '@/components/ui/textarea'
import type { CreateAgentInput } from '@/types/agent'

const STEPS = ['Basic Info', 'Capabilities', 'Limits', 'Review'] as const

export function AgentCreatePage({
  onBack,
  onCreate,
}: {
  onBack?: () => void
  onCreate?: (input: CreateAgentInput) => Promise<{ id: string } | null>
}) {
  const [step, setStep] = useState(0)
  const [name, setName] = useState('')
  const [brief, setBrief] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  async function handleFinish() {
    if (!onCreate) return
    setLoading(true)
    setError(null)
    try {
      const result = await onCreate({ name, brief })
      if (result) {
        onBack?.()
      } else {
        setError('Failed to create agent. Please try again.')
      }
    } catch {
      setError('An unexpected error occurred.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="mx-auto flex h-full max-w-3xl flex-col gap-4 p-6 animate-app-rise">
      <header>
        <h1 className="text-lg font-semibold">New Agent</h1>
        <p className="text-sm text-muted-foreground">Step {step + 1} of {STEPS.length} · {STEPS[step]}</p>
      </header>
      <Progress value={((step + 1) / STEPS.length) * 100} />

      <Card className="flex-1 border-border/80 shadow-[0_1px_2px_rgba(16,24,40,0.04),0_10px_24px_rgba(16,24,40,0.06)]">
        <CardHeader><CardTitle className="text-sm font-semibold">{STEPS[step]}</CardTitle></CardHeader>
        <CardContent className="space-y-3">
          {error && (
            <div className="rounded-md bg-destructive/10 p-3 text-sm text-destructive">{error}</div>
          )}
          {step === 0 && (
            <>
              <div className="space-y-1">
                <Label htmlFor="agent-name">Name</Label>
                <Input id="agent-name" value={name} onChange={(e) => setName(e.target.value)} placeholder="Agent name" />
              </div>
              <div className="space-y-1">
                <Label htmlFor="agent-brief">Brief</Label>
                <Textarea id="agent-brief" value={brief} onChange={(e) => setBrief(e.target.value)} placeholder="What does this agent do?" />
              </div>
            </>
          )}
          {step === 1 && <div className="rounded-lg border bg-[#2F4858]/6 p-4 text-sm text-muted-foreground">Pick capabilities, tools and allowed actions with a conservative scope first.</div>}
          {step === 2 && <div className="rounded-lg border bg-muted/40 p-4 text-sm text-muted-foreground">Define rate limits, token budgets and timeout rules before enabling repeated usage.</div>}
          {step === 3 && (
            <div className="space-y-2 rounded-lg border bg-muted/35 p-4 text-sm">
              <div><strong>Name:</strong> {name || 'empty'}</div>
              <div><strong>Brief:</strong> {brief || 'empty'}</div>
              <div><strong>Model:</strong> openai/gpt-oss-120b:free</div>
              <div><strong>Provider:</strong> openrouter</div>
            </div>
          )}
        </CardContent>
      </Card>

      <footer className="flex justify-between">
        {onBack && <Button variant="ghost" onClick={onBack}>Cancel</Button>}
        <div className="flex gap-2 ml-auto">
          <Button variant="ghost" disabled={step === 0 || loading} onClick={() => setStep((s) => s - 1)}>Back</Button>
          <Button
            disabled={loading}
            onClick={() => {
              if (step === STEPS.length - 1) {
                handleFinish()
              } else {
                setStep((s) => Math.min(STEPS.length - 1, s + 1))
              }
            }}
          >
            {loading ? 'Creating...' : step === STEPS.length - 1 ? 'Finish' : 'Next'}
          </Button>
        </div>
      </footer>
    </div>
  )
}
