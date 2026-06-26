import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'

function structured(finalAnswer: string, summary: string) {
  const parsed = {
    final_answer: finalAnswer,
    decision_summary: summary,
    steps_summary: ['Received staging adapter request.', 'Returned deterministic staging response.'],
    evidence_used: ['Adapter staging Edge Function'],
    open_questions: [],
    confidence: 0.8,
    handoff_notes: 'Use this endpoint to validate integration_gateway wiring before connecting a production adapter.',
  }
  return {
    raw_output: JSON.stringify(parsed, null, 2),
    parsed_output: parsed,
    parse_error: null,
    tokens_used: 0,
    model: 'adapter:integration_gateway_staging',
  }
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: { 'Access-Control-Allow-Origin': '*', 'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type' } })
  }
  if (req.method !== 'POST') {
    return new Response(JSON.stringify({ error: 'Method not allowed' }), { status: 405, headers: { 'Access-Control-Allow-Origin': '*', 'Content-Type': 'application/json' } })
  }

  const expected = Deno.env.get('ADAPTER_STAGING_TOKEN')
  if (expected && req.headers.get('Authorization') !== `Bearer ${expected}`) {
    return new Response(JSON.stringify({ error: 'Invalid adapter token' }), { status: 401, headers: { 'Access-Control-Allow-Origin': '*', 'Content-Type': 'application/json' } })
  }

  const body = await req.json().catch(() => ({}))
  return new Response(JSON.stringify(structured(
    `Integration Gateway staging executed for ${body.execution_id ?? 'untracked execution'}.`,
    'Integration gateway staging adapter completed successfully.',
  )), { headers: { 'Access-Control-Allow-Origin': '*', 'Content-Type': 'application/json' } })
})
