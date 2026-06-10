import { useState, useCallback, useEffect, useRef } from 'react'
import type { Agent, CreateAgentInput } from '@/types/agent'
import {
  loadAgents,
  createAgent as persistCreate,
  deleteAgent as persistDelete,
  updateAgent as persistUpdate,
} from '@/lib/agents'

const DEFAULT_AGENT: CreateAgentInput = {
  name: 'Default Agent',
  brief: 'General purpose AI assistant with OpenRouter integration.',
  model: 'openai/gpt-oss-120b:free',
  provider: 'openrouter',
}

export function useAgents() {
  const [agents, setAgents] = useState<Agent[]>([])
  const [loading, setLoading] = useState(true)
  const mountedRef = useRef(true)

  useEffect(() => {
    let cancelled = false
    loadAgents().then(async (data) => {
      if (!cancelled && mountedRef.current) {
        // Create default agent if user has no agents
        if (data.length === 0) {
          const defaultAgent = await persistCreate(DEFAULT_AGENT)
          if (defaultAgent && mountedRef.current && !cancelled) {
            setAgents([defaultAgent])
          }
        } else {
          setAgents(data)
        }
        setLoading(false)
      }
    })
    return () => { cancelled = true }
  }, [])

  const addAgent = useCallback(
    async (input: CreateAgentInput): Promise<Agent | null> => {
      const agent = await persistCreate(input)
      if (agent && mountedRef.current) {
        setAgents((prev) => [agent, ...prev])
      }
      return agent
    },
    [],
  )

  const removeAgent = useCallback(async (id: string): Promise<boolean> => {
    const removed = await persistDelete(id)
    if (removed && mountedRef.current) {
      setAgents((prev) => prev.filter((a) => a.id !== id))
    }
    return removed
  }, [])

  const updateAgent = useCallback(
    async (id: string, updates: Partial<Pick<Agent, 'name' | 'brief' | 'status' | 'model'>>): Promise<Agent | null> => {
      const updated = await persistUpdate(id, updates)
      if (updated && mountedRef.current) {
        setAgents((prev) => prev.map((a) => (a.id === id ? updated : a)))
      }
      return updated
    },
    [],
  )

  const refresh = useCallback(async () => {
    setLoading(true)
    const data = await loadAgents()
    if (mountedRef.current) {
      setAgents(data)
      setLoading(false)
    }
  }, [])

  return {
    agents,
    loading,
    addAgent,
    removeAgent,
    updateAgent,
    refresh,
  }
}
