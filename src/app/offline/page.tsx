'use client'

export default function OfflinePage() {
  return (
    <div style={{
      minHeight: '100vh',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      background: 'linear-gradient(145deg, #eef2ff 0%, #f4f6fb 40%, #eaf0ff 100%)',
      fontFamily: "'Inter', sans-serif",
      padding: '2rem',
      textAlign: 'center',
    }}>
      <div style={{
        width: 80, height: 80,
        borderRadius: 22,
        background: 'linear-gradient(135deg, #003580, #1a4fa0)',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        marginBottom: '1.5rem',
        boxShadow: '0 8px 32px rgba(0,53,128,0.25)',
      }}>
        <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
        </svg>
      </div>

      <h1 style={{ fontSize: '1.75rem', fontWeight: 800, color: '#003580', marginBottom: '0.5rem', letterSpacing: '-0.03em' }}>
        You&apos;re Offline
      </h1>
      <p style={{ color: '#3d5080', fontSize: '1rem', lineHeight: 1.6, maxWidth: 320, marginBottom: '2rem' }}>
        VoiceGuard needs an internet connection to detect deepfake audio. Please check your connection and try again.
      </p>

      <button
        onClick={() => window.location.reload()}
        style={{
          padding: '12px 32px',
          borderRadius: 12,
          border: 'none',
          background: 'linear-gradient(135deg, #003580, #1a4fa0)',
          color: 'white',
          fontWeight: 700,
          fontSize: '1rem',
          cursor: 'pointer',
          boxShadow: '0 4px 18px rgba(0,53,128,0.30)',
          fontFamily: "'Inter', sans-serif",
        }}
      >
        Try Again
      </button>
    </div>
  )
}
