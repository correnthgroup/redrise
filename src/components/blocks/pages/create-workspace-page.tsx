import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Progress } from '@/components/ui/progress'
import { Textarea } from '@/components/ui/textarea'

const STEPS = ['Basic Info', 'Health & Team', 'Flows', 'Review'] as const

export function CreateWorkspacePage({
  onBack,
  onCreate,
}: {
  onBack?: () => void
  onCreate?: (workspace: { name: string; mission: string }) => void
}) {
  const [step, setStep] = useState(0)
  const [name, setName] = useState('')
  const [mission, setMission] = useState('')

  return (
    <div className="mx-auto flex h-full max-w-3xl flex-col gap-4 p-6 animate-app-rise">
      <header>
        <h1 className="text-lg font-semibold">New Workspace</h1>
        <p className="text-sm text-muted-foreground">Step {step + 1} of {STEPS.length} · {STEPS[step]}</p>
      </header>
      <Progress value={((step + 1) / STEPS.length) * 100} />

      <Card className="flex-1 border-border/80 shadow-[0_1px_2px_rgba(16,24,40,0.04),0_10px_24px_rgba(16,24,40,0.06)]">
        <CardHeader><CardTitle className="text-sm font-semibold">{STEPS[step]}</CardTitle></CardHeader>
        <CardContent className="space-y-3">
          {step === 0 && (
            <>
              <div className="space-y-1">
                <Label htmlFor="w-name">Name</Label>
                <Input id="w-name" value={name} onChange={(e) => setName(e.target.value)} placeholder="Workspace name" />
              </div>
              <div className="space-y-1">
                <Label htmlFor="w-mission">Mission</Label>
                <Textarea id="w-mission" value={mission} onChange={(e) => setMission(e.target.value)} placeholder="Mission statement" rows={4} />
              </div>
            </>
          )}
          {step === 1 && <div className="rounded-lg border bg-[#2F4858]/6 p-4 text-sm text-muted-foreground">Pick health metrics and the initial team with a compact operational setup.</div>}
          {step === 2 && <div className="rounded-lg border bg-muted/35 p-4 text-sm text-muted-foreground">Choose the flows that will power this workspace before the review step.</div>}
          {step === 3 && (
            <div className="space-y-2 rounded-lg border bg-muted/35 p-4 text-sm">
              <div><strong>Name:</strong> {name || 'empty'}</div>
              <div><strong>Mission:</strong> {mission || 'empty'}</div>
            </div>
          )}
        </CardContent>
      </Card>

      <footer className="flex justify-between">
        {onBack && <Button variant="ghost" onClick={onBack}>Cancel</Button>}
        <div className="flex gap-2 ml-auto">
          <Button variant="ghost" disabled={step === 0} onClick={() => setStep((s) => s - 1)}>Back</Button>
          <Button
            className="min-w-[120px]"
            onClick={() => {
              if (step === STEPS.length - 1) {
                onCreate?.({ name, mission })
                return
              }

              setStep((s) => Math.min(STEPS.length - 1, s + 1))
            }}
          >
            {step === STEPS.length - 1 ? 'Done' : 'Next'}
          </Button>
        </div>
      </footer>
    </div>
  )
}
