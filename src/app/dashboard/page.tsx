import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import DashboardClient from './DashboardClient'
import {
  fetchDailyQuizQuestions,
  fetchUserPoints,
  fetchTrustedContacts,
} from './quiz.actions'

export default async function DashboardPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const meta = user.user_metadata as Record<string, string> | undefined
  const displayName = meta?.full_name || meta?.name || user.email?.split('@')[0] || ''
  const userEmail = user.email ?? ''

  // Fetch all data server-side in parallel
  const [questions, userPoints, contacts] = await Promise.all([
    fetchDailyQuizQuestions(),
    fetchUserPoints(),
    fetchTrustedContacts(),
  ])

  return (
    <DashboardClient
      displayName={displayName}
      userEmail={userEmail}
      initialQuestions={questions}
      initialPoints={userPoints}
      initialContacts={contacts}
    />
  )
}
