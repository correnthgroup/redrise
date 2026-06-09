import { useState, useCallback, useEffect, useRef } from 'react'
import type { Workspace, CreateWorkspaceInput } from '@/types/workspace'
import {
  loadWorkspaces,
  createWorkspace as persistCreate,
  deleteWorkspace as persistDelete,
} from '@/lib/workspaces'

export function useWorkspaces() {
  const [workspaces, setWorkspaces] = useState<Workspace[]>([])
  const [loading, setLoading] = useState(true)
  const mountedRef = useRef(true)

  useEffect(() => {
    let cancelled = false
    loadWorkspaces().then((data) => {
      if (!cancelled && mountedRef.current) {
        setWorkspaces(data)
        setLoading(false)
      }
    })
    return () => { cancelled = true }
  }, [])

  const addWorkspace = useCallback(
    async (input: CreateWorkspaceInput): Promise<Workspace | null> => {
      const workspace = await persistCreate(input)
      if (workspace && mountedRef.current) {
        setWorkspaces((prev) => [workspace, ...prev])
      }
      return workspace
    },
    [],
  )

  const removeWorkspace = useCallback(async (id: string): Promise<boolean> => {
    const removed = await persistDelete(id)
    if (removed && mountedRef.current) {
      setWorkspaces((prev) => prev.filter((w) => w.id !== id))
    }
    return removed
  }, [])

  const getWorkspace = useCallback(
    (id: string): Workspace | undefined => workspaces.find((w) => w.id === id),
    [workspaces],
  )

  const refresh = useCallback(async () => {
    setLoading(true)
    const data = await loadWorkspaces()
    if (mountedRef.current) {
      setWorkspaces(data)
      setLoading(false)
    }
  }, [])

  return {
    workspaces,
    loading,
    addWorkspace,
    removeWorkspace,
    getWorkspace,
    refresh,
  }
}
