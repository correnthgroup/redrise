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
import { loadUserProfile, saveUserProfile, type UserProfile } from '@/lib/user-profile'
import { loadCurrentAccessRole, type AccessRole } from '@/lib/team-members'

type AccountUser = { id: string; name: string; email: string; avatarUrl?: string | null }

const COUNTRIES = [
  { value: 'AF', en: 'Afghanistan', pt: 'Afeganistão', timezone: 'Asia/Kabul' },
  { value: 'AL', en: 'Albania', pt: 'Albânia', timezone: 'Europe/Tirane' },
  { value: 'DZ', en: 'Algeria', pt: 'Argélia', timezone: 'Africa/Algiers' },
  { value: 'AD', en: 'Andorra', pt: 'Andorra', timezone: 'Europe/Andorra' },
  { value: 'AO', en: 'Angola', pt: 'Angola', timezone: 'Africa/Luanda' },
  { value: 'AR', en: 'Argentina', pt: 'Argentina', timezone: 'America/Argentina/Buenos_Aires' },
  { value: 'AM', en: 'Armenia', pt: 'Armênia', timezone: 'Asia/Yerevan' },
  { value: 'AU', en: 'Australia', pt: 'Austrália', timezone: 'Australia/Sydney' },
  { value: 'AT', en: 'Austria', pt: 'Áustria', timezone: 'Europe/Vienna' },
  { value: 'AZ', en: 'Azerbaijan', pt: 'Azerbaijão', timezone: 'Asia/Baku' },
  { value: 'BS', en: 'Bahamas', pt: 'Bahamas', timezone: 'America/Nassau' },
  { value: 'BH', en: 'Bahrain', pt: 'Bahrein', timezone: 'Asia/Bahrain' },
  { value: 'BD', en: 'Bangladesh', pt: 'Bangladesh', timezone: 'Asia/Dhaka' },
  { value: 'BB', en: 'Barbados', pt: 'Barbados', timezone: 'America/Barbados' },
  { value: 'BY', en: 'Belarus', pt: 'Bielorrússia', timezone: 'Europe/Minsk' },
  { value: 'BE', en: 'Belgium', pt: 'Bélgica', timezone: 'Europe/Brussels' },
  { value: 'BZ', en: 'Belize', pt: 'Belize', timezone: 'America/Belize' },
  { value: 'BJ', en: 'Benin', pt: 'Benin', timezone: 'Africa/Porto-Novo' },
  { value: 'BT', en: 'Bhutan', pt: 'Butão', timezone: 'Asia/Thimphu' },
  { value: 'BO', en: 'Bolivia', pt: 'Bolívia', timezone: 'America/La_Paz' },
  { value: 'BA', en: 'Bosnia and Herzegovina', pt: 'Bósnia e Herzegovina', timezone: 'Europe/Sarajevo' },
  { value: 'BW', en: 'Botswana', pt: 'Botsuana', timezone: 'Africa/Gaborone' },
  { value: 'BR', en: 'Brazil', pt: 'Brasil', timezone: 'America/Sao_Paulo' },
  { value: 'BN', en: 'Brunei', pt: 'Brunei', timezone: 'Asia/Brunei' },
  { value: 'BG', en: 'Bulgaria', pt: 'Bulgária', timezone: 'Europe/Sofia' },
  { value: 'BF', en: 'Burkina Faso', pt: 'Burkina Faso', timezone: 'Africa/Ouagadougou' },
  { value: 'BI', en: 'Burundi', pt: 'Burundi', timezone: 'Africa/Bujumbura' },
  { value: 'KH', en: 'Cambodia', pt: 'Camboja', timezone: 'Asia/Phnom_Penh' },
  { value: 'CM', en: 'Cameroon', pt: 'Camarões', timezone: 'Africa/Douala' },
  { value: 'CA', en: 'Canada', pt: 'Canadá', timezone: 'America/Toronto' },
  { value: 'CV', en: 'Cape Verde', pt: 'Cabo Verde', timezone: 'Atlantic/Cape_Verde' },
  { value: 'CF', en: 'Central African Republic', pt: 'República Centro-Africana', timezone: 'Africa/Bangui' },
  { value: 'TD', en: 'Chad', pt: 'Chade', timezone: 'Africa/Ndjamena' },
  { value: 'CL', en: 'Chile', pt: 'Chile', timezone: 'America/Santiago' },
  { value: 'CN', en: 'China', pt: 'China', timezone: 'Asia/Shanghai' },
  { value: 'CO', en: 'Colombia', pt: 'Colômbia', timezone: 'America/Bogota' },
  { value: 'KM', en: 'Comoros', pt: 'Comores', timezone: 'Indian/Comoro' },
  { value: 'CG', en: 'Congo', pt: 'Congo', timezone: 'Africa/Brazzaville' },
  { value: 'CR', en: 'Costa Rica', pt: 'Costa Rica', timezone: 'America/Costa_Rica' },
  { value: 'HR', en: 'Croatia', pt: 'Croácia', timezone: 'Europe/Zagreb' },
  { value: 'CU', en: 'Cuba', pt: 'Cuba', timezone: 'America/Havana' },
  { value: 'CY', en: 'Cyprus', pt: 'Chipre', timezone: 'Asia/Nicosia' },
  { value: 'CZ', en: 'Czech Republic', pt: 'República Tcheca', timezone: 'Europe/Prague' },
  { value: 'DK', en: 'Denmark', pt: 'Dinamarca', timezone: 'Europe/Copenhagen' },
  { value: 'DJ', en: 'Djibouti', pt: 'Djibuti', timezone: 'Africa/Djibouti' },
  { value: 'DO', en: 'Dominican Republic', pt: 'República Dominicana', timezone: 'America/Santo_Domingo' },
  { value: 'EC', en: 'Ecuador', pt: 'Equador', timezone: 'America/Guayaquil' },
  { value: 'EG', en: 'Egypt', pt: 'Egito', timezone: 'Africa/Cairo' },
  { value: 'SV', en: 'El Salvador', pt: 'El Salvador', timezone: 'America/El_Salvador' },
  { value: 'GQ', en: 'Equatorial Guinea', pt: 'Guiné Equatorial', timezone: 'Africa/Malabo' },
  { value: 'ER', en: 'Eritrea', pt: 'Eritreia', timezone: 'Africa/Asmara' },
  { value: 'EE', en: 'Estonia', pt: 'Estônia', timezone: 'Europe/Tallinn' },
  { value: 'SZ', en: 'Eswatini', pt: 'Esuatíni', timezone: 'Africa/Mbabane' },
  { value: 'ET', en: 'Ethiopia', pt: 'Etiópia', timezone: 'Africa/Addis_Ababa' },
  { value: 'FJ', en: 'Fiji', pt: 'Fiji', timezone: 'Pacific/Fiji' },
  { value: 'FI', en: 'Finland', pt: 'Finlândia', timezone: 'Europe/Helsinki' },
  { value: 'FR', en: 'France', pt: 'França', timezone: 'Europe/Paris' },
  { value: 'GA', en: 'Gabon', pt: 'Gabão', timezone: 'Africa/Libreville' },
  { value: 'GM', en: 'Gambia', pt: 'Gâmbia', timezone: 'Africa/Banjul' },
  { value: 'GE', en: 'Georgia', pt: 'Geórgia', timezone: 'Asia/Tbilisi' },
  { value: 'DE', en: 'Germany', pt: 'Alemanha', timezone: 'Europe/Berlin' },
  { value: 'GH', en: 'Ghana', pt: 'Gana', timezone: 'Africa/Accra' },
  { value: 'GR', en: 'Greece', pt: 'Grécia', timezone: 'Europe/Athens' },
  { value: 'GT', en: 'Guatemala', pt: 'Guatemala', timezone: 'America/Guatemala' },
  { value: 'GN', en: 'Guinea', pt: 'Guiné', timezone: 'Africa/Conakry' },
  { value: 'GW', en: 'Guinea-Bissau', pt: 'Guiné-Bissau', timezone: 'Africa/Bissau' },
  { value: 'GY', en: 'Guyana', pt: 'Guiana', timezone: 'America/Guyana' },
  { value: 'HT', en: 'Haiti', pt: 'Haiti', timezone: 'America/Port-au-Prince' },
  { value: 'HN', en: 'Honduras', pt: 'Honduras', timezone: 'America/Tegucigalpa' },
  { value: 'HK', en: 'Hong Kong', pt: 'Hong Kong', timezone: 'Asia/Hong_Kong' },
  { value: 'HU', en: 'Hungary', pt: 'Hungria', timezone: 'Europe/Budapest' },
  { value: 'IS', en: 'Iceland', pt: 'Islândia', timezone: 'Atlantic/Reykjavik' },
  { value: 'IN', en: 'India', pt: 'Índia', timezone: 'Asia/Kolkata' },
  { value: 'ID', en: 'Indonesia', pt: 'Indonésia', timezone: 'Asia/Jakarta' },
  { value: 'IR', en: 'Iran', pt: 'Irã', timezone: 'Asia/Tehran' },
  { value: 'IQ', en: 'Iraq', pt: 'Iraque', timezone: 'Asia/Baghdad' },
  { value: 'IE', en: 'Ireland', pt: 'Irlanda', timezone: 'Europe/Dublin' },
  { value: 'IL', en: 'Israel', pt: 'Israel', timezone: 'Asia/Jerusalem' },
  { value: 'IT', en: 'Italy', pt: 'Itália', timezone: 'Europe/Rome' },
  { value: 'JM', en: 'Jamaica', pt: 'Jamaica', timezone: 'America/Jamaica' },
  { value: 'JP', en: 'Japan', pt: 'Japão', timezone: 'Asia/Tokyo' },
  { value: 'JO', en: 'Jordan', pt: 'Jordânia', timezone: 'Asia/Amman' },
  { value: 'KZ', en: 'Kazakhstan', pt: 'Cazaquistão', timezone: 'Asia/Almaty' },
  { value: 'KE', en: 'Kenya', pt: 'Quênia', timezone: 'Africa/Nairobi' },
  { value: 'KI', en: 'Kiribati', pt: 'Kiribati', timezone: 'Pacific/Tarawa' },
  { value: 'KW', en: 'Kuwait', pt: 'Kuwait', timezone: 'Asia/Kuwait' },
  { value: 'KG', en: 'Kyrgyzstan', pt: 'Quirguistão', timezone: 'Asia/Bishkek' },
  { value: 'LA', en: 'Laos', pt: 'Laos', timezone: 'Asia/Vientiane' },
  { value: 'LV', en: 'Latvia', pt: 'Letônia', timezone: 'Europe/Riga' },
  { value: 'LB', en: 'Lebanon', pt: 'Líbano', timezone: 'Asia/Beirut' },
  { value: 'LS', en: 'Lesotho', pt: 'Lesoto', timezone: 'Africa/Maseru' },
  { value: 'LR', en: 'Liberia', pt: 'Libéria', timezone: 'Africa/Monrovia' },
  { value: 'LY', en: 'Libya', pt: 'Líbia', timezone: 'Africa/Tripoli' },
  { value: 'LI', en: 'Liechtenstein', pt: 'Liechtenstein', timezone: 'Europe/Vaduz' },
  { value: 'LT', en: 'Lithuania', pt: 'Lituânia', timezone: 'Europe/Vilnius' },
  { value: 'LU', en: 'Luxembourg', pt: 'Luxemburgo', timezone: 'Europe/Luxembourg' },
  { value: 'MO', en: 'Macau', pt: 'Macau', timezone: 'Asia/Macau' },
  { value: 'MG', en: 'Madagascar', pt: 'Madagascar', timezone: 'Indian/Antananarivo' },
  { value: 'MW', en: 'Malawi', pt: 'Malawi', timezone: 'Africa/Blantyre' },
  { value: 'MY', en: 'Malaysia', pt: 'Malásia', timezone: 'Asia/Kuala_Lumpur' },
  { value: 'MV', en: 'Maldives', pt: 'Maldivas', timezone: 'Indian/Maldives' },
  { value: 'ML', en: 'Mali', pt: 'Mali', timezone: 'Africa/Bamako' },
  { value: 'MT', en: 'Malta', pt: 'Malta', timezone: 'Europe/Malta' },
  { value: 'MR', en: 'Mauritania', pt: 'Mauritânia', timezone: 'Africa/Nouakchott' },
  { value: 'MU', en: 'Mauritius', pt: 'Maurício', timezone: 'Indian/Mauritius' },
  { value: 'MX', en: 'Mexico', pt: 'México', timezone: 'America/Mexico_City' },
  { value: 'MD', en: 'Moldova', pt: 'Moldávia', timezone: 'Europe/Chisinau' },
  { value: 'MC', en: 'Monaco', pt: 'Mônaco', timezone: 'Europe/Monaco' },
  { value: 'MN', en: 'Mongolia', pt: 'Mongólia', timezone: 'Asia/Ulaanbaatar' },
  { value: 'ME', en: 'Montenegro', pt: 'Montenegro', timezone: 'Europe/Podgorica' },
  { value: 'MA', en: 'Morocco', pt: 'Marrocos', timezone: 'Africa/Casablanca' },
  { value: 'MZ', en: 'Mozambique', pt: 'Moçambique', timezone: 'Africa/Maputo' },
  { value: 'MM', en: 'Myanmar', pt: 'Mianmar', timezone: 'Asia/Yangon' },
  { value: 'NA', en: 'Namibia', pt: 'Namíbia', timezone: 'Africa/Windhoek' },
  { value: 'NP', en: 'Nepal', pt: 'Nepal', timezone: 'Asia/Kathmandu' },
  { value: 'NL', en: 'Netherlands', pt: 'Países Baixos', timezone: 'Europe/Amsterdam' },
  { value: 'NZ', en: 'New Zealand', pt: 'Nova Zelândia', timezone: 'Pacific/Auckland' },
  { value: 'NI', en: 'Nicaragua', pt: 'Nicarágua', timezone: 'America/Managua' },
  { value: 'NE', en: 'Niger', pt: 'Níger', timezone: 'Africa/Niamey' },
  { value: 'NG', en: 'Nigeria', pt: 'Nigéria', timezone: 'Africa/Lagos' },
  { value: 'KP', en: 'North Korea', pt: 'Coreia do Norte', timezone: 'Asia/Pyongyang' },
  { value: 'MK', en: 'North Macedonia', pt: 'Macedônia do Norte', timezone: 'Europe/Skopje' },
  { value: 'NO', en: 'Norway', pt: 'Noruega', timezone: 'Europe/Oslo' },
  { value: 'OM', en: 'Oman', pt: 'Omã', timezone: 'Asia/Muscat' },
  { value: 'PK', en: 'Pakistan', pt: 'Paquistão', timezone: 'Asia/Karachi' },
  { value: 'PA', en: 'Panama', pt: 'Panamá', timezone: 'America/Panama' },
  { value: 'PG', en: 'Papua New Guinea', pt: 'Papua-Nova Guiné', timezone: 'Pacific/Port_Moresby' },
  { value: 'PY', en: 'Paraguay', pt: 'Paraguai', timezone: 'America/Asuncion' },
  { value: 'PE', en: 'Peru', pt: 'Peru', timezone: 'America/Lima' },
  { value: 'PH', en: 'Philippines', pt: 'Filipinas', timezone: 'Asia/Manila' },
  { value: 'PL', en: 'Poland', pt: 'Polônia', timezone: 'Europe/Warsaw' },
  { value: 'PT', en: 'Portugal', pt: 'Portugal', timezone: 'Europe/Lisbon' },
  { value: 'QA', en: 'Qatar', pt: 'Catar', timezone: 'Asia/Qatar' },
  { value: 'RO', en: 'Romania', pt: 'Romênia', timezone: 'Europe/Bucharest' },
  { value: 'RU', en: 'Russia', pt: 'Rússia', timezone: 'Europe/Moscow' },
  { value: 'RW', en: 'Rwanda', pt: 'Ruanda', timezone: 'Africa/Kigali' },
  { value: 'SA', en: 'Saudi Arabia', pt: 'Arábia Saudita', timezone: 'Asia/Riyadh' },
  { value: 'SN', en: 'Senegal', pt: 'Senegal', timezone: 'Africa/Dakar' },
  { value: 'RS', en: 'Serbia', pt: 'Sérvia', timezone: 'Europe/Belgrade' },
  { value: 'SC', en: 'Seychelles', pt: 'Seicheles', timezone: 'Indian/Mahe' },
  { value: 'SL', en: 'Sierra Leone', pt: 'Serra Leoa', timezone: 'Africa/Freetown' },
  { value: 'SG', en: 'Singapore', pt: 'Singapura', timezone: 'Asia/Singapore' },
  { value: 'SK', en: 'Slovakia', pt: 'Eslováquia', timezone: 'Europe/Bratislava' },
  { value: 'SI', en: 'Slovenia', pt: 'Eslovênia', timezone: 'Europe/Ljubljana' },
  { value: 'SO', en: 'Somalia', pt: 'Somália', timezone: 'Africa/Mogadishu' },
  { value: 'ZA', en: 'South Africa', pt: 'África do Sul', timezone: 'Africa/Johannesburg' },
  { value: 'KR', en: 'South Korea', pt: 'Coreia do Sul', timezone: 'Asia/Seoul' },
  { value: 'SS', en: 'South Sudan', pt: 'Sudão do Sul', timezone: 'Africa/Juba' },
  { value: 'ES', en: 'Spain', pt: 'Espanha', timezone: 'Europe/Madrid' },
  { value: 'LK', en: 'Sri Lanka', pt: 'Sri Lanka', timezone: 'Asia/Colombo' },
  { value: 'SD', en: 'Sudan', pt: 'Sudão', timezone: 'Africa/Khartoum' },
  { value: 'SR', en: 'Suriname', pt: 'Suriname', timezone: 'America/Paramaribo' },
  { value: 'SE', en: 'Sweden', pt: 'Suécia', timezone: 'Europe/Stockholm' },
  { value: 'CH', en: 'Switzerland', pt: 'Suíça', timezone: 'Europe/Zurich' },
  { value: 'SY', en: 'Syria', pt: 'Síria', timezone: 'Asia/Damascus' },
  { value: 'TW', en: 'Taiwan', pt: 'Taiwan', timezone: 'Asia/Taipei' },
  { value: 'TJ', en: 'Tajikistan', pt: 'Tajiquistão', timezone: 'Asia/Dushanbe' },
  { value: 'TZ', en: 'Tanzania', pt: 'Tanzânia', timezone: 'Africa/Dar_es_Salaam' },
  { value: 'TH', en: 'Thailand', pt: 'Tailândia', timezone: 'Asia/Bangkok' },
  { value: 'TL', en: 'Timor-Leste', pt: 'Timor-Leste', timezone: 'Asia/Dili' },
  { value: 'TG', en: 'Togo', pt: 'Togo', timezone: 'Africa/Lome' },
  { value: 'TT', en: 'Trinidad and Tobago', pt: 'Trinidad e Tobago', timezone: 'America/Port_of_Spain' },
  { value: 'TN', en: 'Tunisia', pt: 'Tunísia', timezone: 'Africa/Tunis' },
  { value: 'TR', en: 'Turkey', pt: 'Turquia', timezone: 'Europe/Istanbul' },
  { value: 'TM', en: 'Turkmenistan', pt: 'Turcomenistão', timezone: 'Asia/Ashgabat' },
  { value: 'UG', en: 'Uganda', pt: 'Uganda', timezone: 'Africa/Kampala' },
  { value: 'UA', en: 'Ukraine', pt: 'Ucrânia', timezone: 'Europe/Kiev' },
  { value: 'AE', en: 'United Arab Emirates', pt: 'Emirados Árabes Unidos', timezone: 'Asia/Dubai' },
  { value: 'GB', en: 'United Kingdom', pt: 'Reino Unido', timezone: 'Europe/London' },
  { value: 'US', en: 'United States', pt: 'Estados Unidos', timezone: 'America/New_York' },
  { value: 'UY', en: 'Uruguay', pt: 'Uruguai', timezone: 'America/Montevideo' },
  { value: 'UZ', en: 'Uzbekistan', pt: 'Uzbequistão', timezone: 'Asia/Tashkent' },
  { value: 'VU', en: 'Vanuatu', pt: 'Vanuatu', timezone: 'Pacific/Efate' },
  { value: 'VE', en: 'Venezuela', pt: 'Venezuela', timezone: 'America/Caracas' },
  { value: 'VN', en: 'Vietnam', pt: 'Vietnã', timezone: 'Asia/Ho_Chi_Minh' },
  { value: 'YE', en: 'Yemen', pt: 'Iêmen', timezone: 'Asia/Aden' },
  { value: 'ZM', en: 'Zambia', pt: 'Zâmbia', timezone: 'Africa/Lusaka' },
  { value: 'ZW', en: 'Zimbabwe', pt: 'Zimbábue', timezone: 'Africa/Harare' },
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

function buildUsername(firstName: string, middleName: string, lastName: string) {
  return [firstName, middleName, lastName]
    .filter(Boolean)
    .join('.')
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .replace(/[^a-z0-9.]/g, '.')
    .replace(/\.+/g, '.')
    .replace(/^\.|\.$/g, '')
}

const ACCESS_COPY_KEYS: Record<AccessRole, string> = {
  admin: 'account.adminAccessCopy',
  member: 'account.memberAccessCopy',
  viewer: 'account.viewerAccessCopy',
}

function accessLabelKey(role: AccessRole) {
  if (role === 'admin') return 'account.accessAdmin'
  if (role === 'member') return 'account.accessMember'
  return 'account.accessViewer'
}

function CountrySearchSelect({
  countries,
  locale,
  value,
  searchPlaceholder,
  emptyLabel,
  onSelect,
}: {
  countries: typeof COUNTRIES
  locale: Locale
  value: string
  searchPlaceholder: string
  emptyLabel: string
  onSelect: (value: string) => void
}) {
  const [query, setQuery] = useState('')
  const [open, setOpen] = useState(false)
  const [focused, setFocused] = useState(false)
  const selectingRef = useRef(false)
  const wrapperRef = useRef<HTMLDivElement>(null)

  const selectedCountry = countries.find((country) => country.value === value)
  const displayValue = focused ? query : (selectedCountry ? (locale === 'pt-BR' ? selectedCountry.pt : selectedCountry.en) : query)

  const filteredCountries = query.trim().length >= 1
    ? countries.filter((country) => {
        const label = locale === 'pt-BR' ? country.pt : country.en
        return label.toLowerCase().includes(query.trim().toLowerCase())
      })
    : []

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (wrapperRef.current && !wrapperRef.current.contains(e.target as Node)) {
        setOpen(false)
        setFocused(false)
        setQuery('')
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  return (
    <div className="relative" ref={wrapperRef}>
      <Input
        value={displayValue}
        placeholder={searchPlaceholder}
        onChange={(event) => {
          setQuery(event.target.value)
          setOpen(true)
        }}
        onFocus={() => {
          setFocused(true)
          if (query.trim().length >= 1) setOpen(true)
        }}
        onBlur={() => {
          if (selectingRef.current) return
          setOpen(false)
          if (!value) setQuery('')
          setFocused(false)
        }}
      />
      {open && (
        <div className="absolute z-50 mt-1 max-h-60 w-full overflow-y-auto rounded-md border bg-popover shadow-md">
          {filteredCountries.length === 0 ? (
            <div className="px-2 py-1.5 text-sm text-muted-foreground">{emptyLabel}</div>
          ) : (
            filteredCountries.map((country) => (
              <button
                key={country.value}
                type="button"
                className="flex w-full items-center justify-between rounded-sm px-2 py-1.5 text-left text-sm hover:bg-accent"
                onMouseDown={() => {
                  selectingRef.current = true
                }}
                onClick={() => {
                  onSelect(country.value)
                  setQuery('')
                  setOpen(false)
                  setFocused(false)
                  selectingRef.current = false
                }}
              >
                <span>{locale === 'pt-BR' ? country.pt : country.en}</span>
                <span className="text-xs text-muted-foreground">{country.timezone}</span>
              </button>
            ))
          )}
        </div>
      )}
    </div>
  )
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
  const [profile, setProfile] = useState<UserProfile | null>(null)
  const [profileLoading, setProfileLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [accessRole, setAccessRole] = useState<AccessRole>('admin')
  const inputRef = useRef<HTMLInputElement>(null)
  const dirtyRef = useRef(false)

  useEffect(() => {
    let cancelled = false
    loadUserProfile(fallbackUser).then((nextProfile) => {
      if (!cancelled && !dirtyRef.current) setProfile(nextProfile)
    }).finally(() => {
      if (!cancelled) setProfileLoading(false)
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

  const selectedCountry = COUNTRIES.find((country) => country.value === profile?.location)
  const avatarInitials = `${profile?.firstName[0] ?? ''}${profile?.lastName[0] ?? ''}`.toUpperCase() || 'U'

  function updateProfile(patch: Partial<UserProfile>) {
    if (!profile) return
    dirtyRef.current = true
    setProfile((current) => {
      if (!current) return current
      const next = { ...current, ...patch }
      if ('firstName' in patch || 'middleName' in patch || 'lastName' in patch) {
        next.username = buildUsername(next.firstName, next.middleName, next.lastName)
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
    if (!profile) return
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
              <button type="button" className="mt-3 inline-flex items-center gap-2 rounded-full border border-[#2F5D5A]/20 bg-[#2F5D5A]/8 px-3 py-1.5 text-xs font-medium text-[#2F5D5A] transition-colors hover:bg-[#2F5D5A]/12">
                <ShieldCheck className="h-3.5 w-3.5" />
                {t('account.activeAccess', { role: t(accessLabelKey(accessRole)) })}
                <Info className="h-3.5 w-3.5" />
              </button>
            </PopoverTrigger>
            <PopoverContent align="start" className="space-y-3">
              <div className="space-y-1">
                <p className="text-sm font-semibold">{t('account.accessTitle', { role: t(accessLabelKey(accessRole)) })}</p>
                <p className="text-sm text-muted-foreground">{t(ACCESS_COPY_KEYS[accessRole])}</p>
              </div>
              <Button type="button" size="sm" onClick={onOpenPlans}>{t('account.details')}</Button>
            </PopoverContent>
          </Popover>
        </div>

        <form className="flex h-full flex-col" onSubmit={(event) => event.preventDefault()}>
          {profileLoading || !profile ? (
            <div className="flex flex-1 items-center justify-center py-12">
              <div className="flex items-center gap-3 text-sm text-muted-foreground">
                <Loader2 className="h-4 w-4 animate-spin" />
                {t('account.loadingProfile')}
              </div>
            </div>
          ) : (
          <div className="flex-1 space-y-5 py-5">
            <section className="rounded-xl border bg-muted/30 p-4">
              <div className="grid grid-cols-1 gap-4 lg:grid-cols-[auto_1fr_auto] lg:items-center">
                <div className="relative">
                  <div className="flex h-20 w-20 items-center justify-center overflow-hidden rounded-full bg-primary/10 text-xl font-semibold text-primary">
                    {profile.avatarUrl ? <img src={profile.avatarUrl} alt={t('account.profileAvatarAlt')} className="h-full w-full object-cover" /> : avatarInitials}
                  </div>
                  <button type="button" onClick={() => inputRef.current?.click()} className="absolute bottom-0 right-0 inline-flex h-7 w-7 items-center justify-center rounded-full bg-foreground text-background shadow transition-colors hover:opacity-90" aria-label={t('account.uploadAvatar')}>
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
              <div className="grid grid-cols-1 gap-4 xl:grid-cols-4">
                <Field>
                  <FieldLabel htmlFor="firstName" icon={<User className="h-4 w-4" />}>{t('account.firstName')}</FieldLabel>
                  <Input id="firstName" value={profile.firstName} onChange={(event) => updateProfile({ firstName: event.target.value })} />
                </Field>
                <Field>
                  <FieldLabel htmlFor="middleName" icon={<User className="h-4 w-4" />}>{t('account.middleName')}</FieldLabel>
                  <Input id="middleName" value={profile.middleName} onChange={(event) => updateProfile({ middleName: event.target.value })} />
                </Field>
                <Field>
                  <FieldLabel htmlFor="lastName" icon={<User className="h-4 w-4" />}>{t('account.lastName')}</FieldLabel>
                  <Input id="lastName" value={profile.lastName} onChange={(event) => updateProfile({ lastName: event.target.value })} />
                </Field>
                <Field>
                  <FieldLabel htmlFor="username" icon={<User className="h-4 w-4" />}>{t('account.username')}</FieldLabel>
                  <Input id="username" value={profile.username} disabled />
                  <p className="text-xs text-muted-foreground">{t('account.readOnlyField')}</p>
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
                  <Input id="email" type="email" value={profile.email} disabled />
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
                  <CountrySearchSelect
                    countries={COUNTRIES}
                    locale={locale}
                    value={profile.location}
                    searchPlaceholder={t('account.searchCountry')}
                    emptyLabel={t('account.noCountriesFound')}
                    onSelect={(value) => {
                      const country = COUNTRIES.find((item) => item.value === value)
                      updateProfile({ location: value, timezone: country?.timezone ?? profile.timezone })
                    }}
                  />
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
          )}

          <div className="flex justify-end gap-3 border-t pt-5">
            <Button type="button" variant="outline" onClick={onBack} disabled={saving}>{t('common.back')}</Button>
            <Button type="button" disabled={saving || profileLoading || !profile} onClick={handleSave}>
              {saving ? <><Loader2 className="mr-2 h-4 w-4 animate-spin" />{t('account.saving')}</> : t('account.saveChanges')}
            </Button>
          </div>
        </form>
      </Card>
    </div>
  )
}
