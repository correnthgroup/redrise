import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from "https://esm.sh/@supabase/supabase-js@2"

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
    if (o.includes('*')) {
      const prefix = o.replace('*', '')
      return origin?.startsWith(prefix) ?? false
    }
    return origin === o
  })
  return {
    'Access-Control-Allow-Origin': allowed ? (origin ?? '*') : fallbackOrigin,
    'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  }
}

const STRUCTURED_OUTPUT_SCHEMA = `{
  "final_answer": "string — the complete answer or result",
  "decision_summary": "string — brief summary of the decision made",
  "steps_summary": ["string — each step taken to reach the answer"],
  "evidence_used": ["string — sources, context, or data used"],
  "open_questions": ["string — unresolved items or uncertainties"],
  "confidence": "number between 0 and 1",
  "handoff_notes": "string — notes for downstream tasks or human review"
}`

function buildStructuredPrompt(
  objective: string,
  prompt: string,
  upstreamContext: string | null,
  language: string,
): Array<{ role: string; content: string }> {
  const messages: Array<{ role: string; content: string }> = []

  const languageInstruction = language === 'pt-BR'
    ? 'Responda em Portugu\u00eas do Brasil.'
    : language === 'es'
    ? 'Responda en Espa\u00f1ol.'
    : 'Respond in English.'

  messages.push({
    role: 'system',
    content: `You are an AI agent executing a task. Your response MUST be valid JSON matching this schema:

${STRUCTURED_OUTPUT_SCHEMA}

Rules:
- Always respond with valid JSON only, no markdown or extra text.
- confidence must be a number between 0 and 1.
- steps_summary should list each logical step you took.
- evidence_used should cite any context, data, or sources you relied on.
- open_questions should list anything you could not resolve or that needs human input.
- handoff_notes should contain any context useful for downstream tasks.
- ${languageInstruction}
- The final_answer value must be formatted text (use \\n for new lines, ** for bold, numbered lists with 1. 2. etc.).`
  })

  if (upstreamContext) {
    messages.push({
      role: 'system',
      content: `## Upstream Context (approved artifact from previous task)\n\n${upstreamContext}`
    })
  }

  messages.push({
    role: 'system',
    content: `## Task Objective\n\n${objective}`
  })

  messages.push({
    role: 'user',
    content: prompt
  })

  return messages
}

function parseStructuredOutput(raw: string): {
  parsed: Record<string, unknown> | null
  error: string | null
} {
  try {
    // Try to extract JSON from the response (handle markdown code blocks)
    let jsonStr = raw.trim()
    const jsonMatch = jsonStr.match(/```(?:json)?\s*([\s\S]*?)```/)
    if (jsonMatch) {
      jsonStr = jsonMatch[1].trim()
    }

    const parsed = JSON.parse(jsonStr)

    // Validate required fields
    const required = ['final_answer', 'decision_summary', 'steps_summary', 'evidence_used', 'open_questions', 'confidence', 'handoff_notes']
    for (const field of required) {
      if (!(field in parsed)) {
        return { parsed: null, error: `Missing required field: ${field}` }
      }
    }

    // Validate types
    if (typeof parsed.final_answer !== 'string') {
      return { parsed: null, error: 'final_answer must be a string' }
    }
    if (typeof parsed.decision_summary !== 'string') {
      return { parsed: null, error: 'decision_summary must be a string' }
    }
    if (!Array.isArray(parsed.steps_summary)) {
      return { parsed: null, error: 'steps_summary must be an array' }
    }
    if (!Array.isArray(parsed.evidence_used)) {
      return { parsed: null, error: 'evidence_used must be an array' }
    }
    if (!Array.isArray(parsed.open_questions)) {
      return { parsed: null, error: 'open_questions must be an array' }
    }
    if (typeof parsed.confidence !== 'number' || parsed.confidence < 0 || parsed.confidence > 1) {
      return { parsed: null, error: 'confidence must be a number between 0 and 1' }
    }
    if (typeof parsed.handoff_notes !== 'string') {
      return { parsed: null, error: 'handoff_notes must be a string' }
    }

    return { parsed, error: null }
  } catch (e) {
    return { parsed: null, error: `JSON parse error: ${e instanceof Error ? e.message : String(e)}` }
  }
}

function buildStructuredResult(
  finalAnswer: string,
  decisionSummary: string,
  steps: string[],
  evidence: string[],
  openQuestions: string[],
  confidence = 0.8,
  handoffNotes = '',
): Record<string, unknown> {
  return {
    final_answer: finalAnswer,
    decision_summary: decisionSummary,
    steps_summary: steps,
    evidence_used: evidence,
    open_questions: openQuestions,
    confidence,
    handoff_notes: handoffNotes,
  }
}

function adapterResponse(parsed: Record<string, unknown>, model: string) {
  const raw = JSON.stringify(parsed, null, 2)
  return {
    raw_output: raw,
    parsed_output: parsed,
    parse_error: null,
    tokens_used: 0,
    model,
  }
}

function providerCandidates(executionPath: string): string[] {
  if (executionPath === 'integration_gateway') return ['integration_gateway', 'webhook']
  return [executionPath]
}

function generateAdapterRunId(): string {
  return `ar${crypto.randomUUID().replace(/-/g, '').slice(0, 10)}`
}

function endpointLabel(endpoint: string | null | undefined): string | null {
  if (!endpoint) return null
  try {
    const url = new URL(endpoint)
    return `${url.origin}${url.pathname}`
  } catch {
    return null
  }
}

async function recordAdapterRun(
  supabase: ReturnType<typeof createClient>,
  input: {
    userId: string
    taskId?: string | null
    executionId?: string | null
    integrationId?: string | null
    executionPath: string
    provider: string
    endpoint?: string | null
    status: 'success' | 'failed'
    statusCode?: number | null
    latencyMs?: number | null
    errorMessage?: string | null
  },
) {
  const { error } = await supabase.from('adapter_runs').insert({
    id: generateAdapterRunId(),
    user_id: input.userId,
    task_id: input.taskId ?? null,
    execution_id: input.executionId ?? null,
    integration_id: input.integrationId ?? null,
    execution_path: input.executionPath,
    provider: input.provider,
    endpoint_label: endpointLabel(input.endpoint),
    status: input.status,
    status_code: input.statusCode ?? null,
    latency_ms: input.latencyMs ?? null,
    error_message: input.errorMessage ?? null,
  })
  if (error) console.error('[task-execute] adapter_runs insert error:', error.message)
}

async function runWebhookAdapter(
  supabase: ReturnType<typeof createClient>,
  userId: string,
  executionPath: string,
  body: Record<string, unknown>,
) {
  const started = performance.now()
  const task = body.task as Record<string, unknown> | undefined
  const workspaceId = typeof task?.workspace_id === 'string' ? task.workspace_id : null
  const providers = providerCandidates(executionPath)

  const { data: integrations, error } = await supabase
    .from('integrations')
    .select('*')
    .eq('user_id', userId)
    .in('provider', providers)
    .eq('status', 'active')
    .order('updated_at', { ascending: false })

  if (error) {
    console.error('[task-execute] Integration query error:', error.message)
    return { error: 'Integration lookup failed', status: 500, provider: executionPath, latencyMs: Math.round(performance.now() - started) }
  }

  const integration = (integrations ?? []).find((item) => !item.workspace_id || !workspaceId || item.workspace_id === workspaceId)
  if (!integration?.endpoint || !String(integration.endpoint).startsWith('https://')) {
    return { error: `No active HTTPS adapter configured for ${executionPath}`, status: 424, provider: executionPath, integration: null, latencyMs: Math.round(performance.now() - started) }
  }

  const config = (integration.config ?? {}) as Record<string, unknown>
  const token = typeof config.token === 'string' ? config.token : ''
  const response = await fetch(integration.endpoint, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
    body: JSON.stringify({
      execution_path: executionPath,
      execution_id: body.executionId ?? null,
      task: task ?? null,
      owner_user_id: userId,
      objective: body.objective ?? '',
      prompt: body.prompt ?? body.objective ?? '',
      upstream_context: body.upstreamContext ?? null,
      requested_at: new Date().toISOString(),
    }),
  })

  const contentType = response.headers.get('content-type') ?? ''
  const payload = contentType.includes('application/json') ? await response.json().catch(() => null) : await response.text()
  if (!response.ok) {
    console.error('[task-execute] Adapter error:', response.status, payload)
    return { error: `Adapter ${integration.name} failed: ${response.status}`, status: response.status, provider: integration.provider, integration, latencyMs: Math.round(performance.now() - started) }
  }

  if (payload && typeof payload === 'object' && 'raw_output' in payload) {
    const adapterPayload = payload as Record<string, unknown>
    return {
      result: {
        raw_output: String(adapterPayload.raw_output ?? ''),
        parsed_output: adapterPayload.parsed_output ?? null,
        parse_error: adapterPayload.parse_error ?? null,
        tokens_used: typeof adapterPayload.tokens_used === 'number' ? adapterPayload.tokens_used : 0,
        model: typeof adapterPayload.model === 'string' ? adapterPayload.model : `adapter:${integration.provider}`,
      },
      provider: integration.provider,
      integration,
      statusCode: response.status,
      latencyMs: Math.round(performance.now() - started),
    }
  }

  const finalAnswer = typeof payload === 'string' ? payload : JSON.stringify(payload, null, 2)
  const parsed = buildStructuredResult(
    finalAnswer,
    `Adapter ${integration.name} executed through ${executionPath}.`,
    [`Posted execution request to ${integration.endpoint}.`, 'Received adapter response.'],
    [`Integration: ${integration.name}`, `Execution path: ${executionPath}`],
    [],
    0.75,
    'Review adapter output before approving downstream use.',
  )
  return { result: adapterResponse(parsed, `adapter:${integration.provider}`), provider: integration.provider, integration, statusCode: response.status, latencyMs: Math.round(performance.now() - started) }
}

serve(async (req) => {
  const origin = req.headers.get('Origin')
  const corsHeaders = getCorsHeaders(origin)

  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders })
  }

  try {
    const authHeader = req.headers.get("Authorization")
    if (!authHeader) {
      return new Response(
        JSON.stringify({ error: "Missing authorization header" }),
        { status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      )
    }

    const supabase = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_ANON_KEY") ?? "",
      { global: { headers: { Authorization: authHeader } } }
    )

    const { data: { user }, error: authError } = await supabase.auth.getUser()
    if (authError || !user) {
      return new Response(
        JSON.stringify({ error: "Unauthorized" }),
        { status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      )
    }

    const body = await req.json()
    const { objective, prompt, upstreamContext, model = "openai/gpt-oss-120b:free", language = "en-US", executionPath = "api_gateway" } = body
    const taskPayload = body.task && typeof body.task === 'object' ? body.task as Record<string, unknown> : null
    const taskId = typeof taskPayload?.id === 'string' ? taskPayload.id : null
    const executionId = typeof body.executionId === 'string' ? body.executionId : null

    if (!prompt && !objective) {
      return new Response(
        JSON.stringify({ error: "prompt or objective is required" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      )
    }

    if (executionPath === 'mock_integration') {
      const started = performance.now()
      const parsed = buildStructuredResult(
        `Mock integration executed for: ${objective || prompt}`,
        'Mock adapter completed deterministically without external side effects.',
        ['Validated task input.', 'Generated deterministic mock adapter output.'],
        ['Task prompt/objective', 'Execution path: mock_integration'],
        [],
        0.9,
        'Use this output for controlled adapter testing only.',
      )
      await recordAdapterRun(supabase, {
        userId: user.id,
        taskId,
        executionId,
        executionPath,
        provider: 'mock_integration',
        status: 'success',
        statusCode: 200,
        latencyMs: Math.round(performance.now() - started),
      })
      return new Response(
        JSON.stringify(adapterResponse(parsed, 'adapter:mock_integration')),
        { headers: { ...corsHeaders, "Content-Type": "application/json" } }
      )
    }

    if (executionPath === 'manual_step') {
      const started = performance.now()
      const parsed = buildStructuredResult(
        `Manual execution required for: ${objective || prompt}`,
        'Manual step captured as an execution artifact for human follow-up.',
        ['Created manual execution artifact.', 'Awaiting human review and approval.'],
        ['Task prompt/objective', 'Execution path: manual_step'],
        ['A human operator must complete the described work outside the automated adapter.'],
        0.6,
        'Approve only after the manual work has been completed or delegated.',
      )
      await recordAdapterRun(supabase, {
        userId: user.id,
        taskId,
        executionId,
        executionPath,
        provider: 'manual_step',
        status: 'success',
        statusCode: 200,
        latencyMs: Math.round(performance.now() - started),
      })
      return new Response(
        JSON.stringify(adapterResponse(parsed, 'adapter:manual_step')),
        { headers: { ...corsHeaders, "Content-Type": "application/json" } }
      )
    }

    if (executionPath !== 'api_gateway') {
      const adapter = await runWebhookAdapter(supabase, user.id, executionPath, body)
      if ('error' in adapter) {
        await recordAdapterRun(supabase, {
          userId: user.id,
          taskId,
          executionId,
          integrationId: 'integration' in adapter && adapter.integration?.id ? adapter.integration.id : null,
          executionPath,
          provider: 'provider' in adapter ? adapter.provider : executionPath,
          endpoint: 'integration' in adapter ? adapter.integration?.endpoint : null,
          status: 'failed',
          statusCode: adapter.status,
          latencyMs: 'latencyMs' in adapter ? adapter.latencyMs : null,
          errorMessage: adapter.error,
        })
        return new Response(
          JSON.stringify({ error: adapter.error }),
          { status: adapter.status, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        )
      }
      await recordAdapterRun(supabase, {
        userId: user.id,
        taskId,
        executionId,
        integrationId: adapter.integration?.id ?? null,
        executionPath,
        provider: adapter.provider,
        endpoint: adapter.integration?.endpoint ?? null,
        status: 'success',
        statusCode: adapter.statusCode ?? 200,
        latencyMs: adapter.latencyMs ?? null,
      })
      return new Response(
        JSON.stringify(adapter.result),
        { headers: { ...corsHeaders, "Content-Type": "application/json" } }
      )
    }

    const openrouterApiKey = Deno.env.get("OPENROUTER_API_KEY")
    if (!openrouterApiKey) {
      await recordAdapterRun(supabase, {
        userId: user.id,
        taskId,
        executionId,
        executionPath,
        provider: 'api_gateway',
        status: 'failed',
        statusCode: 500,
        errorMessage: 'API key not configured',
      })
      return new Response(
        JSON.stringify({ error: "API key not configured" }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      )
    }

    // Build structured prompt
    const messages = buildStructuredPrompt(
      objective || '',
      prompt || objective || '',
      upstreamContext || null,
      language,
    )

    // Call OpenRouter
    const apiStarted = performance.now()
    const response = await fetch("https://openrouter.ai/api/v1/chat/completions", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${openrouterApiKey}`,
        "Content-Type": "application/json",
        "HTTP-Referer": Deno.env.get("APP_BASE_URL") ?? "http://localhost:5173",
        "X-Title": "Redrise Task Execution",
      },
      body: JSON.stringify({
        model,
        messages,
        temperature: 0.3,
      }),
    })

    if (!response.ok) {
      const errorData = await response.text()
      console.error("[task-execute] OpenRouter error:", response.status, errorData)
      await recordAdapterRun(supabase, {
        userId: user.id,
        taskId,
        executionId,
        executionPath,
        provider: 'api_gateway',
        status: 'failed',
        statusCode: response.status,
        latencyMs: Math.round(performance.now() - apiStarted),
        errorMessage: `OpenRouter API error: ${response.status}`,
      })
      return new Response(
        JSON.stringify({ error: `OpenRouter API error: ${response.status}` }),
        { status: response.status, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      )
    }

    const data = await response.json()
    const rawOutput = data.choices?.[0]?.message?.content || ''
    const tokens = data.usage?.total_tokens || 0

    // Parse structured output
    const { parsed, error: parseError } = parseStructuredOutput(rawOutput)

    console.log("[task-execute] User:", user.id, "Model:", model, "Tokens:", tokens, "Parse:", parseError ? "error" : "ok")
    await recordAdapterRun(supabase, {
      userId: user.id,
      taskId,
      executionId,
      executionPath,
      provider: 'api_gateway',
      status: 'success',
      statusCode: response.status,
      latencyMs: Math.round(performance.now() - apiStarted),
    })

    return new Response(
      JSON.stringify({
        raw_output: rawOutput,
        parsed_output: parsed,
        parse_error: parseError,
        tokens_used: tokens,
        model,
      }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    )
  } catch (error) {
    console.error("[task-execute] Error:", error)
    return new Response(
      JSON.stringify({ error: "Internal server error" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    )
  }
})
