'use server'

import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'
import { headers } from 'next/headers'
import { createClient } from '@/lib/supabase/server'
import { createClient as createSupabaseClient } from '@supabase/supabase-js'
import { writeAuditLog } from '@/lib/auditLog'
import { loginLimiter } from '@/lib/rateLimit'
import { sendMagicLinkEmail, sendPasswordResetEmail, sendMfaResetEmail } from '@/lib/email'
import crypto from 'crypto'
// ── Helper: get IP from server-side headers ───────────────────────────────────
async function getIp(): Promise<string> {
  const hdrs = await headers()
  return (
    hdrs.get('x-forwarded-for')?.split(',')[0].trim() ??
    hdrs.get('x-real-ip') ??
    'unknown'
  )
}

// ── Server-side password strength validation ──────────────────────────────────
function validatePasswordStrength(password: string): string | null {
  if (password.length < 8)              return 'Password must be at least 8 characters long.'
  if (!/[A-Z]/.test(password))          return 'Password must contain at least one uppercase letter.'
  if (!/[0-9]/.test(password))          return 'Password must contain at least one number.'
  if (!/[^A-Za-z0-9]/.test(password))  return 'Password must contain at least one special character (e.g. !@#$%).'
  return null
}

// ── login ─────────────────────────────────────────────────────────────────────
export async function login(formData: FormData) {
  const ip       = await getIp()
  const supabase = await createClient()

  // Rate-limit login attempts per IP (5 attempts per 5 minutes)
  const limit = loginLimiter.check(ip)
  if (!limit.ok) {
    await writeAuditLog({ event: 'login_failure', ipAddress: ip, meta: { reason: 'rate_limited' } })
    return { error: 'Too many login attempts. Please wait a few minutes before trying again.' }
  }

  const credentials = {
    email:    formData.get('email')    as string,
    password: formData.get('password') as string,
  }

  const { error, data } = await supabase.auth.signInWithPassword(credentials)

  if (error) {
    await writeAuditLog({
      event: 'login_failure',
      ipAddress: ip,
      meta: { email: credentials.email, reason: error.message },
    })
    // Make the error message explicitly about wrong password
    if (error.message.toLowerCase().includes('invalid login credentials')) {
      return { error: 'Wrong password or email. Please try again.' }
    }
    return { error: error.message }
  }

  // Complete login directly
  await writeAuditLog({
    event: 'login_success',
    userId: data.user?.id,
    ipAddress: ip,
    meta: { email: credentials.email, method: 'password' },
  })

  if (data.user?.app_metadata.provider === 'email') {
    const { data: aal } = await supabase.auth.mfa.getAuthenticatorAssuranceLevel()
    if (aal?.nextLevel === 'aal2' && aal.currentLevel === 'aal1') {
      return { mfaRequired: true }
    }
  }

  const { data: profile } = await supabase
    .from('profiles')
    .select('role')
    .eq('id', data.user!.id)
    .single()

  const isAdmin = profile?.role === 'admin'

  revalidatePath('/', 'layout')
  redirect(isAdmin ? '/admin' : '/dashboard')
}



// ── sendLoginOtp ──────────────────────────────────────────────────────────────
export async function sendLoginOtp(formData: FormData) {
  const email = formData.get('email') as string
  if (!email) return { error: 'Email is required' }

  try {
    const adminClient = createSupabaseClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!
    )

    const { data, error } = await adminClient.auth.admin.generateLink({
      type: 'magiclink',
      email,
    })

    if (error) return { error: error.message }
    
    // We send the 6-digit OTP code if it exists, otherwise fallback to the link
    const otp = data.properties?.email_otp
    const link = data.properties?.action_link
    
    // Send email via Nodemailer
    await sendMagicLinkEmail(email, otp ? `Your 6-digit code is: ${otp}\n\nOr click here: ${link}` : link)

    return { success: true }
  } catch (err: any) {
    return { error: err.message || 'Failed to send login email' }
  }
}

// ── verifyLoginOtp ────────────────────────────────────────────────────────────
// Step 2 of Email OTP login: verify the 6-digit code and sign in.
export async function verifyLoginOtp(formData: FormData) {
  const ip       = await getIp()
  const supabase = await createClient()
  const email    = formData.get('email') as string
  const token    = (formData.get('token') as string ?? '').trim()

  if (!token || token.length < 6) {
    return { error: 'Please enter the 6-digit code from your email.' }
  }

  const { error, data } = await supabase.auth.verifyOtp({
    email,
    token,
    type: 'magiclink',
  })

  if (error) {
    await writeAuditLog({
      event: 'login_failure',
      ipAddress: ip,
      meta: { email, reason: 'otp_invalid', detail: error.message },
    })
    return { error: 'Invalid or expired code. Please check your email and try again.' }
  }

  await writeAuditLog({
    event: 'login_success',
    userId: data.user?.id,
    ipAddress: ip,
    meta: { email, method: 'otp' },
  })

  // ── Check role — same redirect logic as password login ────────────────────
  const { data: profile } = await supabase
    .from('profiles')
    .select('role')
    .eq('id', data.user!.id)
    .single()

  const isAdmin = profile?.role === 'admin'

  revalidatePath('/', 'layout')
  redirect(isAdmin ? '/admin' : '/dashboard')
}

// ── signup ────────────────────────────────────────────────────────────────────
export async function signup(formData: FormData) {
  const ip       = await getIp()
  const supabase = await createClient()

  const fullName = formData.get('fullName') as string
  const email    = formData.get('email')    as string
  const password = formData.get('password') as string

  // ── Server-side password strength check ──────────────────────────────────────
  // (mirrors client-side validation — cannot be bypassed by disabling JS)
  const pwError = validatePasswordStrength(password)
  if (pwError) {
    await writeAuditLog({
      event: 'signup_failure',
      ipAddress: ip,
      meta: { email, reason: 'weak_password' },
    })
    return { error: pwError }
  }

  const { error, data } = await supabase.auth.signUp({
    email,
    password,
    options: {
      data: { full_name: fullName },
    },
  })

  if (error) {
    await writeAuditLog({
      event: 'signup_failure',
      ipAddress: ip,
      meta: { email, reason: error.message },
    })
    return { error: error.message }
  }

  await writeAuditLog({
    event: 'signup_success',
    userId: data.user?.id,
    ipAddress: ip,
    meta: { email },
  })

  revalidatePath('/', 'layout')
  redirect('/mfa-setup?mandatory=true')
}

// ── logout ────────────────────────────────────────────────────────────────────
export async function logout() {
  const ip       = await getIp()
  const supabase = await createClient()

  const { data: { user } } = await supabase.auth.getUser()

  await supabase.auth.signOut()

  await writeAuditLog({
    event: 'logout',
    userId: user?.id,
    ipAddress: ip,
  })

  revalidatePath('/', 'layout')
  redirect('/')
}

// ── forgotPassword ────────────────────────────────────────────────────────────
export async function forgotPassword(formData: FormData) {
  const ip       = await getIp()
  const email    = formData.get('email') as string

  try {
    const adminClient = createSupabaseClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!
    )

    const { data, error } = await adminClient.auth.admin.generateLink({
      type: 'recovery',
      email,
    })

    if (error) return { error: error.message }

    const otp = data.properties?.email_otp
    const link = data.properties?.action_link

    await sendPasswordResetEmail(email, otp ? `Your 6-digit code is: ${otp}\n\nOr click here: ${link}` : link)

    await writeAuditLog({
      event: 'password_reset_request',
      ipAddress: ip,
      meta: { email },
    })

    return { success: true }
  } catch (err: any) {
    return { error: err.message || 'Failed to send password reset email' }
  }
}

// ── verifyPasswordResetOtp ────────────────────────────────────────────────────
export async function verifyPasswordResetOtp(formData: FormData) {
  const ip       = await getIp()
  const supabase = await createClient()
  const email    = formData.get('email') as string
  const token    = (formData.get('token') as string ?? '').trim()

  if (!token || token.length < 6) {
    return { error: 'Please enter the 6-digit code from your email.' }
  }

  const { error, data } = await supabase.auth.verifyOtp({
    email,
    token,
    type: 'recovery',
  })

  if (error) {
    await writeAuditLog({
      event: 'password_reset_failure',
      ipAddress: ip,
      meta: { email, reason: 'otp_invalid', detail: error.message },
    })
    return { error: 'Invalid or expired code. Please check your email and try again.' }
  }

  revalidatePath('/', 'layout')
  redirect('/reset-password')
}

// ── resetPassword ─────────────────────────────────────────────────────────────
export async function resetPassword(formData: FormData) {
  const ip       = await getIp()
  const supabase = await createClient()
  const password = formData.get('password') as string

  // Server-side strength check on password reset too
  const pwError = validatePasswordStrength(password)
  if (pwError) return { error: pwError }

  const { error, data } = await supabase.auth.updateUser({ password })

  if (error) {
    return { error: error.message }
  }

  await writeAuditLog({
    event: 'password_reset_success',
    userId: data.user?.id,
    ipAddress: ip,
  })

  revalidatePath('/', 'layout')
  redirect('/login?reset=success')
}

// ── verifyLoginMfa ────────────────────────────────────────────────────────────
export async function verifyLoginMfa(formData: FormData) {
  const ip       = await getIp()
  const supabase = await createClient()
  const code     = (formData.get('code') as string ?? '').trim()

  if (!code || code.length < 6) {
    return { error: 'Please enter the 6-digit code.' }
  }

  const { data: factors } = await supabase.auth.mfa.listFactors()
  const factor = factors?.totp[0]
  if (!factor) {
    return { error: 'No authenticator app found for this account.' }
  }

  const challenge = await supabase.auth.mfa.challenge({ factorId: factor.id })
  if (challenge.error) {
    return { error: challenge.error.message }
  }

  const verify = await supabase.auth.mfa.verify({
    factorId: factor.id,
    challengeId: challenge.data.id,
    code,
  })

  if (verify.error) {
    await writeAuditLog({
      event: 'login_failure',
      ipAddress: ip,
      meta: { reason: 'mfa_invalid', detail: verify.error.message },
    })
    return { error: 'Invalid code. Please try again.' }
  }

  const { data: { user } } = await supabase.auth.getUser()
  const { data: profile } = await supabase
    .from('profiles')
    .select('role')
    .eq('id', user!.id)
    .single()

  const isAdmin = profile?.role === 'admin'

  revalidatePath('/', 'layout')
  redirect(isAdmin ? '/admin' : '/dashboard')
}

// ── requestMfaReset ───────────────────────────────────────────────────────────
export async function requestMfaReset() {
  const ip = await getIp()
  const supabase = await createClient()

  // Ensure user is AAL1 authenticated (has valid session but needs AAL2)
  const { data: { session }, error } = await supabase.auth.getSession()
  
  if (error || !session) {
    return { error: 'You must sign in with your password first.' }
  }

  const user = session.user
  const expiresAt = Date.now() + 15 * 60 * 1000 // 15 mins
  
  const secret = process.env.SUPABASE_SERVICE_ROLE_KEY || 'default_secret'
  const signature = crypto.createHmac('sha256', secret).update(user.id + expiresAt).digest('hex')
  const payload = Buffer.from(`${user.id}|${expiresAt}|${signature}`).toString('base64')

  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || (process.env.VERCEL_URL ? `https://${process.env.VERCEL_URL}` : 'http://localhost:3000')
  const link = `${baseUrl}/reset-mfa?token=${encodeURIComponent(payload)}`

  try {
    await sendMfaResetEmail(user.email!, link)
    await writeAuditLog({
      event: 'mfa_reset_request',
      userId: user.id,
      ipAddress: ip,
      meta: { email: user.email },
    })
    return { success: true }
  } catch (err: any) {
    return { error: err.message || 'Failed to send MFA reset email.' }
  }
}

// ── confirmMfaReset ───────────────────────────────────────────────────────────
export async function confirmMfaReset(formData: FormData) {
  const ip = await getIp()
  const token = formData.get('token') as string

  if (!token) return { error: 'Invalid token.' }

  let userId, expiresAt, signature
  try {
    const decoded = Buffer.from(token, 'base64').toString('utf8')
    const parts = decoded.split('|')
    if (parts.length !== 3) throw new Error('Invalid token format')
    userId = parts[0]
    expiresAt = parseInt(parts[1], 10)
    signature = parts[2]
  } catch (e) {
    return { error: 'Invalid or malformed token.' }
  }

  if (Date.now() > expiresAt) {
    return { error: 'Token has expired. Please request a new MFA reset link.' }
  }

  const secret = process.env.SUPABASE_SERVICE_ROLE_KEY || 'default_secret'
  const expectedSignature = crypto.createHmac('sha256', secret).update(userId + expiresAt).digest('hex')

  if (signature !== expectedSignature) {
    return { error: 'Invalid token signature.' }
  }

  try {
    const adminClient = createSupabaseClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!
    )

    const { data: factorsData, error: factorsError } = await adminClient.auth.admin.mfa.listFactors({
      userId
    })

    if (factorsError) throw factorsError

    const factors = factorsData?.factors || []
    
    for (const factor of factors) {
      if (factor.factor_type === 'totp') {
        await adminClient.auth.admin.mfa.deleteFactor({
          id: factor.id,
          userId
        })
      }
    }

    // Sign the user out to enforce a fresh login without AAL2 prompt
    const supabase = await createClient()
    await supabase.auth.signOut()

    await writeAuditLog({
      event: 'mfa_reset_success',
      userId,
      ipAddress: ip,
    })

    revalidatePath('/', 'layout')
  } catch (err: any) {
    return { error: err.message || 'Failed to remove Authenticator App.' }
  }

  redirect('/login?reset_mfa=success')
}
