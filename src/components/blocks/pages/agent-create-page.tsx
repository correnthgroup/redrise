import { useState } from 'react'
import { AlertCircle, CheckCircle2, KeyRound, Loader2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { BackButton } from '@/components/ui/back-button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { RequiredLabel } from '@/components/ui/required-label'
import type { CreateAgentInput } from '@/types/agent'
import { useI18n } from '@/hooks/use-i18n'
import { WizardShell } from '../shared/wizard-shell'
import { createIntegration } from '@/lib/integrations'
import { testAgentProviderConnection, type AgentProviderAuthMethod, type AgentProviderId } from '@/lib/agent-providers'

const STEP_KEYS = ['agentCreate.basicInfo', 'agentCreate.connection', 'agentCreate.test', 'agentCreate.review'] as const

const PROVIDERS: Array<{ id: AgentProviderId; name: string; model: string; tone: string }> = [
  { id: 'openai', name: 'OpenAI', model: 'openai/gpt-4o-mini', tone: 'bg-black text-white' },
  { id: 'anthropic', name: 'Anthropic', model: 'anthropic/claude-3-5-sonnet-latest', tone: 'bg-[#D9C5A5] text-[#2B2118]' },
  { id: 'google', name: 'Google', model: 'google/gemini-1.5-pro', tone: 'bg-blue-600 text-white' },
  { id: 'openrouter', name: 'OpenRouter', model: 'openai/gpt-oss-120b:free', tone: 'bg-[#2F5D5A] text-white' },
]

const OPENAI_METHODS: Array<{ id: AgentProviderAuthMethod; labelKey: string; descriptionKey: string }> = [
  { id: 'chatgpt_browser', labelKey: 'agentCreate.openaiBrowser', descriptionKey: 'agentCreate.openaiBrowserDesc' },
  { id: 'chatgpt_headless', labelKey: 'agentCreate.openaiHeadless', descriptionKey: 'agentCreate.openaiHeadlessDesc' },
  { id: 'api', labelKey: 'agentCreate.openaiApi', descriptionKey: 'agentCreate.openaiApiDesc' },
]

function ProviderMark({ provider, tone }: { provider: AgentProviderId; tone: string }) {
  const label = provider === 'openrouter' ? 'OR' : provider === 'anthropic' ? 'A' : provider === 'google' ? 'G' : 'AI'
  return <span className={`flex h-8 w-8 items-center justify-center rounded-full text-xs font-semibold ${tone}`}>{label}</span>
}

export function AgentCreatePage({
  ownerUserId = '',
  onBack,
  onCreate,
}: {
  ownerUserId?: string
  onBack?: () => void
  onCreate?: (input: CreateAgentInput) => Promise<{ id: string } | null>
}) {
  const [step, setStep] = useState(0)
  const [name, setName] = useState('')
  const [provider, setProvider] = useState<AgentProviderId>('openrouter')
  const [authMethod, setAuthMethod] = useState<AgentProviderAuthMethod>('api')
  const [apiKey, setApiKey] = useState('')
  const [testStatus, setTestStatus] = useState<'idle' | 'running' | 'success' | 'error'>('idle')
  const [testMessage, setTestMessage] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const { t } = useI18n()
  const currentStepLabel = t(STEP_KEYS[step])
  const selectedProvider = PROVIDERS.find((item) => item.id === provider) ?? PROVIDERS[3]
  const requiresApiKey = provider !== 'openai' || authMethod === 'api'
  const canContinue = step === 0 ? name.trim().length > 0 && !!provider : step === 1 ? !requiresApiKey || apiKey.trim().length > 0 : step === 2 ? testStatus === 'success' : true

  function selectProvider(nextProvider: AgentProviderId) {
    setProvider(nextProvider)
    setAuthMethod('api')
    setApiKey('')
    setTestStatus('idle')
    setTestMessage(null)
  }

  async function runConnectionTest() {
    setTestStatus('running')
    setTestMessage(null)
    setError(null)
    try {
      const result = await testAgentProviderConnection({ provider, authMethod, apiKey: apiKey.trim() })
      setTestStatus(result.ok ? 'success' : 'error')
      setTestMessage(result.message)
    } catch {
      setTestStatus('error')
      setTestMessage(t('agentCreate.testFailed'))
    }
  }

  async function handleFinish() {
    if (!onCreate || testStatus !== 'success') return
    setLoading(true)
    setError(null)
    try {
      const integration = await createIntegration({
        name: `${selectedProvider.name} Agent Provider`,
        provider,
        category: 'agent_provider',
        ownerUserId,
        config: {
          auth_method: authMethod,
          token: requiresApiKey ? apiKey.trim() : undefined,
        },
        status: 'active',
      })
      const result = await onCreate({
        name: name.trim(),
        brief: '',
        model: selectedProvider.model,
        provider,
        ownerUserId,
        providerConnectionId: integration.id,
        providerAuthMethod: authMethod,
        providerConnectionStatus: 'connected',
      })
      if (result) onBack?.()
      else setError(t('agentCreate.createError'))
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
      contentClassName="space-y-4"
      footer={(
        <>
          <BackButton onClick={step === 0 ? onBack : () => setStep((s) => s - 1)} />
          <div className="ml-auto flex gap-2">
            {step === 2 ? <Button type="button" variant="outline" disabled={testStatus === 'running' || (requiresApiKey && !apiKey.trim())} onClick={runConnectionTest}>{testStatus === 'running' ? <Loader2 className="h-4 w-4 animate-spin" /> : <KeyRound className="h-4 w-4" />}{testStatus === 'running' ? t('agentCreate.testing') : t('agentCreate.testConnection')}</Button> : null}
            <Button
              disabled={loading || !canContinue}
              onClick={() => {
                if (step === STEP_KEYS.length - 1) void handleFinish()
                else setStep((s) => Math.min(STEP_KEYS.length - 1, s + 1))
              }}
            >
              {loading ? <><Loader2 className="h-4 w-4 animate-spin" />{t('common.updating')}</> : step === STEP_KEYS.length - 1 ? t('common.finish') : t('common.next')}
            </Button>
          </div>
        </>
      )}
    >
      {error ? <div className="rounded-md bg-destructive/10 p-3 text-sm text-destructive">{error}</div> : null}

      {step === 0 ? (
        <>
          <div className="space-y-1">
            <RequiredLabel htmlFor="agent-name">{t('agentCreate.name')}</RequiredLabel>
            <Input id="agent-name" value={name} onChange={(event) => setName(event.target.value)} placeholder={t('agentCreate.namePlaceholder')} />
          </div>
          <div className="space-y-2">
            <Label>{t('agentCreate.provider')}</Label>
            <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
              {PROVIDERS.map((item) => (
                <button key={item.id} type="button" onClick={() => selectProvider(item.id)} className={`flex items-center gap-3 rounded-xl border p-3 text-left transition-colors ${provider === item.id ? 'border-primary bg-primary/5 ring-1 ring-primary/25' : 'hover:border-primary/35 hover:bg-muted/40'}`}>
                  <ProviderMark provider={item.id} tone={item.tone} />
                  <span className="font-medium">{item.name}</span>
                </button>
              ))}
            </div>
          </div>
        </>
      ) : null}

      {step === 1 ? (
        <div className="space-y-4">
          <div className="rounded-lg border bg-muted/35 p-3 text-sm">
            <div className="flex items-center gap-2 font-medium"><ProviderMark provider={provider} tone={selectedProvider.tone} />{selectedProvider.name}</div>
            <p className="mt-2 text-muted-foreground">{t('agentCreate.connectionDesc')}</p>
          </div>
          {provider === 'openai' ? (
            <div className="space-y-2">
              <Label>{t('agentCreate.openaiMethod')}</Label>
              {OPENAI_METHODS.map((method) => (
                <button key={method.id} type="button" onClick={() => { setAuthMethod(method.id); setTestStatus('idle'); setTestMessage(null) }} className={`w-full rounded-lg border p-3 text-left text-sm transition-colors ${authMethod === method.id ? 'border-primary bg-primary/5 ring-1 ring-primary/25' : 'hover:bg-muted/40'}`}>
                  <span className="font-medium">{t(method.labelKey)}</span>
                  <span className="mt-1 block text-xs text-muted-foreground">{t(method.descriptionKey)}</span>
                </button>
              ))}
            </div>
          ) : null}
          {requiresApiKey ? (
            <div className="space-y-1">
              <RequiredLabel htmlFor="agent-provider-api-key">{t('agentCreate.apiKey')}</RequiredLabel>
              <Input id="agent-provider-api-key" type="password" value={apiKey} onChange={(event) => { setApiKey(event.target.value); setTestStatus('idle'); setTestMessage(null) }} placeholder={t('agentCreate.apiKeyPlaceholder')} autoComplete="off" />
            </div>
          ) : (
            <div className="rounded-lg border border-[#2F5D5A]/20 bg-[#2F5D5A]/8 p-3 text-sm text-[#2F5D5A]">{t('agentCreate.runtimeProfileHint')}</div>
          )}
        </div>
      ) : null}

      {step === 2 ? (
        <div className="space-y-3 rounded-lg border bg-muted/30 p-4 text-sm">
          <p className="text-muted-foreground">{t('agentCreate.testDesc')}</p>
          {testStatus === 'success' ? <div className="flex items-center gap-2 text-[#2F5D5A]"><CheckCircle2 className="h-4 w-4" />{testMessage}</div> : null}
          {testStatus === 'error' ? <div className="flex items-center gap-2 text-destructive"><AlertCircle className="h-4 w-4" />{testMessage}</div> : null}
          {testStatus === 'idle' ? <div className="text-muted-foreground">{t('agentCreate.testWaiting')}</div> : null}
        </div>
      ) : null}

      {step === 3 ? (
        <div className="space-y-2 rounded-lg border bg-muted/35 p-4 text-sm">
          <div><strong>{t('agentCreate.name')}:</strong> {name || t('workflow.empty')}</div>
          <div><strong>{t('agentCreate.provider')}:</strong> {selectedProvider.name}</div>
          <div><strong>{t('agentCreate.connectionMethod')}:</strong> {authMethod}</div>
          <div><strong>{t('agentCreate.model')}:</strong> {selectedProvider.model}</div>
          <div><strong>{t('agentCreate.connectionStatus')}:</strong> {testStatus === 'success' ? t('agentCreate.connected') : t('agentCreate.notConnected')}</div>
        </div>
      ) : null}
    </WizardShell>
  )
}
