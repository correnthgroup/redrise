import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { RequiredLabel } from '@/components/ui/required-label'
import { Textarea } from '@/components/ui/textarea'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { useI18n } from '@/hooks/use-i18n'
import { useTeamMemberOptions } from '@/hooks/use-team-member-options'
import { MultiSelectDropdown } from '../shared/multi-select-dropdown'
import { WizardShell } from '../shared/wizard-shell'

const STEP_KEYS = ['workflow.basicInfo', 'workspace.healthTeam', 'workflow.review'] as const

export function CreateWorkspacePage({
  onBack,
  onCreate,
}: {
  onBack?: () => void
  onCreate?: (workspace: { name: string; mission: string }) => Promise<unknown>
}) {
  const [step, setStep] = useState(0)
  const [name, setName] = useState('')
  const [mission, setMission] = useState('')
  const [healthCheck, setHealthCheck] = useState('')
  const [initialMembers, setInitialMembers] = useState<string[]>([])
  const [error, setError] = useState<string | null>(null)
  const [submitting, setSubmitting] = useState(false)
  const { t } = useI18n()
  const { members: teamMembers, loading: loadingMembers } = useTeamMemberOptions()
  const selectedMemberNames = teamMembers
    .filter((member) => initialMembers.includes(member.id))
    .map((member) => member.name)
  const teamMemberOptions = teamMembers.map((member) => ({ value: member.id, label: member.name }))
  const currentStepLabel = t(STEP_KEYS[step])

  return (
    <WizardShell
      testId="create-workspace-page"
      title={t('workspace.new')}
      step={step + 1}
      totalSteps={STEP_KEYS.length}
      stepLabel={currentStepLabel}
      progressLabel={t('workflow.stepOf', { step: step + 1, total: STEP_KEYS.length, label: currentStepLabel })}
      footer={(
        <>
          <Button variant="ghost" onClick={step === 0 ? onBack : () => setStep((s) => s - 1)}>{t('common.back')}</Button>
          <div className="ml-auto flex gap-2">
            {error && <span className="self-center text-xs text-destructive">{error}</span>}
            <Button
              onClick={async () => {
                if (step === STEP_KEYS.length - 1) {
                  setError(null)
                  setSubmitting(true)
                  try {
                    const result = await onCreate?.({ name, mission })
                    if (!result) {
                      setError(t('workspace.createError'))
                    }
                  } catch {
                    setError(t('workspace.createError'))
                  } finally {
                    setSubmitting(false)
                  }
                  return
                }
                setStep((s) => Math.min(STEP_KEYS.length - 1, s + 1))
              }}
              disabled={submitting || (step === 0 && !name.trim())}
            >
              {step === STEP_KEYS.length - 1 ? (submitting ? t('workflow.creating') : t('workflow.done')) : t('workflow.next')}
            </Button>
          </div>
        </>
      )}
    >
          {step === 0 && (
            <>
              <div className="space-y-1">
                <RequiredLabel htmlFor="w-name">{t('workspace.name')}</RequiredLabel>
                <Input id="w-name" value={name} onChange={(e) => setName(e.target.value)} placeholder={t('workspace.namePlaceholder')} />
              </div>
              <div className="space-y-1">
                <Label htmlFor="w-mission">{t('workspace.mission')}</Label>
                <Textarea id="w-mission" value={mission} onChange={(e) => setMission(e.target.value)} placeholder={t('workspace.missionPlaceholder')} rows={4} />
              </div>
            </>
          )}
          {step === 1 && (
            <>
              <div className="space-y-1">
                <Label>{t('workspace.healthCheckFrequency')}</Label>
                <Select value={healthCheck} onValueChange={setHealthCheck}>
                  <SelectTrigger>
                    <SelectValue placeholder={t('workflow.selectFrequency')} />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="realtime">{t('workflow.realtime')}</SelectItem>
                    <SelectItem value="hourly">{t('workflow.hourly')}</SelectItem>
                    <SelectItem value="daily">{t('workflow.daily')}</SelectItem>
                    <SelectItem value="weekly">{t('workflow.weekly')}</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-1">
                <Label>{t('workspace.initialTeamMembers')}</Label>
                <MultiSelectDropdown
                  options={teamMemberOptions}
                  selectedValues={initialMembers}
                  onChange={setInitialMembers}
                  placeholder={t('flow.selectMembers')}
                  selectedLabel={(count) => t('common.selectedCount', { count })}
                  selectAllLabel={t('common.selectAll')}
                  loading={loadingMembers}
                  loadingLabel={t('flow.loadingMembers')}
                  emptyLabel={t('flow.noMembersAvailable')}

                  contentClassName="min-w-[var(--radix-dropdown-menu-trigger-width)]"
                />
                {selectedMemberNames.length > 0 ? <p className="text-xs text-muted-foreground">{t('workspace.memberSelected', { count: selectedMemberNames.length })}</p> : null}
              </div>
            </>
          )}
          {step === 2 && (
            <div className="space-y-3 rounded-lg border bg-muted/35 p-4 text-sm">
              <div><strong>{t('workspace.name')}:</strong> {name || t('workflow.empty')}</div>
              <div><strong>{t('workspace.mission')}:</strong> {mission || t('workflow.empty')}</div>
              <div><strong>{t('workspace.healthCheck')}:</strong> {healthCheck ? t(`workflow.${healthCheck}`) : t('workflow.none')}</div>
              <div><strong>{t('workspace.people')}:</strong> {selectedMemberNames.length > 0 ? selectedMemberNames.join(', ') : t('workflow.none')}</div>
            </div>
          )}
    </WizardShell>
  )
}
