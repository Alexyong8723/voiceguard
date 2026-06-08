export default function VerifyEmailPage() {
  return (
    <main className="auth-page">
      <div className="auth-grid" />
      <div className="auth-card" style={{ textAlign: 'center' }}>
        {/* Icon */}
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
        <p className="auth-subtitle" style={{ marginBottom: '2rem' }}>
          We&apos;ve sent a confirmation link to your email address. Click the link to activate your VoiceGuard account.
        </p>

        <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>
          Didn&apos;t receive an email? Check your spam folder or{' '}
          <a href="/signup" style={{ color: 'var(--accent-primary)', textDecoration: 'none' }}>
            try again
          </a>.
        </p>
      </div>
    </main>
  )
}
