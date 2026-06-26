import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const DEFAULT_ALLOWED_ORIGINS = ['http://localhost:5173', 'http://127.0.0.1:5173']

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

async function testProvider(provider: string, authMethod: string, apiKey: string) {
  if (provider === 'openai' && (authMethod === 'chatgpt_browser' || authMethod === 'chatgpt_headless')) {
    return { ok: true, message: 'OpenAI runtime profile is ready for administrator setup.' }
  }

  if (!apiKey.trim()) return { ok: false, message: 'API key is required.' }

  if (provider === 'openai') {
    const response = await fetch('https://api.openai.com/v1/models', { headers: { Authorization: `Bearer ${apiKey}` } })
    return { ok: response.ok, message: response.ok ? 'OpenAI API connection is active.' : 'OpenAI API key could not be validated.' }
  }

  if (provider === 'anthropic') {
    const response = await fetch('https://api.anthropic.com/v1/models?limit=1', { headers: { 'x-api-key': apiKey, 'anthropic-version': '2023-06-01' } })
    return { ok: response.ok, message: response.ok ? 'Anthropic API connection is active.' : 'Anthropic API key could not be validated.' }
  }

  if (provider === 'google') {
    const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models?key=${encodeURIComponent(apiKey)}`)
    return { ok: response.ok, message: response.ok ? 'Google API connection is active.' : 'Google API key could not be validated.' }
  }

  if (provider === 'openrouter') {
    const response = await fetch('https://openrouter.ai/api/v1/models', { headers: { Authorization: `Bearer ${apiKey}` } })
    return { ok: response.ok, message: response.ok ? 'OpenRouter API connection is active.' : 'OpenRouter API key could not be validated.' }
  }

  return { ok: false, message: 'Unsupported provider.' }
}

serve(async (req) => {
  const corsHeaders = getCorsHeaders(req.headers.get('Origin'))
  if (req.method === 'OPTIONS') return new Response('ok', { headers: corsHeaders })
  if (req.method !== 'POST') return json({ ok: false, message: 'Method not allowed' }, 405, corsHeaders)

  const supabaseUrl = Deno.env.get('SUPABASE_URL') ?? ''
  const anonKey = Deno.env.get('SUPABASE_ANON_KEY') ?? ''
  const authHeader = req.headers.get('Authorization') ?? ''
  if (!supabaseUrl || !anonKey || !authHeader.startsWith('Bearer ')) return json({ ok: false, message: 'Not authenticated' }, 401, corsHeaders)

  const supabase = createClient(supabaseUrl, anonKey, { global: { headers: { Authorization: authHeader } } })
  const { data: userData, error } = await supabase.auth.getUser()
  if (error || !userData.user) return json({ ok: false, message: 'Not authenticated' }, 401, corsHeaders)

  const body = await req.json().catch(() => ({})) as { provider?: string; authMethod?: string; apiKey?: string }
  const result = await testProvider(body.provider ?? '', body.authMethod ?? 'api', body.apiKey ?? '').catch(() => ({ ok: false, message: 'Provider test failed.' }))
  return json(result, result.ok ? 200 : 400, corsHeaders)
})
