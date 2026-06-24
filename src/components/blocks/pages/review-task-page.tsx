import { useState, useEffect } from 'react'
import { BackButton } from '@/components/ui/back-button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { ScrollArea } from '@/components/ui/scroll-area'
import {
  Clock, Check, X, AlertTriangle, FileText, Users,
  ChevronDown, ChevronRight,
} from 'lucide-react'
import type { Task } from '@/types/task'
import type { TaskExecution, TaskExecutionMessage, TaskExecutionOutput } from '@/types/task-execution'
import { loadExecutions, loadMessages, loadOutputs } from '@/lib/task-executions'
import { supabase } from '@/lib/supabase'
import { useI18n } from '@/hooks/use-i18n'

const STATUS_BADGE: Record<string, string> = {
  backlog: 'border-slate-200 bg-slate-50 text-slate-600',
  'in-progress': 'border-[#2F5D5A]/25 bg-[#2F5D5A]/8 text-[#2F5D5A]',
  'in-review': 'border-[#B7791F]/18 bg-[#FFF8E1] text-[#7A3E14]',
  done: 'border-[#2F5D5A]/25 bg-[#2F5D5A]/15 text-[#2F5D5A]',
  pending: 'border-slate-200 bg-slate-50 text-slate-600',
  running: 'border-[#2F5D5A]/25 bg-[#2F5D5A]/8 text-[#2F5D5A]',
  completed: 'border-[#2F5D5A]/25 bg-[#2F5D5A]/15 text-[#2F5D5A]',
  rejected: 'border-[#A04D1F]/25 bg-[#A04D1F]/8 text-[#A04D1F]',
  failed: 'border-[#A04D1F]/25 bg-[#A04D1F]/8 text-[#A04D1F]',
}

const EXEC_STATUS_ICON: Record<string, typeof Clock> = {
  pending: Clock,
  running: Clock,
  completed: Check,
  rejected: X,
  failed: AlertTriangle,
}

export function ReviewTaskPage({
  taskId,
  onBack,
}: {
  taskId: string
  onBack?: () => void
}) {
  const { t } = useI18n()
  const [task, setTask] = useState<Task | null>(null)
  const [executions, setExecutions] = useState<TaskExecution[]>([])
  const [selectedExec, setSelectedExec] = useState<TaskExecution | null>(null)
  const [messages, setMessages] = useState<TaskExecutionMessage[]>([])
  const [outputs, setOutputs] = useState<TaskExecutionOutput[]>([])
  const [loading, setLoading] = useState(true)
  const [expandedRuns, setExpandedRuns] = useState<Set<string>>(new Set())

  // Load task from Supabase
  useEffect(() => {
    if (!taskId) return
    let cancelled = false
    supabase.from('tasks').select('*').eq('id', taskId).single()
      .then(({ data, error }) => {
        if (!cancelled) {
          if (!error && data) setTask(data as Task)
          setLoading(false)
        }
      })
    return () => { cancelled = true }
  }, [taskId])

  // Load executions
  useEffect(() => {
    if (!taskId) return
    loadExecutions(taskId).then(setExecutions).catch(() => setExecutions([]))
  }, [taskId])

  // Load messages/outputs when execution selected
  useEffect(() => {
    if (!selectedExec) return
    let cancelled = false
    Promise.all([
      loadMessages(selectedExec.id).catch(() => []),
      loadOutputs(selectedExec.id).catch(() => []),
    ]).then(([msgs, outs]) => {
      if (!cancelled) {
        setMessages(msgs)
        setOutputs(outs)
      }
    })
    return () => { cancelled = true }
  }, [selectedExec])

  function toggleRun(execId: string) {
    setExpandedRuns((prev) => {
      const next = new Set(prev)
      if (next.has(execId)) next.delete(execId)
      else next.add(execId)
      return next
    })
    setSelectedExec(executions.find((e) => e.id === execId) ?? null)
  }

  if (loading) {
    return (
      <div className="flex h-full items-center justify-center p-6">
        <p className="text-sm text-muted-foreground">{t('common.loadingData')}</p>
      </div>
    )
  }

  if (!task) {
    return (
      <div className="flex h-full items-center justify-center p-6">
        <p className="text-sm text-muted-foreground">{t('reviewTask.notFound')}</p>
      </div>
    )
  }

  return (
    <div className="flex h-full min-h-0 flex-col gap-4 p-6 animate-app-rise overflow-y-auto">
      {/* Header */}
      <header className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <h1 className="text-lg font-semibold">{task.title}</h1>
          <Badge variant="outline" className={`text-[10px] uppercase ${STATUS_BADGE[task.status] || ''}`}>
            {task.status}
          </Badge>
        </div>
        {onBack && <BackButton onClick={onBack} />}
      </header>

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-3 min-h-0 flex-1">
        {/* Left column: Task info */}
        <div className="space-y-4 lg:col-span-1">
          {/* Identity */}
          <Card className="border-border/80 shadow-sm">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-semibold">{t('reviewTask.identity')}</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-muted-foreground">{t('reviewTask.priorityLabel')}</span>
                <Badge variant="outline" className={`text-[10px] ${
                  task.priority === 'high'
                    ? 'border-[#A04D1F]/25 bg-[#A04D1F]/8 text-[#A04D1F]'
                    : task.priority === 'medium'
                    ? 'border-[#B7791F]/18 bg-[#FFF8E1] text-[#7A3E14]'
                    : 'border-[#2F5D5A]/25 bg-[#2F5D5A]/8 text-[#2F5D5A]'
                }`}>{task.priority}</Badge>
              </div>
              {task.agent_id && (
                <div className="flex justify-between">
                  <span className="text-muted-foreground">{t('reviewTask.agentLabel')}</span>
                  <span className="text-xs font-mono">{task.agent_id}</span>
                </div>
              )}
              {task.flow_id && (
                <div className="flex justify-between">
                  <span className="text-muted-foreground">{t('reviewTask.flowLabel')}</span>
                  <span className="text-xs font-mono">{task.flow_id}</span>
                </div>
              )}
              <div className="flex justify-between">
                <span className="text-muted-foreground">{t('reviewTask.runOrderLabel')}</span>
                <span className="text-xs font-mono">{task.run_order ?? 10}</span>
              </div>
            </CardContent>
          </Card>

          {/* Briefing */}
          <Card className="border-border/80 shadow-sm">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-semibold">{t('reviewTask.briefing')}</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3 text-sm">
              {task.objective && (
                <div>
                  <div className="text-xs font-medium text-muted-foreground uppercase tracking-wide mb-1">{t('reviewTask.objectiveLabel')}</div>
                  <p className="text-sm leading-relaxed">{task.objective}</p>
                </div>
              )}
              {task.prompt && (
                <div>
                  <div className="text-xs font-medium text-muted-foreground uppercase tracking-wide mb-1">{t('reviewTask.promptLabel')}</div>
                  <p className="text-sm whitespace-pre-wrap leading-relaxed text-muted-foreground">{task.prompt}</p>
                </div>
              )}
              {task.documents && task.documents.length > 0 && (
                <div>
                  <div className="text-xs font-medium text-muted-foreground uppercase tracking-wide mb-1">{t('reviewTask.documentsLabel')}</div>
                  <div className="flex flex-wrap gap-1">
                    {task.documents.map((doc, i) => (
                      <Badge key={i} variant="outline" className="text-[10px]">
                        <FileText className="mr-1 h-3 w-3" />
                        {doc}
                      </Badge>
                    ))}
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Team */}
          <Card className="border-border/80 shadow-sm">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-semibold">{t('reviewTask.team')}</CardTitle>
            </CardHeader>
            <CardContent>
              {task.team_members && task.team_members.length > 0 ? (
                <div className="flex flex-wrap gap-1">
                  {task.team_members.map((m, i) => (
                    <Badge key={i} variant="outline" className="text-[10px]">
                      <Users className="mr-1 h-3 w-3" />
                      {m}
                    </Badge>
                  ))}
                </div>
              ) : (
                <p className="text-sm text-muted-foreground">{t('reviewTeam.noTeam')}</p>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Right column: Execution history */}
        <div className="lg:col-span-2 min-h-0 flex-1">
          <Card className="h-full flex flex-col border-border/80 shadow-sm">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-semibold">{t('reviewTask.executionHistory')}</CardTitle>
            </CardHeader>
            <CardContent className="flex-1 min-h-0 overflow-hidden">
              {executions.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-12 text-center">
                  <Clock className="h-8 w-8 text-muted-foreground/40 mb-3" />
                  <p className="text-sm text-muted-foreground">{t('reviewTask.noExecutions')}</p>
                </div>
              ) : (
                <ScrollArea className="h-full">
                  <div className="space-y-2">
                    {executions.map((exec) => {
                      const isExpanded = expandedRuns.has(exec.id)
                      const ExecIcon = EXEC_STATUS_ICON[exec.status] || Clock
                      return (
                        <div key={exec.id} className="rounded-lg border">
                          {/* Run header */}
                          <button
                            onClick={() => toggleRun(exec.id)}
                            className="w-full flex items-center gap-3 p-3 text-left hover:bg-muted/30 transition-colors"
                          >
                            {isExpanded
                              ? <ChevronDown className="h-4 w-4 text-muted-foreground shrink-0" />
                              : <ChevronRight className="h-4 w-4 text-muted-foreground shrink-0" />
                            }
                            <ExecIcon className={`h-4 w-4 shrink-0 ${
                              exec.status === 'completed' ? 'text-[#2F5D5A]' :
                              exec.status === 'rejected' || exec.status === 'failed' ? 'text-[#A04D1F]' :
                              'text-muted-foreground'
                            }`} />
                            <div className="flex-1 min-w-0">
                              <div className="flex items-center gap-2">
                                <span className="text-sm font-medium">
                                  {t('reviewTask.runNumber', { number: executions.length - executions.indexOf(exec) })}
                                </span>
                                <Badge variant="outline" className={`text-[10px] ${STATUS_BADGE[exec.status] || ''}`}>
                                  {exec.status}
                                </Badge>
                              </div>
                              <div className="text-[10px] text-muted-foreground mt-0.5">
                                {new Date(exec.created_at).toLocaleString()}
                                {exec.tokens_used ? ` · ${exec.tokens_used} tokens` : ''}
                              </div>
                            </div>
                          </button>

                          {/* Expanded detail */}
                          {isExpanded && (
                            <div className="border-t p-4 space-y-4">
                              {/* Prompt sent */}
                              <div>
                                <div className="text-[10px] font-medium text-muted-foreground uppercase tracking-wide mb-1">{t('reviewTask.promptSent')}</div>
                                <p className="text-sm whitespace-pre-wrap bg-muted/30 rounded p-3">{exec.prompt_sent}</p>
                              </div>

                              {/* Response received */}
                              {exec.response_received && (
                                <div>
                                  <div className="text-[10px] font-medium text-muted-foreground uppercase tracking-wide mb-1">{t('reviewTask.responseReceived')}</div>
                                  <p className="text-sm whitespace-pre-wrap bg-muted/30 rounded p-3 max-h-60 overflow-y-auto">{exec.response_received}</p>
                                </div>
                              )}

                              {/* Metadata */}
                              <div className="flex flex-wrap gap-4 text-xs text-muted-foreground">
                                {exec.tokens_used != null && (
                                  <span>{t('reviewTask.tokensUsed')}: {exec.tokens_used.toLocaleString()}</span>
                                )}
                                {exec.model && (
                                  <span>{t('reviewTask.model')}: {exec.model}</span>
                                )}
                                {exec.approved_by && (
                                  <span>{t('reviewTask.approvedBy')}: {exec.approved_by.slice(0, 8)}...</span>
                                )}
                                {exec.approved_at && (
                                  <span>{t('reviewTask.approvedAt')}: {new Date(exec.approved_at).toLocaleString()}</span>
                                )}
                                {exec.error && (
                                  <span className="text-[#A04D1F]">Error: {exec.error}</span>
                                )}
                              </div>

                              {/* Messages */}
                              {messages.length > 0 && (
                                <div>
                                  <div className="text-[10px] font-medium text-muted-foreground uppercase tracking-wide mb-2">{t('reviewTask.messages')}</div>
                                  <div className="space-y-2">
                                    {messages.map((msg) => (
                                      <div key={msg.id} className="rounded border bg-muted/20 p-2">
                                        <div className="flex items-center gap-2 mb-1">
                                          <Badge variant="outline" className="text-[9px]">{msg.role}</Badge>
                                          <Badge variant="outline" className="text-[9px]">{msg.kind}</Badge>
                                        </div>
                                        <p className="text-xs whitespace-pre-wrap">{msg.content.slice(0, 500)}{msg.content.length > 500 ? '...' : ''}</p>
                                      </div>
                                    ))}
                                  </div>
                                </div>
                              )}

                              {/* Outputs */}
                              {outputs.length > 0 && (
                                <div>
                                  <div className="text-[10px] font-medium text-muted-foreground uppercase tracking-wide mb-2">{t('reviewTask.output')}</div>
                                  <div className="space-y-2">
                                    {outputs.map((out) => (
                                      <div key={out.id} className="rounded border bg-muted/20 p-2">
                                        <div className="flex items-center gap-2 mb-1">
                                          <Badge variant="outline" className="text-[9px]">{out.output_type}</Badge>
                                          {out.approved && (
                                            <Badge variant="outline" className="text-[9px] border-[#2F5D5A]/25 bg-[#2F5D5A]/8 text-[#2F5D5A]">
                                              <Check className="mr-1 h-2 w-2" />
                                              {t('reviewTask.outputApproved')}
                                            </Badge>
                                          )}
                                        </div>
                                        <p className="text-xs whitespace-pre-wrap">
                                          {out.content_text || JSON.stringify(out.content_json, null, 2) || out.raw_output || ''}
                                        </p>
                                      </div>
                                    ))}
                                  </div>
                                </div>
                              )}
                            </div>
                          )}
                        </div>
                      )
                    })}
                  </div>
                </ScrollArea>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
