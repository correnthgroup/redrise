import { useRef, useState, type ChangeEvent, type ReactNode } from 'react'
import { format } from 'date-fns'
import {
  Briefcase,
  CalendarIcon,
  Camera,
  Globe,
  GraduationCap,
  Mail,
  MapPin,
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

export function AccountBasicInfoPage() {
  const [birthDate, setBirthDate] = useState<Date>()
  const [preview, setPreview] = useState<string | null>(null)
  const inputRef = useRef<HTMLInputElement>(null)

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
          <h2 className="text-2xl font-semibold tracking-tight">Personal Information</h2>
          <p className="mt-1.5 text-sm text-muted-foreground">
            Manage your personal details, profile identity and contact information used across the workspace.
          </p>
        </div>

        <form className="flex h-full flex-col">
          <div className="flex-1 space-y-5 py-5">
            <section className="space-y-3">
              <h3 className="text-sm font-medium">Basic Details</h3>
              <div className="grid grid-cols-1 gap-4 xl:grid-cols-[1.35fr_1.35fr_1.1fr]">
                <Field>
                  <FieldLabel htmlFor="firstName" icon={<User className="h-4 w-4" />}>First Name</FieldLabel>
                  <Input id="firstName" placeholder="Adm" defaultValue="Adm" />
                </Field>
                <Field>
                  <FieldLabel htmlFor="lastName" icon={<User className="h-4 w-4" />}>Last Name</FieldLabel>
                  <Input id="lastName" placeholder="Agentra" defaultValue="Agentra" />
                </Field>
                <Field>
                  <FieldLabel htmlFor="username" icon={<User className="h-4 w-4" />}>Username</FieldLabel>
                  <Input id="username" placeholder="adm" defaultValue="adm" />
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
                  <p className="text-sm font-semibold">Profile Avatar</p>
                  <p className="text-xs leading-5 text-muted-foreground">
                    This image appears in the sidebar, team members list and workspace activity views. Recommended: square JPG or PNG, at least 256x256px.
                  </p>
                </div>

                <div className="flex flex-wrap gap-2 lg:justify-end">
                  <Button type="button" variant="outline" size="sm" onClick={() => inputRef.current?.click()}>
                    <Upload className="h-4 w-4" />
                    {preview ? 'Replace' : 'Upload New'}
                  </Button>
                  {preview ? (
                    <Button type="button" variant="outline" size="sm" onClick={handleRemove}>
                      <Trash2 className="h-4 w-4" />
                      Remove
                    </Button>
                  ) : null}
                </div>
              </div>
            </section>

            <section className="space-y-3">
              <h3 className="text-sm font-medium">Professional Information</h3>
              <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-4">
                <Field>
                  <FieldLabel htmlFor="gender" icon={<User className="h-4 w-4" />}>Gender</FieldLabel>
                  <Select defaultValue="placeholder-a"><SelectTrigger id="gender"><SelectValue placeholder="Select Gender" /></SelectTrigger><SelectContent><SelectItem value="placeholder-a">Placeholder A</SelectItem><SelectItem value="placeholder-b">Placeholder B</SelectItem></SelectContent></Select>
                </Field>
                <Field>
                  <FieldLabel icon={<CalendarIcon className="h-4 w-4" />}>Birth Date</FieldLabel>
                  <Popover>
                    <PopoverTrigger asChild>
                      <Button variant="outline" className="w-full justify-start text-left font-normal">
                        <CalendarIcon className="mr-2 h-4 w-4" />
                        {birthDate ? format(birthDate, 'PPP') : 'Select a date'}
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0" align="start">
                      <Calendar mode="single" selected={birthDate} onSelect={setBirthDate} />
                    </PopoverContent>
                  </Popover>
                </Field>
                <Field>
                  <FieldLabel htmlFor="profession" icon={<Briefcase className="h-4 w-4" />}>Profession</FieldLabel>
                  <Select defaultValue="placeholder-a"><SelectTrigger id="profession"><SelectValue placeholder="Select Profession" /></SelectTrigger><SelectContent><SelectItem value="placeholder-a">Placeholder Profession</SelectItem><SelectItem value="placeholder-b">Placeholder Role</SelectItem></SelectContent></Select>
                </Field>
                <Field>
                  <FieldLabel htmlFor="education" icon={<GraduationCap className="h-4 w-4" />}>Education</FieldLabel>
                  <Select defaultValue="placeholder-a"><SelectTrigger id="education"><SelectValue placeholder="Select Level" /></SelectTrigger><SelectContent><SelectItem value="placeholder-a">Placeholder Level</SelectItem><SelectItem value="placeholder-b">Placeholder Degree</SelectItem></SelectContent></Select>
                </Field>
              </div>
            </section>

            <section className="space-y-3">
              <h3 className="text-sm font-medium">Contact Information</h3>
              <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-4">
                <Field>
                  <FieldLabel htmlFor="email" icon={<Mail className="h-4 w-4" />}>Email Address</FieldLabel>
                  <Input id="email" type="email" placeholder="adm@agentra.ai" defaultValue="adm@agentra.ai" />
                </Field>
                <Field>
                  <FieldLabel htmlFor="confirmEmail" icon={<Mail className="h-4 w-4" />}>Confirm Email</FieldLabel>
                  <Input id="confirmEmail" type="email" placeholder="adm@agentra.ai" defaultValue="adm@agentra.ai" />
                </Field>
                <Field>
                  <FieldLabel htmlFor="phone" icon={<Phone className="h-4 w-4" />}>Phone Number</FieldLabel>
                  <Input id="phone" placeholder="+00 0000-0000" defaultValue="+00 0000-0000" />
                </Field>
                <Field>
                  <FieldLabel htmlFor="location" icon={<MapPin className="h-4 w-4" />}>Location</FieldLabel>
                  <Input id="location" placeholder="City, Country" defaultValue="City, Country" />
                </Field>
              </div>
            </section>

            <section className="space-y-3">
              <h3 className="text-sm font-medium">Additional Information</h3>
              <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-4">
                <Field>
                  <FieldLabel htmlFor="language" icon={<Globe className="h-4 w-4" />}>Preferred Language</FieldLabel>
                  <Select defaultValue="placeholder-a"><SelectTrigger id="language"><SelectValue placeholder="Select Language" /></SelectTrigger><SelectContent><SelectItem value="placeholder-a">English</SelectItem><SelectItem value="placeholder-b">Portuguese</SelectItem></SelectContent></Select>
                </Field>
                <Field>
                  <FieldLabel htmlFor="timezone" icon={<Globe className="h-4 w-4" />}>Time Zone</FieldLabel>
                  <Select defaultValue="placeholder-a"><SelectTrigger id="timezone"><SelectValue placeholder="Select Time Zone" /></SelectTrigger><SelectContent><SelectItem value="placeholder-a">UTC-03:00</SelectItem><SelectItem value="placeholder-b">UTC+00:00</SelectItem></SelectContent></Select>
                </Field>
                <Field>
                  <FieldLabel htmlFor="website" icon={<Globe className="h-4 w-4" />}>Website</FieldLabel>
                  <Input id="website" placeholder="https://example.com" defaultValue="https://example.com" />
                </Field>
                <Field>
                  <FieldLabel htmlFor="portfolio" icon={<Globe className="h-4 w-4" />}>Portfolio</FieldLabel>
                  <Input id="portfolio" placeholder="portfolio link" defaultValue="portfolio link" />
                </Field>
              </div>
            </section>
          </div>

          <div className="flex justify-end gap-3 border-t pt-5">
            <Button type="button" variant="outline">Cancel</Button>
            <Button type="submit">Save Changes</Button>
          </div>
        </form>
      </Card>
    </div>
  )
}
