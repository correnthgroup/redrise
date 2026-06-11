import { supabase } from './supabase'

export type MemberRole = 'owner' | 'admin' | 'member'

export type WorkspaceMember = {
  id: string
  workspace_id: string
  user_id: string
  role: MemberRole
  invited_by: string | null
  joined_at: string
  updated_at: string
  email?: string
  name?: string
}

function generateShortId(): string {
  const chars = 'abcdefghijklmnopqrstuvwxyz0123456789'
  let id = 'wm'
  for (let i = 0; i < 5; i++) {
    id += chars[Math.floor(Math.random() * chars.length)]
  }
  return id
}

export async function loadWorkspaceMembers(workspaceId: string): Promise<WorkspaceMember[]> {
  const { data, error } = await supabase
    .from('workspace_members')
    .select('*')
    .eq('workspace_id', workspaceId)
    .order('joined_at', { ascending: true })

  if (error) throw error
  return data ?? []
}

export async function addWorkspaceMember(
  workspaceId: string,
  _email: string,
  role: MemberRole = 'member',
): Promise<WorkspaceMember | null> {
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return null

  // For now, we'll use the user ID as a placeholder
  // In production, you'd use a profiles table or Supabase admin API
  const id = generateShortId()

  const { data, error } = await supabase
    .from('workspace_members')
    .insert({
      id,
      workspace_id: workspaceId,
      user_id: user.id, // This would be the invited user's ID in production
      role,
      invited_by: user.id,
    })
    .select()
    .single()

  if (error) {
    console.error('[addWorkspaceMember] Insert error:', error.message)
    return null
  }

  return data
}

export async function updateMemberRole(
  memberId: string,
  role: MemberRole,
): Promise<boolean> {
  const { error } = await supabase
    .from('workspace_members')
    .update({ role, updated_at: new Date().toISOString() })
    .eq('id', memberId)

  return !error
}

export async function removeWorkspaceMember(memberId: string): Promise<boolean> {
  const { error } = await supabase
    .from('workspace_members')
    .delete()
    .eq('id', memberId)

  return !error
}

export async function isWorkspaceOwner(workspaceId: string): Promise<boolean> {
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return false

  const { data } = await supabase
    .from('workspace_members')
    .select('role')
    .eq('workspace_id', workspaceId)
    .eq('user_id', user.id)
    .single()

  return data?.role === 'owner'
}

export async function isWorkspaceAdmin(workspaceId: string): Promise<boolean> {
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return false

  const { data } = await supabase
    .from('workspace_members')
    .select('role')
    .eq('workspace_id', workspaceId)
    .eq('user_id', user.id)
    .single()

  return data?.role === 'owner' || data?.role === 'admin'
}
