import { useState } from 'react'
import { Check, Crown, RefreshCw, ShieldCheck, Sparkles } from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'

type Plan = {
  name: 'Free' | 'Business' | 'Corporate'
  badge: string
  price: string
  description: string
  highlights: string[]
  access: string[]
  cta?: string
  featured?: boolean
}

const PLANS: Plan[] = [
  {
    name: 'Free',
    badge: 'Current placeholder',
    price: '$0',
    description: 'Starter workspace for early setup, validation and lightweight operations.',
    highlights: ['Placeholder workspace limit', 'Placeholder member limit', 'Basic tasks and flows', 'Community-level support'],
    access: ['Admin: manages own workspace', 'Member: contributes to assigned work', 'Viewer: read-only visibility'],
  },
  {
    name: 'Business',
    badge: 'Growth placeholder',
    price: '$-- / mo',
    description: 'Operational plan for teams that need more flows, agents and integrations.',
    highlights: ['Expanded workspace limits', 'More team seats', 'Advanced flow automation', 'Priority operational analytics'],
    access: ['Admin: manages team and billing', 'Member: creates tasks and flows', 'Viewer: reviews dashboards and progress'],
    cta: 'Join Now',
    featured: true,
  },
  {
    name: 'Corporate',
    badge: 'Scale placeholder',
    price: 'Custom',
    description: 'Enterprise-grade controls for larger teams, compliance and guided rollout.',
    highlights: ['Custom seat model', 'Advanced audit controls', 'Dedicated onboarding', 'Security and governance options'],
    access: ['Admin: governs teams and policies', 'Member: operates approved workflows', 'Viewer: access-controlled reporting'],
    cta: 'Join Now',
  },
]

export function PlansPage() {
  const [notice] = useState(() => new URLSearchParams(window.location.search).get('checkout') === 'success')
  const [checkoutMessage, setCheckoutMessage] = useState<string | null>(null)

  function startCheckout(plan: Plan['name']) {
    setCheckoutMessage(`${plan} checkout is ready for Stripe configuration. Payment links and webhooks will be connected next.`)
  }

  function restartApp() {
    window.location.href = window.location.origin
  }

  return (
    <div className="space-y-5">
      <Card className="gap-3 rounded-xl border p-6">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
          <div>
            <h2 className="text-2xl font-semibold tracking-tight">Plans</h2>
            <p className="mt-1.5 text-sm text-muted-foreground">Compare Free, Business and Corporate access before Stripe billing is connected.</p>
          </div>
          <Badge variant="outline" className="w-fit border-[#2F4858]/25 bg-[#2F4858]/8 text-[#2F4858]">
            Placeholder content
          </Badge>
        </div>
        {notice ? (
          <div className="rounded-xl border border-amber-200 bg-amber-50 p-4 text-sm text-amber-900">
            <div className="flex items-start gap-3">
              <RefreshCw className="mt-0.5 h-4 w-4" />
              <div className="space-y-3">
                <p className="font-medium">Restart the app for the new features to take effect.</p>
                <Button type="button" size="sm" onClick={restartApp}>Restart Now</Button>
              </div>
            </div>
          </div>
        ) : null}
        {checkoutMessage ? (
          <div className="rounded-xl border border-[#2F4858]/20 bg-[#2F4858]/8 p-4 text-sm text-[#2F4858]">
            {checkoutMessage}
          </div>
        ) : null}
      </Card>

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
        {PLANS.map((plan) => (
          <Card key={plan.name} className={`flex flex-col gap-5 rounded-xl border p-5 ${plan.featured ? 'border-primary/40 shadow-[0_16px_34px_rgba(140,31,40,0.14)]' : ''}`}>
            <div className="space-y-3">
              <div className="flex items-center justify-between gap-3">
                <div className="flex items-center gap-2">
                  {plan.name === 'Free' ? <Sparkles className="h-4 w-4 text-[#2F4858]" /> : plan.name === 'Business' ? <Crown className="h-4 w-4 text-primary" /> : <ShieldCheck className="h-4 w-4 text-[#2F4858]" />}
                  <h3 className="text-lg font-semibold">{plan.name}</h3>
                </div>
                <Badge variant="outline">{plan.badge}</Badge>
              </div>
              <div>
                <p className="text-2xl font-semibold">{plan.price}</p>
                <p className="mt-1 text-sm text-muted-foreground">{plan.description}</p>
              </div>
            </div>

            <div className="space-y-2">
              <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">Includes</p>
              {plan.highlights.map((item) => (
                <div key={item} className="flex gap-2 text-sm">
                  <Check className="mt-0.5 h-4 w-4 shrink-0 text-emerald-600" />
                  <span>{item}</span>
                </div>
              ))}
            </div>

            <div className="space-y-2 rounded-lg bg-muted/35 p-3">
              <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">Access levels</p>
              {plan.access.map((item) => <p key={item} className="text-xs leading-5 text-muted-foreground">{item}</p>)}
            </div>

            <div className="mt-auto">
              {plan.cta ? (
                <Button type="button" className="w-full" onClick={() => startCheckout(plan.name)}>{plan.cta}</Button>
              ) : (
                <Button type="button" variant="outline" className="w-full" disabled>Current Plan</Button>
              )}
            </div>
          </Card>
        ))}
      </div>
    </div>
  )
}
