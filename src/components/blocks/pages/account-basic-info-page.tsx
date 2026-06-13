import { useEffect, useMemo, useRef, useState, type ChangeEvent, type ReactNode } from 'react'
import { Camera, Globe, Info, Loader2, Mail, Phone, ShieldCheck, Trash2, Upload, User } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover'
import { useI18n } from '@/hooks/use-i18n'
import { LOCALES, type Locale } from '@/lib/i18n'
import { createDefaultProfile, loadUserProfile, saveUserProfile, type UserProfile } from '@/lib/user-profile'
import { loadCurrentAccessRole, type AccessRole } from '@/lib/team-members'

type AccountUser = { id: string; name: string; email: string; avatarUrl?: string | null }

const COUNTRIES = [
  { value: 'BR', en: 'Brazil', pt: 'Brasil', timezone: 'America/Sao_Paulo' },
  { value: 'US', en: 'United States', pt: 'Estados Unidos', timezone: 'America/New_York' },
  { value: 'PT', en: 'Portugal', pt: 'Portugal', timezone: 'Europe/Lisbon' },
  { value: 'ES', en: 'Spain', pt: 'Espanha', timezone: 'Europe/Madrid' },
  { value: 'DE', en: 'Germany', pt: 'Alemanha', timezone: 'Europe/Berlin' },
]

function Field({ children }: { children: ReactNode }) {
  return <div className="space-y-2">{children}</div>
}

function FieldLabel({ htmlFor, icon, children }: { htmlFor?: string; icon: ReactNode; children: ReactNode }) {
  return (
    <Label htmlFor={htmlFor} className="flex items-center gap-2">
      <span className="text-muted-foreground">{icon}</span>
      {children}
    </Label>
  )
}

function buildUsername(firstName: string, lastName: string) {
  return `${firstName}.${lastName}`.toLowerCase().replace(/[^a-z0-9.]/g, '').replace(/\.+/g, '.').replace(/^\.|\.$/g, '')
}

const ACCESS_COPY: Record<AccessRole, string> = {
  admin: 'Admin access can manage team settings, members and workspace operations allowed by the active plan.',
  member: 'Member access can contribute to assigned work and operate features allowed by the active plan.',
  viewer: 'Viewer access can review permitted information without changing sensitive workspace settings.',
}

function accessLabel(role: AccessRole) {
  if (role === 'admin') return 'Admin'
  if (role === 'member') return 'Member'
  return 'Viewer'
}

export function AccountBasicInfoPage({
  user,
  onBack,
  onSave,
  onOpenPlans,
}: {
  user?: AccountUser
  onBack?: () => void
  onSave?: () => void
  onOpenPlans?: () => void
}) {
  const fallbackUser = useMemo(() => user ?? { id: 'local', name: 'User', email: '' }, [user])
  const { t, locale, setLocale } = useI18n()
  const [profile, setProfile] = useState<UserProfile>(() => ({ ...createDefaultProfile(fallbackUser), language: locale }))
  const [saving, setSaving] = useState(false)
  const [accessRole, setAccessRole] = useState<AccessRole>('admin')
  const inputRef = useRef<HTMLInputElement>(null)
  const dirtyRef = useRef(false)

  useEffect(() => {
    let cancelled = false
    loadUserProfile(fallbackUser).then((nextProfile) => {
      if (!cancelled && !dirtyRef.current) setProfile(nextProfile)
    })
    return () => { cancelled = true }
  }, [fallbackUser])

  useEffect(() => {
    let cancelled = false
    loadCurrentAccessRole(fallbackUser.id).then((role) => {
      if (!cancelled) setAccessRole(role)
    })
    return () => { cancelled = true }
  }, [fallbackUser.id])

  const selectedCountry = COUNTRIES.find((country) => country.value === profile.location)
  const avatarInitials = `${profile.firstName[0] ?? ''}${profile.lastName[0] ?? ''}`.toUpperCase() || 'U'

  function updateProfile(patch: Partial<UserProfile>) {
    dirtyRef.current = true
    setProfile((current) => {
      const next = { ...current, ...patch }
      if ('firstName' in patch || 'lastName' in patch) {
        next.username = buildUsername(next.firstName, next.lastName)
      }
      return next
    })
  }

  function handleFile(event: ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0]
    if (!file) return
    const reader = new FileReader()
    reader.onload = () => updateProfile({ avatarUrl: typeof reader.result === 'string' ? reader.result : null })
    reader.readAsDataURL(file)
  }

  function handleRemove() {
    updateProfile({ avatarUrl: null })
    if (inputRef.current) inputRef.current.value = ''
  }

  async function handleSave() {
    setSaving(true)
    try {
      const savedProfile = await saveUserProfile(profile)
      dirtyRef.current = false
      setProfile(savedProfile)
      setLocale(savedProfile.language)
      onSave?.()
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="flex h-full w-full flex-col px-1">
      <Card className="flex h-full flex-col gap-0 border p-6">
        <div className="border-b pb-4">
          <h2 className="text-2xl font-semibold tracking-tight">{t('account.personalInfo')}</h2>
          <p className="mt-1.5 text-sm text-muted-foreground">{t('account.personalInfoDesc')}</p>
          <Popover>
            <PopoverTrigger asChild>
              <button type="button" className="mt-3 inline-flex items-center gap-2 rounded-full border border-[#2F4858]/20 bg-[#2F4858]/8 px-3 py-1.5 text-xs font-medium text-[#2F4858] transition-colors hover:bg-[#2F4858]/12">
                <ShieldCheck className="h-3.5 w-3.5" />
                Active access: {accessLabel(accessRole)}
                <Info className="h-3.5 w-3.5" />
              </button>
            </PopoverTrigger>
            <PopoverContent align="start" className="space-y-3">
              <div className="space-y-1">
                <p className="text-sm font-semibold">{accessLabel(accessRole)} access</p>
                <p className="text-sm text-muted-foreground">{ACCESS_COPY[accessRole]}</p>
              </div>
              <Button type="button" size="sm" onClick={onOpenPlans}>Details</Button>
            </PopoverContent>
          </Popover>
        </div>

        <form className="flex h-full flex-col" onSubmit={(event) => event.preventDefault()}>
          <div className="flex-1 space-y-5 py-5">
            <section className="rounded-xl border bg-muted/30 p-4">
              <div className="grid grid-cols-1 gap-4 lg:grid-cols-[auto_1fr_auto] lg:items-center">
                <div className="relative">
                  <div className="flex h-20 w-20 items-center justify-center overflow-hidden rounded-full bg-primary/10 text-xl font-semibold text-primary">
                    {profile.avatarUrl ? <img src={profile.avatarUrl} alt="Profile" className="h-full w-full object-cover" /> : avatarInitials}
                  </div>
                  <button type="button" onClick={() => inputRef.current?.click()} className="absolute bottom-0 right-0 inline-flex h-7 w-7 items-center justify-center rounded-full bg-foreground text-background shadow transition-colors hover:opacity-90" aria-label="Upload avatar">
                    <Camera className="h-3.5 w-3.5" />
                  </button>
                  <input ref={inputRef} type="file" accept="image/*" className="hidden" onChange={handleFile} />
                </div>
                <div className="min-w-0 space-y-1">
                  <p className="text-sm font-semibold">{t('account.profileAvatar')}</p>
                  <p className="text-xs leading-5 text-muted-foreground">{t('account.profileAvatarDesc')}</p>
                </div>
                <div className="flex flex-wrap gap-2 lg:justify-end">
                  <Button type="button" variant="outline" size="sm" onClick={() => inputRef.current?.click()}>
                    <Upload className="h-4 w-4" />
                    {profile.avatarUrl ? t('account.replace') : t('account.uploadNew')}
                  </Button>
                  {profile.avatarUrl ? (
                    <Button type="button" variant="outline" size="sm" onClick={handleRemove}>
                      <Trash2 className="h-4 w-4" />
                      {t('account.remove')}
                    </Button>
                  ) : null}
                </div>
              </div>
            </section>

            <section className="space-y-3">
              <div className="grid grid-cols-1 gap-4 xl:grid-cols-3">
                <Field>
                  <FieldLabel htmlFor="firstName" icon={<User className="h-4 w-4" />}>{t('account.firstName')}</FieldLabel>
                  <Input id="firstName" value={profile.firstName} onChange={(event) => updateProfile({ firstName: event.target.value })} />
                </Field>
                <Field>
                  <FieldLabel htmlFor="lastName" icon={<User className="h-4 w-4" />}>{t('account.lastName')}</FieldLabel>
                  <Input id="lastName" value={profile.lastName} onChange={(event) => updateProfile({ lastName: event.target.value })} />
                </Field>
                <Field>
                  <FieldLabel htmlFor="username" icon={<User className="h-4 w-4" />}>{t('account.username')}</FieldLabel>
                  <Input id="username" value={profile.username} onChange={(event) => updateProfile({ username: event.target.value })} />
                </Field>
              </div>
            </section>

            <section className="space-y-3">
              <div className="grid grid-cols-1 gap-4 xl:grid-cols-4">
                <Field>
                  <FieldLabel htmlFor="gender" icon={<User className="h-4 w-4" />}>{t('account.gender')}</FieldLabel>
                  <Select value={profile.gender || undefined} onValueChange={(value) => updateProfile({ gender: value })}>
                    <SelectTrigger id="gender"><SelectValue placeholder={t('account.gender')} /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="masculino">{t('account.masculino')}</SelectItem>
                      <SelectItem value="feminino">{t('account.feminino')}</SelectItem>
                    </SelectContent>
                  </Select>
                </Field>
                <Field>
                  <FieldLabel htmlFor="birthDate" icon={<User className="h-4 w-4" />}>{t('account.birthDate')}</FieldLabel>
                  <Input id="birthDate" type="date" value={profile.birthDate} onChange={(event) => updateProfile({ birthDate: event.target.value })} />
                </Field>
                <Field>
                  <FieldLabel htmlFor="email" icon={<Mail className="h-4 w-4" />}>{t('account.email')}</FieldLabel>
                  <Input id="email" type="email" value={profile.email} onChange={(event) => updateProfile({ email: event.target.value })} />
                </Field>
                <Field>
                  <FieldLabel htmlFor="language" icon={<Globe className="h-4 w-4" />}>{t('account.language')}</FieldLabel>
                  <Select value={profile.language} onValueChange={(value) => updateProfile({ language: value as Locale })}>
                    <SelectTrigger id="language"><SelectValue placeholder={t('account.language')} /></SelectTrigger>
                    <SelectContent>
                      {LOCALES.map((item) => <SelectItem key={item.value} value={item.value}>{item.label}</SelectItem>)}
                    </SelectContent>
                  </Select>
                </Field>
              </div>
            </section>

            <section className="space-y-3">
              <div className="grid grid-cols-1 gap-4 xl:grid-cols-3">
                <Field>
                  <FieldLabel htmlFor="location" icon={<Globe className="h-4 w-4" />}>{t('account.location')}</FieldLabel>
                  <Select value={profile.location || undefined} onValueChange={(value) => {
                    const country = COUNTRIES.find((item) => item.value === value)
                    updateProfile({ location: value, timezone: country?.timezone ?? profile.timezone })
                  }}>
                    <SelectTrigger id="location"><SelectValue placeholder={t('account.countryPlaceholder')} /></SelectTrigger>
                    <SelectContent>
                      {COUNTRIES.map((country) => <SelectItem key={country.value} value={country.value}>{locale === 'pt-BR' ? country.pt : country.en}</SelectItem>)}
                    </SelectContent>
                  </Select>
                </Field>
                <Field>
                  <FieldLabel htmlFor="timezone" icon={<Globe className="h-4 w-4" />}>{t('account.timezone')}</FieldLabel>
                  <Input id="timezone" value={selectedCountry?.timezone ?? profile.timezone} disabled />
                </Field>
                <Field>
                  <FieldLabel htmlFor="phone" icon={<Phone className="h-4 w-4" />}>{t('account.phone')}</FieldLabel>
                  <Input id="phone" value={profile.phone} onChange={(event) => updateProfile({ phone: event.target.value })} />
                </Field>
              </div>
            </section>
          </div>

          <div className="flex justify-end gap-3 border-t pt-5">
            <Button type="button" variant="outline" onClick={onBack} disabled={saving}>{t('common.back')}</Button>
            <Button type="button" disabled={saving} onClick={handleSave}>
              {saving ? <><Loader2 className="mr-2 h-4 w-4 animate-spin" />{t('account.saving')}</> : t('account.saveChanges')}
            </Button>
          </div>
        </form>
      </Card>
    </div>
  )
}
