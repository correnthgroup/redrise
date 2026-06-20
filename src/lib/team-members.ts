import { supabase } from './supabase'

export type TeamMemberRole = 'owner' | 'admin' | 'member' | 'viewer'

export type TeamMember = {
  id: string
  ownerUserId: string
  memberUserId: string | null
  inviteEmail: string
  name: string
  email: string
  avatarUrl: string | null
  role: TeamMemberRole
  function: string
  team: string
  status: 'Online' | 'Offline' | 'Invited'
  joined: string
}

export type AccessRole = 'admin' | 'member' | 'viewer'

type TeamMemberRow = {
  id: string
  owner_user_id: string
  member_user_id: string | null
  invite_email: string
  role: TeamMemberRole
  function: string
  team: string
  status: 'active' | 'invited'
  joined_at: string
}

type ProfileRow = {
  id: string
  first_name: string
  last_name: string
  username: string
  email: string
  avatar_url: string | null
  last_seen_at: string | null
}

function isOnline(lastSeenAt: string | null) {
  if (!lastSeenAt) return false
  return Date.now() - new Date(lastSeenAt).getTime() < 2 * 60 * 1000
}

function displayName(profile?: ProfileRow) {
  if (!profile) return ''
  const fullName = `${profile.first_name} ${profile.last_name}`.trim()
  return profile.username || fullName || profile.email
}

export async function loadTeamMembers(ownerUserId: string): Promise<TeamMember[]> {
  const { data: members, error } = await supabase
    .from('team_members')
    .select('*')
    .eq('owner_user_id', ownerUserId)
    .order('joined_at', { ascending: false })

  if (error) return []

  const memberUserIds = (members ?? []).map((member) => member.member_user_id).filter(Boolean) as string[]
  const { data: profiles } = memberUserIds.length > 0
    ? await supabase.from('profiles').select('id, first_name, last_name, username, email, avatar_url, last_seen_at').in('id', memberUserIds)
    : { data: [] }

  const profilesById = new Map((profiles as ProfileRow[]).map((profile) => [profile.id, profile]))

  return ((members ?? []) as TeamMemberRow[]).map((member) => {
    const profile = member.member_user_id ? profilesById.get(member.member_user_id) : undefined
    const email = profile?.email || member.invite_email
    return {
      id: member.id,
      ownerUserId: member.owner_user_id,
      memberUserId: member.member_user_id,
      inviteEmail: member.invite_email,
      name: displayName(profile) || email,
      email,
      avatarUrl: profile?.avatar_url ?? null,
      role: member.role,
      function: member.function,
      team: member.team,
      status: member.status === 'invited' ? 'Invited' : isOnline(profile?.last_seen_at ?? null) ? 'Online' : 'Offline',
      joined: new Intl.DateTimeFormat().format(new Date(member.joined_at)),
    }
  })
}

export async function addTeamMember(
  ownerUserId: string,
  email: string,
  role: TeamMemberRole,
  memberFunction?: string,
) {
  const cleanEmail = email.trim().toLowerCase()
  if (!cleanEmail) return null

  const { data, error } = await supabase.functions.invoke('invite-member', {
    body: { email: cleanEmail, role },
  })

  if (error) return null

  if (memberFunction) {
    await supabase
      .from('team_members')
      .update({ function: memberFunction })
      .eq('owner_user_id', ownerUserId)
      .eq('invite_email', cleanEmail)
  }

  return data as { ok: true; emailSent?: boolean; emailError?: string | null; existingAccount?: boolean }
}

export async function loadCurrentAccessRole(userId: string): Promise<AccessRole> {
  const { data } = await supabase
    .from('team_members')
    .select('role, owner_user_id, member_user_id')
    .or(`owner_user_id.eq.${userId},member_user_id.eq.${userId}`)
    .order('joined_at', { ascending: true })

  const ownerRow = data?.find((member) => member.owner_user_id === userId)
  const role = ownerRow?.role ?? data?.[0]?.role

  if (role === 'viewer') return 'viewer'
  if (role === 'member') return 'member'
  return 'admin'
}

export async function updateTeamMember(member: Pick<TeamMember, 'id' | 'function' | 'team' | 'role'>) {
  const { error } = await supabase
    .from('team_members')
    .update({ function: member.function, team: member.team, role: member.role })
    .eq('id', member.id)

  return !error
}

export async function checkEmailExists(email: string): Promise<boolean> {
  const cleanEmail = email.trim().toLowerCase()
  if (!cleanEmail) return false

  const { data } = await supabase
    .from('profiles')
    .select('id')
    .eq('email', cleanEmail)
    .limit(1)

  return (data ?? []).length > 0
}
