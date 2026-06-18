'use client'

import { useState, useEffect } from 'react'
import { useLang, LanguageSwitcher } from '@/lib/LanguageContext'
import { createClient } from '@/lib/supabase/client'
import { logout } from '@/app/auth/actions'

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
}

const LEVEL_COLORS: Record<string, { color: string; bg: string; border: string }> = {
  Beginner: { color: '#94a3b8', bg: 'rgba(148,163,184,.12)', border: 'rgba(148,163,184,.25)' },
  Aware:    { color: '#34d399', bg: 'rgba(52,211,153,.12)',  border: 'rgba(52,211,153,.25)'  },
  Guardian: { color: '#60a5fa', bg: 'rgba(96,165,250,.12)',  border: 'rgba(96,165,250,.25)'  },
  Expert:   { color: '#a78bfa', bg: 'rgba(167,139,250,.12)', border: 'rgba(167,139,250,.25)' },
  Champion: { color: '#facc15', bg: 'rgba(250,204,21,.12)',  border: 'rgba(250,204,21,.25)'  },
}

// ── Component ─────────────────────────────────────────────────────────────────
export function SidebarUserPanel({ userEmail: emailProp, displayName: nameProp }: Props) {
  const { t } = useLang()
  const [open,       setOpen]       = useState(false)
  const [tab,        setTab]        = useState<'profile' | 'settings' | 'tnc' | 'guide'>('profile')
  const [userEmail,  setUserEmail]  = useState(emailProp ?? 'Loading...')

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
  const [settingsSaved,     setSettingsSaved]     = useState(false)
  const [savingSettings,    setSavingSettings]    = useState(false)
  const [deleteConfirm,     setDeleteConfirm]     = useState(false)
  const [deleteTyped,       setDeleteTyped]       = useState('')

  const name     = nameProp || (userEmail && userEmail !== 'Loading...' ? userEmail.split('@')[0] : '...')
  const initials = name.charAt(0).toUpperCase() || 'U'

  // Fetch real user from Supabase on mount
  useEffect(() => {
    if (emailProp) { setUserEmail(emailProp); return }
    const supabase = createClient()
    supabase.auth.getUser().then(({ data }) => {
      if (data?.user?.email) setUserEmail(data.user.email)
    }).catch(() => { /* silently keep placeholder */ })
  }, [emailProp])

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
      if (!raw) return
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
      applyDisplay(s.dispLargeText ?? false, s.dispHighContrast ?? false, s.dispSimplified ?? false)
    } catch { /* ignore */ }
  }, [])

  const handleSaveSettings = async () => {
    setSavingSettings(true)
    applyDisplay(dispLargeText, dispHighContrast, dispSimplified)
    localStorage.setItem('vg_settings', JSON.stringify({
      notifScamAlert, notifQuizRemind, notifWeeklyDigest, notifNewArticles,
      dispLargeText, dispHighContrast, dispSimplified, privAnonymised, privAnalytics,
    }))
    await new Promise(r => setTimeout(r, 600))
    setSavingSettings(false)
    setSettingsSaved(true)
    setTimeout(() => setSettingsSaved(false), 2500)
  }

  const Toggle = ({ on, toggle }: { on: boolean; toggle: () => void }) => (
    <div
      style={{
        width: 42, height: 24, borderRadius: 99, flexShrink: 0, cursor: 'pointer',
        background: on ? 'linear-gradient(135deg,#003580,#1a4fa0)' : 'rgba(0,53,128,.15)',
        position: 'relative', transition: 'background .25s',
      }}
      onClick={toggle}
    >
      <div style={{
        position: 'absolute', top: 3, left: 3, width: 18, height: 18, borderRadius: '50%',
        background: 'white', boxShadow: '0 1px 4px rgba(0,53,128,.3)',
        transition: 'transform .25s cubic-bezier(.34,1.56,.64,1)',
        transform: on ? 'translateX(18px)' : 'translateX(0)',
      }}/>
    </div>
  )

  const Row = ({ label, desc, on, toggle }: { label: string; desc: string; on: boolean; toggle: () => void }) => (
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 12, padding: '11px 0', borderBottom: '1px solid rgba(0,53,128,.07)' }}>
      <div>
        <div style={{ fontSize: '.855rem', fontWeight: 500, color: 'var(--text-primary)' }}>{label}</div>
        <div style={{ fontSize: '.75rem', color: 'var(--text-muted)', marginTop: 2, lineHeight: 1.4 }}>{desc}</div>
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
        .signout-item{display:flex;align-items:center;gap:10px;width:100%;padding:12px 14px;border-radius:12px;border:1.5px solid rgba(204,0,1,.2);background:rgba(204,0,1,.05);cursor:pointer;font-family:'Inter',sans-serif;font-size:.95rem;font-weight:700;color:#CC0001;transition:background .2s,border-color .2s;min-height:50px}
        .signout-item:hover{background:rgba(204,0,1,.1);border-color:rgba(204,0,1,.35)}
        .sup-panel{position:fixed;top:0;right:0;width:380px;max-width:100vw;height:100vh;background:#ffffff;border-left:1px solid rgba(0,53,128,0.14);z-index:50;display:flex;flex-direction:column;animation:supSlideIn .25s cubic-bezier(.16,1,.3,1);overflow:hidden;box-shadow:-4px 0 32px rgba(0,53,128,0.12)}
        @keyframes supSlideIn{from{transform:translateX(100%);opacity:.5}to{transform:translateX(0);opacity:1}}
        .sup-panel-head{padding:1.25rem 1.5rem;background:linear-gradient(135deg,rgba(0,53,128,.07),rgba(26,79,160,.04));border-bottom:1px solid rgba(0,53,128,0.12);display:flex;align-items:flex-start;justify-content:space-between;gap:12px;flex-shrink:0}
        .sup-big-avatar{width:48px;height:48px;border-radius:50%;flex-shrink:0;background:linear-gradient(135deg,#003580,#1a4fa0);display:flex;align-items:center;justify-content:center;font-size:1.1rem;font-weight:700;color:white;box-shadow:0 4px 14px rgba(0,53,128,0.28)}
        .sup-close{background:none;border:none;cursor:pointer;padding:4px;color:var(--text-muted);border-radius:7px;display:flex;transition:color .15s,background .15s;flex-shrink:0}
        .sup-close:hover{color:var(--text-primary);background:rgba(0,53,128,.08)}
        .sup-tabs{display:flex;border-bottom:1px solid rgba(0,53,128,0.12);flex-shrink:0;padding:0 .5rem;background:#fafcff}
        .sup-tab{flex:1;padding:10px 4px;font-size:.75rem;font-weight:600;background:none;border:none;cursor:pointer;color:var(--text-muted);border-bottom:2px solid transparent;transition:color .15s,border-color .15s;font-family:'Inter',sans-serif;display:flex;align-items:center;justify-content:center;gap:5px}
        .sup-tab:hover{color:#003580}
        .sup-tab.sup-active{color:#003580;border-bottom-color:#003580}
        .sup-content{flex:1;overflow-y:auto;padding:1.25rem 1.5rem;scrollbar-width:thin;background:#ffffff}
        .sup-content::-webkit-scrollbar{width:4px}
        .sup-content::-webkit-scrollbar-track{background:transparent}
        .sup-content::-webkit-scrollbar-thumb{background:rgba(0,53,128,0.15);border-radius:4px}
        .sup-section-label{font-size:.68rem;font-weight:700;letter-spacing:.09em;text-transform:uppercase;color:var(--text-muted);margin-bottom:.625rem}
        .sup-info-row{display:flex;align-items:center;justify-content:space-between;gap:12px;padding:9px 0;border-bottom:1px solid rgba(0,53,128,0.07);font-size:.84rem}
        .sup-tnc-section{margin-bottom:1.1rem;padding-bottom:1.1rem;border-bottom:1px solid rgba(0,53,128,0.07)}
        .sup-tnc-section:last-child{border-bottom:none}
        .sup-tnc-title{font-size:.875rem;font-weight:700;color:var(--text-primary);margin-bottom:.4rem}
        .sup-tnc-body{font-size:.82rem;color:var(--text-secondary);line-height:1.65}
        .sup-guide-item{display:flex;gap:12px;margin-bottom:1.1rem;padding-bottom:1.1rem;border-bottom:1px solid rgba(0,53,128,0.07);align-items:flex-start}
        .sup-guide-item:last-child{border-bottom:none}
        .sup-guide-icon{font-size:1.3rem;flex-shrink:0;margin-top:1px}
        .sup-guide-title{font-size:.875rem;font-weight:700;color:var(--text-primary);margin-bottom:.3rem}
        .sup-guide-body{font-size:.82rem;color:var(--text-secondary);line-height:1.6}
        .sup-preview-chip{font-size:.7rem;font-weight:700;padding:3px 9px;border-radius:99px;background:rgba(0,53,128,.1);border:1px solid rgba(0,53,128,.2);color:#003580}
        .sup-btn-danger{width:100%;padding:9px;border-radius:9px;border:1px solid rgba(204,0,1,.25);background:rgba(204,0,1,.06);color:#CC0001;font-size:.84rem;font-weight:600;cursor:pointer;font-family:'Inter',sans-serif;transition:background .2s}
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
            <div style={{ fontSize: '.8rem', fontWeight: 600, color: 'var(--text-primary)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
              {name}
            </div>
            <div style={{ fontSize: '.7rem', color: 'var(--text-muted)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
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
      {open && (
        <>
          {/* Backdrop */}
          <div
            onClick={() => setOpen(false)}
            style={{ position: 'fixed', inset: 0, background: 'rgba(0,30,80,.35)', backdropFilter: 'blur(3px)', zIndex: 40 }}
          />

          {/* Panel */}
          <div className="sup-panel">

            {/* Header */}
            <div className="sup-panel-head">
              <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                <div className="sup-big-avatar">{initials}</div>
                <div>
                  <div style={{ fontSize: '1rem', fontWeight: 700, color: 'var(--text-primary)' }}>{name}</div>
                  <div style={{ fontSize: '.78rem', color: 'var(--text-muted)', marginTop: 2 }}>{userEmail}</div>
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
                  <div className="sup-info-row"><span style={{ color: 'var(--text-muted)', flexShrink: 0 }}>{t('profile_display_name')}</span><span style={{ color: 'var(--text-primary)', fontWeight: 500, textAlign: 'right' }}>{name}</span></div>
                  <div className="sup-info-row"><span style={{ color: 'var(--text-muted)', flexShrink: 0 }}>Email</span><span style={{ color: 'var(--text-primary)', fontWeight: 500, textAlign: 'right', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', maxWidth: '60%' }}>{userEmail}</span></div>
                  <div className="sup-info-row"><span style={{ color: 'var(--text-muted)', flexShrink: 0 }}>{t('profile_account_type')}</span><span style={{ color: 'var(--text-primary)', fontWeight: 500 }}>{t('profile_free_plan')}</span></div>
                  <div className="sup-info-row" style={{ borderBottom: 'none' }}><span style={{ color: 'var(--text-muted)', flexShrink: 0 }}>{t('profile_member_since')}</span><span style={{ color: 'var(--text-primary)', fontWeight: 500 }}>2025</span></div>
                </div>
              )}

              {/* ── SETTINGS TAB ── */}
              {tab === 'settings' && (
                <div>
                  <p className="sup-section-label">{t('settings_notifications')}</p>
                  <Row label="Scam alert notifications"  desc="Get notified when a new scam alert is issued for your region" on={notifScamAlert}    toggle={() => setNotifScamAlert(v => !v)} />
                  <Row label="Daily quiz reminder"       desc="A gentle reminder to complete today's safety quiz"           on={notifQuizRemind}   toggle={() => setNotifQuizRemind(v => !v)} />
                  <Row label="Weekly security digest"    desc="A weekly summary of cybersecurity news and scam trends"      on={notifWeeklyDigest} toggle={() => setNotifWeeklyDigest(v => !v)} />
                  <Row label="New awareness articles"    desc="Notify me when new guides are published in the Awareness Hub"on={notifNewArticles}  toggle={() => setNotifNewArticles(v => !v)} />

                  <p className="sup-section-label" style={{ marginTop: '1.5rem' }}>{t('settings_display')}</p>
                  <Row label="Large text mode"    desc="Increases base font size across the app for easier reading"  on={dispLargeText}    toggle={() => setDispLargeText(v => !v)} />
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

                  {/* Save button */}
                  <button
                    onClick={handleSaveSettings}
                    disabled={savingSettings}
                    style={{
                      marginTop: '1.5rem', width: '100%', padding: 10, borderRadius: 10,
                      border: 'none', background: 'linear-gradient(135deg,#003580,#1a4fa0)',
                      color: 'white', fontSize: '.875rem', fontWeight: 700, cursor: 'pointer',
                      fontFamily: "'Inter',sans-serif", transition: 'opacity .2s',
                      opacity: savingSettings ? 0.6 : 1, display: 'flex', alignItems: 'center',
                      justifyContent: 'center', gap: 8,
                    }}
                  >
                    {savingSettings
                      ? <><span className="sup-spinner"/>&nbsp;{t('settings_saving')}</>
                      : settingsSaved
                      ? <>✅ Settings saved!</>
                      : <>💾 Save Settings</>}
                  </button>

                  {/* Danger zone */}
                  <p className="sup-section-label" style={{ marginTop: '1.75rem', color: '#f87171' }}>{t('settings_danger')}</p>
                  {!deleteConfirm ? (
                    <button className="sup-btn-danger" onClick={() => setDeleteConfirm(true)}>🗑️ Delete My Account</button>
                  ) : (
                    <div style={{ background: 'rgba(204,0,1,.05)', border: '1px solid rgba(204,0,1,.18)', borderRadius: 10, padding: '.875rem' }}>
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
                  <p style={{ fontSize: '.75rem', color: 'var(--text-muted)', marginBottom: '1rem', marginTop: '-.3rem' }}>{t('tnc_updated')}</p>
                  {[
                    { title: '1. Acceptance of Terms',  body: 'By accessing or using VoiceGuard, you agree to be bound by these Terms and Conditions. If you do not agree, please do not use the application.' },
                    { title: '2. Use of the Platform',  body: 'VoiceGuard is provided for educational and awareness purposes only. You agree not to misuse the platform for any unlawful purpose.' },
                    { title: '3. User Data & Privacy',  body: 'We collect only the data necessary to provide our service. Your data is stored securely via Supabase and is never sold to third parties.' },
                    { title: '4. Educational Content',  body: 'All cybersecurity content on VoiceGuard is for educational purposes only. It does not constitute professional legal, financial, or security advice.' },
                    { title: '5. Points & Rewards',     body: 'Points earned through the Daily Safety Quiz have no monetary value and cannot be exchanged for cash or services.' },
                    { title: '6. Third-Party Services', body: 'VoiceGuard integrates with Google Gemini AI and YouTube. Your use of these features is also subject to Google\'s Terms of Service.' },
                    { title: '7. Changes to Terms',     body: 'We reserve the right to update these Terms at any time. Continued use constitutes acceptance of the updated Terms.' },
                    { title: '8. Contact',              body: 'For questions regarding these Terms, please contact us at support@voiceguard.my.' },
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
                  <p style={{ fontSize: '.75rem', color: 'var(--text-muted)', marginBottom: '1rem', marginTop: '-.3rem' }}>{t('guide_sub')}</p>
                  {[
                    { icon: '🛡️', title: 'Stay Alert Daily',         body: 'Check the dashboard every day. The Daily Safety Quiz takes less than 2 minutes and builds real scam-recognition habits over time.' },
                    { icon: '📞', title: 'Verify Suspicious Calls',  body: 'Always hang up and call back using the official number from their website — never the number the caller gives you.' },
                    { icon: '🔐', title: 'Never Share OTPs',         body: 'No legitimate organisation — not your bank, not PDRM — will ever ask for your OTP over a phone call.' },
                    { icon: '🤖', title: 'Understand AI Threats',    body: 'AI can clone a voice from just 3 seconds of audio. Always verify by calling back on a known number or using a family code word.' },
                    { icon: '👥', title: 'Use Trusted Contacts',     body: 'Add your most trusted family members to your Trusted Contacts list. When in doubt, contact one of them before taking action.' },
                    { icon: '📢', title: 'Report Scams',             body: 'Report to PDRM (999), MCMC (1-800-18-8030), or Bank Negara Malaysia LINK (1-300-88-5465). Reporting helps protect others.' },
                    { icon: '📚', title: 'Explore the Awareness Hub', body: 'Read at least one article per week to stay informed about the latest scam tactics used in Malaysia and globally.' },
                    { icon: '🔒', title: 'Protect Your Data',        body: 'Never share your login credentials with anyone.' },
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
        </>
      )}
    </>
  )
}
