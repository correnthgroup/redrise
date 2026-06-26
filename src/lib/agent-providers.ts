import { supabase } from './supabase'

export type AgentProviderId = 'openai' | 'anthropic' | 'google' | 'openrouter'
export type AgentProviderAuthMethod = 'api' | 'chatgpt_browser' | 'chatgpt_headless'

export async function testAgentProviderConnection(input: { provider: AgentProviderId; authMethod: AgentProviderAuthMethod; apiKey?: string }) {
  const { data, error } = await supabase.functions.invoke('agent-provider-test', { body: input })
  if (error) throw error
  return data as { ok: boolean; message: string }
}
