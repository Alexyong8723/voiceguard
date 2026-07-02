'use client'

import { useState, useEffect } from 'react'
import { createPortal } from 'react-dom'
import { useLang, LanguageSwitcher } from '@/lib/LanguageContext'
import { createClient } from '@/lib/supabase/client'
import { logout } from '@/app/auth/actions'
import { fetchUserPoints, UserPoints } from '@/app/dashboard/quiz.actions'

// ── Icons ─────────────────────────────────────────────────────────────────────
const LogOutIcon = ({ s = 16 }: { s?: number }) => (
  <svg width={s} height={s} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/><polyline points="16 17 21 12 16 7"/><line x1="21" y1="12" x2="9" y2="12"/>
  </svg>
)
const XIcon = ({ s = 15 }: { s?: number }) => (
  <svg width={s} height={s} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>
  </svg>
)
const StarIcon = ({ s = 10 }: { s?: number }) => (
  <svg width={s} height={s} viewBox="0 0 24 24" fill="currentColor" stroke="none">
    <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/>
  </svg>
)
const SettingsKnob = ({ s = 14 }: { s?: number }) => (
  <svg width={s} height={s} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="12" cy="12" r="3"/><path d="M19.07 4.93a10 10 0 0 1 0 14.14M4.93 4.93a10 10 0 0 0 0 14.14"/>
  </svg>
)

// ── Types ─────────────────────────────────────────────────────────────────────
interface Props {
  userEmail?: string      // optional — fetched from Supabase if not provided
  displayName?: string
  userPoints?: UserPoints | null
}

const LEVEL_COLORS: Record<string, { color: string; bg: string; border: string }> = {
  Beginner: { color: '#94a3b8', bg: 'rgba(148,163,184,.12)', border: 'rgba(148,163,184,.25)' },
  Aware:    { color: '#34d399', bg: 'rgba(52,211,153,.12)',  border: 'rgba(52,211,153,.25)'  },
  Guardian: { color: '#60a5fa', bg: 'rgba(96,165,250,.12)',  border: 'rgba(96,165,250,.25)'  },
  Expert:   { color: '#a78bfa', bg: 'rgba(167,139,250,.12)', border: 'rgba(167,139,250,.25)' },
  Champion: { color: '#facc15', bg: 'rgba(250,204,21,.12)',  border: 'rgba(250,204,21,.25)'  },
}

// ── Component ─────────────────────────────────────────────────────────────────
export function SidebarUserPanel({ userEmail: emailProp, displayName: nameProp, userPoints: userPointsProp }: Props) {
  const { t } = useLang()
  const [open,       setOpen]       = useState(false)
  const [tab,        setTab]        = useState<'profile' | 'settings' | 'tnc' | 'guide'>('profile')
  const [userEmail,  setUserEmail]  = useState(emailProp ?? 'Loading...')
  const [displayName, setDisplayName] = useState(nameProp ?? '')
  const [userPts,    setUserPts]    = useState<UserPoints | null>(userPointsProp ?? null)

  // Settings state (persisted in localStorage)
  const [notifScamAlert,    setNotifScamAlert]    = useState(true)
  const [notifQuizRemind,   setNotifQuizRemind]   = useState(true)
  const [notifWeeklyDigest, setNotifWeeklyDigest] = useState(false)
  const [notifNewArticles,  setNotifNewArticles]  = useState(false)
  const [dispLargeText,     setDispLargeText]     = useState(false)
  const [dispHighContrast,  setDispHighContrast]  = useState(false)
  const [dispSimplified,    setDispSimplified]    = useState(false)
  const [privAnonymised,    setPrivAnonymised]    = useState(true)
  const [privAnalytics,     setPrivAnalytics]     = useState(true)
  const [settingsLoaded,    setSettingsLoaded]    = useState(false)
  const [deleteConfirm,     setDeleteConfirm]     = useState(false)
  const [deleteTyped,       setDeleteTyped]       = useState('')

  const name     = displayName || nameProp || (userEmail && userEmail !== 'Loading...' ? userEmail.split('@')[0] : '...')
  const initials = name.charAt(0).toUpperCase() || 'U'
  const level    = userPts?.level ?? 'Beginner'
  const lvlCol   = LEVEL_COLORS[level] ?? LEVEL_COLORS.Beginner

  // Fetch real user & points from Supabase on mount
  useEffect(() => {
    if (emailProp) setUserEmail(emailProp)
    if (nameProp) setDisplayName(nameProp)
    if (userPointsProp !== undefined) setUserPts(userPointsProp)

    const supabase = createClient()
    supabase.auth.getUser().then(({ data }) => {
      if (data?.user) {
        if (!emailProp && data.user.email) setUserEmail(data.user.email)
        if (!nameProp) {
          const meta = data.user.user_metadata as Record<string, string> | undefined
          const dName = meta?.full_name || meta?.name || (data.user.email ? data.user.email.split('@')[0] : '')
          if (dName) setDisplayName(dName)
        }
      }
    }).catch(() => { /* silently keep placeholder */ })

    if (userPointsProp === undefined) {
      fetchUserPoints().then(pts => {
        if (pts) setUserPts(pts)
      }).catch(() => {})
    }
  }, [emailProp, nameProp, userPointsProp])

  // Listen for global open events from mobile top bar
  useEffect(() => {
    const handler = () => { setOpen(true); setTab('profile') }
    window.addEventListener('open-profile-panel', handler)
    return () => window.removeEventListener('open-profile-panel', handler)
  }, []) 

  // Apply display settings to document root
  const applyDisplay = (large: boolean, contrast: boolean, simplified: boolean) => {
    const root = document.documentElement
    root.style.fontSize     = large     ? '18px' : ''
    root.style.filter       = contrast  ? 'contrast(1.25) brightness(1.1)' : ''
    root.dataset.simplified = simplified ? 'true' : 'false'
  }

  // Load persisted settings on mount
  useEffect(() => {
    try {
      const raw = localStorage.getItem('vg_settings')
      if (raw) {
        const s = JSON.parse(raw)
        if (s.notifScamAlert    !== undefined) setNotifScamAlert(s.notifScamAlert)
        if (s.notifQuizRemind   !== undefined) setNotifQuizRemind(s.notifQuizRemind)
        if (s.notifWeeklyDigest !== undefined) setNotifWeeklyDigest(s.notifWeeklyDigest)
        if (s.notifNewArticles  !== undefined) setNotifNewArticles(s.notifNewArticles)
        if (s.dispLargeText     !== undefined) setDispLargeText(s.dispLargeText)
        if (s.dispHighContrast  !== undefined) setDispHighContrast(s.dispHighContrast)
        if (s.dispSimplified    !== undefined) setDispSimplified(s.dispSimplified)
        if (s.privAnonymised    !== undefined) setPrivAnonymised(s.privAnonymised)
        if (s.privAnalytics     !== undefined) setPrivAnalytics(s.privAnalytics)
      }
    } catch {}
    setSettingsLoaded(true)
  }, [])

  useEffect(() => {
    if (!settingsLoaded) return
    localStorage.setItem('vg_settings', JSON.stringify({
      notifScamAlert, notifQuizRemind, notifWeeklyDigest, notifNewArticles,
      dispLargeText, dispHighContrast, dispSimplified, privAnonymised, privAnalytics,
    }))
    applyDisplay(dispLargeText, dispHighContrast, dispSimplified)
  }, [
    notifScamAlert, notifQuizRemind, notifWeeklyDigest, notifNewArticles,
    dispLargeText, dispHighContrast, dispSimplified,
    privAnonymised, privAnalytics, settingsLoaded
  ])

  const Toggle = ({ on, toggle }: { on: boolean; toggle: () => void }) => (
    <div
      style={{
        width: 46, height: 26, borderRadius: 99, flexShrink: 0, cursor: 'pointer',
        background: on ? 'linear-gradient(135deg,#003580,#1a4fa0)' : 'rgba(0,53,128,.15)',
        position: 'relative', transition: 'background .25s',
      }}
      onClick={toggle}
    >
      <div style={{
        position: 'absolute', top: 3, left: 3, width: 20, height: 20, borderRadius: '50%',
        background: 'white', boxShadow: '0 1px 4px rgba(0,53,128,.3)',
        transition: 'transform .25s cubic-bezier(.34,1.56,.64,1)',
        transform: on ? 'translateX(20px)' : 'translateX(0)',
      }}/>
    </div>
  )

  const Row = ({ label, desc, on, toggle }: { label: string; desc: string; on: boolean; toggle: () => void }) => (
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 12, padding: '13px 0', borderBottom: '1px solid rgba(0,53,128,.07)' }}>
      <div>
        <div style={{ fontSize: '.9rem', fontWeight: 700, color: 'var(--text-primary)' }}>{label}</div>
        <div style={{ fontSize: '.8rem', color: 'var(--text-muted)', marginTop: 3, lineHeight: 1.45 }}>{desc}</div>
      </div>
      <Toggle on={on} toggle={toggle} />
    </div>
  )

  return (
    <>
      <style>{`
        .sup-btn{display:flex;align-items:center;gap:8px;width:100%;padding:10px 12px;border-radius:12px;border:none;background:none;cursor:pointer;transition:background .2s;margin-bottom:4px;font-family:'Inter',sans-serif;text-align:left;color:var(--text-primary);font-size:.95rem;font-weight:600;min-height:48px}
        .sup-btn:hover{background:rgba(0,53,128,.07)}
        .sup-avatar{width:34px;height:34px;border-radius:50%;background:linear-gradient(135deg,#003580,#1a4fa0);display:flex;align-items:center;justify-content:center;font-size:.8rem;font-weight:700;color:white;flex-shrink:0}
        .signout-item{display:flex;align-items:center;gap:10px;width:100%;padding:13px 14px;border-radius:12px;border:1.5px solid rgba(204,0,1,.2);background:rgba(204,0,1,.05);cursor:pointer;font-family:'Inter',sans-serif;font-size:.95rem;font-weight:700;color:#CC0001;transition:background .2s,border-color .2s;min-height:50px}
        .signout-item:hover{background:rgba(204,0,1,.1);border-color:rgba(204,0,1,.35)}
        .sup-panel{position:fixed;top:0;right:0;width:400px;max-width:100vw;height:100vh;background:#ffffff;border-left:1px solid rgba(0,53,128,0.14);z-index:50;display:flex;flex-direction:column;animation:supSlideIn .25s cubic-bezier(.16,1,.3,1);overflow:hidden;box-shadow:-4px 0 32px rgba(0,53,128,0.12)}
        @keyframes supSlideIn{from{transform:translateX(100%);opacity:.5}to{transform:translateX(0);opacity:1}}
        .sup-panel-head{padding:1.5rem 1.5rem;background:linear-gradient(135deg,rgba(0,53,128,.07),rgba(26,79,160,.04));border-bottom:1px solid rgba(0,53,128,0.12);display:flex;align-items:flex-start;justify-content:space-between;gap:12px;flex-shrink:0}
        .sup-big-avatar{width:54px;height:54px;border-radius:50%;flex-shrink:0;background:linear-gradient(135deg,#003580,#1a4fa0);display:flex;align-items:center;justify-content:center;font-size:1.2rem;font-weight:700;color:white;box-shadow:0 4px 14px rgba(0,53,128,0.3)}
        .sup-close{background:none;border:none;cursor:pointer;padding:6px;color:var(--text-muted);border-radius:9px;display:flex;transition:color .15s,background .15s;flex-shrink:0;min-width:36px;min-height:36px;align-items:center;justify-content:center}
        .sup-close:hover{color:var(--text-primary);background:rgba(0,53,128,.08)}
        .sup-tabs{display:flex;border-bottom:1px solid rgba(0,53,128,0.12);flex-shrink:0;padding:0 .5rem;background:#fafcff}
        .sup-tab{flex:1;padding:12px 4px;font-size:.8rem;font-weight:700;background:none;border:none;cursor:pointer;color:var(--text-muted);border-bottom:2px solid transparent;transition:color .15s,border-color .15s;font-family:'Inter',sans-serif;display:flex;align-items:center;justify-content:center;gap:5px;min-height:48px}
        .sup-tab:hover{color:#003580}
        .sup-tab.sup-active{color:#003580;border-bottom-color:#003580}
        .sup-content{flex:1;overflow-y:auto;padding:1.5rem;scrollbar-width:thin;background:#ffffff}
        .sup-content::-webkit-scrollbar{width:4px}
        .sup-content::-webkit-scrollbar-track{background:transparent}
        .sup-content::-webkit-scrollbar-thumb{background:rgba(0,53,128,0.15);border-radius:4px}
        .sup-section-label{font-size:.7rem;font-weight:800;letter-spacing:.1em;text-transform:uppercase;color:var(--text-muted);margin-bottom:.7rem}
        .sup-last-updated{font-size:.8rem;color:var(--text-muted);margin-bottom:1rem;margin-top:-.3rem}
        .sup-info-row{display:flex;align-items:center;justify-content:space-between;gap:12px;padding:11px 0;border-bottom:1px solid rgba(0,53,128,0.07);font-size:.9rem}
        .sup-info-key{color:var(--text-muted);flex-shrink:0;font-weight:500}
        .sup-info-val{color:var(--text-primary);font-weight:700;text-align:right;overflow:hidden;text-overflow:ellipsis;white-space:nowrap;max-width:60%}
        .sup-tnc-section{margin-bottom:1.2rem;padding-bottom:1.2rem;border-bottom:1px solid rgba(0,53,128,0.07)}
        .sup-tnc-section:last-child{border-bottom:none}
        .sup-tnc-title{font-size:.9rem;font-weight:700;color:var(--text-primary);margin-bottom:.4rem}
        .sup-tnc-body{font-size:.85rem;color:var(--text-secondary);line-height:1.7}
        .sup-guide-item{display:flex;gap:14px;margin-bottom:1.2rem;padding-bottom:1.2rem;border-bottom:1px solid rgba(0,53,128,0.07);align-items:flex-start}
        .sup-guide-item:last-child{border-bottom:none}
        .sup-guide-icon{font-size:1.5rem;flex-shrink:0;margin-top:1px}
        .sup-guide-title{font-size:.9rem;font-weight:700;color:var(--text-primary);margin-bottom:.3rem}
        .sup-guide-body{font-size:.85rem;color:var(--text-secondary);line-height:1.65}
        .sup-preview-chip{font-size:.72rem;font-weight:700;padding:3px 10px;border-radius:99px;background:rgba(0,53,128,.1);border:1px solid rgba(0,53,128,.2);color:#003580}
        .sup-btn-danger{width:100%;padding:12px;border-radius:10px;border:1.5px solid rgba(204,0,1,.25);background:rgba(204,0,1,.06);color:#CC0001;font-size:.95rem;font-weight:700;cursor:pointer;font-family:'Inter',sans-serif;transition:background .2s;min-height:48px}
        .sup-btn-danger:hover:not(:disabled){background:rgba(204,0,1,.12)}
        .sup-btn-danger:disabled{opacity:.45;cursor:default}
        .sup-spinner{width:14px;height:14px;border:2px solid rgba(0,53,128,0.2);border-top-color:#003580;border-radius:50%;display:inline-block;animation:supSpin .7s linear infinite}
        @keyframes supSpin{to{transform:rotate(360deg)}}
        @media(max-width:480px){.sup-panel{width:100vw}}
      `}</style>

      {/* ── Language row + User chip ── */}
      <div style={{ borderTop: '1px solid rgba(0,53,128,0.12)', paddingTop: '1rem' }}>
        <div style={{ padding: '0 8px 10px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <span style={{ fontSize: '.68rem', fontWeight: 700, letterSpacing: '.08em', textTransform: 'uppercase', color: 'var(--text-muted)' }}>{t('lang_label')}</span>
          <LanguageSwitcher compact />
        </div>

        {/* Clickable user chip → opens panel */}
        <button className="sup-btn" onClick={() => { setOpen(true); setTab('profile') }}>
          <div className="sup-avatar">{initials}</div>
          <div style={{ minWidth: 0, flex: 1 }}>
            <div style={{ fontSize: '.9rem', fontWeight: 700, color: 'var(--text-primary)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
              {name}
            </div>
            <div style={{ fontSize: '.75rem', color: 'var(--text-muted)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
              {userEmail}
            </div>
          </div>
          <SettingsKnob s={14} />
        </button>

        {/* Sign out — server action, fixes the /auth/signout 404 */}
        <form action={logout}>
          <button type="submit" className="signout-item">
            <LogOutIcon s={18} />{t('nav_signout')}
          </button>
        </form>
      </div>

      {/* ── Profile panel overlay ── */}
      {open && typeof document !== 'undefined' && createPortal(
        <>
          {/* Backdrop */}
          <div
            onClick={() => setOpen(false)}
            style={{ position: 'fixed', inset: 0, background: 'rgba(0,30,80,.35)', backdropFilter: 'blur(3px)', zIndex: 99990 }}
          />

          {/* Panel */}
          <div className="sup-panel" style={{ zIndex: 99999 }}>

            {/* Header */}
            <div className="sup-panel-head">
              <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                <div className="sup-big-avatar">{initials}</div>
                <div>
                  <div style={{ fontSize: '1rem', fontWeight: 700, color: 'var(--text-primary)' }}>{name}</div>
                  <div style={{ fontSize: '.78rem', color: 'var(--text-muted)', marginTop: 2 }}>{userEmail}</div>
                  {userPts && (
                    <div style={{ display: 'flex', alignItems: 'center', gap: 5, marginTop: 5 }}>
                      <span style={{ fontSize: '.65rem', fontWeight: 700, padding: '1px 7px', borderRadius: 99, background: lvlCol.bg, border: `1px solid ${lvlCol.border}`, color: lvlCol.color }}>{level}</span>
                      <span style={{ fontSize: '.68rem', color: '#facc15', fontWeight: 700, display: 'flex', alignItems: 'center', gap: 2 }}>
                        <StarIcon s={10} />{userPts.total_points} pts
                      </span>
                    </div>
                  )}
                </div>
              </div>
              <button className="sup-close" onClick={() => setOpen(false)}><XIcon s={15} /></button>
            </div>

            {/* Tab bar */}
            <div className="sup-tabs">
              {([
                { id: 'profile',  label: t('tab_profile'),  icon: '👤' },
                { id: 'settings', label: t('tab_settings'), icon: '⚙️' },
                { id: 'tnc',      label: t('tab_tnc'),       icon: '📜' },
                { id: 'guide',    label: t('tab_guide'),     icon: '📘' },
              ] as const).map(item => (
                <button
                  key={item.id}
                  className={`sup-tab${tab === item.id ? ' sup-active' : ''}`}
                  onClick={() => setTab(item.id)}
                >
                  <span>{item.icon}</span>{item.label}
                </button>
              ))}
            </div>

            {/* Tab content */}
            <div className="sup-content">

              {/* ── PROFILE TAB ── */}
              {tab === 'profile' && (
                <div>
                  <p className="sup-section-label">{t('profile_account_info')}</p>
                  <div className="sup-info-row"><span className="sup-info-key">{t('profile_display_name')}</span><span className="sup-info-val">{name || '—'}</span></div>
                  <div className="sup-info-row"><span className="sup-info-key">Email</span><span className="sup-info-val">{userEmail}</span></div>
                  <div className="sup-info-row"><span className="sup-info-key">{t('profile_account_type')}</span><span className="sup-info-val">{t('profile_free_plan')}</span></div>
                  <div className="sup-info-row" style={{ borderBottom: 'none' }}><span className="sup-info-key">{t('profile_member_since')}</span><span className="sup-info-val">2025</span></div>

                  {userPts && (
                    <>
                      <p className="sup-section-label" style={{ marginTop: '1.25rem' }}>{t('profile_quiz_summary')}</p>
                      <div className="sup-info-row"><span className="sup-info-key">{t('profile_total_points')}</span><span className="sup-info-val" style={{ color: '#facc15', fontWeight: 700 }}>{userPts.total_points} pts</span></div>
                      <div className="sup-info-row"><span className="sup-info-key">{t('profile_level')}</span><span className="sup-info-val" style={{ color: lvlCol.color, fontWeight: 700 }}>{level}</span></div>
                      <div className="sup-info-row"><span className="sup-info-key">{t('profile_questions')}</span><span className="sup-info-val">{userPts.total_attempted}</span></div>
                      <div className="sup-info-row"><span className="sup-info-key">{t('profile_correct')}</span><span className="sup-info-val" style={{ color: '#34d399' }}>{userPts.total_correct}</span></div>
                      <div className="sup-info-row" style={{ borderBottom: 'none' }}><span className="sup-info-key">{t('profile_streak')}</span><span className="sup-info-val">{userPts.streak_days} day{userPts.streak_days !== 1 ? 's' : ''} 🔥</span></div>
                    </>
                  )}
                </div>
              )}

              {/* ── SETTINGS TAB ── */}
              {tab === 'settings' && (
                <div>
                  {/* ── TWO-FACTOR AUTHENTICATION ── */}
                  <p className="sup-section-label">🔐 Two-Factor Authentication</p>
                  <div style={{
                    padding: '14px 16px', borderRadius: 12,
                    background: 'rgba(52,211,153,.06)', border: '1px solid rgba(52,211,153,.2)',
                    marginBottom: '1rem',
                  }}>
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 12 }}>
                      <div>
                        <div style={{ fontSize: '.9rem', fontWeight: 700, color: 'var(--text-primary)', display: 'flex', alignItems: 'center', gap: 7 }}>
                          Authenticator App
                          <span style={{ fontSize: '.65rem', fontWeight: 700, padding: '2px 8px', borderRadius: 99, background: 'rgba(52,211,153,.15)', border: '1px solid rgba(52,211,153,.3)', color: '#2a9d7a' }}>
                            ACTIVE
                          </span>
                        </div>
                        <div style={{ fontSize: '.78rem', color: 'var(--text-muted)', marginTop: 3, lineHeight: 1.5 }}>
                          Microsoft / Google Authenticator is protecting your account
                        </div>
                      </div>
                    </div>
                    <a href="/mfa-setup"
                      style={{
                        display: 'inline-flex', alignItems: 'center', gap: 6, marginTop: 10,
                        fontSize: '.78rem', fontWeight: 700, color: '#003580',
                        textDecoration: 'none', opacity: .8,
                      }}>
                      🔄 Re-configure authenticator →
                    </a>
                  </div>

                  <p className="sup-section-label" style={{ marginTop: '1.25rem' }}>{t('settings_notifications')}</p>
                  <Row label="Scam alert notifications"  desc="Get notified when a new scam alert is issued for your region" on={notifScamAlert}    toggle={() => setNotifScamAlert(v => !v)} />
                  <Row label="Daily quiz reminder"       desc="A gentle reminder to complete today's safety quiz"           on={notifQuizRemind}   toggle={() => setNotifQuizRemind(v => !v)} />
                  <Row label="Weekly security digest"    desc="A weekly summary of cybersecurity news and scam trends"      on={notifWeeklyDigest} toggle={() => setNotifWeeklyDigest(v => !v)} />
                  <Row label="New awareness articles"    desc="Notify me when new guides are published in the Awareness Hub"on={notifNewArticles}  toggle={() => setNotifNewArticles(v => !v)} />

                  <p className="sup-section-label" style={{ marginTop: '1.5rem' }}>{t('settings_display')}</p>
                  <Row label="Large text mode"    desc="Increases base font size across the dashboard for easier reading"  on={dispLargeText}    toggle={() => setDispLargeText(v => !v)} />
                  <Row label="High contrast mode" desc="Boosts contrast and brightness for low-vision users"          on={dispHighContrast}  toggle={() => setDispHighContrast(v => !v)} />
                  <Row label="Simplified interface" desc="Hides advanced features and shows only essential controls"  on={dispSimplified}   toggle={() => setDispSimplified(v => !v)} />

                  {(dispLargeText || dispHighContrast || dispSimplified) && (
                    <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap', margin: '.5rem 0 .25rem' }}>
                      {dispLargeText    && <span className="sup-preview-chip">Aa Large Text</span>}
                      {dispHighContrast && <span className="sup-preview-chip">☀️ High Contrast</span>}
                      {dispSimplified   && <span className="sup-preview-chip">✦ Simplified</span>}
                      <span style={{ fontSize: '.7rem', color: 'var(--text-muted)', alignSelf: 'center' }}>— preview on save</span>
                    </div>
                  )}

                  <p className="sup-section-label" style={{ marginTop: '1.5rem' }}>{t('settings_privacy')}</p>
                  <Row label="Share anonymised quiz data" desc="Helps improve question quality — no personal data is shared" on={privAnonymised} toggle={() => setPrivAnonymised(v => !v)} />
                  <Row label="Usage analytics"            desc="Helps us understand how features are used to improve VoiceGuard" on={privAnalytics} toggle={() => setPrivAnalytics(v => !v)} />

                  {/* Danger zone */}
                  <p className="sup-section-label" style={{ marginTop: '1.75rem', color: '#f87171' }}>{t('settings_danger')}</p>
                  {!deleteConfirm ? (
                    <button className="sup-btn-danger" onClick={() => setDeleteConfirm(true)}>🗑️ Delete My Account</button>
                  ) : (
                    <div style={{ background: 'rgba(204,0,1,.05)', border: '1px solid rgba(204,0,1,.18)', borderRadius: 12, padding: '1rem' }}>
                      <div style={{ fontSize: '.875rem', fontWeight: 700, color: '#CC0001', marginBottom: 6 }}>{t('settings_delete_warn')}</div>
                      <div style={{ fontSize: '.8rem', color: 'var(--text-secondary)', marginBottom: 10, lineHeight: 1.5 }}>
                        All your data will be permanently deleted. Type <strong style={{ color: 'var(--text-primary)' }}>DELETE</strong> to confirm.
                      </div>
                      <input
                        style={{ width: '100%', padding: '8px 10px', borderRadius: 8, border: '1px solid rgba(0,53,128,0.18)', background: '#f8faff', color: 'var(--text-primary)', fontSize: '.82rem', fontFamily: "'Inter',sans-serif", outline: 'none', boxSizing: 'border-box', marginBottom: 8 }}
                        placeholder="Type DELETE to confirm"
                        value={deleteTyped}
                        onChange={e => setDeleteTyped(e.target.value)}
                      />
                      <div style={{ display: 'flex', gap: 6 }}>
                        <button
                          className="sup-btn-danger"
                          style={{ flex: 1, opacity: deleteTyped === 'DELETE' ? 1 : 0.4, cursor: deleteTyped === 'DELETE' ? 'pointer' : 'default' }}
                          disabled={deleteTyped !== 'DELETE'}
                          onClick={() => alert('Account deletion requested.')}
                        >
                          {t('settings_confirm_delete')}
                        </button>
                        <button
                          onClick={() => { setDeleteConfirm(false); setDeleteTyped('') }}
                          style={{ padding: '8px 12px', borderRadius: 8, border: '1px solid var(--border)', background: 'none', color: 'var(--text-muted)', fontSize: '.82rem', cursor: 'pointer', fontFamily: "'Inter',sans-serif", flex: 1 }}
                        >
                          Cancel
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              )}

              {/* ── T&C TAB ── */}
              {tab === 'tnc' && (
                <div>
                  <p className="sup-section-label">{t('tnc_title')}</p>
                  <p className="sup-last-updated">{t('tnc_updated')}</p>
                  {[
                    { title: "1. Acceptance of Terms", body: "By accessing or using VoiceGuard, you agree to be bound by these Terms and Conditions. If you do not agree, please do not use the application. These terms apply to all users, including visitors, registered users, and contributors." },
                    { title: "2. Use of the Platform", body: "VoiceGuard is provided for educational and awareness purposes only. The platform helps users identify and understand voice phishing (vishing) threats. You agree not to misuse the platform for any unlawful purpose, including but not limited to attempting to reverse-engineer, scrape, or attack the service." },
                    { title: "3. User Data & Privacy", body: "We collect only the data necessary to provide our service, including your email address, quiz results, and trusted contact information. Your data is stored securely via Supabase and is never sold to third parties. You may request deletion of your account and data at any time via Settings." },
                    { title: "4. Educational Content", body: "All cybersecurity content, news articles, quiz questions, and video recommendations on VoiceGuard are provided for educational purposes only. They do not constitute professional legal, financial, or security advice. Always consult qualified professionals for specific security concerns." },
                    { title: "5. Points & Rewards", body: "Points earned through the Daily Safety Quiz are for educational gamification purposes only. They have no monetary value and cannot be exchanged for cash, products, or services unless explicitly stated in a future rewards programme announcement." },
                    { title: "6. Third-Party Services", body: "VoiceGuard integrates with Google Gemini AI for content generation and YouTube for educational videos. Your use of these features is also subject to Google's Terms of Service and Privacy Policy. We are not responsible for third-party content." },
                    { title: "7. Changes to Terms", body: "We reserve the right to update these Terms at any time. Continued use of VoiceGuard after changes constitutes acceptance of the updated Terms. We will notify users of significant changes via the platform." },
                    { title: "8. Contact", body: "For questions regarding these Terms, please contact us at support@voiceguard.my or through the feedback form in the application." },
                  ].map(s => (
                    <div key={s.title} className="sup-tnc-section">
                      <div className="sup-tnc-title">{s.title}</div>
                      <div className="sup-tnc-body">{s.body}</div>
                    </div>
                  ))}
                </div>
              )}

              {/* ── GUIDE TAB ── */}
              {tab === 'guide' && (
                <div>
                  <p className="sup-section-label">{t('guide_title')}</p>
                  <p className="sup-last-updated">{t('guide_sub')}</p>
                  {[
                    { icon: '🛡️', title: "Stay Alert Daily",        body: "Check the dashboard every day. The Daily Safety Quiz takes less than 2 minutes and builds real scam-recognition habits over time. Consistency is more important than intensity." },
                    { icon: '📞', title: "Verify Suspicious Calls", body: "If you receive an unexpected call from a bank, government agency, or police, always hang up and call back using the official number from their website — never the number the caller gives you." },
                    { icon: '🔐', title: "Never Share OTPs",        body: "No legitimate organisation — not your bank, not PDRM, not Bank Negara — will ever ask for your One-Time Password (OTP) over a phone call. Sharing it is equivalent to handing over your account." },
                    { icon: '🤖', title: "Understand AI Threats",   body: "Modern AI can clone a voice from just 3 seconds of audio. If a family member calls in distress asking for money, always verify by calling them back on their known number or using your agreed family code word." },
                    { icon: '👥', title: "Use Trusted Contacts",    body: "Add your most trusted family members, doctor, and close friends to your Trusted Contacts list. When in doubt about any call or request, contact one of them before taking action." },
                    { icon: '📢', title: "Report Scams",            body: "If you receive a scam call, report it to PDRM (999), MCMC (1-800-18-8030), or Bank Negara Malaysia LINK (1-300-88-5465). Reporting helps protect others in your community." },
                    { icon: '📚', title: "Explore the Awareness Hub", body: "The Awareness Hub is updated with AI-generated news and educational content. Read at least one article per week to stay informed about the latest scam tactics used in Malaysia and globally." },
                    { icon: '🔒', title: "Protect Your Data",       body: "VoiceGuard stores your data securely. However, never share your login credentials with anyone. Enable MFA (Multi-Factor Authentication) in Settings for maximum account security." },
                  ].map(g => (
                    <div key={g.title} className="sup-guide-item">
                      <div className="sup-guide-icon">{g.icon}</div>
                      <div>
                        <div className="sup-guide-title">{g.title}</div>
                        <div className="sup-guide-body">{g.body}</div>
                      </div>
                    </div>
                  ))}
                </div>
              )}

            </div>{/* end content */}
          </div>{/* end panel */}
        </>,
        document.body
      )}
    </>
  )
}
