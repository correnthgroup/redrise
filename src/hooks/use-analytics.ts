import { useState, useEffect } from 'react'
import { supabase } from '@/lib/supabase'

export type AnalyticsData = {
  workspaceCount: number
  flowCount: number
  taskCount: number
  agentCount: number
  executionCount: number
  completedExecutions: number
  failedExecutions: number
  rejectedExecutions: number
  approvalRate: number
  errorRate: number
  recentExecutions: {
    id: string
    task_id: string
    agent_id: string | null
    status: string
    model: string
    tokens_used: number | null
    created_at: string
  }[]
  agentBreakdown: {
    agentId: string
    agentName: string
    model: string
    requests: number
    errors: number
    avgTokens: number
  }[]
  executionsByDay: { date: string; count: number }[]
  loading: boolean
}

export function useAnalytics() {
  const [data, setData] = useState<AnalyticsData>({
    workspaceCount: 0,
    flowCount: 0,
    taskCount: 0,
    agentCount: 0,
    executionCount: 0,
    completedExecutions: 0,
    failedExecutions: 0,
    rejectedExecutions: 0,
    approvalRate: 0,
    errorRate: 0,
    recentExecutions: [],
    agentBreakdown: [],
    executionsByDay: [],
    loading: true,
  })

  useEffect(() => {
    async function fetchAnalytics() {
      try {
        const { data: { user } } = await supabase.auth.getUser()
        if (!user) return

        // Fetch counts in parallel
        const [
          workspacesRes,
          flowsRes,
          tasksRes,
          agentsRes,
          executionsRes,
        ] = await Promise.all([
          supabase.from('workspaces').select('id', { count: 'exact', head: true }),
          supabase.from('flows').select('id', { count: 'exact', head: true }),
          supabase.from('tasks').select('id', { count: 'exact', head: true }),
          supabase.from('agents').select('id', { count: 'exact', head: true }),
          supabase.from('task_executions').select('*').order('created_at', { ascending: false }).limit(100),
        ])

        const executions = executionsRes.data ?? []
        const completed = executions.filter((e) => e.status === 'completed').length
        const failed = executions.filter((e) => e.status === 'failed').length
        const rejected = executions.filter((e) => e.status === 'rejected').length
        const total = executions.length

        // Agent breakdown
        const agentMap = new Map<string, { name: string; model: string; requests: number; errors: number; totalTokens: number }>()
        for (const exec of executions) {
          const key = exec.agent_id || 'unknown'
          const existing = agentMap.get(key)
          if (existing) {
            existing.requests++
            if (exec.status === 'failed') existing.errors++
            existing.totalTokens += exec.tokens_used || 0
          } else {
            agentMap.set(key, {
              name: exec.agent_id || 'Unassigned',
              model: exec.model || 'unknown',
              requests: 1,
              errors: exec.status === 'failed' ? 1 : 0,
              totalTokens: exec.tokens_used || 0,
            })
          }
        }

        const agentBreakdown = Array.from(agentMap.entries()).map(([agentId, data]) => ({
          agentId,
          agentName: data.name,
          model: data.model,
          requests: data.requests,
          errors: data.errors,
          avgTokens: data.requests > 0 ? Math.round(data.totalTokens / data.requests) : 0,
        }))

        // Executions by day (last 7 days)
        const now = new Date()
        const daysMap = new Map<string, number>()
        for (let i = 6; i >= 0; i--) {
          const d = new Date(now)
          d.setDate(d.getDate() - i)
          const key = d.toISOString().split('T')[0]
          daysMap.set(key, 0)
        }
        for (const exec of executions) {
          const day = exec.created_at.split('T')[0]
          if (daysMap.has(day)) {
            daysMap.set(day, (daysMap.get(day) || 0) + 1)
          }
        }
        const executionsByDay = Array.from(daysMap.entries()).map(([date, count]) => ({ date, count }))

        setData({
          workspaceCount: workspacesRes.count ?? 0,
          flowCount: flowsRes.count ?? 0,
          taskCount: tasksRes.count ?? 0,
          agentCount: agentsRes.count ?? 0,
          executionCount: total,
          completedExecutions: completed,
          failedExecutions: failed,
          rejectedExecutions: rejected,
          approvalRate: total > 0 ? Math.round(((completed + rejected) / total) * 100) : 0,
          errorRate: total > 0 ? Math.round((failed / total) * 100 * 10) / 10 : 0,
          recentExecutions: executions.slice(0, 10),
          agentBreakdown,
          executionsByDay,
          loading: false,
        })
      } catch {
        setData((prev) => ({ ...prev, loading: false }))
      }
    }

    fetchAnalytics()
  }, [])

  return data
}
