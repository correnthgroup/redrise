import { supabase } from './supabase'

export type UserProfile = {
  userId: string
  firstName: string
  lastName: string
  username: string
  email: string
  avatarUrl: string | null
  gender: string
  birthDate: string
  language: 'en-US' | 'pt-BR'
  location: string
  timezone: string
  phone: string
}

export type RememberedSession = {
  id: string
  userId: string
  email: string
  browser: string
  location: string
  ip: string
  lastActive: string
  current: boolean
}

export const PROFILE_UPDATED_EVENT = 'redrise:profile-updated'

type SupabaseProfile = {
  id: string
  first_name: string
  last_name: string
  username: string
  email: string
  avatar_url: string | null
  gender: string
  birth_date: string | null
  language: 'en-US' | 'pt-BR'
  location: string
  timezone: string
  phone: string
}

export function createDefaultProfile(user: { id: string; name: string; email: string }): UserProfile {
  const [firstName = user.name || 'User', ...rest] = user.name.split(/\s+/).filter(Boolean)
  const lastName = rest.join(' ')
  const username = (firstName || user.email.split('@')[0] || 'user').toLowerCase().replace(/[^a-z0-9.]/g, '')

  return {
    userId: user.id,
    firstName,
    lastName,
    username,
    email: user.email,
    avatarUrl: null,
    gender: '',
    birthDate: '',
    language: 'en-US',
    location: '',
    timezone: Intl.DateTimeFormat().resolvedOptions().timeZone || 'UTC',
    phone: '',
  }
}

function fromSupabaseProfile(profile: SupabaseProfile): UserProfile {
  return {
    userId: profile.id,
    firstName: profile.first_name,
    lastName: profile.last_name,
    username: profile.username,
    email: profile.email,
    avatarUrl: profile.avatar_url,
    gender: profile.gender,
    birthDate: profile.birth_date ?? '',
    language: profile.language,
    location: profile.location,
    timezone: profile.timezone,
    phone: profile.phone,
  }
}

function toSupabaseProfile(profile: UserProfile) {
  return {
    id: profile.userId,
    first_name: profile.firstName,
    last_name: profile.lastName,
    username: profile.username,
    email: profile.email,
    avatar_url: profile.avatarUrl,
    gender: profile.gender,
    birth_date: profile.birthDate || null,
    language: profile.language,
    location: profile.location,
    timezone: profile.timezone,
    phone: profile.phone,
    last_seen_at: new Date().toISOString(),
  }
}

export async function loadUserProfile(user: { id: string; name: string; email: string }): Promise<UserProfile> {
  const fallback = createDefaultProfile(user)
  const { data, error } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', user.id)
    .maybeSingle()

  if (error) return fallback
  if (data) return fromSupabaseProfile(data as SupabaseProfile)

  const { data: inserted } = await supabase
    .from('profiles')
    .insert(toSupabaseProfile(fallback))
    .select('*')
    .maybeSingle()

  await ensureCurrentUserTeamMember(fallback)
  return inserted ? fromSupabaseProfile(inserted as SupabaseProfile) : fallback
}

export async function saveUserProfile(profile: UserProfile): Promise<UserProfile> {
  const { data, error } = await supabase
    .from('profiles')
    .upsert(toSupabaseProfile(profile), { onConflict: 'id' })
    .select('*')
    .single()

  if (error) throw error
  const next = fromSupabaseProfile(data as SupabaseProfile)
  window.dispatchEvent(new CustomEvent(PROFILE_UPDATED_EVENT, { detail: next }))
  await ensureCurrentUserTeamMember(next)
  return next
}

export async function touchPresence(userId: string) {
  await supabase
    .from('profiles')
    .update({ last_seen_at: new Date().toISOString() })
    .eq('id', userId)
}

async function ensureCurrentUserTeamMember(profile: UserProfile) {
  const payload = {
    owner_user_id: profile.userId,
    member_user_id: profile.userId,
    invite_email: profile.email,
    role: 'owner',
    function: 'Owner',
    team: 'Core',
    status: 'active',
  }

  const { data: existing } = await supabase
    .from('team_members')
    .select('id')
    .eq('owner_user_id', profile.userId)
    .eq('member_user_id', profile.userId)
    .maybeSingle()

  if (existing?.id) {
    await supabase.from('team_members').update(payload).eq('id', existing.id)
  } else {
    await supabase.from('team_members').insert(payload)
  }
}

export async function saveRememberedSession(user: { id: string; email: string }) {
  await supabase
    .from('active_sessions')
    .update({ current: false })
    .eq('user_id', user.id)
    .eq('current', true)

  await supabase
    .from('active_sessions')
    .insert({
      user_id: user.id,
      browser: navigator.userAgent,
      location: 'Current location',
      ip: 'Current IP',
      remembered: true,
      current: true,
      last_active_at: new Date().toISOString(),
    })
}

export async function loadRememberedSessions(userId: string): Promise<RememberedSession[]> {
  const { data, error } = await supabase
    .from('active_sessions')
    .select('*')
    .eq('user_id', userId)
    .is('revoked_at', null)
    .eq('remembered', true)
    .order('last_active_at', { ascending: false })

  if (error) return []

  const rows = data ?? []
  const hasCurrentSession = rows.some((session) => session.current)

  return rows.map((session, index) => ({
    id: session.id,
    userId: session.user_id,
    email: '',
    browser: session.browser,
    location: session.location,
    ip: session.ip,
    lastActive: session.last_active_at,
    current: session.current || (!hasCurrentSession && index === 0),
  }))
}

export async function revokeRememberedSession(sessionId: string) {
  const { error } = await supabase
    .from('active_sessions')
    .update({ revoked_at: new Date().toISOString(), current: false })
    .eq('id', sessionId)

  return !error
}

export async function revokeOtherRememberedSessions(userId: string) {
  const { error } = await supabase
    .from('active_sessions')
    .update({ revoked_at: new Date().toISOString(), current: false })
    .eq('user_id', userId)
    .eq('remembered', true)
    .eq('current', false)

  return !error
}
