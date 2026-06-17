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
  avgConfidence: number
  bonaFideRatio: number
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

export interface VideoItem {
  id: string
  videoId: string
  title: string
  channel: string
  tag: string
  created_at?: string
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

  const { data: authData, error: authError } = await admin.auth.admin.listUsers({
    page: 1, perPage: 1000,
  })
  if (authError || !authData) return []

  const userIds = authData.users.map(u => u.id)

  const [
    { data: profiles },
    { data: points }
  ] = await Promise.all([
    admin.from('profiles').select('id, role').in('id', userIds),
    admin.from('user_points').select('user_id, total_points, streak_days, level').in('user_id', userIds)
  ])

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

  const { data: authData } = await admin.auth.admin.listUsers({ page: 1, perPage: 1000 })
  const totalUsers = authData?.users?.length ?? 0

  const newUsersThisWeek = authData?.users?.filter(
    u => new Date(u.created_at) >= new Date(weekAgo)
  ).length ?? 0

  const { count: activeToday } = await admin
    .from('audit_logs')
    .select('*', { count: 'exact', head: true })
    .eq('event', 'login_success')
    .gte('created_at', `${todayStr}T00:00:00.000Z`)

  const { count: totalScans } = await admin
    .from('audit_logs')
    .select('*', { count: 'exact', head: true })
    .eq('event', 'detect_scan')

  const { count: scamsDetected } = await admin
    .from('audit_logs')
    .select('*', { count: 'exact', head: true })
    .eq('event', 'detect_scan')
    .contains('meta', { label: 'spoof' })

  const { data: pointsData } = await admin.from('user_points').select('total_points')
  const avgPoints = pointsData && pointsData.length > 0
    ? Math.round(pointsData.reduce((sum, p) => sum + (p.total_points ?? 0), 0) / pointsData.length)
    : 0

  const { data: scanLogs } = await admin.from('audit_logs').select('meta').eq('event', 'detect_scan')
  let totalConf = 0; let realCount = 0; let fakeCount = 0
  const scans = scanLogs ?? []
  for (const s of scans) {
    if (typeof s.meta === 'object' && s.meta !== null) {
      const conf = (s.meta as any).confidence ?? 0
      totalConf += conf
      if ((s.meta as any).label === 'bona-fide') realCount++
      if ((s.meta as any).label === 'spoof') fakeCount++
    }
  }
  const avgConfidence = scans.length > 0 ? Math.round(totalConf / scans.length) : 0
  const bonaFideRatio = scans.length > 0 ? Math.round((realCount / scans.length) * 100) : 0

  return {
    totalUsers, activeToday: activeToday ?? 0, totalScans: totalScans ?? 0,
    scamsDetected: scamsDetected ?? 0, avgPoints, newUsersThisWeek,
    avgConfidence, bonaFideRatio,
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
  const { data } = await admin.from('user_points').select('level')
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
    const d    = new Date(now)
    d.setDate(d.getDate() - i)
    const date  = d.toISOString().split('T')[0]
    const start = `${date}T00:00:00.000Z`
    const end   = `${date}T23:59:59.999Z`

    const [loginsRes, signupsRes] = await Promise.all([
      admin.from('audit_logs').select('*', { count:'exact', head:true }).eq('event','login_success').gte('created_at',start).lte('created_at',end),
      admin.from('audit_logs').select('*', { count:'exact', head:true }).eq('event','signup_success').gte('created_at',start).lte('created_at',end),
    ])
    days.push({ date, logins: loginsRes.count ?? 0, signups: signupsRes.count ?? 0 })
  }
  return days
}

// ── Build full analytics payload (used by email + Power BI export) ────────────
export async function buildWeeklyAnalytics() {
  const admin = createAdminClient()
  const now   = new Date()
  const weekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000)

  const [stats, dailyActivity, usersByLevel] = await Promise.all([
    fetchAdminStats(),
    fetchDailyActivity(),
    fetchUsersByLevel(),
  ])

  // Top 5 users by total_points
  const { data: topUsersRaw } = await admin
    .from('user_points')
    .select('user_id, total_points, streak_days, level')
    .order('total_points', { ascending: false })
    .limit(5)

  // Full week audit logs
  const { data: weekLogs } = await admin
    .from('audit_logs')
    .select('id, created_at, event, user_id, ip_address, meta')
    .gte('created_at', weekAgo.toISOString())
    .order('created_at', { ascending: false })
    .limit(200)

  // Event frequency map
  const eventCounts: Record<string, number> = {}
  for (const log of (weekLogs ?? [])) {
    eventCounts[log.event] = (eventCounts[log.event] ?? 0) + 1
  }

  // Spoof detections this week
  const spoofLogsWeek = (weekLogs ?? []).filter(
    l => l.event === 'detect_scan' && (l.meta as any)?.label === 'spoof'
  )

  // Peak hour analysis from this week's logins
  const hourCounts: number[] = new Array(24).fill(0)
  for (const log of (weekLogs ?? []).filter(l => l.event === 'login_success')) {
    const h = new Date(log.created_at).getHours()
    hourCounts[h]++
  }
  const peakHour = hourCounts.indexOf(Math.max(...hourCounts))

  // Login failure rate
  const loginFailures = eventCounts['login_failure'] ?? 0
  const loginSuccess  = eventCounts['login_success']  ?? 0
  const failureRate   = loginSuccess + loginFailures > 0
    ? Math.round((loginFailures / (loginSuccess + loginFailures)) * 100)
    : 0

  return {
    generatedAt:    now.toISOString(),
    weekStart:      weekAgo.toISOString().split('T')[0],
    weekEnd:        now.toISOString().split('T')[0],
    stats,
    dailyActivity,
    usersByLevel,
    topUsers:       topUsersRaw ?? [],
    eventCounts,
    spoofThisWeek:  spoofLogsWeek.length,
    peakHour,
    failureRate,
    recentLogs:     (weekLogs ?? []).slice(0, 20).map(l => ({
      event:      l.event,
      created_at: l.created_at,
      user_id:    l.user_id ? l.user_id.slice(0, 8) + '…' : 'Anonymous',
      ip:         l.ip_address ?? '—',
      meta:       l.meta,
    })),
  }
}

// ── Power BI JSON export (server action) ─────────────────────────────────────
export async function getPowerBiData(): Promise<{ ok: boolean; data?: object; error?: string }> {
  const { isAdmin } = await verifyAdminSession()
  if (!isAdmin) return { ok: false, error: 'Unauthorized' }
  const analytics = await buildWeeklyAnalytics()
  return { ok: true, data: analytics }
}

// ── Send Weekly Report via Resend ─────────────────────────────────────────────
import { Resend } from 'resend'

export async function sendWeeklyReport(adminEmail: string): Promise<{ ok: boolean; error?: string }> {
  const { isAdmin } = await verifyAdminSession()
  if (!isAdmin) return { ok: false, error: 'Unauthorized' }

  const resendApiKey = process.env.RESEND_API_KEY
  if (!resendApiKey) return { ok: false, error: 'RESEND_API_KEY is not configured on the server.' }

  const analytics = await buildWeeklyAnalytics()
  const { stats, dailyActivity, usersByLevel, topUsers, eventCounts, spoofThisWeek, peakHour, failureRate, recentLogs, weekStart, weekEnd, generatedAt } = analytics

  // Format helpers
  const fmtDate = (iso: string) => new Date(iso).toLocaleDateString('en-MY', { day:'2-digit', month:'short', year:'numeric' })
  const pct     = (n: number) => `${n}%`
  const scoreColor = (n: number, good: number, warn: number) =>
    n >= good ? '#16a34a' : n >= warn ? '#d97706' : '#dc2626'

  // Determine security health score (0-100)
  const securityScore = Math.round(
    (stats.bonaFideRatio   * 0.60) +
    (Math.max(0, 100 - failureRate) * 0.40)
  )
  const securityLabel = securityScore >= 75 ? '🟢 Healthy' : securityScore >= 50 ? '🟡 Moderate' : '🔴 Needs Attention'

  // Metric card HTML
  const metricCard = (label: string, value: string, sub: string, color: string) => `
    <td style="width:25%;padding:0 6px;">
      <div style="background:#1e1b4b;border:1px solid #312e81;border-radius:12px;padding:16px;text-align:center;">
        <div style="font-size:24px;font-weight:900;color:${color};letter-spacing:-1px;margin-bottom:4px;">${value}</div>
        <div style="font-size:11px;font-weight:700;letter-spacing:0.05em;text-transform:uppercase;color:#818cf8;margin-bottom:3px;">${label}</div>
        <div style="font-size:11px;color:#6b7280;">${sub}</div>
      </div>
    </td>`

  // Daily activity table rows
  const dailyRows = dailyActivity.map(d => `
    <tr>
      <td style="padding:8px 12px;font-size:12px;color:#94a3b8;border-bottom:1px solid #1e293b;">${fmtDate(d.date + 'T00:00:00')}</td>
      <td style="padding:8px 12px;font-size:13px;font-weight:600;color:#a5b4fc;border-bottom:1px solid #1e293b;text-align:right;">${d.logins}</td>
      <td style="padding:8px 12px;font-size:13px;font-weight:600;color:#60a5fa;border-bottom:1px solid #1e293b;text-align:right;">${d.signups}</td>
      <td style="padding:8px 12px;font-size:13px;font-weight:600;color:#34d399;border-bottom:1px solid #1e293b;text-align:right;">${d.logins + d.signups}</td>
    </tr>`).join('')

  // User level rows
  const levelRows = usersByLevel.map(u => {
    const colors: Record<string, string> = { Beginner:'#94a3b8', Aware:'#34d399', Guardian:'#60a5fa', Expert:'#c084fc', Champion:'#fbbf24' }
    const c = colors[u.level] ?? '#94a3b8'
    const pctVal = stats.totalUsers > 0 ? Math.round((u.count / stats.totalUsers) * 100) : 0
    return `
    <tr>
      <td style="padding:8px 12px;font-size:13px;font-weight:700;color:${c};border-bottom:1px solid #1e293b;">${u.level}</td>
      <td style="padding:8px 12px;font-size:13px;color:#e2e8f0;border-bottom:1px solid #1e293b;text-align:right;">${u.count}</td>
      <td style="padding:8px 12px;border-bottom:1px solid #1e293b;">
        <div style="height:6px;background:#1e293b;border-radius:3px;overflow:hidden;">
          <div style="width:${pctVal}%;height:100%;background:${c};border-radius:3px;"></div>
        </div>
        <span style="font-size:11px;color:#64748b;">${pctVal}%</span>
      </td>
    </tr>`}).join('')

  // Event counts rows
  const eventRows = Object.entries(eventCounts)
    .sort(([,a],[,b]) => b - a)
    .slice(0, 8)
    .map(([event, count]) => {
      const eventColors: Record<string, string> = {
        login_success:'#34d399', login_failure:'#f87171', logout:'#94a3b8',
        signup_success:'#60a5fa', detect_scan:'#a78bfa', password_reset_request:'#fbbf24',
      }
      const c = eventColors[event] ?? '#64748b'
      return `
      <tr>
        <td style="padding:7px 12px;font-size:12px;font-weight:600;color:${c};border-bottom:1px solid #1e293b;">${event.replace(/_/g,' ')}</td>
        <td style="padding:7px 12px;font-size:13px;font-weight:700;color:#e2e8f0;border-bottom:1px solid #1e293b;text-align:right;">${count}</td>
      </tr>`
    }).join('')

  // Audit log digest rows
  const logRows = recentLogs.slice(0, 12).map(l => {
    const metaStr = l.meta && Object.keys(l.meta).length > 0
      ? Object.entries(l.meta).map(([k,v]) => `${k}:${String(v)}`).join(' · ').slice(0, 60)
      : '—'
    return `
    <tr>
      <td style="padding:6px 10px;font-size:11px;color:#64748b;border-bottom:1px solid #1e293b;">${new Date(l.created_at).toLocaleString('en-MY',{month:'short',day:'2-digit',hour:'2-digit',minute:'2-digit'})}</td>
      <td style="padding:6px 10px;font-size:11px;font-weight:600;color:#a5b4fc;border-bottom:1px solid #1e293b;">${l.event.replace(/_/g,' ')}</td>
      <td style="padding:6px 10px;font-size:11px;color:#94a3b8;border-bottom:1px solid #1e293b;">${l.user_id}</td>
      <td style="padding:6px 10px;font-size:11px;color:#64748b;border-bottom:1px solid #1e293b;">${metaStr}</td>
    </tr>`}).join('')

  // Power BI JSON block
  const pbiJson = JSON.stringify({
    report_period: { start: weekStart, end: weekEnd, generated_at: generatedAt },
    platform_kpis: stats,
    daily_activity: dailyActivity,
    users_by_level: usersByLevel,
    event_frequency_this_week: eventCounts,
    threat_metrics: {
      spoof_detections_this_week: spoofThisWeek,
      total_spoof_all_time: stats.scamsDetected,
      bona_fide_ratio_pct: stats.bonaFideRatio,
      avg_ai_confidence_pct: stats.avgConfidence,
      peak_login_hour: peakHour,
      login_failure_rate_pct: failureRate,
      security_health_score: securityScore,
    },
  }, null, 2)

  const html = `
<!DOCTYPE html>
<html lang="en">
<head><meta charset="UTF-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>VoiceGuard Weekly Report</title></head>
<body style="margin:0;padding:0;background:#0f0f1a;font-family:'Segoe UI',Arial,sans-serif;">
<div style="max-width:680px;margin:0 auto;padding:24px 16px;">

  <!-- Header -->
  <div style="background:linear-gradient(135deg,#1e1b4b 0%,#312e81 50%,#1e3a5f 100%);border-radius:20px;padding:32px 28px;margin-bottom:20px;text-align:center;border:1px solid #3730a3;">
    <div style="width:60px;height:60px;background:linear-gradient(135deg,#6366f1,#8b5cf6);border-radius:16px;margin:0 auto 16px;display:flex;align-items:center;justify-content:center;font-size:28px;">🛡️</div>
    <h1 style="margin:0 0 8px;font-size:26px;font-weight:900;color:#fff;letter-spacing:-0.5px;">VoiceGuard Weekly Report</h1>
    <p style="margin:0;font-size:13px;color:#818cf8;">Evidence Package · ${fmtDate(weekStart + 'T00:00:00')} — ${fmtDate(weekEnd + 'T00:00:00')}</p>
    <div style="display:inline-block;margin-top:14px;background:rgba(255,255,255,.1);border:1px solid rgba(255,255,255,.2);border-radius:99px;padding:5px 16px;font-size:12px;font-weight:700;color:#a5b4fc;">
      Security Health: ${securityLabel} · Score: ${securityScore}/100
    </div>
  </div>

  <!-- KPI Grid -->
  <div style="margin-bottom:20px;">
    <table style="width:100%;border-collapse:separate;border-spacing:0;">
      <tr>
        ${metricCard('Total Users', stats.totalUsers.toString(), `+${stats.newUsersThisWeek} new this week`, '#60a5fa')}
        ${metricCard('Active Today', stats.activeToday.toString(), 'Login events today', '#34d399')}
        ${metricCard('Voice Scans', stats.totalScans.toString(), 'AI detections total', '#a78bfa')}
        ${metricCard('Scams Flagged', stats.scamsDetected.toString(), 'Spoof detections', '#f87171')}
      </tr>
    </table>
  </div>
  <div style="margin-bottom:20px;">
    <table style="width:100%;border-collapse:separate;border-spacing:0;">
      <tr>
        ${metricCard('Bona-fide Ratio', pct(stats.bonaFideRatio), 'Real audio vs spoof', scoreColor(stats.bonaFideRatio, 70, 50))}
        ${metricCard('AI Confidence', pct(stats.avgConfidence), 'Avg detection accuracy', scoreColor(stats.avgConfidence, 80, 60))}
      </tr>
    </table>
  </div>

  <!-- Section: Daily Activity -->
  <div style="background:#12122a;border:1px solid #1e293b;border-radius:16px;padding:20px;margin-bottom:16px;">
    <div style="font-size:11px;font-weight:800;letter-spacing:0.1em;text-transform:uppercase;color:#4a5568;margin-bottom:14px;display:flex;align-items:center;gap:6px;">
      <span style="display:inline-block;width:3px;height:14px;background:linear-gradient(180deg,#667eea,#764ba2);border-radius:2px;"></span>
      Daily Activity — Last 7 Days
    </div>
    <table style="width:100%;border-collapse:collapse;">
      <thead>
        <tr>
          <th style="padding:8px 12px;text-align:left;font-size:11px;font-weight:700;letter-spacing:0.05em;text-transform:uppercase;color:#4a5568;">Date</th>
          <th style="padding:8px 12px;text-align:right;font-size:11px;font-weight:700;letter-spacing:0.05em;text-transform:uppercase;color:#4a5568;">Logins</th>
          <th style="padding:8px 12px;text-align:right;font-size:11px;font-weight:700;letter-spacing:0.05em;text-transform:uppercase;color:#4a5568;">Sign-ups</th>
          <th style="padding:8px 12px;text-align:right;font-size:11px;font-weight:700;letter-spacing:0.05em;text-transform:uppercase;color:#4a5568;">Total</th>
        </tr>
      </thead>
      <tbody>${dailyRows}</tbody>
    </table>
  </div>

  <!-- Section: Users by Level + Event Counts (2-col) -->
  <table style="width:100%;border-collapse:separate;border-spacing:12px;margin-bottom:4px;">
    <tr>
      <td style="width:50%;vertical-align:top;padding:0;">
        <div style="background:#12122a;border:1px solid #1e293b;border-radius:16px;padding:20px;">
          <div style="font-size:11px;font-weight:800;letter-spacing:0.1em;text-transform:uppercase;color:#4a5568;margin-bottom:14px;display:flex;align-items:center;gap:6px;">
            <span style="display:inline-block;width:3px;height:14px;background:linear-gradient(180deg,#fbbf24,#f59e0b);border-radius:2px;"></span>
            Users by Level
          </div>
          <table style="width:100%;border-collapse:collapse;">
            <thead>
              <tr>
                <th style="padding:6px 12px;text-align:left;font-size:10px;font-weight:700;text-transform:uppercase;color:#4a5568;">Level</th>
                <th style="padding:6px 12px;text-align:right;font-size:10px;font-weight:700;text-transform:uppercase;color:#4a5568;">Count</th>
                <th style="padding:6px 12px;font-size:10px;font-weight:700;text-transform:uppercase;color:#4a5568;">Share</th>
              </tr>
            </thead>
            <tbody>${levelRows}</tbody>
          </table>
        </div>
      </td>
      <td style="width:50%;vertical-align:top;padding:0;">
        <div style="background:#12122a;border:1px solid #1e293b;border-radius:16px;padding:20px;">
          <div style="font-size:11px;font-weight:800;letter-spacing:0.1em;text-transform:uppercase;color:#4a5568;margin-bottom:14px;display:flex;align-items:center;gap:6px;">
            <span style="display:inline-block;width:3px;height:14px;background:linear-gradient(180deg,#f87171,#ef4444);border-radius:2px;"></span>
            Event Frequency (Week)
          </div>
          <table style="width:100%;border-collapse:collapse;">
            <tbody>${eventRows}</tbody>
          </table>
        </div>
      </td>
    </tr>
  </table>

  <!-- Section: Threat Intelligence -->
  <div style="background:linear-gradient(135deg,rgba(248,113,113,.08),rgba(239,68,68,.04));border:1px solid rgba(248,113,113,.25);border-radius:16px;padding:20px;margin-bottom:16px;margin-top:16px;">
    <div style="font-size:11px;font-weight:800;letter-spacing:0.1em;text-transform:uppercase;color:#f87171;margin-bottom:16px;display:flex;align-items:center;gap:6px;">
      <span style="display:inline-block;width:3px;height:14px;background:linear-gradient(180deg,#f87171,#ef4444);border-radius:2px;"></span>
      🚨 Threat Intelligence Summary
    </div>
    <table style="width:100%;border-collapse:collapse;">
      <tr>
        <td style="padding:8px 0;border-bottom:1px solid rgba(248,113,113,.12);">
          <span style="font-size:12px;color:#fca5a5;">Spoof Detections This Week</span>
        </td>
        <td style="padding:8px 0;border-bottom:1px solid rgba(248,113,113,.12);text-align:right;">
          <span style="font-size:14px;font-weight:800;color:#f87171;">${spoofThisWeek}</span>
        </td>
      </tr>
      <tr>
        <td style="padding:8px 0;border-bottom:1px solid rgba(248,113,113,.12);">
          <span style="font-size:12px;color:#fca5a5;">Total Scams Flagged (All-time)</span>
        </td>
        <td style="padding:8px 0;border-bottom:1px solid rgba(248,113,113,.12);text-align:right;">
          <span style="font-size:14px;font-weight:800;color:#f87171;">${stats.scamsDetected}</span>
        </td>
      </tr>
      <tr>
        <td style="padding:8px 0;border-bottom:1px solid rgba(248,113,113,.12);">
          <span style="font-size:12px;color:#fca5a5;">Login Failure Rate</span>
        </td>
        <td style="padding:8px 0;border-bottom:1px solid rgba(248,113,113,.12);text-align:right;">
          <span style="font-size:14px;font-weight:800;color:${scoreColor(100-failureRate,80,60)};">${failureRate}%</span>
        </td>
      </tr>
      <tr>
        <td style="padding:8px 0;border-bottom:1px solid rgba(248,113,113,.12);">
          <span style="font-size:12px;color:#fca5a5;">Avg AI Detection Confidence</span>
        </td>
        <td style="padding:8px 0;border-bottom:1px solid rgba(248,113,113,.12);text-align:right;">
          <span style="font-size:14px;font-weight:800;color:#c084fc;">${stats.avgConfidence}%</span>
        </td>
      </tr>
      <tr>
        <td style="padding:8px 0;">
          <span style="font-size:12px;color:#fca5a5;">Peak Activity Hour</span>
        </td>
        <td style="padding:8px 0;text-align:right;">
          <span style="font-size:14px;font-weight:800;color:#fbbf24;">${peakHour}:00 – ${peakHour+1}:00 (local)</span>
        </td>
      </tr>
    </table>
  </div>

  <!-- Section: Audit Log Digest -->
  <div style="background:#12122a;border:1px solid #1e293b;border-radius:16px;padding:20px;margin-bottom:16px;">
    <div style="font-size:11px;font-weight:800;letter-spacing:0.1em;text-transform:uppercase;color:#4a5568;margin-bottom:14px;display:flex;align-items:center;gap:6px;">
      <span style="display:inline-block;width:3px;height:14px;background:linear-gradient(180deg,#60a5fa,#3b82f6);border-radius:2px;"></span>
      📋 Audit Log Digest (Last 12 Events This Week)
    </div>
    <table style="width:100%;border-collapse:collapse;font-size:11px;">
      <thead>
        <tr>
          <th style="padding:6px 10px;text-align:left;color:#4a5568;text-transform:uppercase;letter-spacing:0.05em;">Time</th>
          <th style="padding:6px 10px;text-align:left;color:#4a5568;text-transform:uppercase;letter-spacing:0.05em;">Event</th>
          <th style="padding:6px 10px;text-align:left;color:#4a5568;text-transform:uppercase;letter-spacing:0.05em;">User</th>
          <th style="padding:6px 10px;text-align:left;color:#4a5568;text-transform:uppercase;letter-spacing:0.05em;">Details</th>
        </tr>
      </thead>
      <tbody>${logRows}</tbody>
    </table>
  </div>

  <!-- Section: Power BI JSON Export -->
  <div style="background:#0d1117;border:1px solid #30363d;border-radius:16px;padding:20px;margin-bottom:16px;">
    <div style="font-size:11px;font-weight:800;letter-spacing:0.1em;text-transform:uppercase;color:#58a6ff;margin-bottom:4px;">
      📥 Power BI Data Block — Copy &amp; Import
    </div>
    <p style="font-size:12px;color:#8b949e;margin:0 0 12px;">Paste this JSON into Power BI Desktop → Get Data → Blank Query → Advanced Editor, or use the admin dashboard's "Download JSON" button.</p>
    <pre style="background:#161b22;border:1px solid #30363d;border-radius:8px;padding:14px;font-size:10px;color:#e6edf3;overflow-x:auto;font-family:'Courier New',monospace;line-height:1.5;margin:0;white-space:pre-wrap;word-break:break-all;">${pbiJson.replace(/</g,'&lt;').replace(/>/g,'&gt;')}</pre>
  </div>

  <!-- CTA -->
  <div style="text-align:center;margin-bottom:20px;">
    <a href="${process.env.NEXT_PUBLIC_SUPABASE_URL ? 'https://voiceguard.app/admin' : '/admin'}" style="display:inline-block;background:linear-gradient(135deg,#6366f1,#8b5cf6);color:white;text-decoration:none;padding:14px 32px;border-radius:12px;font-size:14px;font-weight:700;letter-spacing:-0.2px;">
      Open Admin Dashboard →
    </a>
  </div>

  <!-- Footer -->
  <div style="text-align:center;padding:16px 0;border-top:1px solid #1e293b;">
    <p style="font-size:11px;color:#374151;margin:0 0 4px;">This is an automated weekly evidence report from VoiceGuard Admin.</p>
    <p style="font-size:11px;color:#374151;margin:0;">Generated at ${new Date(generatedAt).toLocaleString('en-MY')} · Powered by Supabase</p>
  </div>

</div>
</body>
</html>`

  const resend = new Resend(resendApiKey)

  try {
    const { error } = await resend.emails.send({
      from:    'VoiceGuard Admin <onboarding@resend.dev>',
      to:      adminEmail,
      subject: `📊 VoiceGuard Weekly Report — ${fmtDate(weekStart + 'T00:00:00')} to ${fmtDate(weekEnd + 'T00:00:00')} · Security Score: ${securityScore}/100`,
      html,
    })
    if (error) return { ok: false, error: error.message }
    return { ok: true }
  } catch (err: any) {
    return { ok: false, error: err.message }
  }
}

// ── Educational Videos Management ─────────────────────────────────────────────
export async function fetchAdminVideos(): Promise<VideoItem[]> {
  const admin = createAdminClient()
  const { data, error } = await admin
    .from('educational_videos')
    .select('id, video_id, title, channel, tag, created_at')
    .order('created_at', { ascending: false })
  
  if (error || !data) return []
  return data.map((v: any) => ({
    id: String(v.id),
    videoId: v.video_id,
    title: v.title,
    channel: v.channel,
    tag: v.tag,
    created_at: v.created_at,
  }))
}

export async function addAdminVideo(
  videoId: string,
  title: string,
  channel: string,
  tag: string
): Promise<{ success: boolean; error?: string }> {
  const { isAdmin } = await verifyAdminSession()
  if (!isAdmin) return { success: false, error: 'Unauthorized' }

  const supabase = await createClient()
  const { error } = await supabase.from('educational_videos').insert({
    video_id: videoId.trim(),
    title: title.trim(),
    channel: channel.trim(),
    tag: tag.trim(),
  })

  if (error) {
    return { success: false, error: error.message }
  }
  
  return { success: true }
}

export async function removeAdminVideo(id: string): Promise<{ success: boolean; error?: string }> {
  const { isAdmin } = await verifyAdminSession()
  if (!isAdmin) return { success: false, error: 'Unauthorized' }

  const supabase = await createClient()
  const { error } = await supabase.from('educational_videos').delete().eq('id', id)

  if (error) {
    return { success: false, error: error.message }
  }

  return { success: true }
}

// ── Custom Date-Range Report (Excel attachment via Resend) ────────────────────
import ExcelJS from 'exceljs'

export interface ReportResult { ok: boolean; error?: string }

export async function sendCustomReport(
  adminEmail: string,
  startDate:  string, // 'YYYY-MM-DD'
  endDate:    string, // 'YYYY-MM-DD'
  skipAuth = false
): Promise<ReportResult> {
  if (!skipAuth) {
    const { isAdmin } = await verifyAdminSession()
    if (!isAdmin) return { ok: false, error: 'Unauthorized' }
  }

  const resendApiKey = process.env.RESEND_API_KEY
  if (!resendApiKey) return { ok: false, error: 'RESEND_API_KEY is not configured.' }

  const admin   = createAdminClient()
  const start   = `${startDate}T00:00:00.000Z`
  const end     = `${endDate}T23:59:59.999Z`
  const fmtDate = (iso: string) =>
    new Date(iso).toLocaleDateString('en-MY', { day: '2-digit', month: 'short', year: 'numeric' })

  // ── 1. Fetch all data for the period ───────────────────────────────────────
  const [
    { data: allLogs },
    { data: authData },
    { data: pointsData },
    { data: usersByLevelRaw }
  ] = await Promise.all([
    admin.from('audit_logs')
      .select('id, created_at, event, user_id, ip_address, meta')
      .gte('created_at', start)
      .lte('created_at', end)
      .order('created_at', { ascending: false })
      .limit(5000),
    admin.auth.admin.listUsers({ page: 1, perPage: 1000 }),
    admin.from('user_points').select('user_id, total_points, streak_days, level'),
    admin.from('user_points').select('level')
  ])

  const logs = allLogs ?? []

  // ── KPI calculations for period ────────────────────────────────────────────
  const totalUsers      = authData?.users?.length ?? 0
  const newUsers        = authData?.users?.filter(u => u.created_at >= start && u.created_at <= end).length ?? 0
  const loginSuccess    = logs.filter(l => l.event === 'login_success').length
  const loginFailure    = logs.filter(l => l.event === 'login_failure').length
  const detectScans     = logs.filter(l => l.event === 'detect_scan')
  const spoofs          = detectScans.filter(l => (l.meta as any)?.label === 'spoof').length
  const bonaFide        = detectScans.filter(l => (l.meta as any)?.label === 'bona-fide').length
  const avgConf         = detectScans.length > 0
    ? Math.round(detectScans.reduce((s, l) => s + ((l.meta as any)?.confidence ?? 0), 0) / detectScans.length)
    : 0
  const avgPoints       = pointsData && pointsData.length > 0
    ? Math.round(pointsData.reduce((s, p) => s + (p.total_points ?? 0), 0) / pointsData.length)
    : 0
  const bonaFideRatio   = detectScans.length > 0 ? Math.round(bonaFide / detectScans.length * 100) : 0
  const failureRate     = loginSuccess + loginFailure > 0
    ? Math.round(loginFailure / (loginSuccess + loginFailure) * 100) : 0
  const securityScore   = Math.round(bonaFideRatio * 0.60 + Math.max(0, 100 - failureRate) * 0.40)

  // Daily breakdown
  const dayMap: Record<string, { logins: number; signups: number; scans: number; spoofs: number }> = {}
  for (const log of logs) {
    const day = log.created_at.split('T')[0]
    if (!dayMap[day]) dayMap[day] = { logins: 0, signups: 0, scans: 0, spoofs: 0 }
    if (log.event === 'login_success')  dayMap[day].logins++
    if (log.event === 'signup_success') dayMap[day].signups++
    if (log.event === 'detect_scan')    dayMap[day].scans++
    if (log.event === 'detect_scan' && (log.meta as any)?.label === 'spoof') dayMap[day].spoofs++
  }
  const dailyRows = Object.entries(dayMap).sort(([a], [b]) => a.localeCompare(b))

  // User level distribution
  const levelCounts: Record<string, number> = {}
  for (const r of (usersByLevelRaw ?? [])) {
    const l = r.level ?? 'Beginner'
    levelCounts[l] = (levelCounts[l] ?? 0) + 1
  }

  // ── 2. Build Excel workbook ────────────────────────────────────────────────
  const wb = new ExcelJS.Workbook()
  wb.creator   = 'VoiceGuard Admin'
  wb.created   = new Date()
  wb.modified  = new Date()

  // ── Helper styles ──────────────────────────────────────────────────────────
  const DARK_BG:   ExcelJS.FillPattern   = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FF0F0F2A' } }
  const PURPLE_BG: ExcelJS.FillPattern   = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FF312E81' } }
  const RED_BG:    ExcelJS.FillPattern   = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FF7F1D1D' } }
  const GREEN_BG:  ExcelJS.FillPattern   = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FF064E3B' } }
  const BLUE_BG:   ExcelJS.FillPattern   = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FF1E3A5F' } }
  const ROW_ALT:   ExcelJS.FillPattern   = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FF1A1A3A' } }
  const WHITE:     Partial<ExcelJS.Font>   = { color: { argb: 'FFE2E8F0' }, name: 'Calibri' }
  const MUTED:     Partial<ExcelJS.Font>   = { color: { argb: 'FF94A3B8' }, name: 'Calibri' }
  const GOLD:      Partial<ExcelJS.Font>   = { color: { argb: 'FFFBBF24' }, name: 'Calibri', bold: true }
  const GREEN_F:   Partial<ExcelJS.Font>   = { color: { argb: 'FF34D399' }, name: 'Calibri', bold: true }
  const RED_F:     Partial<ExcelJS.Font>   = { color: { argb: 'FFF87171' }, name: 'Calibri', bold: true }
  const BLUE_F:    Partial<ExcelJS.Font>   = { color: { argb: 'FF60A5FA' }, name: 'Calibri', bold: true }
  const PURPLE_F:  Partial<ExcelJS.Font>   = { color: { argb: 'FFA78BFA' }, name: 'Calibri', bold: true }
  const BORDER:    Partial<ExcelJS.Borders> = {
    top:    { style: 'thin', color: { argb: 'FF1E293B' } },
    bottom: { style: 'thin', color: { argb: 'FF1E293B' } },
    left:   { style: 'thin', color: { argb: 'FF1E293B' } },
    right:  { style: 'thin', color: { argb: 'FF1E293B' } },
  }

  const hdrCell = (ws: ExcelJS.Worksheet, row: number, col: number, value: string, fillBg: ExcelJS.FillPattern = PURPLE_BG) => {
    const cell = ws.getCell(row, col)
    cell.value = value
    cell.fill  = fillBg
    cell.font  = { ...WHITE, bold: true, size: 10 }
    cell.alignment = { horizontal: 'center', vertical: 'middle' }
    cell.border = BORDER
  }

  const dataCell = (ws: ExcelJS.Worksheet, row: number, col: number, value: ExcelJS.CellValue, fontOverride?: Partial<ExcelJS.Font>, fillOverride?: ExcelJS.FillPattern) => {
    const cell = ws.getCell(row, col)
    cell.value  = value
    cell.fill   = fillOverride ?? (row % 2 === 0 ? ROW_ALT : DARK_BG)
    cell.font   = fontOverride ?? { ...MUTED, size: 10 }
    cell.alignment = { vertical: 'middle' }
    cell.border = BORDER
  }

  // ══════════════════════════════════════════════════════════════════
  // SHEET 1: Summary
  // ══════════════════════════════════════════════════════════════════
  const s1 = wb.addWorksheet('📊 Summary', { properties: { tabColor: { argb: 'FF6366F1' } } })
  s1.views = [{ showGridLines: false }]

  // Title block
  s1.mergeCells('A1:H1')
  s1.getCell('A1').value = `VoiceGuard Security Report  |  ${fmtDate(start)} — ${fmtDate(end)}`
  s1.getCell('A1').fill  = PURPLE_BG
  s1.getCell('A1').font  = { ...WHITE, bold: true, size: 16 }
  s1.getCell('A1').alignment = { horizontal: 'center', vertical: 'middle' }
  s1.getRow(1).height = 38

  s1.mergeCells('A2:H2')
  s1.getCell('A2').value = `Security Health Score: ${securityScore}/100  ·  Generated: ${new Date().toLocaleString('en-MY')}`
  s1.getCell('A2').fill  = DARK_BG
  s1.getCell('A2').font  = { ...MUTED, italic: true, size: 10 }
  s1.getCell('A2').alignment = { horizontal: 'center', vertical: 'middle' }
  s1.getRow(2).height = 20

  // Section headers: Users
  s1.mergeCells('A4:H4')
  s1.getCell('A4').value = '👥  USER METRICS'
  s1.getCell('A4').fill  = BLUE_BG
  s1.getCell('A4').font  = { ...WHITE, bold: true, size: 11 }
  s1.getCell('A4').alignment = { horizontal: 'left', vertical: 'middle', indent: 1 }
  s1.getRow(4).height = 22

  const userKpis = [
    ['Total Users',         totalUsers,   BLUE_F],
    ['New Users (Period)',  newUsers,      GREEN_F],
    ['Avg. Points / User', avgPoints,     GOLD],
  ]
  const uHdrs = ['Metric', 'Value']
  ;[5, 6].forEach((r, ci) => hdrCell(s1, 5, ci + 1, uHdrs[ci]))
  userKpis.forEach(([label, value, font], i) => {
    dataCell(s1, 6 + i, 1, label as string, { ...MUTED, size: 10 })
    dataCell(s1, 6 + i, 2, value as string | number, font as Partial<ExcelJS.Font>)
  })

  // Section: Security
  const secR = 12
  s1.mergeCells(`A${secR}:H${secR}`)
  s1.getCell(`A${secR}`).value = '🔐  SECURITY & AI DETECTION'
  s1.getCell(`A${secR}`).fill  = RED_BG
  s1.getCell(`A${secR}`).font  = { ...WHITE, bold: true, size: 11 }
  s1.getCell(`A${secR}`).alignment = { horizontal: 'left', vertical: 'middle', indent: 1 }
  s1.getRow(secR).height = 22

  const secKpis = [
    ['Login Events (Success)', loginSuccess, GREEN_F],
    ['Login Events (Failure)', loginFailure, loginFailure > 5 ? RED_F : MUTED],
    ['Login Failure Rate',     `${failureRate}%`, failureRate > 20 ? RED_F : GREEN_F],
    ['Voice Scans (Period)',   detectScans.length, PURPLE_F],
    ['Spoof Detections',       spoofs,       spoofs > 0 ? RED_F : GREEN_F],
    ['Bona-fide Detections',   bonaFide,     GREEN_F],
    ['Bona-fide Ratio',        `${bonaFideRatio}%`, bonaFideRatio >= 70 ? GREEN_F : RED_F],
    ['Avg AI Confidence',      `${avgConf}%`, avgConf >= 80 ? GREEN_F : GOLD],
    ['Security Health Score',  `${securityScore}/100`, securityScore >= 75 ? GREEN_F : securityScore >= 50 ? GOLD : RED_F],
  ]
  ;[1, 2].forEach((col, ci) => hdrCell(s1, secR + 1, col, uHdrs[ci], PURPLE_BG))
  secKpis.forEach(([label, value, font], i) => {
    dataCell(s1, secR + 2 + i, 1, label as string, { ...MUTED, size: 10 })
    dataCell(s1, secR + 2 + i, 2, value as string | number, font as Partial<ExcelJS.Font>)
  })

  // Column widths
  s1.getColumn(1).width = 32
  s1.getColumn(2).width = 22
  for (let c = 3; c <= 8; c++) s1.getColumn(c).width = 12

  // ══════════════════════════════════════════════════════════════════
  // SHEET 2: Daily Activity
  // ══════════════════════════════════════════════════════════════════
  const s2 = wb.addWorksheet('📅 Daily Activity', { properties: { tabColor: { argb: 'FF34D399' } } })
  s2.views = [{ showGridLines: false }]

  s2.mergeCells('A1:F1')
  s2.getCell('A1').value = `Daily Activity Breakdown  |  ${fmtDate(start)} — ${fmtDate(end)}`
  s2.getCell('A1').fill  = PURPLE_BG
  s2.getCell('A1').font  = { ...WHITE, bold: true, size: 14 }
  s2.getCell('A1').alignment = { horizontal: 'center', vertical: 'middle' }
  s2.getRow(1).height = 32

  const d2hdrs = ['Date', 'Logins', 'Sign-ups', 'AI Scans', 'Spoofs Detected', 'Total Events']
  d2hdrs.forEach((h, i) => hdrCell(s2, 3, i + 1, h))
  s2.getRow(3).height = 20

  dailyRows.forEach(([date, d], i) => {
    const r = 4 + i
    const total = d.logins + d.signups + d.scans
    dataCell(s2, r, 1, fmtDate(date + 'T00:00:00'), { ...MUTED, size: 10 })
    dataCell(s2, r, 2, d.logins,  d.logins  > 0 ? GREEN_F  : MUTED)
    dataCell(s2, r, 3, d.signups, d.signups > 0 ? BLUE_F   : MUTED)
    dataCell(s2, r, 4, d.scans,   d.scans   > 0 ? PURPLE_F : MUTED)
    dataCell(s2, r, 5, d.spoofs,  d.spoofs  > 0 ? RED_F    : MUTED)
    dataCell(s2, r, 6, total,     { ...WHITE, bold: true, size: 10 })
    s2.getRow(r).height = 18
  })

  // Totals row
  const tRow = 4 + dailyRows.length
  const tFill: ExcelJS.FillPattern = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FF1E1B4B' } }
  ;['TOTAL', loginSuccess + loginFailure, newUsers, detectScans.length, spoofs,
    logs.length].forEach((v, i) => {
    const c = s2.getCell(tRow, i + 1)
    c.value = v; c.fill = tFill
    c.font = { ...WHITE, bold: true, size: 10 }
    c.border = BORDER
    c.alignment = { vertical: 'middle' }
  })

  s2.getColumn(1).width = 18; s2.getColumn(2).width = 12; s2.getColumn(3).width = 12
  s2.getColumn(4).width = 14; s2.getColumn(5).width = 18; s2.getColumn(6).width = 14

  // ══════════════════════════════════════════════════════════════════
  // SHEET 3: User Levels
  // ══════════════════════════════════════════════════════════════════
  const s3 = wb.addWorksheet('🏅 User Levels', { properties: { tabColor: { argb: 'FFFBBF24' } } })
  s3.views = [{ showGridLines: false }]

  s3.mergeCells('A1:D1')
  s3.getCell('A1').value = 'User Distribution by Skill Level'
  s3.getCell('A1').fill  = PURPLE_BG
  s3.getCell('A1').font  = { ...WHITE, bold: true, size: 14 }
  s3.getCell('A1').alignment = { horizontal: 'center', vertical: 'middle' }
  s3.getRow(1).height = 30

  ;['Level', 'Users', 'Share %', 'Progress Bar'].forEach((h, i) => hdrCell(s3, 3, i + 1, h))
  const levelOrder = ['Beginner', 'Aware', 'Guardian', 'Expert', 'Champion']
  const levelColors: Record<string, string> = { Beginner:'FF94A3B8', Aware:'FF34D399', Guardian:'FF60A5FA', Expert:'FFC084FC', Champion:'FFFBBF24' }
  levelOrder.forEach((lvl, i) => {
    const count = levelCounts[lvl] ?? 0
    const pct   = totalUsers > 0 ? Math.round(count / totalUsers * 100) : 0
    const r     = 4 + i
    const lFill: ExcelJS.FillPattern = { type:'pattern', pattern:'solid', fgColor:{ argb: levelColors[lvl] ?? 'FF94A3B8' } }
    dataCell(s3, r, 1, lvl,   { ...WHITE, bold: true, size: 10, color: { argb: levelColors[lvl] ?? 'FF94A3B8' } })
    dataCell(s3, r, 2, count, { ...WHITE, bold: true, size: 11 })
    dataCell(s3, r, 3, `${pct}%`, { ...MUTED, size: 10 })
    const bar = s3.getCell(r, 4)
    bar.value = '█'.repeat(Math.round(pct / 5)) || '▒'
    bar.fill  = i % 2 === 0 ? DARK_BG : ROW_ALT
    bar.font  = { color: { argb: levelColors[lvl] ?? 'FF94A3B8' }, size: 9 }
    bar.border = BORDER
    s3.getRow(r).height = 20
  })

  s3.getColumn(1).width = 16; s3.getColumn(2).width = 10; s3.getColumn(3).width = 12; s3.getColumn(4).width = 30

  // ══════════════════════════════════════════════════════════════════
  // SHEET 4: AI Detections
  // ══════════════════════════════════════════════════════════════════
  const s4 = wb.addWorksheet('🎙️ Detections', { properties: { tabColor: { argb: 'FFF87171' } } })
  s4.views = [{ showGridLines: false }]

  s4.mergeCells('A1:G1')
  s4.getCell('A1').value = `AI Voice Detection Log  |  ${fmtDate(start)} — ${fmtDate(end)}`
  s4.getCell('A1').fill  = RED_BG
  s4.getCell('A1').font  = { ...WHITE, bold: true, size: 14 }
  s4.getCell('A1').alignment = { horizontal: 'center', vertical: 'middle' }
  s4.getRow(1).height = 30

  ;['Date & Time', 'User ID', 'Result', 'Confidence %', 'Filename', 'File Size (KB)', 'IP Address']
    .forEach((h, i) => hdrCell(s4, 3, i + 1, h, RED_BG))

  detectScans.forEach((log, i) => {
    const r   = 4 + i
    const m   = (log.meta ?? {}) as any
    const isSp = m.label === 'spoof'
    dataCell(s4, r, 1, new Date(log.created_at).toLocaleString('en-MY'), { ...MUTED, size: 9 })
    dataCell(s4, r, 2, log.user_id ? log.user_id.slice(0, 8) + '…' : 'Anon', { ...MUTED, size: 9 })
    dataCell(s4, r, 3, isSp ? '🚨 SPOOF' : '✅ BONA-FIDE', isSp ? RED_F : GREEN_F)
    dataCell(s4, r, 4, m.confidence ?? '—', isSp ? RED_F : GREEN_F)
    dataCell(s4, r, 5, m.filename   ?? '—', { ...MUTED, size: 9 })
    dataCell(s4, r, 6, m.size ? Number((m.size / 1024).toFixed(1)) : '—', { ...MUTED, size: 9 })
    dataCell(s4, r, 7, log.ip_address ?? '—', { ...MUTED, size: 9 })
    s4.getRow(r).height = 16
  })

  if (detectScans.length === 0) {
    s4.mergeCells('A4:G4')
    s4.getCell('A4').value = 'No AI scan events in selected period.'
    s4.getCell('A4').fill  = DARK_BG; s4.getCell('A4').font = { ...MUTED, italic: true, size: 10 }
    s4.getCell('A4').alignment = { horizontal: 'center', vertical: 'middle' }
  }

  ;[22, 12, 14, 14, 20, 14, 16].forEach((w, i) => { s4.getColumn(i + 1).width = w })

  // ══════════════════════════════════════════════════════════════════
  // SHEET 5: Audit Log
  // ══════════════════════════════════════════════════════════════════
  const s5 = wb.addWorksheet('📋 Audit Log', { properties: { tabColor: { argb: 'FF60A5FA' } } })
  s5.views = [{ showGridLines: false }]

  s5.mergeCells('A1:F1')
  s5.getCell('A1').value = `Security Audit Log  |  ${fmtDate(start)} — ${fmtDate(end)}  |  ${logs.length} events`
  s5.getCell('A1').fill  = BLUE_BG
  s5.getCell('A1').font  = { ...WHITE, bold: true, size: 14 }
  s5.getCell('A1').alignment = { horizontal: 'center', vertical: 'middle' }
  s5.getRow(1).height = 30

  ;['Date & Time', 'Event', 'User ID', 'IP Address', 'Details'].forEach((h, i) => hdrCell(s5, 3, i + 1, h, BLUE_BG))

  const eventColors: Record<string, string> = {
    login_success: 'FF34D399', login_failure: 'FFF87171', logout: 'FF94A3B8',
    signup_success: 'FF60A5FA', detect_scan: 'FFA78BFA', password_reset_request: 'FFFBBF24',
    password_reset_success: 'FF34D399',
  }
  logs.slice(0, 2000).forEach((log, i) => {
    const r   = 4 + i
    const ec  = eventColors[log.event] ?? 'FF94A3B8'
    const metaStr = log.meta && Object.keys(log.meta).length > 0
      ? Object.entries(log.meta).map(([k, v]) => `${k}: ${String(v)}`).join(' | ').slice(0, 120)
      : '—'
    dataCell(s5, r, 1, new Date(log.created_at).toLocaleString('en-MY'), { ...MUTED, size: 9 })
    dataCell(s5, r, 2, log.event.replace(/_/g, ' '), { color: { argb: ec }, name: 'Calibri', bold: true, size: 9 })
    dataCell(s5, r, 3, log.user_id ? log.user_id.slice(0, 8) + '…' : 'Anon', { ...MUTED, size: 9 })
    dataCell(s5, r, 4, log.ip_address ?? '—', { ...MUTED, size: 9 })
    dataCell(s5, r, 5, metaStr, { ...MUTED, size: 9 })
    s5.getRow(r).height = 15
  })

  ;[20, 22, 12, 16, 50].forEach((w, i) => { s5.getColumn(i + 1).width = w })

  // ── 3. Export workbook to Buffer ────────────────────────────────────────────
  const buffer = await wb.xlsx.writeBuffer()
  const filename = `VoiceGuard-Report-${startDate}-to-${endDate}.xlsx`

  // ── 4. Simple summary email body ────────────────────────────────────────────
  const html = `
<!DOCTYPE html><html><head><meta charset="UTF-8"></head>
<body style="margin:0;padding:0;background:#0f0f1a;font-family:'Segoe UI',Arial,sans-serif;">
<div style="max-width:600px;margin:0 auto;padding:24px 16px;">
  <div style="background:linear-gradient(135deg,#1e1b4b,#312e81);border-radius:20px;padding:32px;text-align:center;margin-bottom:20px;border:1px solid #3730a3;">
    <div style="font-size:48px;margin-bottom:12px;">📊</div>
    <h1 style="margin:0 0 8px;font-size:22px;font-weight:900;color:#fff;">VoiceGuard Analytics Report</h1>
    <p style="margin:0;color:#818cf8;font-size:13px;">${fmtDate(start)} — ${fmtDate(end)}</p>
    <div style="display:inline-block;margin-top:14px;background:rgba(255,255,255,.1);border:1px solid rgba(255,255,255,.2);border-radius:99px;padding:6px 18px;font-size:13px;font-weight:700;color:#a5b4fc;">
      Security Health Score: ${securityScore}/100 · ${securityScore >= 75 ? '🟢 Healthy' : securityScore >= 50 ? '🟡 Moderate' : '🔴 Needs Attention'}
    </div>
  </div>

  <div style="background:#12122a;border:1px solid #1e293b;border-radius:16px;padding:24px;margin-bottom:16px;">
    <h2 style="color:#a5b4fc;font-size:15px;margin:0 0 16px;">📎 Excel Workbook Attached (5 Sheets)</h2>
    <table style="width:100%;border-collapse:collapse;font-size:13px;">
      <tr><td style="padding:6px 0;color:#60a5fa;border-bottom:1px solid #1e293b;font-weight:700;">📊 Sheet 1 — Summary</td><td style="color:#94a3b8;text-align:right;border-bottom:1px solid #1e293b;">KPIs &amp; security metrics</td></tr>
      <tr><td style="padding:6px 0;color:#34d399;border-bottom:1px solid #1e293b;font-weight:700;">📅 Sheet 2 — Daily Activity</td><td style="color:#94a3b8;text-align:right;border-bottom:1px solid #1e293b;">Day-by-day breakdown</td></tr>
      <tr><td style="padding:6px 0;color:#fbbf24;border-bottom:1px solid #1e293b;font-weight:700;">🏅 Sheet 3 — User Levels</td><td style="color:#94a3b8;text-align:right;border-bottom:1px solid #1e293b;">Skill distribution</td></tr>
      <tr><td style="padding:6px 0;color:#f87171;border-bottom:1px solid #1e293b;font-weight:700;">🎙️ Sheet 4 — Detections</td><td style="color:#94a3b8;text-align:right;border-bottom:1px solid #1e293b;">${detectScans.length} AI scan records</td></tr>
      <tr><td style="padding:6px 0;color:#818cf8;font-weight:700;">📋 Sheet 5 — Audit Log</td><td style="color:#94a3b8;text-align:right;">${logs.length} security events</td></tr>
    </table>
  </div>

  <div style="display:grid;grid-template-columns:1fr 1fr;gap:10px;margin-bottom:16px;">
    ${[
      ['Total Users', totalUsers, '#60a5fa'], ['New Users', newUsers, '#34d399'],
      ['Voice Scans', detectScans.length, '#a78bfa'], ['Spoofs Flagged', spoofs, '#f87171'],
      ['AI Confidence', avgConf + '%', '#c084fc'],
    ].map(([l, v, c]) => `
      <div style="background:#12122a;border:1px solid #1e293b;border-radius:12px;padding:14px;text-align:center;">
        <div style="font-size:20px;font-weight:900;color:${c};margin-bottom:3px;">${v}</div>
        <div style="font-size:11px;color:#64748b;text-transform:uppercase;letter-spacing:.05em;">${l}</div>
      </div>`).join('')}
  </div>

  <p style="text-align:center;font-size:11px;color:#374151;margin:0;">Automated report from VoiceGuard · ${new Date().toLocaleString('en-MY')}</p>
</div>
</body></html>`

  // ── 5. Send via Resend with attachment ──────────────────────────────────────
  const resend = new Resend(resendApiKey)
  try {
    const { error } = await resend.emails.send({
      from:        'VoiceGuard Admin <onboarding@resend.dev>',
      to:          adminEmail,
      subject:     `📊 VoiceGuard Report: ${fmtDate(start)} – ${fmtDate(end)} · Score ${securityScore}/100`,
      html,
      attachments: [{
        filename: filename,
        content:  Buffer.from(buffer).toString('base64'),
      }],
    })
    if (error) return { ok: false, error: error.message }
    return { ok: true }
  } catch (err: any) {
    return { ok: false, error: err.message }
  }
}
