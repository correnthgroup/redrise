import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
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
      html: `
        <div style="font-family: Arial, sans-serif; line-height: 1.5; color: #1f2937;">
          <h1 style="font-size: 20px; margin-bottom: 12px;">You were invited to Redrise</h1>
          <p>Use the secure link below to create your account and join the workspace.</p>
          <p><a href="${input.inviteLink}" style="display: inline-block; padding: 10px 14px; background: #8F1D1D; color: #ffffff; text-decoration: none; border-radius: 8px;">Accept invite</a></p>
          <p style="font-size: 12px; color: #6b7280;">If the button does not work, copy and paste this link into your browser:</p>
          <p style="font-size: 12px; color: #6b7280; word-break: break-all;">${input.inviteLink}</p>
        </div>
      `,
      text: `You were invited to Redrise. Create your account with this link: ${input.inviteLink}`,
    }),
  })

  const body = await response.json().catch(() => ({}))
  return {
    ok: response.ok,
    error: response.ok ? null : body?.message ?? body?.error ?? `Resend returned ${response.status}`,
  }
}

function generateShortId(prefix: string) {
  const chars = 'abcdefghijklmnopqrstuvwxyz0123456789'
  let id = prefix
  for (let i = 0; i < 5; i++) id += chars[Math.floor(Math.random() * chars.length)]
  return id
}

Deno.serve(async (req) => {
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
  const redirectTo = `${appBaseUrl}?invited=1&email=${encodeURIComponent(email)}`
  const { data: linkData, error: linkError } = await adminClient.auth.admin.generateLink({
    type: 'invite',
    email,
    options: {
      redirectTo,
      data: { invited_by: ownerUserId },
    },
  })
  const inviteLink = linkData?.properties?.action_link ?? null

  let emailSent = false
  let emailError = linkError?.message ?? null
  if (inviteLink && resendApiKey) {
    const resend = await sendInviteWithResend({
      apiKey: resendApiKey,
      fromEmail: resendFromEmail,
      toEmail: email,
      inviteLink,
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
