import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'

const DEFAULT_ALLOWED_ORIGINS = [
  'http://localhost:5173',
  'http://127.0.0.1:5173',
]

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
    handoff_notes: 'Rise Insider Terminal adapter executed inside the authorized Edge runtime command set.',
  }
  return {
    raw_output: JSON.stringify(parsed, null, 2),
    parsed_output: parsed,
    parse_error: null,
    tokens_used: 0,
    model: 'adapter:rise_insider_terminal',
  }
}

function assertAdapterToken(req: Request) {
  const expected = Deno.env.get('RISE_INSIDER_ADAPTER_TOKEN')
  const required = Deno.env.get('RISE_INSIDER_REQUIRE_TOKEN') === 'true'
  if (!expected) return !required
  const auth = req.headers.get('Authorization') ?? ''
  return auth === `Bearer ${expected}`
}

function parseCommand(prompt: string) {
  const normalized = prompt.trim()
  const match = normalized.match(/(?:^|\n)\s*(?:command|cmd)\s*:\s*(.+)$/i)
  return (match?.[1] ?? normalized).trim()
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
    const body = await req.json()
    const command = parseCommand(String(body.prompt ?? body.objective ?? 'status'))
    const [name, ...rest] = command.split(/\s+/)
    const arg = rest.join(' ')
    const task = body.task && typeof body.task === 'object' ? body.task as Record<string, unknown> : null

    if (!name || name.toLowerCase() === 'status') {
      return new Response(JSON.stringify(structured(
        'Rise Insider Terminal adapter is online.',
        'Runtime status returned successfully.',
        ['Received adapter request.', 'Returned runtime status.'],
        ['Edge runtime', 'Allowed command: status'],
      )), { headers: { ...corsHeaders, 'Content-Type': 'application/json' } })
    }

    if (name.toLowerCase() === 'echo') {
      return new Response(JSON.stringify(structured(
        arg || 'No echo input provided.',
        'Echo command completed.',
        ['Received echo command.', 'Returned provided text without shell execution.'],
        ['Allowed command: echo'],
      )), { headers: { ...corsHeaders, 'Content-Type': 'application/json' } })
    }

    if (name.toLowerCase() === 'date') {
      const now = new Date().toISOString()
      return new Response(JSON.stringify(structured(
        now,
        'Date command completed.',
        ['Received date command.', 'Returned runtime ISO timestamp.'],
        ['Allowed command: date'],
      )), { headers: { ...corsHeaders, 'Content-Type': 'application/json' } })
    }

    if (name.toLowerCase() === 'inspect') {
      return new Response(JSON.stringify(structured(
        JSON.stringify({ task, execution_id: body.execution_id ?? null, execution_path: body.execution_path ?? null }, null, 2),
        'Inspect command completed.',
        ['Received inspect command.', 'Returned sanitized adapter request context.'],
        ['Allowed command: inspect'],
      )), { headers: { ...corsHeaders, 'Content-Type': 'application/json' } })
    }

    return new Response(JSON.stringify({ error: `Command not allowed: ${name}` }), { status: 422, headers: { ...corsHeaders, 'Content-Type': 'application/json' } })
  } catch (error) {
    console.error('[rise-insider-terminal] Error:', error)
    return new Response(JSON.stringify({ error: 'Internal server error' }), { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } })
  }
})
