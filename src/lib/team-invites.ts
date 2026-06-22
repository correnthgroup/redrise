import { supabase } from './supabase'

export type TeamInviteNotification = {
  id: string
  ownerUserId: string
  teamMemberId: string
  ownerName: string
  role: string
  function: string
  team: string
  createdAt: string
}

type InviteRow = {
  id: string
  owner_user_id: string
  team_member_id: string
  created_at: string
  team_members: { role: string; function: string; team: string }[] | { role: string; function: string; team: string } | null
}

type ProfileRow = {
  id: string
  first_name: string
  last_name: string
  username: string
  email: string
}

function singleRelation<T>(value: T[] | T | null | undefined): T | null {
  return Array.isArray(value) ? value[0] ?? null : value ?? null
}

function profileName(profile?: ProfileRow) {
  if (!profile) return 'Redrise'
  return profile.username || `${profile.first_name} ${profile.last_name}`.trim() || profile.email
}

export async function loadPendingTeamInvites(userId: string): Promise<TeamInviteNotification[]> {
  const { data, error } = await supabase
    .from('team_invite_notifications')
    .select('id, owner_user_id, team_member_id, created_at, team_members(role, function, team)')
    .eq('recipient_user_id', userId)
    .eq('status', 'pending')
    .order('created_at', { ascending: true })

  if (error) return []

  const rows = (data ?? []) as unknown as InviteRow[]
  const ownerIds = [...new Set(rows.map((row) => row.owner_user_id))]
  const { data: profiles } = ownerIds.length > 0
    ? await supabase.from('profiles').select('id, first_name, last_name, username, email').in('id', ownerIds)
    : { data: [] }
  const profilesById = new Map((profiles as ProfileRow[]).map((profile) => [profile.id, profile]))

  return rows.map((row) => {
    const member = singleRelation(row.team_members)
    return {
      id: row.id,
      ownerUserId: row.owner_user_id,
      teamMemberId: row.team_member_id,
      ownerName: profileName(profilesById.get(row.owner_user_id)),
      role: member?.role ?? 'member',
      function: member?.function ?? 'Member',
      team: member?.team ?? '',
      createdAt: row.created_at,
    }
  })
}

export async function respondToTeamInvite(invite: TeamInviteNotification, response: 'accepted' | 'declined') {
  const { data, error } = await supabase.rpc('respond_to_team_invite', {
    notification_id: invite.id,
    invite_response: response,
  })

  return !error && data === true
}
