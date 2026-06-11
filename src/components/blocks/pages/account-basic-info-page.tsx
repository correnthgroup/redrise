import { useRef, useState, type ChangeEvent, type ReactNode } from 'react'
import { format } from 'date-fns'
import {
  Briefcase,
  CalendarIcon,
  Camera,
  Globe,
  GraduationCap,
  Loader2,
  Mail,
  Phone,
  Trash2,
  Upload,
  User,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Calendar } from '@/components/ui/calendar'
import { Card } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { CitySearch } from '../shared/city-search'
import type { CityData } from '@/lib/cities'
import { useI18n } from '@/hooks/use-i18n'
import { LOCALES, type Locale } from '@/lib/i18n'

function Field({ children }: { children: ReactNode }) {
  return <div className="space-y-2">{children}</div>
}

function FieldLabel({
  htmlFor,
  icon,
  children,
}: {
  htmlFor?: string
  icon: ReactNode
  children: ReactNode
}) {
  return (
    <Label htmlFor={htmlFor} className="flex items-center gap-2">
      <span className="text-muted-foreground">{icon}</span>
      {children}
    </Label>
  )
}

export function AccountBasicInfoPage({ onBack, onSave }: { onBack?: () => void; onSave?: () => void }) {
  const { t, locale, setLocale } = useI18n()
  const [birthDate, setBirthDate] = useState<Date>()
  const [preview, setPreview] = useState<string | null>(null)
  const [timezone, setTimezone] = useState('UTC-03:00')
  const [saving, setSaving] = useState(false)
  const [pendingLocale, setPendingLocale] = useState(locale)
  const [firstName, setFirstName] = useState('')
  const [lastName, setLastName] = useState('')
  const inputRef = useRef<HTMLInputElement>(null)

  const username = firstName || lastName
    ? `${firstName}.${lastName}`.toLowerCase().replace(/[^a-z0-9.]/g, '').replace(/\.\./g, '.')
    : ''

  function handleFile(event: ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0]
    if (!file) return
    const reader = new FileReader()
    reader.onload = () => setPreview(typeof reader.result === 'string' ? reader.result : null)
    reader.readAsDataURL(file)
  }

  function handleRemove() {
    setPreview(null)
    if (inputRef.current) inputRef.current.value = ''
  }

  return (
    <div className="flex h-full w-full flex-col px-1">
      <Card className="flex h-full flex-col gap-0 border p-6">
          <div className="border-b pb-4">
            <h2 className="text-2xl font-semibold tracking-tight">{t('account.personalInfo')}</h2>
            <p className="mt-1.5 text-sm text-muted-foreground">
              {t('account.personalInfoDesc')}
            </p>
          </div>

        <form className="flex h-full flex-col">
          <div className="flex-1 space-y-5 py-5">
            <section className="space-y-3">
              <h3 className="text-sm font-medium">{t('account.basicDetails')}</h3>
              <div className="grid grid-cols-1 gap-4 xl:grid-cols-[1.35fr_1.35fr_1.1fr]">
                <Field>
                  <FieldLabel htmlFor="firstName" icon={<User className="h-4 w-4" />}>{t('account.firstName')}</FieldLabel>
                  <Input id="firstName" placeholder="Adm" value={firstName} onChange={(e) => setFirstName(e.target.value)} />
                </Field>
                <Field>
                  <FieldLabel htmlFor="lastName" icon={<User className="h-4 w-4" />}>{t('account.lastName')}</FieldLabel>
                  <Input id="lastName" placeholder="Agentra" value={lastName} onChange={(e) => setLastName(e.target.value)} />
                </Field>
                <Field>
                  <FieldLabel htmlFor="username" icon={<User className="h-4 w-4" />}>{t('account.username')}</FieldLabel>
                  <Input id="username" placeholder="nome.sobrenome" value={username} disabled />
                </Field>
              </div>
            </section>

            <section className="rounded-xl border bg-muted/30 p-4">
              <div className="grid grid-cols-1 gap-4 lg:grid-cols-[auto_1fr_auto] lg:items-center">
                <div className="relative">
                  <div className="flex h-20 w-20 items-center justify-center overflow-hidden rounded-full bg-violet-100 text-xl font-semibold text-violet-700">
                    {preview ? <img src={preview} alt="Profile" className="h-full w-full object-cover" /> : 'AD'}
                  </div>
                  <button
                    type="button"
                    onClick={() => inputRef.current?.click()}
                    className="absolute bottom-0 right-0 inline-flex h-7 w-7 items-center justify-center rounded-full bg-foreground text-background shadow transition-colors hover:opacity-90"
                    aria-label="Upload avatar"
                  >
                    <Camera className="h-3.5 w-3.5" />
                  </button>
                  <input ref={inputRef} type="file" accept="image/*" className="hidden" onChange={handleFile} />
                </div>

                <div className="min-w-0 space-y-1">
                  <p className="text-sm font-semibold">{t('account.profileAvatar')}</p>
                  <p className="text-xs leading-5 text-muted-foreground">
                    {t('account.profileAvatarDesc')}
                  </p>
                </div>

                <div className="flex flex-wrap gap-2 lg:justify-end">
                  <Button type="button" variant="outline" size="sm" onClick={() => inputRef.current?.click()}>
                    <Upload className="h-4 w-4" />
                    {preview ? t('account.replace') : t('account.uploadNew')}
                  </Button>
                  {preview ? (
                    <Button type="button" variant="outline" size="sm" onClick={handleRemove}>
                      <Trash2 className="h-4 w-4" />
                      {t('account.remove')}
                    </Button>
                  ) : null}
                </div>
              </div>
            </section>

            <section className="space-y-3">
              <h3 className="text-sm font-medium">{t('account.professionalInfo')}</h3>
              <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-4">
                <Field>
                  <FieldLabel htmlFor="gender" icon={<User className="h-4 w-4" />}>{t('account.gender')}</FieldLabel>
                  <Select defaultValue="masculino"><SelectTrigger id="gender"><SelectValue placeholder={t('account.gender')} /></SelectTrigger><SelectContent><SelectItem value="masculino">{t('account.masculino')}</SelectItem><SelectItem value="feminino">{t('account.feminino')}</SelectItem></SelectContent></Select>
                </Field>
                <Field>
                  <FieldLabel icon={<CalendarIcon className="h-4 w-4" />}>{t('account.birthDate')}</FieldLabel>
                  <Popover>
                    <PopoverTrigger asChild>
                      <Button variant="outline" className="w-full justify-start text-left font-normal">
                        <CalendarIcon className="mr-2 h-4 w-4" />
                        {birthDate ? format(birthDate, 'PPP') : t('account.selectDate')}
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0" align="start">
                      <Calendar mode="single" selected={birthDate} onSelect={setBirthDate} />
                    </PopoverContent>
                  </Popover>
                </Field>
                <Field>
                  <FieldLabel htmlFor="profession" icon={<Briefcase className="h-4 w-4" />}>{t('account.profession')}</FieldLabel>
                  <Input id="profession" placeholder={t('account.professionPlaceholder')} defaultValue="" />
                </Field>
                <Field>
                  <FieldLabel htmlFor="education" icon={<GraduationCap className="h-4 w-4" />}>{t('account.education')}</FieldLabel>
                  <Input id="education" placeholder={t('account.educationPlaceholder')} defaultValue="" />
                </Field>
              </div>
            </section>

            <section className="space-y-3">
              <h3 className="text-sm font-medium">{t('account.contactInfo')}</h3>
              <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-4">
                <Field>
                  <FieldLabel htmlFor="email" icon={<Mail className="h-4 w-4" />}>{t('account.email')}</FieldLabel>
                  <Input id="email" type="email" placeholder="adm@agentra.ai" defaultValue="adm@agentra.ai" />
                </Field>
                <Field>
                  <FieldLabel htmlFor="confirmEmail" icon={<Mail className="h-4 w-4" />}>{t('account.confirmEmail')}</FieldLabel>
                  <Input id="confirmEmail" type="email" placeholder="adm@agentra.ai" defaultValue="adm@agentra.ai" />
                </Field>
                <Field>
                  <FieldLabel htmlFor="phone" icon={<Phone className="h-4 w-4" />}>{t('account.phone')}</FieldLabel>
                  <Input id="phone" placeholder="+00 0000-0000" defaultValue="+00 0000-0000" />
                </Field>
                <Field>
                  <FieldLabel htmlFor="location" icon={<Globe className="h-4 w-4" />}>{t('account.location')}</FieldLabel>
                  <CitySearch
                    value=""
                    onSelect={(city: CityData) => setTimezone(city.utcOffset)}
                  />
                </Field>
              </div>
            </section>

            <section className="space-y-3">
              <h3 className="text-sm font-medium">{t('account.additionalInfo')}</h3>
              <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-4">
                <Field>
                  <FieldLabel htmlFor="language" icon={<Globe className="h-4 w-4" />}>{t('account.language')}</FieldLabel>
                  <Select
                    value={pendingLocale}
                    onValueChange={(val) => setPendingLocale(val as Locale)}
                  >
                    <SelectTrigger id="language">
                      <SelectValue placeholder={t('account.language')} />
                    </SelectTrigger>
                    <SelectContent>
                      {LOCALES.map((l) => (
                        <SelectItem key={l.value} value={l.value}>{l.label}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </Field>
                <Field>
                  <FieldLabel htmlFor="timezone" icon={<Globe className="h-4 w-4" />}>{t('account.timezone')}</FieldLabel>
                  <Input id="timezone" value={timezone} disabled />
                </Field>
                <Field>
                  <FieldLabel htmlFor="website" icon={<Globe className="h-4 w-4" />}>{t('account.website')}</FieldLabel>
                  <Input id="website" placeholder="https://example.com" defaultValue="" />
                </Field>
                <Field>
                  <FieldLabel htmlFor="portfolio" icon={<Globe className="h-4 w-4" />}>{t('account.portfolio')}</FieldLabel>
                  <Input id="portfolio" placeholder="Portfolio link" defaultValue="" />
                </Field>
              </div>
            </section>
          </div>

          <div className="flex justify-end gap-3 border-t pt-5">
            <Button type="button" variant="outline" onClick={onBack} disabled={saving}>{t('account.cancel')}</Button>
            <Button
              type="button"
              disabled={saving}
              onClick={async () => {
                setSaving(true)
                // Apply language change
                setLocale(pendingLocale)
                // Simulate save delay
                await new Promise((resolve) => setTimeout(resolve, 1000))
                setSaving(false)
                onSave?.()
              }}
            >
              {saving ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  {t('account.saving')}
                </>
              ) : (
                t('account.saveChanges')
              )}
            </Button>
          </div>
        </form>
      </Card>
    </div>
  )
}
