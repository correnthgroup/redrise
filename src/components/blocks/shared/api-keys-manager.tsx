import { useState } from 'react'
import { Copy, Eye, EyeOff, KeyRound, Plus, Trash2 } from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Separator } from '@/components/ui/separator'

type ApiKey = {
  id: string
  name: string
  prefix: string
  secret: string
  createdAt: string
  lastUsed: string
  scopes: string[]
}

const SCOPE_OPTIONS = ['agents:read', 'agents:write', 'tasks:read', 'tasks:write', 'analytics:read', 'integrations:manage'] as const

const INITIAL_KEYS: ApiKey[] = [
  { id: 'key-001', name: 'Production · dashboard', prefix: 'agra_live_8f3c', secret: 'agra_live_8f3cxxx...', createdAt: '2026-05-12', lastUsed: '12 min ago', scopes: ['agents:read', 'tasks:read', 'analytics:read'] },
  { id: 'key-002', name: 'Staging · CI pipeline', prefix: 'agra_test_2a91', secret: 'agra_test_2a91xxx...', createdAt: '2026-04-28', lastUsed: '3 hours ago', scopes: ['agents:read', 'agents:write', 'tasks:read', 'tasks:write'] },
  { id: 'key-003', name: 'Local · dev laptop', prefix: 'agra_dev_77b0', secret: 'agra_dev_77b0xxx...', createdAt: '2026-06-01', lastUsed: '1 day ago', scopes: ['agents:read'] },
]

export function ApiKeysManager() {
  const [keys, setKeys] = useState<ApiKey[]>(INITIAL_KEYS)
  const [showSecrets, setShowSecrets] = useState<Record<string, boolean>>({})
  const [copiedId, setCopiedId] = useState<string | null>(null)
  const [showCreate, setShowCreate] = useState(false)
  const [newName, setNewName] = useState('')
  const [newScopes, setNewScopes] = useState<string[]>(['agents:read', 'tasks:read'])

  return (
    <Card className="gap-0 rounded-xl p-6">
      <div className="flex items-start justify-between gap-4">
        <div>
          <h3 className="text-base font-semibold">API Keys</h3>
          <p className="text-sm text-muted-foreground">Create and manage API keys to access the workspace programmatically. Keep them secret.</p>
        </div>
        <Button type="button" size="sm" onClick={() => setShowCreate((value) => !value)}>
          <Plus className="h-4 w-4" />
          New Key
        </Button>
      </div>

      {showCreate ? (
        <form className="mt-4 space-y-4 rounded-lg border bg-muted/30 p-4" onSubmit={(event) => {
          event.preventDefault()
          if (!newName.trim() || newScopes.length === 0) return
          const created: ApiKey = {
            id: `key-${Date.now()}`,
            name: newName.trim(),
            prefix: 'agra_new_xxxx',
            secret: 'agra_new_xxx...',
            createdAt: 'today',
            lastUsed: 'Never',
            scopes: newScopes,
          }
          setKeys((current) => [created, ...current])
          setShowSecrets((current) => ({ ...current, [created.id]: true }))
          setShowCreate(false)
          setNewName('')
          setNewScopes(['agents:read', 'tasks:read'])
        }}>
          <div className="space-y-2">
            <Label htmlFor="keyName">Key Name</Label>
            <Input id="keyName" value={newName} onChange={(event) => setNewName(event.target.value)} placeholder="e.g. Production · dashboard" />
          </div>
          <div className="space-y-2">
            <Label>Scopes</Label>
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
            <Button type="button" variant="outline" onClick={() => setShowCreate(false)}>Cancel</Button>
            <Button type="submit" disabled={!newName.trim() || newScopes.length === 0}>Create Key</Button>
          </div>
        </form>
      ) : null}

      <Separator className="my-4" />

      <div className="space-y-3">
        {keys.map((key) => {
          const revealed = showSecrets[key.id]
          return (
            <div key={key.id} className="space-y-3 rounded-lg border p-4">
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <KeyRound className="h-4 w-4 text-muted-foreground" />
                    <p className="text-sm font-semibold">{key.name}</p>
                  </div>
                  <p className="text-xs text-muted-foreground">Created {key.createdAt} · Last used {key.lastUsed}</p>
                </div>
                <Button type="button" variant="outline" size="sm" onClick={() => setKeys((current) => current.filter((item) => item.id !== key.id))}>
                  <Trash2 className="h-4 w-4" />
                  Revoke
                </Button>
              </div>

              <div className="flex items-center gap-2 rounded-md bg-muted/50 px-3 py-2 font-mono text-xs">
                <span className="flex-1 truncate text-foreground/80">{revealed ? key.secret : `${key.prefix}${'â€¢'.repeat(40)}`}</span>
                <button type="button" onClick={() => setShowSecrets((current) => ({ ...current, [key.id]: !current[key.id] }))} className="text-muted-foreground hover:text-foreground" aria-label={revealed ? 'Hide secret' : 'Reveal secret'}>
                  {revealed ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
                <button type="button" onClick={async () => {
                  try {
                    await navigator.clipboard.writeText(key.secret)
                    setCopiedId(key.id)
                    window.setTimeout(() => setCopiedId(null), 2000)
                  } catch {
                    setCopiedId(null)
                  }
                }} className="text-muted-foreground hover:text-foreground" aria-label="Copy secret">
                  <Copy className="h-4 w-4" />
                </button>
              </div>
              {copiedId === key.id ? <p className="text-xs text-emerald-600">Copied to clipboard.</p> : null}
              <div className="flex flex-wrap gap-1.5">
                {key.scopes.map((scope) => (
                  <Badge key={scope} variant="outline" className="bg-background text-muted-foreground">{scope}</Badge>
                ))}
              </div>
            </div>
          )
        })}
      </div>
    </Card>
  )
}
