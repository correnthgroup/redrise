import { supabase } from './supabase'
export const TEAM_LIMIT = 7

export type TeamAssignment = {
  id: string
  teamId: string
  teamMemberId: string
  function: string
  createdAt: string
}

export type Team = {
  id: string
  ownerUserId: string
  name: string
  description: string
  createdAt: string
  updatedAt: string
  assignments: TeamAssignment[]
}

type TeamRow = {
  id: string
  owner_user_id: string
  name: string
  description: string
  created_at: string
  updated_at: string
}

type AssignmentRow = {
  id: string
  team_id: string
  team_member_id: string
  function: string
  created_at: string
}

function generateShortId(prefix: string) {
  const chars = 'abcdefghijklmnopqrstuvwxyz0123456789'
  let id = prefix
  for (let i = 0; i < 5; i++) id += chars[Math.floor(Math.random() * chars.length)]
  return id
}

function normalizeFallbackTeam(team: string | null | undefined) {
  const value = (team ?? '').trim()
  return value.toLowerCase() === 'core' ? '' : value
}

function mapTeam(row: TeamRow, assignments: AssignmentRow[]): Team {
  return {
    id: row.id,
    ownerUserId: row.owner_user_id,
    name: row.name,
    description: row.description,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
    assignments: assignments.filter((assignment) => assignment.team_id === row.id).map((assignment) => ({
      id: assignment.id,
      teamId: assignment.team_id,
      teamMemberId: assignment.team_member_id,
      function: assignment.function,
      createdAt: assignment.created_at,
    })),
  }
}

export async function loadTeams(ownerUserId: string): Promise<Team[]> {
  const { data: teams, error } = await supabase
    .from('teams')
    .select('*')
    .eq('owner_user_id', ownerUserId)
    .order('created_at', { ascending: false })

  if (error) {
    console.error('[loadTeams] Error:', error.message)
    return []
  }

  const teamIds = (teams ?? []).map((team) => team.id)
  const { data: assignments } = teamIds.length > 0
    ? await supabase.from('team_assignments').select('*').in('team_id', teamIds)
    : { data: [] }

  return ((teams ?? []) as TeamRow[]).map((team) => mapTeam(team, (assignments ?? []) as AssignmentRow[]))
}

export async function createTeam(input: {
  ownerUserId: string
  name: string
  description: string
  assignments: { teamMemberId: string; function: string }[]
}): Promise<Team | null> {
  const id = generateShortId('tm')
  const now = new Date().toISOString()

  const { data, error } = await supabase
    .from('teams')
    .insert({
      id,
      owner_user_id: input.ownerUserId,
      name: input.name.trim(),
      description: input.description.trim(),
      created_at: now,
      updated_at: now,
    })
    .select('*')
    .single()

  if (error) {
    console.error('[createTeam] Error:', error.message)
    return null
  }

  if (input.assignments.length > 0) {
    const { error: assignmentError } = await supabase.from('team_assignments').insert(input.assignments.map((assignment) => ({
      id: generateShortId('ta'),
      team_id: id,
      team_member_id: assignment.teamMemberId,
      function: assignment.function,
      created_at: now,
      updated_at: now,
    })))
    if (assignmentError) console.error('[createTeamAssignments] Error:', assignmentError.message)
  }

  return mapTeam(data as TeamRow, [])
}

export async function addTeamAssignments(teamId: string, assignments: { teamMemberId: string; function: string }[]) {
  if (assignments.length === 0) return true
  const now = new Date().toISOString()
  const { error } = await supabase
    .from('team_assignments')
    .upsert(assignments.map((assignment) => ({
      id: generateShortId('ta'),
      team_id: teamId,
      team_member_id: assignment.teamMemberId,
      function: assignment.function,
      created_at: now,
      updated_at: now,
    })), { onConflict: 'team_id,team_member_id', ignoreDuplicates: false })

  return !error
}

export async function updateTeamAssignmentFunction(assignmentId: string, memberFunction: string) {
  const { error } = await supabase
    .from('team_assignments')
    .update({ function: memberFunction, updated_at: new Date().toISOString() })
    .eq('id', assignmentId)

  return !error
}

export async function loadCurrentTeamAssignments(userId: string): Promise<{ function: string; teams: string[] } | null> {
  const { data: teamMembers } = await supabase
    .from('team_members')
    .select('id, function, team, owner_user_id, member_user_id, status')
    .or(`owner_user_id.eq.${userId},member_user_id.eq.${userId}`)
    .eq('status', 'active')

  const rows = teamMembers ?? []
  const externalRows = rows.filter((member) => member.member_user_id === userId && member.owner_user_id !== userId)
  const effectiveRows = externalRows.length > 0 ? externalRows : rows
  const memberIds = effectiveRows.map((member) => member.id)
  if (memberIds.length === 0) return null

  const { data: assignments } = await supabase
    .from('team_assignments')
    .select('function, teams(name)')
    .in('team_member_id', memberIds)

  const assignmentRows = (assignments ?? []) as unknown as { function: string; teams: { name: string }[] | { name: string } | null }[]
  if (assignmentRows.length === 0) {
    const fallback = effectiveRows[0]
    const fallbackTeam = normalizeFallbackTeam(fallback?.team)
    return fallback ? { function: fallback.function ?? '', teams: fallbackTeam ? [fallbackTeam] : [] } : null
  }

  return {
    function: assignmentRows[0].function,
    teams: assignmentRows.map((assignment) => Array.isArray(assignment.teams) ? assignment.teams[0]?.name : assignment.teams?.name).filter(Boolean) as string[],
  }
}
