import { useCallback, useEffect, useMemo, useState } from 'react'
import { Check, Loader2, Plus, Search } from 'lucide-react'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Button } from '@/components/ui/button'
import { BackButton } from '@/components/ui/back-button'
import { Card } from '@/components/ui/card'
import { Checkbox } from '@/components/ui/checkbox'
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { RequiredLabel } from '@/components/ui/required-label'
import { loadTeamMembers, type TeamMember } from '@/lib/team-members'
import { addTeamAssignments, createTeam, loadTeams, TEAM_LIMIT, updateTeamAssignmentFunction, type Team } from '@/lib/teams'
import { useI18n } from '@/hooks/use-i18n'
import { WizardShell } from './wizard-shell'

type CurrentUser = { id: string; name: string; email: string; avatarUrl?: string | null }
type WizardStep = 1 | 2 | 3

function initials(name: string) {
  return name.replace(/[[\]]/g, '').split(/\s+/).map((part) => part[0]).slice(0, 2).join('').toUpperCase()
}

export function TeamListTable({ user, onBack }: { user: CurrentUser; onBack?: () => void }) {
  const { t } = useI18n()
  const [teams, setTeams] = useState<Team[]>([])
  const [members, setMembers] = useState<TeamMember[]>([])
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [wizardOpen, setWizardOpen] = useState(false)
  const [step, setStep] = useState<WizardStep>(1)
  const [teamName, setTeamName] = useState('')
  const [description, setDescription] = useState('')
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set())
  const [selectedFunctions, setSelectedFunctions] = useState<Record<string, string>>({})
  const [selectedTeam, setSelectedTeam] = useState<Team | null>(null)
  const [addOpen, setAddOpen] = useState(false)
  const [addQuery, setAddQuery] = useState('')
  const [addSelectedIds, setAddSelectedIds] = useState<Set<string>>(new Set())
  const [addFunctions, setAddFunctions] = useState<Record<string, string>>({})
  const [createError, setCreateError] = useState<string | null>(null)

  const refresh = useCallback(async () => {
    setLoading(true)
    const [loadedTeams, loadedMembers] = await Promise.all([loadTeams(user.id), loadTeamMembers(user.id)])
    setTeams(loadedTeams)
    setMembers(loadedMembers)
    setSelectedTeam((current) => current ? (loadedTeams.find((team) => team.id === current.id) ?? null) : null)
    setLoading(false)
  }, [user.id])

  useEffect(() => {
    void Promise.resolve().then(refresh)
  }, [refresh])

  const canCreateTeam = teams.length < TEAM_LIMIT
  const selectedMembers = members.filter((member) => selectedIds.has(member.id))
  const selectedFunctionsComplete = selectedMembers.every((member) => selectedFunctions[member.id]?.trim())
  const currentStepLabel = step === 1 ? t('settings.teamStepIdentity') : step === 2 ? t('settings.teamStepMembers') : t('workflow.review')
  const selectedTeamMembers = selectedTeam
    ? selectedTeam.assignments.map((assignment) => ({ assignment, member: members.find((item) => item.id === assignment.teamMemberId) })).filter((row) => row.member)
    : []
  const addCandidates = useMemo(() => {
    const assignedIds = new Set(selectedTeam?.assignments.map((assignment) => assignment.teamMemberId) ?? [])
    const term = addQuery.trim().toLowerCase()
    return members
      .filter((member) => !assignedIds.has(member.id))
      .filter((member) => !term || member.name.toLowerCase().includes(term) || member.email.toLowerCase().includes(term))
  }, [addQuery, members, selectedTeam])

  function toggleSelected(id: string, target: 'create' | 'add') {
    const setter = target === 'create' ? setSelectedIds : setAddSelectedIds
    setter((current) => {
      const next = new Set(current)
      if (next.has(id)) next.delete(id)
      else next.add(id)
      return next
    })
  }

  function updateSelectedFunction(id: string, value: string, target: 'create' | 'add') {
    const setter = target === 'create' ? setSelectedFunctions : setAddFunctions
    setter((current) => ({ ...current, [id]: value }))
  }

  function resetCreateWizard() {
    setStep(1)
    setTeamName('')
    setDescription('')
    setSelectedIds(new Set())
    setSelectedFunctions({})
    setCreateError(null)
    setWizardOpen(false)
  }

  async function saveTeam() {
    if (!teamName.trim() || !canCreateTeam) return
    setCreateError(null)
    setSaving(true)
    try {
      const created = await createTeam({
        ownerUserId: user.id,
        name: teamName,
        description,
        assignments: selectedMembers.map((member) => ({ teamMemberId: member.id, function: selectedFunctions[member.id].trim() })),
      })
      if (!created) {
        setCreateError(t('settings.createTeamError'))
        return
      }
      await refresh()
      resetCreateWizard()
    } finally {
      setSaving(false)
    }
  }

  async function addMembersToTeam() {
    if (!selectedTeam || addSelectedIds.size === 0) return
    setSaving(true)
    await addTeamAssignments(selectedTeam.id, members.filter((member) => addSelectedIds.has(member.id)).map((member) => ({ teamMemberId: member.id, function: addFunctions[member.id].trim() })))
    setAddSelectedIds(new Set())
    setAddFunctions({})
    setAddOpen(false)
    await refresh()
    setSaving(false)
  }

  async function updateAssignment(assignmentId: string, nextFunction: string) {
    await updateTeamAssignmentFunction(assignmentId, nextFunction)
    await refresh()
  }

  const wizardContent = step === 1 ? (
    <div className="grid gap-3">
      <div className="space-y-1.5">
        <RequiredLabel htmlFor="team-name">{t('settings.teamName')}</RequiredLabel>
        <Input id="team-name" value={teamName} onChange={(event) => setTeamName(event.target.value)} placeholder={t('settings.teamPlaceholder')} />
      </div>
      <div className="space-y-1.5">
        <Label htmlFor="team-description">{t('settings.teamDescription')}</Label>
        <Input id="team-description" value={description} onChange={(event) => setDescription(event.target.value)} placeholder={t('settings.teamDescriptionPlaceholder')} />
      </div>
    </div>
  ) : step === 2 ? (
    <div className="space-y-3">
      <div className="max-h-72 overflow-y-auto rounded-lg border bg-background">
        {members.length === 0 ? <p className="p-4 text-sm text-muted-foreground">{t('settings.noMembersFound')}</p> : members.map((member) => (
          <div key={member.id} className="grid grid-cols-[auto_1fr] items-center gap-3 border-b p-3 last:border-b-0 sm:grid-cols-[auto_1fr_minmax(10rem,14rem)]">
            <Checkbox checked={selectedIds.has(member.id)} onCheckedChange={() => toggleSelected(member.id, 'create')} />
            <div>
              <p className="text-sm font-medium">{member.name}</p>
              <p className="text-xs text-muted-foreground">{member.email}</p>
            </div>
            <div className="col-span-2 space-y-1 sm:col-span-1">
              <RequiredLabel className="text-xs">{t('settings.teamFunction')}</RequiredLabel>
              <Input value={selectedFunctions[member.id] ?? ''} onChange={(event) => updateSelectedFunction(member.id, event.target.value, 'create')} disabled={!selectedIds.has(member.id)} placeholder={t('settings.teamFunction')} />
            </div>
          </div>
        ))}
      </div>
    </div>
  ) : (
    <div className="space-y-3 rounded-lg border bg-background p-3 text-sm">
      <p><span className="font-medium">{t('settings.teamName')}:</span> {teamName || '-'}</p>
      <p><span className="font-medium">{t('settings.teamDescription')}:</span> {description || '-'}</p>
      <p><span className="font-medium">{t('settings.selectedMembers')}:</span> {selectedMembers.length > 0 ? selectedMembers.map((member) => `${member.name} (${selectedFunctions[member.id]})`).join(', ') : t('settings.noMembersSelected')}</p>
    </div>
  )

  if (wizardOpen) {
    return (
      <WizardShell
        title={t('settings.newTeamButton')}
        step={step}
        totalSteps={3}
        stepLabel={currentStepLabel}
        progressLabel={t('workflow.stepOf', { step, total: 3, label: currentStepLabel })}
        footer={(
          <>
            <BackButton onClick={() => { if (step === 1) setWizardOpen(false); else setStep((current) => (Math.max(1, current - 1) as WizardStep)) }} label={step === 1 ? t('common.cancel') : undefined} />
            {step < 3 ? (
              <Button type="button" disabled={(step === 1 && !teamName.trim()) || (step === 2 && !selectedFunctionsComplete)} onClick={() => setStep((current) => (Math.min(3, current + 1) as WizardStep))}>{t('workflow.next')}</Button>
            ) : (
              <Button type="button" onClick={saveTeam} disabled={saving || !teamName.trim() || !selectedFunctionsComplete || !canCreateTeam}>
                {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Check className="h-4 w-4" />}
                {t('settings.createTeam')}
              </Button>
            )}
          </>
        )}
      >
        {wizardContent}
        {!canCreateTeam ? <p className="text-xs text-destructive">{t('settings.teamLimitReached')}</p> : null}
        {createError ? <p className="text-xs text-destructive">{createError}</p> : null}
      </WizardShell>
    )
  }

  if (selectedTeam) {
    return (
      <Card className="gap-0 rounded-xl p-6">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
          <div>
            <h2 className="text-xl font-semibold tracking-tight">{selectedTeam.name}</h2>
            <p className="text-sm text-muted-foreground">{selectedTeam.description || t('settings.noTeamDescription')}</p>
          </div>
          <Button type="button" size="sm" onClick={() => setAddOpen(true)}>
            <Plus className="h-4 w-4" />
            {t('settings.addTeamMember')}
          </Button>
        </div>

        <div className="mt-4 overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b text-left text-xs uppercase tracking-wider text-muted-foreground">
                <th className="px-3 py-2 font-medium">{t('settings.name')}</th>
                <th className="px-3 py-2 font-medium">{t('settings.teamFunction')}</th>
              </tr>
            </thead>
            <tbody>
              {selectedTeamMembers.length === 0 ? (
                <tr><td colSpan={2} className="px-3 py-8 text-center text-muted-foreground">{t('settings.noTeamMembers')}</td></tr>
              ) : selectedTeamMembers.map(({ assignment, member }) => member ? (
                <tr key={assignment.id} className="border-b last:border-b-0">
                  <td className="px-3 py-3">
                    <div className="flex items-center gap-3">
                      <Avatar className="h-9 w-9">
                        {member.avatarUrl ? <AvatarImage src={member.avatarUrl} alt={member.name} /> : null}
                        <AvatarFallback>{initials(member.name) || 'U'}</AvatarFallback>
                      </Avatar>
                      <div className="space-y-0.5">
                        <p className="text-sm font-medium">{member.name}</p>
                        <p className="text-xs text-muted-foreground">{member.email}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-3 py-3">
                    <Input value={assignment.function} onChange={(event) => { void updateAssignment(assignment.id, event.target.value) }} />
                  </td>
                </tr>
              ) : null)}
            </tbody>
          </table>
        </div>

        <Dialog open={addOpen} onOpenChange={setAddOpen}>
          <DialogContent>
            <DialogHeader><DialogTitle>{t('settings.addTeamMember')}</DialogTitle></DialogHeader>
            <div className="space-y-4">
              <div className="grid gap-3">
                <div className="relative">
                  <Search className="absolute left-2.5 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                  <Input value={addQuery} onChange={(event) => setAddQuery(event.target.value)} placeholder={t('settings.searchMembers')} className="pl-8" />
                </div>
              </div>
              <div className="max-h-72 overflow-y-auto rounded-lg border">
                {addCandidates.length === 0 ? <p className="p-4 text-sm text-muted-foreground">{t('settings.noMembersFound')}</p> : addCandidates.map((member) => (
                  <div key={member.id} className="grid grid-cols-[auto_1fr_minmax(10rem,14rem)] items-center gap-3 border-b p-3 last:border-b-0">
                    <Checkbox checked={addSelectedIds.has(member.id)} onCheckedChange={() => toggleSelected(member.id, 'add')} />
                    <div>
                      <p className="text-sm font-medium">{member.name}</p>
                      <p className="text-xs text-muted-foreground">{member.email}</p>
                    </div>
                    <Input value={addFunctions[member.id] ?? ''} onChange={(event) => updateSelectedFunction(member.id, event.target.value, 'add')} disabled={!addSelectedIds.has(member.id)} placeholder={t('settings.teamFunction')} />
                  </div>
                ))}
              </div>
            </div>
            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setAddOpen(false)}>{t('common.cancel')}</Button>
              <Button type="button" disabled={saving || addSelectedIds.size === 0 || members.filter((member) => addSelectedIds.has(member.id)).some((member) => !addFunctions[member.id]?.trim())} onClick={addMembersToTeam}>{t('settings.addTeamMember')}</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        <div className="mt-4 flex justify-between border-t pt-4">
          <BackButton onClick={() => setSelectedTeam(null)} />
        </div>
      </Card>
    )
  }

  return (
    <Card className="gap-0 rounded-xl p-6">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <h2 className="text-xl font-semibold tracking-tight">{t('settings.teamList')}</h2>
          <p className="text-sm text-muted-foreground">{t('settings.teamListDesc')}</p>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <div className="rounded-full border px-3 py-1 text-xs text-muted-foreground">{t('settings.teamLimit', { count: teams.length, limit: TEAM_LIMIT })}</div>
          <Button type="button" size="sm" disabled={!canCreateTeam} onClick={() => { resetCreateWizard(); setWizardOpen(true) }}>
            <Plus className="h-4 w-4" />
            {t('settings.newTeamButton')}
          </Button>
        </div>
      </div>

      <div className="mt-4 overflow-x-auto border-t pt-4">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b text-left text-xs uppercase tracking-wider text-muted-foreground">
              <th className="px-3 py-2 font-medium">{t('settings.teamName')}</th>
              <th className="px-3 py-2 font-medium">{t('settings.teamDescription')}</th>
              <th className="px-3 py-2 font-medium">{t('settings.members')}</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr><td colSpan={3} className="px-3 py-8 text-center text-muted-foreground"><Loader2 className="mx-auto mb-2 h-4 w-4 animate-spin" />{t('settings.loadingTeams')}</td></tr>
            ) : teams.length === 0 ? (
              <tr><td colSpan={3} className="px-3 py-8 text-center text-muted-foreground">{t('settings.noTeams')}</td></tr>
            ) : teams.map((team) => (
              <tr key={team.id} className="border-b last:border-b-0">
                <td className="px-3 py-3">
                  <button type="button" onClick={() => setSelectedTeam(team)} className="font-medium text-primary underline-offset-4 hover:underline">
                    {team.name}
                  </button>
                </td>
                <td className="px-3 py-3 text-muted-foreground">{team.description || t('settings.noTeamDescription')}</td>
                <td className="px-3 py-3 text-muted-foreground">{t('settings.teamMemberCount', { count: team.assignments.length })}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="mt-4 flex justify-between border-t pt-4">
        <BackButton onClick={onBack} />
      </div>
    </Card>
  )
}
