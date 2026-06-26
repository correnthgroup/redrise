import { useState, useCallback, useEffect, useRef } from 'react'
import type { Flow, CreateFlowInput } from '@/types/flow'
import {
  loadFlows,
  createFlow as persistCreate,
  updateFlow as persistUpdate,
  deleteFlow as persistDelete,
  requestFlowApproval as persistRequestApproval,
  approveFlow as persistApprove,
  requestFlowAdjustments as persistRequestAdjustments,
  markFlowExternalLlm as persistMarkExternalLlm,
  markFlowRedriseSupport as persistMarkRedriseSupport,
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

  const updateFlow = useCallback(async (id: string, updates: Partial<Pick<Flow, 'name' | 'members'>>): Promise<Flow | null> => {
    const updated = await persistUpdate(id, updates)
    if (updated && mountedRef.current) {
      setFlows((prev) => prev.map((flow) => (flow.id === id ? updated : flow)))
    }
    return updated
  }, [])

  const requestApproval = useCallback(async (id: string): Promise<Flow | null> => {
    const updated = await persistRequestApproval(id)
    if (updated && mountedRef.current) {
      setFlows((prev) => prev.map((flow) => (flow.id === id ? updated : flow)))
    }
    return updated
  }, [])

  const approve = useCallback(async (id: string): Promise<Flow | null> => {
    const updated = await persistApprove(id)
    if (updated && mountedRef.current) {
      setFlows((prev) => prev.map((flow) => (flow.id === id ? updated : flow)))
    }
    return updated
  }, [])

  const requestAdjustments = useCallback(async (id: string): Promise<Flow | null> => {
    const updated = await persistRequestAdjustments(id)
    if (updated && mountedRef.current) {
      setFlows((prev) => prev.map((flow) => (flow.id === id ? updated : flow)))
    }
    return updated
  }, [])

  const markExternalLlm = useCallback(async (id: string, sourceLabel: string): Promise<Flow | null> => {
    const updated = await persistMarkExternalLlm(id, sourceLabel)
    if (updated && mountedRef.current) {
      setFlows((prev) => prev.map((flow) => (flow.id === id ? updated : flow)))
    }
    return updated
  }, [])

  const markRedriseSupport = useCallback(async (id: string): Promise<Flow | null> => {
    const updated = await persistMarkRedriseSupport(id)
    if (updated && mountedRef.current) {
      setFlows((prev) => prev.map((flow) => (flow.id === id ? updated : flow)))
    }
    return updated
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
    updateFlow,
    requestApproval,
    approve,
    requestAdjustments,
    markExternalLlm,
    markRedriseSupport,
    removeFlow,
    refresh,
  }
}
