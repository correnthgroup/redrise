import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { BackButton } from '@/components/ui/back-button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import type { CreateAgentInput } from '@/types/agent'
import { useI18n } from '@/hooks/use-i18n'
import { WizardShell } from '../shared/wizard-shell'

const STEP_KEYS = ['agentCreate.basicInfo', 'agentCreate.capabilities', 'agentCreate.limits', 'agentCreate.review'] as const

export function AgentCreatePage({
  onBack,
  onCreate,
}: {
  onBack?: () => void
  onCreate?: (input: CreateAgentInput) => Promise<{ id: string } | null>
}) {
  const [step, setStep] = useState(0)
  const [name, setName] = useState('')
  const [brief, setBrief] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const { t } = useI18n()
  const currentStepLabel = t(STEP_KEYS[step])

  async function handleFinish() {
    if (!onCreate) return
    setLoading(true)
    setError(null)
    try {
      const result = await onCreate({ name, brief })
      if (result) {
        onBack?.()
      } else {
        setError(t('agentCreate.createError'))
      }
    } catch {
      setError(t('agentCreate.unexpectedError'))
    } finally {
      setLoading(false)
    }
  }

  return (
    <WizardShell
      testId="agent-create-page"
      title={t('agentCreate.title')}
      step={step + 1}
      totalSteps={STEP_KEYS.length}
      stepLabel={currentStepLabel}
      progressLabel={t('agentCreate.stepOf', { step: step + 1, total: STEP_KEYS.length, label: currentStepLabel })}
      contentClassName="space-y-3"
      footer={(
        <>
          <BackButton onClick={step === 0 ? onBack : () => setStep((s) => s - 1)} />
          <div className="ml-auto flex gap-2">
            <Button
              disabled={loading}
              onClick={() => {
                if (step === STEP_KEYS.length - 1) {
                  handleFinish()
                } else {
                  setStep((s) => Math.min(STEP_KEYS.length - 1, s + 1))
                }
              }}
            >
              {loading ? t('common.creating') : step === STEP_KEYS.length - 1 ? t('common.finish') : t('common.next')}
            </Button>
          </div>
        </>
      )}
    >
          {error && (
            <div className="rounded-md bg-destructive/10 p-3 text-sm text-destructive">{error}</div>
          )}
          {step === 0 && (
            <>
              <div className="space-y-1">
                <Label htmlFor="agent-name">{t('agentCreate.name')}</Label>
                <Input id="agent-name" value={name} onChange={(e) => setName(e.target.value)} placeholder={t('agentCreate.namePlaceholder')} />
              </div>
              <div className="space-y-1">
                <Label htmlFor="agent-brief">{t('agentCreate.brief')}</Label>
                <Textarea id="agent-brief" value={brief} onChange={(e) => setBrief(e.target.value)} placeholder={t('agentCreate.briefPlaceholder')} />
              </div>
            </>
          )}
          {step === 1 && <div className="rounded-lg border bg-[#2F5D5A]/6 p-4 text-sm text-muted-foreground">{t('agentCreate.capabilitiesHint')}</div>}
          {step === 2 && <div className="rounded-lg border bg-muted/40 p-4 text-sm text-muted-foreground">{t('agentCreate.limitsHint')}</div>}
          {step === 3 && (
            <div className="space-y-2 rounded-lg border bg-muted/35 p-4 text-sm">
              <div><strong>{t('agentCreate.name')}:</strong> {name || t('workflow.empty')}</div>
              <div><strong>{t('agentCreate.brief')}:</strong> {brief || t('workflow.empty')}</div>
              <div><strong>{t('agentCreate.model')}:</strong> openai/gpt-oss-120b:free</div>
              <div><strong>{t('agentCreate.provider')}:</strong> openrouter</div>
            </div>
          )}
    </WizardShell>
  )
}
