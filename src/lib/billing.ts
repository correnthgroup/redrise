import { supabase } from './supabase'

export type BillingPlan = 'free' | 'business' | 'corporate'
export type BillingStatus = 'free' | 'checkout_pending' | 'trialing' | 'active' | 'past_due' | 'canceled' | 'incomplete' | 'incomplete_expired' | 'unpaid'

export type BillingSubscription = {
  ownerUserId: string
  plan: BillingPlan
  status: BillingStatus
  stripeCustomerId: string | null
  stripeSubscriptionId: string | null
  stripePriceId: string | null
  currentPeriodEnd: string | null
  cancelAtPeriodEnd: boolean
  updatedAt: string | null
}

type BillingSubscriptionRow = {
  owner_user_id: string
  plan: BillingPlan
  status: BillingStatus
  stripe_customer_id: string | null
  stripe_subscription_id: string | null
  stripe_price_id: string | null
  current_period_end: string | null
  cancel_at_period_end: boolean
  updated_at: string | null
}

function fromRow(row: BillingSubscriptionRow): BillingSubscription {
  return {
    ownerUserId: row.owner_user_id,
    plan: row.plan,
    status: row.status,
    stripeCustomerId: row.stripe_customer_id,
    stripeSubscriptionId: row.stripe_subscription_id,
    stripePriceId: row.stripe_price_id,
    currentPeriodEnd: row.current_period_end,
    cancelAtPeriodEnd: row.cancel_at_period_end,
    updatedAt: row.updated_at,
  }
}

export function defaultBillingSubscription(ownerUserId: string): BillingSubscription {
  return {
    ownerUserId,
    plan: 'free',
    status: 'free',
    stripeCustomerId: null,
    stripeSubscriptionId: null,
    stripePriceId: null,
    currentPeriodEnd: null,
    cancelAtPeriodEnd: false,
    updatedAt: null,
  }
}

export function effectiveBillingPlan(subscription: BillingSubscription): BillingPlan {
  return subscription.status === 'active' || subscription.status === 'trialing' ? subscription.plan : 'free'
}

export async function loadBillingSubscription(ownerUserId: string): Promise<BillingSubscription> {
  const { data, error } = await supabase
    .from('billing_subscriptions')
    .select('owner_user_id,plan,status,stripe_customer_id,stripe_subscription_id,stripe_price_id,current_period_end,cancel_at_period_end,updated_at')
    .eq('owner_user_id', ownerUserId)
    .maybeSingle()

  if (error) throw error
  return data ? fromRow(data as BillingSubscriptionRow) : defaultBillingSubscription(ownerUserId)
}

export async function startBillingCheckout(ownerUserId: string, plan: Exclude<BillingPlan, 'free'>): Promise<string> {
  const { data, error } = await supabase.functions.invoke('billing-checkout', {
    body: { ownerUserId, plan },
  })

  if (error) throw error
  const url = (data as { url?: string } | null)?.url
  if (!url) throw new Error('Checkout URL was not returned')
  return url
}
