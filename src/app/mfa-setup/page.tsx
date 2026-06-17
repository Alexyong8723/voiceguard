'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import Link from 'next/link'

// Icons
const ShieldIcon = () => (
  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
  </svg>
)

export default function MfaSetupPage() {
  const router = useRouter()
  const supabase = createClient()

  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  
  const [existingFactors, setExistingFactors] = useState<any[]>([])
  
  const [factorId, setFactorId] = useState<string | null>(null)
  const [qrCode, setQrCode] = useState<string | null>(null)
  
  const [verifyCode, setVerifyCode] = useState('')
  const [verifying, setVerifying] = useState(false)

  const [aal1NeedsVerification, setAal1NeedsVerification] = useState(false)
  const [existingFactorId, setExistingFactorId] = useState<string | null>(null)
  
  const isMandatory = typeof window !== 'undefined' ? new URLSearchParams(window.location.search).get('mandatory') === 'true' : false

  useEffect(() => {
    async function checkExisting() {
      setLoading(true)
      const { data: { session }, error: sessionError } = await supabase.auth.getSession()
      
      if (sessionError || !session) {
        router.push('/login')
        return
      }

      // Check current AAL
      const { data: aal } = await supabase.auth.mfa.getAuthenticatorAssuranceLevel()
      const isAal1 = aal?.currentLevel === 'aal1'
      const needsAal2 = aal?.nextLevel === 'aal2'

      // Find existing TOTP factors using listFactors
      const { data: factorsData, error: factorsError } = await supabase.auth.mfa.listFactors()
      const factors = factorsData?.totp || []
      
      if (factors.length > 0) {
        // User has factors
        if (isAal1 && needsAal2) {
          // They need to verify their existing factor first
          setAal1NeedsVerification(true)
          setExistingFactorId(factors[0].id)
          setLoading(false)
          return
        }
        
        // If they are already AAL2 (or don't need it), let them re-configure
        setExistingFactors(factors)
      } else {
        // No active MFA, enroll automatically
        await startEnrollment()
      }
      setLoading(false)
    }
    checkExisting()
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  async function unenrollAll() {
    setLoading(true)
    setError(null)
    for (const factor of existingFactors) {
      await supabase.auth.mfa.unenroll({ factorId: factor.id })
    }
    setExistingFactors([])
    await startEnrollment()
    setLoading(false)
  }

  async function startEnrollment() {
    setError(null)
    
    // First, clean up any stuck "unverified" factors that might block new enrollments
    const { data: { session } } = await supabase.auth.getSession()
    if (session?.user.factors) {
      const unverifiedFactors = session.user.factors.filter(f => f.status === 'unverified')
      for (const f of unverifiedFactors) {
        await supabase.auth.mfa.unenroll({ factorId: f.id })
      }
    }

    const { data, error } = await supabase.auth.mfa.enroll({
      factorType: 'totp'
    })
    
    if (error) {
      setError(error.message)
      return
    }
    
    setFactorId(data.id)
    setQrCode(data.totp.qr_code)
  }

  async function handleVerify(e: React.FormEvent) {
    e.preventDefault()
    if (!factorId || verifyCode.length < 6) return
    
    setVerifying(true)
    setError(null)

    const challenge = await supabase.auth.mfa.challenge({ factorId })
    if (challenge.error) {
      setError(challenge.error.message)
      setVerifying(false)
      return
    }

    const verify = await supabase.auth.mfa.verify({
      factorId,
      challengeId: challenge.data.id,
      code: verifyCode
    })

    if (verify.error) {
      setError(verify.error.message)
      setVerifying(false)
      return
    }

    // Success! Redirect to dashboard
    router.push('/dashboard')
  }

  async function handleVerifyExisting(e: React.FormEvent) {
    e.preventDefault()
    if (!existingFactorId || verifyCode.length < 6) return
    
    setVerifying(true)
    setError(null)

    const challenge = await supabase.auth.mfa.challenge({ factorId: existingFactorId })
    if (challenge.error) {
      setError(challenge.error.message)
      setVerifying(false)
      return
    }

    const verify = await supabase.auth.mfa.verify({
      factorId: existingFactorId,
      challengeId: challenge.data.id,
      code: verifyCode
    })

    if (verify.error) {
      setError(verify.error.message)
      setVerifying(false)
      return
    }

    // Successfully verified! Now they are AAL2 and can re-configure.
    setAal1NeedsVerification(false)
    setVerifyCode('')
    setVerifying(false)
    
    // Refresh factor list and let them unenroll
    const { data: factorsData } = await supabase.auth.mfa.listFactors()
    setExistingFactors(factorsData?.totp || [])
  }

  return (
    <div className="mfa-page">
      <div className="mfa-card">
        <div className="mfa-header">
          <div className="icon-wrap">
            <ShieldIcon />
          </div>
          <h1>Authenticator Setup</h1>
        </div>

        {error && (
          <div className="error-box">{error}</div>
        )}

        {loading ? (
          <div className="loading-state">Loading secure environment...</div>
        ) : aal1NeedsVerification ? (
          <div className="setup-state">
            <div className="step-box">
              <span className="step-num">!</span>
              <div>
                <h3>Verification Required</h3>
                <p>Before you can change your Authenticator App, you must verify your identity using your current one.</p>
              </div>
            </div>

            <form onSubmit={handleVerifyExisting} className="verify-form" style={{ marginTop: '1.5rem' }}>
              <input
                type="text"
                placeholder="000000"
                maxLength={6}
                value={verifyCode}
                onChange={(e) => setVerifyCode(e.target.value.replace(/\D/g, ''))}
                required
              />
              <button type="submit" className="btn-primary" disabled={verifying || verifyCode.length < 6}>
                {verifying ? 'Verifying...' : 'Verify Existing Authenticator'}
              </button>
            </form>
            
            {!isMandatory && <Link href="/dashboard" className="cancel-link">Cancel</Link>}
          </div>
        ) : existingFactors.length > 0 ? (
          <div className="existing-state">
            <p>You already have an Authenticator App protecting your account.</p>
            <p className="warning-text">If you want to re-configure it, this will invalidate your old authenticator. You will need to scan a new QR code.</p>
            
            <div className="action-buttons">
              <button onClick={unenrollAll} className="btn-primary btn-danger">Remove & Re-configure</button>
              {!isMandatory && <Link href="/dashboard" className="btn-secondary">Cancel</Link>}
            </div>
          </div>
        ) : qrCode ? (
          <div className="setup-state">
            <div className="step-box">
              <span className="step-num">1</span>
              <div>
                <h3>Scan this QR Code</h3>
                <p>Open Microsoft Authenticator or Google Authenticator and scan this code.</p>
              </div>
            </div>
            
            <div className="qr-container">
              <img src={qrCode} alt="Authenticator QR Code" />
            </div>

            <div className="step-box">
              <span className="step-num">2</span>
              <div>
                <h3>Enter the 6-digit code</h3>
                <p>Type the code generated by your app to verify the setup.</p>
              </div>
            </div>

            <form onSubmit={handleVerify} className="verify-form">
              <input
                type="text"
                placeholder="000000"
                maxLength={6}
                value={verifyCode}
                onChange={(e) => setVerifyCode(e.target.value.replace(/\D/g, ''))}
                required
              />
              <button type="submit" className="btn-primary" disabled={verifying || verifyCode.length < 6}>
                {verifying ? 'Verifying...' : 'Verify & Activate'}
              </button>
            </form>
            
            {!isMandatory && <Link href="/dashboard" className="cancel-link">Cancel Setup</Link>}
          </div>
        ) : null}

      </div>
      
      <style>{`
        .mfa-page {
          min-height: 100vh;
          background: var(--bg-primary, #f8faff);
          display: flex;
          align-items: center;
          justify-content: center;
          padding: 2rem;
          font-family: 'Inter', sans-serif;
        }
        .mfa-card {
          background: #fff;
          max-width: 460px;
          width: 100%;
          border-radius: 20px;
          box-shadow: 0 4px 24px rgba(0, 53, 128, 0.08);
          border: 1px solid rgba(0, 53, 128, 0.1);
          padding: 2.5rem;
        }
        .mfa-header {
          display: flex;
          align-items: center;
          gap: 14px;
          color: #003580;
          margin-bottom: 1.5rem;
          padding-bottom: 1.5rem;
          border-bottom: 1px solid rgba(0, 53, 128, 0.1);
        }
        .icon-wrap {
          background: linear-gradient(135deg, #003580, #1a4fa0);
          color: white;
          width: 44px;
          height: 44px;
          border-radius: 12px;
          display: flex;
          align-items: center;
          justify-content: center;
          box-shadow: 0 4px 12px rgba(0, 53, 128, 0.2);
        }
        .mfa-header h1 {
          font-size: 1.3rem;
          font-weight: 800;
          margin: 0;
          letter-spacing: -0.02em;
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
        }
        .loading-state {
          color: #8898bb;
          text-align: center;
          font-weight: 600;
          padding: 3rem 0;
          font-size: 0.95rem;
        }
        .existing-state p {
          color: #3d5080;
          line-height: 1.6;
          margin-bottom: 1rem;
          font-size: 0.95rem;
        }
        .warning-text {
          color: #d97706 !important;
          font-weight: 600;
          background: rgba(245, 158, 11, 0.1);
          padding: 12px;
          border-radius: 8px;
          border: 1px solid rgba(245, 158, 11, 0.2);
        }
        .action-buttons {
          display: flex;
          flex-direction: column;
          gap: 10px;
          margin-top: 1.5rem;
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
          text-align: center;
          text-decoration: none;
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
          text-align: center;
          text-decoration: none;
          font-size: 0.95rem;
        }
        .btn-secondary:hover {
          background: rgba(0, 53, 128, 0.1);
        }
        .step-box {
          display: flex;
          gap: 14px;
          margin-bottom: 1.2rem;
          margin-top: 1.5rem;
        }
        .step-num {
          background: rgba(0, 53, 128, 0.1);
          color: #003580;
          width: 28px;
          height: 28px;
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          font-weight: 800;
          font-size: 0.9rem;
          flex-shrink: 0;
          margin-top: 2px;
        }
        .step-box h3 {
          margin: 0 0 4px 0;
          font-size: 1.05rem;
          color: #0d1a3a;
          font-weight: 800;
        }
        .step-box p {
          margin: 0;
          font-size: 0.85rem;
          color: #8898bb;
          line-height: 1.5;
        }
        .qr-container {
          background: #fff;
          border: 2px dashed rgba(0, 53, 128, 0.15);
          border-radius: 16px;
          padding: 1.5rem;
          display: flex;
          justify-content: center;
          margin-bottom: 1.5rem;
        }
        .qr-container img {
          width: 220px;
          height: 220px;
        }
        .verify-form {
          display: flex;
          flex-direction: column;
          gap: 14px;
        }
        .verify-form input {
          padding: 14px;
          border-radius: 10px;
          border: 1.5px solid rgba(0, 53, 128, 0.2);
          font-size: 1.5rem;
          letter-spacing: 0.25em;
          text-align: center;
          font-weight: 800;
          color: #003580;
          outline: none;
          background: #f8faff;
        }
        .verify-form input:focus {
          border-color: #003580;
          box-shadow: 0 0 0 3px rgba(0, 53, 128, 0.1);
        }
        .cancel-link {
          display: block;
          text-align: center;
          margin-top: 1.5rem;
          color: #8898bb;
          text-decoration: none;
          font-weight: 700;
          font-size: 0.9rem;
        }
        .cancel-link:hover {
          color: #3d5080;
        }
      `}</style>
    </div>
  )
}
