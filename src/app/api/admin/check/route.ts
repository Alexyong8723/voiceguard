import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export async function GET() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    return NextResponse.json({ status: 'not logged in', hint: 'Please login at /login first' })
  }

  const { data: profile, error } = await supabase
    .from('profiles')
    .select('role')
    .eq('id', user.id)
    .single()

  return NextResponse.json({
    email:          user.email,
    user_id:        user.id,
    role:           profile?.role ?? 'NOT FOUND',
    is_admin:       profile?.role === 'admin',
    profiles_error: error?.message ?? null,
    hint: profile?.role === 'admin'
      ? '✅ You are an admin! Log out and log back in to access /admin'
      : profile?.role === 'user'
      ? '⚠️ You are a regular user. Run the UPDATE SQL in Supabase to make yourself admin.'
      : '❌ No profile row found. Run the migration SQL first, then the UPDATE SQL.',
  })
}
