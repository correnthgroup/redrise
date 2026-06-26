import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

type StripeObject = Record<string, unknown> & { id?: string; metadata?: Record<string, string> }

function json(body: unknown, status: number) {
  return new Response(JSON.stringify(body), { status, headers: { 'Content-Type': 'application/json' } })
}

function auditId() {
  return `al_${crypto.randomUUID().replace(/-/g, '').slice(0, 10)}`
}

function toHex(buffer: ArrayBuffer) {
  return [...new Uint8Array(buffer)].map((byte) => byte.toString(16).padStart(2, '0')).join('')
}

function timingSafeEqual(a: string, b: string) {
  if (a.length !== b.length) return false
  let result = 0
  for (let i = 0; i < a.length; i++) result |= a.charCodeAt(i) ^ b.charCodeAt(i)
  return result === 0
}

async function verifyStripeSignature(payload: string, signatureHeader: string | null, secret: string) {
  if (!signatureHeader || !secret) return false
  const parts = Object.fromEntries(signatureHeader.split(',').map((part) => {
    const [key, value] = part.split('=')
    return [key, value]
  }))
  const timestamp = parts.t
  const signature = parts.v1
  if (!timestamp || !signature) return false

  const key = await crypto.subtle.importKey('raw', new TextEncoder().encode(secret), { name: 'HMAC', hash: 'SHA-256' }, false, ['sign'])
  const digest = await crypto.subtle.sign('HMAC', key, new TextEncoder().encode(`${timestamp}.${payload}`))
  return timingSafeEqual(toHex(digest), signature)
}

function planFromMetadata(metadata?: Record<string, string>) {
  return metadata?.plan === 'corporate' ? 'corporate' : metadata?.plan === 'business' ? 'business' : 'free'
}

function activeStatus(status: string) {
  return status === 'active' || status === 'trialing'
}

function unixToIso(value: unknown) {
  return typeof value === 'number' ? new Date(value * 1000).toISOString() : null
}

async function upsertSubscription(supabase: ReturnType<typeof createClient>, subscription: StripeObject) {
  const metadata = subscription.metadata ?? {}
  let ownerUserId = metadata.owner_user_id
  const subscriptionId = subscription.id
  const customerId = typeof subscription.customer === 'string' ? subscription.customer : null

  if (!ownerUserId && subscriptionId) {
    const { data } = await supabase.from('billing_subscriptions').select('owner_user_id').eq('stripe_subscription_id', subscriptionId).maybeSingle()
    ownerUserId = data?.owner_user_id
  }
  if (!ownerUserId && customerId) {
    const { data } = await supabase.from('billing_subscriptions').select('owner_user_id').eq('stripe_customer_id', customerId).maybeSingle()
    ownerUserId = data?.owner_user_id
  }
  if (!ownerUserId) return

  const status = typeof subscription.status === 'string' ? subscription.status : 'incomplete'
  const items = subscription.items as { data?: Array<{ price?: { id?: string } }> } | undefined
  const stripePriceId = items?.data?.[0]?.price?.id ?? null
  const nextPlan = activeStatus(status) ? planFromMetadata(metadata) : status === 'canceled' ? 'free' : planFromMetadata(metadata)

  await supabase.from('billing_subscriptions').upsert({
    owner_user_id: ownerUserId,
    plan: nextPlan,
    status,
    stripe_customer_id: customerId,
    stripe_subscription_id: subscriptionId,
    stripe_price_id: stripePriceId,
    current_period_end: unixToIso(subscription.current_period_end),
    cancel_at_period_end: Boolean(subscription.cancel_at_period_end),
    metadata,
  }, { onConflict: 'owner_user_id' })

  await supabase.from('audit_logs').insert({
    id: auditId(),
    user_id: ownerUserId,
    action: 'webhook_update',
    entity_type: 'billing_subscription',
    entity_id: subscriptionId,
    entity_name: nextPlan,
    details: { status, stripe_customer_id: customerId },
  })
}

async function handleCheckoutCompleted(supabase: ReturnType<typeof createClient>, session: StripeObject) {
  const metadata = session.metadata ?? {}
  const ownerUserId = metadata.owner_user_id ?? (typeof session.client_reference_id === 'string' ? session.client_reference_id : null)
  if (!ownerUserId) return
  const plan = planFromMetadata(metadata)
  const status = session.payment_status === 'paid' ? 'active' : 'checkout_pending'

  await supabase.from('billing_subscriptions').upsert({
    owner_user_id: ownerUserId,
    plan: status === 'active' ? plan : plan,
    status,
    stripe_customer_id: typeof session.customer === 'string' ? session.customer : null,
    stripe_subscription_id: typeof session.subscription === 'string' ? session.subscription : null,
    stripe_checkout_session_id: session.id,
    metadata,
  }, { onConflict: 'owner_user_id' })

  await supabase.from('audit_logs').insert({
    id: auditId(),
    user_id: ownerUserId,
    action: 'checkout_completed',
    entity_type: 'billing_subscription',
    entity_id: session.id,
    entity_name: plan,
    details: { stripe_customer_id: session.customer, stripe_subscription_id: session.subscription },
  })
}

serve(async (req) => {
  if (req.method !== 'POST') return json({ error: 'Method not allowed' }, 405)

  const supabaseUrl = Deno.env.get('SUPABASE_URL') ?? ''
  const serviceRoleKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
  const webhookSecret = Deno.env.get('STRIPE_WEBHOOK_SECRET') ?? ''
  if (!supabaseUrl || !serviceRoleKey || !webhookSecret) return json({ error: 'Billing webhook is not configured' }, 500)

  const payload = await req.text()
  const verified = await verifyStripeSignature(payload, req.headers.get('Stripe-Signature'), webhookSecret)
  if (!verified) return json({ error: 'Invalid Stripe signature' }, 400)

  const event = JSON.parse(payload) as { type?: string; data?: { object?: StripeObject } }
  const object = event.data?.object
  if (!object) return json({ received: true }, 200)

  const supabase = createClient(supabaseUrl, serviceRoleKey)
  if (event.type === 'checkout.session.completed') await handleCheckoutCompleted(supabase, object)
  else if (event.type === 'customer.subscription.created' || event.type === 'customer.subscription.updated' || event.type === 'customer.subscription.deleted') await upsertSubscription(supabase, object)

  return json({ received: true }, 200)
})
