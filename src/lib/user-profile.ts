import { supabase } from './supabase'
import type { Session, User } from '@supabase/supabase-js'

export type UserProfile = {
  userId: string
  firstName: string
  middleName: string
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
  os: string
  device: string
  location: string
  country: string
  ip: string
  lastActive: string
  current: boolean
  remembered: boolean
}

type RegisterActiveSessionInput = {
  user: Pick<User, 'id' | 'email'>
  session: Session | null
  remembered: boolean
  source: 'password' | 'oauth'
}

export const PROFILE_UPDATED_EVENT = 'redrise:profile-updated'

type SupabaseProfile = {
  id: string
  first_name: string
  middle_name?: string
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
  const [firstName = user.name || 'User', middleName = '', ...rest] = user.name.split(/\s+/).filter(Boolean)
  const lastName = rest.join(' ')
  const username = (firstName || user.email.split('@')[0] || 'user').toLowerCase().replace(/[^a-z0-9.]/g, '')

  return {
    userId: user.id,
    firstName,
    middleName,
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
    middleName: profile.middle_name ?? '',
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
    middle_name: profile.middleName,
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

function decodeJwtPayload(token?: string) {
  if (!token) return null
  try {
    const payload = token.split('.')[1]
    if (!payload) return null
    const normalized = payload.replace(/-/g, '+').replace(/_/g, '/')
    const padded = normalized.padEnd(normalized.length + ((4 - (normalized.length % 4)) % 4), '=')
    return JSON.parse(window.atob(padded)) as Record<string, unknown>
  } catch {
    return null
  }
}

export function getSupabaseSessionId(session: Session | null) {
  const payload = decodeJwtPayload(session?.access_token)
  return typeof payload?.session_id === 'string' ? payload.session_id : null
}

function parseUserAgent(userAgent: string) {
  const browser = /edg\//i.test(userAgent)
    ? 'Edge'
    : /chrome|crios/i.test(userAgent)
      ? 'Chrome'
      : /firefox|fxios/i.test(userAgent)
        ? 'Firefox'
        : /safari/i.test(userAgent)
          ? 'Safari'
          : 'Unknown browser'

  const os = /windows/i.test(userAgent)
    ? 'Windows'
    : /android/i.test(userAgent)
      ? 'Android'
      : /iphone|ipad|ios/i.test(userAgent)
        ? 'iOS'
        : /mac os|macintosh/i.test(userAgent)
          ? 'macOS'
          : /linux/i.test(userAgent)
            ? 'Linux'
            : 'Unknown OS'

  const device = /iphone|android.*mobile/i.test(userAgent)
    ? 'Phone'
    : /ipad|tablet/i.test(userAgent)
      ? 'Tablet'
      : 'Desktop'

  return { browser, os, device }
}

function maskIp(ip: string) {
  if (!ip || ip === 'Unknown IP') return ip || 'Unknown IP'
  if (ip.includes(':')) return ip.replace(/:[^:]+:[^:]+$/, ':xxxx:xxxx')
  const parts = ip.split('.')
  if (parts.length !== 4) return ip
  return `${parts[0]}.${parts[1]}.xxx.xxx`
}

async function getSessionLocation() {
  const controller = new AbortController()
  const timeout = window.setTimeout(() => controller.abort(), 1500)

  try {
    const response = await fetch('https://ipapi.co/json/', { signal: controller.signal })
    if (!response.ok) throw new Error('location lookup failed')
    const data = await response.json() as { ip?: string; country_name?: string; country?: string; city?: string; region?: string }
    const country = data.country_name || data.country || 'Unknown location'
    const location = [data.city, data.region, country].filter(Boolean).join(', ') || country
    return { ip: data.ip || 'Unknown IP', country, location }
  } catch {
    return { ip: 'Unknown IP', country: 'Unknown location', location: 'Unknown location' }
  } finally {
    window.clearTimeout(timeout)
  }
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

export async function registerActiveSession({ user, session, remembered, source }: RegisterActiveSessionInput) {
  const userAgent = typeof navigator === 'undefined' ? '' : navigator.userAgent
  const parsed = parseUserAgent(userAgent)
  const location = await getSessionLocation()
  const now = new Date().toISOString()
  const supabaseSessionId = getSupabaseSessionId(session)

  if (supabaseSessionId) {
    const payload = {
        user_id: user.id,
        supabase_session_id: supabaseSessionId,
        browser: parsed.browser,
        os: parsed.os,
        device: parsed.device,
        location: location.location,
        country: location.country,
        ip: location.ip,
        remembered,
        current: false,
        source,
        revoked_at: null,
        last_active_at: now,
      }

    const { data: existing } = await supabase
      .from('active_sessions')
      .select('id, remembered')
      .eq('user_id', user.id)
      .eq('supabase_session_id', supabaseSessionId)
      .maybeSingle()

    if (existing?.id) {
      await supabase.from('active_sessions').update({ ...payload, remembered: remembered || Boolean(existing.remembered) }).eq('id', existing.id)
    } else {
      await supabase.from('active_sessions').insert(payload)
    }
    return
  }

  const { data: existing } = await supabase
    .from('active_sessions')
    .select('id, remembered')
    .eq('user_id', user.id)
    .eq('browser', parsed.browser)
    .eq('os', parsed.os)
    .eq('country', location.country)
    .eq('ip', location.ip)
    .is('revoked_at', null)
    .maybeSingle()

  const payload = {
    user_id: user.id,
    browser: parsed.browser,
    os: parsed.os,
    device: parsed.device,
    location: location.location,
    country: location.country,
    ip: location.ip,
    remembered,
    current: false,
    source,
    last_active_at: now,
    revoked_at: null,
  }

  if (existing?.id) {
    await supabase.from('active_sessions').update({ ...payload, remembered: remembered || Boolean(existing.remembered) }).eq('id', existing.id)
  } else {
    await supabase.from('active_sessions').insert(payload)
  }
}

export async function saveRememberedSession(user: { id: string; email: string }, session?: Session | null) {
  await registerActiveSession({ user, session: session ?? null, remembered: true, source: 'password' })
}

export async function loadRememberedSessions(userId: string): Promise<RememberedSession[]> {
  const { data: { session } } = await supabase.auth.getSession()
  const currentSupabaseSessionId = getSupabaseSessionId(session)
  const { data, error } = await supabase
    .from('active_sessions')
    .select('*')
    .eq('user_id', userId)
    .is('revoked_at', null)
    .order('last_active_at', { ascending: false })

  if (error) return []

  const rows = data ?? []
  const hasCurrentSession = currentSupabaseSessionId
    ? rows.some((activeSession) => activeSession.supabase_session_id === currentSupabaseSessionId)
    : rows.some((activeSession) => activeSession.current)

  return rows.map((session, index) => ({
    id: session.id,
    userId: session.user_id,
    email: '',
    browser: session.browser || 'Unknown browser',
    os: session.os || 'Unknown OS',
    device: session.device || 'Unknown device',
    location: session.location || session.country || 'Unknown location',
    country: session.country || session.location || 'Unknown location',
    ip: maskIp(session.ip || 'Unknown IP'),
    lastActive: session.last_active_at || session.created_at,
    current: currentSupabaseSessionId
      ? session.supabase_session_id === currentSupabaseSessionId || (!hasCurrentSession && index === 0)
      : session.current || (!hasCurrentSession && index === 0),
    remembered: Boolean(session.remembered),
  }))
}

export async function revokeRememberedSession(sessionId: string) {
  const { error } = await supabase
    .from('active_sessions')
    .update({ revoked_at: new Date().toISOString(), current: false })
    .eq('id', sessionId)

  return !error
}

export async function revokeCurrentActiveSession() {
  const { data: { session } } = await supabase.auth.getSession()
  const sessionId = getSupabaseSessionId(session)
  if (!session?.user?.id) return false

  if (sessionId) {
    const { error } = await supabase
      .from('active_sessions')
      .update({ revoked_at: new Date().toISOString(), current: false })
      .eq('user_id', session.user.id)
      .eq('supabase_session_id', sessionId)
    return !error
  }

  const { error } = await supabase
    .from('active_sessions')
    .update({ revoked_at: new Date().toISOString(), current: false })
    .eq('user_id', session.user.id)
    .eq('current', true)
  return !error
}

export async function touchCurrentActiveSession() {
  const { data: { session } } = await supabase.auth.getSession()
  const sessionId = getSupabaseSessionId(session)
  if (!session?.user?.id || !sessionId) return

  await supabase
    .from('active_sessions')
    .update({ last_active_at: new Date().toISOString() })
    .eq('user_id', session.user.id)
    .eq('supabase_session_id', sessionId)
    .is('revoked_at', null)
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
