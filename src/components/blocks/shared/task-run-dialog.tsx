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
import { Loader2, Check, X, AlertTriangle, Send } from 'lucide-react'
import type { Task } from '@/types/task'
import type { Agent } from '@/types/agent'
import type { TaskExecution } from '@/types/task-execution'
import { chatCompletion, type ChatMessage } from '@/lib/ai-client'
import { createExecution, completeExecution, rejectExecution, failExecution } from '@/lib/task-executions'
import { useI18n } from '@/hooks/use-i18n'

type RunStep = 'preview' | 'running' | 'response' | 'done'

export function TaskRunDialog({
  task,
  agent,
  open,
  onOpenChange,
  onComplete,
}: {
  task: Task
  agent: Agent | null
  open: boolean
  onOpenChange: (open: boolean) => void
  onComplete?: () => void
}) {
  const [step, setStep] = useState<RunStep>('preview')
  const [execution, setExecution] = useState<TaskExecution | null>(null)
  const [response, setResponse] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [tokensUsed, setTokensUsed] = useState<number | null>(null)
  const { t } = useI18n()

  // Reset state when dialog opens
  const [prevOpen, setPrevOpen] = useState(open)
  if (open && !prevOpen) {
    setStep('preview')
    setExecution(null)
    setResponse('')
    setError(null)
    setTokensUsed(null)
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

      // Build messages
      const messages: ChatMessage[] = []

      if (task.objective) {
        messages.push({
          role: 'system',
          content: `Objective: ${task.objective}`,
        })
      }

      messages.push({
        role: 'user',
        content: task.prompt || task.objective,
      })

      // Call AI
      const result = await chatCompletion(messages, agent?.model)

      const aiResponse = result.choices?.[0]?.message?.content || 'No response received.'
      const tokens = result.usage?.total_tokens || 0

      setResponse(aiResponse)
      setTokensUsed(tokens)

      // Update execution
      await completeExecution(exec.id, aiResponse, tokens)

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

  function handleApprove() {
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
                {t('taskRun.sendingPrompt', { model: agent?.model || 'AI model' })}
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
                <div className="rounded-lg border bg-muted/20 p-4">
                  <div className="text-xs font-medium text-muted-foreground uppercase tracking-wide mb-2">{t('taskRun.aiResponse')}</div>
                  <div className="text-sm whitespace-pre-wrap leading-relaxed">{response}</div>
                </div>

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
