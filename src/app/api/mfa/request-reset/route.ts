import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { sendMfaResetEmail } from '@/lib/email'
import crypto from 'crypto'

export async function POST(req: NextRequest) {
  const supabase = await createClient()
  
  // Get the current session
  const { data: { session }, error } = await supabase.auth.getSession()

  if (error || !session) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const userId = session.user.id
  const expiresAt = Date.now() + 15 * 60 * 1000 // 15 minutes
  const secret = process.env.SUPABASE_SERVICE_ROLE_KEY || 'default_secret'
  const signature = crypto.createHmac('sha256', secret).update(userId + expiresAt).digest('hex')
  const tokenRaw = `${userId}|${expiresAt}|${signature}`
  const token = Buffer.from(tokenRaw).toString('base64')

  const origin = req.headers.get('origin') || process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000'
  const resetLink = `${origin}/reset-mfa?token=${encodeURIComponent(token)}`
  
  try {
    await sendMfaResetEmail(session.user.email!, resetLink)
    return NextResponse.json({ success: true })
  } catch (err) {
    console.error('Failed to send MFA reset email:', err)
    return NextResponse.json({ error: 'Failed to send email' }, { status: 500 })
  }
}

