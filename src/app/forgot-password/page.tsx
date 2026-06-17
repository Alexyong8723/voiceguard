'use client'

import { useState, useTransition, useRef } from 'react'
import Link from 'next/link'
import { forgotPassword, verifyPasswordResetOtp } from '@/app/auth/actions'

const ShieldIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
  </svg>
)
const MailIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <rect x="2" y="4" width="20" height="16" rx="2" />
    <path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7" />
  </svg>
)
const AlertIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="12" cy="12" r="10" /><line x1="12" y1="8" x2="12" y2="12" /><line x1="12" y1="16" x2="12.01" y2="16" />
  </svg>
)
const ArrowLeftIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="m12 19-7-7 7-7" /><path d="M19 12H5" />
  </svg>
)

export default function ForgotPasswordPage() {
  const [error, setError] = useState<string | null>(null)
  const [sent, setSent] = useState(false)
  const [email, setEmail] = useState('')
  const [otp, setOtp] = useState(['', '', '', '', '', ''])
  const [isPending, startTransition] = useTransition()
  const [isVerifying, startVerifying] = useTransition()
  const inputs = useRef<(HTMLInputElement | null)[]>([])

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setError(null)
    const formData = new FormData(e.currentTarget)

    startTransition(async () => {
      const result = await forgotPassword(formData)
      if (result?.error) {
        setError(result.error)
      } else {
        setSent(true)
      }
    })
  }

  async function handleVerify(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setError(null)
    const code = otp.join('')
    if (code.length < 6) return

    const formData = new FormData()
    formData.append('email', email)
    formData.append('token', code)

    startVerifying(async () => {
      const result = await verifyPasswordResetOtp(formData)
      if (result?.error) {
        setError(result.error)
      }
    })
  }

  function handleOtpChange(index: number, value: string) {
    if (!/^\d*$/.test(value)) return
    const newOtp = [...otp]
    newOtp[index] = value
    setOtp(newOtp)
    if (value && index < 5) inputs.current[index + 1]?.focus()
  }

  function handleOtpKeyDown(index: number, e: React.KeyboardEvent<HTMLInputElement>) {
    if (e.key === 'Backspace' && !otp[index] && index > 0) {
      inputs.current[index - 1]?.focus()
    }
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

        {sent ? (
          /* ── OTP Verification State ── */
          <div style={{ textAlign: 'center' }}>
            <h1 className="auth-title" style={{ marginBottom: '0.75rem' }}>Enter Reset Code</h1>
            <p className="auth-subtitle" style={{ marginBottom: '1.5rem' }}>
              We sent a 6-digit code to <strong style={{ color: 'var(--text-primary)' }}>{email}</strong>.
            </p>

            {error && (
              <div className="error-banner" style={{ marginBottom: '1rem', textAlign: 'left' }}>
                <AlertIcon /><span>{error}</span>
              </div>
            )}

            <form onSubmit={handleVerify} className="auth-form" style={{ marginBottom: '1.5rem' }}>
              <div style={{ display: 'flex', gap: '8px', justifyContent: 'center', marginBottom: '1.5rem' }}>
                {otp.map((digit, i) => (
                  <input
                    key={i}
                    ref={el => { inputs.current[i] = el }}
                    type="text"
                    inputMode="numeric"
                    maxLength={1}
                    value={digit}
                    onChange={e => handleOtpChange(i, e.target.value)}
                    onKeyDown={e => handleOtpKeyDown(i, e)}
                    disabled={isVerifying}
                    style={{
                      width: '45px', height: '56px', fontSize: '1.5rem', textAlign: 'center',
                      fontWeight: 700, borderRadius: '12px', background: 'rgba(255,255,255,0.03)',
                      border: '1px solid rgba(255,255,255,0.1)', color: 'var(--text-primary)'
                    }}
                  />
                ))}
              </div>
              <button type="submit" className="auth-btn" disabled={isVerifying || otp.join('').length < 6}>
                {isVerifying ? 'Verifying…' : 'Verify Code'}
              </button>
            </form>

            <p style={{ fontSize: '0.825rem', color: 'var(--text-muted)', marginBottom: '1.5rem' }}>
              Didn&apos;t receive it? Check your spam folder or{' '}
              <button
                onClick={() => { setSent(false); setOtp(['', '', '', '', '', '']); setError(null) }}
                style={{ background: 'none', border: 'none', color: 'var(--accent-primary)', cursor: 'pointer', fontSize: 'inherit', fontWeight: 600 }}
              >
                try again
              </button>.
            </p>
            <Link href="/login" className="auth-link" style={{ fontSize: '0.875rem' }}>
              ← Back to Sign in
            </Link>
          </div>
        ) : (
          /* ── Form state ── */
          <>
            <h1 className="auth-title">Forgot password?</h1>
            <p className="auth-subtitle">
              Enter your email and we&apos;ll send you a 6-digit code to reset your password.
            </p>

            {error && (
              <div className="error-banner" style={{ marginBottom: '1rem' }}>
                <AlertIcon /><span>{error}</span>
              </div>
            )}

            <form id="forgot-password-form" className="auth-form" onSubmit={handleSubmit}>
              <div className="form-group">
                <label htmlFor="forgot-email" className="form-label">Email address</label>
                <div className="form-input-wrapper">
                  <input
                    id="forgot-email"
                    name="email"
                    type="email"
                    required
                    autoComplete="email"
                    placeholder="you@example.com"
                    className="form-input"
                    value={email}
                    onChange={e => setEmail(e.target.value)}
                    disabled={isPending}
                  />
                  <span className="form-input-icon"><MailIcon /></span>
                </div>
              </div>

              <button
                id="forgot-submit"
                type="submit"
                className="auth-btn"
                disabled={isPending}
              >
                {isPending && <span className="auth-btn-spinner" />}
                {isPending ? 'Sending…' : 'Send reset code'}
              </button>
            </form>

            <p className="auth-footer">
              <Link href="/login" className="auth-link" style={{ display: 'inline-flex', alignItems: 'center', gap: 6 }}>
                <ArrowLeftIcon /> Back to Sign in
              </Link>
            </p>
          </>
        )}
      </div>
    </main>
  )
}
