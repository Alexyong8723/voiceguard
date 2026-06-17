'use server'

import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'
import { headers } from 'next/headers'
import { createClient } from '@/lib/supabase/server'
import { writeAuditLog } from '@/lib/auditLog'
import { loginLimiter } from '@/lib/rateLimit'

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
// Step 1 of Email OTP login: send a 6-digit OTP to the user's email.
export async function sendLoginOtp(formData: FormData) {
  const ip       = await getIp()
  const supabase = await createClient()
  const email    = formData.get('email') as string

  if (!email?.includes('@')) return { error: 'Please enter a valid email address.' }

  // Rate-limit OTP sends per IP
  const limit = loginLimiter.check(ip)
  if (!limit.ok) {
    return { error: 'Too many attempts. Please wait a few minutes before trying again.' }
  }

  const { error } = await supabase.auth.signInWithOtp({
    email,
    options: {
      shouldCreateUser: false, // Only existing accounts can use OTP login
    },
  })

  if (error) {
    // "Email not confirmed" or "User not found" surface a generic message
    // to avoid user enumeration
    await writeAuditLog({
      event: 'login_failure',
      ipAddress: ip,
      meta: { email, reason: error.message, method: 'otp_send' },
    })
    if (error.message.toLowerCase().includes('not found') ||
        error.message.toLowerCase().includes('no user')) {
      return { error: 'No account found with that email address.' }
    }
    return { error: error.message }
  }

  return { success: true }
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
    type: 'email',
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
  redirect('/verify-email')
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
  redirect('/login')
}

// ── forgotPassword ────────────────────────────────────────────────────────────
export async function forgotPassword(formData: FormData) {
  const ip       = await getIp()
  const supabase = await createClient()
  const email    = formData.get('email') as string

  const { error } = await supabase.auth.resetPasswordForEmail(email)

  if (error) {
    return { error: error.message }
  }

  await writeAuditLog({
    event: 'password_reset_request',
    ipAddress: ip,
    meta: { email },
  })

  return { success: true }
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
