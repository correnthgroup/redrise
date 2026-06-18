import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Progress } from '@/components/ui/progress'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import type { Workspace } from '@/types/workspace'
import { useTeamMemberOptions } from '@/hooks/use-team-member-options'
import { useI18n } from '@/hooks/use-i18n'
import { MultiSelectDropdown } from '../shared/multi-select-dropdown'

const STEP_KEYS = ['workflow.basicInfo', 'workflow.review'] as const

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
  const { t } = useI18n()
  const { members: teamMembers, loading: loadingMembers } = useTeamMemberOptions()

  const selectedWorkspace = workspaces.find((w) => w.id === workspaceId)
  const selectedMemberNames = teamMembers
    .filter((member) => members.includes(member.id))
    .map((member) => member.name)

  const teamMemberOptions = teamMembers.map((member) => ({ value: member.id, label: member.name }))

  return (
    <div className="mx-auto flex h-full max-w-3xl flex-col gap-4 p-6 animate-app-rise">
      <header>
        <h1 className="text-lg font-semibold">{t('flow.newFlow')}</h1>
        <p className="text-sm text-muted-foreground">{t('workflow.stepOf', { step: step + 1, total: STEP_KEYS.length, label: t(STEP_KEYS[step]) })}</p>
      </header>
      <Progress value={((step + 1) / STEP_KEYS.length) * 100} />

      <Card className="flex-1 border-border/80 shadow-[0_1px_2px_rgba(16,24,40,0.04),0_10px_24px_rgba(16,24,40,0.06)]">
        <CardHeader><CardTitle className="text-sm font-semibold">{t(STEP_KEYS[step])}</CardTitle></CardHeader>
        <CardContent className="space-y-4">
          {step === 0 && (
            <>
              <div className="space-y-1">
                <Label htmlFor="f-name" className="text-[#A04D1F]">{t('flow.name')}<span className="text-[#A04D1F]">*</span></Label>
                <Input id="f-name" value={name} onChange={(e) => setName(e.target.value)} placeholder={t('flow.namePlaceholder')} />
              </div>
              <div className="space-y-1">
                <Label>{t('flow.workspace')}</Label>
                <Select value={workspaceId} onValueChange={setWorkspaceId}>
                  <SelectTrigger>
                    <SelectValue placeholder={t('flow.selectWorkspace')} />
                  </SelectTrigger>
                  <SelectContent>
                    {workspaces.map((w) => (
                      <SelectItem key={w.id} value={w.id}>{w.name}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-1">
                <Label>{t('settings.teamMembers')}</Label>
                <MultiSelectDropdown
                  options={teamMemberOptions}
                  selectedValues={members}
                  onChange={setMembers}
                  placeholder={t('flow.selectMembers')}
                  selectedLabel={(count) => t('common.selectedCount', { count })}
                  selectAllLabel={t('common.selectAll')}
                  loading={loadingMembers}
                  loadingLabel={t('flow.loadingMembers')}
                  emptyLabel={t('flow.noMembersAvailable')}

                  contentClassName="min-w-[var(--radix-dropdown-menu-trigger-width)]"
                />
                {selectedMemberNames.length > 0 ? <p className="text-xs text-muted-foreground">{t('flow.memberSelected', { count: selectedMemberNames.length })}</p> : null}
              </div>
            </>
          )}
          {step === 1 && (
            <div className="space-y-3 rounded-lg border bg-muted/35 p-4 text-sm">
              <div><strong>{t('flow.name')}:</strong> {name || t('workflow.empty')}</div>
              <div><strong>{t('flow.workspace')}:</strong> {selectedWorkspace?.name || t('workflow.none')}</div>
              <div><strong>{t('settings.teamMembers')}:</strong> {selectedMemberNames.length > 0 ? selectedMemberNames.join(', ') : t('workflow.none')}</div>
            </div>
          )}
        </CardContent>
      </Card>

      <footer className="flex justify-between">
        <Button variant="ghost" onClick={step === 0 ? onBack : () => setStep((s) => s - 1)}>{t('common.back')}</Button>
        <div className="flex gap-2 ml-auto">
          {error && <span className="self-center text-xs text-destructive">{error}</span>}
          <Button
            onClick={async () => {
              if (step === STEP_KEYS.length - 1) {
                setError(null)
                setSubmitting(true)
                try {
                  const result = await onCreate?.({ name: name.trim(), workspaceId, members: selectedMemberNames })
                  if (!result) {
                    setError(t('flow.createError'))
                  }
                } catch {
                  setError(t('flow.createError'))
                } finally {
                  setSubmitting(false)
                }
                return
              }
              setStep((s) => Math.min(STEP_KEYS.length - 1, s + 1))
            }}
            disabled={submitting || (step === 0 && (!name.trim() || !workspaceId))}
          >
            {step === STEP_KEYS.length - 1 ? (submitting ? t('workflow.creating') : t('workflow.done')) : t('workflow.next')}
          </Button>
        </div>
      </footer>
    </div>
  )
}
