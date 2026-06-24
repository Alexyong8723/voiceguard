'use client'

import { useState, useTransition, Suspense, useRef } from 'react'
import { useSearchParams, useRouter } from 'next/navigation'
import Link from 'next/link'
import { login, sendLoginOtp, verifyLoginOtp, verifyLoginMfa, requestMfaReset } from '@/app/auth/actions'
import { useLang, LanguageSwitcher } from '@/lib/LanguageContext'
import { createClient } from '@/lib/supabase/client'

// ── Icons ─────────────────────────────────────────────────────────────────────
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
const CheckIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M20 6 9 17l-5-5" />
  </svg>
)
const KeyIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="7.5" cy="15.5" r="5.5"/>
    <path d="m21 2-9.6 9.6"/>
    <path d="m15.5 7.5 3 3L22 7l-3-3"/>
  </svg>
)
const ArrowLeftIcon = () => (
  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
    <path d="m12 19-7-7 7-7"/><path d="M19 12H5"/>
  </svg>
)
const GoogleIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
    <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
    <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
    <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
  </svg>
)

// ── "I'm not a robot" Captcha Widget ─────────────────────────────────────────
type CaptchaState = 'idle' | 'checking' | 'verified'

function CaptchaWidget({
  onVerified, hasError,
}: { onVerified: (v: boolean) => void; hasError: boolean }) {
  const [state, setState] = useState<CaptchaState>('idle')

  function handleClick() {
    if (state === 'verified') return
    setState('checking')
    setTimeout(() => { setState('verified'); onVerified(true) }, 1200)
  }

  const widgetClass = [
    'captcha-widget',
    state === 'verified' ? 'captcha-verified' : '',
    hasError ? 'captcha-error-state' : '',
  ].filter(Boolean).join(' ')

  return (
    <div
      id="captcha-widget"
      role="checkbox"
      aria-checked={state === 'verified'}
      aria-label="I'm not a robot verification"
      className={widgetClass}
      onClick={handleClick}
      onKeyDown={e => { if (e.key === ' ' || e.key === 'Enter') handleClick() }}
      tabIndex={0}
    >
      <div className="captcha-left">
        <div className={`captcha-checkbox${state === 'checking' ? ' checking' : ''}${state === 'verified' ? ' checked' : ''}`}>
          {state === 'checking' && <div className="captcha-spinner" />}
        </div>
        <span className="captcha-label">
          {state === 'verified' ? "Verified — you're not a robot" : "I'm not a robot"}
        </span>
      </div>
      <div className="captcha-brand">
        <span className="captcha-brand-logo">🛡️</span>
        <span className="captcha-brand-text">VoiceGuard</span>
        <span className="captcha-brand-sub">Security Check</span>
      </div>
    </div>
  )
}

// ── OTP Code Input (6 individual boxes) ──────────────────────────────────────
function OtpInput({ value, onChange }: { value: string; onChange: (v: string) => void }) {
  const inputsRef = useRef<(HTMLInputElement | null)[]>([])

  function handleChange(i: number, v: string) {
    const digit = v.replace(/\D/g, '').slice(-1)
    const arr = value.padEnd(6, ' ').split('')
    arr[i] = digit || ' '
    const next = arr.join('').replace(/ /g, '')
    onChange(arr.map(c => c === ' ' ? '' : c).join(''))
    if (digit && i < 5) inputsRef.current[i + 1]?.focus()
  }

  function handleKeyDown(i: number, e: React.KeyboardEvent) {
    if (e.key === 'Backspace') {
      if (!value[i] && i > 0) inputsRef.current[i - 1]?.focus()
    }
    if (e.key === 'ArrowLeft' && i > 0) inputsRef.current[i - 1]?.focus()
    if (e.key === 'ArrowRight' && i < 5) inputsRef.current[i + 1]?.focus()
  }

  function handlePaste(e: React.ClipboardEvent) {
    e.preventDefault()
    const pasted = e.clipboardData.getData('text').replace(/\D/g, '').slice(0, 6)
    onChange(pasted)
    inputsRef.current[Math.min(pasted.length, 5)]?.focus()
  }

  return (
    <div className="otp-boxes">
      {Array.from({ length: 6 }, (_, i) => (
        <input
          key={i}
          ref={el => { inputsRef.current[i] = el }}
          id={`otp-digit-${i}`}
          type="text"
          inputMode="numeric"
          maxLength={1}
          value={value[i] ?? ''}
          onChange={e => handleChange(i, e.target.value)}
          onKeyDown={e => handleKeyDown(i, e)}
          onPaste={handlePaste}
          className="otp-box"
          aria-label={`OTP digit ${i + 1}`}
          autoComplete={i === 0 ? 'one-time-code' : 'off'}
        />
      ))}
    </div>
  )
}

// ── Login Form ────────────────────────────────────────────────────────────────
function LoginForm() {
  const { t } = useLang()
  const searchParams = useSearchParams()
  const router       = useRouter()
  const resetSuccess = searchParams.get('reset') === 'success'

  // ── Shared state ──────────────────────────────────────────────────────────
  const [mode,          setMode]         = useState<'password' | 'otp'>('password')
  const [error,         setError]        = useState<string | null>(null)
  const [isPending,     startTransition] = useTransition()
  const [mfaRequired,   setMfaRequired]  = useState(false)
  const [mfaCode,       setMfaCode]      = useState('')
  const [mfaResetSent,  setMfaResetSent] = useState(false)

  // ── Password mode state ───────────────────────────────────────────────────
  const [showPassword,  setShowPassword] = useState(false)
  const [captchaOk,     setCaptchaOk]   = useState(false)
  const [captchaError,  setCaptchaError] = useState(false)

  // ── OTP mode state ────────────────────────────────────────────────────────
  const [otpEmail,      setOtpEmail]    = useState('')
  const [otpStep,       setOtpStep]     = useState<'email' | 'code'>('email')
  const [otpCode,       setOtpCode]     = useState('')
  const [otpSent,       setOtpSent]     = useState(false)
  const [resendCooldown,setResendCooldown] = useState(0)

  function switchMode(m: 'password' | 'otp') {
    setMode(m)
    setError(null)
    setOtpStep('email')
    setOtpCode('')
    setOtpSent(false)
  }

  // ── Google OAuth submit ───────────────────────────────────────────────────
  async function handleGoogleSignIn() {
    setError(null)
    const supabase = createClient()
    const { error } = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: {
        redirectTo: `${window.location.origin}/auth/callback`,
      },
    })
    if (error) setError(error.message)
  }

  // ── Password submit ───────────────────────────────────────────────────────
  async function handlePasswordSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setError(null)
    if (!captchaOk) {
      setCaptchaError(true)
      setError('Please complete the security check before signing in.')
      setTimeout(() => setCaptchaError(false), 1500)
      return
    }
    const formData = new FormData(e.currentTarget)
    startTransition(async () => {
      const result = await login(formData)
      if (!result) return
      if ('error' in result && result.error) { setError(result.error); return }
      if ('mfaRequired' in result && result.mfaRequired) {
        setMfaRequired(true)
        return
      }
    })
  }

  // ── MFA submit ────────────────────────────────────────────────────────────
  async function handleMfaSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setError(null)
    if (mfaCode.length < 6) {
      setError('Please enter all 6 digits.')
      return
    }
    const fd = new FormData()
    fd.append('code', mfaCode)
    startTransition(async () => {
      const result = await verifyLoginMfa(fd)
      if (result?.error) { setError(result.error); setMfaCode(''); return }
    })
  }

  async function handleMfaResetRequest() {
    setError(null)
    startTransition(async () => {
      const res = await requestMfaReset()
      if (res?.error) setError(res.error)
      else setMfaResetSent(true)
    })
  }



  // ── OTP: send code ────────────────────────────────────────────────────────
  async function handleSendOtp(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setError(null)
    const fd = new FormData()
    fd.append('email', otpEmail)
    startTransition(async () => {
      const result = await sendLoginOtp(fd)
      if (result?.error) { setError(result.error); return }
      setOtpStep('code')
      setOtpSent(true)
      startResendCooldown()
    })
  }

  // ── OTP: verify code ──────────────────────────────────────────────────────
  async function handleVerifyOtp(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setError(null)
    if (otpCode.length < 6) { setError('Please enter all 6 digits.'); return }
    const fd = new FormData()
    fd.append('email', otpEmail)
    fd.append('token', otpCode)
    startTransition(async () => {
      const result = await verifyLoginOtp(fd)
      if (result?.error) { setError(result.error); setOtpCode(''); return }
    })
  }

  // ── Resend cooldown timer ─────────────────────────────────────────────────
  function startResendCooldown() {
    setResendCooldown(60)
    const timer = setInterval(() => {
      setResendCooldown(c => {
        if (c <= 1) { clearInterval(timer); return 0 }
        return c - 1
      })
    }, 1000)
  }

  async function handleResend() {
    if (resendCooldown > 0) return
    setError(null)
    setOtpCode('')
    const fd = new FormData()
    fd.append('email', otpEmail)
    startTransition(async () => {
      const result = await sendLoginOtp(fd)
      if (result?.error) { setError(result.error); return }
      startResendCooldown()
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
        <h1 className="auth-title">{t('login_welcome')}</h1>
        <p className="auth-subtitle">{t('login_subtitle')}</p>

        {/* Mode tabs */}
        <div className="login-tabs">
          <button
            id="tab-password"
            className={`login-tab${mode === 'password' ? ' active' : ''}`}
            onClick={() => switchMode('password')}
            type="button"
          >
            <LockIcon />Password
          </button>
          <button
            id="tab-otp"
            className={`login-tab${mode === 'otp' ? ' active' : ''}`}
            onClick={() => switchMode('otp')}
            type="button"
          >
            <KeyIcon />Email OTP
          </button>
        </div>

        {/* Reset success banner */}
        {resetSuccess && (
          <div className="error-banner" role="status"
            style={{ background:'rgba(0,135,90,0.09)', borderColor:'rgba(0,135,90,0.25)', color:'#00875a', marginBottom:'1rem' }}>
            <CheckIcon /><span>{t('login_reset_success')}</span>
          </div>
        )}

        {/* Error banner */}
        {error && (
          <div className="error-banner" role="alert" style={{ marginBottom:'0.5rem' }}>
            <AlertIcon /><span>{error}</span>
          </div>
        )}

        <div className="auth-social-buttons" style={{ marginBottom: '1.5rem' }}>
          <button type="button" className="auth-btn google-btn" onClick={handleGoogleSignIn} disabled={isPending}>
            <GoogleIcon /> Continue with Google
          </button>
        </div>
        
        <div className="auth-divider">
          <span>OR</span>
        </div>

        {/* ── PASSWORD MODE ──────────────────────────────────────────────── */}
        {mode === 'password' && (
          mfaRequired ? (
            <form id="mfa-form" className="auth-form" onSubmit={handleMfaSubmit}>
              {mfaResetSent ? (
                <div className="otp-info-box" style={{ background:'rgba(0,135,90,.06)', borderColor:'rgba(0,135,90,.2)', color:'#00875a' }}>
                  <ShieldIcon />
                  <span><strong>Reset Link Sent!</strong><br />Check your email for instructions to remove your Authenticator App.</span>
                </div>
              ) : (
                <>
                  <div className="otp-info-box" style={{ background:'rgba(0,135,90,.06)', borderColor:'rgba(0,135,90,.2)', color:'#00875a' }}>
                    <ShieldIcon />
                    <span><strong>Authenticator App Required</strong><br />Please enter the 6-digit code from your authenticator app to continue.</span>
                  </div>
                  <div className="form-group" style={{ marginTop: '1.5rem' }}>
                    <label className="form-label" style={{ textAlign:'center', display:'block', marginBottom:'.75rem' }}>
                      Authenticator Code
                    </label>
                    <OtpInput value={mfaCode} onChange={setMfaCode} />
                  </div>
                  <button id="mfa-verify-btn" type="submit" className="auth-btn" disabled={isPending || mfaCode.length < 6}>
                    {isPending && <span className="auth-btn-spinner" />}
                    {isPending ? 'Verifying…' : 'Verify & Sign In'}
                  </button>
                  <div style={{ textAlign: 'center', marginTop: '1rem' }}>
                    <button type="button" className="otp-resend-btn" onClick={handleMfaResetRequest} disabled={isPending}>
                      Lost your authenticator?
                    </button>
                  </div>
                </>
              )}
              <div className="otp-actions" style={{ justifyContent: 'center' }}>
                <button type="button" className="otp-back-btn"
                  onClick={() => { setMfaRequired(false); setMfaCode(''); setError(null); setMfaResetSent(false); }}
                  disabled={isPending}>
                  <ArrowLeftIcon /> Back to Login
                </button>
              </div>
            </form>
          ) : (
            <form id="login-form" className="auth-form" onSubmit={handlePasswordSubmit}>
            <div className="form-group">
              <label htmlFor="login-email" className="form-label">{t('login_email')}</label>
              <div className="form-input-wrapper">
                <input
                  id="login-email" name="email" type="email" required
                  autoComplete="email" placeholder={t('login_email_ph')}
                  className="form-input" disabled={isPending}
                />
                <span className="form-input-icon"><MailIcon /></span>
              </div>
            </div>

            <div className="form-group">
              <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center' }}>
                <label htmlFor="login-password" className="form-label">{t('login_password')}</label>
                <div className="forgot-password">
                  <Link href="/forgot-password">{t('login_forgot')}</Link>
                </div>
              </div>
              <div className="form-input-wrapper">
                <input
                  id="login-password" name="password"
                  type={showPassword ? 'text' : 'password'}
                  required autoComplete="current-password"
                  placeholder="••••••••" className="form-input"
                  disabled={isPending} style={{ paddingRight:'48px' }}
                />
                <span className="form-input-icon"><LockIcon /></span>
                <button
                  type="button" className="password-toggle"
                  onClick={() => setShowPassword(v => !v)}
                  aria-label={showPassword ? 'Hide password' : 'Show password'}
                >
                  {showPassword ? <EyeOffIcon /> : <EyeIcon />}
                </button>
              </div>
            </div>

            <div className="form-group">
              <CaptchaWidget onVerified={setCaptchaOk} hasError={captchaError} />
            </div>

            <button id="login-submit" type="submit" className="auth-btn" disabled={isPending}>
              {isPending && <span className="auth-btn-spinner" />}
              {isPending ? t('login_btn_loading') : t('login_btn')}
            </button>
          </form>
          )
        )}

        {/* ── OTP MODE ───────────────────────────────────────────────────── */}
        {mode === 'otp' && (<>

          {/* Step 1 — enter email */}
          {otpStep === 'email' && (
            <form id="otp-email-form" className="auth-form" onSubmit={handleSendOtp}>
              <div className="otp-info-box">
                <KeyIcon />
                <span>We'll send a <strong>6-digit code</strong> to your email. No password needed.</span>
              </div>

              <div className="form-group">
                <label htmlFor="otp-email" className="form-label">{t('login_email')}</label>
                <div className="form-input-wrapper">
                  <input
                    id="otp-email" name="email" type="email" required
                    autoComplete="email" placeholder={t('login_email_ph')}
                    className="form-input" disabled={isPending}
                    value={otpEmail} onChange={e => setOtpEmail(e.target.value)}
                  />
                  <span className="form-input-icon"><MailIcon /></span>
                </div>
              </div>

              <button id="otp-send-btn" type="submit" className="auth-btn" disabled={isPending || !otpEmail}>
                {isPending && <span className="auth-btn-spinner" />}
                {isPending ? 'Sending…' : 'Send OTP Code'}
              </button>
            </form>
          )}

          {/* Step 2 — enter OTP code */}
          {otpStep === 'code' && (
            <form id="otp-verify-form" className="auth-form" onSubmit={handleVerifyOtp}>
              <div className="otp-sent-box">
                <div className="otp-sent-icon">📧</div>
                <div>
                  <div className="otp-sent-title">Code sent!</div>
                  <div className="otp-sent-sub">Check <strong>{otpEmail}</strong> for your 6-digit code. It expires in 10 minutes.</div>
                </div>
              </div>

              <div className="form-group">
                <label className="form-label" style={{ textAlign:'center', display:'block', marginBottom:'.75rem' }}>
                  Enter your 6-digit code
                </label>
                <OtpInput value={otpCode} onChange={setOtpCode} />
              </div>

              <button id="otp-verify-btn" type="submit" className="auth-btn"
                disabled={isPending || otpCode.length < 6}>
                {isPending && <span className="auth-btn-spinner" />}
                {isPending ? 'Verifying…' : 'Verify & Sign In'}
              </button>

              <div className="otp-actions">
                <button type="button" className="otp-back-btn"
                  onClick={() => { setOtpStep('email'); setOtpCode(''); setError(null) }}
                  disabled={isPending}>
                  <ArrowLeftIcon /> Change email
                </button>
                <button type="button" className="otp-resend-btn"
                  onClick={handleResend}
                  disabled={isPending || resendCooldown > 0}>
                  {resendCooldown > 0 ? `Resend in ${resendCooldown}s` : 'Resend code'}
                </button>
              </div>
            </form>
          )}
        </>)}

        {/* Footer */}
        <p className="auth-footer">
          {t('login_no_account')}{' '}
          <Link href="/signup" className="auth-link">{t('login_create')}</Link>
        </p>

        {/* Inline styles for new elements */}
        <style>{`
          /* ── Mode tabs ── */
          .login-tabs {
            display:flex; gap:6px;
            background:rgba(0,53,128,.06);
            border:1px solid rgba(0,53,128,.12);
            border-radius:12px; padding:4px;
            margin-bottom:1.25rem;
          }
          .login-tab {
            flex:1; display:flex; align-items:center; justify-content:center; gap:7px;
            padding:10px 12px; border-radius:9px; border:none; cursor:pointer;
            font-family:'Inter',sans-serif; font-size:.88rem; font-weight:600;
            color:#3d5080; background:none; transition:background .2s,color .2s,box-shadow .2s;
          }
          .login-tab:hover { background:rgba(0,53,128,.07); color:#003580; }
          .login-tab.active {
            background:#ffffff; color:#003580;
            box-shadow:0 2px 8px rgba(0,53,128,.15);
          }

          /* ── OTP info box ── */
          .otp-info-box {
            display:flex; align-items:flex-start; gap:10px;
            padding:12px 14px; border-radius:12px;
            background:rgba(0,53,128,.05);
            border:1px solid rgba(0,53,128,.15);
            font-size:.875rem; color:#3d5080; line-height:1.5;
            margin-bottom:1rem;
          }
          .otp-info-box svg { flex-shrink:0; margin-top:1px; color:#003580; }

          /* ── Sent confirmation box ── */
          .otp-sent-box {
            display:flex; align-items:flex-start; gap:12px;
            padding:12px 14px; border-radius:12px;
            background:rgba(0,135,90,.06);
            border:1px solid rgba(0,135,90,.2);
            margin-bottom:1rem;
          }
          .otp-sent-icon { font-size:1.4rem; flex-shrink:0; line-height:1; }
          .otp-sent-title { font-size:.9rem; font-weight:700; color:#00875a; margin-bottom:2px; }
          .otp-sent-sub   { font-size:.8rem; color:#3d5080; line-height:1.5; }

          /* ── 6-box OTP input ── */
          .otp-boxes {
            display:flex; gap:8px; justify-content:center; margin-bottom:.5rem;
          }
          .otp-box {
            width:46px; height:54px; border-radius:10px; text-align:center;
            font-size:1.4rem; font-weight:800; color:#0d1a3a;
            border:2px solid rgba(0,53,128,.2); background:#f8faff;
            font-family:'Inter',sans-serif; outline:none;
            transition:border-color .2s, box-shadow .2s;
            caret-color:transparent;
          }
          .otp-box:focus {
            border-color:#003580;
            box-shadow:0 0 0 3px rgba(0,53,128,.12);
            background:#fff;
          }
          .otp-box:not(:placeholder-shown) { border-color:rgba(0,53,128,.35); }

          /* ── OTP bottom actions ── */
          .otp-actions {
            display:flex; align-items:center; justify-content:space-between;
            margin-top:.75rem; gap:8px;
          }
          .otp-back-btn {
            display:inline-flex; align-items:center; gap:5px;
            background:none; border:none; cursor:pointer;
            font-family:'Inter',sans-serif; font-size:.82rem; font-weight:600;
            color:#8898bb; transition:color .15s; padding:4px 0;
          }
          .otp-back-btn:hover:not(:disabled) { color:#003580; }
          .otp-back-btn:disabled { opacity:.45; cursor:default; }
          .otp-resend-btn {
            background:none; border:none; cursor:pointer;
            font-family:'Inter',sans-serif; font-size:.82rem; font-weight:700;
            color:#003580; transition:opacity .15s; padding:4px 0;
          }
          .otp-resend-btn:hover:not(:disabled) { opacity:.7; }
          .otp-resend-btn:disabled { color:#8898bb; cursor:default; }

          /* ── Google Button & Divider ── */
          .google-btn {
            background-color: #ffffff;
            color: #3d5080;
            border: 1px solid rgba(0,53,128,.15);
            font-weight: 600;
            display: flex;
            align-items: center;
            justify-content: center;
            gap: 10px;
          }
          .google-btn:hover:not(:disabled) {
            background-color: #f8faff;
            box-shadow: 0 2px 8px rgba(0,53,128,.08);
          }
          .auth-divider {
            display: flex;
            align-items: center;
            text-align: center;
            margin-bottom: 1.5rem;
          }
          .auth-divider::before, .auth-divider::after {
            content: '';
            flex: 1;
            border-bottom: 1px solid rgba(0,53,128,.1);
          }
          .auth-divider span {
            padding: 0 10px;
            color: #8898bb;
            font-size: 0.8rem;
            font-weight: 600;
          }
        `}</style>
      </div>
    </main>
  )
}

export default function LoginPage() {
  return (
    <Suspense fallback={
      <main className="auth-page">
        <div className="auth-grid" />
        <div className="auth-card" style={{ textAlign:'center', color:'var(--text-muted)' }}>
          Loading…
        </div>
      </main>
    }>
      <LoginForm />
    </Suspense>
  )
}
