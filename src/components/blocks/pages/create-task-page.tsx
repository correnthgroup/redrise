import { useState, useEffect, useCallback } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { RequiredLabel } from '@/components/ui/required-label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Textarea } from '@/components/ui/textarea'
import { Badge } from '@/components/ui/badge'
import { Checkbox } from '@/components/ui/checkbox'
import { Upload, X, FileText, ChevronDown, Check, ArrowDown, ArrowUp, Minus, LayoutGrid, Calendar, Clock, AlertTriangle } from 'lucide-react'
import { loadAgents } from '@/lib/agents'
import type { Agent } from '@/types/agent'
import type { TaskPriority, TaskStatus, RecurrenceType } from '@/types/task'
import { useWorkspaces } from '@/hooks/use-workspaces'
import { useFlows } from '@/hooks/use-flows'
import { useTeamMemberOptions } from '@/hooks/use-team-member-options'
import { useI18n } from '@/hooks/use-i18n'
import { useDropdownClose } from '@/hooks/use-dropdown-close'
import { DROPDOWN_TRIGGER_CLASSES } from '@/lib/styles'
import { MultiSelectDropdown } from '../shared/multi-select-dropdown'
import { WizardShell } from '../shared/wizard-shell'

const STEP_KEYS = ['tasks.briefing', 'tasks.teamAgent', 'workflow.review'] as const

const PRIORITIES: { value: TaskPriority; labelKey: string; color: string; icon: typeof ArrowDown }[] = [
  { value: 'low', labelKey: 'tasks.priorityLow', color: 'text-[#2F5D5A] bg-[#2F5D5A]/10', icon: ArrowDown },
  { value: 'medium', labelKey: 'tasks.priorityMedium', color: 'text-[#B7791F] bg-[#B7791F]/10', icon: Minus },
  { value: 'high', labelKey: 'tasks.priorityHigh', color: 'text-[#A04D1F] bg-[#A04D1F]/10', icon: ArrowUp },
]

const COLUMNS: { id: TaskStatus; labelKey: string }[] = [
  { id: 'backlog', labelKey: 'tasks.backlog' },
  { id: 'in-progress', labelKey: 'tasks.inProgress' },
  { id: 'in-review', labelKey: 'tasks.inReview' },
  { id: 'done', labelKey: 'tasks.done' },
]

const RECURRENCES: { value: RecurrenceType; labelKey: string }[] = [
  { value: 'occasionally', labelKey: 'tasks.recurrenceOccasionally' },
  { value: 'daily', labelKey: 'tasks.recurrenceDaily' },
  { value: 'weekly', labelKey: 'tasks.recurrenceWeekly' },
  { value: 'monthly', labelKey: 'tasks.recurrenceMonthly' },
]

const WEEK_DAYS = [
  { id: 0, labelKey: 'common.weekday.sun' },
  { id: 1, labelKey: 'common.weekday.mon' },
  { id: 2, labelKey: 'common.weekday.tue' },
  { id: 3, labelKey: 'common.weekday.wed' },
  { id: 4, labelKey: 'common.weekday.thu' },
  { id: 5, labelKey: 'common.weekday.fri' },
  { id: 6, labelKey: 'common.weekday.sat' },
]

const MONTH_DAYS = Array.from({ length: 31 }, (_, i) => i + 1)

export function CreateTaskPage({
  onBack,
  onCreate,
}: {
  onBack?: () => void
  onCreate?: (task: {
    title: string
    brief: string
    objective: string
    prompt: string
    documents: string[]
    team_members: string[]
    agent_id: string | null
    priority: TaskPriority
    status: TaskStatus
    schedule_start: string | null
    schedule_end: string | null
    schedule_time: string | null
    recurrence: RecurrenceType
    recurrence_days: number[]
    recurrence_monthly_days: number[]
    workspace_id: string
    flow_id: string | null
  }) => Promise<unknown>
}) {
  const { t } = useI18n()
  const { workspaces, loading: loadingWorkspaces } = useWorkspaces()
  const { flows, loading: loadingFlows } = useFlows()
  const [step, setStep] = useState(0)
  const [objective, setObjective] = useState('')
  const [prompt, setPrompt] = useState('')
  const [documents, setDocuments] = useState<string[]>([])
  const [selectedMembers, setSelectedMembers] = useState<string[]>([])
  const [selectedAgentId, setSelectedAgentId] = useState<string | null>(null)
  const [selectedWorkspaceId, setSelectedWorkspaceId] = useState('')
  const [selectedFlowId, setSelectedFlowId] = useState('')
  const [priority, setPriority] = useState<TaskPriority>('medium')
  const [kanbanColumn, setKanbanColumn] = useState<TaskStatus>('backlog')
  const [scheduleStart, setScheduleStart] = useState('')
  const [scheduleEnd, setScheduleEnd] = useState('')
  const [scheduleTime, setScheduleTime] = useState('09:00')
  const [recurrence, setRecurrence] = useState<RecurrenceType>('occasionally')
  const [recurrenceDays, setRecurrenceDays] = useState<number[]>([])
  const [recurrenceMonthlyDays, setRecurrenceMonthlyDays] = useState<number[]>([])
  const [agents, setAgents] = useState<Agent[]>([])
  const { members: teamMembers, loading: loadingMembers } = useTeamMemberOptions()
  const [loadingAgents, setLoadingAgents] = useState(true)
  const [showAgentDropdown, setShowAgentDropdown] = useState(false)
  const [showColumnDropdown, setShowColumnDropdown] = useState(false)
  const [showPriorityDropdown, setShowPriorityDropdown] = useState(false)
  const [showRecurrenceDropdown, setShowRecurrenceDropdown] = useState(false)
  const [showWeekDayDropdown, setShowWeekDayDropdown] = useState(false)
  const [showMonthDayDropdown, setShowMonthDayDropdown] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [submitting, setSubmitting] = useState(false)

  const closePriority = useCallback(() => setShowPriorityDropdown(false), [])
  const closeColumn = useCallback(() => setShowColumnDropdown(false), [])
  const closeAgent = useCallback(() => setShowAgentDropdown(false), [])
  const closeRecurrence = useCallback(() => setShowRecurrenceDropdown(false), [])
  const closeWeekDay = useCallback(() => setShowWeekDayDropdown(false), [])
  const closeMonthDay = useCallback(() => setShowMonthDayDropdown(false), [])

  const priorityRef = useDropdownClose(showPriorityDropdown, closePriority)
  const columnRef = useDropdownClose(showColumnDropdown, closeColumn)
  const agentRef = useDropdownClose(showAgentDropdown, closeAgent)
  const recurrenceRef = useDropdownClose(showRecurrenceDropdown, closeRecurrence)
  const weekDayRef = useDropdownClose(showWeekDayDropdown, closeWeekDay)
  const monthDayRef = useDropdownClose(showMonthDayDropdown, closeMonthDay)

  useEffect(() => {
    loadAgents().then((data) => {
      setAgents(data)
      setLoadingAgents(false)
    })
  }, [])

  function handleFileDrop(e: React.DragEvent) {
    e.preventDefault()
    const files = Array.from(e.dataTransfer.files)
    const fileNames = files.map((f) => f.name)
    setDocuments((prev) => [...prev, ...fileNames])
  }

  function handleFileSelect(e: React.ChangeEvent<HTMLInputElement>) {
    const files = Array.from(e.target.files ?? [])
    const fileNames = files.map((f) => f.name)
    setDocuments((prev) => [...prev, ...fileNames])
  }

  function removeDocument(fileName: string) {
    setDocuments((prev) => prev.filter((f) => f !== fileName))
  }

  function toggleRecurrenceDay(day: number) {
    setRecurrenceDays((prev) =>
      prev.includes(day) ? prev.filter((d) => d !== day) : [...prev, day]
    )
  }

  function toggleMonthlyDay(day: number) {
    setRecurrenceMonthlyDays((prev) =>
      prev.includes(day) ? prev.filter((d) => d !== day) : [...prev, day]
    )
  }

  const selectedAgent = agents.find((a) => a.id === selectedAgentId)
  const displayedAgentName = selectedAgent?.name === 'Default Agent' && t('agents.defaultAgent') !== 'Default Agent'
    ? t('agents.defaultAgent')
    : selectedAgent?.name
  const selectedMemberNames = teamMembers
    .filter((m) => selectedMembers.includes(m.id))
    .map((m) => m.name)
  const teamMemberOptions = teamMembers.map((member) => ({ value: member.id, label: member.name }))
  const workspaceFlows = flows.filter((flow) => flow.workspace_id === selectedWorkspaceId)
  const selectedWorkspace = workspaces.find((workspace) => workspace.id === selectedWorkspaceId)
  const selectedFlow = flows.find((flow) => flow.id === selectedFlowId)

  function truncateText(text: string, maxLength: number) {
    if (text.length <= maxLength) return text
    return text.slice(0, maxLength) + '...'
  }

  const selectedPriority = PRIORITIES.find((p) => p.value === priority)
  const selectedColumn = COLUMNS.find((c) => c.id === kanbanColumn)
  const selectedRecurrence = RECURRENCES.find((r) => r.value === recurrence)
  const hasDay31 = recurrenceMonthlyDays.includes(31)
  const currentStepLabel = t(STEP_KEYS[step])

  return (
    <WizardShell
      testId="create-task-page"
      title={t('tasks.newTask')}
      step={step + 1}
      totalSteps={STEP_KEYS.length}
      stepLabel={currentStepLabel}
      progressLabel={t('workflow.stepOf', { step: step + 1, total: STEP_KEYS.length, label: currentStepLabel })}
      className="overflow-y-auto"
      footer={(
        <>
          <Button variant="ghost" onClick={step === 0 ? onBack : () => setStep((s) => s - 1)}>{t('common.back')}</Button>
          <div className="ml-auto flex gap-2">
            {error && <span className="self-center text-xs text-destructive">{error}</span>}
            <Button
              disabled={submitting || (step === 0 && (!objective || !prompt)) || (step === 1 && !selectedWorkspaceId)}
              onClick={async () => {
                if (step === STEP_KEYS.length - 1) {
                  setError(null)
                  setSubmitting(true)
                  try {
                    const result = await onCreate?.({
                      title: objective,
                      brief: prompt,
                      objective,
                      prompt,
                      documents,
                      team_members: selectedMemberNames,
                      agent_id: selectedAgentId,
                      priority,
                      status: kanbanColumn,
                      schedule_start: scheduleStart || null,
                      schedule_end: scheduleEnd || null,
                      schedule_time: scheduleTime || null,
                      recurrence,
                      recurrence_days: recurrenceDays,
                      recurrence_monthly_days: recurrenceMonthlyDays,
                      workspace_id: selectedWorkspaceId,
                      flow_id: selectedFlowId || null,
                    })
                    if (!result) {
                      setError(t('tasks.createError'))
                    }
                  } catch {
                    setError(t('tasks.createError'))
                  } finally {
                    setSubmitting(false)
                  }
                  return
                }
                setStep((s) => Math.min(STEP_KEYS.length - 1, s + 1))
              }}
            >
              {step === STEP_KEYS.length - 1 ? (submitting ? t('workflow.creating') : t('workflow.done')) : t('workflow.next')}
            </Button>
          </div>
        </>
      )}
    >
          {error && (
            <div className="rounded-md bg-destructive/10 p-3 text-sm text-destructive">{error}</div>
          )}

          {/* Step 1: Briefing */}
          {step === 0 && (
            <div className="space-y-4">
              <div className="space-y-1">
                <RequiredLabel htmlFor="t-objective">{t('tasks.objective')}</RequiredLabel>
                <Input
                  id="t-objective"
                  value={objective}
                  onChange={(e) => setObjective(e.target.value)}
                  placeholder={t('tasks.objectivePlaceholder')}
                />
              </div>

              <div className="space-y-1">
                <RequiredLabel htmlFor="t-prompt">{t('tasks.prompt')}</RequiredLabel>
                <Textarea
                  id="t-prompt"
                  value={prompt}
                  onChange={(e) => setPrompt(e.target.value)}
                  placeholder={t('tasks.promptPlaceholder')}
                  rows={6}
                />
              </div>

              <div className="space-y-2">
                <Label>{t('tasks.documents')}</Label>
                <div
                  onDragOver={(e) => e.preventDefault()}
                  onDrop={handleFileDrop}
                  className="flex flex-col items-center justify-center rounded-lg border-2 border-dashed border-muted-foreground/25 bg-muted/20 p-6 transition-colors hover:border-muted-foreground/40 hover:bg-muted/30"
                >
                  <Upload className="h-8 w-8 text-muted-foreground/50 mb-2" />
                  <p className="text-sm text-muted-foreground">{t('tasks.dragDrop')}</p>
                  <label className="mt-2 cursor-pointer">
                    <span className="rounded-md bg-[#2F5D5A] px-3 py-1.5 text-xs font-medium text-white hover:bg-[#2F5D5A]/90">
                      {t('tasks.browseFiles')}
                    </span>
                    <input
                      type="file"
                      multiple
                      className="hidden"
                      onChange={handleFileSelect}
                    />
                  </label>
                  <p className="mt-1 text-[10px] text-muted-foreground/60">{t('tasks.fileTypes')}</p>
                </div>

                {documents.length > 0 && (
                  <div className="space-y-2 mt-2">
                    {documents.map((fileName) => (
                      <div key={fileName} className="flex items-center gap-2 rounded-md border bg-muted/30 px-3 py-2">
                        <FileText className="h-4 w-4 text-muted-foreground shrink-0" />
                        <span className="flex-1 text-sm truncate">{fileName}</span>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-5 w-5 text-muted-foreground hover:text-destructive"
                          onClick={() => removeDocument(fileName)}
                        >
                          <X className="h-3 w-3" />
                        </Button>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Step 2: Team, Agent, Priority, Column & Schedule */}
          {step === 1 && (
            <div className="space-y-6">
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <div className="space-y-2">
                  <RequiredLabel>{t('tasks.workspace')}</RequiredLabel>
                  <Select value={selectedWorkspaceId} onValueChange={(value) => { setSelectedWorkspaceId(value); setSelectedFlowId('') }} disabled={loadingWorkspaces}>
                    <SelectTrigger className={DROPDOWN_TRIGGER_CLASSES}>
                      <SelectValue placeholder={loadingWorkspaces ? t('common.loading') : t('flow.selectWorkspace')} />
                    </SelectTrigger>
                    <SelectContent>
                      {workspaces.map((workspace) => (
                        <SelectItem key={workspace.id} value={workspace.id}>{workspace.name}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label>{t('tasks.flow')}</Label>
                  <Select value={selectedFlowId} onValueChange={setSelectedFlowId} disabled={!selectedWorkspaceId || loadingFlows || workspaceFlows.length === 0}>
                    <SelectTrigger className={DROPDOWN_TRIGGER_CLASSES}>
                      <SelectValue placeholder={!selectedWorkspaceId ? t('tasks.selectWorkspaceFirst') : loadingFlows ? t('common.loading') : t('tasks.selectFlowOptional')} />
                    </SelectTrigger>
                    <SelectContent>
                      {workspaceFlows.map((flow) => (
                        <SelectItem key={flow.id} value={flow.id}>{flow.name}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              {/* Priority + Kanban Column */}
              <div className="grid grid-cols-2 gap-4">
                {/* Priority */}
                <div className="space-y-2">
                  <Label>{t('tasks.priority')}</Label>
                  <div ref={priorityRef} className="relative">
                    <Button
                      type="button"
                      variant="outline"
                      className={DROPDOWN_TRIGGER_CLASSES}
                      onClick={() => setShowPriorityDropdown(!showPriorityDropdown)}
                    >
                      <span className="truncate">
                        {selectedPriority ? t(selectedPriority.labelKey) : t('tasks.selectPriority')}
                      </span>
                      <ChevronDown className="h-4 w-4 opacity-50" />
                    </Button>
                    {showPriorityDropdown && (
                      <div className="absolute z-50 mt-1 w-full rounded-md border bg-popover shadow-md">
                        <div className="p-1">
                          {PRIORITIES.map((p) => (
                            <button
                              key={p.value}
                              type="button"
                              className="flex w-full items-center gap-2 rounded-sm px-2 py-1.5 text-sm transition-colors hover:bg-accent hover:text-accent-foreground"
                              onClick={() => {
                                setPriority(p.value)
                                setShowPriorityDropdown(false)
                              }}
                            >
                              <span className="flex-1 text-left">{t(p.labelKey)}</span>
                              {priority === p.value && (
                                <Check className="h-4 w-4 text-[#2F5D5A]" />
                              )}
                            </button>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                </div>

                {/* Kanban Column */}
                <div className="space-y-2">
                  <Label>{t('tasks.initialColumn')}</Label>
                  <div ref={columnRef} className="relative">
                    <Button
                      type="button"
                      variant="outline"
                      className={DROPDOWN_TRIGGER_CLASSES}
                      onClick={() => {
                        setShowColumnDropdown(!showColumnDropdown)
                        setShowAgentDropdown(false)
                      }}
                    >
                      <span className="truncate">
                        {selectedColumn ? t(selectedColumn.labelKey) : t('tasks.selectColumn')}
                      </span>
                      <ChevronDown className="h-4 w-4 opacity-50" />
                    </Button>
                    {showColumnDropdown && (
                      <div className="absolute z-50 mt-1 w-full rounded-md border bg-popover shadow-md">
                        <div className="p-1">
                          {COLUMNS.map((col) => (
                            <button
                              key={col.id}
                              type="button"
                              className="flex w-full items-center gap-2 rounded-sm px-2 py-1.5 text-sm transition-colors hover:bg-accent hover:text-accent-foreground"
                              onClick={() => {
                                setKanbanColumn(col.id)
                                setShowColumnDropdown(false)
                              }}
                            >
                              <span className="flex-1 text-left">{t(col.labelKey)}</span>
                              {kanbanColumn === col.id && (
                                <Check className="h-4 w-4 text-[#2F5D5A]" />
                              )}
                            </button>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* Team Members + Agent */}
              <div className="grid grid-cols-2 gap-4">
                {/* Team Members */}
                <div className="space-y-2">
                  <Label>{t('tasks.teamMembers')}</Label>
                  <MultiSelectDropdown
                    options={teamMemberOptions}
                    selectedValues={selectedMembers}
                    onChange={setSelectedMembers}
                    placeholder={t('tasks.selectTeamMembers')}
                    selectedLabel={(count) => t('common.selectedCount', { count })}
                    selectAllLabel={t('common.selectAll')}
                    loading={loadingMembers}
                    loadingLabel={t('flow.loadingMembers')}
                    emptyLabel={t('flow.noMembersAvailable')}

                    contentClassName="min-w-[var(--radix-dropdown-menu-trigger-width)]"
                  />
                </div>

                {/* Agent */}
                <div className="space-y-2">
                  <Label>{t('tasks.agent')}</Label>
                  <div ref={agentRef} className="relative">
                    <Button
                      type="button"
                      variant="outline"
                      className={DROPDOWN_TRIGGER_CLASSES}
                      onClick={() => {
                        setShowAgentDropdown(!showAgentDropdown)
                        setShowColumnDropdown(false)
                      }}
                      disabled={loadingAgents}
                    >
                      <span className="truncate">
                        {loadingAgents ? t('agents.loadingAgents') : selectedAgent ? displayedAgentName : t('tasks.selectAgent')}
                      </span>
                      <ChevronDown className="h-4 w-4 opacity-50" />
                    </Button>
                    {showAgentDropdown && !loadingAgents && (
                      <div className="absolute z-50 mt-1 w-full rounded-md border bg-popover shadow-md">
                        <div className="max-h-60 overflow-y-auto p-1">
                          {agents.length === 0 ? (
                            <div className="px-2 py-1.5 text-sm text-muted-foreground">{t('tasks.noAgentsAvailable')}</div>
                          ) : (
                            agents.map((agent) => (
                              <button
                                key={agent.id}
                                type="button"
                                className="flex w-full items-center gap-2 rounded-sm px-2 py-1.5 text-sm transition-colors hover:bg-accent hover:text-accent-foreground"
                                onClick={() => {
                                  setSelectedAgentId(agent.id)
                                  setShowAgentDropdown(false)
                                }}
                              >
                                <span className="flex-1 text-left">{agent.name === 'Default Agent' ? t('agents.defaultAgent') : agent.name}</span>
                                <span className="text-[10px] text-muted-foreground">{agent.model}</span>
                              </button>
                            ))
                          )}
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* Schedule Section */}
              <div className="rounded-lg border bg-muted/30 p-4 space-y-4">
                <div className="flex items-center gap-2">
                  <Calendar className="h-4 w-4 text-muted-foreground" />
                  <Label className="text-sm font-semibold">{t('tasks.schedule')}</Label>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-1">
                    <RequiredLabel htmlFor="schedule-start" className="text-xs">{t('tasks.startDate')}</RequiredLabel>
                    <Input
                      id="schedule-start"
                      type="date"
                      value={scheduleStart}
                      onChange={(e) => {
                        setScheduleStart(e.target.value)
                        if (recurrence === 'occasionally') {
                          setScheduleEnd(e.target.value)
                        }
                      }}
                      className="h-9"
                    />
                  </div>
                  <div className="space-y-1">
                    <RequiredLabel htmlFor="schedule-end" className="text-xs">{t('tasks.endDate')}</RequiredLabel>
                    <Input
                      id="schedule-end"
                      type="date"
                      value={recurrence === 'occasionally' ? scheduleStart : scheduleEnd}
                      onChange={(e) => setScheduleEnd(e.target.value)}
                      className="h-9"
                      disabled={recurrence === 'occasionally'}
                    />
                  </div>
                </div>

                <div className="grid grid-cols-3 gap-3">
                  <div className="space-y-1">
                    <RequiredLabel htmlFor="schedule-time" className="text-xs">{t('tasks.time')}</RequiredLabel>
                    <div className="relative">
                      <Clock className="absolute left-2 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-muted-foreground" />
                      <Input
                        id="schedule-time"
                        type="time"
                        value={scheduleTime}
                        onChange={(e) => setScheduleTime(e.target.value)}
                        className="h-9 pl-7"
                      />
                    </div>
                  </div>

                  {/* Recurrence */}
                  <div className="space-y-1">
                      <Label className="text-xs">{t('tasks.recurrence')}</Label>
                    <div ref={recurrenceRef} className="relative">
                      <Button
                        type="button"
                        variant="outline"
                        className={DROPDOWN_TRIGGER_CLASSES}
                        onClick={() => setShowRecurrenceDropdown(!showRecurrenceDropdown)}
                      >
                        <span className="truncate">
                          {selectedRecurrence ? t(selectedRecurrence.labelKey) : t('tasks.selectRecurrence')}
                        </span>
                        <ChevronDown className="h-4 w-4 opacity-50" />
                      </Button>
                      {showRecurrenceDropdown && (
                        <div className="absolute z-50 mt-1 w-full rounded-md border bg-popover shadow-md">
                          <div className="p-1">
                            {RECURRENCES.map((r) => (
                              <button
                                key={r.value}
                                type="button"
                                className="flex w-full items-center gap-2 rounded-sm px-2 py-1.5 text-sm transition-colors hover:bg-accent hover:text-accent-foreground"
                                onClick={() => {
                                  setRecurrence(r.value)
                                  setRecurrenceDays([])
                                  setRecurrenceMonthlyDays([])
                                  setShowRecurrenceDropdown(false)
                                }}
                              >
                                  <span className="flex-1 text-left">{t(r.labelKey)}</span>
                                {recurrence === r.value && (
                                  <Check className="h-4 w-4 text-[#2F5D5A]" />
                                )}
                              </button>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Days of Week (when Weekly) */}
                  {recurrence === 'weekly' && (
                    <div className="space-y-1">
                      <Label className="text-xs">{t('tasks.daysOfWeek')}</Label>
                      <div ref={weekDayRef} className="relative">
                        <Button
                          type="button"
                          variant="outline"
                          className={DROPDOWN_TRIGGER_CLASSES}
                          onClick={() => setShowWeekDayDropdown(!showWeekDayDropdown)}
                        >
                          <span className="truncate">
                            {recurrenceDays.length === 0 ? t('tasks.selectDays') : t('tasks.daysSelected', { count: recurrenceDays.length })}
                          </span>
                          <ChevronDown className="h-4 w-4 opacity-50" />
                        </Button>
                        {showWeekDayDropdown && (
                          <div className="absolute z-50 mt-1 w-full rounded-md border bg-popover shadow-md">
                            <div className="p-1">
                              <button
                                type="button"
                                className="flex w-full items-center gap-2 rounded-sm px-2 py-1.5 text-sm hover:bg-accent border-b"
                                onClick={() => {
                                  if (recurrenceDays.length === WEEK_DAYS.length) {
                                    setRecurrenceDays([])
                                  } else {
                                    setRecurrenceDays(WEEK_DAYS.map((d) => d.id))
                                  }
                                }}
                              >
                                <Checkbox
                                  checked={recurrenceDays.length === WEEK_DAYS.length}
                                  className="rounded-[2px]"
                                />
                                <span className="font-medium">{t('common.selectAll')}</span>
                              </button>
                              {WEEK_DAYS.map((day) => (
                                <button
                                  key={day.id}
                                  type="button"
                                  className="flex w-full items-center gap-2 rounded-sm px-2 py-1.5 text-sm transition-colors hover:bg-accent hover:text-accent-foreground"
                                  onClick={() => toggleRecurrenceDay(day.id)}
                                >
                                  <Checkbox
                                    checked={recurrenceDays.includes(day.id)}
                                    className="rounded-[2px]"
                                  />
                                  <span>{t(day.labelKey)}</span>
                                </button>
                              ))}
                            </div>
                          </div>
                        )}
                      </div>
                    </div>
                  )}

                  {/* Days of Month (when Monthly) */}
                  {recurrence === 'monthly' && (
                    <div className="space-y-1">
                      <Label className="text-xs">{t('tasks.daysOfMonth')}</Label>
                      <div ref={monthDayRef} className="relative">
                        <Button
                          type="button"
                          variant="outline"
                          className={DROPDOWN_TRIGGER_CLASSES}
                          onClick={() => setShowMonthDayDropdown(!showMonthDayDropdown)}
                        >
                          <span className="truncate">
                            {recurrenceMonthlyDays.length === 0 ? t('tasks.selectDays') : t('tasks.daysSelected', { count: recurrenceMonthlyDays.length })}
                          </span>
                          <ChevronDown className="h-4 w-4 opacity-50" />
                        </Button>
                        {showMonthDayDropdown && (
                          <div className="absolute z-50 mt-1 w-full rounded-md border bg-popover shadow-md">
                            <div className="max-h-60 overflow-y-auto p-1">
                              <button
                                type="button"
                                className="flex w-full items-center gap-2 rounded-sm px-2 py-1.5 text-sm hover:bg-accent border-b"
                                onClick={() => {
                                  if (recurrenceMonthlyDays.length === MONTH_DAYS.length) {
                                    setRecurrenceMonthlyDays([])
                                  } else {
                                    setRecurrenceMonthlyDays([...MONTH_DAYS])
                                  }
                                }}
                              >
                                <Checkbox
                                  checked={recurrenceMonthlyDays.length === MONTH_DAYS.length}
                                  className="rounded-[2px]"
                                />
                                <span className="font-medium">{t('common.selectAll')}</span>
                              </button>
                              {MONTH_DAYS.map((day) => (
                                <button
                                  key={day}
                                  type="button"
                                  className="flex w-full items-center gap-2 rounded-sm px-2 py-1.5 text-sm transition-colors hover:bg-accent hover:text-accent-foreground"
                                  onClick={() => toggleMonthlyDay(day)}
                                >
                                  <Checkbox
                                    checked={recurrenceMonthlyDays.includes(day)}
                                    className="rounded-[2px]"
                                  />
                                  <span>{t('tasks.dayLabel', { day })}</span>
                                </button>
                              ))}
                            </div>
                          </div>
                        )}
                        {hasDay31 && (
                          <div className="flex items-start gap-2 rounded-md bg-[#B7791F]/10 border border-[#B7791F]/30 p-2 mt-2">
                            <AlertTriangle className="h-4 w-4 text-[#B7791F] shrink-0 mt-0.5" />
                            <p className="text-[11px] text-[#7A3E14]">
                              {t('tasks.month31Warning')}
                            </p>
                          </div>
                        )}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* Step 3: Review */}
          {step === 2 && (
            <div className="space-y-4">
              <div className="rounded-lg border bg-muted/35 p-4 space-y-3">
                <div>
                  <div className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-1">{t('tasks.objective')}</div>
                  <div className="text-sm">{objective || t('tasks.notSpecified')}</div>
                </div>

                <div>
                  <div className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-1">{t('tasks.prompt')}</div>
                  <div className="text-sm rounded-md bg-background p-3 border">
                    {prompt ? truncateText(prompt, 200) : t('tasks.notSpecified')}
                  </div>
                  {prompt.length > 200 && (
                    <div className="text-[10px] text-muted-foreground mt-1">
                      {t('tasks.reviewPreview', { count: prompt.length })}
                    </div>
                  )}
                </div>

                <div>
                  <div className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-1">{t('tasks.documents')}</div>
                  {documents.length === 0 ? (
                    <div className="text-sm text-muted-foreground">{t('tasks.noDocumentsAttached')}</div>
                  ) : (
                    <div className="flex flex-wrap gap-1.5">
                      {documents.map((fileName) => (
                        <Badge key={fileName} variant="secondary" className="gap-1">
                          <FileText className="h-3 w-3" />
                          {fileName}
                        </Badge>
                      ))}
                    </div>
                  )}
                </div>
              </div>

              <div className="rounded-lg border bg-muted/35 p-4 space-y-3">
                <div>
                  <div className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-1">{t('tasks.workspace')}</div>
                  <div className="text-sm">{selectedWorkspace?.name || t('tasks.notSpecified')}</div>
                </div>

                <div>
                  <div className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-1">{t('tasks.flow')}</div>
                  <div className="text-sm">{selectedFlow?.name || t('workflow.none')}</div>
                </div>

                <div>
                  <div className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-1">{t('tasks.priority')}</div>
                  {selectedPriority && (
                    <span className={`flex items-center gap-1 rounded-md px-2 py-1 text-xs font-medium w-fit ${selectedPriority.color}`}>
                      <selectedPriority.icon className="h-3 w-3" />
                      {t(selectedPriority.labelKey)}
                    </span>
                  )}
                </div>

                <div>
                  <div className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-1">{t('tasks.kanbanColumn')}</div>
                  <div className="flex items-center gap-2">
                    <LayoutGrid className="h-4 w-4 text-muted-foreground" />
                    <span className="text-sm font-medium">{selectedColumn ? t(selectedColumn.labelKey) : null}</span>
                  </div>
                </div>

                <div>
                  <div className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-1">{t('tasks.teamMembers')}</div>
                  {selectedMemberNames.length === 0 ? (
                    <div className="text-sm text-muted-foreground">{t('tasks.noTeamMembersSelected')}</div>
                  ) : (
                    <div className="flex flex-wrap gap-1.5">
                      {selectedMemberNames.map((name) => (
                        <Badge key={name} variant="secondary" className="bg-[#2F5D5A]/10 text-[#2F5D5A]">{name}</Badge>
                      ))}
                    </div>
                  )}
                </div>

                <div>
                  <div className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-1">{t('tasks.agent')}</div>
                  {selectedAgent ? (
                    <div className="flex items-center gap-2">
                      <span className={`h-2 w-2 rounded-full ${
                        selectedAgent.status === 'active' ? 'bg-[#2F5D5A]' :
                        selectedAgent.status === 'paused' ? 'bg-amber-500' :
                        selectedAgent.status === 'error' ? 'bg-[#A04D1F]' :
                        'bg-slate-400'
                      }`} />
                      <span className="text-sm font-medium">{displayedAgentName}</span>
                      <span className="text-xs text-muted-foreground">({selectedAgent.model})</span>
                    </div>
                  ) : (
                    <div className="text-sm text-muted-foreground">{t('tasks.noAgentSelected')}</div>
                  )}
                </div>
              </div>

              <div className="rounded-lg border bg-muted/35 p-4 space-y-3">
                <div className="flex items-center gap-2">
                  <Calendar className="h-4 w-4 text-muted-foreground" />
                  <div className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">{t('tasks.schedule')}</div>
                </div>

                <div className="grid grid-cols-2 gap-3 text-sm">
                  <div>
                    <div className="text-xs text-muted-foreground">{t('tasks.start')}</div>
                    <div>{scheduleStart || t('tasks.notSet')}</div>
                  </div>
                  <div>
                    <div className="text-xs text-muted-foreground">{t('tasks.end')}</div>
                    <div>{recurrence === 'occasionally' ? t('tasks.oneTime') : scheduleEnd || t('tasks.notSet')}</div>
                  </div>
                  <div>
                    <div className="text-xs text-muted-foreground">{t('tasks.time')}</div>
                    <div>{scheduleTime || t('tasks.notSet')}</div>
                  </div>
                  <div>
                    <div className="text-xs text-muted-foreground">{t('tasks.recurrence')}</div>
                    <div>{selectedRecurrence ? t(selectedRecurrence.labelKey) : null}</div>
                  </div>
                </div>

                {recurrence === 'weekly' && recurrenceDays.length > 0 && (
                  <div>
                    <div className="text-xs text-muted-foreground mb-1">{t('tasks.daysOfWeek')}</div>
                    <div className="flex flex-wrap gap-1">
                      {recurrenceDays.sort().map((dayId) => (
                        <Badge key={dayId} variant="secondary" className="text-[10px]">
                          {t(WEEK_DAYS.find((d) => d.id === dayId)?.labelKey ?? 'common.noResults')}
                        </Badge>
                      ))}
                    </div>
                  </div>
                )}

                {recurrence === 'monthly' && recurrenceMonthlyDays.length > 0 && (
                  <div>
                    <div className="text-xs text-muted-foreground mb-1">{t('tasks.daysOfMonth')}</div>
                    <div className="flex flex-wrap gap-1">
                      {recurrenceMonthlyDays.sort((a, b) => a - b).map((day) => (
                        <Badge key={day} variant="secondary" className="text-[10px]">
                          {t('tasks.dayLabel', { day })}
                        </Badge>
                      ))}
                    </div>
                    {hasDay31 && (
                      <div className="flex items-start gap-2 mt-2">
                        <AlertTriangle className="h-3 w-3 text-[#B7791F] shrink-0 mt-0.5" />
                        <p className="text-[10px] text-[#7A3E14]">
                          {t('tasks.month31ShortWarning')}
                        </p>
                      </div>
                    )}
                  </div>
                )}
              </div>
            </div>
          )}
    </WizardShell>
  )
}
