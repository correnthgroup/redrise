import { useMemo, useState, type FormEvent } from 'react'
import { Bot, Check, Loader2, X } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { supabase } from '@/lib/supabase'
import { cn } from '@/lib/utils'
import { registerActiveSession } from '@/lib/user-profile'
import { PasswordInput } from './password-input'
import styles from './auth-flow.module.css'

type AuthMode = 'sign-in' | 'sign-up'

const PASSWORD_RULES = [
  { id: 'len', label: 'At least 8 characters', test: (value: string) => value.length >= 8 },
  { id: 'letter', label: 'One letter', test: (value: string) => /[A-Za-z]/.test(value) },
  { id: 'digit', label: 'One number', test: (value: string) => /\d/.test(value) },
]

const ART_QUOTES = [
  'Art is the lie that enables us to realize the truth.',
  'Every artist was first an amateur.',
  'Creativity takes courage.',
]

const SIGNUP_NOTICE_KEY = 'redrise:signup-notice'

function isValidEmail(value: string) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value.trim())
}

function mapAuthError(message: string) {
  const lower = message.toLowerCase()
  if (lower.includes('email not confirmed') || lower.includes('confirm')) return 'This account is not ready yet. Try signing in again in a moment.'
  if (lower.includes('invalid login') || lower.includes('invalid credentials')) return 'Invalid email or password.'
  if (lower.includes('rate limit') || lower.includes('too many')) return 'Too many attempts. Try again in a few minutes.'
  if (lower.includes('network') || lower.includes('fetch')) return 'Check your connection and try again.'
  return 'Unable to complete the action right now. Try again.'
}

export function AuthFlow({ onAccountCreationStart }: { onAccountCreationStart?: () => void }) {
  const inviteParams = typeof window === 'undefined' ? null : new URLSearchParams(window.location.search)
  const invitedEmail = inviteParams?.get('email') ?? ''
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
  const [notice, setNotice] = useState<string | null>(initialSignupNotice ?? (inviteParams?.get('invited') ? 'You were invited to Redrise. Create your account to accept the invite.' : null))
  const [loading, setLoading] = useState(false)

  const [quote] = useState(() => ART_QUOTES[Math.floor(Math.random() * ART_QUOTES.length)])

  const passwordState = useMemo(
    () => PASSWORD_RULES.map((rule) => ({ ...rule, met: rule.test(password) })),
    [password],
  )
  const allRulesMet = passwordState.every((rule) => rule.met)
  const signUpReady = firstName.trim().length >= 2 && isValidEmail(email) && allRulesMet && confirmPassword === password

  function resetMessages() {
    setError(null)
    setNotice(null)
  }

  async function handleSignIn(event: FormEvent) {
    event.preventDefault()
    resetMessages()
    if (!isValidEmail(email) || !password) {
      setError('Email and password are required.')
      return
    }
    setLoading(true)
    const { data, error: authError } = await supabase.auth.signInWithPassword({ email: email.trim(), password })
    if (authError) {
      setError(mapAuthError(authError.message))
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
      setError('First Name must have at least 2 characters.')
      return
    }
    if (!isValidEmail(email)) {
      setError('Please enter a valid email address.')
      return
    }
    if (!allRulesMet) {
      setError('Password does not meet all requirements.')
      return
    }
    if (confirmPassword !== password) {
      setError('Passwords do not match.')
      return
    }

    setLoading(true)
    window.sessionStorage.setItem(SIGNUP_NOTICE_KEY, 'Account created. Sign in with the credentials you just created.')
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
        },
      },
    })
    if (authError) {
      window.sessionStorage.removeItem(SIGNUP_NOTICE_KEY)
      setLoading(false)
      setError(authError.message.toLowerCase().includes('rate limit') || authError.message.toLowerCase().includes('too many')
        ? 'Too many attempts. Try again in a few minutes.'
        : 'Unable to create the account right now. Try again.')
      return
    }

    await supabase.auth.signOut()
    setLoading(false)
    setMode('sign-in')
    setNotice('Account created. Sign in with the credentials you just created.')
    setEmail(email.trim())
    setPassword('')
    setConfirmPassword('')
  }

  return (
    <div className={styles.shell}>
      <section className={styles.formPanel}>
        <form className={styles.formInner} onSubmit={mode === 'sign-in' ? handleSignIn : handleSignUp}>
          <div className={styles.brandRow}>
            <div className={styles.brandMark}><Bot className="h-4 w-4" /></div>
            <div>
              <div className={styles.brandName}>Redrise</div>
              <div className={styles.brandTag}>Adding AI. Enhance Value.</div>
            </div>
          </div>

          {mode === 'sign-in' ? (
            <>
              <h1 className={styles.heading}>Sign in</h1>
              <p className={styles.subheading}>Welcome back. Enter your credentials to continue.</p>

              <div className={styles.fieldGroup}>
                <Label htmlFor="email">Email</Label>
                <Input id="email" type="email" placeholder="you@example.com" value={email} onChange={(event) => setEmail(event.target.value)} autoComplete="email" />
              </div>
              <div className={styles.fieldGroup}>
                <Label htmlFor="password">Password</Label>
                <PasswordInput id="password" placeholder="Your password" value={password} onChange={(event) => setPassword(event.target.value)} autoComplete="current-password" />
              </div>
              <label className={styles.checkRow}>
                <input type="checkbox" checked={rememberMe} onChange={(event) => setRememberMe(event.target.checked)} />
                Remember Me
              </label>
              {notice && <div className={styles.noticeText}>{notice}</div>}
              {error && <div className={styles.errorText}>{error}</div>}
              <Button type="submit" disabled={loading}>
                {loading ? <><Loader2 className="mr-2 h-4 w-4 animate-spin" />Signing in...</> : 'Sign in'}
              </Button>
              <p className={styles.centerLink}>Don&apos;t have an account? <a href="#" onClick={(event) => { event.preventDefault(); setMode('sign-up'); resetMessages() }}>Create account</a></p>
            </>
          ) : null}

          {mode === 'sign-up' ? (
            <>
              <h1 className={styles.heading}>Create account</h1>
              <p className={styles.subheading}>Create your account, then sign in with the same credentials.</p>

              <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
                <div className={styles.fieldGroup}>
                  <Label htmlFor="first-name">First Name</Label>
                  <Input id="first-name" value={firstName} onChange={(event) => setFirstName(event.target.value)} placeholder="First" autoComplete="given-name" />
                </div>
                <div className={styles.fieldGroup}>
                  <Label htmlFor="middle-name">Middle Name</Label>
                  <Input id="middle-name" value={middleName} onChange={(event) => setMiddleName(event.target.value)} placeholder="Middle" autoComplete="additional-name" />
                </div>
                <div className={styles.fieldGroup}>
                  <Label htmlFor="last-name">Last Name</Label>
                  <Input id="last-name" value={lastName} onChange={(event) => setLastName(event.target.value)} placeholder="Last" autoComplete="family-name" />
                </div>
              </div>
              <div className={styles.fieldGroup}>
                <Label htmlFor="email-su">Email</Label>
                <Input id="email-su" type="email" value={email} onChange={(event) => setEmail(event.target.value)} placeholder="you@example.com" autoComplete="email" />
              </div>
              <div className={styles.fieldGroup}>
                <Label htmlFor="password-su">Password</Label>
                <PasswordInput id="password-su" value={password} onChange={(event) => setPassword(event.target.value)} placeholder="Choose a password" autoComplete="new-password" />
              </div>
              {password ? (
                <div className={styles.requirements}>
                  {passwordState.map((rule) => (
                    <div key={rule.id} className={cn(styles.requirement, rule.met && styles.requirementMet)}>
                      {rule.met ? <Check className="h-3.5 w-3.5" /> : <X className="h-3.5 w-3.5 opacity-40" />}
                      <span>{rule.label}</span>
                    </div>
                  ))}
                </div>
              ) : null}
              <div className={styles.fieldGroup}>
                <Label htmlFor="confirm-password">Confirm Password</Label>
                <PasswordInput id="confirm-password" value={confirmPassword} onChange={(event) => setConfirmPassword(event.target.value)} placeholder="Confirm password" autoComplete="new-password" />
                {confirmPassword && confirmPassword !== password ? <p className={styles.errorText}>Passwords do not match.</p> : null}
              </div>
              {notice && <div className={styles.noticeText}>{notice}</div>}
              {error && <div className={styles.errorText}>{error}</div>}
              <Button type="submit" disabled={!signUpReady || loading}>
                {loading ? <><Loader2 className="mr-2 h-4 w-4 animate-spin" />Creating account...</> : 'Create account'}
              </Button>
              <p className={styles.centerLink}>Already have an account? <a href="#" onClick={(event) => { event.preventDefault(); setMode('sign-in'); resetMessages() }}>Sign in</a></p>
            </>
          ) : null}

        </form>
      </section>

      <aside className={styles.artPanel} aria-hidden>
        <div className={styles.artOverlay}>
          <p className={styles.artQuote}>{quote}</p>
        </div>
      </aside>
    </div>
  )
}
