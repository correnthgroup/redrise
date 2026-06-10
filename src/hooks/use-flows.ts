import { useState, useCallback, useEffect, useRef } from 'react'
import type { Flow, CreateFlowInput } from '@/types/flow'
import {
  loadFlows,
  createFlow as persistCreate,
  deleteFlow as persistDelete,
} from '@/lib/flows'

export function useFlows() {
  const [flows, setFlows] = useState<Flow[]>([])
  const [loading, setLoading] = useState(true)
  const mountedRef = useRef(true)

  useEffect(() => {
    let cancelled = false
    loadFlows().then((data) => {
      if (!cancelled && mountedRef.current) {
        setFlows(data)
        setLoading(false)
      }
    })
    return () => { cancelled = true }
  }, [])

  const addFlow = useCallback(
    async (input: CreateFlowInput): Promise<Flow | null> => {
      const flow = await persistCreate(input)
      if (flow && mountedRef.current) {
        setFlows((prev) => [flow, ...prev])
      }
      return flow
    },
    [],
  )

  const removeFlow = useCallback(async (id: string, workspaceId: string): Promise<boolean> => {
    const removed = await persistDelete(id, workspaceId)
    if (removed && mountedRef.current) {
      setFlows((prev) => prev.filter((f) => f.id !== id))
    }
    return removed
  }, [])

  const refresh = useCallback(async () => {
    setLoading(true)
    const data = await loadFlows()
    if (mountedRef.current) {
      setFlows(data)
      setLoading(false)
    }
  }, [])

  return {
    flows,
    loading,
    addFlow,
    removeFlow,
    refresh,
  }
}
