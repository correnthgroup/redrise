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

export type SettingsAdminContext = {
  isAdmin: boolean
  isTeamManager: boolean
  ownerUserId: string
  function: string
}

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

type TeamAssignmentTeamRow = {
  team_member_id: string
  teams: { name: string }[] | { name: string } | null
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
  const memberIds = ((members ?? []) as TeamMemberRow[]).map((member) => member.id)
  const { data: assignments } = memberIds.length > 0
    ? await supabase.from('team_assignments').select('team_member_id, teams(name)').in('team_member_id', memberIds)
    : { data: [] }
  const teamsByMemberId = new Map<string, string[]>()
  ;((assignments ?? []) as unknown as TeamAssignmentTeamRow[]).forEach((assignment) => {
    const names = Array.isArray(assignment.teams)
      ? assignment.teams.map((team) => team.name).filter(Boolean)
      : assignment.teams?.name ? [assignment.teams.name] : []
    teamsByMemberId.set(assignment.team_member_id, [...(teamsByMemberId.get(assignment.team_member_id) ?? []), ...names])
  })

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
      team: teamsByMemberId.get(member.id)?.join(', ') || member.team,
      status: member.status === 'invited' ? 'Invited' : isOnline(profile?.last_seen_at ?? null) ? 'Online' : 'Offline',
      joined: new Intl.DateTimeFormat().format(new Date(member.joined_at)),
    }
  })
}

export async function addTeamMember(
  _ownerUserId: string,
  email: string,
  role: TeamMemberRole,
  memberFunction?: string,
  team?: string,
  teamId?: string,
) {
  const cleanEmail = email.trim().toLowerCase()
  if (!cleanEmail) return null

  const { data, error } = await supabase.functions.invoke('invite-member', {
    body: { email: cleanEmail, role, memberFunction, team, teamId, ownerUserId: _ownerUserId },
  })

  if (error) return null

  return data as { ok: true; teamMemberId?: string; assignmentCreated?: boolean; notificationCreated?: boolean; emailSent?: boolean; emailError?: string | null; inviteLink?: string | null; existingAccount?: boolean }
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

export async function loadSettingsAdminContext(userId: string): Promise<SettingsAdminContext> {
  const { data } = await supabase
    .from('team_members')
    .select('owner_user_id, member_user_id, function, status, joined_at')
    .or(`owner_user_id.eq.${userId},member_user_id.eq.${userId}`)
    .eq('status', 'active')
    .order('joined_at', { ascending: true })

  const rows = data ?? []
  const adminRow = rows.find((row) => row.member_user_id === userId && row.function === 'Admin')
  const managerRow = adminRow ?? rows.find((row) => row.member_user_id === userId && ['Owner', 'Board'].includes(row.function))
  return {
    isAdmin: !!adminRow,
    isTeamManager: !!managerRow,
    ownerUserId: managerRow?.owner_user_id ?? userId,
    function: managerRow?.function ?? '',
  }
}

export async function loadCurrentTeamAssignment(userId: string): Promise<{ function: string; team: string } | null> {
  const { data } = await supabase
    .from('team_members')
    .select('function, team, owner_user_id, member_user_id')
    .or(`owner_user_id.eq.${userId},member_user_id.eq.${userId}`)
    .order('joined_at', { ascending: true })

  const ownerRow = data?.find((member) => member.owner_user_id === userId)
  const row = ownerRow ?? data?.[0]
  if (!row) return null
  return { function: row.function ?? '', team: row.team ?? '' }
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

  const { data, error } = await supabase.functions.invoke('invite-member', {
    body: { email: cleanEmail, checkOnly: true },
  })

  if (error) return false
  return !!(data as { existingAccount?: boolean } | null)?.existingAccount
}
