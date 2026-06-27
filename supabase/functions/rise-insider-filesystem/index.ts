import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const DEFAULT_ALLOWED_ORIGINS = [
  'http://localhost:5173',
  'http://127.0.0.1:5173',
]

const SANDBOX_LABEL = 'rise-insider-filesystem:supabase'
const MAX_CONTENT_BYTES = 64 * 1024
const ALLOWED_EXTENSIONS = new Set(['.txt', '.md', '.json', '.csv', '.log'])

function getAllowedOrigins(): string[] {
  const configured = Deno.env.get('APP_ALLOWED_ORIGINS')
  if (!configured) return DEFAULT_ALLOWED_ORIGINS
  return configured.split(',').map((origin) => origin.trim()).filter(Boolean)
}

function getCorsHeaders(origin: string | null): Record<string, string> {
  const allowedOrigins = getAllowedOrigins()
  const fallbackOrigin = allowedOrigins[0] ?? '*'
  const allowed = allowedOrigins.some((o) => {
    if (o.includes('*')) return origin?.startsWith(o.replace('*', '')) ?? false
    return origin === o
  })
  return {
    'Access-Control-Allow-Origin': allowed ? (origin ?? '*') : fallbackOrigin,
    'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  }
}

function structured(finalAnswer: string, summary: string, steps: string[], evidence: string[], openQuestions: string[] = []) {
  const parsed = {
    final_answer: finalAnswer,
    decision_summary: summary,
    steps_summary: steps,
    evidence_used: evidence,
    open_questions: openQuestions,
    confidence: 0.82,
    handoff_notes: 'Rise Insider Filesystem adapter executed inside the explicit Supabase-backed sandbox with an allowlisted operation set.',
  }
  return {
    raw_output: JSON.stringify(parsed, null, 2),
    parsed_output: parsed,
    parse_error: null,
    tokens_used: 0,
    model: 'adapter:rise_insider_filesystem',
  }
}

function assertAdapterToken(req: Request) {
  const expected = Deno.env.get('RISE_INSIDER_FILESYSTEM_TOKEN')
  const required = Deno.env.get('RISE_INSIDER_REQUIRE_TOKEN') === 'true'
  const isDev = Deno.env.get('DENO_DEPLOYMENT_ID') === undefined
  if (!expected) return isDev && !required
  const auth = req.headers.get('Authorization') ?? ''
  return auth === `Bearer ${expected}`
}

function parseRequest(body: Record<string, unknown>) {
  if (body.operation || body.path || body.content) {
    return {
      operation: String(body.operation ?? 'status').trim().toLowerCase(),
      path: typeof body.path === 'string' ? body.path : '',
      content: typeof body.content === 'string' ? body.content : '',
    }
  }

  const prompt = String(body.prompt ?? body.objective ?? 'operation: status')
  const fields = new Map<string, string>()
  for (const line of prompt.split('\n')) {
    const match = line.match(/^\s*(operation|command|path|content)\s*:\s*(.*)$/i)
    if (match) fields.set(match[1].toLowerCase(), match[2])
  }
  return {
    operation: (fields.get('operation') ?? fields.get('command') ?? prompt.trim() ?? 'status').trim().toLowerCase(),
    path: fields.get('path') ?? '',
    content: fields.get('content') ?? '',
  }
}

function ownerKey(body: Record<string, unknown>) {
  const key = String(body.owner_user_id ?? body.owner_key ?? 'direct').trim()
  if (!/^[a-zA-Z0-9:_-]{1,80}$/.test(key)) throw new Error('Invalid sandbox owner key')
  return key
}

function extensionOf(path: string) {
  const match = path.match(/(\.[a-z0-9]+)$/i)
  return match?.[1].toLowerCase() ?? ''
}

function safePath(rawPath: string) {
  const trimmed = rawPath.trim().replace(/\\/g, '/')
  if (!trimmed || trimmed.startsWith('/') || trimmed.includes('\0')) throw new Error('A relative sandbox path is required')
  const parts = trimmed.split('/').filter(Boolean)
  if (parts.some((part) => part === '..' || part === '.')) throw new Error('Path traversal is not allowed')
  const normalized = parts.join('/')
  const ext = extensionOf(normalized)
  if (ext && !ALLOWED_EXTENSIONS.has(ext)) throw new Error(`Extension not allowed: ${ext}`)
  return normalized
}

function supabaseAdmin() {
  const url = Deno.env.get('SUPABASE_URL')
  const key = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')
  if (!url || !key) throw new Error('Filesystem sandbox storage is not configured')
  return createClient(url, key)
}

serve(async (req) => {
  const origin = req.headers.get('Origin')
  const corsHeaders = getCorsHeaders(origin)

  if (req.method === 'OPTIONS') return new Response('ok', { headers: corsHeaders })
  if (req.method !== 'POST') {
    return new Response(JSON.stringify({ error: 'Method not allowed' }), { status: 405, headers: { ...corsHeaders, 'Content-Type': 'application/json' } })
  }
  if (!assertAdapterToken(req)) {
    return new Response(JSON.stringify({ error: 'Invalid adapter token' }), { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } })
  }

  try {
    const body = await req.json().catch(() => ({})) as Record<string, unknown>
    const { operation, path, content } = parseRequest(body)
    const owner = ownerKey(body)

    if (operation === 'status') {
      return new Response(JSON.stringify(structured(
        `Rise Insider Filesystem adapter is online. Sandbox: ${SANDBOX_LABEL}`,
        'Runtime status returned successfully.',
        ['Received adapter request.', 'Confirmed Supabase-backed sandbox availability.'],
        ['Allowed operation: status', `Sandbox: ${SANDBOX_LABEL}`, `Owner key: ${owner}`],
      )), { headers: { ...corsHeaders, 'Content-Type': 'application/json' } })
    }

    const supabase = supabaseAdmin()
    if (operation === 'list') {
      const { data, error } = await supabase
        .from('rise_insider_files')
        .select('path,updated_at')
        .eq('owner_key', owner)
        .order('path', { ascending: true })
      if (error) throw error
      const entries = (data ?? []).map((entry) => `${entry.path} (${entry.updated_at})`)
      return new Response(JSON.stringify(structured(
        entries.length ? entries.join('\n') : 'Sandbox is empty.',
        'Sandbox listing completed.',
        ['Validated operation.', 'Listed Supabase-backed sandbox entries.'],
        ['Allowed operation: list', `Sandbox: ${SANDBOX_LABEL}`, `Owner key: ${owner}`],
      )), { headers: { ...corsHeaders, 'Content-Type': 'application/json' } })
    }

    if (!['read', 'write', 'append', 'delete'].includes(operation)) {
      return new Response(JSON.stringify({ error: `Operation not allowed: ${operation}` }), { status: 422, headers: { ...corsHeaders, 'Content-Type': 'application/json' } })
    }

    const normalizedPath = safePath(path)
    if (operation === 'read') {
      const { data, error } = await supabase
        .from('rise_insider_files')
        .select('content')
        .eq('owner_key', owner)
        .eq('path', normalizedPath)
        .maybeSingle()
      if (error) throw error
      if (!data) throw new Error('Sandbox file not found')
      return new Response(JSON.stringify(structured(
        data.content,
        'Sandbox file read completed.',
        ['Validated sandbox path.', 'Read text file from Supabase-backed sandbox.'],
        ['Allowed operation: read', `Path: ${normalizedPath}`, `Owner key: ${owner}`],
      )), { headers: { ...corsHeaders, 'Content-Type': 'application/json' } })
    }

    if (content.length > MAX_CONTENT_BYTES) {
      return new Response(JSON.stringify({ error: 'Content exceeds maximum sandbox write size' }), { status: 413, headers: { ...corsHeaders, 'Content-Type': 'application/json' } })
    }

    if (operation === 'delete') {
      const { error } = await supabase
        .from('rise_insider_files')
        .delete()
        .eq('owner_key', owner)
        .eq('path', normalizedPath)
      if (error) throw error
    } else {
      let nextContent = content
      if (operation === 'append') {
        const { data, error } = await supabase
          .from('rise_insider_files')
          .select('content')
          .eq('owner_key', owner)
          .eq('path', normalizedPath)
          .maybeSingle()
        if (error) throw error
        nextContent = `${data?.content ?? ''}${content}`
        if (nextContent.length > MAX_CONTENT_BYTES) throw new Error('Content exceeds maximum sandbox write size')
      }
      const { error } = await supabase
        .from('rise_insider_files')
        .upsert({ owner_key: owner, path: normalizedPath, content: nextContent, updated_at: new Date().toISOString() })
      if (error) throw error
    }

    return new Response(JSON.stringify(structured(
      `${operation} completed for ${normalizedPath}`,
      `Sandbox ${operation} operation completed.`,
      ['Validated sandbox path.', `Executed allowed operation: ${operation}.`],
      [`Path: ${normalizedPath}`, `Sandbox: ${SANDBOX_LABEL}`, `Owner key: ${owner}`],
    )), { headers: { ...corsHeaders, 'Content-Type': 'application/json' } })
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Internal server error'
    console.error('[rise-insider-filesystem] Error:', message)
    return new Response(JSON.stringify({ error: message }), { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } })
  }
})
