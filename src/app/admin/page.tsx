import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import {
  fetchAllUsers,
  fetchAdminStats,
  fetchRecentAuditLogs,
  fetchUsersByLevel,
  fetchDailyActivity,
  fetchAdminVideos,
  fetchAdminAlerts,
} from './admin.actions'
import AdminDashboardClient from './AdminDashboardClient'

export const metadata = {
  title: 'Admin Dashboard — VoiceGuard',
  description: 'VoiceGuard administrator control panel',
}

export default async function AdminPage() {
  // ── 1. Auth guard: must be logged in ──────────────────────────────────────
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  // Only enforce TOTP MFA for email/password admin users
  if (user.app_metadata.provider === 'email') {
    const { data: factors } = await supabase.auth.mfa.listFactors()
    if (!factors || factors.totp.length === 0) {
      redirect('/mfa-setup?mandatory=true')
    }

    const { data: aal } = await supabase.auth.mfa.getAuthenticatorAssuranceLevel()
    if (aal?.nextLevel === 'aal2' && aal.currentLevel === 'aal1') {
      redirect('/mfa-setup?mandatory=true')
    }
  }

  // ── 2. Role guard: must be admin ──────────────────────────────────────────
  const { data: profile } = await supabase
    .from('profiles')
    .select('role')
    .eq('id', user.id)
    .single()

  if (profile?.role !== 'admin') redirect('/dashboard')

  // ── 3. Fetch all admin data in parallel ───────────────────────────────────
  const [users, stats, auditLogs, usersByLevel, dailyActivity, videos, alerts] = await Promise.all([
    fetchAllUsers(),
    fetchAdminStats(),
    fetchRecentAuditLogs(),
    fetchUsersByLevel(),
    fetchDailyActivity(),
    fetchAdminVideos(),
    fetchAdminAlerts(),
  ])

  const adminName = (user.user_metadata?.full_name as string)
    || (user.user_metadata?.name as string)
    || user.email?.split('@')[0]
    || 'Admin'

  return (
    <AdminDashboardClient
      adminName={adminName}
      adminEmail={user.email ?? ''}
      users={users}
      stats={stats}
      auditLogs={auditLogs}
      usersByLevel={usersByLevel}
      dailyActivity={dailyActivity}
      videos={videos}
      alerts={alerts}
    />
  )
}
