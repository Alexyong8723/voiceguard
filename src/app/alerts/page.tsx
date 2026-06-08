'use client'

import { useState, useEffect, useTransition, useCallback } from 'react'
import Link from 'next/link'
import { useLang, LanguageSwitcher } from '@/lib/LanguageContext'
import { SidebarUserPanel } from '@/lib/SidebarUserPanel'

// ── Icons ─────────────────────────────────────────────────────────────────────
const ShieldIcon   = ({s=20}:{s?:number}) => <svg width={s} height={s} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></svg>
const BellIcon     = ({s=20}:{s?:number}) => <svg width={s} height={s} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"/><path d="M13.73 21a2 2 0 0 1-3.46 0"/></svg>
const BookIcon     = ({s=20}:{s?:number}) => <svg width={s} height={s} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z"/><path d="M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z"/></svg>
const PhoneIcon    = ({s=20}:{s?:number}) => <svg width={s} height={s} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07A19.5 19.5 0 0 1 4.69 12a19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 3.6 1.28h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L7.91 9a16 16 0 0 0 6.27 6.27l.91-.91a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z"/></svg>
const ActivityIcon = ({s=20}:{s?:number}) => <svg width={s} height={s} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="22 12 18 12 15 21 9 3 6 12 2 12"/></svg>
const LogOutIcon   = ({s=20}:{s?:number}) => <svg width={s} height={s} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/><polyline points="16 17 21 12 16 7"/><line x1="21" y1="12" x2="9" y2="12"/></svg>
const SparklesIcon = ({s=16}:{s?:number}) => <svg width={s} height={s} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m12 3-1.912 5.813a2 2 0 0 1-1.275 1.275L3 12l5.813 1.912a2 2 0 0 1 1.275 1.275L12 21l1.912-5.813a2 2 0 0 1 1.275-1.275L21 12l-5.813-1.912a2 2 0 0 1-1.275-1.275L12 3Z"/><path d="M5 3v4"/><path d="M3 5h4"/><path d="M19 17v4"/><path d="M17 19h4"/></svg>
const RefreshIcon  = ({s=16}:{s?:number}) => <svg width={s} height={s} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="23 4 23 10 17 10"/><polyline points="1 20 1 14 7 14"/><path d="M3.51 9a9 9 0 0 1 14.85-3.36L23 10M1 14l4.64 4.36A9 9 0 0 0 20.49 15"/></svg>
const AlertTriIcon = ({s=18}:{s?:number}) => <svg width={s} height={s} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m21.73 18-8-14a2 2 0 0 0-3.48 0l-8 14A2 2 0 0 0 4 21h16a2 2 0 0 0 1.73-3z"/><line x1="12" y1="9" x2="12" y2="13"/><line x1="12" y1="17" x2="12.01" y2="17"/></svg>
const ChevronDown  = ({s=15}:{s?:number}) => <svg width={s} height={s} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="6 9 12 15 18 9"/></svg>
const CheckCircle  = ({s=16}:{s?:number}) => <svg width={s} height={s} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/><polyline points="22 4 12 14.01 9 11.01"/></svg>
const ClockIcon    = ({s=13}:{s?:number}) => <svg width={s} height={s} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>
const XIcon        = ({s=14}:{s?:number}) => <svg width={s} height={s} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>

// ── Types ─────────────────────────────────────────────────────────────────────
// ── Toast notification type ──────────────────────────────────────────────────
interface Toast {
  id: string
  title: string
  body: string
  icon: string
  color: string
  bg: string
}

type AlertType = 'critical' | 'warning' | 'trend' | 'info' | 'tip'
interface Alert {
  id: string
  type: AlertType
  title: string
  body: string
  source: string
  region: string
  timeAgo: string
  actionLabel?: string
  actionUrl?: string
}

// ── Severity config ───────────────────────────────────────────────────────────
const SEV: Record<AlertType, { label:string; color:string; bg:string; border:string; icon:string }> = {
  critical: { label:'Critical', color:'#f87171', bg:'rgba(248,113,113,.09)', border:'rgba(248,113,113,.28)', icon:'🚨' },
  warning:  { label:'Warning',  color:'#fb923c', bg:'rgba(251,146,60,.09)',  border:'rgba(251,146,60,.28)',  icon:'⚠️' },
  trend:    { label:'Trend',    color:'#facc15', bg:'rgba(250,204,21,.08)',  border:'rgba(250,204,21,.25)',  icon:'📈' },
  info:     { label:'Info',     color:'#60a5fa', bg:'rgba(96,165,250,.09)',  border:'rgba(96,165,250,.25)',  icon:'ℹ️' },
  tip:      { label:'Tip',      color:'#34d399', bg:'rgba(52,211,153,.08)',  border:'rgba(52,211,153,.25)',  icon:'💡' },
}

// ── Static fallback alerts (shown when Gemini is rate-limited / offline) ──────
const FALLBACK_ALERTS: Alert[] = [
  {
    id:'f1', type:'critical',
    title:'Macau Scam Surge — PDRM Issues Nationwide Alert',
    body:'Malaysian police report a 43% surge in Macau scam calls in Q1 2025. Callers impersonate PDRM officers claiming your MyKad is linked to money laundering, then demand urgent fund transfers to a "safe account". Over RM 18 million lost in three months.',
    source:'PDRM Cyber Forensics', region:'🇲🇾 Malaysia', timeAgo:'2 hours ago',
    actionLabel:'Report to PDRM', actionUrl:'tel:999',
  },
  {
    id:'f2', type:'critical',
    title:'AI Voice Cloning Scam — Family Members Being Impersonated',
    body:'Cybercriminals are using free AI tools to clone voices of children and relatives from social media audio. Victims receive distress calls in a family member\'s voice demanding emergency money transfers. Always call back on the person\'s known number before sending any money.',
    source:'CyberSecurity Malaysia', region:'🇲🇾 Malaysia', timeAgo:'5 hours ago',
    actionLabel:'Learn More', actionUrl:'/awareness',
  },
  {
    id:'f3', type:'warning',
    title:'Bank Negara Malaysia: Spoofed BNM Numbers Being Used',
    body:'Fraudsters are spoofing Bank Negara Malaysia\'s official number (+603-2698-8044) to trick victims into revealing banking credentials. BNM confirms they will NEVER call asking for account numbers, PINs, or OTPs. Hang up immediately if you receive such a call.',
    source:'Bank Negara Malaysia', region:'🇲🇾 Malaysia', timeAgo:'1 day ago',
    actionLabel:'Call BNM LINK', actionUrl:'tel:1300885465',
  },
  {
    id:'f4', type:'warning',
    title:'MCMC Blocks 4,200 Scam Numbers in Ops Siber Sejahtera',
    body:'The Malaysian Communications and Multimedia Commission terminated 4,200 active scam numbers across all major carriers. 830 unregistered SIM cards were confiscated. Syndicates operating from boiler rooms in Kuala Lumpur, Johor Bahru, and Penang were targeted.',
    source:'MCMC Malaysia', region:'🇲🇾 Malaysia', timeAgo:'3 hours ago',
    actionLabel:'Report to MCMC', actionUrl:'tel:1800188030',
  },
  {
    id:'f5', type:'warning',
    title:'WhatsApp Voice Note Phishing — New Attack Method Detected',
    body:'Scammers in Malaysia and Singapore are sending AI-generated WhatsApp voice notes impersonating bank customer service representatives. The notes instruct recipients to call back a spoofed number to "unfreeze" their account. Never call numbers from unsolicited messages.',
    source:'Singapore Police Force', region:'🇲🇾🇸🇬 Regional', timeAgo:'6 hours ago',
  },
  {
    id:'f6', type:'trend',
    title:'Romance Scams Up 67% — Targeting Adults Over 50',
    body:'PDRM data shows romance scams increased 67% in 2024, with individuals aged 50+ being the primary targets. Scammers build emotional relationships over weeks before requesting money transfers for "emergencies". Total losses exceeded RM 95 million in 2024.',
    source:'PDRM Commercial Crime', region:'🇲🇾 Malaysia', timeAgo:'1 day ago',
  },
  {
    id:'f7', type:'trend',
    title:'Deepfake Video Calls Used in Corporate Fraud',
    body:'A new wave of corporate fraud uses real-time deepfake video calls to impersonate CEOs and CFOs during virtual meetings. Finance employees are instructed to authorise large wire transfers. The most notable case involved a HK$200 million loss in Hong Kong.',
    source:'Interpol Cybercrime Division', region:'🌏 Global', timeAgo:'2 days ago',
    actionLabel:'Read Alert', actionUrl:'/awareness',
  },
  {
    id:'f8', type:'trend',
    title:'OTP Bypass Scams Targeting Maybank & CIMB Customers',
    body:'A new scam technique contacts Maybank2u and CIMB Clicks users claiming suspicious activity, then intercepts OTP codes through social engineering rather than technical hacking. The caller creates panic and requests the OTP to "verify identity". Banks confirm they never request OTPs.',
    source:'Maybank Security Team', region:'🇲🇾 Malaysia', timeAgo:'4 hours ago',
  },
  {
    id:'f9', type:'info',
    title:'New Scam Hotline: MyCC Opens 24/7 Consumer Fraud Line',
    body:'The Malaysia Competition Commission (MyCC) has launched a dedicated 24/7 fraud reporting hotline at 1-800-88-9811 for consumers who encounter scam activity. Reports can also be filed online at myconsumerportal.kpdnhep.gov.my. All reports are reviewed within 48 hours.',
    source:'MyCC Malaysia', region:'🇲🇾 Malaysia', timeAgo:'12 hours ago',
    actionLabel:'Call MyCC', actionUrl:'tel:1800889811',
  },
  {
    id:'f10', type:'info',
    title:'Gemini 429 — Showing Cached Alerts',
    body:'Your Gemini API key has temporarily hit its rate limit (HTTP 429 — Too Many Requests). This happens on free-tier keys which allow approximately 15 requests per minute and 1,500 per day. These curated alerts are shown as a fallback. Wait 60 seconds and click Refresh to try loading live AI alerts again.',
    source:'VoiceGuard System', region:'🔧 System', timeAgo:'Just now',
    actionLabel:'Refresh Now', actionUrl:'#refresh',
  },
  {
    id:'f11', type:'tip',
    title:'Safety Tip: Establish a Family Code Word Today',
    body:'The most effective defence against AI voice cloning is a pre-agreed secret code word with close family members. If anyone calls claiming to be a family member in distress, ask for the code word. If they cannot say it, treat the call as a scam and hang up immediately.',
    source:'VoiceGuard Safety Tips', region:'🌏 All Regions', timeAgo:'Today',
  },
  {
    id:'f12', type:'tip',
    title:'Safety Tip: Never Act Immediately on an Unexpected Call',
    body:'Scammers rely on panic and urgency to bypass rational thinking. The golden rule: any unexpected call asking for money, personal details, or OTPs should be treated with extreme scepticism. Always hang up, verify independently, and call back using an official number you look up yourself.',
    source:'VoiceGuard Safety Tips', region:'🌏 All Regions', timeAgo:'Today',
  },
]

// ── Fetch alerts from server-side API route (keeps Gemini key off the browser) ─
async function fetchAlertsFromServer(): Promise<Alert[]> {
  const res = await fetch('/api/alerts')
  if (!res.ok) {
    const body = await res.json().catch(() => ({}))
    const msg = (body as { error?: string }).error ?? `HTTP ${res.status}`
    if (res.status === 429) throw new Error(`Rate limited (429). ${msg}`)
    throw new Error(msg)
  }
  const data = await res.json() as { alerts: Alert[]; generatedAt: string }
  if (!data.alerts || !Array.isArray(data.alerts)) throw new Error('No alerts returned')
  return data.alerts
}

// ── Nav ───────────────────────────────────────────────────────────────────────
const getNav = (t: (k:string)=>string) => [
  { label: t('nav_dashboard'),   icon: ActivityIcon, href: '/dashboard', active: false, disabled: false, badge: '' },
  { label: t('nav_awareness'),   icon: BookIcon,     href: '/awareness', active: false, disabled: false, badge: '' },
  { label: t('nav_alerts'),      icon: BellIcon,     href: '/alerts',    active: true,  disabled: false, badge: '' },
  { label: t('nav_detect'),      icon: PhoneIcon,    href: '/detect',    active: false, disabled: false, badge: '' },
]
// Filter tabs now use translations (see FILTER_TABS_IDS below)
const FILTER_TAB_IDS: ('all'|AlertType)[] = ['all','critical','warning','trend','info','tip']

// ── Notification pool: only non-system alerts ─────────────────────────────────
const NOTIF_POOL = FALLBACK_ALERTS.filter(a => a.id !== 'f10')

// ── Component ─────────────────────────────────────────────────────────────────
export default function AlertsPage() {
  const [alerts,         setAlerts]         = useState<Alert[]>(FALLBACK_ALERTS)
  const [filter,         setFilter]         = useState<'all'|AlertType>('all')
  const [loading,        setLoading]        = useState(false)
  const [aiLoaded,       setAiLoaded]       = useState(false)
  const [errorMsg,       setErrorMsg]       = useState('')
  const [retryIn,        setRetryIn]        = useState(0)
  const [expandedId,     setExpandedId]     = useState<string|null>(null)
  const [dismissed,      setDismissed]      = useState<Set<string>>(new Set())
  const [toasts,         setToasts]         = useState<Toast[]>([])
  const [notifPerm,      setNotifPerm]      = useState<NotificationPermission>('default')
  const [notifBanner,    setNotifBanner]    = useState(true)
  const [notifPoolIdx,   setNotifPoolIdx]   = useState(0)
  const [, startT]                          = useTransition()
  const { t }                               = useLang()
  const NAV                                 = getNav(t as (k:string)=>string)

  // ── Check notification permission on mount ────────────────────────────────
  useEffect(() => {
    if (typeof Notification !== 'undefined') {
      setNotifPerm(Notification.permission)
      if (Notification.permission === 'granted') setNotifBanner(false)
    }
  }, [])

  // ── Push a toast in-app ───────────────────────────────────────────────────
  const pushToast = useCallback((alert: Alert) => {
    const sev = SEV[alert.type] ?? SEV.info
    const toast: Toast = {
      id: `toast-${Date.now()}`,
      title: alert.title,
      body: alert.body.slice(0, 110) + (alert.body.length > 110 ? '…' : ''),
      icon: sev.icon,
      color: sev.color,
      bg: sev.bg,
    }
    setToasts(prev => [...prev.slice(-4), toast]) // keep max 5 toasts
    // Auto-dismiss after 6s
    setTimeout(() => setToasts(prev => prev.filter(t => t.id !== toast.id)), 6000)
  }, [])

  // ── Fire browser push notification ───────────────────────────────────────
  const fireBrowserNotif = useCallback((alert: Alert) => {
    if (typeof Notification === 'undefined' || Notification.permission !== 'granted') return
    try {
      const sev = SEV[alert.type] ?? SEV.info
      new Notification(`${sev.icon} VoiceGuard Alert`, {
        body: alert.title,
        icon: '/favicon.ico',
        tag: `vg-alert-${alert.id}`,
        requireInteraction: alert.type === 'critical',
      })
    } catch { /* browser may block in some contexts */ }
  }, [])

  // ── Request notification permission ──────────────────────────────────────
  const requestNotifPerm = async () => {
    if (typeof Notification === 'undefined') return
    const perm = await Notification.requestPermission()
    setNotifPerm(perm)
    if (perm === 'granted') {
      setNotifBanner(false)
      // Immediately fire a welcome notification
      try {
        new Notification('🔔 VoiceGuard Alerts Enabled', {
          body: 'You will now receive real-time cybersecurity alerts.',
          icon: '/favicon.ico',
        })
      } catch { /* ignored */ }
    }
  }

  // ── Auto-rotate alert notifications every 5 minutes ──────────────────────
  useEffect(() => {
    // Fire the first notification after 30s on mount (demo feel)
    const initTimer = setTimeout(() => {
      const pick = NOTIF_POOL[0]
      pushToast(pick)
      fireBrowserNotif(pick)
    }, 30_000)

    // Then every 5 minutes
    const interval = setInterval(() => {
      setNotifPoolIdx(prev => {
        const next = (prev + 1) % NOTIF_POOL.length
        const pick = NOTIF_POOL[next]
        pushToast(pick)
        fireBrowserNotif(pick)
        return next
      })
    }, 5 * 60_000)

    return () => { clearTimeout(initTimer); clearInterval(interval) }
  }, [pushToast, fireBrowserNotif])

  // Auto-load on mount
  useEffect(() => {
    loadAlerts()
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  // Countdown timer when rate-limited
  useEffect(() => {
    if (retryIn <= 0) return
    const timer = setInterval(() => setRetryIn(n => Math.max(0, n - 1)), 1000)
    return () => clearInterval(timer)
  }, [retryIn])

  const loadAlerts = async () => {
    setLoading(true)
    setErrorMsg('')
    setRetryIn(0)

    try {
      const items = await fetchAlertsFromServer()
      setAlerts(items)
      setAiLoaded(true)
      setDismissed(new Set())
      setExpandedId(null)
    } catch (e: unknown) {
      const msg = e instanceof Error ? e.message : String(e)
      setErrorMsg(msg)
      if (msg.includes('429') || msg.includes('Rate limited')) {
        setRetryIn(60)
        setAlerts(FALLBACK_ALERTS)
        setAiLoaded(false)
      }
    } finally {
      setLoading(false)
    }
  }

  const dismiss = (id: string) => setDismissed(prev => new Set([...prev, id]))

  const visible = alerts
    .filter(a => !dismissed.has(a.id))
    .filter(a => filter === 'all' || a.type === filter)

  const counts = FILTER_TAB_IDS.reduce((acc, id) => {
    acc[id] = id === 'all'
      ? alerts.filter(a => !dismissed.has(a.id)).length
      : alerts.filter(a => !dismissed.has(a.id) && a.type === id).length
    return acc
  }, {} as Record<string, number>)

  return (
    <div style={{display:'flex',minHeight:'100vh',background:'var(--bg-primary)',fontFamily:"'Inter',sans-serif"}}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&display=swap');

        .a-sidebar{width:240px;min-height:100vh;background:#ffffff;border-right:1px solid rgba(0,53,128,0.12);display:flex;flex-direction:column;padding:1.5rem 1rem;position:sticky;top:0;z-index:20;flex-shrink:0;box-shadow:2px 0 12px rgba(0,53,128,0.06)}
        .a-main{flex:1;min-width:0;padding:2rem 2.5rem;overflow-x:hidden;max-width:900px}
        @media(max-width:700px){.a-sidebar{display:none}.a-main{padding:1.25rem}}

        .nav-item{display:flex;align-items:center;gap:12px;padding:13px 14px;border-radius:12px;font-size:1rem;font-weight:600;color:#3d5080;text-decoration:none;cursor:pointer;transition:background .2s,color .2s;border:none;background:none;width:100%;text-align:left;margin-bottom:4px;font-family:'Inter',sans-serif;min-height:50px}
        .nav-item:hover:not(.nav-disabled){background:rgba(0,53,128,0.07);color:#003580}
        .nav-item.nav-active{background:rgba(0,53,128,0.1);color:#003580;border-left:3px solid #003580}
        .nav-item.nav-disabled{opacity:.45;cursor:default}
        .nav-badge{margin-left:auto;font-size:.7rem;font-weight:700;letter-spacing:.05em;padding:3px 9px;border-radius:99px;background:rgba(245,168,0,.15);color:#a07800;border:1px solid rgba(245,168,0,.3)}

        /* header */
        .page-head{display:flex;align-items:flex-start;justify-content:space-between;margin-bottom:1.75rem;gap:1rem;flex-wrap:wrap}
        .ai-badge{display:inline-flex;align-items:center;gap:5px;font-size:.68rem;font-weight:700;letter-spacing:.07em;text-transform:uppercase;padding:3px 10px;border-radius:99px;background:rgba(99,102,241,.18);border:1px solid rgba(99,102,241,.35);color:#a5b4fc;margin-bottom:.6rem}
        .page-title{font-size:1.6rem;font-weight:800;color:var(--text-primary);letter-spacing:-.025em;display:flex;align-items:center;gap:10px}
        .page-sub{font-size:.855rem;color:var(--text-secondary);margin-top:4px;line-height:1.5}

        /* refresh btn */
        .btn-refresh{display:flex;align-items:center;gap:7px;padding:9px 18px;border-radius:11px;border:1px solid rgba(99,102,241,.3);background:rgba(99,102,241,.08);color:#a5b4fc;font-size:.83rem;font-weight:600;cursor:pointer;font-family:'Inter',sans-serif;transition:background .2s,border-color .2s;white-space:nowrap}
        .btn-refresh:hover:not(:disabled){background:rgba(99,102,241,.15);border-color:rgba(99,102,241,.5)}
        .btn-refresh:disabled{opacity:.5;cursor:default}
        .spin{animation:spin .8s linear infinite}
        @keyframes spin{to{transform:rotate(360deg)}}

        /* status bar */
        .status-bar{display:flex;align-items:center;gap:10px;padding:10px 14px;border-radius:10px;margin-bottom:1.25rem;font-size:.82rem}
        .status-bar.ai{background:rgba(52,211,153,.07);border:1px solid rgba(52,211,153,.2);color:#34d399}
        .status-bar.fallback{background:rgba(96,165,250,.07);border:1px solid rgba(96,165,250,.2);color:#60a5fa}
        .status-bar.err{background:rgba(251,146,60,.07);border:1px solid rgba(251,146,60,.22);color:#fb923c}

        /* filter tabs */
        .filter-tabs{display:flex;gap:6px;flex-wrap:wrap;margin-bottom:1.5rem}
        .ftab{display:flex;align-items:center;gap:5px;padding:6px 14px;border-radius:99px;font-size:.8rem;font-weight:600;border:1px solid var(--border);background:var(--bg-card);color:var(--text-muted);cursor:pointer;transition:all .18s;font-family:'Inter',sans-serif}
        .ftab:hover{color:var(--text-primary);border-color:rgba(99,102,241,.3)}
        .ftab.active{background:rgba(99,102,241,.14);border-color:rgba(99,102,241,.4);color:var(--accent-primary)}
        .ftab-count{font-size:.65rem;font-weight:700;padding:1px 6px;border-radius:99px;background:rgba(255,255,255,.08);min-width:18px;text-align:center}

        /* alert card */
        .alert-card{border-radius:16px;border:1px solid;margin-bottom:10px;overflow:hidden;transition:transform .18s,box-shadow .18s}
        .alert-card:hover{transform:translateY(-1px)}
        .alert-header{display:flex;align-items:flex-start;gap:12px;padding:1rem 1.25rem .875rem;cursor:pointer}
        .alert-type-badge{font-size:.65rem;font-weight:700;letter-spacing:.06em;text-transform:uppercase;padding:3px 9px;border-radius:99px;border:1px solid;flex-shrink:0;margin-top:1px}
        .alert-title{font-size:.95rem;font-weight:700;color:var(--text-primary);line-height:1.4;flex:1}
        .alert-meta{display:flex;align-items:center;gap:8px;margin-top:4px;flex-wrap:wrap}
        .alert-region{font-size:.72rem;color:var(--text-muted)}
        .alert-time{display:flex;align-items:center;gap:3px;font-size:.72rem;color:var(--text-muted)}
        .alert-source{font-size:.7rem;font-weight:600;padding:1px 7px;border-radius:5px;background:rgba(255,255,255,.06);color:var(--text-muted)}
        .dismiss-btn{background:none;border:none;cursor:pointer;color:var(--text-muted);padding:2px;display:flex;border-radius:5px;transition:color .15s,background .15s;flex-shrink:0}
        .dismiss-btn:hover{color:#f87171;background:rgba(248,113,113,.1)}
        .expand-btn-row{display:flex;align-items:center;gap:4px;padding:0 1.25rem .875rem;font-size:.78rem;font-weight:600;color:var(--accent-primary);cursor:pointer;background:none;border:none;font-family:'Inter',sans-serif;transition:opacity .2s}
        .expand-btn-row:hover{opacity:.75}
        .chevron-icon{transition:transform .25s}
        .chevron-icon.open{transform:rotate(180deg)}
        .alert-body{border-top:1px solid rgba(255,255,255,.06);padding:1rem 1.25rem}
        .alert-body-text{font-size:.86rem;color:var(--text-secondary);line-height:1.7}
        .action-btn{display:inline-flex;align-items:center;gap:6px;margin-top:.875rem;padding:8px 16px;border-radius:8px;background:linear-gradient(135deg,#6366f1,#8b5cf6);color:white;font-size:.8rem;font-weight:600;text-decoration:none;border:none;cursor:pointer;font-family:'Inter',sans-serif;box-shadow:0 3px 12px rgba(99,102,241,.3);transition:opacity .2s}
        .action-btn:hover{opacity:.88}
        @keyframes revealDown{from{opacity:0;transform:translateY(-6px)}to{opacity:1;transform:translateY(0)}}
        .reveal{animation:revealDown .22s cubic-bezier(.16,1,.3,1)}

        /* skeleton */
        .skel{background:linear-gradient(90deg,rgba(255,255,255,.04) 0%,rgba(255,255,255,.09) 50%,rgba(255,255,255,.04) 100%);background-size:200% 100%;animation:shimmer 1.4s infinite;border-radius:8px}
        @keyframes shimmer{0%{background-position:-200% 0}100%{background-position:200% 0}}
        .skel-card{background:var(--bg-card);border:1px solid var(--border);border-radius:16px;padding:1rem 1.25rem;margin-bottom:10px}

        /* retry countdown */
        .retry-bar{display:flex;align-items:center;gap:10px;padding:10px 14px;border-radius:10px;background:rgba(251,146,60,.07);border:1px solid rgba(251,146,60,.22);color:#fb923c;font-size:.82rem;margin-bottom:1.25rem}
        .retry-countdown{font-size:1rem;font-weight:800;min-width:28px;text-align:center}

        /* empty state */
        .empty{text-align:center;padding:3.5rem;color:var(--text-muted);font-size:.9rem}

        /* notification dot pulse */
        @keyframes ring-pulse{0%{box-shadow:0 0 0 0 rgba(248,113,113,.5)}70%{box-shadow:0 0 0 8px rgba(248,113,113,0)}100%{box-shadow:0 0 0 0 rgba(248,113,113,0)}}
        .notif-dot{width:8px;height:8px;border-radius:50%;background:#f87171;display:inline-block;animation:ring-pulse 2s ease-out infinite;flex-shrink:0}

        /* ── Push notification permission banner ── */
        .notif-banner{
          display:flex;align-items:center;gap:12px;padding:12px 16px;
          border-radius:14px;margin-bottom:1.25rem;
          background:linear-gradient(135deg,rgba(99,102,241,.12),rgba(139,92,246,.08));
          border:1px solid rgba(99,102,241,.3);
          font-size:.84rem;
        }
        .notif-banner-icon{font-size:1.4rem;flex-shrink:0;animation:bell-shake 2.5s ease-in-out infinite}
        @keyframes bell-shake{
          0%,100%{transform:rotate(0)}
          10%{transform:rotate(12deg)}
          20%{transform:rotate(-10deg)}
          30%{transform:rotate(8deg)}
          40%{transform:rotate(-6deg)}
          50%{transform:rotate(0)}
        }
        .btn-allow{
          margin-left:auto;flex-shrink:0;
          display:flex;align-items:center;gap:6px;
          padding:7px 16px;border-radius:9px;
          background:linear-gradient(135deg,#6366f1,#8b5cf6);
          color:white;font-size:.8rem;font-weight:700;
          border:none;cursor:pointer;font-family:'Inter',sans-serif;
          box-shadow:0 3px 14px rgba(99,102,241,.4);
          transition:opacity .2s;
        }
        .btn-allow:hover{opacity:.88}
        .btn-dismiss-banner{
          background:none;border:none;cursor:pointer;
          color:var(--text-muted);padding:4px;border-radius:6px;
          display:flex;flex-shrink:0;transition:color .15s;
        }
        .btn-dismiss-banner:hover{color:var(--text-primary)}

        /* ── Toast notification cards (bottom-right) ── */
        .toast-container{
          position:fixed;bottom:24px;right:24px;z-index:9999;
          display:flex;flex-direction:column;gap:10px;
          pointer-events:none;
          max-width:340px;width:calc(100vw - 48px);
        }
        .toast-card{
          pointer-events:all;
          display:flex;align-items:flex-start;gap:11px;
          padding:13px 14px;
          border-radius:14px;
          background:rgba(18,20,34,.97);
          border:1px solid rgba(255,255,255,.12);
          box-shadow:0 8px 32px rgba(0,0,0,.55),0 0 0 1px rgba(99,102,241,.18);
          backdrop-filter:blur(16px);
          animation:toastIn .32s cubic-bezier(.16,1,.3,1);
          cursor:pointer;
        }
        @keyframes toastIn{
          from{opacity:0;transform:translateX(110%)}
          to{opacity:1;transform:translateX(0)}
        }
        .toast-exiting{
          animation:toastOut .28s cubic-bezier(.4,0,1,1) forwards;
        }
        @keyframes toastOut{
          to{opacity:0;transform:translateX(110%)}
        }
        .toast-icon-wrap{
          width:36px;height:36px;border-radius:10px;flex-shrink:0;
          display:flex;align-items:center;justify-content:center;
          font-size:1.1rem;
        }
        .toast-app-label{
          font-size:.62rem;font-weight:800;letter-spacing:.07em;
          text-transform:uppercase;color:#a5b4fc;margin-bottom:3px;
          display:flex;align-items:center;gap:5px;
        }
        .toast-title{
          font-size:.82rem;font-weight:700;color:var(--text-primary);
          line-height:1.35;margin-bottom:3px;
        }
        .toast-body{
          font-size:.75rem;color:var(--text-secondary);
          line-height:1.45;
        }
        .toast-close{
          background:none;border:none;cursor:pointer;
          color:rgba(255,255,255,.3);padding:2px;flex-shrink:0;
          display:flex;border-radius:5px;margin-left:auto;
          transition:color .15s;
        }
        .toast-close:hover{color:rgba(255,255,255,.7)}
        .toast-time{
          font-size:.66rem;color:var(--text-muted);margin-top:4px;
        }
      `}</style>

      {/* ── Sidebar ── */}
      <aside className="a-sidebar" style={{position:'relative'}}>
        <div style={{position:'absolute',top:0,left:0,right:0,height:'4px',background:'linear-gradient(90deg,#003580,#1a4fa0,#CC0001)'}}/>
        <div style={{display:'flex',alignItems:'center',gap:12,marginBottom:'2rem',paddingLeft:4,marginTop:'0.75rem'}}>
          <div style={{width:40,height:40,borderRadius:11,background:'linear-gradient(135deg,#003580,#1a4fa0)',display:'flex',alignItems:'center',justifyContent:'center',boxShadow:'0 4px 14px rgba(0,53,128,.3)'}}>
            <ShieldIcon s={18}/>
          </div>
          <span style={{fontWeight:800,fontSize:'1.05rem',letterSpacing:'-0.02em',color:'#003580'}}>
            VoiceGuard
          </span>
        </div>
        <nav style={{flex:1}}>
          <div style={{fontSize:'.7rem',fontWeight:800,letterSpacing:'.1em',textTransform:'uppercase',color:'#8898bb',padding:'0 14px',marginBottom:10}}>Main Menu</div>
          {NAV.map(n=>(
            <Link key={n.label} href={n.disabled?'#':n.href}
              className={`nav-item${n.active?' nav-active':''}${n.disabled?' nav-disabled':''}`}>
              <n.icon s={20}/>{n.label}
              {n.badge&&<span className="nav-badge">{n.badge}</span>}
            </Link>
          ))}
        </nav>
        <SidebarUserPanel />
      </aside>

      {/* ── Main ── */}
      <main className="a-main">

        {/* Page header */}
        <div className="page-head">
          <div>
            <div className="ai-badge"><SparklesIcon s={11}/> {t('hub_ai_badge')}</div>
            <div className="page-title">
              <BellIcon s={24}/>
              {t('alerts_title')}
            </div>
            <div className="page-sub">
              {t('alerts_sub')}
            </div>
          </div>
          <div style={{display:'flex',alignItems:'center',gap:10}}>
            <LanguageSwitcher/>
            <button className="btn-refresh" onClick={loadAlerts} disabled={loading||retryIn>0}>
              <span className={loading?'spin':''} style={{display:'flex'}}>
                <RefreshIcon s={15}/>
              </span>
              {retryIn>0 ? `${t('alerts_retry')} ${retryIn}s` : loading ? t('alerts_loading') : t('alerts_refresh')}
            </button>
          </div>
        </div>

        {/* ── Notification permission banner ── */}
        {notifBanner && notifPerm !== 'denied' && notifPerm !== 'granted' && (
          <div className="notif-banner">
            <span className="notif-banner-icon">🔔</span>
            <div style={{flex:1,minWidth:0}}>
              <div style={{fontWeight:700,color:'var(--text-primary)',marginBottom:2}}>Enable Push Alerts</div>
              <div style={{color:'var(--text-secondary)',fontSize:'.78rem',lineHeight:1.45}}>
                Get real-time cybersecurity warnings delivered to you — like your phone&apos;s notification centre.
              </div>
            </div>
            <button className="btn-allow" onClick={requestNotifPerm}>
              <CheckCircle s={13}/> Allow
            </button>
            <button className="btn-dismiss-banner" onClick={()=>setNotifBanner(false)} title="Dismiss">
              <XIcon s={13}/>
            </button>
          </div>
        )}
        {notifPerm === 'granted' && (
          <div className="status-bar ai" style={{marginBottom:'1.25rem'}}>
            <CheckCircle s={14}/>
            <span>🔔 <strong>Push alerts active</strong> — alerts rotate every 5 minutes. You&apos;ll receive browser notifications even when the tab is in the background.</span>
          </div>
        )}

        {/* Status bar */}
        {aiLoaded&&!loading&&(
          <div className="status-bar ai">
            <span className="notif-dot"/>
            <span>{t('alerts_live')} — {alerts.length} alerts</span>
          </div>
        )}
        {!aiLoaded&&!loading&&!errorMsg&&(
          <div className="status-bar fallback">
            <span>📌 {t('alerts_fallback')}</span>
          </div>
        )}

        {/* Error + rate limit */}
        {errorMsg&&(
          <div className="status-bar err">
            <AlertTriIcon s={15}/>
            <div style={{flex:1}}>
              <strong>
                {errorMsg.includes('429')||errorMsg.includes('Rate limited')
                  ? '⏳ Rate Limited (429) — Free tier limit reached'
                  : 'Could not load live alerts'}
              </strong>
              <div style={{fontSize:'.78rem',opacity:.8,marginTop:2}}>{errorMsg}</div>
            </div>
          </div>
        )}
        {retryIn>0&&(
          <div className="retry-bar">
            <AlertTriIcon s={15}/>
            <span style={{flex:1}}>Rate limit active. Showing fallback alerts. Auto-retry available in:</span>
            <span className="retry-countdown">{retryIn}s</span>
            <button className="btn-refresh" style={{padding:'5px 12px',fontSize:'.75rem'}}
              onClick={loadAlerts} disabled={retryIn>0}>
              Wait…
            </button>
          </div>
        )}

        {/* Filter tabs */}
        <div className="filter-tabs">
          {FILTER_TAB_IDS.map(id=>{
            const labelKey = `alerts_filter_${id==='all'?'all':id==='critical'?'crit':id==='warning'?'warn':id}` as Parameters<typeof t>[0]
            return (
              <button key={id} className={`ftab${filter===id?' active':''}`}
                onClick={()=>setFilter(id)}>
                {id!=='all'&&<span>{SEV[id as AlertType]?.icon}</span>}
                {t(labelKey)}
                {counts[id]>0&&<span className="ftab-count">{counts[id]}</span>}
              </button>
            )
          })}
        </div>

        {/* Loading skeletons */}
        {loading&&[1,2,3,4].map(i=>(
          <div key={i} className="skel-card">
            <div style={{display:'flex',gap:8,marginBottom:10}}>
              <div className="skel" style={{width:64,height:22,borderRadius:99}}/>
              <div className="skel" style={{width:90,height:22,borderRadius:99}}/>
              <div className="skel" style={{width:60,height:22,borderRadius:99,marginLeft:'auto'}}/>
            </div>
            <div className="skel" style={{height:18,width:'75%',marginBottom:8}}/>
            <div className="skel" style={{height:13,width:'55%'}}/>
          </div>
        ))}

        {/* Empty state */}
        {!loading&&visible.length===0&&(
          <div className="empty">
            <BellIcon s={40}/>
            <p style={{marginTop:12}}>{t('alerts_empty')}</p>
            <p style={{fontSize:'.82rem',marginTop:4}}>{t('alerts_empty_sub')}</p>
          </div>
        )}

        {/* Alert cards */}
        {!loading&&visible.map(alert=>{
          const sev     = SEV[alert.type] ?? SEV.info
          const isOpen  = expandedId===alert.id
          const isRefreshCard = alert.actionUrl==='#refresh'

          return (
            <div key={alert.id} className="alert-card"
              style={{background:sev.bg,borderColor:isOpen?sev.border:`${sev.border.replace('.28','.16').replace('.25','.12')}`,boxShadow:isOpen?`0 0 24px ${sev.bg}`:undefined}}>

              {/* Header row */}
              <div className="alert-header" onClick={()=>setExpandedId(isOpen?null:alert.id)}>
                <div style={{flex:1,minWidth:0}}>
                  <div style={{display:'flex',alignItems:'center',gap:8,marginBottom:6,flexWrap:'wrap'}}>
                    <span className="alert-type-badge"
                      style={{color:sev.color,background:`${sev.color}18`,borderColor:`${sev.color}35`}}>
                      {sev.icon} {sev.label}
                    </span>
                    <span className="alert-source">{alert.source}</span>
                  </div>
                  <div className="alert-title">{alert.title}</div>
                  <div className="alert-meta">
                    <span className="alert-region">{alert.region}</span>
                    <span style={{color:'var(--text-muted)',fontSize:'.65rem'}}>•</span>
                    <span className="alert-time"><ClockIcon s={11}/>{alert.timeAgo}</span>
                  </div>
                </div>
                <button className="dismiss-btn" title="Dismiss"
                  onClick={e=>{e.stopPropagation();dismiss(alert.id)}}>
                  <XIcon s={14}/>
                </button>
              </div>

              {/* Expand toggle */}
              <button className="expand-btn-row" onClick={()=>setExpandedId(isOpen?null:alert.id)}>
                {isOpen?t('alerts_show_less'):t('alerts_read_more')}
                <span className={`chevron-icon${isOpen?' open':''}`}><ChevronDown s={14}/></span>
              </button>

              {/* Expanded body */}
              {isOpen&&(
                <div className="alert-body reveal">
                  <div className="alert-body-text">{alert.body}</div>
                  {alert.actionLabel&&(
                    isRefreshCard
                      ? <button className="action-btn" onClick={loadAlerts}>{alert.actionLabel}</button>
                      : <a href={alert.actionUrl} className="action-btn"
                          target={alert.actionUrl?.startsWith('http')?'_blank':undefined}
                          rel="noreferrer">
                          {alert.actionLabel}
                        </a>
                  )}
                </div>
              )}
            </div>
          )
        })}

        {/* Dismissed all message */}
        {!loading&&visible.length===0&&dismissed.size>0&&(
          <div style={{textAlign:'center',marginTop:'1rem'}}>
            <button className="btn-refresh"
              onClick={()=>{setDismissed(new Set());setFilter('all')}}>
              {t('alerts_restore')} {dismissed.size} {dismissed.size!==1?t('alerts_dismissed_pl'):t('alerts_dismissed')}
            </button>
          </div>
        )}

      </main>

      {/* ── Toast notification container (bottom-right) ── */}
      <div className="toast-container" aria-live="polite" aria-atomic="false">
        {toasts.map(toast => (
          <div
            key={toast.id}
            className="toast-card"
            onClick={() => setToasts(prev => prev.filter(t => t.id !== toast.id))}
          >
            <div className="toast-icon-wrap" style={{background:toast.bg}}>
              <span style={{fontSize:'1rem'}}>{toast.icon}</span>
            </div>
            <div style={{flex:1,minWidth:0}}>
              <div className="toast-app-label">
                <span style={{width:6,height:6,borderRadius:'50%',background:toast.color,display:'inline-block',flexShrink:0}}/>
                VoiceGuard · Security Alert
              </div>
              <div className="toast-title">{toast.title}</div>
              <div className="toast-body">{toast.body}</div>
              <div className="toast-time">Just now · Tap to dismiss</div>
            </div>
            <button className="toast-close" onClick={e=>{e.stopPropagation();setToasts(prev=>prev.filter(t=>t.id!==toast.id))}}>
              <XIcon s={12}/>
            </button>
          </div>
        ))}
      </div>
    </div>
  )
}
