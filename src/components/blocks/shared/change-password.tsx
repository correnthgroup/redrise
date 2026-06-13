import { useState } from 'react'
import { CheckCircle2, Eye, EyeOff, Lock, Shield, XCircle } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'

function PasswordField({ id, label, value, onChange }: { id: string; label: string; value?: string; onChange?: (value: string) => void }) {
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
          <span className="sr-only">{showPassword ? 'Hide password' : 'Show password'}</span>
        </Button>
      </div>
    </div>
  )
}

const PASSWORD_REQUIREMENTS = [
  { label: 'At least 8 characters long', regex: /.{8,}/ },
  { label: 'One uppercase letter (A-Z)', regex: /[A-Z]/ },
  { label: 'One lowercase letter (a-z)', regex: /[a-z]/ },
  { label: 'One number (0-9)', regex: /[0-9]/ },
  { label: 'One special character (!@#$%^&*)', regex: /[!@#$%^&*()_+\-=[\]{};':"\\|,.<>/?]/ },
]

export function ChangePassword() {
  const [newPassword, setNewPassword] = useState('')

  return (
    <Card className="border p-8">
      <div className="pb-6">
        <div className="flex items-center gap-3">
          <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-orange-100">
            <Shield className="h-6 w-6 text-orange-600" />
          </div>
          <div>
            <h2 className="text-2xl font-semibold tracking-tight">Change Password</h2>
            <p className="mt-1 text-sm text-muted-foreground">Update your password to keep your account secure.</p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-8 md:grid-cols-2">
        <div>
          <form onSubmit={(event) => event.preventDefault()}>
            <PasswordField id="current-password" label="Current Password" />
            <PasswordField id="new-password" label="New Password" value={newPassword} onChange={setNewPassword} />
            <PasswordField id="confirm-password" label="Confirm New Password" />
            <div className="mt-8 flex gap-3">
              <Button type="button" variant="outline" className="flex-1">Cancel</Button>
              <Button type="submit" className="flex-1">Update Password</Button>
            </div>
          </form>
        </div>

        <div className="space-y-6">
          <div>
            <h3 className="mb-4 flex items-center gap-2 font-semibold">
              <Shield className="h-5 w-5 text-muted-foreground" />
              Password Requirements
            </h3>
            <p className="mb-6 text-sm text-muted-foreground">Your password must meet the following criteria for enhanced security:</p>
            <ul className="space-y-3">
              {PASSWORD_REQUIREMENTS.map((req) => {
                const meetsRequirement = req.regex.test(newPassword)
                return (
                  <li key={req.label} className="flex items-start gap-3">
                    {meetsRequirement ? <CheckCircle2 className="mt-0.5 h-5 w-5 shrink-0 text-emerald-500" /> : <XCircle className="mt-0.5 h-5 w-5 shrink-0 text-muted-foreground" />}
                    <span className={meetsRequirement ? 'text-sm text-foreground' : 'text-sm text-muted-foreground'}>{req.label}</span>
                  </li>
                )
              })}
            </ul>
          </div>

          <div className="rounded-lg border border-[#8c1f28] bg-[#8c1f28] p-4 text-[#f2f2f2]">
            <h4 className="mb-2 text-sm font-medium">Security Best Practices</h4>
            <ul className="space-y-2 text-sm text-[#f2f2f2]">
              <li className="flex items-start gap-2"><span className="mt-1">-</span><span>Change your password regularly (every 90 days).</span></li>
              <li className="flex items-start gap-2"><span className="mt-1">-</span><span>Never share your password with anyone.</span></li>
              <li className="flex items-start gap-2"><span className="mt-1">-</span><span>Use a unique password for each account.</span></li>
              <li className="flex items-start gap-2"><span className="mt-1">-</span><span>Consider using a password manager.</span></li>
            </ul>
          </div>
        </div>
      </div>
    </Card>
  )
}
