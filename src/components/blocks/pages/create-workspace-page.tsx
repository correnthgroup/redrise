import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Progress } from '@/components/ui/progress'
import { Textarea } from '@/components/ui/textarea'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'

const STEPS = ['Basic Info', 'Health & Team', 'Review'] as const

const PLACEHOLDER_MEMBERS = ['Alice Silva', 'Bob Santos', 'Carol Oliveira', 'David Costa', 'Eva Lima']

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
  const [healthCheck, setHealthCheck] = useState('daily')
  const [teamSize, setTeamSize] = useState('5')
  const [initialMembers, setInitialMembers] = useState<string[]>([])

  function toggleMember(member: string) {
    setInitialMembers((prev) =>
      prev.includes(member) ? prev.filter((m) => m !== member) : [...prev, member]
    )
  }

  return (
    <div className="mx-auto flex h-full max-w-3xl flex-col gap-4 p-6 animate-app-rise">
      <header>
        <h1 className="text-lg font-semibold">New Workspace</h1>
        <p className="text-sm text-muted-foreground">Step {step + 1} of {STEPS.length} · {STEPS[step]}</p>
      </header>
      <Progress value={((step + 1) / STEPS.length) * 100} />

      <Card className="flex-1 border-border/80 shadow-[0_1px_2px_rgba(16,24,40,0.04),0_10px_24px_rgba(16,24,40,0.06)]">
        <CardHeader><CardTitle className="text-sm font-semibold">{STEPS[step]}</CardTitle></CardHeader>
        <CardContent className="space-y-4">
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
          {step === 1 && (
            <>
              <div className="space-y-1">
                <Label>Health Check Frequency</Label>
                <Select value={healthCheck} onValueChange={setHealthCheck}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="realtime">Realtime</SelectItem>
                    <SelectItem value="hourly">Hourly</SelectItem>
                    <SelectItem value="daily">Daily</SelectItem>
                    <SelectItem value="weekly">Weekly</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-1">
                <Label htmlFor="w-team-size">Max Team Size</Label>
                <Input id="w-team-size" type="number" min="1" max="100" value={teamSize} onChange={(e) => setTeamSize(e.target.value)} />
              </div>
              <div className="space-y-1">
                <Label>Initial Team Members</Label>
                <div className="flex flex-wrap gap-2">
                  {PLACEHOLDER_MEMBERS.map((member) => (
                    <button
                      key={member}
                      type="button"
                      onClick={() => toggleMember(member)}
                      className={`rounded-md border px-3 py-1.5 text-xs transition-colors ${
                        initialMembers.includes(member)
                          ? 'border-primary bg-primary/10 text-primary'
                          : 'border-border bg-card text-muted-foreground hover:bg-accent/60'
                      }`}
                    >
                      {member}
                    </button>
                  ))}
                </div>
                {initialMembers.length > 0 && (
                  <p className="text-xs text-muted-foreground">{initialMembers.length} member(s) selected</p>
                )}
              </div>
            </>
          )}
          {step === 2 && (
            <div className="space-y-3 rounded-lg border bg-muted/35 p-4 text-sm">
              <div><strong>Name:</strong> {name || 'empty'}</div>
              <div><strong>Mission:</strong> {mission || 'empty'}</div>
              <div><strong>Health Check:</strong> {healthCheck}</div>
              <div><strong>Max Team Size:</strong> {teamSize}</div>
              <div><strong>Team Members:</strong> {initialMembers.length > 0 ? initialMembers.join(', ') : 'none'}</div>
            </div>
          )}
        </CardContent>
      </Card>

      <footer className="flex justify-between">
        {onBack && <Button variant="ghost" onClick={onBack}>Cancel</Button>}
        <div className="flex gap-2 ml-auto">
          <Button variant="ghost" disabled={step === 0} onClick={() => setStep((s) => s - 1)}>Back</Button>
          <Button
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
