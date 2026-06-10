import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Progress } from '@/components/ui/progress'
import { Textarea } from '@/components/ui/textarea'

const STEPS = ['Basic Info', 'Briefing', 'Review'] as const

export function CreateTaskPage({
  onBack,
  onCreate,
}: {
  onBack?: () => void
  onCreate?: (task: { title: string; brief: string }) => Promise<unknown>
}) {
  const [step, setStep] = useState(0)
  const [title, setTitle] = useState('')
  const [brief, setBrief] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [submitting, setSubmitting] = useState(false)

  return (
    <div className="mx-auto flex h-full max-w-3xl flex-col gap-4 p-6 animate-app-rise">
      <header>
        <h1 className="text-lg font-semibold">New Task</h1>
        <p className="text-sm text-muted-foreground">Step {step + 1} of {STEPS.length} · {STEPS[step]}</p>
      </header>
      <Progress value={((step + 1) / STEPS.length) * 100} />

      <Card className="flex-1 border-border/80 shadow-[0_1px_2px_rgba(16,24,40,0.04),0_10px_24px_rgba(16,24,40,0.06)]">
        <CardHeader><CardTitle className="text-sm font-semibold">{STEPS[step]}</CardTitle></CardHeader>
        <CardContent className="space-y-3">
          {step === 0 && (
            <div className="space-y-1">
              <Label htmlFor="t-title">Title</Label>
              <Input id="t-title" value={title} onChange={(e) => setTitle(e.target.value)} placeholder="Task title" />
            </div>
          )}
          {step === 1 && (
            <div className="space-y-1">
              <Label htmlFor="t-brief">Briefing</Label>
              <Textarea id="t-brief" value={brief} onChange={(e) => setBrief(e.target.value)} placeholder="What needs to happen?" rows={6} />
            </div>
          )}
          {step === 2 && (
            <div className="space-y-2 rounded-lg border bg-muted/35 p-4 text-sm">
              <div><strong>Title:</strong> {title || 'empty'}</div>
              <div><strong>Briefing:</strong> {brief || 'empty'}</div>
            </div>
          )}
        </CardContent>
      </Card>

      <footer className="flex justify-between">
        {onBack && <Button variant="ghost" onClick={onBack} disabled={submitting}>Cancel</Button>}
        <div className="flex gap-2 ml-auto">
          <Button variant="ghost" disabled={step === 0 || submitting} onClick={() => setStep((s) => s - 1)}>Back</Button>
          {error && <span className="self-center text-xs text-destructive">{error}</span>}
          <Button
            disabled={submitting}
            onClick={async () => {
              if (step === STEPS.length - 1) {
                setError(null)
                setSubmitting(true)
                try {
                  const result = await onCreate?.({ title, brief })
                  if (!result) {
                    setError('Failed to create task. Please try again.')
                  }
                } catch {
                  setError('Failed to create task. Please try again.')
                } finally {
                  setSubmitting(false)
                }
                return
              }
              setStep((s) => Math.min(STEPS.length - 1, s + 1))
            }}
          >
            {step === STEPS.length - 1 ? (submitting ? 'Creating...' : 'Done') : 'Next'}
          </Button>
        </div>
      </footer>
    </div>
  )
}
