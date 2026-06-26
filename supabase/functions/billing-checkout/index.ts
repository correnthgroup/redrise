import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const DEFAULT_ALLOWED_ORIGINS = ['http://localhost:5173', 'http://127.0.0.1:5173']
const PLAN_PRICE_ENV: Record<string, string> = {
  business: 'STRIPE_BUSINESS_PRICE_ID',
  corporate: 'STRIPE_CORPORATE_PRICE_ID',
}

function getAllowedOrigins(): string[] {
  const configured = Deno.env.get('APP_ALLOWED_ORIGINS')
  if (!configured) return DEFAULT_ALLOWED_ORIGINS
  return configured.split(',').map((origin) => origin.trim()).filter(Boolean)
}

function getCorsHeaders(origin: string | null): Record<string, string> {
  const allowedOrigins = getAllowedOrigins()
  const fallbackOrigin = allowedOrigins[0] ?? '*'
  const allowed = allowedOrigins.some((o) => o.includes('*') ? (origin?.startsWith(o.replace('*', '')) ?? false) : origin === o)
  return {
    'Access-Control-Allow-Origin': allowed ? (origin ?? '*') : fallbackOrigin,
    'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  }
}

function json(body: unknown, status: number, headers: Record<string, string>) {
  return new Response(JSON.stringify(body), { status, headers: { ...headers, 'Content-Type': 'application/json' } })
}

function auditId() {
  return `al_${crypto.randomUUID().replace(/-/g, '').slice(0, 10)}`
}

serve(async (req) => {
  const origin = req.headers.get('Origin')
  const corsHeaders = getCorsHeaders(origin)

  if (req.method === 'OPTIONS') return new Response('ok', { headers: corsHeaders })
  if (req.method !== 'POST') return json({ error: 'Method not allowed' }, 405, corsHeaders)

  const supabaseUrl = Deno.env.get('SUPABASE_URL') ?? ''
  const anonKey = Deno.env.get('SUPABASE_ANON_KEY') ?? ''
  const serviceRoleKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''

  if (!supabaseUrl || !anonKey || !serviceRoleKey) {
    return json({ error: 'Billing checkout is not configured' }, 500, corsHeaders)
  }

  const authHeader = req.headers.get('Authorization') ?? ''
  if (!authHeader.startsWith('Bearer ')) return json({ error: 'Not authenticated' }, 401, corsHeaders)

  const authedSupabase = createClient(supabaseUrl, anonKey, { global: { headers: { Authorization: authHeader } } })
  const adminSupabase = createClient(supabaseUrl, serviceRoleKey)
  const { data: userData, error: userError } = await authedSupabase.auth.getUser()
  if (userError || !userData.user) return json({ error: 'Not authenticated' }, 401, corsHeaders)

  const body = await req.json().catch(() => ({})) as { ownerUserId?: string; plan?: string }
  const plan = body.plan === 'corporate' ? 'corporate' : body.plan === 'business' ? 'business' : null
  if (!plan) return json({ error: 'Unsupported plan' }, 400, corsHeaders)

  const stripeSecretKey = Deno.env.get('STRIPE_SECRET_KEY') ?? ''
  const appBaseUrl = Deno.env.get('APP_BASE_URL') ?? origin ?? 'http://localhost:5173'
  if (!stripeSecretKey) return json({ error: 'Stripe secret is not configured' }, 500, corsHeaders)

  const ownerUserId = body.ownerUserId || userData.user.id
  const { data: canManage, error: permissionError } = await authedSupabase.rpc('can_manage_user_scoped_data', { target_user_id: ownerUserId })
  if (permissionError || !canManage) return json({ error: 'Billing management requires Admin access' }, 403, corsHeaders)

  const priceId = Deno.env.get(PLAN_PRICE_ENV[plan]) ?? ''
  if (!priceId) return json({ error: `${PLAN_PRICE_ENV[plan]} is not configured` }, 500, corsHeaders)

  const { data: existing } = await adminSupabase
    .from('billing_subscriptions')
    .select('stripe_customer_id')
    .eq('owner_user_id', ownerUserId)
    .maybeSingle()

  const params = new URLSearchParams()
  params.set('mode', 'subscription')
  params.set('success_url', `${appBaseUrl}?checkout=success&plan=${plan}`)
  params.set('cancel_url', `${appBaseUrl}?checkout=cancelled&plan=${plan}`)
  params.set('client_reference_id', ownerUserId)
  params.set('line_items[0][price]', priceId)
  params.set('line_items[0][quantity]', '1')
  params.set('allow_promotion_codes', 'true')
  params.set('metadata[owner_user_id]', ownerUserId)
  params.set('metadata[requested_by_user_id]', userData.user.id)
  params.set('metadata[plan]', plan)
  params.set('subscription_data[metadata][owner_user_id]', ownerUserId)
  params.set('subscription_data[metadata][requested_by_user_id]', userData.user.id)
  params.set('subscription_data[metadata][plan]', plan)
  if (existing?.stripe_customer_id) params.set('customer', existing.stripe_customer_id)
  else if (userData.user.email) params.set('customer_email', userData.user.email)

  const stripeResponse = await fetch('https://api.stripe.com/v1/checkout/sessions', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${stripeSecretKey}`,
      'Content-Type': 'application/x-www-form-urlencoded',
    },
    body: params,
  })
  const checkout = await stripeResponse.json()
  if (!stripeResponse.ok) {
    console.error('[billing-checkout] Stripe error:', checkout?.error?.message ?? 'unknown')
    return json({ error: 'Unable to create checkout session' }, 502, corsHeaders)
  }

  await adminSupabase.from('billing_subscriptions').upsert({
    owner_user_id: ownerUserId,
    plan,
    status: 'checkout_pending',
    stripe_customer_id: typeof checkout.customer === 'string' ? checkout.customer : existing?.stripe_customer_id ?? null,
    stripe_checkout_session_id: checkout.id,
    stripe_price_id: priceId,
    metadata: { requested_by_user_id: userData.user.id },
  }, { onConflict: 'owner_user_id' })

  await adminSupabase.from('audit_logs').insert({
    id: auditId(),
    user_id: ownerUserId,
    action: 'create_checkout',
    entity_type: 'billing_subscription',
    entity_id: checkout.id,
    entity_name: plan,
    details: { plan, requested_by_user_id: userData.user.id },
    user_agent: req.headers.get('User-Agent') ?? '',
  })

  return json({ url: checkout.url }, 200, corsHeaders)
})
