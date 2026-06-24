'use client'

import { useState, useTransition, Suspense } from 'react'
import { useSearchParams, useRouter } from 'next/navigation'
import { confirmMfaReset } from '@/app/auth/actions'

const ShieldIcon = () => (
  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
  </svg>
)

const AlertIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="12" cy="12" r="10" />
    <line x1="12" y1="8" x2="12" y2="12" />
    <line x1="12" y1="16" x2="12.01" y2="16" />
  </svg>
)

function ResetMfaForm() {
  const searchParams = useSearchParams()
  const router = useRouter()
  const token = searchParams.get('token')

  const [isPending, startTransition] = useTransition()
  const [error, setError] = useState<string | null>(null)

  if (!token) {
    return (
      <div className="reset-state error">
        <AlertIcon />
        <h3>Invalid Link</h3>
        <p>The link you clicked is invalid or missing the required token.</p>
        <button onClick={() => router.push('/login')} className="btn-primary" style={{ marginTop: '1.5rem' }}>
          Back to Login
        </button>
      </div>
    )
  }

  function handleConfirm(e: React.FormEvent) {
    e.preventDefault()
    setError(null)
    const fd = new FormData()
    fd.append('token', token!)
    
    startTransition(async () => {
      const res = await confirmMfaReset(fd)
      if (res?.error) {
        setError(res.error)
      }
    })
  }

  return (
    <form onSubmit={handleConfirm} className="reset-state">
      <div className="icon-wrap warning">
        <ShieldIcon />
      </div>
      <h3>Remove Authenticator App</h3>
      <p>Are you sure you want to remove the Authenticator App from your account? You will be signed out and need to log in again.</p>
      
      {error && (
        <div className="error-box">
          <AlertIcon />
          <span>{error}</span>
        </div>
      )}

      <div className="action-buttons">
        <button type="submit" className="btn-primary btn-danger" disabled={isPending}>
          {isPending ? 'Removing...' : 'Confirm Removal'}
        </button>
        <button type="button" onClick={() => router.push('/login')} className="btn-secondary" disabled={isPending}>
          Cancel
        </button>
      </div>
    </form>
  )
}

export default function ResetMfaPage() {
  return (
    <main className="reset-page">
      <div className="reset-card">
        <Suspense fallback={<div style={{ textAlign: 'center', color: '#8898bb' }}>Loading...</div>}>
          <ResetMfaForm />
        </Suspense>
      </div>

      <style>{`
        .reset-page {
          min-height: 100vh;
          background: #f8faff;
          display: flex;
          align-items: center;
          justify-content: center;
          padding: 2rem;
          font-family: 'Inter', sans-serif;
        }
        .reset-card {
          background: #fff;
          max-width: 440px;
          width: 100%;
          border-radius: 20px;
          box-shadow: 0 4px 24px rgba(0, 53, 128, 0.08);
          border: 1px solid rgba(0, 53, 128, 0.1);
          padding: 2.5rem;
          text-align: center;
        }
        .reset-state h3 {
          margin: 1.5rem 0 0.5rem;
          color: #0d1a3a;
          font-weight: 800;
          font-size: 1.25rem;
        }
        .reset-state p {
          color: #3d5080;
          line-height: 1.5;
          font-size: 0.95rem;
          margin-bottom: 2rem;
        }
        .icon-wrap {
          width: 56px;
          height: 56px;
          border-radius: 16px;
          display: flex;
          align-items: center;
          justify-content: center;
          margin: 0 auto;
          box-shadow: 0 4px 12px rgba(204, 0, 1, 0.2);
        }
        .icon-wrap.warning {
          background: linear-gradient(135deg, #CC0001, #a00001);
          color: white;
        }
        .error-box {
          background: rgba(204, 0, 1, 0.08);
          color: #CC0001;
          padding: 12px 16px;
          border-radius: 10px;
          font-size: 0.9rem;
          font-weight: 700;
          margin-bottom: 1.5rem;
          border: 1.5px solid rgba(204, 0, 1, 0.2);
          display: flex;
          align-items: center;
          gap: 8px;
          text-align: left;
        }
        .action-buttons {
          display: flex;
          flex-direction: column;
          gap: 12px;
        }
        .btn-primary {
          background: linear-gradient(135deg, #003580, #1a4fa0);
          color: #fff;
          border: none;
          padding: 14px;
          border-radius: 10px;
          font-weight: 700;
          cursor: pointer;
          transition: opacity 0.2s;
          font-size: 0.95rem;
        }
        .btn-primary:hover:not(:disabled) {
          opacity: 0.9;
        }
        .btn-primary:disabled {
          opacity: 0.5;
          cursor: not-allowed;
        }
        .btn-danger {
          background: linear-gradient(135deg, #CC0001, #a00001);
          box-shadow: 0 4px 12px rgba(204, 0, 1, 0.2);
        }
        .btn-secondary {
          background: rgba(0, 53, 128, 0.05);
          color: #3d5080;
          border: 1px solid rgba(0, 53, 128, 0.15);
          padding: 14px;
          border-radius: 10px;
          font-weight: 700;
          cursor: pointer;
          transition: background 0.2s;
          font-size: 0.95rem;
        }
        .btn-secondary:hover:not(:disabled) {
          background: rgba(0, 53, 128, 0.1);
        }
        .btn-secondary:disabled {
          opacity: 0.5;
          cursor: not-allowed;
        }
      `}</style>
    </main>
  )
}
