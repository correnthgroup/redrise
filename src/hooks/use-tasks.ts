import { useState, useCallback, useEffect, useRef } from 'react'
import type { Task, CreateTaskInput, TaskStatus } from '@/types/task'
import {
  loadTasks,
  createTask as persistCreate,
  updateTaskStatus as persistUpdateStatus,
  deleteTask as persistDelete,
} from '@/lib/tasks'

export function useTasks() {
  const [tasks, setTasks] = useState<Task[]>([])
  const [loading, setLoading] = useState(true)
  const mountedRef = useRef(true)

  useEffect(() => {
    let cancelled = false
    loadTasks().then((data) => {
      if (!cancelled && mountedRef.current) {
        setTasks(data)
        setLoading(false)
      }
    })
    return () => { cancelled = true }
  }, [])

  const addTask = useCallback(
    async (input: CreateTaskInput): Promise<Task | null> => {
      const task = await persistCreate(input)
      if (task && mountedRef.current) {
        setTasks((prev) => [task, ...prev])
      }
      return task
    },
    [],
  )

  const moveTask = useCallback(
    async (id: string, status: TaskStatus): Promise<boolean> => {
      const ok = await persistUpdateStatus(id, status)
      if (ok && mountedRef.current) {
        setTasks((prev) => prev.map((t) => (t.id === id ? { ...t, status } : t)))
      }
      return ok
    },
    [],
  )

  const removeTask = useCallback(async (id: string): Promise<boolean> => {
    const removed = await persistDelete(id)
    if (removed && mountedRef.current) {
      setTasks((prev) => prev.filter((t) => t.id !== id))
    }
    return removed
  }, [])

  return {
    tasks,
    loading,
    addTask,
    moveTask,
    removeTask,
  }
}
