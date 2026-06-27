import { useState, useEffect } from 'react'
import { Copy, KeyRound, Loader2, Plus, Trash2 } from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { BackButton } from '@/components/ui/back-button'
import { Card } from '@/components/ui/card'
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Separator } from '@/components/ui/separator'
import { createApiKey, deleteApiKey, loadApiKeys, revokeApiKey, type ApiKey } from '@/lib/api-keys'
import { useI18n } from '@/hooks/use-i18n'

const SCOPE_OPTIONS = ['agents:read', 'agents:write', 'tasks:read', 'tasks:write', 'analytics:read', 'integrations:manage'] as const

export function ApiKeysManager({ onBack, ownerUserId }: { onBack?: () => void; ownerUserId?: string }) {
  const { t, locale } = useI18n()
  const [keys, setKeys] = useState<ApiKey[]>([])
  const [loading, setLoading] = useState(true)
  const [copiedId, setCopiedId] = useState<string | null>(null)
  const [showCreate, setShowCreate] = useState(false)
  const [newName, setNewName] = useState('')
  const [newScopes, setNewScopes] = useState<string[]>(['agents:read', 'tasks:read'])
  const [saving, setSaving] = useState(false)
  const [createdSecret, setCreatedSecret] = useState<string | null>(null)
  const [createdKeyId, setCreatedKeyId] = useState<string | null>(null)

  useEffect(() => {
    loadApiKeys(ownerUserId).then(setKeys).finally(() => setLoading(false))
  }, [ownerUserId])

  async function handleCreate(event: React.FormEvent) {
    event.preventDefault()
    if (!newName.trim() || newScopes.length === 0) return
    setSaving(true)
    try {
      const result = await createApiKey({ name: newName.trim(), scopes: newScopes }, ownerUserId)
      setKeys((current) => [result.key, ...current])
      setCreatedSecret(result.secret)
      setCreatedKeyId(result.key.id)
      setShowCreate(false)
      setNewName('')
      setNewScopes(['agents:read', 'tasks:read'])
    } catch {
      // silent
    } finally {
      setSaving(false)
    }
  }

  async function handleRevoke(id: string) {
    await revokeApiKey(id)
    setKeys((current) => current.filter((k) => k.id !== id))
  }

  async function handleDelete(id: string) {
    await deleteApiKey(id)
    setKeys((current) => current.filter((k) => k.id !== id))
  }

  function formatDate(iso: string) {
    return new Date(iso).toLocaleDateString(locale, { month: 'short', day: 'numeric', year: 'numeric' })
  }

  return (
    <Card className="gap-0 rounded-xl p-6">
      <div className="flex items-start justify-between gap-4">
        <div>
          <h3 className="text-base font-semibold">{t('settings.apiKeysTitle')}</h3>
          <p className="text-sm text-muted-foreground">{t('settings.apiKeysFullDesc')}</p>
        </div>
      </div>

      {showCreate ? (
        <form className="mt-4 space-y-4 rounded-lg border bg-muted/30 p-4" onSubmit={handleCreate}>
          <div className="space-y-2">
            <Label htmlFor="keyName">{t('settings.keyName')}</Label>
            <Input id="keyName" value={newName} onChange={(event) => setNewName(event.target.value)} placeholder={t('settings.keyNamePlaceholder')} />
          </div>
          <div className="space-y-2">
            <Label>{t('settings.scopes')}</Label>
            <div className="flex flex-wrap gap-2">
              {SCOPE_OPTIONS.map((scope) => {
                const active = newScopes.includes(scope)
                return (
                  <button
                    key={scope}
                    type="button"
                    onClick={() => setNewScopes((current) => current.includes(scope) ? current.filter((item) => item !== scope) : [...current, scope])}
                    className={active ? 'rounded-full border border-foreground bg-foreground px-3 py-1 text-xs font-medium text-background transition-colors' : 'rounded-full border bg-background px-3 py-1 text-xs font-medium text-muted-foreground transition-colors hover:border-foreground/40'}
                  >
                    {scope}
                  </button>
                )
              })}
            </div>
          </div>
          <div className="flex justify-end gap-2">
            <Button type="button" variant="outline" onClick={() => setShowCreate(false)}>{t('common.cancel')}</Button>
            <Button type="submit" disabled={!newName.trim() || newScopes.length === 0 || saving}>
              {saving ? <><Loader2 className="mr-2 h-4 w-4 animate-spin" />{t('settings.creating')}</> : t('settings.createKey')}
            </Button>
          </div>
        </form>
      ) : null}

      {createdSecret && createdKeyId ? (
        <div className="mt-4 rounded-lg border border-amber-200 bg-amber-50 p-4">
          <p className="text-sm font-medium text-amber-800">{t('settings.copyApiKeyNow')}</p>
          <div className="mt-2 flex items-center gap-2 rounded-md bg-background px-3 py-2 font-mono text-xs">
            <span className="flex-1 truncate">{createdSecret}</span>
            <button type="button" onClick={async () => {
              await navigator.clipboard.writeText(createdSecret)
              setCopiedId(createdKeyId)
              window.setTimeout(() => setCopiedId(null), 2000)
            }} className="text-muted-foreground hover:text-foreground">
              <Copy className="h-4 w-4" />
            </button>
          </div>
          {copiedId === createdKeyId ? <p className="mt-1 text-xs text-emerald-600">{t('settings.copiedClipboard')}</p> : null}
          <Button type="button" variant="outline" size="sm" className="mt-2" onClick={() => { setCreatedSecret(null); setCreatedKeyId(null) }}>{t('settings.dismiss')}</Button>
        </div>
      ) : null}

      <Separator className="my-4" />

      {loading ? (
        <div className="flex items-center justify-center py-8">
          <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
        </div>
      ) : (
        <div className="space-y-3">
          {keys.length === 0 ? (
            <p className="py-8 text-center text-sm text-muted-foreground">{t('settings.noApiKeys')}</p>
          ) : (
            keys.map((key) => {
              return (
                <div key={key.id} className="space-y-3 rounded-lg border p-4">
                  <div className="flex flex-wrap items-start justify-between gap-3">
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <KeyRound className="h-4 w-4 text-muted-foreground" />
                        <p className="text-sm font-semibold">{key.name}</p>
                      </div>
                      <p className="text-xs text-muted-foreground">{t('settings.createdDate', { date: formatDate(key.created_at) })}{key.last_used_at ? ` · ${t('settings.lastUsedDate', { date: formatDate(key.last_used_at) })}` : ` · ${t('settings.neverUsed')}`}</p>
                    </div>
                    <div className="flex gap-2">
                      <Button type="button" variant="outline" size="sm" onClick={() => handleRevoke(key.id)}>{t('sessions.revoke')}</Button>
                      <AlertDialog>
                        <AlertDialogTrigger asChild>
                          <Button type="button" variant="outline" size="sm">
                            <Trash2 className="h-4 w-4" />
                            {t('common.delete')}
                          </Button>
                        </AlertDialogTrigger>
                        <AlertDialogContent>
                          <AlertDialogHeader>
                            <AlertDialogTitle>{t('settings.deleteApiKeyTitle')}</AlertDialogTitle>
                            <AlertDialogDescription>{t('settings.deleteApiKeyDesc')}</AlertDialogDescription>
                          </AlertDialogHeader>
                          <AlertDialogFooter>
                            <AlertDialogCancel>{t('common.cancel')}</AlertDialogCancel>
                            <AlertDialogAction onClick={() => handleDelete(key.id)}>{t('common.delete')}</AlertDialogAction>
                          </AlertDialogFooter>
                        </AlertDialogContent>
                      </AlertDialog>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 rounded-md bg-muted/50 px-3 py-2 font-mono text-xs">
                    <span className="flex-1 truncate text-foreground/80">{key.prefix}{'•'.repeat(40)}</span>
                    <span className="text-xs text-muted-foreground">{t('settings.secretHidden')}</span>
                  </div>
                  {copiedId === key.id ? <p className="text-xs text-emerald-600">{t('settings.copiedClipboard')}</p> : null}
                  <div className="flex flex-wrap gap-1.5">
                    {key.scopes.map((scope) => (
                      <Badge key={scope} variant="outline" className="bg-background text-muted-foreground">{scope}</Badge>
                    ))}
                  </div>
                </div>
              )
            })
          )}
        </div>
      )}
      <div className="mt-4 flex justify-between border-t pt-4">
        <BackButton onClick={onBack} />
        <Button type="button" size="sm" onClick={() => setShowCreate((value) => !value)}>
          <Plus className="h-4 w-4" />
          {t('settings.newKey')}
        </Button>
      </div>
    </Card>
  )
}
