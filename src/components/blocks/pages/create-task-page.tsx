import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Progress } from '@/components/ui/progress'
import { Textarea } from '@/components/ui/textarea'
import { Badge } from '@/components/ui/badge'
import { Checkbox } from '@/components/ui/checkbox'
import { Upload, X, FileText, ChevronDown, Check, ArrowDown, ArrowUp, Minus, LayoutGrid, Calendar, Clock, AlertTriangle } from 'lucide-react'
import { loadAgents } from '@/lib/agents'
import type { Agent } from '@/types/agent'
import type { TaskPriority, TaskStatus, RecurrenceType } from '@/types/task'
import { useTeamMemberOptions } from '@/hooks/use-team-member-options'

const STEPS = ['Briefing', 'Team & Agent', 'Review'] as const

const PRIORITIES: { value: TaskPriority; label: string; color: string; icon: typeof ArrowDown }[] = [
  { value: 'low', label: 'Min', color: 'text-[#2F4858] bg-[#2F4858]/10', icon: ArrowDown },
  { value: 'medium', label: 'Med', color: 'text-[#B7791F] bg-[#B7791F]/10', icon: Minus },
  { value: 'high', label: 'High', color: 'text-[#8c1f28] bg-[#8c1f28]/10', icon: ArrowUp },
]

const COLUMNS: { id: TaskStatus; label: string }[] = [
  { id: 'backlog', label: 'Backlog' },
  { id: 'in-progress', label: 'In Progress' },
  { id: 'in-review', label: 'In Review' },
  { id: 'done', label: 'Done' },
]

const RECURRENCES: { value: RecurrenceType; label: string }[] = [
  { value: 'occasionally', label: 'Occasionally' },
  { value: 'daily', label: 'Daily' },
  { value: 'weekly', label: 'Weekly' },
  { value: 'monthly', label: 'Monthly' },
]

const WEEK_DAYS = [
  { id: 0, label: 'Sun', short: 'S' },
  { id: 1, label: 'Mon', short: 'M' },
  { id: 2, label: 'Tue', short: 'T' },
  { id: 3, label: 'Wed', short: 'W' },
  { id: 4, label: 'Thu', short: 'T' },
  { id: 5, label: 'Fri', short: 'F' },
  { id: 6, label: 'Sat', short: 'S' },
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
  }) => Promise<unknown>
}) {
  const [step, setStep] = useState(0)
  const [objective, setObjective] = useState('')
  const [prompt, setPrompt] = useState('')
  const [documents, setDocuments] = useState<string[]>([])
  const [selectedMembers, setSelectedMembers] = useState<string[]>([])
  const [selectedAgentId, setSelectedAgentId] = useState<string | null>(null)
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
  const [showMemberDropdown, setShowMemberDropdown] = useState(false)
  const [showAgentDropdown, setShowAgentDropdown] = useState(false)
  const [showColumnDropdown, setShowColumnDropdown] = useState(false)
  const [showPriorityDropdown, setShowPriorityDropdown] = useState(false)
  const [showRecurrenceDropdown, setShowRecurrenceDropdown] = useState(false)
  const [showWeekDayDropdown, setShowWeekDayDropdown] = useState(false)
  const [showMonthDayDropdown, setShowMonthDayDropdown] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [submitting, setSubmitting] = useState(false)

  useEffect(() => {
    loadAgents().then((data) => {
      setAgents(data)
      setLoadingAgents(false)
    })
  }, [])

  function toggleMember(memberId: string) {
    setSelectedMembers((prev) =>
      prev.includes(memberId) ? prev.filter((id) => id !== memberId) : [...prev, memberId]
    )
  }

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
  const selectedMemberNames = teamMembers
    .filter((m) => selectedMembers.includes(m.id))
    .map((m) => m.name)

  function truncateText(text: string, maxLength: number) {
    if (text.length <= maxLength) return text
    return text.slice(0, maxLength) + '...'
  }

  const selectedPriority = PRIORITIES.find((p) => p.value === priority)
  const selectedColumn = COLUMNS.find((c) => c.id === kanbanColumn)
  const selectedRecurrence = RECURRENCES.find((r) => r.value === recurrence)
  const hasDay31 = recurrenceMonthlyDays.includes(31)

  return (
    <div className="h-full overflow-y-auto bg-muted/20">
      <div className="mx-auto flex min-h-full max-w-3xl flex-col gap-4 p-6 animate-app-rise">
      <header>
        <h1 className="text-lg font-semibold">New Task</h1>
        <p className="text-sm text-muted-foreground">Step {step + 1} of {STEPS.length} · {STEPS[step]}</p>
      </header>
      <Progress value={((step + 1) / STEPS.length) * 100} />

      <Card className="flex-1 border-border/80 shadow-[0_1px_2px_rgba(16,24,40,0.04),0_10px_24px_rgba(16,24,40,0.06)]">
        <CardHeader><CardTitle className="text-sm font-semibold">{STEPS[step]}</CardTitle></CardHeader>
        <CardContent className="space-y-4">
          {error && (
            <div className="rounded-md bg-destructive/10 p-3 text-sm text-destructive">{error}</div>
          )}

          {/* Step 1: Briefing */}
          {step === 0 && (
            <div className="space-y-4">
              <div className="space-y-1">
                <Label htmlFor="t-objective" className="text-[#8c1f28]">
                  Objective <span className="text-[#8c1f28]">*</span>
                </Label>
                <Input
                  id="t-objective"
                  value={objective}
                  onChange={(e) => setObjective(e.target.value)}
                  placeholder="What is the main goal of this task?"
                />
              </div>

              <div className="space-y-1">
                <Label htmlFor="t-prompt" className="text-[#8c1f28]">
                  Prompt <span className="text-[#8c1f28]">*</span>
                </Label>
                <Textarea
                  id="t-prompt"
                  value={prompt}
                  onChange={(e) => setPrompt(e.target.value)}
                  placeholder="Write the detailed prompt for the AI agent..."
                  rows={6}
                />
              </div>

              <div className="space-y-2">
                <Label>Documents</Label>
                <div
                  onDragOver={(e) => e.preventDefault()}
                  onDrop={handleFileDrop}
                  className="flex flex-col items-center justify-center rounded-lg border-2 border-dashed border-muted-foreground/25 bg-muted/20 p-6 transition-colors hover:border-muted-foreground/40 hover:bg-muted/30"
                >
                  <Upload className="h-8 w-8 text-muted-foreground/50 mb-2" />
                  <p className="text-sm text-muted-foreground">Drag & drop files here, or</p>
                  <label className="mt-2 cursor-pointer">
                    <span className="rounded-md bg-[#2F4858] px-3 py-1.5 text-xs font-medium text-white hover:bg-[#2F4858]/90">
                      Browse files
                    </span>
                    <input
                      type="file"
                      multiple
                      className="hidden"
                      onChange={handleFileSelect}
                    />
                  </label>
                  <p className="mt-1 text-[10px] text-muted-foreground/60">PDF, DOC, TXT, CSV up to 10MB each</p>
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
              {/* Priority + Kanban Column */}
              <div className="grid grid-cols-2 gap-4">
                {/* Priority */}
                <div className="space-y-2">
                  <Label>Priority</Label>
                  <div className="relative">
                    <Button
                      type="button"
                      variant="outline"
                      className="w-full justify-between h-9"
                      onClick={() => setShowPriorityDropdown(!showPriorityDropdown)}
                    >
                      <span className={priority ? 'text-foreground' : 'text-muted-foreground'}>
                        {selectedPriority?.label ?? 'Select priority...'}
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
                              className="flex w-full items-center gap-2 rounded-sm px-2 py-1.5 text-sm hover:bg-accent"
                              onClick={() => {
                                setPriority(p.value)
                                setShowPriorityDropdown(false)
                              }}
                            >
                              <span className="flex-1 text-left">{p.label}</span>
                              {priority === p.value && (
                                <Check className="h-4 w-4 text-[#2F4858]" />
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
                  <Label>Initial Column</Label>
                  <div className="relative">
                    <Button
                      type="button"
                      variant="outline"
                      className="w-full justify-between h-9"
                      onClick={() => {
                        setShowColumnDropdown(!showColumnDropdown)
                        setShowMemberDropdown(false)
                        setShowAgentDropdown(false)
                      }}
                    >
                      <span className={kanbanColumn ? 'text-foreground' : 'text-muted-foreground'}>
                        {selectedColumn?.label ?? 'Select column...'}
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
                              className="flex w-full items-center gap-2 rounded-sm px-2 py-1.5 text-sm hover:bg-accent"
                              onClick={() => {
                                setKanbanColumn(col.id)
                                setShowColumnDropdown(false)
                              }}
                            >
                              <span className="flex-1 text-left">{col.label}</span>
                              {kanbanColumn === col.id && (
                                <Check className="h-4 w-4 text-[#2F4858]" />
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
                  <Label>Team Members</Label>
                  <div className="relative">
                    <Button
                      type="button"
                      variant="outline"
                      className="w-full justify-between h-9"
                      onClick={() => {
                        setShowMemberDropdown(!showMemberDropdown)
                        setShowColumnDropdown(false)
                        setShowAgentDropdown(false)
                      }}
                    >
                      <span className="text-muted-foreground">
                        {selectedMembers.length === 0 ? 'Select team members...' : `${selectedMembers.length} selected`}
                      </span>
                      <ChevronDown className="h-4 w-4 opacity-50" />
                    </Button>
                    {showMemberDropdown && (
                      <div className="absolute z-50 mt-1 w-full rounded-md border bg-popover shadow-md">
                        <div className="max-h-60 overflow-y-auto p-1">
                          {/* Select All */}
                          <button
                            type="button"
                            className="flex w-full items-center gap-2 rounded-sm px-2 py-1.5 text-sm hover:bg-accent border-b"
                            onClick={() => {
                              if (selectedMembers.length === teamMembers.length) {
                                setSelectedMembers([])
                              } else {
                                setSelectedMembers(teamMembers.map((m) => m.id))
                              }
                            }}
                          >
                            <Checkbox
                              checked={teamMembers.length > 0 && selectedMembers.length === teamMembers.length}
                              className="rounded-[2px]"
                            />
                            <span className="font-medium">Select All</span>
                          </button>
                          {loadingMembers ? <div className="px-2 py-1.5 text-sm text-muted-foreground">Loading members...</div> : null}
                          {!loadingMembers && teamMembers.length === 0 ? <div className="px-2 py-1.5 text-sm text-muted-foreground">No members available</div> : null}
                          {teamMembers.map((member) => (
                            <button
                              key={member.id}
                              type="button"
                              className="flex w-full items-center gap-2 rounded-sm px-2 py-1.5 text-sm hover:bg-accent"
                              onClick={() => toggleMember(member.id)}
                            >
                              <Checkbox
                                checked={selectedMembers.includes(member.id)}
                                className="rounded-[2px]"
                              />
                              <span>{member.name}</span>
                            </button>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                </div>

                {/* Agent */}
                <div className="space-y-2">
                  <Label>Agent</Label>
                  <div className="relative">
                    <Button
                      type="button"
                      variant="outline"
                      className="w-full justify-between h-9"
                      onClick={() => {
                        setShowAgentDropdown(!showAgentDropdown)
                        setShowColumnDropdown(false)
                        setShowMemberDropdown(false)
                      }}
                      disabled={loadingAgents}
                    >
                      <span className={selectedAgent ? 'text-foreground' : 'text-muted-foreground'}>
                        {loadingAgents ? 'Loading agents...' : selectedAgent ? selectedAgent.name : 'Select an agent...'}
                      </span>
                      <ChevronDown className="h-4 w-4 opacity-50" />
                    </Button>
                    {showAgentDropdown && !loadingAgents && (
                      <div className="absolute z-50 mt-1 w-full rounded-md border bg-popover shadow-md">
                        <div className="max-h-60 overflow-y-auto p-1">
                          {agents.length === 0 ? (
                            <div className="px-2 py-1.5 text-sm text-muted-foreground">No agents available</div>
                          ) : (
                            agents.map((agent) => (
                              <button
                                key={agent.id}
                                type="button"
                                className="flex w-full items-center gap-2 rounded-sm px-2 py-1.5 text-sm hover:bg-accent"
                                onClick={() => {
                                  setSelectedAgentId(agent.id)
                                  setShowAgentDropdown(false)
                                }}
                              >
                                <span className="flex-1 text-left">{agent.name}</span>
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
                  <Label className="text-sm font-semibold">Schedule</Label>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-1">
                    <Label htmlFor="schedule-start" className="text-xs text-[#8c1f28]">
                      Start Date <span className="text-[#8c1f28]">*</span>
                    </Label>
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
                    <Label htmlFor="schedule-end" className="text-xs text-[#8c1f28]">
                      End Date <span className="text-[#8c1f28]">*</span>
                    </Label>
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
                    <Label htmlFor="schedule-time" className="text-xs text-[#8c1f28]">
                      Time <span className="text-[#8c1f28]">*</span>
                    </Label>
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
                    <Label className="text-xs">Recurrence</Label>
                    <div className="relative">
                      <Button
                        type="button"
                        variant="outline"
                        className="w-full justify-between h-9"
                        onClick={() => setShowRecurrenceDropdown(!showRecurrenceDropdown)}
                      >
                        <span className={recurrence ? 'text-foreground' : 'text-muted-foreground'}>
                          {selectedRecurrence?.label ?? 'Select recurrence...'}
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
                                className="flex w-full items-center gap-2 rounded-sm px-2 py-1.5 text-sm hover:bg-accent"
                                onClick={() => {
                                  setRecurrence(r.value)
                                  setRecurrenceDays([])
                                  setRecurrenceMonthlyDays([])
                                  setShowRecurrenceDropdown(false)
                                }}
                              >
                                <span className="flex-1 text-left">{r.label}</span>
                                {recurrence === r.value && (
                                  <Check className="h-4 w-4 text-[#2F4858]" />
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
                      <Label className="text-xs">Days of Week</Label>
                      <div className="relative">
                        <Button
                          type="button"
                          variant="outline"
                          className="w-full justify-between h-9"
                          onClick={() => setShowWeekDayDropdown(!showWeekDayDropdown)}
                        >
                          <span className="text-muted-foreground">
                            {recurrenceDays.length === 0 ? 'Select days...' : `${recurrenceDays.length} days selected`}
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
                                <span className="font-medium">Select All</span>
                              </button>
                              {WEEK_DAYS.map((day) => (
                                <button
                                  key={day.id}
                                  type="button"
                                  className="flex w-full items-center gap-2 rounded-sm px-2 py-1.5 text-sm hover:bg-accent"
                                  onClick={() => toggleRecurrenceDay(day.id)}
                                >
                                  <Checkbox
                                    checked={recurrenceDays.includes(day.id)}
                                    className="rounded-[2px]"
                                  />
                                  <span>{day.label}</span>
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
                      <Label className="text-xs">Days of Month</Label>
                      <div className="relative">
                        <Button
                          type="button"
                          variant="outline"
                          className="w-full justify-between h-9"
                          onClick={() => setShowMonthDayDropdown(!showMonthDayDropdown)}
                        >
                          <span className="text-muted-foreground">
                            {recurrenceMonthlyDays.length === 0 ? 'Select days...' : `${recurrenceMonthlyDays.length} days selected`}
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
                                <span className="font-medium">Select All</span>
                              </button>
                              {MONTH_DAYS.map((day) => (
                                <button
                                  key={day}
                                  type="button"
                                  className="flex w-full items-center gap-2 rounded-sm px-2 py-1.5 text-sm hover:bg-accent"
                                  onClick={() => toggleMonthlyDay(day)}
                                >
                                  <Checkbox
                                    checked={recurrenceMonthlyDays.includes(day)}
                                    className="rounded-[2px]"
                                  />
                                  <span>Day {day}</span>
                                </button>
                              ))}
                            </div>
                          </div>
                        )}
                        {hasDay31 && (
                          <div className="flex items-start gap-2 rounded-md bg-[#B7791F]/10 border border-[#B7791F]/30 p-2 mt-2">
                            <AlertTriangle className="h-4 w-4 text-[#B7791F] shrink-0 mt-0.5" />
                            <p className="text-[11px] text-[#8A6116]">
                              In months with fewer than 31 days, this task will be scheduled for the last day of the month.
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
                  <div className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-1">Objective</div>
                  <div className="text-sm">{objective || 'Not specified'}</div>
                </div>

                <div>
                  <div className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-1">Prompt</div>
                  <div className="text-sm rounded-md bg-background p-3 border">
                    {prompt ? truncateText(prompt, 200) : 'Not specified'}
                  </div>
                  {prompt.length > 200 && (
                    <div className="text-[10px] text-muted-foreground mt-1">
                      Showing first 200 characters of {prompt.length} total
                    </div>
                  )}
                </div>

                <div>
                  <div className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-1">Documents</div>
                  {documents.length === 0 ? (
                    <div className="text-sm text-muted-foreground">No documents attached</div>
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
                  <div className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-1">Priority</div>
                  {selectedPriority && (
                    <span className={`flex items-center gap-1 rounded-md px-2 py-1 text-xs font-medium w-fit ${selectedPriority.color}`}>
                      <selectedPriority.icon className="h-3 w-3" />
                      {selectedPriority.label}
                    </span>
                  )}
                </div>

                <div>
                  <div className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-1">Kanban Column</div>
                  <div className="flex items-center gap-2">
                    <LayoutGrid className="h-4 w-4 text-muted-foreground" />
                    <span className="text-sm font-medium">{selectedColumn?.label}</span>
                  </div>
                </div>

                <div>
                  <div className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-1">Team Members</div>
                  {selectedMemberNames.length === 0 ? (
                    <div className="text-sm text-muted-foreground">No team members selected</div>
                  ) : (
                    <div className="flex flex-wrap gap-1.5">
                      {selectedMemberNames.map((name) => (
                        <Badge key={name} variant="secondary" className="bg-[#2F4858]/10 text-[#2F4858]">{name}</Badge>
                      ))}
                    </div>
                  )}
                </div>

                <div>
                  <div className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-1">Agent</div>
                  {selectedAgent ? (
                    <div className="flex items-center gap-2">
                      <span className={`h-2 w-2 rounded-full ${
                        selectedAgent.status === 'active' ? 'bg-[#2F4858]' :
                        selectedAgent.status === 'paused' ? 'bg-amber-500' :
                        selectedAgent.status === 'error' ? 'bg-[#8c1f28]' :
                        'bg-slate-400'
                      }`} />
                      <span className="text-sm font-medium">{selectedAgent.name}</span>
                      <span className="text-xs text-muted-foreground">({selectedAgent.model})</span>
                    </div>
                  ) : (
                    <div className="text-sm text-muted-foreground">No agent selected</div>
                  )}
                </div>
              </div>

              <div className="rounded-lg border bg-muted/35 p-4 space-y-3">
                <div className="flex items-center gap-2">
                  <Calendar className="h-4 w-4 text-muted-foreground" />
                  <div className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">Schedule</div>
                </div>

                <div className="grid grid-cols-2 gap-3 text-sm">
                  <div>
                    <div className="text-xs text-muted-foreground">Start</div>
                    <div>{scheduleStart || 'Not set'}</div>
                  </div>
                  <div>
                    <div className="text-xs text-muted-foreground">End</div>
                    <div>{recurrence === 'occasionally' ? 'One-time' : scheduleEnd || 'Not set'}</div>
                  </div>
                  <div>
                    <div className="text-xs text-muted-foreground">Time</div>
                    <div>{scheduleTime || 'Not set'}</div>
                  </div>
                  <div>
                    <div className="text-xs text-muted-foreground">Recurrence</div>
                    <div>{selectedRecurrence?.label}</div>
                  </div>
                </div>

                {recurrence === 'weekly' && recurrenceDays.length > 0 && (
                  <div>
                    <div className="text-xs text-muted-foreground mb-1">Days of Week</div>
                    <div className="flex flex-wrap gap-1">
                      {recurrenceDays.sort().map((dayId) => (
                        <Badge key={dayId} variant="secondary" className="text-[10px]">
                          {WEEK_DAYS.find((d) => d.id === dayId)?.label}
                        </Badge>
                      ))}
                    </div>
                  </div>
                )}

                {recurrence === 'monthly' && recurrenceMonthlyDays.length > 0 && (
                  <div>
                    <div className="text-xs text-muted-foreground mb-1">Days of Month</div>
                    <div className="flex flex-wrap gap-1">
                      {recurrenceMonthlyDays.sort((a, b) => a - b).map((day) => (
                        <Badge key={day} variant="secondary" className="text-[10px]">
                          Day {day}
                        </Badge>
                      ))}
                    </div>
                    {hasDay31 && (
                      <div className="flex items-start gap-2 mt-2">
                        <AlertTriangle className="h-3 w-3 text-[#B7791F] shrink-0 mt-0.5" />
                        <p className="text-[10px] text-[#8A6116]">
                          Months with fewer than 31 days: scheduled for last day.
                        </p>
                      </div>
                    )}
                  </div>
                )}
              </div>
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
            disabled={submitting || (step === 0 && (!objective || !prompt))}
            onClick={async () => {
              if (step === STEPS.length - 1) {
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
                  })
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
    </div>
  )
}
