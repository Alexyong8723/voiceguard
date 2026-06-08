'use client'

import { useState, useTransition } from 'react'
import Link from 'next/link'
import { forgotPassword } from '@/app/auth/actions'

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
  const [isPending, startTransition] = useTransition()

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
          /* ── Success state ── */
          <div style={{ textAlign: 'center' }}>
            <div style={{
              width: 64, height: 64, borderRadius: '50%',
              background: 'rgba(99,102,241,0.15)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              margin: '0 auto 1.5rem',
              border: '1px solid rgba(99,102,241,0.3)'
            }}>
              <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="#6366f1" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <rect x="2" y="4" width="20" height="16" rx="2" />
                <path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7" />
              </svg>
            </div>
            <h1 className="auth-title" style={{ marginBottom: '0.75rem' }}>Check your inbox</h1>
            <p className="auth-subtitle" style={{ marginBottom: '1.5rem' }}>
              We sent a password reset link to <strong style={{ color: 'var(--text-primary)' }}>{email}</strong>.
              Click the link in the email to set a new password.
            </p>
            <p style={{ fontSize: '0.825rem', color: 'var(--text-muted)', marginBottom: '1.5rem', lineHeight: 1.6 }}>
              Didn&apos;t receive it? Check your spam folder or{' '}
              <button
                onClick={() => setSent(false)}
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
              Enter your email and we&apos;ll send you a link to reset your password.
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
                {isPending ? 'Sending…' : 'Send reset link'}
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
