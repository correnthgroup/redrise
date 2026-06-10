import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from "https://esm.sh/@supabase/supabase-js@2"

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
}

serve(async (req) => {
  // Handle CORS preflight
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders })
  }

  try {
    // Verify JWT and get user
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

    // Get OpenRouter API key from secrets
    const openrouterApiKey = Deno.env.get("OPENROUTER_API_KEY")
    if (!openrouterApiKey) {
      console.error("[openrouter-proxy] OPENROUTER_API_KEY not configured")
      return new Response(
        JSON.stringify({ error: "API key not configured" }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      )
    }

    // Parse request body
    const { messages, model = "openai/gpt-oss-120b:free", ...params } = await req.json()

    if (!messages || !Array.isArray(messages)) {
      return new Response(
        JSON.stringify({ error: "messages array is required" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      )
    }

    // Call OpenRouter API
    const response = await fetch("https://openrouter.ai/api/v1/chat/completions", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${openrouterApiKey}`,
        "Content-Type": "application/json",
        "HTTP-Referer": "https://redrise.app",
        "X-Title": "Redrise AI Agent",
      },
      body: JSON.stringify({
        model,
        messages,
        ...params,
      }),
    })

    if (!response.ok) {
      const errorData = await response.text()
      console.error("[openrouter-proxy] OpenRouter error:", response.status, errorData)
      return new Response(
        JSON.stringify({ error: `OpenRouter API error: ${response.status}` }),
        { status: response.status, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      )
    }

    const data = await response.json()

    // Log usage for monitoring (without exposing sensitive data)
    console.log("[openrouter-proxy] User:", user.id, "Model:", model, "Tokens:", data.usage?.total_tokens ?? "unknown")

    return new Response(
      JSON.stringify(data),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    )
  } catch (error) {
    console.error("[openrouter-proxy] Error:", error)
    return new Response(
      JSON.stringify({ error: "Internal server error" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    )
  }
})
