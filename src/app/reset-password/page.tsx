'use client'

import { useState, useTransition, useEffect, Suspense } from 'react'
import { useSearchParams } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { resetPassword } from '@/app/auth/actions'

const ShieldIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
  </svg>
)
const LockIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <rect x="3" y="11" width="18" height="11" rx="2" ry="2" /><path d="M7 11V7a5 5 0 0 1 10 0v4" />
  </svg>
)
const EyeIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" /><circle cx="12" cy="12" r="3" />
  </svg>
)
const EyeOffIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24" />
    <line x1="1" y1="1" x2="23" y2="23" />
  </svg>
)
const AlertIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="12" cy="12" r="10" /><line x1="12" y1="8" x2="12" y2="12" /><line x1="12" y1="16" x2="12.01" y2="16" />
  </svg>
)

function getPasswordStrength(password: string): { level: number; label: string } {
  if (!password) return { level: 0, label: '' }
  let score = 0
  if (password.length >= 8) score++
  if (/[A-Z]/.test(password)) score++
  if (/[0-9]/.test(password)) score++
  if (/[^A-Za-z0-9]/.test(password)) score++
  return { level: score, label: ['', 'Weak', 'Fair', 'Good', 'Strong'][score] }
}
function getRequirements(password: string) {
  return [
    { label: 'At least 8 characters',       met: password.length >= 8 },
    { label: 'One uppercase letter (A–Z)',   met: /[A-Z]/.test(password) },
    { label: 'One number (0–9)',             met: /[0-9]/.test(password) },
    { label: 'One symbol  (e.g. !@#$%)',     met: /[^A-Za-z0-9]/.test(password) },
  ]
}
const strengthColors = ['', '#f87171', '#fb923c', '#facc15', '#34d399']
const strengthClasses = ['', 'active-weak', 'active-fair', 'active-good', 'active-strong']

function ResetPasswordForm() {
  const searchParams = useSearchParams()
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirm, setShowConfirm] = useState(false)
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [sessionReady, setSessionReady] = useState(false)
  const [isPending, startTransition] = useTransition()

  const strength = getPasswordStrength(password)
  const passwordsMatch     = confirmPassword === '' || password === confirmPassword
  const requirements       = getRequirements(password)
  const allRequirementsMet = requirements.every(r => r.met)

  // Exchange the token from the URL for a session
  useEffect(() => {
    const code = searchParams.get('code')
    if (!code) {
      setError('Invalid or expired reset link. Please request a new one.')
      return
    }

    const supabase = createClient()
    supabase.auth.exchangeCodeForSession(code).then(({ error }) => {
      if (error) {
        setError('This reset link has expired or already been used. Please request a new one.')
      } else {
        setSessionReady(true)
      }
    })
  }, [searchParams])

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setError(null)

    if (password !== confirmPassword) { setError('Passwords do not match.'); return }
    if (!allRequirementsMet) {
      const failed = requirements.find(r => !r.met)
      setError(failed ? `${failed.label} is required.` : 'Password does not meet requirements.')
      return
    }

    const formData = new FormData(e.currentTarget)
    startTransition(async () => {
      const result = await resetPassword(formData)
      if (result?.error) setError(result.error)
    })
  }

  return (
    <main className="auth-page">
      <div className="auth-grid" />
      <div className="auth-card">
        {/* Logo */}
        <div className="auth-logo">
          <div className="auth-logo-icon"><ShieldIcon /></div>
          <span className="auth-logo-text">VoiceGuard</span>
        </div>

        <h1 className="auth-title">Set new password</h1>
        <p className="auth-subtitle">
          Choose a strong password to secure your VoiceGuard account.
        </p>

        {error && (
          <div className="error-banner" style={{ marginBottom: '1rem' }}>
            <AlertIcon /><span>{error}</span>
          </div>
        )}

        {!sessionReady && !error && (
          <div style={{ textAlign: 'center', padding: '2rem 0', color: 'var(--text-muted)', fontSize: '0.9rem' }}>
            <span className="auth-btn-spinner" style={{ marginRight: 8 }} />
            Verifying reset link…
          </div>
        )}

        {sessionReady && (
          <form id="reset-password-form" className="auth-form" onSubmit={handleSubmit}>
            {/* New Password */}
            <div className="form-group">
              <label htmlFor="reset-password" className="form-label">New password</label>
              <div className="form-input-wrapper">
                <input
                  id="reset-password"
                  name="password"
                  type={showPassword ? 'text' : 'password'}
                  required
                  placeholder="Min. 8 characters"
                  className="form-input"
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  disabled={isPending}
                  style={{ paddingRight: '48px' }}
                />
                <span className="form-input-icon"><LockIcon /></span>
                <button type="button" className="password-toggle" onClick={() => setShowPassword(v => !v)} aria-label="Toggle password">
                  {showPassword ? <EyeOffIcon /> : <EyeIcon />}
                </button>
              </div>
              {password && (
                <div>
                  <div className="strength-meter">
                    {[1,2,3,4].map(i => (
                      <div key={i} className={`strength-bar ${strength.level >= i ? strengthClasses[strength.level] : ''}`} />
                    ))}
                  </div>
                  <p className="strength-label" style={{ color: strength.level > 0 ? strengthColors[strength.level] : undefined }}>
                    {strength.label}
                  </p>
                  {/* Requirements checklist */}
                  <div style={{ marginTop: '8px', display: 'flex', flexDirection: 'column', gap: 4 }}>
                    {requirements.map(req => (
                      <div key={req.label} style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: '.78rem', fontWeight: 500, color: req.met ? '#22c55e' : '#94a3b8' }}>
                        <span style={{ fontSize: '.7rem', fontWeight: 800, width: 14, textAlign: 'center' }}>{req.met ? '✓' : '✗'}</span>
                        <span>{req.label}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Confirm Password */}
            <div className="form-group">
              <label htmlFor="reset-confirm" className="form-label">Confirm new password</label>
              <div className="form-input-wrapper">
                <input
                  id="reset-confirm"
                  name="confirmPassword"
                  type={showConfirm ? 'text' : 'password'}
                  required
                  placeholder="••••••••"
                  className="form-input"
                  value={confirmPassword}
                  onChange={e => setConfirmPassword(e.target.value)}
                  disabled={isPending}
                  style={{ paddingRight: '48px', borderColor: !passwordsMatch ? 'rgba(248,113,113,0.5)' : undefined }}
                />
                <span className="form-input-icon"><LockIcon /></span>
                <button type="button" className="password-toggle" onClick={() => setShowConfirm(v => !v)} aria-label="Toggle confirm password">
                  {showConfirm ? <EyeOffIcon /> : <EyeIcon />}
                </button>
              </div>
              {!passwordsMatch && (
                <p style={{ fontSize: '0.78rem', color: 'var(--error)', marginTop: 4 }}>Passwords do not match</p>
              )}
            </div>

            <button
              id="reset-submit"
              type="submit"
              className="auth-btn"
              disabled={isPending || !passwordsMatch || (password.length > 0 && !allRequirementsMet)}
            >
              {isPending && <span className="auth-btn-spinner" />}
              {isPending ? 'Updating password…' : 'Update password'}
            </button>
          </form>
        )}

        {/* Link to go back if token is invalid */}
        {error && (
          <p className="auth-footer">
            <a href="/forgot-password" className="auth-link">Request a new reset link</a>
          </p>
        )}
      </div>
    </main>
  )
}

export default function ResetPasswordPage() {
  return (
    <Suspense fallback={
      <main className="auth-page">
        <div className="auth-grid" />
        <div className="auth-card" style={{ textAlign: 'center', color: 'var(--text-muted)' }}>
          Loading…
        </div>
      </main>
    }>
      <ResetPasswordForm />
    </Suspense>
  )
}
