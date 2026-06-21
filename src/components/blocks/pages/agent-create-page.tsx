import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Progress } from '@/components/ui/progress'
import { Textarea } from '@/components/ui/textarea'
import type { CreateAgentInput } from '@/types/agent'
import { useI18n } from '@/hooks/use-i18n'

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
    <div data-testid="agent-create-page" className="mx-auto flex h-full max-w-3xl flex-col gap-4 p-6 animate-app-rise">
      <header>
        <h1 className="text-lg font-semibold">{t('agentCreate.title')}</h1>
        <p className="text-sm text-muted-foreground">{t('agentCreate.stepOf', { step: step + 1, total: STEP_KEYS.length, label: t(STEP_KEYS[step]) })}</p>
      </header>
      <Progress value={((step + 1) / STEP_KEYS.length) * 100} />

      <Card className="flex-1 border-border/80 shadow-[0_1px_2px_rgba(16,24,40,0.04),0_10px_24px_rgba(16,24,40,0.06)]">
        <CardHeader><CardTitle className="text-sm font-semibold">{t(STEP_KEYS[step])}</CardTitle></CardHeader>
        <CardContent className="space-y-3">
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
        </CardContent>
      </Card>

      <footer className="flex justify-between">
        <Button variant="ghost" onClick={step === 0 ? onBack : () => setStep((s) => s - 1)}>{t('common.back')}</Button>
        <div className="flex gap-2 ml-auto">
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
      </footer>
    </div>
  )
}
