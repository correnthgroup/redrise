import { useEffect, useState } from 'react'
import { Check, Crown, RefreshCw, ShieldCheck, Sparkles } from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { BackButton } from '@/components/ui/back-button'
import { Card } from '@/components/ui/card'
import { useI18n } from '@/hooks/use-i18n'
import { effectiveBillingPlan, loadBillingSubscription, startBillingCheckout, type BillingPlan, type BillingSubscription } from '@/lib/billing'
import { updateSpotlightPosition } from '@/lib/spotlight'

type Plan = {
  id: BillingPlan
  name: 'Free' | 'Business' | 'Corporate'
  badgeKey: string
  price: string
  descriptionKey: string
  highlightKeys: string[]
  accessKeys: string[]
  ctaKey?: string
  featured?: boolean
}

const PLANS: Plan[] = [
  {
    id: 'free',
    name: 'Free',
    badgeKey: 'plans.freeBadge',
    price: '$0',
    descriptionKey: 'plans.freeDesc',
    highlightKeys: ['plans.placeholderWorkspaceLimit', 'plans.placeholderMemberLimit', 'plans.basicTasksFlows', 'plans.communitySupport'],
    accessKeys: ['plans.accessFreeAdmin', 'plans.accessFreeMember', 'plans.accessFreeViewer'],
  },
  {
    id: 'business',
    name: 'Business',
    badgeKey: 'plans.businessBadge',
    price: '$-- / mo',
    descriptionKey: 'plans.businessDesc',
    highlightKeys: ['plans.expandedWorkspaceLimits', 'plans.moreTeamSeats', 'plans.advancedFlowAutomation', 'plans.priorityAnalytics'],
    accessKeys: ['plans.accessBusinessAdmin', 'plans.accessBusinessMember', 'plans.accessBusinessViewer'],
    ctaKey: 'plans.joinNow',
    featured: true,
  },
  {
    id: 'corporate',
    name: 'Corporate',
    badgeKey: 'plans.corporateBadge',
    price: 'Custom',
    descriptionKey: 'plans.corporateDesc',
    highlightKeys: ['plans.customSeatModel', 'plans.advancedAuditControls', 'plans.dedicatedOnboarding', 'plans.securityGovernance'],
    accessKeys: ['plans.accessCorporateAdmin', 'plans.accessCorporateMember', 'plans.accessCorporateViewer'],
    ctaKey: 'plans.joinNow',
  },
]

function isPaidPlan(plan: BillingPlan): plan is Exclude<BillingPlan, 'free'> {
  return plan === 'business' || plan === 'corporate'
}

export function PlansPage({ ownerUserId, canManageBilling, onBack }: { ownerUserId: string; canManageBilling: boolean; onBack?: () => void }) {
  const { t } = useI18n()
  const [notice] = useState(() => new URLSearchParams(window.location.search).get('checkout') === 'success')
  const [subscription, setSubscription] = useState<BillingSubscription | null>(null)
  const [loading, setLoading] = useState(true)
  const [startingPlan, setStartingPlan] = useState<BillingPlan | null>(null)
  const [checkoutMessage, setCheckoutMessage] = useState<string | null>(null)

  useEffect(() => {
    let cancelled = false
    void loadBillingSubscription(ownerUserId)
      .then((next) => { if (!cancelled) setSubscription(next) })
      .catch(() => { if (!cancelled) setCheckoutMessage(t('plans.loadError')) })
      .finally(() => { if (!cancelled) setLoading(false) })
    return () => { cancelled = true }
  }, [ownerUserId, t])

  async function startCheckout(plan: Exclude<BillingPlan, 'free'>) {
    setCheckoutMessage(null)
    setStartingPlan(plan)
    try {
      const url = await startBillingCheckout(ownerUserId, plan)
      window.location.assign(url)
    } catch (error) {
      setCheckoutMessage(error instanceof Error ? error.message : t('plans.checkoutError'))
      setStartingPlan(null)
    }
  }

  function restartApp() {
    window.location.href = window.location.origin
  }

  const activePlan = subscription ? effectiveBillingPlan(subscription) : 'free'
  const statusLabel = subscription ? t(`plans.status.${subscription.status}`) : t('plans.status.free')

  return (
    <div className="space-y-5">
      <Card className="gap-3 rounded-xl border p-6">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
          <div>
            <h2 className="text-2xl font-semibold tracking-tight">{t('settings.plans')}</h2>
            <p className="mt-1.5 text-sm text-muted-foreground">{t('plans.desc')}</p>
          </div>
          <Badge variant="outline" className="w-fit border-[#2F5D5A]/25 bg-[#2F5D5A]/8 text-[#2F5D5A]">
            {loading ? t('plans.loading') : t('plans.currentStatus', { status: statusLabel })}
          </Badge>
        </div>
        {notice ? (
          <div className="rounded-xl border border-amber-200 bg-amber-50 p-4 text-sm text-amber-900">
            <div className="flex items-start gap-3">
              <RefreshCw className="mt-0.5 h-4 w-4" />
              <div className="space-y-3">
                <p className="font-medium">{t('plans.restart')}</p>
                <Button type="button" size="sm" onClick={restartApp}>{t('plans.restartNow')}</Button>
              </div>
            </div>
          </div>
        ) : null}
        {checkoutMessage ? (
          <div className="rounded-xl border border-[#2F5D5A]/20 bg-[#2F5D5A]/8 p-4 text-sm text-[#2F5D5A]">
            {checkoutMessage}
          </div>
        ) : null}
      </Card>

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
        {PLANS.map((plan) => (
          <Card key={plan.name} onPointerMove={updateSpotlightPosition} className={`spotlight-card flex flex-col gap-5 rounded-xl border p-5 ${plan.featured ? 'border-primary/40 shadow-[0_16px_34px_rgba(140,31,40,0.14)]' : ''}`}>
            <div className="space-y-3">
              <div className="flex items-center justify-between gap-3">
                <div className="flex items-center gap-2">
                  {plan.name === 'Free' ? <Sparkles className="h-4 w-4 text-[#2F5D5A]" /> : plan.name === 'Business' ? <Crown className="h-4 w-4 text-primary" /> : <ShieldCheck className="h-4 w-4 text-[#2F5D5A]" />}
                  <h3 className="text-lg font-semibold">{plan.name}</h3>
                </div>
                <Badge variant="outline">{activePlan === plan.id ? t('plans.activeBadge') : t(plan.badgeKey)}</Badge>
              </div>
              <div>
                <p className="text-2xl font-semibold">{plan.price}</p>
                <p className="mt-1 text-sm text-muted-foreground">{t(plan.descriptionKey)}</p>
              </div>
            </div>

            <div className="space-y-2">
              <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">{t('plans.includes')}</p>
              {plan.highlightKeys.map((item) => (
                <div key={item} className="flex gap-2 text-sm">
                  <Check className="mt-0.5 h-4 w-4 shrink-0 text-emerald-600" />
                  <span>{t(item)}</span>
                </div>
              ))}
            </div>

            <div className="space-y-2 rounded-lg bg-muted/35 p-3">
              <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">{t('plans.accessLevels')}</p>
              {plan.accessKeys.map((item) => <p key={item} className="text-xs leading-5 text-muted-foreground">{t(item)}</p>)}
            </div>

            <div className="mt-auto">
              {activePlan === plan.id ? (
                <Button type="button" variant="outline" className="w-full" disabled>{t('plans.currentPlan')}</Button>
              ) : isPaidPlan(plan.id) ? (
                <Button type="button" className="w-full" disabled={!canManageBilling || !!startingPlan} onClick={() => { if (isPaidPlan(plan.id)) void startCheckout(plan.id) }}>
                  {startingPlan === plan.id ? t('plans.redirecting') : canManageBilling ? t(plan.ctaKey ?? 'plans.joinNow') : t('settings.adminOnly')}
                </Button>
              ) : (
                <Button type="button" variant="outline" className="w-full" disabled>{t('plans.included')}</Button>
              )}
            </div>
          </Card>
        ))}
      </div>
      <div className="flex justify-between">
        <BackButton onClick={onBack} />
      </div>
    </div>
  )
}
