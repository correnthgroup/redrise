import { supabase } from './supabase'
import type { Workspace, CreateWorkspaceInput } from '@/types/workspace'

function generateShortId(): string {
  const chars = 'abcdefghijklmnopqrstuvwxyz0123456789'
  let id = 'w'
  for (let i = 0; i < 5; i++) {
    id += chars[Math.floor(Math.random() * chars.length)]
  }
  return id
}

async function isIdUnique(id: string): Promise<boolean> {
  const { count } = await supabase
    .from('workspaces')
    .select('*', { count: 'exact', head: true })
    .eq('id', id)
  return count === 0
}

async function generateUniqueId(): Promise<string> {
  let id = generateShortId()
  let attempts = 0
  while (attempts < 10) {
    const unique = await isIdUnique(id)
    if (unique) return id
    id = generateShortId()
    attempts++
  }
  return id
}

export async function loadWorkspaces(): Promise<Workspace[]> {
  const { data, error } = await supabase
    .from('workspaces')
    .select('*')
    .order('created_at', { ascending: false })

  if (error) {
    console.error('[loadWorkspaces] Error:', error.message, error.details, error.hint)
    return []
  }

  console.log('[loadWorkspaces] Loaded:', data?.length ?? 0, 'workspaces')
  return (data ?? []) as Workspace[]
}

export async function createWorkspace(input: CreateWorkspaceInput): Promise<Workspace | null> {
  const { data: { user }, error: authError } = await supabase.auth.getUser()
  if (authError) {
    console.error('[createWorkspace] Auth error:', authError.message)
    return null
  }
  if (!user) {
    console.error('[createWorkspace] No authenticated user')
    return null
  }

  const id = await generateUniqueId()
  const now = new Date().toISOString()

  console.log('[createWorkspace] Inserting:', { id, user_id: user.id, name: input.name })

  const { data, error } = await supabase
    .from('workspaces')
    .insert({
      id,
      user_id: user.id,
      name: input.name || 'New Workspace',
      mission: input.mission || '',
      status: 'pending',
      flows: 0,
      created_at: now,
      updated_at: now,
    })
    .select()
    .single()

  if (error) {
    console.error('[createWorkspace] Insert error:', error.message, error.details, error.hint)
    return null
  }

  console.log('[createWorkspace] Success:', data)
  return data as Workspace
}

export async function getWorkspace(id: string): Promise<Workspace | null> {
  const { data, error } = await supabase
    .from('workspaces')
    .select('*')
    .eq('id', id)
    .single()

  if (error) {
    console.error('Failed to get workspace:', error.message)
    return null
  }

  return data as Workspace
}

export async function deleteWorkspace(id: string): Promise<boolean> {
  const { error } = await supabase
    .from('workspaces')
    .delete()
    .eq('id', id)

  if (error) {
    console.error('Failed to delete workspace:', error.message)
    return false
  }

  return true
}
