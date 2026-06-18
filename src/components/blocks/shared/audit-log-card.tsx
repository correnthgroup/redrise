import { useState, useEffect } from 'react'
import { Shield, Loader2, Search } from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import { Card } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { loadAuditLogs, type AuditLog, type AuditAction, type AuditEntityType } from '@/lib/audit-logs'
import { useI18n } from '@/hooks/use-i18n'

const ACTION_BADGE: Record<AuditAction, string> = {
  create: 'border-emerald-200 bg-emerald-50 text-emerald-700',
  update: 'border-[#2F5D5A]/20 bg-[#2F5D5A]/8 text-[#2F5D5A]',
  delete: 'border-primary/18 bg-primary/8 text-primary',
  execute: 'border-[#B7791F]/18 bg-[#FFF8E1] text-[#7A3E14]',
  login: 'border-slate-200 bg-slate-50 text-slate-600',
  logout: 'border-slate-200 bg-slate-50 text-slate-600',
  invite: 'border-[#2F5D5A]/20 bg-[#2F5D5A]/8 text-[#2F5D5A]',
  revoke: 'border-primary/18 bg-primary/8 text-primary',
}

const ENTITY_ICONS: Record<AuditEntityType, string> = {
  workspace: 'Workspace',
  flow: 'Flow',
  task: 'Task',
  agent: 'Agent',
  integration: 'Integration',
  api_key: 'API Key',
  member: 'Member',
  execution: 'Execution',
  user: 'User',
}

export function AuditLogCard() {
  const { t, locale } = useI18n()
  const [logs, setLogs] = useState<AuditLog[]>([])
  const [loading, setLoading] = useState(true)
  const [query, setQuery] = useState('')

  useEffect(() => {
    loadAuditLogs(100).then(setLogs).finally(() => setLoading(false))
  }, [])

  const filtered = logs.filter((log) => {
    if (!query) return true
    const q = query.toLowerCase()
    return (
      log.action.toLowerCase().includes(q) ||
      log.entity_type.toLowerCase().includes(q) ||
      (log.entity_name && log.entity_name.toLowerCase().includes(q))
    )
  })

  function formatTime(iso: string) {
    return new Date(iso).toLocaleString(locale, {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    })
  }

  return (
    <Card className="gap-0 rounded-xl p-6">
      <div className="flex items-start justify-between gap-4">
        <div>
          <h3 className="text-base font-semibold">{t('settings.auditLog')}</h3>
          <p className="text-sm text-muted-foreground">{t('settings.auditLogDesc')}</p>
        </div>
        <div className="flex items-center gap-2">
          <Shield className="h-4 w-4 text-muted-foreground" />
          <span className="text-xs text-muted-foreground">{t('settings.auditEvents', { count: logs.length })}</span>
        </div>
      </div>

      <div className="mt-4 flex items-center gap-2">
        <div className="relative max-w-sm flex-1">
          <Search className="pointer-events-none absolute left-2 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-muted-foreground" />
          <Input value={query} onChange={(e) => setQuery(e.target.value)} placeholder={t('settings.searchAuditLogs')} className="pl-7 h-9" />
        </div>
      </div>

      <div className="mt-4 space-y-2">
        {loading ? (
          <div className="flex items-center justify-center py-8">
            <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
          </div>
        ) : filtered.length === 0 ? (
          <p className="py-8 text-center text-sm text-muted-foreground">{t('settings.noAuditEvents')}</p>
        ) : (
          filtered.map((log) => (
            <div key={log.id} className="flex items-start gap-3 rounded-lg border p-3 text-sm">
              <div className="mt-0.5 h-2 w-2 rounded-full shrink-0 bg-[#2F5D5A]" />
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 flex-wrap">
                  <Badge variant="outline" className={`text-[10px] uppercase ${ACTION_BADGE[log.action]}`}>
                    {log.action}
                  </Badge>
                  <span className="text-xs font-medium">{ENTITY_ICONS[log.entity_type]}</span>
                  {log.entity_name && (
                    <span className="text-xs text-muted-foreground truncate">{log.entity_name}</span>
                  )}
                </div>
                <div className="mt-1 flex items-center gap-2 text-[10px] text-muted-foreground/60">
                  <span>{formatTime(log.created_at)}</span>
                  <span>·</span>
                  <span className="font-mono">{log.entity_id || '—'}</span>
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </Card>
  )
}
