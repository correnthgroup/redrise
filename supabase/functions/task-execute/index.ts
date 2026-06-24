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

    const openrouterApiKey = Deno.env.get("OPENROUTER_API_KEY")
    if (!openrouterApiKey) {
      return new Response(
        JSON.stringify({ error: "API key not configured" }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      )
    }

    const { objective, prompt, upstreamContext, model = "openai/gpt-oss-120b:free", language = "en-US" } = await req.json()

    if (!prompt && !objective) {
      return new Response(
        JSON.stringify({ error: "prompt or objective is required" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
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
