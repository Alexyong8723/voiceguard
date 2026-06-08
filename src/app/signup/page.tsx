'use client'

import { useState, useTransition } from 'react'
import Link from 'next/link'
import { signup } from '@/app/auth/actions'
import { useLang, LanguageSwitcher } from '@/lib/LanguageContext'

// ── Icons ─────────────────────────────────────────────────────────────────────
const ShieldIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
  </svg>
)
const UserIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
    <circle cx="12" cy="7" r="4" />
  </svg>
)
const MailIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <rect x="2" y="4" width="20" height="16" rx="2" />
    <path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7" />
  </svg>
)
const LockIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
    <path d="M7 11V7a5 5 0 0 1 10 0v4" />
  </svg>
)
const EyeIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
    <circle cx="12" cy="12" r="3" />
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
    <circle cx="12" cy="12" r="10" />
    <line x1="12" y1="8" x2="12" y2="12" />
    <line x1="12" y1="16" x2="12.01" y2="16" />
  </svg>
)

const strengthColors = ['', '#f87171', '#fb923c', '#facc15', '#34d399']
const strengthClasses = ['', 'active-weak', 'active-fair', 'active-good', 'active-strong']

function getPasswordStrength(password: string): number {
  if (!password) return 0
  let score = 0
  if (password.length >= 8) score++
  if (/[A-Z]/.test(password)) score++
  if (/[0-9]/.test(password)) score++
  if (/[^A-Za-z0-9]/.test(password)) score++
  return score
}

function getRequirements(password: string) {
  return [
    { label: 'At least 8 characters',       met: password.length >= 8 },
    { label: 'One uppercase letter (A–Z)',   met: /[A-Z]/.test(password) },
    { label: 'One number (0–9)',             met: /[0-9]/.test(password) },
    { label: 'One symbol  (e.g. !@#$%)',     met: /[^A-Za-z0-9]/.test(password) },
  ]
}

export default function SignupPage() {
  const { t } = useLang()
  const [showPassword,    setShowPassword]    = useState(false)
  const [showConfirm,     setShowConfirm]     = useState(false)
  const [password,        setPassword]        = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [error,           setError]           = useState<string | null>(null)
  const [isPending,       startTransition]    = useTransition()

  const strengthLevel      = getPasswordStrength(password)
  const strengthLabels     = ['', t('signup_pw_weak'), t('signup_pw_fair'), t('signup_pw_good'), t('signup_pw_strong')]
  const passwordsMatch     = confirmPassword === '' || password === confirmPassword
  const requirements       = getRequirements(password)
  const allRequirementsMet = requirements.every(r => r.met)

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setError(null)

    if (password !== confirmPassword) { setError(t('signup_pw_mismatch')); return }
    if (!allRequirementsMet) {
      const failed = requirements.find(r => !r.met)
      setError(failed ? `${failed.label} is required.` : t('signup_pw_short'))
      return
    }

    const formData = new FormData(e.currentTarget)
    startTransition(async () => {
      const result = await signup(formData)
      if (result?.error) setError(result.error)
    })
  }

  return (
    <main className="auth-page">
      <div className="auth-grid" />

      <div className="auth-card">
        {/* Language switcher */}
        <div style={{ display:'flex', justifyContent:'flex-end', marginBottom:'1rem' }}>
          <LanguageSwitcher />
        </div>

        {/* Logo */}
        <div className="auth-logo">
          <div className="auth-logo-icon"><ShieldIcon /></div>
          <span className="auth-logo-text">VoiceGuard</span>
        </div>

        {/* Header */}
        <h1 className="auth-title">{t('signup_title')}</h1>
        <p className="auth-subtitle">{t('signup_subtitle')}</p>

        {/* Error */}
        {error && (
          <div className="error-banner" role="alert" style={{ marginBottom:'1rem' }}>
            <AlertIcon />
            <span>{error}</span>
          </div>
        )}

        {/* Form */}
        <form id="signup-form" className="auth-form" onSubmit={handleSubmit}>

          {/* Full Name */}
          <div className="form-group">
            <label htmlFor="signup-name" className="form-label">{t('signup_fullname')}</label>
            <div className="form-input-wrapper">
              <input
                id="signup-name"
                name="fullName"
                type="text"
                required
                autoComplete="name"
                placeholder={t('signup_fullname_ph')}
                className="form-input"
                disabled={isPending}
              />
              <span className="form-input-icon"><UserIcon /></span>
            </div>
          </div>

          {/* Email */}
          <div className="form-group">
            <label htmlFor="signup-email" className="form-label">{t('signup_email')}</label>
            <div className="form-input-wrapper">
              <input
                id="signup-email"
                name="email"
                type="email"
                required
                autoComplete="email"
                placeholder={t('signup_email_ph')}
                className="form-input"
                disabled={isPending}
              />
              <span className="form-input-icon"><MailIcon /></span>
            </div>
          </div>

          {/* Password */}
          <div className="form-group">
            <label htmlFor="signup-password" className="form-label">{t('signup_password')}</label>
            <div className="form-input-wrapper">
              <input
                id="signup-password"
                name="password"
                type={showPassword ? 'text' : 'password'}
                required
                autoComplete="new-password"
                placeholder={t('signup_password_ph')}
                className="form-input"
                value={password}
                onChange={e => setPassword(e.target.value)}
                disabled={isPending}
                style={{ paddingRight:'48px' }}
              />
              <span className="form-input-icon"><LockIcon /></span>
              <button type="button" className="password-toggle"
                onClick={() => setShowPassword(v => !v)}
                aria-label={showPassword ? 'Hide password' : 'Show password'}>
                {showPassword ? <EyeOffIcon /> : <EyeIcon />}
              </button>
            </div>

            {/* Strength meter */}
            {password && (
              <div>
                <div className="strength-meter">
                  {[1, 2, 3, 4].map(i => (
                    <div key={i}
                      className={`strength-bar ${strengthLevel >= i ? strengthClasses[strengthLevel] : ''}`} />
                  ))}
                </div>
                <p className="strength-label"
                  style={{ color: strengthLevel > 0 ? strengthColors[strengthLevel] : undefined }}>
                  {strengthLabels[strengthLevel]}
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
            <label htmlFor="signup-confirm" className="form-label">{t('signup_confirm')}</label>
            <div className="form-input-wrapper">
              <input
                id="signup-confirm"
                name="confirmPassword"
                type={showConfirm ? 'text' : 'password'}
                required
                autoComplete="new-password"
                placeholder={t('signup_confirm_ph')}
                className="form-input"
                value={confirmPassword}
                onChange={e => setConfirmPassword(e.target.value)}
                disabled={isPending}
                style={{
                  paddingRight: '48px',
                  borderColor: !passwordsMatch ? 'rgba(248,113,113,0.5)' : undefined,
                }}
              />
              <span className="form-input-icon"><LockIcon /></span>
              <button type="button" className="password-toggle"
                onClick={() => setShowConfirm(v => !v)}
                aria-label={showConfirm ? 'Hide confirm password' : 'Show confirm password'}>
                {showConfirm ? <EyeOffIcon /> : <EyeIcon />}
              </button>
            </div>
            {!passwordsMatch && (
              <p style={{ fontSize:'0.78rem', color:'var(--error)', marginTop:'4px' }}>
                {t('signup_pw_mismatch')}
              </p>
            )}
          </div>

          {/* Submit */}
          <button id="signup-submit" type="submit" className="auth-btn"
            disabled={isPending || !passwordsMatch || (password.length > 0 && !allRequirementsMet)}>
            {isPending && <span className="auth-btn-spinner" />}
            {isPending ? t('signup_btn_loading') : t('signup_btn')}
          </button>

          {/* Terms */}
          <p className="terms-text">
            {t('signup_terms_pre')}{' '}
            <a href="/terms" target="_blank" rel="noopener noreferrer">{t('signup_terms')}</a>{' '}
            {t('signup_and')}{' '}
            <a href="/privacy" target="_blank" rel="noopener noreferrer">{t('signup_privacy')}</a>.
          </p>
        </form>

        {/* Footer */}
        <p className="auth-footer">
          {t('signup_have_account')}{' '}
          <Link href="/login" className="auth-link">{t('signup_signin')}</Link>
        </p>
      </div>
    </main>
  )
}
