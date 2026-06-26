import { useState, useCallback, useEffect, useRef } from 'react'
import type { Agent, CreateAgentInput } from '@/types/agent'
import {
  loadAgents,
  createAgent as persistCreate,
  deleteAgent as persistDelete,
  updateAgent as persistUpdate,
} from '@/lib/agents'

export function useAgents(ownerUserId?: string, canUseAgents = true) {
  const [agents, setAgents] = useState<Agent[]>([])
  const [loading, setLoading] = useState(true)
  const mountedRef = useRef(true)

  useEffect(() => {
    mountedRef.current = true
    return () => { mountedRef.current = false }
  }, [])

  useEffect(() => {
    let cancelled = false
    void (async () => {
      if (!canUseAgents) {
        if (!cancelled && mountedRef.current) {
          setAgents([])
          setLoading(false)
        }
        return
      }

      setLoading(true)
      const data = await loadAgents(ownerUserId)
      if (!cancelled && mountedRef.current) {
        setAgents(data)
        setLoading(false)
      }
    })()
    return () => { cancelled = true }
  }, [ownerUserId, canUseAgents])

  const addAgent = useCallback(
    async (input: CreateAgentInput): Promise<Agent | null> => {
      const agent = await persistCreate({ ...input, ownerUserId: input.ownerUserId ?? ownerUserId })
      if (agent && mountedRef.current) {
        setAgents((prev) => [agent, ...prev])
      }
      return agent
    },
    [ownerUserId],
  )

  const removeAgent = useCallback(async (id: string): Promise<boolean> => {
    const removed = await persistDelete(id)
    if (removed && mountedRef.current) {
      setAgents((prev) => prev.filter((a) => a.id !== id))
    }
    return removed
  }, [])

  const updateAgent = useCallback(
    async (id: string, updates: Partial<Pick<Agent, 'name' | 'brief' | 'status' | 'model' | 'provider_connection_status'>>): Promise<Agent | null> => {
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
    const data = canUseAgents ? await loadAgents(ownerUserId) : []
    if (mountedRef.current) {
      setAgents(data)
      setLoading(false)
    }
  }, [ownerUserId, canUseAgents])

  return {
    agents,
    loading,
    addAgent,
    removeAgent,
    updateAgent,
    refresh,
  }
}
