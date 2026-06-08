'use server'

import { createAdminClient } from '@/lib/supabase/admin'
import { createClient } from '@/lib/supabase/server'

// ── Types ─────────────────────────────────────────────────────────────────────
export interface AdminUser {
  id: string
  email: string
  full_name: string
  role: 'user' | 'admin'
  level: string
  total_points: number
  streak_days: number
  created_at: string
  last_sign_in_at: string | null
}

export interface AdminStats {
  totalUsers: number
  activeToday: number
  totalScans: number
  scamsDetected: number
  avgPoints: number
  newUsersThisWeek: number
}

export interface AuditLogEntry {
  id: number
  created_at: string
  event: string
  user_id: string | null
  ip_address: string | null
  meta: Record<string, unknown>
}

export interface UsersByLevel {
  level: string
  count: number
}

export interface DailyActivity {
  date: string
  logins: number
  signups: number
}

// ── Guard: verify current session user is admin ───────────────────────────────
export async function verifyAdminSession(): Promise<{ isAdmin: boolean; userId?: string }> {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { isAdmin: false }

  const { data: profile } = await supabase
    .from('profiles')
    .select('role')
    .eq('id', user.id)
    .single()

  return { isAdmin: profile?.role === 'admin', userId: user.id }
}

// ── Fetch all users with points & profile data ────────────────────────────────
export async function fetchAllUsers(): Promise<AdminUser[]> {
  const admin = createAdminClient()

  // Fetch all auth users
  const { data: authData, error: authError } = await admin.auth.admin.listUsers({
    page: 1,
    perPage: 1000,
  })
  if (authError || !authData) return []

  const userIds = authData.users.map(u => u.id)

  // Fetch profiles (roles)
  const { data: profiles } = await admin
    .from('profiles')
    .select('id, role')
    .in('id', userIds)

  // Fetch points data
  const { data: points } = await admin
    .from('user_points')
    .select('user_id, total_points, streak_days, level')
    .in('user_id', userIds)

  const profileMap = Object.fromEntries((profiles ?? []).map(p => [p.id, p]))
  const pointsMap  = Object.fromEntries((points ?? []).map(p => [p.user_id, p]))

  return authData.users.map(u => ({
    id:              u.id,
    email:           u.email ?? '',
    full_name:       (u.user_metadata?.full_name as string) || (u.user_metadata?.name as string) || u.email?.split('@')[0] || 'Unknown',
    role:            (profileMap[u.id]?.role ?? 'user') as 'user' | 'admin',
    level:           pointsMap[u.id]?.level ?? 'Beginner',
    total_points:    pointsMap[u.id]?.total_points ?? 0,
    streak_days:     pointsMap[u.id]?.streak_days ?? 0,
    created_at:      u.created_at,
    last_sign_in_at: u.last_sign_in_at ?? null,
  }))
}

// ── Fetch aggregate stats ─────────────────────────────────────────────────────
export async function fetchAdminStats(): Promise<AdminStats> {
  const admin = createAdminClient()

  const today     = new Date()
  const todayStr  = today.toISOString().split('T')[0]
  const weekAgo   = new Date(today.getTime() - 7 * 24 * 60 * 60 * 1000).toISOString()

  // Total users
  const { data: authData } = await admin.auth.admin.listUsers({ page: 1, perPage: 1000 })
  const totalUsers = authData?.users?.length ?? 0

  // New users this week
  const newUsersThisWeek = authData?.users?.filter(
    u => new Date(u.created_at) >= new Date(weekAgo)
  ).length ?? 0

  // Active today (login_success events today)
  const { count: activeToday } = await admin
    .from('audit_logs')
    .select('*', { count: 'exact', head: true })
    .eq('event', 'login_success')
    .gte('created_at', `${todayStr}T00:00:00.000Z`)

  // Total scans
  const { count: totalScans } = await admin
    .from('audit_logs')
    .select('*', { count: 'exact', head: true })
    .eq('event', 'detect_scan')

  // Scams detected (detect_scan where meta->label = 'spoof')
  const { count: scamsDetected } = await admin
    .from('audit_logs')
    .select('*', { count: 'exact', head: true })
    .eq('event', 'detect_scan')
    .contains('meta', { label: 'spoof' })

  // Average points
  const { data: pointsData } = await admin
    .from('user_points')
    .select('total_points')

  const avgPoints = pointsData && pointsData.length > 0
    ? Math.round(pointsData.reduce((sum, p) => sum + (p.total_points ?? 0), 0) / pointsData.length)
    : 0

  return {
    totalUsers,
    activeToday:    activeToday ?? 0,
    totalScans:     totalScans  ?? 0,
    scamsDetected:  scamsDetected ?? 0,
    avgPoints,
    newUsersThisWeek,
  }
}

// ── Fetch recent audit logs ───────────────────────────────────────────────────
export async function fetchRecentAuditLogs(): Promise<AuditLogEntry[]> {
  const admin = createAdminClient()

  const { data } = await admin
    .from('audit_logs')
    .select('id, created_at, event, user_id, ip_address, meta')
    .order('created_at', { ascending: false })
    .limit(50)

  return (data ?? []) as AuditLogEntry[]
}

// ── Fetch users grouped by level ─────────────────────────────────────────────
export async function fetchUsersByLevel(): Promise<UsersByLevel[]> {
  const admin = createAdminClient()

  const { data } = await admin
    .from('user_points')
    .select('level')

  if (!data) return []

  const counts: Record<string, number> = {}
  for (const row of data) {
    const lvl = row.level ?? 'Beginner'
    counts[lvl] = (counts[lvl] ?? 0) + 1
  }

  const ORDER = ['Beginner', 'Aware', 'Guardian', 'Expert', 'Champion']
  return ORDER.map(level => ({ level, count: counts[level] ?? 0 }))
}

// ── Fetch daily logins for the last 7 days ───────────────────────────────────
export async function fetchDailyActivity(): Promise<DailyActivity[]> {
  const admin = createAdminClient()

  const days: DailyActivity[] = []
  const now = new Date()

  for (let i = 6; i >= 0; i--) {
    const d     = new Date(now)
    d.setDate(d.getDate() - i)
    const date  = d.toISOString().split('T')[0]
    const start = `${date}T00:00:00.000Z`
    const end   = `${date}T23:59:59.999Z`

    const [loginsRes, signupsRes] = await Promise.all([
      admin
        .from('audit_logs')
        .select('*', { count: 'exact', head: true })
        .eq('event', 'login_success')
        .gte('created_at', start)
        .lte('created_at', end),
      admin
        .from('audit_logs')
        .select('*', { count: 'exact', head: true })
        .eq('event', 'signup_success')
        .gte('created_at', start)
        .lte('created_at', end),
    ])

    days.push({
      date,
      logins:  loginsRes.count  ?? 0,
      signups: signupsRes.count ?? 0,
    })
  }

  return days
}
