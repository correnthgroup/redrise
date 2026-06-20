import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
}

type InvitePayload = {
  email?: string
  role?: 'admin' | 'member' | 'viewer'
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

  const { data: existing } = await adminClient
    .from('team_members')
    .select('id')
    .eq('owner_user_id', user.id)
    .or(`invite_email.eq.${email}${existingProfile?.id ? `,member_user_id.eq.${existingProfile.id}` : ''}`)
    .maybeSingle()

  const memberUserId = existingProfile?.id ?? null
  const status = memberUserId ? 'active' : 'invited'

  if (existing?.id) {
    const { error: updateError } = await adminClient
      .from('team_members')
      .update({ role, member_user_id: memberUserId, status })
      .eq('id', existing.id)
    if (updateError) {
      return new Response(JSON.stringify({ error: updateError.message }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      })
    }
  } else {
    const { error: insertError } = await adminClient
      .from('team_members')
      .insert({ owner_user_id: user.id, member_user_id: memberUserId, invite_email: email, role, status })
    if (insertError) {
      return new Response(JSON.stringify({ error: insertError.message }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      })
    }
  }

  if (memberUserId) {
    return new Response(JSON.stringify({ ok: true, emailSent: false, emailError: null, existingAccount: true }), {
      status: 200,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    })
  }

  const appBaseUrl = Deno.env.get('APP_BASE_URL') ?? req.headers.get('Origin') ?? 'http://localhost:5173'
  const redirectTo = `${appBaseUrl}?invited=1&email=${encodeURIComponent(email)}`
  const { error: inviteError } = await adminClient.auth.admin.inviteUserByEmail(email, {
    redirectTo,
    data: { invited_by: user.id },
  })

  return new Response(JSON.stringify({ ok: true, emailSent: !inviteError, emailError: inviteError?.message ?? null, existingAccount: false }), {
    status: 200,
    headers: { ...corsHeaders, 'Content-Type': 'application/json' },
  })
})
