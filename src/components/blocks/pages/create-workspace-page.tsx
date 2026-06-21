import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Progress } from '@/components/ui/progress'
import { Textarea } from '@/components/ui/textarea'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { useI18n } from '@/hooks/use-i18n'
import { useTeamMemberOptions } from '@/hooks/use-team-member-options'
import { MultiSelectDropdown } from '../shared/multi-select-dropdown'

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

  return (
    <div data-testid="create-workspace-page" className="mx-auto flex h-full max-w-3xl flex-col gap-4 p-6 animate-app-rise">
      <header>
        <h1 className="text-lg font-semibold">{t('workspace.new')}</h1>
        <p className="text-sm text-muted-foreground">{t('workflow.stepOf', { step: step + 1, total: STEP_KEYS.length, label: t(STEP_KEYS[step]) })}</p>
      </header>
      <Progress value={((step + 1) / STEP_KEYS.length) * 100} />

      <Card className="flex-1 border-border/80 shadow-[0_1px_2px_rgba(16,24,40,0.04),0_10px_24px_rgba(16,24,40,0.06)]">
        <CardHeader><CardTitle className="text-sm font-semibold">{t(STEP_KEYS[step])}</CardTitle></CardHeader>
        <CardContent className="space-y-4">
          {step === 0 && (
            <>
              <div className="space-y-1">
                <Label htmlFor="w-name" className="text-[#A04D1F]">{t('workspace.name')}<span className="text-[#A04D1F]">*</span></Label>
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
      </footer>
    </div>
  )
}
