import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Progress } from '@/components/ui/progress'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import type { Workspace } from '@/types/workspace'
import { useTeamMemberOptions } from '@/hooks/use-team-member-options'

const STEPS = ['Basic Info', 'Review'] as const

export function CreateFlowPage({
  onBack,
  onCreate,
  workspaces,
}: {
  onBack?: () => void
  onCreate?: (flow: { name: string; workspaceId: string; members: string[] }) => Promise<unknown>
  workspaces: Workspace[]
}) {
  const [step, setStep] = useState(0)
  const [name, setName] = useState('')
  const [workspaceId, setWorkspaceId] = useState('')
  const [members, setMembers] = useState<string[]>([])
  const [error, setError] = useState<string | null>(null)
  const [submitting, setSubmitting] = useState(false)
  const { members: teamMembers, loading: loadingMembers } = useTeamMemberOptions()

  const selectedWorkspace = workspaces.find((w) => w.id === workspaceId)

  function toggleMember(member: string) {
    setMembers((prev) =>
      prev.includes(member) ? prev.filter((m) => m !== member) : [...prev, member]
    )
  }

  return (
    <div className="mx-auto flex h-full max-w-3xl flex-col gap-4 p-6 animate-app-rise">
      <header>
        <h1 className="text-lg font-semibold">New Flow</h1>
        <p className="text-sm text-muted-foreground">Step {step + 1} of {STEPS.length} · {STEPS[step]}</p>
      </header>
      <Progress value={((step + 1) / STEPS.length) * 100} />

      <Card className="flex-1 border-border/80 shadow-[0_1px_2px_rgba(16,24,40,0.04),0_10px_24px_rgba(16,24,40,0.06)]">
        <CardHeader><CardTitle className="text-sm font-semibold">{STEPS[step]}</CardTitle></CardHeader>
        <CardContent className="space-y-4">
          {step === 0 && (
            <>
              <div className="space-y-1">
                <Label htmlFor="f-name">Name</Label>
                <Input id="f-name" value={name} onChange={(e) => setName(e.target.value)} placeholder="Flow name" />
              </div>
              <div className="space-y-1">
                <Label>Workspace</Label>
                <Select value={workspaceId} onValueChange={setWorkspaceId}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select workspace" />
                  </SelectTrigger>
                  <SelectContent>
                    {workspaces.map((w) => (
                      <SelectItem key={w.id} value={w.id}>{w.name}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-1">
                <Label>Team Members</Label>
                <div className="flex flex-wrap gap-2">
                  {loadingMembers ? <p className="text-xs text-muted-foreground">Loading members...</p> : null}
                  {!loadingMembers && teamMembers.length === 0 ? <p className="text-xs text-muted-foreground">No members available.</p> : null}
                  {teamMembers.map((member) => (
                    <button
                      key={member.id}
                      type="button"
                      onClick={() => toggleMember(member.name)}
                      className={`rounded-md border px-3 py-1.5 text-xs transition-colors ${
                        members.includes(member.name)
                          ? 'border-primary bg-primary/10 text-primary'
                          : 'border-border bg-card text-muted-foreground hover:bg-accent/60'
                      }`}
                    >
                      {member.name}
                    </button>
                  ))}
                </div>
                {members.length > 0 && (
                  <p className="text-xs text-muted-foreground">{members.length} member(s) selected</p>
                )}
              </div>
            </>
          )}
          {step === 1 && (
            <div className="space-y-3 rounded-lg border bg-muted/35 p-4 text-sm">
              <div><strong>Name:</strong> {name || 'empty'}</div>
              <div><strong>Workspace:</strong> {selectedWorkspace?.name || 'none'}</div>
              <div><strong>Team Members:</strong> {members.length > 0 ? members.join(', ') : 'none'}</div>
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
                  const result = await onCreate?.({ name, workspaceId, members })
                  if (!result) {
                    setError('Failed to create flow. Please try again.')
                  }
                } catch {
                  setError('Failed to create flow. Please try again.')
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
