import { useMemo, useState, type FormEvent } from 'react'
import { Bot, Check, Eye, EyeOff, Github } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { supabase } from '@/lib/supabase'
import { cn } from '@/lib/utils'
import styles from './auth-flow.module.css'

type AuthMode = 'sign-in' | 'sign-up'

const PASSWORD_RULES = [
  { id: 'len', label: 'At least 8 characters', test: (v: string) => v.length >= 8 },
  { id: 'upper', label: 'One uppercase letter', test: (v: string) => /[A-Z]/.test(v) },
  { id: 'digit', label: 'One digit', test: (v: string) => /\d/.test(v) },
  { id: 'symbol', label: 'One symbol', test: (v: string) => /[^A-Za-z0-9]/.test(v) },
]

const ART_QUOTES = [
  'Art is the lie that enables us to realize the truth.',
  'Every artist was first an amateur.',
  'Creativity takes courage.',
]

export function AuthFlow() {
  const [mode, setMode] = useState<AuthMode>('sign-in')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [name, setName] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)

  const [quote] = useState(() => ART_QUOTES[Math.floor(Math.random() * ART_QUOTES.length)])

  const passwordState = useMemo(
    () => PASSWORD_RULES.map((r) => ({ ...r, met: r.test(password) })),
    [password],
  )
  const allRulesMet = passwordState.every((r) => r.met)

  async function handleSignIn(e: FormEvent) {
    e.preventDefault()
    setError(null)
    if (!email || !password) {
      setError('Email and password are required.')
      return
    }
    setLoading(true)
    const { error: authError } = await supabase.auth.signInWithPassword({ email, password })
    setLoading(false)
    if (authError) {
      setError(authError.message)
    }
  }

  async function handleSignUp(e: FormEvent) {
    e.preventDefault()
    setError(null)
    if (!email || !name) {
      setError('Name and email are required.')
      return
    }
    if (!allRulesMet) {
      setError('Password does not meet all requirements.')
      return
    }
    setLoading(true)
    const { error: authError } = await supabase.auth.signUp({
      email,
      password,
      options: { data: { full_name: name } },
    })
    setLoading(false)
    if (authError) {
      setError(authError.message)
    }
  }

  async function handleGitHubLogin() {
    setError(null)
    setLoading(true)
    const { error: authError } = await supabase.auth.signInWithOAuth({
      provider: 'github',
      options: {
        redirectTo: window.location.origin,
      },
    })
    setLoading(false)
    if (authError) {
      setError(authError.message)
    }
  }

  return (
    <div className={styles.shell}>
      <section className={styles.formPanel}>
        <form className={styles.formInner} onSubmit={mode === 'sign-in' ? handleSignIn : handleSignUp}>
          <div className={styles.brandRow}>
            <div className={styles.brandMark}>
              <Bot className="h-4 w-4" />
            </div>
            <div>
              <div className={styles.brandName}>Redrise</div>
              <div className={styles.brandTag}>Workspace-first operations</div>
            </div>
          </div>

          {mode === 'sign-in' && (
            <>
              <h1 className={styles.heading}>Sign in</h1>
              <p className={styles.subheading}>Welcome back. Enter your credentials to continue.</p>

              <div className={styles.fieldGroup}>
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="you@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  autoComplete="email"
                />
              </div>

              <div className={styles.fieldGroup}>
                <Label htmlFor="password">Password</Label>
                <div className="relative">
                  <Input
                    id="password"
                    type={showPassword ? 'text' : 'password'}
                    placeholder="your password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    autoComplete="current-password"
                  />
                  <button
                    type="button"
                    aria-label="Toggle password visibility"
                    className="absolute right-2 top-1/2 -translate-y-1/2 text-muted-foreground"
                    onClick={() => setShowPassword((v) => !v)}
                  >
                    {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                </div>
              </div>

              {error && <div className={styles.errorText}>{error}</div>}

              <Button type="submit" disabled={loading}>Sign in</Button>

              <div className={styles.divider}>or</div>

              <Button type="button" variant="outline" onClick={handleGitHubLogin} disabled={loading}>
                <Github className="mr-2 h-4 w-4" />
                Sign in with GitHub
              </Button>

              <div className={styles.footerLinks}>
                <span />
                <a
                  href="#"
                  onClick={(e) => {
                    e.preventDefault()
                    setMode('sign-up')
                    setError(null)
                  }}
                >
                  Create an account
                </a>
              </div>
            </>
          )}

          {mode === 'sign-up' && (
            <>
              <h1 className={styles.heading}>Create account</h1>
              <p className={styles.subheading}>Set up your workspace in a few seconds.</p>

              <div className={styles.fieldGroup}>
                <Label htmlFor="name">Full name</Label>
                <Input
                  id="name"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Your name"
                />
              </div>

              <div className={styles.fieldGroup}>
                <Label htmlFor="email-su">Email</Label>
                <Input
                  id="email-su"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="you@example.com"
                />
              </div>

              <div className={styles.fieldGroup}>
                <Label htmlFor="password-su">Password</Label>
                <div className="relative">
                  <Input
                    id="password-su"
                    type={showPassword ? 'text' : 'password'}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="choose a password"
                  />
                  <button
                    type="button"
                    aria-label="Toggle password visibility"
                    className="absolute right-2 top-1/2 -translate-y-1/2 text-muted-foreground"
                    onClick={() => setShowPassword((v) => !v)}
                  >
                    {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                </div>
              </div>

              {password && (
                <div className={styles.requirements}>
                  {passwordState.map((r) => (
                    <div
                      key={r.id}
                      className={cn(styles.requirement, r.met && styles.requirementMet)}
                    >
                      <Check className={cn('h-3.5 w-3.5', r.met ? 'opacity-100' : 'opacity-30')} />
                      <span>{r.label}</span>
                    </div>
                  ))}
                </div>
              )}

              {error && <div className={styles.errorText}>{error}</div>}

              <Button type="submit" disabled={!allRulesMet || loading}>Create account</Button>

              <div className={styles.divider}>or</div>

              <Button type="button" variant="outline" onClick={handleGitHubLogin} disabled={loading}>
                <Github className="mr-2 h-4 w-4" />
                Sign up with GitHub
              </Button>

              <div className={styles.footerLinks}>
                <span />
                <a
                  href="#"
                  onClick={(e) => {
                    e.preventDefault()
                    setMode('sign-in')
                    setError(null)
                  }}
                >
                  I already have an account
                </a>
              </div>
            </>
          )}
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
