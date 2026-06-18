import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import DashboardClient from './DashboardClient'
import {
  fetchDailyQuizQuestions,
  fetchUserPoints,
  fetchTrustedContacts,
} from './quiz.actions'
import { fetchAdminVideos } from '@/app/admin/admin.actions'

export default async function DashboardPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  // Only enforce TOTP MFA for email/password users.
  // Google OAuth users are already protected by Google's own 2FA.
  const isEmailUser = user.app_metadata.provider === 'email'

  if (isEmailUser) {
    const { data: factors } = await supabase.auth.mfa.listFactors()
    if (!factors || factors.totp.length === 0) {
      redirect('/mfa-setup?mandatory=true')
    }

    const { data: aal } = await supabase.auth.mfa.getAuthenticatorAssuranceLevel()
    if (aal?.nextLevel === 'aal2' && aal.currentLevel === 'aal1') {
      redirect('/login')
    }
  }

  const meta = user.user_metadata as Record<string, string> | undefined
  const displayName = meta?.full_name || meta?.name || user.email?.split('@')[0] || ''
  const userEmail = user.email ?? ''

  // Fetch all data server-side in parallel
  const [questions, userPoints, contacts, videos] = await Promise.all([
    fetchDailyQuizQuestions(),
    fetchUserPoints(),
    fetchTrustedContacts(),
    fetchAdminVideos(),
  ])

  return (
    <DashboardClient
      displayName={displayName}
      userEmail={userEmail}
      initialQuestions={questions}
      initialPoints={userPoints}
      initialContacts={contacts}
      initialVideos={videos}
    />
  )
}
