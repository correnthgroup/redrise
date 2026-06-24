import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase'
import { loadTeamMembers, type TeamMember } from '@/lib/team-members'

export function useTeamMemberOptions() {
  const [members, setMembers] = useState<TeamMember[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    let cancelled = false

    async function load() {
      setLoading(true)
      const { data: { user } } = await supabase.auth.getUser()
      const allMembers = user ? await loadTeamMembers(user.id) : []
      const activeMembers = allMembers.filter((m) => m.status !== 'Invited')
      if (!cancelled) {
        setMembers(activeMembers)
        setLoading(false)
      }
    }

    void Promise.resolve().then(load)
    return () => { cancelled = true }
  }, [])

  return { members, loading }
}
