'use client'

import { useState, useEffect, useTransition, useCallback } from 'react'
import Link from 'next/link'
import { useLang, LanguageSwitcher } from '@/lib/LanguageContext'
import { SidebarUserPanel } from '@/lib/SidebarUserPanel'

// ── Icons ─────────────────────────────────────────────────────────────────────
const ShieldIcon    = ({s=20}:{s?:number}) => <svg width={s} height={s} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></svg>
const BellIcon      = ({s=20}:{s?:number}) => <svg width={s} height={s} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"/><path d="M13.73 21a2 2 0 0 1-3.46 0"/></svg>
const BookIcon      = ({s=20}:{s?:number}) => <svg width={s} height={s} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z"/><path d="M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z"/></svg>
const PhoneIcon     = ({s=20}:{s?:number}) => <svg width={s} height={s} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07A19.5 19.5 0 0 1 4.69 12a19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 3.6 1.28h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L7.91 9a16 16 0 0 0 6.27 6.27l.91-.91a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z"/></svg>
const ActivityIcon  = ({s=20}:{s?:number}) => <svg width={s} height={s} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="22 12 18 12 15 21 9 3 6 12 2 12"/></svg>
const SparklesIcon  = ({s=16}:{s?:number}) => <svg width={s} height={s} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m12 3-1.912 5.813a2 2 0 0 1-1.275 1.275L3 12l5.813 1.912a2 2 0 0 1 1.275 1.275L12 21l1.912-5.813a2 2 0 0 1 1.275-1.275L21 12l-5.813-1.912a2 2 0 0 1-1.275-1.275L12 3Z"/><path d="M5 3v4"/><path d="M3 5h4"/><path d="M19 17v4"/><path d="M17 19h4"/></svg>
const RefreshIcon   = ({s=16}:{s?:number}) => <svg width={s} height={s} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="23 4 23 10 17 10"/><polyline points="1 20 1 14 7 14"/><path d="M3.51 9a9 9 0 0 1 14.85-3.36L23 10M1 14l4.64 4.36A9 9 0 0 0 20.49 15"/></svg>
const ChevronDown   = ({s=15}:{s?:number}) => <svg width={s} height={s} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="6 9 12 15 18 9"/></svg>
const CheckCircle   = ({s=16}:{s?:number}) => <svg width={s} height={s} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/><polyline points="22 4 12 14.01 9 11.01"/></svg>
const ClockIcon     = ({s=13}:{s?:number}) => <svg width={s} height={s} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>
const XIcon         = ({s=14}:{s?:number}) => <svg width={s} height={s} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
const SendIcon      = ({s=14}:{s?:number}) => <svg width={s} height={s} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="22" y1="2" x2="11" y2="13"/><polygon points="22 2 15 22 11 13 2 9 22 2"/></svg>
const TagIcon       = ({s=12}:{s?:number}) => <svg width={s} height={s} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M20.59 13.41l-7.17 7.17a2 2 0 0 1-2.83 0L2 12V2h10l8.59 8.59a2 2 0 0 1 0 2.82z"/><line x1="7" y1="7" x2="7.01" y2="7"/></svg>
const AlertTriIcon  = ({s=18}:{s?:number}) => <svg width={s} height={s} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m21.73 18-8-14a2 2 0 0 0-3.48 0l-8 14A2 2 0 0 0 4 21h16a2 2 0 0 0 1.73-3z"/><line x1="12" y1="9" x2="12" y2="13"/><line x1="12" y1="17" x2="12.01" y2="17"/></svg>
const MapPinIcon    = ({s=12}:{s?:number}) => <svg width={s} height={s} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/><circle cx="12" cy="10" r="3"/></svg>
const ExternalIcon  = ({s=12}:{s?:number}) => <svg width={s} height={s} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"/><polyline points="15 3 21 3 21 9"/><line x1="10" y1="14" x2="21" y2="3"/></svg>

// ── Module-level counter for guaranteed unique toast IDs ─────────────────────
let _toastCounter = 0

// ── Types ─────────────────────────────────────────────────────────────────────
interface Toast {
  id: string; title: string; body: string; icon: string; color: string; bg: string
}
type AlertType = 'critical' | 'warning' | 'trend' | 'info' | 'tip'
interface Alert {
  id: string; type: AlertType; title: string; body: string
  source: string; region: string; timeAgo: string
  category?: string; actionLabel?: string; actionUrl?: string
  isNew?: boolean; tags?: string[]
}

// ── Severity config ───────────────────────────────────────────────────────────
const SEV: Record<AlertType, { label:string; color:string; bg:string; border:string; icon:string; gradient:string }> = {
  critical: { label:'Critical', color:'#f87171', bg:'rgba(248,113,113,.07)', border:'rgba(248,113,113,.30)', icon:'🚨', gradient:'linear-gradient(180deg,#f87171,#ef4444)' },
  warning:  { label:'Warning',  color:'#fb923c', bg:'rgba(251,146,60,.07)',  border:'rgba(251,146,60,.28)',  icon:'⚠️', gradient:'linear-gradient(180deg,#fb923c,#f97316)' },
  trend:    { label:'Trend',    color:'#facc15', bg:'rgba(250,204,21,.06)',  border:'rgba(250,204,21,.25)',  icon:'📈', gradient:'linear-gradient(180deg,#facc15,#eab308)' },
  info:     { label:'Info',     color:'#60a5fa', bg:'rgba(96,165,250,.07)',  border:'rgba(96,165,250,.25)',  icon:'ℹ️', gradient:'linear-gradient(180deg,#60a5fa,#3b82f6)' },
  tip:      { label:'Tip',      color:'#34d399', bg:'rgba(52,211,153,.07)',  border:'rgba(52,211,153,.25)',  icon:'💡', gradient:'linear-gradient(180deg,#34d399,#10b981)' },
}

// ── Region flag helper ────────────────────────────────────────────────────────
const regionFlag = (r: string) => {
  if (!r) return ''
  const s = r.toLowerCase()
  if (s === 'my' || s.includes('malay')) return '🇲🇾 MY'
  if (s === 'sg' || s.includes('singap')) return '🇸🇬 SG'
  if (s === 'global' || s.includes('global')) return '🌏 Global'
  return r
}

// ── Static fallback (used before API loads) ───────────────────────────────────
const QUICK_FALLBACK: Alert[] = [
  { id:'f1', type:'critical', title:'Macau Scam Surge — PDRM Alert', body:'Over RM 18M lost to Macau scam calls in Q1 2025. Callers impersonate PDRM officers demanding fund transfers to a "safe account".', source:'PDRM', region:'MY', timeAgo:'2 hours ago', isNew:true, tags:['macau-scam','pdrm'], actionLabel:'Report to PDRM', actionUrl:'tel:999' },
  { id:'f2', type:'critical', title:'AI Voice Cloning Now Targets Malaysian Families', body:'AI tools clone voices of relatives from social media. Victims receive fake emergency calls. Always use a secret family code word.', source:'CyberSecurity Malaysia', region:'MY', timeAgo:'5 hours ago', isNew:true, tags:['voice-cloning','ai'], actionLabel:'Learn More', actionUrl:'/awareness' },
  { id:'f3', type:'warning',  title:'Spoofed Bank Negara Numbers in Use', body:'Fraudsters spoof BNM\'s official number. BNM will NEVER ask for account numbers, PINs, or OTPs. Hang up immediately.', source:'Bank Negara Malaysia', region:'MY', timeAgo:'1 day ago', isNew:false, tags:['bnm','spoofing'], actionLabel:'Call BNM LINK', actionUrl:'tel:1300885465' },
  { id:'f4', type:'trend',    title:'Romance Scams Up 67% — Adults Over 50 Targeted', body:'PDRM data: romance scams rose 67% in 2024. Total losses exceeded RM 95M. Scammers build trust over weeks before asking for money.', source:'PDRM', region:'MY', timeAgo:'1 day ago', isNew:false, tags:['romance-scam','seniors'] },
  { id:'f5', type:'tip',      title:'Safety Tip: Establish a Family Code Word Today', body:'Agree on a secret code word with family members. If anyone calls in distress, ask for the code word. If they cannot say it — it is a scam.', source:'VoiceGuard Tips', region:'Global', timeAgo:'Today', isNew:false, tags:['safety','family'] },
]

// ── Nav ───────────────────────────────────────────────────────────────────────
const getNav = (t: (k:string)=>string) => [
  { label: t('nav_dashboard'),   icon: ActivityIcon, href: '/dashboard', active: false, disabled: false },
  { label: t('nav_awareness'),   icon: BookIcon,     href: '/awareness', active: false, disabled: false },
  { label: t('nav_alerts'),      icon: BellIcon,     href: '/alerts',    active: true,  disabled: false },
  { label: t('nav_detect'),      icon: PhoneIcon,    href: '/detect',    active: false, disabled: false },
]
const FILTER_TAB_IDS: ('all'|AlertType)[] = ['all','critical','warning','trend','info','tip']

// ── Notification pool ─────────────────────────────────────────────────────────
const NOTIF_POOL = QUICK_FALLBACK.filter(a => a.type !== 'info' && a.type !== 'tip')

type PushState = 'unsupported' | 'default' | 'subscribing' | 'subscribed' | 'denied' | 'sending'

// ── Component ─────────────────────────────────────────────────────────────────
export default function AlertsPage() {
  const [alerts,       setAlerts]       = useState<Alert[]>(QUICK_FALLBACK)
  const [filter,       setFilter]       = useState<'all'|AlertType>('all')
  const [loading,      setLoading]      = useState(true)
  const [loadedAt,     setLoadedAt]     = useState<string | null>(null)
  const [expandedId,   setExpandedId]   = useState<string|null>(null)
  const [dismissed,    setDismissed]    = useState<Set<string>>(new Set())
  const [toasts,       setToasts]       = useState<Toast[]>([])
  const [pushState,    setPushState]    = useState<PushState>('default')
  const [pushError,    setPushError]    = useState('')
  const [notifIdx,     setNotifIdx]     = useState(0)
  const [testSent,     setTestSent]     = useState(false)
  const [tickerIdx,    setTickerIdx]    = useState(0)
  const [, startT]                      = useTransition()
  const { t }                           = useLang()
  const NAV                             = getNav(t as (k:string)=>string)
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)

  // ── Push support check ────────────────────────────────────────────────────
  useEffect(() => {
    if (typeof window === 'undefined') return
    if (!('serviceWorker' in navigator) || !('PushManager' in window)) {
      setPushState('unsupported'); return
    }
    navigator.serviceWorker.ready.then(reg =>
      reg.pushManager.getSubscription().then(sub => {
        if (sub) setPushState('subscribed')
        else if (Notification.permission === 'denied') setPushState('denied')
        else setPushState('default')
      })
    ).catch(() => setPushState('default'))
  }, [])

  // ── Subscribe ─────────────────────────────────────────────────────────────
  const subscribeToPush = async () => {
    setPushState('subscribing'); setPushError('')
    try {
      const reg = await navigator.serviceWorker.ready
      const vapidKey = process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY
      if (!vapidKey) throw new Error('VAPID key not configured')
      const sub = await reg.pushManager.subscribe({ userVisibleOnly: true, applicationServerKey: vapidKey })
      const res = await fetch('/api/push/subscribe', { method:'POST', headers:{'Content-Type':'application/json'}, body: JSON.stringify(sub.toJSON()) })
      if (!res.ok) throw new Error('Failed to save subscription')
      setPushState('subscribed')
      pushToast({ id:'f5', type:'tip', title:'🔔 Push Alerts Enabled!', body:"You'll now receive VoiceGuard security alerts even when your browser is closed.", source:'VoiceGuard', region:'', timeAgo:'Just now' })
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : String(err)
      if (msg.includes('denied') || msg.includes('permission')) setPushState('denied')
      else { setPushState('default'); setPushError(msg) }
    }
  }

  const unsubscribeFromPush = async () => {
    try {
      const reg = await navigator.serviceWorker.ready
      const sub = await reg.pushManager.getSubscription()
      if (sub) {
        await fetch('/api/push/subscribe', { method:'DELETE', headers:{'Content-Type':'application/json'}, body: JSON.stringify({ endpoint: sub.endpoint }) })
        await sub.unsubscribe()
      }
      setPushState('default')
    } catch { /* ignore */ }
  }

  const sendTestPush = async () => {
    setPushState('sending'); setTestSent(false)
    try {
      const pick = NOTIF_POOL[Math.floor(Math.random() * NOTIF_POOL.length)]
      const res = await fetch('/api/push/send', { method:'POST', headers:{'Content-Type':'application/json'}, body: JSON.stringify({ title: `${SEV[pick.type].icon} ${pick.title}`, body: pick.body.slice(0,120)+'…', url:'/alerts', tag:`vg-test-${Date.now()}` }) })
      if (!res.ok) throw new Error('Send failed')
      setTestSent(true)
      setTimeout(() => setTestSent(false), 4000)
    } catch { /* ignore */ }
    finally { setPushState('subscribed') }
  }

  // ── Toast ─────────────────────────────────────────────────────────────────
  const pushToast = useCallback((alert: Alert) => {
    const sev = SEV[alert.type] ?? SEV.info
    // Combine timestamp + incrementing counter → always unique, even if called
    // within the same millisecond (React StrictMode double-invokes effects)
    const toast: Toast = {
      id:    `toast-${Date.now()}-${++_toastCounter}`,
      title: alert.title,
      body:  alert.body.slice(0, 110) + (alert.body.length > 110 ? '…' : ''),
      icon:  sev.icon,
      color: sev.color,
      bg:    sev.bg,
    }
    setToasts(prev => [...prev.slice(-4), toast])
    setTimeout(() => setToasts(prev => prev.filter(t => t.id !== toast.id)), 6000)
  }, [])

  // ── Auto-rotate toasts ────────────────────────────────────────────────────
  useEffect(() => {
    const init = setTimeout(() => pushToast(NOTIF_POOL[0]), 30_000)
    const iv   = setInterval(() => {
      setNotifIdx(prev => { const next = (prev+1) % NOTIF_POOL.length; pushToast(NOTIF_POOL[next]); return next })
    }, 5*60_000)
    return () => { clearTimeout(init); clearInterval(iv) }
  }, [pushToast])

  // ── Ticker rotation ───────────────────────────────────────────────────────
  useEffect(() => {
    const iv = setInterval(() => setTickerIdx(p => (p+1) % Math.max(1, alerts.filter(a => a.type === 'critical' || a.type === 'warning').length)), 5000)
    return () => clearInterval(iv)
  }, [alerts])

  // ── Load alerts from API ──────────────────────────────────────────────────
  const loadAlerts = useCallback(async () => {
    setLoading(true)
    try {
      const res = await fetch('/api/alerts', { cache: 'no-store' })
      if (!res.ok) throw new Error(`HTTP ${res.status}`)
      const data = await res.json() as { alerts: Alert[]; generatedAt: string }
      if (data.alerts?.length) {
        setAlerts(data.alerts)
        setLoadedAt(data.generatedAt)
        setDismissed(new Set())
        setExpandedId(null)
      }
    } catch { /* keep fallback */ }
    finally { setLoading(false) }
  }, [])

  useEffect(() => { loadAlerts() }, [loadAlerts])

  const dismiss = (id: string) => setDismissed(prev => new Set([...prev, id]))
  const dismissAll = () => setDismissed(new Set(alerts.map(a => a.id)))

  const urgentAlerts = alerts.filter(a => a.type === 'critical' || a.type === 'warning')
  const currentTicker = urgentAlerts[tickerIdx % Math.max(1, urgentAlerts.length)]

  const visible = alerts.filter(a => !dismissed.has(a.id)).filter(a => filter === 'all' || a.type === filter)
  const counts  = FILTER_TAB_IDS.reduce((acc, id) => {
    acc[id] = id === 'all'
      ? alerts.filter(a => !dismissed.has(a.id)).length
      : alerts.filter(a => !dismissed.has(a.id) && a.type === id).length
    return acc
  }, {} as Record<string,number>)

  const isSubscribed = pushState === 'subscribed' || pushState === 'sending'
  const newCount = visible.filter(a => a.isNew).length

  return (
    <div style={{display:'flex',flexDirection:'column',minHeight:'100vh',background:'var(--bg-primary)',fontFamily:"'Inter',sans-serif"}}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&display=swap');

        /* Sidebar */
        .a-sidebar{width:240px;min-height:100vh;background:#ffffff;border-right:1px solid rgba(0,53,128,0.12);display:flex;flex-direction:column;padding:1.5rem 1rem;position:sticky;top:0;z-index:20;flex-shrink:0;box-shadow:2px 0 12px rgba(0,53,128,0.06)}
        .a-main{flex:1;min-width:0;padding:2rem 2.5rem;overflow-x:hidden;max-width:940px}
        @media(max-width:768px){
          .a-sidebar{position:fixed;left:0;top:0;height:100vh;z-index:60;transform:translateX(-100%);transition:transform .28s cubic-bezier(.16,1,.3,1);box-shadow:4px 0 32px rgba(0,30,80,.18)}
          .a-sidebar.mobile-open{transform:translateX(0)}
          .a-main{padding:1rem 1rem 5rem}
          .mobile-top-bar{display:flex}
        }
        .mobile-top-bar{display:none;align-items:center;justify-content:space-between;padding:.75rem 1rem;background:#fff;border-bottom:1px solid rgba(0,53,128,.1);position:sticky;top:0;z-index:30;box-shadow:0 2px 8px rgba(0,53,128,.06)}
        .hamburger-btn{background:none;border:none;cursor:pointer;padding:8px;border-radius:10px;color:#003580;display:flex;align-items:center;justify-content:center;transition:background .2s;min-width:40px;min-height:40px}
        .hamburger-btn:hover{background:rgba(0,53,128,.08)}
        .sidebar-overlay{display:none}
        @media(max-width:768px){.sidebar-overlay{display:block;position:fixed;inset:0;background:rgba(0,30,80,.4);backdrop-filter:blur(3px);z-index:59}}
        @media(max-width:768px){.sidebar-close-mobile{display:flex!important}}

        .nav-item{display:flex;align-items:center;gap:12px;padding:13px 14px;border-radius:12px;font-size:1rem;font-weight:600;color:#3d5080;text-decoration:none;cursor:pointer;transition:background .2s,color .2s;border:none;background:none;width:100%;text-align:left;margin-bottom:4px;font-family:'Inter',sans-serif;min-height:50px}
        .nav-item:hover:not(.nav-disabled){background:rgba(0,53,128,0.07);color:#003580}
        .nav-item.nav-active{background:rgba(0,53,128,0.1);color:#003580;border-left:3px solid #003580}
        .nav-item.nav-disabled{opacity:.45;cursor:default}

        /* page header */
        .page-head{display:flex;align-items:flex-start;justify-content:space-between;margin-bottom:1.5rem;gap:1rem;flex-wrap:wrap}
        .ai-badge{display:inline-flex;align-items:center;gap:5px;font-size:.68rem;font-weight:700;letter-spacing:.07em;text-transform:uppercase;padding:3px 10px;border-radius:99px;background:rgba(52,211,153,.15);border:1px solid rgba(52,211,153,.3);color:#34d399;margin-bottom:.6rem}
        .page-title{font-size:1.6rem;font-weight:800;color:var(--text-primary);letter-spacing:-.025em;display:flex;align-items:center;gap:10px}
        .page-sub{font-size:.855rem;color:var(--text-secondary);margin-top:4px;line-height:1.5}

        /* refresh btn */
        .btn-refresh{display:flex;align-items:center;gap:7px;padding:9px 18px;border-radius:11px;border:1px solid rgba(99,102,241,.3);background:rgba(99,102,241,.08);color:#a5b4fc;font-size:.83rem;font-weight:600;cursor:pointer;font-family:'Inter',sans-serif;transition:background .2s,border-color .2s;white-space:nowrap}
        .btn-refresh:hover:not(:disabled){background:rgba(99,102,241,.15);border-color:rgba(99,102,241,.5)}
        .btn-refresh:disabled{opacity:.5;cursor:default}
        .spin{animation:spin .8s linear infinite}
        @keyframes spin{to{transform:rotate(360deg)}}

        /* ── Live ticker bar ── */
        .ticker-bar{
          display:flex;align-items:center;gap:10px;
          padding:10px 16px;border-radius:12px;margin-bottom:1.25rem;
          background:linear-gradient(135deg,rgba(248,113,113,.10),rgba(239,68,68,.06));
          border:1px solid rgba(248,113,113,.25);
          overflow:hidden;position:relative;
        }
        .ticker-live-dot{
          width:8px;height:8px;border-radius:50%;background:#f87171;
          flex-shrink:0;animation:live-pulse 1.4s ease-in-out infinite;
        }
        @keyframes live-pulse{0%,100%{opacity:1;transform:scale(1)}50%{opacity:.5;transform:scale(.8)}}
        .ticker-label{font-size:.68rem;font-weight:800;letter-spacing:.1em;text-transform:uppercase;color:#f87171;flex-shrink:0}
        .ticker-sep{color:rgba(248,113,113,.4);flex-shrink:0}
        .ticker-text{font-size:.82rem;font-weight:600;color:#fca5a5;overflow:hidden;text-overflow:ellipsis;white-space:nowrap;animation:tickerFade .5s ease}
        @keyframes tickerFade{from{opacity:0;transform:translateY(4px)}to{opacity:1;transform:translateY(0)}}
        .ticker-count{margin-left:auto;flex-shrink:0;font-size:.72rem;font-weight:700;color:#f87171;background:rgba(248,113,113,.15);padding:2px 8px;border-radius:6px}

        /* status bar */
        .status-bar{display:flex;align-items:center;gap:10px;padding:10px 14px;border-radius:10px;margin-bottom:1.25rem;font-size:.82rem}
        .status-bar.live{background:rgba(52,211,153,.07);border:1px solid rgba(52,211,153,.2);color:#34d399}
        .status-bar.err{background:rgba(251,146,60,.07);border:1px solid rgba(251,146,60,.22);color:#fb923c}

        /* filter tabs */
        .filter-row{display:flex;align-items:center;justify-content:space-between;margin-bottom:1.25rem;gap:8px;flex-wrap:wrap}
        .filter-tabs{display:flex;gap:6px;flex-wrap:wrap;flex:1}
        .ftab{display:flex;align-items:center;gap:5px;padding:6px 14px;border-radius:99px;font-size:.8rem;font-weight:600;border:1px solid var(--border);background:var(--bg-card);color:var(--text-muted);cursor:pointer;transition:all .18s;font-family:'Inter',sans-serif}
        .ftab:hover{color:var(--text-primary);border-color:rgba(99,102,241,.3)}
        .ftab.active{background:rgba(99,102,241,.14);border-color:rgba(99,102,241,.4);color:var(--accent-primary)}
        .ftab-count{font-size:.65rem;font-weight:700;padding:1px 6px;border-radius:99px;background:rgba(255,255,255,.08);min-width:18px;text-align:center}
        .dismiss-all-btn{font-size:.76rem;font-weight:600;color:var(--text-muted);background:none;border:1px solid var(--border);border-radius:8px;padding:5px 12px;cursor:pointer;font-family:'Inter',sans-serif;transition:all .18s;white-space:nowrap}
        .dismiss-all-btn:hover{color:#f87171;border-color:rgba(248,113,113,.3)}

        /* ── Alert card — richer design ── */
        .alert-card{
          border-radius:16px;border:1px solid;margin-bottom:10px;
          overflow:hidden;transition:transform .18s,box-shadow .18s;
          position:relative;
        }
        .alert-card:hover{transform:translateY(-2px);box-shadow:0 8px 24px rgba(0,0,0,.15)}
        /* colored left border accent */
        .alert-card::before{
          content:'';position:absolute;left:0;top:0;bottom:0;width:3px;
          border-radius:3px 0 0 3px;
        }

        .alert-header{display:flex;align-items:flex-start;gap:12px;padding:1rem 1.25rem .875rem 1.5rem;cursor:pointer}
        .alert-icon-circle{
          width:40px;height:40px;border-radius:12px;flex-shrink:0;
          display:flex;align-items:center;justify-content:center;
          font-size:1.1rem;
        }
        .alert-type-badge{font-size:.63rem;font-weight:700;letter-spacing:.06em;text-transform:uppercase;padding:2px 8px;border-radius:99px;border:1px solid;flex-shrink:0}
        .alert-new-dot{width:7px;height:7px;border-radius:50%;flex-shrink:0;margin-top:3px;animation:live-pulse 2s ease-in-out infinite}
        .alert-title{font-size:.94rem;font-weight:700;color:var(--text-primary);line-height:1.4;flex:1}
        .alert-meta{display:flex;align-items:center;gap:6px;margin-top:5px;flex-wrap:wrap}
        .alert-region{font-size:.72rem;color:var(--text-muted);display:flex;align-items:center;gap:3px}
        .alert-time{display:flex;align-items:center;gap:3px;font-size:.72rem;color:var(--text-muted)}
        .alert-source{font-size:.68rem;font-weight:700;padding:1px 7px;border-radius:5px;background:rgba(255,255,255,.06);color:var(--text-muted)}
        .dismiss-btn{background:none;border:none;cursor:pointer;color:var(--text-muted);padding:3px;display:flex;border-radius:6px;transition:color .15s,background .15s;flex-shrink:0;margin-top:1px}
        .dismiss-btn:hover{color:#f87171;background:rgba(248,113,113,.1)}

        /* tags */
        .alert-tags{display:flex;gap:4px;flex-wrap:wrap;padding:0 1.5rem .5rem}
        .tag-pill{display:inline-flex;align-items:center;gap:3px;font-size:.62rem;font-weight:600;padding:2px 7px;border-radius:5px;background:rgba(255,255,255,.05);border:1px solid rgba(255,255,255,.08);color:var(--text-muted)}

        /* expand row */
        .expand-btn-row{display:flex;align-items:center;gap:4px;padding:0 1.5rem .875rem;font-size:.78rem;font-weight:600;color:var(--accent-primary);cursor:pointer;background:none;border:none;font-family:'Inter',sans-serif;transition:opacity .2s}
        .expand-btn-row:hover{opacity:.75}
        .chevron-icon{transition:transform .25s}
        .chevron-icon.open{transform:rotate(180deg)}

        /* expanded body */
        .alert-body{border-top:1px solid rgba(255,255,255,.06);padding:1rem 1.5rem}
        .alert-body-text{font-size:.86rem;color:var(--text-secondary);line-height:1.75}
        .action-btn{display:inline-flex;align-items:center;gap:6px;margin-top:.875rem;padding:9px 18px;border-radius:9px;background:linear-gradient(135deg,#6366f1,#8b5cf6);color:white;font-size:.8rem;font-weight:700;text-decoration:none;border:none;cursor:pointer;font-family:'Inter',sans-serif;box-shadow:0 4px 14px rgba(99,102,241,.35);transition:opacity .2s,transform .15s}
        .action-btn:hover{opacity:.88;transform:translateY(-1px)}
        @keyframes revealDown{from{opacity:0;transform:translateY(-6px)}to{opacity:1;transform:translateY(0)}}
        .reveal{animation:revealDown .22s cubic-bezier(.16,1,.3,1)}

        /* skeleton */
        .skel{background:linear-gradient(90deg,rgba(255,255,255,.04) 0%,rgba(255,255,255,.09) 50%,rgba(255,255,255,.04) 100%);background-size:200% 100%;animation:shimmer 1.4s infinite;border-radius:8px}
        @keyframes shimmer{0%{background-position:-200% 0}100%{background-position:200% 0}}
        .skel-card{background:var(--bg-card);border:1px solid var(--border);border-radius:16px;padding:1rem 1.25rem;margin-bottom:10px}

        /* empty */
        .empty{text-align:center;padding:3.5rem;color:var(--text-muted);font-size:.9rem}

        /* ── Web Push banner ── */
        .push-banner{border-radius:18px;margin-bottom:1.4rem;overflow:hidden;border:1px solid rgba(99,102,241,.3);background:linear-gradient(135deg,rgba(20,18,44,.95),rgba(30,20,60,.9));box-shadow:0 8px 32px rgba(99,102,241,.15)}
        .push-banner-top{display:flex;align-items:center;gap:14px;padding:16px 18px 14px}
        .push-banner-phone{width:52px;height:52px;flex-shrink:0;background:linear-gradient(135deg,#6366f1,#8b5cf6);border-radius:14px;display:flex;align-items:center;justify-content:center;font-size:1.5rem;animation:phone-bounce 2.5s ease-in-out infinite}
        @keyframes phone-bounce{0%,100%{transform:translateY(0) rotate(0)}10%{transform:translateY(-3px) rotate(-5deg)}20%{transform:translateY(0) rotate(5deg)}30%{transform:translateY(-2px) rotate(-3deg)}40%{transform:translateY(0) rotate(0)}}
        .push-banner-title{font-size:.95rem;font-weight:800;color:#fff;margin-bottom:3px}
        .push-banner-sub{font-size:.78rem;color:rgba(255,255,255,.6);line-height:1.45}
        .push-banner-actions{display:flex;align-items:center;gap:8px;padding:0 18px 14px}
        .push-preview{margin:0 18px 14px;border-radius:12px;background:rgba(255,255,255,.05);border:1px solid rgba(255,255,255,.08);padding:10px 12px;display:flex;align-items:center;gap:10px}
        .push-preview-icon{width:32px;height:32px;border-radius:8px;background:linear-gradient(135deg,#003580,#1a4fa0);display:flex;align-items:center;justify-content:center;font-size:.9rem;flex-shrink:0}
        .push-preview-app{font-size:.62rem;font-weight:800;letter-spacing:.07em;text-transform:uppercase;color:#a5b4fc;margin-bottom:2px}
        .push-preview-title{font-size:.78rem;font-weight:700;color:rgba(255,255,255,.9);line-height:1.3}
        .push-preview-time{font-size:.65rem;color:rgba(255,255,255,.35);margin-left:auto;flex-shrink:0;align-self:flex-start;margin-top:2px}
        .btn-subscribe{display:flex;align-items:center;gap:7px;padding:9px 20px;border-radius:11px;background:linear-gradient(135deg,#6366f1,#8b5cf6);color:white;font-size:.84rem;font-weight:700;border:none;cursor:pointer;font-family:'Inter',sans-serif;box-shadow:0 4px 16px rgba(99,102,241,.45);transition:opacity .2s,transform .15s}
        .btn-subscribe:hover:not(:disabled){opacity:.9;transform:translateY(-1px)}
        .btn-subscribe:disabled{opacity:.6;cursor:default}
        .btn-skip{background:none;border:1px solid rgba(255,255,255,.12);border-radius:11px;padding:9px 14px;color:rgba(255,255,255,.5);font-size:.82rem;font-weight:600;cursor:pointer;font-family:'Inter',sans-serif;transition:all .2s}
        .btn-skip:hover{border-color:rgba(255,255,255,.25);color:rgba(255,255,255,.75)}

        /* subscribed bar */
        .push-active-bar{display:flex;align-items:center;gap:10px;padding:11px 16px;border-radius:14px;margin-bottom:1.25rem;background:rgba(52,211,153,.06);border:1px solid rgba(52,211,153,.22);font-size:.83rem}
        .btn-test-push{margin-left:auto;flex-shrink:0;display:flex;align-items:center;gap:6px;padding:7px 14px;border-radius:9px;background:linear-gradient(135deg,#6366f1,#8b5cf6);color:white;font-size:.78rem;font-weight:700;border:none;cursor:pointer;font-family:'Inter',sans-serif;box-shadow:0 2px 10px rgba(99,102,241,.35);transition:opacity .2s}
        .btn-test-push:hover:not(:disabled){opacity:.88}
        .btn-test-push:disabled{opacity:.6;cursor:default}
        .btn-unsub{background:none;border:1px solid rgba(255,255,255,.1);border-radius:8px;padding:6px 10px;color:rgba(255,255,255,.35);font-size:.73rem;font-weight:600;cursor:pointer;font-family:'Inter',sans-serif;transition:all .2s;flex-shrink:0}
        .btn-unsub:hover{border-color:rgba(248,113,113,.3);color:#f87171}
        @keyframes pop-in{0%{opacity:0;transform:scale(.8)}60%{transform:scale(1.05)}100%{opacity:1;transform:scale(1)}}
        .test-sent-badge{display:inline-flex;align-items:center;gap:5px;font-size:.75rem;font-weight:700;color:#34d399;animation:pop-in .3s cubic-bezier(.16,1,.3,1)}

        /* ── Toast cards ── */
        .toast-container{position:fixed;bottom:24px;right:24px;z-index:9999;display:flex;flex-direction:column;gap:10px;pointer-events:none;max-width:340px;width:calc(100vw - 48px)}
        .toast-card{pointer-events:all;display:flex;align-items:flex-start;gap:11px;padding:13px 14px;border-radius:14px;background:rgba(18,20,34,.97);border:1px solid rgba(255,255,255,.12);box-shadow:0 8px 32px rgba(0,0,0,.55),0 0 0 1px rgba(99,102,241,.18);backdrop-filter:blur(16px);animation:toastIn .32s cubic-bezier(.16,1,.3,1);cursor:pointer}
        @keyframes toastIn{from{opacity:0;transform:translateX(110%)}to{opacity:1;transform:translateX(0)}}
        .toast-icon-wrap{width:36px;height:36px;border-radius:10px;flex-shrink:0;display:flex;align-items:center;justify-content:center;font-size:1.1rem}
        .toast-app-label{font-size:.62rem;font-weight:800;letter-spacing:.07em;text-transform:uppercase;color:#a5b4fc;margin-bottom:3px;display:flex;align-items:center;gap:5px}
        .toast-title{font-size:.82rem;font-weight:700;color:var(--text-primary);line-height:1.35;margin-bottom:3px}
        .toast-body{font-size:.75rem;color:var(--text-secondary);line-height:1.45}
        .toast-close{background:none;border:none;cursor:pointer;color:rgba(255,255,255,.3);padding:2px;flex-shrink:0;display:flex;border-radius:5px;margin-left:auto;transition:color .15s}
        .toast-close:hover{color:rgba(255,255,255,.7)}
        .toast-time{font-size:.66rem;color:var(--text-muted);margin-top:4px}
      `}</style>

      {/* ── Mobile top bar (hamburger) ── */}
      <div className="mobile-top-bar">
        <button className="hamburger-btn" onClick={() => setMobileMenuOpen(true)} aria-label="Open menu">
          <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <line x1="3" y1="6" x2="21" y2="6"/><line x1="3" y1="12" x2="21" y2="12"/><line x1="3" y1="18" x2="21" y2="18"/>
          </svg>
        </button>
        <div style={{display:'flex',alignItems:'center',gap:8}}>
          <div style={{width:32,height:32,borderRadius:9,background:'linear-gradient(135deg,#003580,#1a4fa0)',display:'flex',alignItems:'center',justifyContent:'center'}}>
            <ShieldIcon s={16}/>
          </div>
          <span style={{fontWeight:800,fontSize:'.95rem',color:'#003580'}}>VoiceGuard</span>
        </div>
        <div style={{width:36,height:36,borderRadius:'50%',background:'linear-gradient(135deg,#003580,#1a4fa0)',display:'flex',alignItems:'center',justifyContent:'center',fontSize:'.85rem',fontWeight:700,color:'white'}}>U</div>
      </div>

      {/* ── Mobile sidebar overlay backdrop ── */}
      {mobileMenuOpen && (
        <div className="sidebar-overlay" onClick={() => setMobileMenuOpen(false)} />
      )}

      <div style={{display:'flex',flex:1}}>

      {/* ── Sidebar ── */}
      <aside className={`a-sidebar${mobileMenuOpen ? ' mobile-open' : ''}`} style={{position:'relative'}}>
        <div style={{position:'absolute',top:0,left:0,right:0,height:'4px',background:'linear-gradient(90deg,#003580,#1a4fa0,#CC0001)'}}/>
        <button
          onClick={() => setMobileMenuOpen(false)}
          style={{display:'none',position:'absolute',top:12,right:12,background:'none',border:'none',cursor:'pointer',padding:6,borderRadius:8,color:'#8898bb'}}
          className="sidebar-close-mobile" aria-label="Close menu">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>
          </svg>
        </button>
        <div style={{display:'flex',alignItems:'center',gap:12,marginBottom:'2rem',paddingLeft:4,marginTop:'0.75rem'}}>
          <div style={{width:40,height:40,borderRadius:11,background:'linear-gradient(135deg,#003580,#1a4fa0)',display:'flex',alignItems:'center',justifyContent:'center',boxShadow:'0 4px 14px rgba(0,53,128,.3)'}}>
            <ShieldIcon s={18}/>
          </div>
          <span style={{fontWeight:800,fontSize:'1.05rem',letterSpacing:'-0.02em',color:'#003580'}}>VoiceGuard</span>
        </div>
        <nav style={{flex:1}}>
          <div style={{fontSize:'.7rem',fontWeight:800,letterSpacing:'.1em',textTransform:'uppercase',color:'#8898bb',padding:'0 14px',marginBottom:10}}>Main Menu</div>
          {NAV.map(n=>(
            <Link key={n.label} href={n.disabled?'#':n.href} className={`nav-item${n.active?' nav-active':''}${n.disabled?' nav-disabled':''}`} onClick={() => setMobileMenuOpen(false)}>
              <n.icon s={20}/>{n.label}
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
            <div className="ai-badge">
              <CheckCircle s={11}/> Curated Alerts — Updated Daily
            </div>
            <div className="page-title">
              <BellIcon s={24}/>
              {t('alerts_title')}
              {newCount > 0 && (
                <span style={{fontSize:'.72rem',fontWeight:700,padding:'2px 9px',borderRadius:99,background:'rgba(248,113,113,.15)',border:'1px solid rgba(248,113,113,.3)',color:'#f87171'}}>
                  {newCount} new
                </span>
              )}
            </div>
            <div className="page-sub">{t('alerts_sub')}</div>
          </div>
          <div style={{display:'flex',alignItems:'center',gap:10}}>
            <LanguageSwitcher/>
            <button className="btn-refresh" onClick={loadAlerts} disabled={loading}>
              <span className={loading?'spin':''} style={{display:'flex'}}><RefreshIcon s={15}/></span>
              {loading ? t('alerts_loading') : t('alerts_refresh')}
            </button>
          </div>
        </div>

        {/* ── Live urgency ticker ── */}
        {!loading && urgentAlerts.length > 0 && currentTicker && (
          <div className="ticker-bar">
            <span className="ticker-live-dot"/>
            <span className="ticker-label">⚡ Live</span>
            <span className="ticker-sep">·</span>
            <span className="ticker-text">{currentTicker.title}</span>
            <span className="ticker-count">{urgentAlerts.length} urgent</span>
          </div>
        )}

        {/* ── Push Notification Banner ── */}
        {pushState === 'unsupported' && (
          <div className="status-bar err"><AlertTriIcon s={14}/><span>Your browser does not support push notifications. Try Chrome or Edge.</span></div>
        )}
        {pushState === 'denied' && (
          <div className="status-bar err"><AlertTriIcon s={14}/><span>Push notifications are <strong>blocked</strong>. Click the lock icon in your address bar → Notifications → Allow.</span></div>
        )}

        {(pushState === 'default' || pushState === 'subscribing') && (
          <div className="push-banner">
            <div className="push-preview">
              <div className="push-preview-icon">🛡️</div>
              <div style={{flex:1,minWidth:0}}>
                <div className="push-preview-app">VoiceGuard · Security Alert</div>
                <div className="push-preview-title">🚨 New Macau Scam Surge Detected in Malaysia</div>
              </div>
              <div className="push-preview-time">now</div>
            </div>
            <div className="push-banner-top">
              <div className="push-banner-phone">🔔</div>
              <div style={{flex:1,minWidth:0}}>
                <div className="push-banner-title">Get Real-Time Security Alerts</div>
                <div className="push-banner-sub">Receive push notifications even when your browser is closed — just like WhatsApp alerts.</div>
              </div>
            </div>
            <div className="push-banner-actions">
              <button id="btn-enable-push" className="btn-subscribe" onClick={subscribeToPush} disabled={pushState==='subscribing'}>
                {pushState==='subscribing' ? <><span className="spin" style={{display:'flex'}}><RefreshIcon s={13}/></span>Enabling…</> : <><BellIcon s={13}/>Enable Push Alerts</>}
              </button>
              <button className="btn-skip" onClick={()=>setPushState('denied')}>Not now</button>
              {pushError && <span style={{fontSize:'.75rem',color:'#f87171',marginLeft:4}}>{pushError}</span>}
            </div>
          </div>
        )}

        {isSubscribed && (
          <div className="push-active-bar">
            <span style={{color:'#34d399',display:'flex',alignItems:'center',gap:6}}>
              <CheckCircle s={15}/>
              <span><strong style={{color:'#34d399'}}>Push alerts active</strong><span style={{color:'rgba(255,255,255,.5)',fontWeight:400}}> — you&apos;ll receive notifications even when the browser is closed</span></span>
            </span>
            {testSent ? (
              <span className="test-sent-badge" style={{marginLeft:'auto'}}><CheckCircle s={13}/> Sent! Check notifications</span>
            ) : (
              <button id="btn-test-push" className="btn-test-push" onClick={sendTestPush} disabled={pushState==='sending'}>
                {pushState==='sending' ? <><span className="spin" style={{display:'flex'}}><RefreshIcon s={12}/></span>Sending…</> : <><SendIcon s={12}/>Send Test</>}
              </button>
            )}
            <button className="btn-unsub" onClick={unsubscribeFromPush} title="Unsubscribe">✕</button>
          </div>
        )}

        {/* Status bar */}
        {!loading && loadedAt && (
          <div className="status-bar live">
            <span style={{width:7,height:7,borderRadius:'50%',background:'#34d399',display:'inline-block',animation:'live-pulse 2s ease-in-out infinite'}}/>
            <span>✅ Curated threat intelligence — {alerts.length} alerts · Refreshes daily</span>
          </div>
        )}

        {/* Filter tabs */}
        <div className="filter-row">
          <div className="filter-tabs">
            {FILTER_TAB_IDS.map(id=>{
              const labelKey = `alerts_filter_${id==='all'?'all':id==='critical'?'crit':id==='warning'?'warn':id}` as Parameters<typeof t>[0]
              return (
                <button key={id} className={`ftab${filter===id?' active':''}`} onClick={()=>setFilter(id)}>
                  {id!=='all' && SEV[id as AlertType]?.icon}{' '}{t(labelKey)}
                  <span className="ftab-count">{counts[id]}</span>
                </button>
              )
            })}
          </div>
          {visible.length > 1 && (
            <button className="dismiss-all-btn" onClick={dismissAll}>Dismiss all</button>
          )}
        </div>

        {/* Skeletons while loading */}
        {loading && [0,1,2,3,4].map(i=>(
          <div key={i} className="skel-card">
            <div style={{display:'flex',gap:12,marginBottom:12}}>
              <div className="skel" style={{width:40,height:40,borderRadius:12,flexShrink:0}}/>
              <div style={{flex:1}}>
                <div className="skel" style={{height:13,width:'40%',marginBottom:8}}/>
                <div className="skel" style={{height:18,width:'80%',marginBottom:8}}/>
                <div className="skel" style={{height:13,width:'55%'}}/>
              </div>
            </div>
          </div>
        ))}

        {/* Empty state */}
        {!loading && visible.length === 0 && dismissed.size === 0 && (
          <div className="empty"><BellIcon s={40}/><p style={{marginTop:12}}>{t('alerts_empty')}</p></div>
        )}

        {/* ── Alert cards ── */}
        {!loading && visible.map(alert=>{
          const sev    = SEV[alert.type] ?? SEV.info
          const isOpen = expandedId === alert.id
          return (
            <div key={alert.id} className="alert-card"
              style={{
                background: sev.bg,
                borderColor: isOpen ? sev.border : sev.border.replace('.30','.16').replace('.28','.14').replace('.25','.12'),
                boxShadow: isOpen ? `0 0 28px ${sev.bg}, 0 4px 16px rgba(0,0,0,.1)` : undefined,
              }}>
              {/* colored left accent */}
              <div style={{position:'absolute',left:0,top:0,bottom:0,width:3,background:sev.gradient,borderRadius:'3px 0 0 3px'}}/>

              {/* Header */}
              <div className="alert-header" onClick={()=>setExpandedId(isOpen?null:alert.id)}>
                <div className="alert-icon-circle" style={{background:`${sev.color}18`}}>
                  <span style={{fontSize:'1.15rem'}}>{sev.icon}</span>
                </div>
                <div style={{flex:1,minWidth:0}}>
                  <div style={{display:'flex',alignItems:'center',gap:7,marginBottom:5,flexWrap:'wrap'}}>
                    <span className="alert-type-badge" style={{color:sev.color,background:`${sev.color}18`,borderColor:`${sev.color}35`}}>
                      {sev.label}
                    </span>
                    {alert.isNew && (
                      <span style={{display:'flex',alignItems:'center',gap:4,fontSize:'.63rem',fontWeight:700,color:sev.color}}>
                        <span className="alert-new-dot" style={{background:sev.color}}/>
                        NEW
                      </span>
                    )}
                    <span className="alert-source">{alert.source}</span>
                  </div>
                  <div className="alert-title">{alert.title}</div>
                  <div className="alert-meta">
                    {alert.region && (
                      <span className="alert-region"><MapPinIcon s={11}/>{regionFlag(alert.region)}</span>
                    )}
                    <span style={{color:'var(--text-muted)',fontSize:'.65rem'}}>·</span>
                    <span className="alert-time"><ClockIcon s={11}/>{alert.timeAgo}</span>
                  </div>
                </div>
                <button className="dismiss-btn" title="Dismiss" onClick={e=>{e.stopPropagation();dismiss(alert.id)}}>
                  <XIcon s={14}/>
                </button>
              </div>

              {/* Tags */}
              {alert.tags && alert.tags.length > 0 && (
                <div className="alert-tags">
                  {alert.tags.map(tag=>(
                    <span key={tag} className="tag-pill"><TagIcon s={10}/>#{tag}</span>
                  ))}
                </div>
              )}

              {/* Expand button */}
              <button className="expand-btn-row" onClick={()=>setExpandedId(isOpen?null:alert.id)}>
                {isOpen ? t('alerts_show_less') : t('alerts_read_more')}
                <span className={`chevron-icon${isOpen?' open':''}`}><ChevronDown s={14}/></span>
              </button>

              {/* Expanded body */}
              {isOpen && (
                <div className="alert-body reveal">
                  <div className="alert-body-text">{alert.body}</div>
                  {alert.actionLabel && (
                    <a href={alert.actionUrl} className="action-btn"
                      target={alert.actionUrl?.startsWith('http')?'_blank':undefined} rel="noreferrer">
                      {alert.actionLabel}
                      {alert.actionUrl?.startsWith('http') && <ExternalIcon s={11}/>}
                    </a>
                  )}
                </div>
              )}
            </div>
          )
        })}

        {/* Dismissed all */}
        {!loading && visible.length === 0 && dismissed.size > 0 && (
          <div style={{textAlign:'center',marginTop:'1rem'}}>
            <button className="btn-refresh" onClick={()=>{setDismissed(new Set());setFilter('all')}}>
              {t('alerts_restore')} {dismissed.size} {dismissed.size!==1?t('alerts_dismissed_pl'):t('alerts_dismissed')}
            </button>
          </div>
        )}

      </main>
      </div>{/* end flex row */}

      {/* ── Toast container ── */}
      <div className="toast-container" aria-live="polite" aria-atomic="false">
        {toasts.map(toast=>(
          <div key={toast.id} className="toast-card" onClick={()=>setToasts(prev=>prev.filter(t=>t.id!==toast.id))}>
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
            <button className="toast-close" onClick={e=>{e.stopPropagation();setToasts(prev=>prev.filter(t=>t.id!==toast.id))}}><XIcon s={12}/></button>
          </div>
        ))}
      </div>
    </div>
  )
}
