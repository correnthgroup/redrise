import { useState } from 'react'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Loader2, Check, X, AlertTriangle, Send, Link2 } from 'lucide-react'
import type { Task } from '@/types/task'
import type { Agent } from '@/types/agent'
import type { TaskExecution } from '@/types/task-execution'
import { taskExecute } from '@/lib/ai-client'
import {
  createExecution,
  completeExecution,
  rejectExecution,
  failExecution,
  approveExecution,
  addMessage,
  addOutput,
  loadOutputs,
  approveOutput,
  resolveUpstreamContext,
} from '@/lib/task-executions'
import { useI18n } from '@/hooks/use-i18n'

type RunStep = 'preview' | 'running' | 'response' | 'done'

export function TaskRunDialog({
  task,
  agent,
  open,
  onOpenChange,
  onComplete,
  language = 'en-US',
}: {
  task: Task
  agent: Agent | null
  open: boolean
  onOpenChange: (open: boolean) => void
  onComplete?: () => void
  language?: string
}) {
  const [step, setStep] = useState<RunStep>('preview')
  const [execution, setExecution] = useState<TaskExecution | null>(null)
  const [response, setResponse] = useState('')
  const [parsedOutput, setParsedOutput] = useState<Record<string, unknown> | null>(null)
  const [parseError, setParseError] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [tokensUsed, setTokensUsed] = useState<number | null>(null)
  const [hasUpstream, setHasUpstream] = useState(false)
  const { t } = useI18n()

  // Reset state when dialog opens
  const [prevOpen, setPrevOpen] = useState(open)
  if (open && !prevOpen) {
    setStep('preview')
    setExecution(null)
    setResponse('')
    setParsedOutput(null)
    setParseError(null)
    setError(null)
    setTokensUsed(null)
    setHasUpstream(false)
    setPrevOpen(true)
  } else if (!open && prevOpen) {
    setPrevOpen(false)
  }

  async function handleRun() {
    if (!task.prompt && !task.objective) {
      setError(t('taskRun.noPromptOrObjective'))
      return
    }

    setStep('running')
    setError(null)

    try {
      // Create execution record
      const exec = await createExecution(
        task.id,
        task.agent_id || agent?.id || null,
        task.prompt || task.objective,
        agent?.model || 'openai/gpt-oss-120b:free',
      )
      setExecution(exec)

      // Persist system message
      await addMessage(exec.id, 0, 'system', 'system', `Task: ${task.title}\nObjective: ${task.objective || 'N/A'}`)

      // Resolve upstream context
      const upstreamContext = await resolveUpstreamContext(task.id)
      setHasUpstream(!!upstreamContext)

      if (upstreamContext) {
        await addMessage(exec.id, 1, 'context', 'context', upstreamContext)
      }

      // Persist user prompt
      const userPrompt = task.prompt || task.objective
      await addMessage(exec.id, upstreamContext ? 2 : 1, 'user', 'prompt', userPrompt)

      // Call structured task execution
      const result = await taskExecute(
        task.objective,
        userPrompt,
        upstreamContext,
        agent?.model,
        language,
      )

      setResponse(result.raw_output)
      setTokensUsed(result.tokens_used)
      setParsedOutput(result.parsed_output)
      setParseError(result.parse_error)

      // Persist assistant response
      const seq = upstreamContext ? 3 : 2
      await addMessage(exec.id, seq, 'assistant', 'response', result.raw_output)

      // Persist structured output if parsed successfully
      if (result.parsed_output) {
        await addOutput(
          exec.id,
          'json',
          result.parsed_output.final_answer as string || result.raw_output,
          result.parsed_output,
          result.raw_output,
        )
      } else {
        // Save as text output even if parsing failed
        await addOutput(exec.id, 'text', result.raw_output, null, result.raw_output)
      }

      // Update execution
      await completeExecution(exec.id, result.raw_output, result.tokens_used)

      setStep('response')
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'Unknown error occurred'
      setError(msg)

      if (execution) {
        await failExecution(execution.id, msg).catch(() => {})
      }

      setStep('response')
    }
  }

  async function handleApprove() {
    if (execution) {
      await approveExecution(execution.id).catch(() => {})
      // Approve the output
      const outputs = await loadOutputs(execution.id).catch(() => [])
      if (outputs.length > 0) {
        await approveOutput(outputs[outputs.length - 1].id).catch(() => {})
      }
    }
    setStep('done')
    onOpenChange(false)
    onComplete?.()
  }

  function handleReject() {
    if (execution) {
      rejectExecution(execution.id).catch(() => {})
    }
    setStep('done')
    onOpenChange(false)
    onComplete?.()
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[85vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Send className="h-4 w-4 text-[#A04D1F]" />
            {t('taskRun.runTask', { title: task.title })}
          </DialogTitle>
        </DialogHeader>

        {/* Step: Preview */}
        {step === 'preview' && (
          <div className="space-y-4">
            <div className="rounded-lg border bg-muted/20 p-4 space-y-3">
              <div>
                <div className="text-xs font-medium text-muted-foreground uppercase tracking-wide mb-1">{t('taskRun.objective')}</div>
                <p className="text-sm">{task.objective || t('taskRun.noObjective')}</p>
              </div>
              <div>
                <div className="text-xs font-medium text-muted-foreground uppercase tracking-wide mb-1">{t('taskRun.prompt')}</div>
                <p className="text-sm whitespace-pre-wrap">{task.prompt || t('taskRun.noPrompt')}</p>
              </div>
              {agent && (
                <div>
                  <div className="text-xs font-medium text-muted-foreground uppercase tracking-wide mb-1">{t('taskRun.agent')}</div>
                  <div className="flex items-center gap-2">
                    <Badge variant="outline" className="text-[10px]">{agent.name}</Badge>
                    <span className="text-xs text-muted-foreground">{t('taskRun.model', { model: agent.model })}</span>
                  </div>
                </div>
              )}
              <div>
                <div className="text-xs font-medium text-muted-foreground uppercase tracking-wide mb-1">{t('taskRun.priority')}</div>
                <Badge
                  variant="outline"
                  className={`text-[10px] ${
                    task.priority === 'high'
                      ? 'border-[#A04D1F]/25 bg-[#A04D1F]/8 text-[#A04D1F]'
                      : task.priority === 'medium'
                      ? 'border-[#B7791F]/18 bg-[#FFF8E1] text-[#7A3E14]'
                      : 'border-[#2F5D5A]/25 bg-[#2F5D5A]/8 text-[#2F5D5A]'
                  }`}
                >
                  {task.priority}
                </Badge>
              </div>
            </div>

            <div className="rounded-lg border border-[#B7791F]/25 bg-[#FFF8E1] p-3 flex items-start gap-2">
              <AlertTriangle className="h-4 w-4 text-[#7A3E14] shrink-0 mt-0.5" />
              <div className="text-sm text-[#7A3E14]">
                <p className="font-medium">{t('taskRun.humanInTheLoop')}</p>
                <p className="text-xs mt-1">
                  {t('taskRun.humanInTheLoopDesc')}
                </p>
              </div>
            </div>

            <DialogFooter>
              <Button variant="outline" onClick={() => onOpenChange(false)}>
                {t('common.cancel')}
              </Button>
              <Button
                onClick={handleRun}
                className="bg-[#A04D1F] hover:bg-[#A04D1F]/90"
                disabled={!task.prompt && !task.objective}
              >
                <Send className="mr-2 h-4 w-4" />
                {t('taskRun.sendToAi')}
              </Button>
            </DialogFooter>
          </div>
        )}

        {/* Step: Running */}
        {step === 'running' && (
          <div className="flex flex-col items-center justify-center py-12 space-y-4">
            <Loader2 className="h-8 w-8 animate-spin text-[#A04D1F]" />
            <div className="text-center">
              <p className="text-sm font-medium">{t('taskRun.processing')}</p>
              <p className="text-xs text-muted-foreground mt-1">
                {hasUpstream
                  ? t('taskRun.resolvingUpstream')
                  : t('taskRun.sendingPrompt', { model: agent?.model || 'AI model' })}
              </p>
            </div>
          </div>
        )}

        {/* Step: Response */}
        {step === 'response' && (
          <div className="space-y-4">
            {error ? (
              <div className="rounded-lg border border-[#A04D1F]/25 bg-[#A04D1F]/5 p-4">
                <div className="flex items-center gap-2 text-[#A04D1F] mb-2">
                  <AlertTriangle className="h-4 w-4" />
                  <span className="font-medium text-sm">{t('taskRun.error')}</span>
                </div>
                <p className="text-sm text-[#A04D1F]/80">{error}</p>
              </div>
            ) : (
              <div className="space-y-3">
                {/* Structured output display */}
                {parsedOutput && (
                  <div className="rounded-lg border border-[#2F5D5A]/25 bg-[#2F5D5A]/5 p-4 space-y-3">
                    <div className="flex items-center gap-2 text-[#2F5D5A]">
                      <Check className="h-4 w-4" />
                      <span className="text-sm font-medium">{t('taskRun.structuredOutput')}</span>
                    </div>
                    {typeof parsedOutput.decision_summary === 'string' && (
                      <div>
                        <div className="text-[10px] font-medium text-muted-foreground uppercase tracking-wide mb-1">{t('taskRun.decisionSummary')}</div>
                        <p className="text-sm">{parsedOutput.decision_summary}</p>
                      </div>
                    )}
                    {typeof parsedOutput.confidence === 'number' && (
                      <div className="flex items-center gap-2">
                        <span className="text-[10px] font-medium text-muted-foreground uppercase tracking-wide">{t('taskRun.confidence')}</span>
                        <Badge variant="outline" className={`text-[10px] ${
                          parsedOutput.confidence >= 0.8
                            ? 'border-[#2F5D5A]/25 bg-[#2F5D5A]/8 text-[#2F5D5A]'
                            : parsedOutput.confidence >= 0.5
                            ? 'border-[#B7791F]/18 bg-[#FFF8E1] text-[#7A3E14]'
                            : 'border-[#A04D1F]/25 bg-[#A04D1F]/8 text-[#A04D1F]'
                        }`}>
                          {Math.round(parsedOutput.confidence * 100)}%
                        </Badge>
                      </div>
                    )}
                  </div>
                )}

                {parseError && (
                  <div className="rounded-lg border border-[#B7791F]/25 bg-[#FFF8E1] p-3 text-xs text-[#7A3E14]">
                    {t('taskRun.parseNote')}: {parseError}
                  </div>
                )}

                {/* Raw response */}
                <div className="rounded-lg border bg-muted/20 p-4">
                  <div className="text-xs font-medium text-muted-foreground uppercase tracking-wide mb-2">{t('taskRun.aiResponse')}</div>
                  {parsedOutput?.final_answer ? (
                    <div className="space-y-2">
                      <p className="text-sm whitespace-pre-wrap leading-relaxed font-medium">{String(parsedOutput.final_answer)}</p>
                      {typeof parsedOutput.steps_summary === 'object' && Array.isArray(parsedOutput.steps_summary) && parsedOutput.steps_summary.length > 0 && (
                        <div className="mt-3">
                          <div className="text-[10px] font-medium text-muted-foreground uppercase tracking-wide mb-1">{t('taskRun.stepsSummary')}</div>
                          <ul className="list-decimal pl-4 space-y-1 text-sm text-muted-foreground">
                            {(parsedOutput.steps_summary as string[]).map((step, i) => (
                              <li key={i}>{step}</li>
                            ))}
                          </ul>
                        </div>
                      )}
                      {typeof parsedOutput.handoff_notes === 'string' && parsedOutput.handoff_notes && (
                        <div className="mt-3">
                          <div className="text-[10px] font-medium text-muted-foreground uppercase tracking-wide mb-1">{t('taskRun.handoffNotes')}</div>
                          <p className="text-sm text-muted-foreground">{parsedOutput.handoff_notes}</p>
                        </div>
                      )}
                    </div>
                  ) : (
                    <div className="text-sm whitespace-pre-wrap leading-relaxed">{response}</div>
                  )}
                </div>

                {/* Upstream context indicator */}
                {hasUpstream && (
                  <div className="flex items-center gap-2 text-xs text-muted-foreground">
                    <Link2 className="h-3 w-3" />
                    <span>{t('taskRun.usedUpstreamContext')}</span>
                  </div>
                )}

                <div className="flex items-center gap-4 text-xs text-muted-foreground">
                  {tokensUsed != null && tokensUsed > 0 && (
                    <span>{t('taskRun.tokensUsed', { count: tokensUsed.toLocaleString() })}</span>
                  )}
                  {execution?.model && (
                    <span>{t('taskRun.model', { model: execution.model })}</span>
                  )}
                </div>
              </div>
            )}

            <DialogFooter>
              <Button variant="outline" onClick={handleReject}>
                <X className="mr-2 h-4 w-4" />
                {t('taskRun.reject')}
              </Button>
              <Button
                onClick={handleApprove}
                className="bg-[#2F5D5A] hover:bg-[#2F5D5A]/90"
                disabled={!!error}
              >
                <Check className="mr-2 h-4 w-4" />
                {t('taskRun.approve')}
              </Button>
            </DialogFooter>
          </div>
        )}
      </DialogContent>
    </Dialog>
  )
}
