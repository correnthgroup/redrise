import { useMemo, useState, type FormEvent } from 'react'
import { Check, Loader2, X } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { RequiredLabel } from '@/components/ui/required-label'
import { supabase } from '@/lib/supabase'
import { cn } from '@/lib/utils'
import { registerActiveSession } from '@/lib/user-profile'
import { useI18n } from '@/hooks/use-i18n'
import { PasswordInput } from './password-input'
import styles from './auth-flow.module.css'

type AuthMode = 'sign-in' | 'sign-up'

const PASSWORD_RULES = [
  { id: 'len', labelKey: 'auth.passwordRuleLength', test: (value: string) => value.length >= 8 },
  { id: 'letter', labelKey: 'auth.passwordRuleLetter', test: (value: string) => /[A-Za-z]/.test(value) },
  { id: 'digit', labelKey: 'auth.passwordRuleNumber', test: (value: string) => /\d/.test(value) },
]

const ART_QUOTES = [
  'auth.quote.truth',
  'auth.quote.amateur',
  'auth.quote.courage',
]

const SIGNUP_NOTICE_KEY = 'redrise:signup-notice'

function isValidEmail(value: string) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value.trim())
}

function mapAuthError(message: string) {
  const lower = message.toLowerCase()
  if (lower.includes('email not confirmed') || lower.includes('confirm')) return 'auth.error.accountNotReady'
  if (lower.includes('invalid login') || lower.includes('invalid credentials')) return 'auth.error.invalidCredentials'
  if (lower.includes('rate limit') || lower.includes('too many')) return 'auth.error.rateLimit'
  if (lower.includes('network') || lower.includes('fetch')) return 'auth.error.network'
  return 'auth.error.generic'
}

export function AuthFlow({ onAccountCreationStart }: { onAccountCreationStart?: () => void }) {
  const { t } = useI18n()
  const inviteParams = typeof window === 'undefined' ? null : new URLSearchParams(window.location.search)
  const invitedEmail = inviteParams?.get('email') ?? ''
  const inviteToken = inviteParams?.get('invite_token') ?? ''
  const initialSignupNotice = typeof window === 'undefined' ? null : window.sessionStorage.getItem(SIGNUP_NOTICE_KEY)
  if (typeof window !== 'undefined' && initialSignupNotice) window.sessionStorage.removeItem(SIGNUP_NOTICE_KEY)
  const [mode, setMode] = useState<AuthMode>(inviteParams?.get('invited') ? 'sign-up' : 'sign-in')
  const [email, setEmail] = useState(invitedEmail)
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [firstName, setFirstName] = useState('')
  const [middleName, setMiddleName] = useState('')
  const [lastName, setLastName] = useState('')
  const [rememberMe, setRememberMe] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [notice, setNotice] = useState<string | null>(initialSignupNotice ? t(initialSignupNotice) : (inviteParams?.get('invited') ? t('auth.notice.invited') : null))
  const [loading, setLoading] = useState(false)

  const [quote] = useState(() => ART_QUOTES[Math.floor(Math.random() * ART_QUOTES.length)])

  const passwordState = useMemo(
    () => PASSWORD_RULES.map((rule) => ({ ...rule, met: rule.test(password) })),
    [password],
  )
  const allRulesMet = passwordState.every((rule) => rule.met)
  const signUpReady = firstName.trim().length >= 2 && lastName.trim().length > 0 && isValidEmail(email) && allRulesMet && confirmPassword === password

  function resetMessages() {
    setError(null)
    setNotice(null)
  }

  async function handleSignIn(event: FormEvent) {
    event.preventDefault()
    resetMessages()
    if (!isValidEmail(email) || !password) {
      setError(t('auth.error.emailPasswordRequired'))
      return
    }
    setLoading(true)
    const { data, error: authError } = await supabase.auth.signInWithPassword({ email: email.trim(), password })
    if (authError) {
      setError(t(mapAuthError(authError.message)))
      setLoading(false)
      return
    }
    if (data.user) {
      await registerActiveSession({ user: data.user, session: data.session, remembered: rememberMe, source: 'password' })
    }
    setLoading(false)
  }

  async function handleSignUp(event: FormEvent) {
    event.preventDefault()
    resetMessages()
    if (firstName.trim().length < 2) {
      setError(t('auth.error.firstNameLength'))
      return
    }
    if (!lastName.trim()) {
      setError(t('auth.error.lastNameRequired'))
      return
    }
    if (!isValidEmail(email)) {
      setError(t('auth.error.validEmail'))
      return
    }
    if (!allRulesMet) {
      setError(t('auth.error.passwordRequirements'))
      return
    }
    if (confirmPassword !== password) {
      setError(t('auth.error.passwordMismatch'))
      return
    }

    setLoading(true)
    window.sessionStorage.setItem(SIGNUP_NOTICE_KEY, 'auth.notice.accountCreated')
    onAccountCreationStart?.()
    const { error: authError } = await supabase.auth.signUp({
      email: email.trim(),
      password,
      options: {
        data: {
          first_name: firstName.trim(),
          middle_name: middleName.trim(),
          last_name: lastName.trim(),
          full_name: [firstName, middleName, lastName].map((value) => value.trim()).filter(Boolean).join(' '),
          invite_token: inviteToken,
        },
      },
    })
    if (authError) {
      window.sessionStorage.removeItem(SIGNUP_NOTICE_KEY)
      setLoading(false)
      setError(authError.message.toLowerCase().includes('rate limit') || authError.message.toLowerCase().includes('too many')
        ? t('auth.error.rateLimit')
        : t('auth.error.createAccount'))
      return
    }

    await supabase.auth.signOut()
    setLoading(false)
    setMode('sign-in')
    setNotice(t('auth.notice.accountCreated'))
    setEmail(email.trim())
    setPassword('')
    setConfirmPassword('')
  }

  return (
    <div className={styles.shell}>
      <section className={styles.formPanel}>
        <form className={styles.formInner} onSubmit={mode === 'sign-in' ? handleSignIn : handleSignUp}>
          <div className={styles.brandRow}>
            <div className={styles.brandMark}><img src="/logo-32.png" alt="Redrise" /></div>
            <div>
              <div className={styles.brandName}>Redrise</div>
              <div className={styles.brandTag}>{t('auth.brandTag')}</div>
            </div>
          </div>

          {mode === 'sign-in' ? (
            <>
              <h1 className={styles.heading}>{t('auth.signIn')}</h1>
              <p className={styles.subheading}>{t('auth.signInSubtitle')}</p>

              <div className={styles.fieldGroup}>
                <RequiredLabel htmlFor="email">{t('auth.email')}</RequiredLabel>
                <Input id="email" type="email" placeholder="you@example.com" value={email} onChange={(event) => setEmail(event.target.value)} autoComplete="email" />
              </div>
              <div className={styles.fieldGroup}>
                <RequiredLabel htmlFor="password">{t('auth.password')}</RequiredLabel>
                <PasswordInput id="password" toggleLabel={t('auth.togglePassword')} placeholder={t('auth.passwordPlaceholder')} value={password} onChange={(event) => setPassword(event.target.value)} autoComplete="current-password" />
              </div>
              <label className={styles.checkRow}>
                <input type="checkbox" checked={rememberMe} onChange={(event) => setRememberMe(event.target.checked)} />
                {t('auth.rememberMe')}
              </label>
              {notice && <div className={styles.noticeText}>{notice}</div>}
              {error && <div className={styles.errorText}>{error}</div>}
              <Button type="submit" disabled={loading}>
                {loading ? <><Loader2 className="mr-2 h-4 w-4 animate-spin" />{t('auth.signingIn')}</> : t('auth.signIn')}
              </Button>
              <p className={styles.centerLink}>{t('auth.noAccount')} <a href="#" onClick={(event) => { event.preventDefault(); setMode('sign-up'); resetMessages() }}>{t('auth.createAccount')}</a></p>
            </>
          ) : null}

          {mode === 'sign-up' ? (
            <>
              <h1 className={styles.heading}>{t('auth.createAccount')}</h1>
              <p className={styles.subheading}>{t('auth.createAccountSubtitle')}</p>

              <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
                <div className={styles.fieldGroup}>
                  <RequiredLabel htmlFor="first-name">{t('auth.firstName')}</RequiredLabel>
                  <Input id="first-name" required value={firstName} onChange={(event) => setFirstName(event.target.value)} placeholder={t('auth.firstNamePlaceholder')} autoComplete="given-name" />
                </div>
                <div className={styles.fieldGroup}>
                  <Label htmlFor="middle-name">{t('auth.middleName')}</Label>
                  <Input id="middle-name" value={middleName} onChange={(event) => setMiddleName(event.target.value)} placeholder={t('auth.middleNamePlaceholder')} autoComplete="additional-name" />
                </div>
                <div className={styles.fieldGroup}>
                  <RequiredLabel htmlFor="last-name">{t('auth.lastName')}</RequiredLabel>
                  <Input id="last-name" required value={lastName} onChange={(event) => setLastName(event.target.value)} placeholder={t('auth.lastNamePlaceholder')} autoComplete="family-name" />
                </div>
              </div>
              <div className={styles.fieldGroup}>
                <RequiredLabel htmlFor="email-su">{t('auth.email')}</RequiredLabel>
                <Input id="email-su" required type="email" value={email} onChange={(event) => setEmail(event.target.value)} placeholder="you@example.com" autoComplete="email" />
              </div>
              <div className={styles.fieldGroup}>
                <RequiredLabel htmlFor="password-su">{t('auth.password')}</RequiredLabel>
                <PasswordInput id="password-su" toggleLabel={t('auth.togglePassword')} required value={password} onChange={(event) => setPassword(event.target.value)} placeholder={t('auth.choosePassword')} autoComplete="new-password" />
              </div>
              {password ? (
                <div className={styles.requirements}>
                  {passwordState.map((rule) => (
                    <div key={rule.id} className={cn(styles.requirement, rule.met && styles.requirementMet)}>
                      {rule.met ? <Check className="h-3.5 w-3.5" /> : <X className="h-3.5 w-3.5 opacity-40" />}
                      <span>{t(rule.labelKey)}</span>
                    </div>
                  ))}
                </div>
              ) : null}
              <div className={styles.fieldGroup}>
                <RequiredLabel htmlFor="confirm-password">{t('auth.confirmPassword')}</RequiredLabel>
                <PasswordInput id="confirm-password" toggleLabel={t('auth.togglePassword')} required value={confirmPassword} onChange={(event) => setConfirmPassword(event.target.value)} placeholder={t('auth.confirmPasswordPlaceholder')} autoComplete="new-password" />
                {confirmPassword && confirmPassword !== password ? <p className={styles.errorText}>{t('auth.error.passwordMismatch')}</p> : null}
              </div>
              {notice && <div className={styles.noticeText}>{notice}</div>}
              {error && <div className={styles.errorText}>{error}</div>}
              <Button type="submit" disabled={!signUpReady || loading}>
                {loading ? <><Loader2 className="mr-2 h-4 w-4 animate-spin" />{t('auth.creatingAccount')}</> : t('auth.createAccount')}
              </Button>
              <p className={styles.centerLink}>{t('auth.hasAccount')} <a href="#" onClick={(event) => { event.preventDefault(); setMode('sign-in'); resetMessages() }}>{t('auth.signIn')}</a></p>
            </>
          ) : null}

        </form>
      </section>

      <aside className={styles.artPanel} aria-hidden>
        <div className={styles.artOverlay}>
          <p className={styles.artQuote}>{t(quote)}</p>
        </div>
      </aside>
    </div>
  )
}
