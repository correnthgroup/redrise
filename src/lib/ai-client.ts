import { supabase } from './supabase'

export type ChatMessage = {
  role: 'system' | 'user' | 'assistant'
  content: string
}

export type ChatCompletionResponse = {
  id: string
  choices: {
    index: number
    message: {
      role: string
      content: string
    }
    finish_reason: string
  }[]
  usage?: {
    prompt_tokens: number
    completion_tokens: number
    total_tokens: number
  }
  model?: string
}

export async function chatCompletion(
  messages: ChatMessage[],
  model?: string,
): Promise<ChatCompletionResponse> {
  const { data: { session } } = await supabase.auth.getSession()

  if (!session) {
    throw new Error('Not authenticated')
  }

  const response = await fetch(
    `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/openrouter-proxy`,
    {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${session.access_token}`,
        'apikey': import.meta.env.VITE_SUPABASE_ANON_KEY,
      },
      body: JSON.stringify({
        messages,
        model: model ?? 'openai/gpt-oss-120b:free',
      }),
    },
  )

  if (!response.ok) {
    const error = await response.json().catch(() => ({ error: 'Unknown error' }))
    throw new Error(error.error || `API error: ${response.status}`)
  }

  return response.json()
}

export type TaskExecuteResult = {
  raw_output: string
  parsed_output: Record<string, unknown> | null
  parse_error: string | null
  tokens_used: number
  model: string
}

export async function taskExecute(
  objective: string,
  prompt: string,
  upstreamContext: string | null,
  model?: string,
  language?: string,
): Promise<TaskExecuteResult> {
  const { data: { session } } = await supabase.auth.getSession()

  if (!session) {
    throw new Error('Not authenticated')
  }

  const response = await fetch(
    `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/task-execute`,
    {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${session.access_token}`,
        'apikey': import.meta.env.VITE_SUPABASE_ANON_KEY,
      },
      body: JSON.stringify({
        objective,
        prompt,
        upstreamContext,
        model: model ?? 'openai/gpt-oss-120b:free',
        language: language ?? 'en-US',
      }),
    },
  )

  if (!response.ok) {
    const error = await response.json().catch(() => ({ error: 'Unknown error' }))
    throw new Error(error.error || `API error: ${response.status}`)
  }

  return response.json()
}
