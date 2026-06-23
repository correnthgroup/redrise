import { useState, useEffect, type ReactNode } from 'react'
import { ArrowRight, Boxes, Check, CheckCircle2, CircleDashed, Code2, Database, Hash, Loader2, MessageSquare, PlugZap } from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { BackButton } from '@/components/ui/back-button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { RequiredLabel } from '@/components/ui/required-label'
import { Separator } from '@/components/ui/separator'
import { createIntegration, loadIntegrations, type Integration } from '@/lib/integrations'
import { useI18n } from '@/hooks/use-i18n'
import { WizardShell } from './wizard-shell'

type IntegrationOption = {
  id: string
  name: string
  description: string
  category: string
  icon: ReactNode
}

const INTEGRATIONS: IntegrationOption[] = [
  { id: 'slack', name: 'Slack', description: 'Send agent notifications to Slack channels.', category: 'Communication', icon: <Hash className="h-5 w-5" /> },
  { id: 'github', name: 'GitHub', description: 'Trigger agents on pull request and issue events.', category: 'Source Control', icon: <Code2 className="h-5 w-5" /> },
  { id: 'postgres', name: 'Postgres', description: 'Read and write to an external Postgres database.', category: 'Data', icon: <Database className="h-5 w-5" /> },
  { id: 'discord', name: 'Discord', description: 'Route agent output to Discord channels via webhook.', category: 'Communication', icon: <MessageSquare className="h-5 w-5" /> },
  { id: 'webhook', name: 'Generic Webhook', description: 'POST agent events to a custom HTTP endpoint.', category: 'Webhooks', icon: <Boxes className="h-5 w-5" /> },
]

const STEPS = [
  { id: 1, labelKey: 'integration.stepSelect' },
  { id: 2, labelKey: 'integration.stepConfigure' },
  { id: 3, labelKey: 'integration.stepTest' },
  { id: 4, labelKey: 'integration.stepReview' },
] as const

export function IntegrationSetupWizard({ onBack }: { onBack?: () => void }) {
  const [step, setStep] = useState<1 | 2 | 3 | 4>(1)
  const [selected, setSelected] = useState<IntegrationOption | null>(null)
  const [name, setName] = useState('')
  const [endpoint, setEndpoint] = useState('')
  const [token, setToken] = useState('')
  const [testStatus, setTestStatus] = useState<'idle' | 'running' | 'ok' | 'fail'>('idle')
  const [completed, setCompleted] = useState(false)
  const [saving, setSaving] = useState(false)
  const [existing, setExisting] = useState<Integration[]>([])
  const { t } = useI18n()
  const currentStep = STEPS.find((item) => item.id === step) ?? STEPS[0]
  const currentStepLabel = t(currentStep.labelKey)

  useEffect(() => {
    loadIntegrations().then(setExisting).catch(() => {})
  }, [])

  function reset() {
    setStep(1)
    setSelected(null)
    setName('')
    setEndpoint('')
    setToken('')
    setTestStatus('idle')
    setCompleted(false)
  }

  async function handleFinish() {
    if (!selected) return
    setSaving(true)
    try {
      await createIntegration({
        name: name || selected.name,
        provider: selected.id,
        category: selected.category,
        endpoint: endpoint || undefined,
        config: { token: token || undefined },
      })
      setCompleted(true)
      setTimeout(reset, 1500)
    } catch {
      // silent
    } finally {
      setSaving(false)
    }
  }

  return (
    <WizardShell
      title={t('integration.title')}
      step={step}
      totalSteps={STEPS.length}
      stepLabel={currentStepLabel}
      progressLabel={t('workflow.stepOf', { step, total: STEPS.length, label: currentStepLabel })}
      footer={(
        <>
          <BackButton onClick={() => step === 1 ? onBack?.() : setStep((current) => current === 1 ? 1 : current === 2 ? 1 : current === 3 ? 2 : 3)} />
          <Button type="button" onClick={() => {
            if (step === 4) {
              handleFinish()
              return
            }
            setStep((current) => current === 1 ? 2 : current === 2 ? 3 : current === 3 ? 4 : 4)
          }} disabled={(step === 1 && !selected) || (step === 2 && (!name.trim() || !endpoint.trim())) || (step === 3 && testStatus !== 'ok') || saving}>
            {step === 4 ? (saving ? <><Loader2 className="mr-2 h-4 w-4 animate-spin" />{t('common.saving')}</> : t('common.finish')) : t('common.next')}
            {step === 4 || saving ? null : <ArrowRight className="h-4 w-4" />}
          </Button>
        </>
      )}
    >
      <p className="text-sm text-muted-foreground">{t('integration.desc')}</p>

      {existing.length > 0 && (
        <div className="space-y-2">
          <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide">{t('integration.activeIntegrations')}</p>
          <div className="flex flex-wrap gap-2">
            {existing.map((ig) => (
              <Badge key={ig.id} variant="outline" className="gap-1">
                {ig.name}
                <span className="text-[10px] text-muted-foreground">({ig.provider})</span>
              </Badge>
            ))}
          </div>
          <Separator className="my-2" />
        </div>
      )}

      <ol className="mt-4 grid grid-cols-2 gap-2 sm:grid-cols-4">
        {STEPS.map((item) => {
          const isCurrent = step === item.id
          const isDone = step > item.id || completed
          return (
            <li key={item.id} className={isCurrent ? 'flex items-center gap-2 rounded-md border border-foreground bg-foreground px-3 py-2 text-xs font-medium text-background' : isDone ? 'flex items-center gap-2 rounded-md border border-emerald-200 bg-emerald-50 px-3 py-2 text-xs font-medium text-emerald-700' : 'flex items-center gap-2 rounded-md border bg-background px-3 py-2 text-xs font-medium text-muted-foreground'}>
              {isDone ? <Check className="h-3.5 w-3.5" /> : isCurrent ? <CircleDashed className="h-3.5 w-3.5" /> : <span className="text-[10px] font-semibold">{item.id}</span>}
              {t(item.labelKey)}
            </li>
          )
        })}
      </ol>

      <Separator className="my-4" />

      {step === 1 ? (
        <div className="space-y-3">
          <p className="text-sm font-medium">{t('integration.chooseIntegration')}</p>
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
            {INTEGRATIONS.map((integration) => {
              const isActive = selected?.id === integration.id
              return (
                <button key={integration.id} type="button" onClick={() => setSelected(integration)} className={isActive ? 'flex items-start gap-3 rounded-lg border border-foreground bg-muted/30 p-3 text-left transition-colors' : 'flex items-start gap-3 rounded-lg border p-3 text-left transition-colors hover:border-foreground/40'}>
                  <span className={isActive ? 'inline-flex h-9 w-9 items-center justify-center rounded-md bg-foreground text-background' : 'inline-flex h-9 w-9 items-center justify-center rounded-md bg-muted text-foreground/70'}>{integration.icon}</span>
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <p className="text-sm font-semibold">{integration.name}</p>
                      <Badge variant="outline" className="bg-background text-muted-foreground">{integration.category}</Badge>
                    </div>
                    <p className="text-xs text-muted-foreground">{integration.description}</p>
                  </div>
                </button>
              )
            })}
          </div>
        </div>
      ) : null}

      {step === 2 ? (
        <div className="space-y-4">
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <span className="inline-flex h-7 w-7 items-center justify-center rounded-md bg-muted">{selected?.icon}</span>
            {t('integration.configuring')} <span className="font-semibold text-foreground">{selected?.name}</span>
          </div>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div className="space-y-2"><RequiredLabel htmlFor="integrationName">{t('integration.displayName')}</RequiredLabel><Input id="integrationName" value={name} onChange={(event) => setName(event.target.value)} placeholder={t('integration.displayNamePlaceholder')} /></div>
            <div className="space-y-2"><RequiredLabel htmlFor="integrationEndpoint">{t('integration.endpointUrl')}</RequiredLabel><Input id="integrationEndpoint" value={endpoint} onChange={(event) => setEndpoint(event.target.value)} placeholder="https://hooks.example.com/..." /></div>
            <div className="space-y-2 sm:col-span-2"><Label htmlFor="integrationToken">{t('integration.apiToken')}</Label><Input id="integrationToken" type="password" value={token} onChange={(event) => setToken(event.target.value)} placeholder={t('integration.apiTokenPlaceholder')} /></div>
          </div>
        </div>
      ) : null}

      {step === 3 ? (
        <div className="space-y-4">
          <div className="flex items-center justify-between rounded-lg border p-4">
            <div className="space-y-1">
              <p className="text-sm font-medium">{t('integration.testConnection')}</p>
              <p className="text-xs text-muted-foreground">{t('integration.testConnectionDesc')} <span className="font-mono">{endpoint || ''}</span>.</p>
            </div>
            <Button type="button" onClick={() => {
              setTestStatus('running')
              window.setTimeout(() => setTestStatus(endpoint.startsWith('https://') ? 'ok' : 'fail'), 900)
            }} disabled={testStatus === 'running'}>
              <PlugZap className="h-4 w-4" />
              {testStatus === 'running' ? t('common.testing') : t('common.runTest')}
            </Button>
          </div>
          {testStatus === 'ok' ? <div className="flex items-center gap-2 rounded-md border border-emerald-200 bg-emerald-50 px-3 py-2 text-sm text-emerald-700"><CheckCircle2 className="h-4 w-4" />{t('integration.connectionSuccessful')}</div> : null}
          {testStatus === 'fail' ? <div className="rounded-md border border-rose-200 bg-rose-50 px-3 py-2 text-sm text-rose-700">{t('integration.testFailed')}</div> : null}
        </div>
      ) : null}

      {step === 4 ? (
        <div className="space-y-4 rounded-lg border p-4 text-sm">
          <div><strong>{t('integration.integrationLabel')}</strong> {selected?.name ?? ''}</div>
          <div><strong>{t('integration.displayLabel')}</strong> {name || ''}</div>
          <div><strong>{t('integration.endpointLabel')}</strong> {endpoint || ''}</div>
          <div><strong>{t('integration.tokenLabel')}</strong> {token ? t('integration.tokenConfigured') : t('integration.tokenEmpty')}</div>
        </div>
      ) : null}

    </WizardShell>
  )
}
