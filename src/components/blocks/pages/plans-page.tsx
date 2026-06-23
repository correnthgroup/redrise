import { useState } from 'react'
import { Check, Crown, RefreshCw, ShieldCheck, Sparkles } from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { BackButton } from '@/components/ui/back-button'
import { Card } from '@/components/ui/card'
import { useI18n } from '@/hooks/use-i18n'

type Plan = {
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
    name: 'Free',
    badgeKey: 'plans.freeBadge',
    price: '$0',
    descriptionKey: 'plans.freeDesc',
    highlightKeys: ['plans.placeholderWorkspaceLimit', 'plans.placeholderMemberLimit', 'plans.basicTasksFlows', 'plans.communitySupport'],
    accessKeys: ['plans.accessFreeAdmin', 'plans.accessFreeMember', 'plans.accessFreeViewer'],
  },
  {
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
    name: 'Corporate',
    badgeKey: 'plans.corporateBadge',
    price: 'Custom',
    descriptionKey: 'plans.corporateDesc',
    highlightKeys: ['plans.customSeatModel', 'plans.advancedAuditControls', 'plans.dedicatedOnboarding', 'plans.securityGovernance'],
    accessKeys: ['plans.accessCorporateAdmin', 'plans.accessCorporateMember', 'plans.accessCorporateViewer'],
    ctaKey: 'plans.joinNow',
  },
]

export function PlansPage({ onBack }: { onBack?: () => void }) {
  const { t } = useI18n()
  const [notice] = useState(() => new URLSearchParams(window.location.search).get('checkout') === 'success')
  const [checkoutMessage, setCheckoutMessage] = useState<string | null>(null)

  function startCheckout(plan: Plan['name']) {
    setCheckoutMessage(t('plans.checkoutReady', { plan }))
  }

  function restartApp() {
    window.location.href = window.location.origin
  }

  return (
    <div className="space-y-5">
      <Card className="gap-3 rounded-xl border p-6">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
          <div>
            <h2 className="text-2xl font-semibold tracking-tight">{t('settings.plans')}</h2>
            <p className="mt-1.5 text-sm text-muted-foreground">{t('plans.desc')}</p>
          </div>
          <Badge variant="outline" className="w-fit border-[#2F5D5A]/25 bg-[#2F5D5A]/8 text-[#2F5D5A]">
            {t('plans.placeholderContent')}
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
          <Card key={plan.name} className={`flex flex-col gap-5 rounded-xl border p-5 ${plan.featured ? 'border-primary/40 shadow-[0_16px_34px_rgba(140,31,40,0.14)]' : ''}`}>
            <div className="space-y-3">
              <div className="flex items-center justify-between gap-3">
                <div className="flex items-center gap-2">
                  {plan.name === 'Free' ? <Sparkles className="h-4 w-4 text-[#2F5D5A]" /> : plan.name === 'Business' ? <Crown className="h-4 w-4 text-primary" /> : <ShieldCheck className="h-4 w-4 text-[#2F5D5A]" />}
                  <h3 className="text-lg font-semibold">{plan.name}</h3>
                </div>
                <Badge variant="outline">{t(plan.badgeKey)}</Badge>
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
              {plan.ctaKey ? (
                <Button type="button" className="w-full" onClick={() => startCheckout(plan.name)}>{t(plan.ctaKey)}</Button>
              ) : (
                <Button type="button" variant="outline" className="w-full" disabled>{t('plans.currentPlan')}</Button>
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
