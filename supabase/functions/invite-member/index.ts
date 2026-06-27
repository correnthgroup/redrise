import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const DEFAULT_ALLOWED_ORIGINS = ['http://localhost:5173', 'http://127.0.0.1:5173']

function getAllowedOrigins(): string[] {
  const configured = Deno.env.get('APP_ALLOWED_ORIGINS')
  if (!configured) return DEFAULT_ALLOWED_ORIGINS
  return [...DEFAULT_ALLOWED_ORIGINS, ...configured.split(',').map((origin) => origin.trim()).filter(Boolean)]
}

function getCorsHeaders(origin: string | null): Record<string, string> {
  const allowedOrigins = getAllowedOrigins()
  const fallbackOrigin = allowedOrigins[0] ?? '*'
  const allowed = allowedOrigins.some((o) => o.includes('*') ? (origin?.startsWith(o.replace('*', '')) ?? false) : origin === o)
  return {
    'Access-Control-Allow-Origin': allowed ? (origin ?? '*') : fallbackOrigin,
    'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
    'Access-Control-Allow-Methods': 'POST, OPTIONS',
  }
}

type InvitePayload = {
  email?: string
  role?: 'owner' | 'admin' | 'member' | 'viewer'
  memberFunction?: string
  team?: string
  teamId?: string
  ownerUserId?: string
  checkOnly?: boolean
}

async function sendInviteWithResend(input: {
  apiKey: string
  fromEmail: string
  toEmail: string
  inviteLink: string
  templateId: string
}) {
  const response = await fetch('https://api.resend.com/emails', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${input.apiKey}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      from: `Redrise <${input.fromEmail}>`,
      to: [input.toEmail],
      subject: 'You were invited to Redrise',
      template: {
        id: input.templateId,
        variables: {
          INVITE_LINK: input.inviteLink,
          JOIN_URL: input.inviteLink,
          SIGNUP_URL: input.inviteLink,
          CTA_LINK: input.inviteLink,
          CTA_TEXT: 'Join Us',
          INVITED_EMAIL: input.toEmail,
        },
      },
    }),
  })

  const body = await response.json().catch(() => ({}))
  return {
    ok: response.ok,
    error: response.ok ? null : body?.message ?? body?.error ?? `Resend returned ${response.status}`,
  }
}

function generateInviteToken() {
  const bytes = new Uint8Array(32)
  crypto.getRandomValues(bytes)
  return btoa(String.fromCharCode(...bytes)).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/g, '')
}

async function sha256(value: string) {
  const bytes = new TextEncoder().encode(value)
  const hash = await crypto.subtle.digest('SHA-256', bytes)
  return Array.from(new Uint8Array(hash)).map((byte) => byte.toString(16).padStart(2, '0')).join('')
}

function generateShortId(prefix: string) {
  const chars = 'abcdefghijklmnopqrstuvwxyz0123456789'
  let id = prefix
  for (let i = 0; i < 5; i++) id += chars[Math.floor(Math.random() * chars.length)]
  return id
}

Deno.serve(async (req) => {
  const origin = req.headers.get('Origin')
  const corsHeaders = getCorsHeaders(origin)

  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  if (req.method !== 'POST') {
    return new Response(JSON.stringify({ error: 'Method not allowed' }), {
      status: 405,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    })
  }

  const supabaseUrl = Deno.env.get('SUPABASE_URL')
  const anonKey = Deno.env.get('SUPABASE_ANON_KEY')
  const serviceRoleKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')
  const resendApiKey = Deno.env.get('RESEND_API_KEY')
  const resendFromEmail = Deno.env.get('RESEND_FROM_EMAIL') ?? 'hi.from@redrise.app'
  const resendInviteTemplateId = Deno.env.get('RESEND_INVITE_TEMPLATE_ID') ?? 'Invite'

  if (!supabaseUrl || !anonKey || !serviceRoleKey) {
    return new Response(JSON.stringify({ error: 'Missing Supabase function environment' }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    })
  }

  const authHeader = req.headers.get('Authorization') ?? ''
  const userClient = createClient(supabaseUrl, anonKey, {
    global: { headers: { Authorization: authHeader } },
  })
  const adminClient = createClient(supabaseUrl, serviceRoleKey)

  const { data: { user }, error: userError } = await userClient.auth.getUser()
  if (userError || !user) {
    return new Response(JSON.stringify({ error: 'Unauthorized' }), {
      status: 401,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    })
  }

  const payload = await req.json() as InvitePayload
  const email = payload.email?.trim().toLowerCase()
  const role = payload.role ?? 'member'
  const memberFunction = payload.memberFunction?.trim() ?? ''
  const team = payload.team?.trim() ?? ''
  const teamId = payload.teamId?.trim() ?? ''
  const ownerUserId = payload.ownerUserId ?? user.id

  if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    return new Response(JSON.stringify({ error: 'A valid email is required' }), {
      status: 400,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    })
  }

  // Validate Admin BEFORE any profile lookup to prevent email enumeration
  const { data: adminRows } = await adminClient
    .from('team_members')
    .select('id')
    .eq('owner_user_id', ownerUserId)
    .eq('member_user_id', user.id)
    .eq('status', 'active')
    .eq('function', 'Admin')
    .limit(1)

  if ((adminRows ?? []).length === 0) {
    return new Response(JSON.stringify({ error: 'Admin access is required to invite members' }), {
      status: 403,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    })
  }

  const { data: existingProfile } = await adminClient
    .from('profiles')
    .select('id, email')
    .eq('email', email)
    .maybeSingle()

  if (existingProfile?.id === user.id) {
    return new Response(JSON.stringify({ error: 'You cannot invite your own account' }), {
      status: 400,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    })
  }

  if (payload.checkOnly) {
    return new Response(JSON.stringify({ ok: true, existingAccount: !!existingProfile?.id }), {
      status: 200,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    })
  }

  const { data: existing } = await adminClient
    .from('team_members')
    .select('id')
    .eq('owner_user_id', ownerUserId)
    .or(`invite_email.eq.${email}${existingProfile?.id ? `,member_user_id.eq.${existingProfile.id}` : ''}`)
    .maybeSingle()

  const memberUserId = existingProfile?.id ?? null
  const status = 'invited'
  let teamMemberId = existing?.id ?? null

  if (existing?.id) {
    const { error: updateError } = await adminClient
      .from('team_members')
      .update({ role, member_user_id: memberUserId, status, function: memberFunction, team })
      .eq('id', existing.id)
    if (updateError) {
      return new Response(JSON.stringify({ error: updateError.message }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      })
    }
  } else {
    const { data: inserted, error: insertError } = await adminClient
      .from('team_members')
      .insert({ owner_user_id: ownerUserId, member_user_id: memberUserId, invite_email: email, role, function: memberFunction, team, status })
      .select('id')
      .single()
    if (insertError) {
      return new Response(JSON.stringify({ error: insertError.message }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      })
    }
    teamMemberId = inserted?.id ?? null
  }

  let assignmentCreated = false
  if (teamId && teamMemberId) {
    const { error: assignmentError } = await adminClient
      .from('team_assignments')
      .upsert({
        id: generateShortId('ta'),
        team_id: teamId,
        team_member_id: teamMemberId,
        function: memberFunction,
        updated_at: new Date().toISOString(),
      }, { onConflict: 'team_id,team_member_id', ignoreDuplicates: false })
    assignmentCreated = !assignmentError
  }

  if (memberUserId) {
    let notificationCreated = false
    if (teamMemberId) {
      const { data: existingNotification } = await adminClient
        .from('team_invite_notifications')
        .select('id')
        .eq('team_member_id', teamMemberId)
        .eq('status', 'pending')
        .maybeSingle()

      const { error: notificationError } = existingNotification?.id
        ? await adminClient
          .from('team_invite_notifications')
          .update({ owner_user_id: ownerUserId, recipient_user_id: memberUserId, updated_at: new Date().toISOString() })
          .eq('id', existingNotification.id)
        : await adminClient
        .from('team_invite_notifications')
        .insert({ owner_user_id: ownerUserId, recipient_user_id: memberUserId, team_member_id: teamMemberId, status: 'pending' })
      notificationCreated = !notificationError
    }
    return new Response(JSON.stringify({ ok: true, teamMemberId, assignmentCreated, notificationCreated, emailSent: false, emailError: null, existingAccount: true }), {
      status: 200,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    })
  }

  const appBaseUrl = Deno.env.get('APP_BASE_URL') ?? req.headers.get('Origin') ?? 'http://localhost:5173'
  const inviteToken = generateInviteToken()
  const inviteTokenHash = await sha256(inviteToken)
  const inviteLink = `${appBaseUrl}?invited=1&email=${encodeURIComponent(email)}&invite_token=${encodeURIComponent(inviteToken)}`

  let tokenError: { message: string } | null
  if (teamMemberId) {
    const { error: expireError } = await adminClient
      .from('external_member_invites')
      .update({ status: 'expired', updated_at: new Date().toISOString() })
      .eq('team_member_id', teamMemberId)
      .eq('status', 'pending')

    if (expireError) {
      tokenError = expireError
    } else {
      const { error: insertInviteError } = await adminClient
        .from('external_member_invites')
        .insert({ owner_user_id: ownerUserId, team_member_id: teamMemberId, invite_email: email, token_hash: inviteTokenHash })
      tokenError = insertInviteError
    }
  } else {
    tokenError = { message: 'Missing team member id' }
  }

  let emailSent = false
  let emailError = tokenError?.message ?? null
  if (!tokenError && inviteLink && resendApiKey) {
    const resend = await sendInviteWithResend({
      apiKey: resendApiKey,
      fromEmail: resendFromEmail,
      toEmail: email,
      inviteLink,
      templateId: resendInviteTemplateId,
    })
    emailSent = resend.ok
    emailError = resend.error
  } else if (!resendApiKey) {
    emailError = 'Missing RESEND_API_KEY'
  }

  return new Response(JSON.stringify({ ok: true, teamMemberId, assignmentCreated, emailSent, emailError, inviteLink, existingAccount: false }), {
    status: 200,
    headers: { ...corsHeaders, 'Content-Type': 'application/json' },
  })
})
