import { useState, useEffect, type ReactNode } from 'react'
import { ArrowRight, Boxes, Check, CheckCircle2, CircleDashed, Code2, Database, Hash, Loader2, MessageSquare, PlugZap } from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { BackButton } from '@/components/ui/back-button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { RequiredLabel } from '@/components/ui/required-label'
import { Separator } from '@/components/ui/separator'
import { createIntegration, deleteIntegrationSetup, loadIntegrationSetupDetail, loadIntegrationSetupOverview, rotateIntegrationSetupSecret, updateIntegrationSetupStatus, type IntegrationSetupDetail, type IntegrationSetupSummary } from '@/lib/integrations'
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
  { id: 'integration_gateway', name: 'Integration Gateway', description: 'Execute tasks through a configured HTTPS integration adapter.', category: 'Execution', icon: <PlugZap className="h-5 w-5" /> },
  { id: 'rise_insider_terminal', name: 'Rise Insider Terminal', description: 'Send terminal execution requests to a paired Rise Insider runtime.', category: 'Execution', icon: <Code2 className="h-5 w-5" /> },
  { id: 'rise_insider_filesystem', name: 'Rise Insider Filesystem', description: 'Send filesystem execution requests to a paired Rise Insider runtime.', category: 'Execution', icon: <Database className="h-5 w-5" /> },
  { id: 'browser_automation', name: 'Browser Automation', description: 'Send browser automation requests to an authorized automation runtime.', category: 'Execution', icon: <Boxes className="h-5 w-5" /> },
  { id: 'ui_control', name: 'UI Control', description: 'Send UI control requests to an authorized runtime adapter.', category: 'Execution', icon: <CircleDashed className="h-5 w-5" /> },
]

const STEPS = [
  { id: 1, labelKey: 'integration.stepSelect' },
  { id: 2, labelKey: 'integration.stepConfigure' },
  { id: 3, labelKey: 'integration.stepTest' },
  { id: 4, labelKey: 'integration.stepReview' },
] as const

export function IntegrationSetupWizard({ onBack, ownerUserId, currentFunction }: { onBack?: () => void; ownerUserId?: string; currentFunction?: string }) {
  const [mode, setMode] = useState<'overview' | 'wizard'>('overview')
  const [step, setStep] = useState<1 | 2 | 3 | 4>(1)
  const [selected, setSelected] = useState<IntegrationOption | null>(null)
  const [name, setName] = useState('')
  const [endpoint, setEndpoint] = useState('')
  const [token, setToken] = useState('')
  const [testStatus, setTestStatus] = useState<'idle' | 'running' | 'ok' | 'fail'>('idle')
  const [testMessage, setTestMessage] = useState('')
  const [completed, setCompleted] = useState(false)
  const [saving, setSaving] = useState(false)
  const [setups, setSetups] = useState<IntegrationSetupSummary[]>([])
  const [loadingSetups, setLoadingSetups] = useState(true)
  const [selectedDetail, setSelectedDetail] = useState<IntegrationSetupDetail | null>(null)
  const [detailLoadingId, setDetailLoadingId] = useState<string | null>(null)
  const [managingDetail, setManagingDetail] = useState(false)
  const [rotationToken, setRotationToken] = useState('')
  const { t } = useI18n()
  const currentStep = STEPS.find((item) => item.id === step) ?? STEPS[0]
  const currentStepLabel = t(currentStep.labelKey)
  const effectiveOwnerUserId = ownerUserId ?? ''
  const canSeeTeamSetups = ['Admin', 'Owner', 'Board'].includes(currentFunction ?? '')

  async function refreshSetups() {
    if (!effectiveOwnerUserId) return
    setLoadingSetups(true)
    try {
      setSetups(await loadIntegrationSetupOverview(effectiveOwnerUserId))
    } catch {
      setSetups([])
    } finally {
      setLoadingSetups(false)
    }
  }

  useEffect(() => {
    let cancelled = false
    if (!effectiveOwnerUserId) return
    void loadIntegrationSetupOverview(effectiveOwnerUserId)
      .then((items) => { if (!cancelled) setSetups(items) })
      .catch(() => { if (!cancelled) setSetups([]) })
      .finally(() => { if (!cancelled) setLoadingSetups(false) })
    return () => { cancelled = true }
  }, [effectiveOwnerUserId])

  function suggestedEndpoint(provider: string) {
    const supabaseUrl = import.meta.env.VITE_SUPABASE_URL
    if (!supabaseUrl) return ''
    if (provider === 'rise_insider_terminal') return `${supabaseUrl}/functions/v1/rise-insider-terminal`
    if (provider === 'rise_insider_filesystem') return `${supabaseUrl}/functions/v1/rise-insider-filesystem`
    if (provider === 'integration_gateway') return `${supabaseUrl}/functions/v1/adapter-staging`
    return ''
  }

  function handleSelect(integration: IntegrationOption) {
    setSelected(integration)
    setEndpoint(suggestedEndpoint(integration.id))
    setName((current) => current || integration.name)
    setTestStatus('idle')
    setTestMessage('')
  }

  async function testConnection() {
    setTestStatus('running')
    setTestMessage('')
    try {
      if (!endpoint.startsWith('https://')) throw new Error(t('integration.httpsRequired'))
      const response = await fetch(endpoint, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
        body: JSON.stringify({
          execution_path: selected?.id,
          objective: 'Pairing health check',
          prompt: selected?.id === 'rise_insider_filesystem' ? 'operation: status' : 'command: status',
          requested_at: new Date().toISOString(),
        }),
      })
      if (!response.ok) throw new Error(`HTTP ${response.status}`)
      setTestStatus('ok')
      setTestMessage(t('integration.connectionSuccessful'))
    } catch (error) {
      setTestStatus('fail')
      setTestMessage(error instanceof Error ? error.message : t('integration.testFailed'))
    }
  }

  function reset() {
    setStep(1)
    setSelected(null)
    setName('')
    setEndpoint('')
    setToken('')
    setTestStatus('idle')
    setTestMessage('')
    setCompleted(false)
  }

  function startWizard() {
    reset()
    setMode('wizard')
  }

  function backToOverview() {
    reset()
    setMode('overview')
    refreshSetups()
  }

  async function openDetails(integration: IntegrationSetupSummary) {
    if (!effectiveOwnerUserId || !integration.can_view_details) return
    setDetailLoadingId(integration.id)
    try {
      setSelectedDetail(await loadIntegrationSetupDetail(effectiveOwnerUserId, integration.id))
      setRotationToken('')
    } finally {
      setDetailLoadingId(null)
    }
  }

  async function updateSelectedStatus(status: 'active' | 'inactive') {
    if (!selectedDetail || !effectiveOwnerUserId) return
    setManagingDetail(true)
    try {
      await updateIntegrationSetupStatus(effectiveOwnerUserId, selectedDetail.id, status)
      setSelectedDetail(null)
      await refreshSetups()
    } finally {
      setManagingDetail(false)
    }
  }

  async function deleteSelectedIntegration() {
    if (!selectedDetail || !effectiveOwnerUserId) return
    setManagingDetail(true)
    try {
      await deleteIntegrationSetup(effectiveOwnerUserId, selectedDetail.id)
      setSelectedDetail(null)
      await refreshSetups()
    } finally {
      setManagingDetail(false)
    }
  }

  async function rotateSelectedSecret() {
    if (!selectedDetail || !effectiveOwnerUserId || !rotationToken.trim()) return
    setManagingDetail(true)
    try {
      await rotateIntegrationSetupSecret(effectiveOwnerUserId, selectedDetail.id, rotationToken.trim())
      setRotationToken('')
      setSelectedDetail(await loadIntegrationSetupDetail(effectiveOwnerUserId, selectedDetail.id))
      await refreshSetups()
    } finally {
      setManagingDetail(false)
    }
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
        config: {
          token: token || undefined,
          secret_present: Boolean(token),
          paired_at: new Date().toISOString(),
        },
        status: 'active',
      })
      setCompleted(true)
      window.setTimeout(backToOverview, 900)
    } catch {
      // silent
    } finally {
      setSaving(false)
    }
  }

  if (mode === 'overview') {
    return (
      <>
        <Card className="w-full rounded-xl border-border/80 shadow-[0_1px_2px_rgba(16,24,40,0.04),0_10px_24px_rgba(16,24,40,0.06)]">
          <CardHeader className="gap-3">
            <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
              <div>
                <CardTitle className="text-base font-semibold">{t('integration.title')}</CardTitle>
                <p className="mt-1 text-sm text-muted-foreground">{canSeeTeamSetups ? t('integration.overviewTeamDesc') : t('integration.overviewDesc')}</p>
              </div>
              <div className="flex gap-2">
                <BackButton onClick={onBack} />
                <Button type="button" onClick={startWizard}><PlugZap className="h-4 w-4" />{t('integration.newSetup')}</Button>
              </div>
            </div>
          </CardHeader>
          <CardContent className="space-y-3">
            {loadingSetups ? <div className="rounded-lg border p-4 text-sm text-muted-foreground">{t('common.loading')}</div> : null}
            {!loadingSetups && setups.length === 0 ? (
              <div className="rounded-lg border border-dashed p-6 text-center text-sm text-muted-foreground">{t('integration.noSetups')}</div>
            ) : null}
            {!loadingSetups && setups.map((setup) => (
              <div key={setup.id} className="rounded-lg border bg-background p-4">
                <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                  <div className="min-w-0 space-y-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <p className="font-medium">{setup.name}</p>
                      <Badge variant="outline">{setup.provider}</Badge>
                      <Badge variant="outline" className={setup.status === 'active' ? 'border-[#2F5D5A]/25 bg-[#2F5D5A]/8 text-[#2F5D5A]' : 'border-slate-200 bg-slate-50 text-slate-600'}>{setup.status}</Badge>
                    </div>
                    <p className="text-xs text-muted-foreground">{setup.category} · {setup.endpoint ?? t('analytics.internalAdapter')}</p>
                    <p className="text-xs text-muted-foreground">{t('integration.configuredBy')} {setup.user_name} ({setup.user_email || setup.user_id})</p>
                    <p className="text-[11px] text-muted-foreground/70">{t('integration.updatedAt')} {new Date(setup.updated_at).toLocaleString()}</p>
                  </div>
                  {setup.can_view_details ? (
                    <Button type="button" variant="outline" onClick={() => openDetails(setup)} disabled={detailLoadingId === setup.id}>
                      {detailLoadingId === setup.id ? <Loader2 className="h-4 w-4 animate-spin" /> : null}
                      {t('integration.viewDetails')}
                    </Button>
                  ) : (
                    <Badge variant="outline" className="self-start text-muted-foreground">{t('integration.readOnly')}</Badge>
                  )}
                </div>
              </div>
            ))}
          </CardContent>
        </Card>

        <Dialog open={Boolean(selectedDetail)} onOpenChange={(open) => { if (!open) setSelectedDetail(null) }}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>{t('integration.detailsTitle')}</DialogTitle>
            </DialogHeader>
            {selectedDetail ? (
              <div className="space-y-3 text-sm">
                <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                  <div><strong>{t('integration.displayLabel')}</strong><br />{selectedDetail.name}</div>
                  <div><strong>{t('integration.integrationLabel')}</strong><br />{selectedDetail.provider}</div>
                  <div><strong>{t('integration.ownerLabel')}</strong><br />{selectedDetail.user_name}</div>
                  <div><strong>{t('flowRun.status')}</strong><br />{selectedDetail.status}</div>
                  <div className="sm:col-span-2"><strong>{t('integration.endpointLabel')}</strong><br />{selectedDetail.endpoint ?? t('common.noData')}</div>
                  <div><strong>{t('integration.tokenLabel')}</strong><br />{selectedDetail.safe_config?.secret_present ? t('integration.tokenConfigured') : t('integration.tokenEmpty')}</div>
                  <div><strong>{t('integration.pairedAt')}</strong><br />{selectedDetail.safe_config?.paired_at ? new Date(selectedDetail.safe_config.paired_at).toLocaleString() : t('common.noData')}</div>
                </div>
                <div className="rounded-md border bg-muted/25 p-3">
                  <p className="text-xs font-medium uppercase tracking-[0.14em] text-muted-foreground">{t('integration.configKeys')}</p>
                  <p className="mt-1 text-muted-foreground">{selectedDetail.safe_config?.config_keys?.length ? selectedDetail.safe_config.config_keys.join(', ') : t('common.noData')}</p>
                </div>
                {selectedDetail.can_manage ? (
                  <div className="rounded-md border p-3">
                    <Label htmlFor="integrationRotationToken">{t('integration.rotateSecret')}</Label>
                    <div className="mt-2 flex gap-2">
                      <Input id="integrationRotationToken" type="password" value={rotationToken} onChange={(event) => setRotationToken(event.target.value)} placeholder={t('integration.apiTokenPlaceholder')} autoComplete="new-password" />
                      <Button type="button" variant="outline" disabled={!rotationToken.trim() || managingDetail} onClick={rotateSelectedSecret}>{t('integration.rotate')}</Button>
                    </div>
                  </div>
                ) : null}
                <p className="text-xs text-muted-foreground">{t('integration.detailsSafeNotice')}</p>
              </div>
            ) : null}
            <DialogFooter>
              {selectedDetail?.can_manage ? (
                <>
                  <Button type="button" variant="outline" disabled={managingDetail} onClick={() => updateSelectedStatus(selectedDetail.status === 'active' ? 'inactive' : 'active')}>
                    {selectedDetail.status === 'active' ? t('integration.deactivate') : t('integration.activate')}
                  </Button>
                  <Button type="button" variant="outline" disabled={managingDetail} onClick={deleteSelectedIntegration}>{t('common.delete')}</Button>
                </>
              ) : null}
              <Button variant="outline" onClick={() => setSelectedDetail(null)}>{t('common.ok')}</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </>
    )
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
          <BackButton onClick={() => step === 1 ? backToOverview() : setStep((current) => current === 1 ? 1 : current === 2 ? 1 : current === 3 ? 2 : 3)} />
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

      {setups.length > 0 && (
        <div className="space-y-2">
          <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide">{t('integration.activeIntegrations')}</p>
          <div className="flex flex-wrap gap-2">
            {setups.map((ig) => (
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
                <button key={integration.id} type="button" onClick={() => handleSelect(integration)} className={isActive ? 'flex items-start gap-3 rounded-lg border border-foreground bg-muted/30 p-3 text-left transition-colors' : 'flex items-start gap-3 rounded-lg border p-3 text-left transition-colors hover:border-foreground/40'}>
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
            <div className="space-y-2 sm:col-span-2">
              <Label htmlFor="integrationToken">{t('integration.apiToken')}</Label>
              <Input id="integrationToken" type="password" value={token} onChange={(event) => setToken(event.target.value)} placeholder={t('integration.apiTokenPlaceholder')} autoComplete="new-password" />
              <p className="text-xs text-muted-foreground">{t('integration.secretHint')}</p>
            </div>
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
            <Button type="button" onClick={testConnection} disabled={testStatus === 'running'}>
              <PlugZap className="h-4 w-4" />
              {testStatus === 'running' ? t('common.testing') : t('common.runTest')}
            </Button>
          </div>
          {testStatus === 'ok' ? <div className="flex items-center gap-2 rounded-md border border-emerald-200 bg-emerald-50 px-3 py-2 text-sm text-emerald-700"><CheckCircle2 className="h-4 w-4" />{testMessage || t('integration.connectionSuccessful')}</div> : null}
          {testStatus === 'fail' ? <div className="rounded-md border border-rose-200 bg-rose-50 px-3 py-2 text-sm text-rose-700">{testMessage || t('integration.testFailed')}</div> : null}
        </div>
      ) : null}

      {step === 4 ? (
        <div className="space-y-4 rounded-lg border p-4 text-sm">
          <div><strong>{t('integration.integrationLabel')}</strong> {selected?.name ?? ''}</div>
          <div><strong>{t('integration.displayLabel')}</strong> {name || ''}</div>
          <div><strong>{t('integration.endpointLabel')}</strong> {endpoint || ''}</div>
          <div><strong>{t('integration.tokenLabel')}</strong> {token ? t('integration.tokenConfigured') : t('integration.tokenEmpty')}</div>
          <div className="text-xs text-muted-foreground">{t('integration.secretReview')}</div>
        </div>
      ) : null}

    </WizardShell>
  )
}
