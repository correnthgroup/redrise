import { useState } from 'react'
import { ArrowLeft, CheckCircle2, Eye, EyeOff, Lock, Shield, XCircle } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { useI18n } from '@/hooks/use-i18n'

function PasswordField({ id, label, value, onChange }: { id: string; label: string; value?: string; onChange?: (value: string) => void }) {
  const { t } = useI18n()
  const [showPassword, setShowPassword] = useState(false)

  return (
    <div className="mb-6 space-y-2">
      <Label htmlFor={id} className="flex items-center gap-2">
        <Lock className="h-4 w-4 text-muted-foreground" />
        {label}
      </Label>
      <div className="relative">
        <Input id={id} type={showPassword ? 'text' : 'password'} placeholder="●●●●●●●●" value={value} onChange={(event) => onChange?.(event.target.value)} />
        <Button type="button" variant="ghost" size="sm" className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent" onClick={() => setShowPassword((value) => !value)}>
          {showPassword ? <EyeOff className="h-4 w-4" aria-hidden="true" /> : <Eye className="h-4 w-4" aria-hidden="true" />}
          <span className="sr-only">{showPassword ? t('settings.hidePassword') : t('settings.showPassword')}</span>
        </Button>
      </div>
    </div>
  )
}

const PASSWORD_REQUIREMENTS = [
  { labelKey: 'settings.passwordMin8', regex: /.{8,}/ },
  { labelKey: 'settings.passwordUpper', regex: /[A-Z]/ },
  { labelKey: 'settings.passwordLower', regex: /[a-z]/ },
  { labelKey: 'settings.passwordNumber', regex: /[0-9]/ },
  { labelKey: 'settings.passwordSpecial', regex: /[!@#$%^&*()_+\-=[\]{};':"\\|,.<>/?]/ },
]

export function ChangePassword({ onBack }: { onBack?: () => void }) {
  const { t } = useI18n()
  const [newPassword, setNewPassword] = useState('')

  return (
    <Card className="border p-8">
      <div className="pb-6">
        <div className="flex items-center gap-3">
          <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-orange-100">
            <Shield className="h-6 w-6 text-orange-600" />
          </div>
          <div>
            <h2 className="text-2xl font-semibold tracking-tight">{t('settings.changePasswordTitle')}</h2>
            <p className="mt-1 text-sm text-muted-foreground">{t('settings.changePasswordFullDesc')}</p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-8 md:grid-cols-2">
        <div>
          <form onSubmit={(event) => event.preventDefault()}>
            <PasswordField id="current-password" label={t('settings.currentPassword')} />
            <PasswordField id="new-password" label={t('settings.newPassword')} value={newPassword} onChange={setNewPassword} />
            <PasswordField id="confirm-password" label={t('settings.confirmNewPassword')} />
            <div className="mt-8 flex gap-3">
              <Button type="button" variant="outline" className="flex-1" onClick={onBack}>
                <ArrowLeft className="h-4 w-4" />
                {t('common.back')}
              </Button>
              <Button type="submit" className="flex-1">{t('settings.updatePassword')}</Button>
            </div>
          </form>
        </div>

        <div className="space-y-6">
          <div>
            <h3 className="mb-4 flex items-center gap-2 font-semibold">
              <Shield className="h-5 w-5 text-muted-foreground" />
              {t('settings.passwordRequirements')}
            </h3>
            <p className="mb-6 text-sm text-muted-foreground">{t('settings.passwordCriteria')}</p>
            <ul className="space-y-3">
              {PASSWORD_REQUIREMENTS.map((req) => {
                const meetsRequirement = req.regex.test(newPassword)
                return (
                  <li key={req.labelKey} className="flex items-start gap-3">
                    {meetsRequirement ? <CheckCircle2 className="mt-0.5 h-5 w-5 shrink-0 text-emerald-500" /> : <XCircle className="mt-0.5 h-5 w-5 shrink-0 text-muted-foreground" />}
                    <span className={meetsRequirement ? 'text-sm text-foreground' : 'text-sm text-muted-foreground'}>{t(req.labelKey)}</span>
                  </li>
                )
              })}
            </ul>
          </div>

          <div className="rounded-lg border border-[#A04D1F] bg-[#A04D1F] p-4 text-[#FAF6EF]">
            <h4 className="mb-2 text-sm font-medium">{t('settings.securityBestPractices')}</h4>
            <ul className="space-y-2 text-sm text-[#FAF6EF]">
              <li className="flex items-start gap-2"><span className="mt-1">-</span><span>{t('settings.securityChangeRegularly')}</span></li>
              <li className="flex items-start gap-2"><span className="mt-1">-</span><span>{t('settings.securityNeverShare')}</span></li>
              <li className="flex items-start gap-2"><span className="mt-1">-</span><span>{t('settings.securityUnique')}</span></li>
              <li className="flex items-start gap-2"><span className="mt-1">-</span><span>{t('settings.securityManager')}</span></li>
            </ul>
          </div>
        </div>
      </div>
    </Card>
  )
}
