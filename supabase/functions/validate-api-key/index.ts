import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const supabaseUrl = Deno.env.get('SUPABASE_URL') ?? ''

    const supabase = createClient(supabaseUrl, supabaseServiceRoleKey, {
      global: { headers: { Authorization: req.headers.get('Authorization')! } },
    })

    // Get the API key from the Authorization header
    const authHeader = req.headers.get('Authorization')
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return new Response(
        JSON.stringify({ valid: false, error: 'Missing or invalid Authorization header' }),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } },
      )
    }

    const apiKey = authHeader.replace('Bearer ', '')
    const prefix = apiKey.slice(0, 11) // rr_ + 8 chars

    // Look up the API key by prefix
    const { data: keys, error: queryError } = await supabase
      .from('api_keys')
      .select('id, user_id, name, scopes, revoked, expires_at')
      .eq('prefix', prefix)
      .eq('revoked', false)
      .limit(1)

    if (queryError) {
      console.error('[validate-api-key] Query error:', queryError.message)
      return new Response(
        JSON.stringify({ valid: false, error: 'Database error' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } },
      )
    }

    if (!keys || keys.length === 0) {
      return new Response(
        JSON.stringify({ valid: false, error: 'Invalid API key' }),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } },
      )
    }

    const key = keys[0]

    // Check if key is expired
    if (key.expires_at && new Date(key.expires_at) < new Date()) {
      return new Response(
        JSON.stringify({ valid: false, error: 'API key expired' }),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } },
      )
    }

    // Update last_used_at
    await supabase
      .from('api_keys')
      .update({ last_used_at: new Date().toISOString() })
      .eq('id', key.id)

    // Audit log
    const userAgent = req.headers.get('User-Agent') || ''
    await supabase
      .from('audit_logs')
      .insert({
        id: 'al_' + Math.random().toString(36).slice(2, 10),
        user_id: key.user_id,
        action: 'execute',
        entity_type: 'api_key',
        entity_id: key.id,
        entity_name: key.name,
        details: { scopes: key.scopes },
        user_agent: userAgent,
      })

    return new Response(
      JSON.stringify({
        valid: true,
        userId: key.user_id,
        name: key.name,
        scopes: key.scopes,
      }),
      { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } },
    )
  } catch (error) {
    console.error('[validate-api-key] Error:', error)
    return new Response(
      JSON.stringify({ valid: false, error: 'Internal server error' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } },
    )
  }
})
