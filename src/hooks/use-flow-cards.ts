import { useState, useCallback } from 'react'
import type { FlowCard, FlowEdge } from '@/types/flow-card'
import {
  loadFlowCards,
  loadFlowEdges,
  syncFlowEditor,
} from '@/lib/flow-cards'

export function useFlowCards(flowId: string | null) {
  const [cards, setCards] = useState<FlowCard[]>([])
  const [edges, setEdges] = useState<FlowEdge[]>([])
  const [loading, setLoading] = useState(false)

  const load = useCallback(async () => {
    if (!flowId) {
      setCards([])
      setEdges([])
      return
    }
    setLoading(true)
    const [loadedCards, loadedEdges] = await Promise.all([
      loadFlowCards(flowId),
      loadFlowEdges(flowId),
    ])
    setCards(loadedCards)
    setEdges(loadedEdges)
    setLoading(false)
  }, [flowId])

  const save = useCallback(
    async (
      nodeData: { node_id: string; label: string; instructions?: string; members?: string[]; agents?: string[]; position_x: number; position_y: number }[],
      edgeData: { edge_id: string; source: string; target: string; animated?: boolean }[]
    ): Promise<boolean> => {
      if (!flowId) return false
      const ok = await syncFlowEditor(flowId, nodeData, edgeData)
      if (ok) {
        // Reload to get fresh IDs
        await load()
      }
      return ok
    },
    [flowId, load]
  )

  return {
    cards,
    edges,
    loading,
    load,
    save,
  }
}
