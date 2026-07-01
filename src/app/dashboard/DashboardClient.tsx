'use client'

import { useState, useTransition, useEffect } from 'react'
import { useLang, LanguageSwitcher } from '@/lib/LanguageContext'
import Link from 'next/link'
import { logout } from '@/app/auth/actions'
import {
  submitQuizAnswer,
  addTrustedContact,
  deleteTrustedContact,
  type QuizQuestion,
  type UserPoints,
  type TrustedContact,
} from './quiz.actions'

// ── Icons ─────────────────────────────────────────────────────────────────────
const ShieldIcon    = ({size=20}:{size?:number}) => <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></svg>
const PhoneIcon     = ({size=20}:{size?:number}) => <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07A19.5 19.5 0 0 1 4.69 12a19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 3.6 1.28h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L7.91 9a16 16 0 0 0 6.27 6.27l.91-.91a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z"/></svg>
const BellIcon      = ({size=20}:{size?:number}) => <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"/><path d="M13.73 21a2 2 0 0 1-3.46 0"/></svg>
const BookIcon      = ({size=20}:{size?:number}) => <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z"/><path d="M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z"/></svg>
const ActivityIcon  = ({size=20}:{size?:number}) => <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="22 12 18 12 15 21 9 3 6 12 2 12"/></svg>
const LogOutIcon    = ({size=20}:{size?:number}) => <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/><polyline points="16 17 21 12 16 7"/><line x1="21" y1="12" x2="9" y2="12"/></svg>
const MicIcon       = ({size=20}:{size?:number}) => <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 1a3 3 0 0 0-3 3v8a3 3 0 0 0 6 0V4a3 3 0 0 0-3-3z"/><path d="M19 10v2a7 7 0 0 1-14 0v-2"/><line x1="12" y1="19" x2="12" y2="23"/><line x1="8" y1="23" x2="16" y2="23"/></svg>
const GlobeIcon     = ({size=20}:{size?:number}) => <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><line x1="2" y1="12" x2="22" y2="12"/><path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z"/></svg>
const SparklesIcon  = ({size=20}:{size?:number}) => <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m12 3-1.912 5.813a2 2 0 0 1-1.275 1.275L3 12l5.813 1.912a2 2 0 0 1 1.275 1.275L12 21l1.912-5.813a2 2 0 0 1 1.275-1.275L21 12l-5.813-1.912a2 2 0 0 1-1.275-1.275L12 3Z"/><path d="M5 3v4"/><path d="M3 5h4"/><path d="M19 17v4"/><path d="M17 19h4"/></svg>
const ChevronRight  = ({size=16}:{size?:number}) => <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="9 18 15 12 9 6"/></svg>
const HeartIcon     = ({size=16}:{size?:number}) => <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/></svg>
const UsersIcon     = ({size=16}:{size?:number}) => <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></svg>
const CheckIcon     = ({size=14}:{size?:number}) => <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"/></svg>
const XCircleIcon   = ({size=14}:{size?:number}) => <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><line x1="15" y1="9" x2="9" y2="15"/><line x1="9" y1="9" x2="15" y2="15"/></svg>
const ZapIcon       = ({size=14}:{size?:number}) => <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"/></svg>
const StarIcon      = ({size=12}:{size?:number}) => <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor" stroke="none"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/></svg>
const TrashIcon     = ({size=13}:{size?:number}) => <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="3 6 5 6 21 6"/><path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6"/><path d="M10 11v6"/><path d="M14 11v6"/><path d="M9 6V4h6v2"/></svg>
const PlusIcon      = ({size=14}:{size?:number}) => <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>
const XIcon         = ({size=13}:{size?:number}) => <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>

// ── Constants ─────────────────────────────────────────────────────────────────
const LEVEL_COLORS: Record<string, {color:string;bg:string;border:string}> = {
  Beginner: { color:'#94a3b8', bg:'rgba(148,163,184,.12)', border:'rgba(148,163,184,.25)' },
  Aware:    { color:'#34d399', bg:'rgba(52,211,153,.12)',  border:'rgba(52,211,153,.25)'  },
  Guardian: { color:'#60a5fa', bg:'rgba(96,165,250,.12)',  border:'rgba(96,165,250,.25)'  },
  Expert:   { color:'#a78bfa', bg:'rgba(167,139,250,.12)', border:'rgba(167,139,250,.25)' },
  Champion: { color:'#facc15', bg:'rgba(250,204,21,.12)',  border:'rgba(250,204,21,.25)'  },
}
const NEXT_LEVEL_PTS: Record<string,number> = {
  Beginner:50, Aware:200, Guardian:500, Expert:1000, Champion:Infinity,
}
const NEXT_LEVEL_NAME: Record<string,string> = {
  Beginner:'Aware', Aware:'Guardian', Guardian:'Expert', Expert:'Champion', Champion:'Champion',
}
const RELATIONS = ['Family','Doctor','Friend','Neighbour','Other']
const HOTLINES = [
  { label:'PDRM Scam Hotline',     number:'999',           color:'#f87171' },
  { label:'BNM LINK (Bank)',        number:'1-300-88-5465', color:'#fb923c' },
  { label:'MCMC Complaint',         number:'1-800-18-8030', color:'#facc15' },
  { label:'Talian Kasih (Welfare)', number:'15999',         color:'#34d399' },
]
const NAV_HREFS = [
  { href:'/dashboard', icon:ActivityIcon, active:true,  disabled:false, badge:'', tKey:'nav_dashboard' as const },
  { href:'/awareness', icon:BookIcon,     active:false, disabled:false, badge:'', tKey:'nav_awareness' as const },
  { href:'/alerts',    icon:BellIcon,     active:false, disabled:false, badge:'', tKey:'nav_alerts'    as const },
  { href:'/detect',    icon:MicIcon,      active:false, disabled:false, badge:'', tKey:'nav_detect'    as const },
]
// ── Educational YouTube videos — verified working fallback list ───────────────
// Used only when the Supabase educational_videos table is empty.
// Admin can manage videos via the Admin → Videos tab.
const VIDEOS = [
  { videoId:'4HmBZF_09V4', title:'Cyber Security Awareness',                                channel:'Education',              tag:'🇲🇾 Awareness' },
  { videoId:'lonTsrGAN9E', title:'Scam Awareness Video',                                    channel:'Education',              tag:'🇲🇾 Scam' },
  { videoId:'0j7nq0Rb_Ck', title:'Protecting Yourself from Voice Scams',                    channel:'Education',              tag:'Protection' },
  { videoId:'TvrFpAFitQ0', title:'Understanding AI Voice Cloning Threats',                   channel:'Education',              tag:'AI Scam' },
  { videoId:'GW_DLLjvrsc', title:'Deepfake & Vishing Awareness',                            channel:'Education',              tag:'Deepfake' },
  { videoId:'h65XHWhgwRk', title:'How to Report a Scam',                                    channel:'Education',              tag:'Action' },
]

// getGreeting moved inside component

// ── Props ─────────────────────────────────────────────────────────────────────
interface Props {
  displayName:      string
  userEmail:        string
  initialQuestions: QuizQuestion[]
  initialPoints:    UserPoints | null
  initialContacts:  TrustedContact[]
  initialVideos?:   any[]
}

// ── Component ─────────────────────────────────────────────────────────────────
export default function DashboardClient({
  displayName, userEmail,
  initialQuestions, initialPoints, initialContacts, initialVideos,
}: Props) {
  const { t, lang } = useLang()

  // ── Time-based greeting (uses t() from hook, so must be inside component) ──
  const greeting = (() => {
    const h = new Date().getHours()
    if (h >= 5  && h < 12) return { text: t('greet_morning'),   emoji: '🌤️', sub: t('greet_sub_morning') }
    if (h >= 12 && h < 17) return { text: t('greet_afternoon'), emoji: '☀️',  sub: t('greet_sub_afternoon') }
    if (h >= 17 && h < 21) return { text: t('greet_evening'),   emoji: '🌆', sub: t('greet_sub_evening') }
    return                         { text: t('greet_night'),     emoji: '🌙', sub: t('greet_sub_night') }
  })()
  const initials = (displayName || userEmail).charAt(0).toUpperCase() || 'U'

  // ── Video player ───────────────────────────────────────────────────────────
  // Pick a random starting video on mount; shuffle on each "next" click
  // Start at index 0 for SSR to avoid hydration mismatch, then randomise on mount
  const [vidIdx,    setVidIdx]    = useState(0)
  const [playing,   setPlaying]   = useState(false)
  
  const activeVideos = initialVideos && initialVideos.length > 0 ? initialVideos : VIDEOS

  useEffect(() => {
    setVidIdx(Math.floor(Math.random() * activeVideos.length))
  }, [activeVideos.length])

  const currentVid = activeVideos[vidIdx]

  const shuffleVideo = () => {
    // Pick a different video from current
    let next = Math.floor(Math.random() * activeVideos.length)
    if (activeVideos.length > 1) while (next === vidIdx) next = Math.floor(Math.random() * activeVideos.length)
    setVidIdx(next)
    setPlaying(false)
  }

  const prevVideo = () => {
    setVidIdx(i => (i - 1 + activeVideos.length) % activeVideos.length)
    setPlaying(false)
  }

  const nextVideo = () => {
    setVidIdx(i => (i + 1) % activeVideos.length)
    setPlaying(false)
  }

  // ── Quiz ───────────────────────────────────────────────────────────────────
  const [questions,  setQuestions]  = useState<QuizQuestion[]>(initialQuestions)
  const [quizIdx,    setQuizIdx]    = useState(0)
  const [selected,   setSelected]   = useState<number | null>(null)
  const [quizDone,   setQuizDone]   = useState(false)
  const [showResult, setShowResult] = useState(false)
  const [userPts,    setUserPts]    = useState<UserPoints | null>(initialPoints)
  const [earnedNow,  setEarnedNow]  = useState(0)
  const [correct,    setCorrect]    = useState(0)
  const [qPending,   startQ]        = useTransition()

  const currentQ  = questions[quizIdx]
  const noQ       = questions.length === 0
  const level     = userPts?.level ?? 'Beginner'
  const lvlCol    = LEVEL_COLORS[level] ?? LEVEL_COLORS.Beginner
  const nextPts   = NEXT_LEVEL_PTS[level] ?? Infinity
  const nextName  = NEXT_LEVEL_NAME[level] ?? ''
  const barPct    = nextPts === Infinity ? 100
    : Math.min(100, Math.round(((userPts?.total_points ?? 0) / nextPts) * 100))

  const handleAnswer = (i: number) => {
    if (selected !== null || qPending || !currentQ) return
    setSelected(i)
    setShowResult(true)
    const ok = i === currentQ.correct_index
    startQ(async () => {
      const res = await submitQuizAnswer(currentQ.id, i, ok, currentQ.points_value)
      if (res.success && res.newPoints) {
        setUserPts(res.newPoints)
        if (ok) { setEarnedNow(e => e + currentQ.points_value); setCorrect(c => c + 1) }
      }
    })
  }

  const nextQuestion = () => {
    if (quizIdx + 1 >= questions.length) setQuizDone(true)
    else { setQuizIdx(q => q + 1); setSelected(null); setShowResult(false) }
  }

  const resetQuiz = () => {
    setQuizIdx(0); setSelected(null); setShowResult(false)
    setQuizDone(false); setEarnedNow(0); setCorrect(0)
  }

  // ── Contacts ───────────────────────────────────────────────────────────────
  const [contacts,    setContacts]   = useState<TrustedContact[]>(initialContacts)
  const [showForm,    setShowForm]   = useState(false)
  const [cName,       setCName]      = useState('')
  const [cNumber,     setCNumber]    = useState('')
  const [cRelation,   setCRelation]  = useState('Family')
  const [cErr,        setCErr]       = useState('')
  const [cPending,    startC]        = useTransition()

  // ── Mobile sidebar drawer ─────────────────────────────────
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)

  // ── Profile panel ──────────────────────────────────────────────
  const [profileOpen, setProfileOpen] = useState(false)
  const [profileTab,  setProfileTab]  = useState<'profile'|'settings'|'tnc'|'guide'>('profile')

  // ── Settings state (each toggle tracked individually) ────────────────────
  const [notifScamAlert,   setNotifScamAlert]   = useState(true)
  const [notifQuizRemind,  setNotifQuizRemind]  = useState(true)
  const [notifWeeklyDigest,setNotifWeeklyDigest]= useState(false)
  const [notifNewArticles, setNotifNewArticles] = useState(false)
  const [dispLargeText,    setDispLargeText]    = useState(false)
  const [dispHighContrast, setDispHighContrast] = useState(false)
  const [dispSimplified,   setDispSimplified]   = useState(false)
  const [privAnonymised,   setPrivAnonymised]   = useState(true)
  const [privAnalytics,    setPrivAnalytics]    = useState(true)
  const [settingsLoaded,   setSettingsLoaded]   = useState(false)

  // Apply display settings to document root
  const applyDisplaySettings = (large: boolean, contrast: boolean, simplified: boolean) => {
    const root = document.documentElement
    root.style.fontSize       = large      ? '18px'   : ''
    root.style.filter         = contrast   ? 'contrast(1.25) brightness(1.1)' : ''
    root.dataset.simplified   = simplified ? 'true'   : 'false'
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

  // Auto-save and apply settings whenever they change
  useEffect(() => {
    if (!settingsLoaded) return
    localStorage.setItem('vg_settings', JSON.stringify({
      notifScamAlert, notifQuizRemind, notifWeeklyDigest, notifNewArticles,
      dispLargeText, dispHighContrast, dispSimplified,
      privAnonymised, privAnalytics,
    }))
    applyDisplaySettings(dispLargeText, dispHighContrast, dispSimplified)
  }, [
    notifScamAlert, notifQuizRemind, notifWeeklyDigest, notifNewArticles,
    dispLargeText, dispHighContrast, dispSimplified,
    privAnonymised, privAnalytics, settingsLoaded
  ])

  const handleAdd = () => {
    if (!cName.trim() || !cNumber.trim()) { setCErr('Name and number are required.'); return }
    setCErr('')
    startC(async () => {
      const res = await addTrustedContact(cName, cNumber, cRelation)
      if (!res.success) { setCErr(res.error ?? 'Failed to save.'); return }
      setContacts(prev => [...prev, {
        id: `${Date.now()}`, name: cName.trim(), number: cNumber.trim(),
        relation: cRelation, created_at: new Date().toISOString(),
      }])
      setCName(''); setCNumber(''); setCRelation('Family'); setShowForm(false)
    })
  }

  const handleDelete = (id: string) => {
    startC(async () => {
      const res = await deleteTrustedContact(id)
      if (res.success) setContacts(prev => prev.filter(c => c.id !== id))
    })
  }

  return (
    <div style={{display:'flex',flexDirection:'column',minHeight:'100vh',background:'var(--bg-primary)',fontFamily:"'Inter',sans-serif"}}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&display=swap');

        /* ── sidebar ── */
        .dash-sidebar{width:260px;min-height:100vh;background:#ffffff;border-right:1px solid rgba(0,53,128,0.12);display:flex;flex-direction:column;padding:1.5rem 1rem;position:sticky;top:0;z-index:20;flex-shrink:0;box-shadow:2px 0 12px rgba(0,53,128,0.06)}
        .dash-main{flex:1;min-width:0;padding:2rem 2.5rem;overflow-x:hidden}

        /* ── Senior-friendly nav items — large tap targets, bold text ── */
        .nav-item{display:flex;align-items:center;gap:12px;padding:13px 14px;border-radius:12px;font-size:1rem;font-weight:600;color:#3d5080;text-decoration:none;cursor:pointer;transition:background .2s,color .2s;border:none;background:none;width:100%;text-align:left;margin-bottom:4px;font-family:'Inter',sans-serif;min-height:50px}
        .nav-item:hover:not(.nav-disabled){background:rgba(0,53,128,0.07);color:#003580}
        .nav-item.nav-active{background:rgba(0,53,128,0.1);color:#003580;border-left:3px solid #003580}
        .nav-item.nav-disabled{opacity:.45;cursor:default}
        .nav-badge{margin-left:auto;font-size:.7rem;font-weight:700;letter-spacing:.05em;padding:3px 9px;border-radius:99px;background:rgba(245,168,0,.15);color:#a07800;border:1px solid rgba(245,168,0,.3)}

        /* ── layout ── */
        .page-header{display:flex;align-items:center;justify-content:space-between;margin-bottom:2rem}
        .user-chip{display:flex;align-items:center;gap:10px;background:#fff;border:1px solid rgba(0,53,128,0.15);border-radius:99px;padding:6px 16px 6px 8px;max-width:260px}
        .user-avatar{width:36px;height:36px;border-radius:50%;background:linear-gradient(135deg,#003580,#1a4fa0);display:flex;align-items:center;justify-content:center;font-size:.85rem;font-weight:700;color:white;flex-shrink:0}
        .monitor-banner{background:linear-gradient(135deg,rgba(0,53,128,.06),rgba(26,79,160,.03));border:1px solid rgba(0,53,128,.15);border-radius:16px;padding:1.25rem 1.5rem;display:flex;align-items:center;gap:14px;margin-bottom:1.75rem}
        .monitor-icon{width:52px;height:52px;border-radius:14px;background:rgba(0,53,128,.1);display:flex;align-items:center;justify-content:center;flex-shrink:0}
        .soon-badge{font-size:.72rem;font-weight:700;letter-spacing:.06em;padding:4px 12px;border-radius:99px;background:rgba(245,168,0,.12);border:1px solid rgba(245,168,0,.3);color:#a07800;text-transform:uppercase}
        .dash-grid{display:grid;grid-template-columns:1fr 300px;gap:1.5rem}
        .mobile-top-bar{display:none;align-items:center;justify-content:space-between;padding:.75rem 1rem;background:#fff;border-bottom:1px solid rgba(0,53,128,.1);position:sticky;top:0;z-index:30;box-shadow:0 2px 8px rgba(0,53,128,.06)}
        .hamburger-btn{background:none;border:none;cursor:pointer;padding:8px;border-radius:10px;color:#003580;display:flex;align-items:center;justify-content:center;transition:background .2s;min-width:40px;min-height:40px}
        .hamburger-btn:hover{background:rgba(0,53,128,.08)}
        .sidebar-overlay{display:none}

        @media(max-width:900px){.dash-grid{grid-template-columns:1fr}.dash-main{padding:1.25rem}}
        @media(max-width:768px){
          .dash-sidebar{position:fixed;left:0;top:0;width:260px;height:100vh;z-index:60;transform:translateX(-100%);transition:transform .28s cubic-bezier(.16,1,.3,1);box-shadow:4px 0 32px rgba(0,30,80,.18);overflow:hidden}
          .dash-sidebar.mobile-open{transform:translateX(0)}
          .dash-main{padding:1rem 1rem 5rem;width:100%}
          .mobile-top-bar{display:flex}
          .sidebar-overlay{display:block;position:fixed;inset:0;background:rgba(0,30,80,.4);backdrop-filter:blur(3px);z-index:59}
          .sidebar-close-mobile{display:flex!important}
        }


        /* ── hub card ── */
        .hub-card{background:#ffffff;border:1px solid rgba(0,53,128,0.12);border-radius:20px;overflow:hidden}
        .hub-header{background:linear-gradient(135deg,rgba(0,53,128,.08),rgba(26,79,160,.04));border-bottom:1px solid rgba(0,53,128,.12);padding:1.75rem 1.75rem 1.5rem;position:relative;overflow:hidden}
        .hub-header::before{content:'';position:absolute;right:-50px;top:-50px;width:200px;height:200px;background:radial-gradient(circle,rgba(0,53,128,.1) 0%,transparent 70%);border-radius:50%;pointer-events:none}
        .hub-ai-badge{display:inline-flex;align-items:center;gap:5px;font-size:.72rem;font-weight:700;letter-spacing:.06em;text-transform:uppercase;padding:4px 12px;border-radius:99px;background:rgba(0,53,128,.1);border:1px solid rgba(0,53,128,.2);color:#003580;margin-bottom:.75rem}
        .hub-title{font-size:1.4rem;font-weight:800;color:#0d1a3a;letter-spacing:-.025em;margin-bottom:.4rem}
        .hub-sub{font-size:.9rem;color:#3d5080;line-height:1.6}
        .hub-cta{display:inline-flex;align-items:center;gap:8px;margin-top:1.25rem;padding:12px 24px;border-radius:12px;background:linear-gradient(135deg,#003580,#1a4fa0);color:white;font-size:.95rem;font-weight:700;text-decoration:none;box-shadow:0 4px 18px rgba(0,53,128,.28);transition:opacity .2s,transform .15s}
        .hub-cta:hover{opacity:.9;transform:translateY(-1px)}

        /* ── right panel cards ── */
        .right-card{background:#ffffff;border:1px solid rgba(0,53,128,0.12);border-radius:16px;padding:1.25rem 1.5rem}
        .section-title{font-size:.75rem;font-weight:800;letter-spacing:.09em;text-transform:uppercase;color:#8898bb;margin-bottom:1rem}

        /* ── quiz — senior-sized ── */
        .quiz-card{background:linear-gradient(135deg,rgba(0,53,128,.06),rgba(26,79,160,.03));border:1px solid rgba(0,53,128,.15);border-radius:16px;padding:1.25rem 1.5rem}
        .quiz-icon-wrap{width:36px;height:36px;border-radius:10px;flex-shrink:0;background:linear-gradient(135deg,#003580,#1a4fa0);display:flex;align-items:center;justify-content:center}
        .quiz-q{font-size:1rem;font-weight:700;color:#0d1a3a;line-height:1.55;margin-bottom:.875rem}
        .quiz-option{width:100%;text-align:left;padding:12px 14px;border-radius:10px;margin-bottom:8px;border:1.5px solid rgba(0,53,128,0.15);background:#f8faff;font-size:.95rem;color:#3d5080;cursor:pointer;transition:background .15s,border-color .15s,color .15s;font-family:'Inter',sans-serif;display:flex;align-items:center;gap:10px;font-weight:500;min-height:48px}
        .quiz-option:hover:not(:disabled){background:rgba(0,53,128,.08);border-color:rgba(0,53,128,.3);color:#003580}
        .quiz-option.correct{background:rgba(0,135,90,.1);border-color:rgba(0,135,90,.35);color:#00875a;font-weight:700}
        .quiz-option.wrong{background:rgba(204,0,1,.08);border-color:rgba(204,0,1,.3);color:#CC0001;font-weight:700}
        .quiz-option.neutral{opacity:.45;cursor:default}
        .quiz-tip{font-size:.875rem;color:#3d5080;line-height:1.6;margin-top:.75rem;padding:.875rem;background:rgba(0,135,90,.06);border:1px solid rgba(0,135,90,.2);border-radius:10px}
        .quiz-progress{display:flex;gap:5px;margin-bottom:.875rem}
        .qp-dot{height:5px;flex:1;border-radius:99px;background:rgba(0,53,128,.1)}
        .qp-dot.done{background:#003580}
        .qp-dot.current{background:rgba(0,53,128,.4)}
        .btn-next{width:100%;padding:13px;border-radius:10px;border:none;cursor:pointer;background:linear-gradient(135deg,#003580,#1a4fa0);color:white;font-size:.95rem;font-weight:700;margin-top:.75rem;font-family:'Inter',sans-serif;transition:opacity .2s;min-height:50px}
        .btn-next:hover:not(:disabled){opacity:.88}
        .btn-next:disabled{opacity:.5;cursor:default}
        .pts-pop{display:inline-flex;align-items:center;gap:4px;font-size:.78rem;font-weight:700;padding:3px 10px;border-radius:99px;background:rgba(245,168,0,.15);border:1px solid rgba(245,168,0,.3);color:#a07800;animation:popIn .35s cubic-bezier(.34,1.56,.64,1)}
        @keyframes popIn{from{transform:scale(.6);opacity:0}to{transform:scale(1);opacity:1}}
        .prog-wrap{height:6px;background:rgba(0,53,128,.08);border-radius:99px;overflow:hidden;margin-top:5px}
        .prog-fill{height:100%;border-radius:99px;background:linear-gradient(90deg,#003580,#1a4fa0);transition:width .7s ease}

        /* ── contacts ── */
        .contact-row{display:flex;align-items:center;gap:12px;padding:11px 0;border-bottom:1px solid rgba(0,53,128,0.08)}
        .contact-row:last-of-type{border-bottom:none}
        .c-avatar{width:38px;height:38px;border-radius:50%;flex-shrink:0;background:linear-gradient(135deg,#003580,#1a4fa0);display:flex;align-items:center;justify-content:center;font-size:.85rem;font-weight:700;color:white}
        .c-tag{margin-left:auto;font-size:.65rem;font-weight:700;padding:3px 8px;border-radius:6px;background:rgba(0,53,128,.08);color:#003580;border:1px solid rgba(0,53,128,.15);flex-shrink:0}
        .del-btn{background:none;border:none;cursor:pointer;color:#8898bb;padding:6px;border-radius:8px;display:flex;transition:color .15s,background .15s;margin-left:4px;min-height:36px;min-width:36px;align-items:center;justify-content:center}
        .del-btn:hover{color:#CC0001;background:rgba(204,0,1,.08)}
        .add-form{margin-top:.875rem;padding:1rem;background:rgba(0,53,128,.04);border:1px solid rgba(0,53,128,.15);border-radius:12px}
        .fi{width:100%;padding:10px 12px;border-radius:9px;border:1.5px solid rgba(0,53,128,.15);background:#f8faff;color:#0d1a3a;font-size:.95rem;font-family:'Inter',sans-serif;outline:none;box-sizing:border-box;margin-bottom:8px;transition:border-color .2s;min-height:44px}
        .fi:focus{border-color:#003580;box-shadow:0 0 0 3px rgba(0,53,128,.1)}
        .fs{width:100%;padding:10px 12px;border-radius:9px;border:1.5px solid rgba(0,53,128,.15);background:#f8faff;color:#3d5080;font-size:.95rem;font-family:'Inter',sans-serif;outline:none;box-sizing:border-box;margin-bottom:10px;min-height:44px}
        .f-row{display:flex;gap:8px}
        .btn-save{flex:1;padding:11px;border-radius:9px;border:none;cursor:pointer;background:linear-gradient(135deg,#003580,#1a4fa0);color:white;font-size:.95rem;font-weight:700;font-family:'Inter',sans-serif;transition:opacity .2s;min-height:46px}
        .btn-save:hover:not(:disabled){opacity:.88}
        .btn-save:disabled{opacity:.5;cursor:default}
        .btn-cancel{padding:11px 14px;border-radius:9px;border:1.5px solid rgba(0,53,128,.2);background:none;color:#3d5080;font-size:.95rem;font-weight:600;cursor:pointer;font-family:'Inter',sans-serif;display:flex;align-items:center;gap:4px;min-height:46px}
        .btn-cancel:hover{color:#003580;border-color:rgba(0,53,128,.4)}
        .f-err{font-size:.82rem;color:#CC0001;margin-bottom:8px;font-weight:600}
        .empty-c{text-align:center;padding:1.5rem .5rem;color:#8898bb;font-size:.9rem}
        .btn-add-contact{width:100%;padding:11px;border-radius:10px;border:1.5px dashed rgba(0,53,128,.25);background:rgba(0,53,128,.04);color:#003580;font-size:.9rem;font-weight:700;cursor:pointer;font-family:'Inter',sans-serif;display:flex;align-items:center;justify-content:center;gap:8px;transition:background .2s,border-color .2s;min-height:48px}
        .btn-add-contact:hover{background:rgba(0,53,128,.08);border-color:rgba(0,53,128,.4)}

        /* ── hotlines — big tap targets ── */
        .hotline-row{display:flex;align-items:center;gap:12px;padding:12px 14px;border-radius:12px;background:#f8faff;border:1.5px solid rgba(0,53,128,.1);margin-bottom:8px;text-decoration:none;transition:background .2s;min-height:52px}
        .hotline-row:hover{background:rgba(0,53,128,.06);border-color:rgba(0,53,128,.2)}
        .h-dot{width:10px;height:10px;border-radius:50%;flex-shrink:0}

        /* ── video player ── */
        .vid-thumb-wrap:hover .vid-play-btn{transform:scale(1.1)!important}
        .vid-thumb-wrap:hover{background:rgba(0,0,0,.15)}
        .vid-prev-btn:hover{background:rgba(0,53,128,.08)!important;border-color:rgba(0,53,128,.25)!important;color:#003580!important}
        .vid-next-btn:hover{background:rgba(0,53,128,.12)!important}
        .vid-shuffle-btn:hover{background:rgba(0,53,128,.15)!important}

        @keyframes ring-pulse{0%{box-shadow:0 0 0 0 rgba(0,53,128,.4)}70%{box-shadow:0 0 0 12px rgba(0,53,128,0)}100%{box-shadow:0 0 0 0 rgba(0,53,128,0)}}
        .pulse-ring{animation:ring-pulse 2.5s ease-out infinite}

        /* ── Profile user chip (sidebar) ── */
        .user-profile-btn{display:flex;align-items:center;gap:10px;width:100%;padding:10px 12px;border-radius:12px;border:none;background:rgba(0,53,128,.05);cursor:pointer;transition:background .2s;margin-bottom:6px;font-family:'Inter',sans-serif;text-align:left;border:1px solid rgba(0,53,128,.1);min-height:54px}
        .user-profile-btn:hover{background:rgba(0,53,128,.1)}
        .user-profile-avatar{width:36px;height:36px;border-radius:50%;background:linear-gradient(135deg,#003580,#1a4fa0);display:flex;align-items:center;justify-content:center;font-size:.85rem;font-weight:700;color:white;flex-shrink:0;box-shadow:0 2px 8px rgba(0,53,128,.25)}

        /* ── Sign-out button — large, red, clearly labelled ── */
        .signout-btn{display:flex;align-items:center;gap:10px;width:100%;padding:13px 14px;border-radius:12px;border:1.5px solid rgba(204,0,1,.2);background:rgba(204,0,1,.05);cursor:pointer;font-family:'Inter',sans-serif;font-size:.95rem;font-weight:700;color:#CC0001;transition:background .2s,border-color .2s;min-height:50px}
        .signout-btn:hover{background:rgba(204,0,1,.1);border-color:rgba(204,0,1,.35)}

        /* ── Profile panel overlay ── */
        .profile-panel{
          position:fixed;top:0;right:0;width:400px;max-width:100vw;height:100vh;
          background:#ffffff;border-left:1px solid rgba(0,53,128,0.14);
          box-shadow:-4px 0 32px rgba(0,53,128,0.12);
          z-index:50;display:flex;flex-direction:column;
          animation:slideIn .25s cubic-bezier(.16,1,.3,1);
          overflow:hidden;
        }
        @keyframes slideIn{from{transform:translateX(100%);opacity:.5}to{transform:translateX(0);opacity:1}}
        .profile-panel-header{
          padding:1.5rem 1.5rem;
          background:linear-gradient(135deg,rgba(0,53,128,.07),rgba(26,79,160,.04));
          border-bottom:1px solid rgba(0,53,128,0.12);
          display:flex;align-items:flex-start;justify-content:space-between;gap:12px;flex-shrink:0;
        }
        .profile-big-avatar{
          width:54px;height:54px;border-radius:50%;flex-shrink:0;
          background:linear-gradient(135deg,#003580,#1a4fa0);
          display:flex;align-items:center;justify-content:center;
          font-size:1.2rem;font-weight:700;color:white;
          box-shadow:0 4px 14px rgba(0,53,128,0.3);
        }
        .panel-close-btn{
          background:none;border:none;cursor:pointer;padding:6px;
          color:#8898bb;border-radius:9px;display:flex;
          transition:color .15s,background .15s;flex-shrink:0;min-width:36px;min-height:36px;align-items:center;justify-content:center;
        }
        .panel-close-btn:hover{color:#003580;background:rgba(0,53,128,.08)}

        /* tabs */
        .profile-tabs{display:flex;border-bottom:1px solid rgba(0,53,128,0.12);flex-shrink:0;padding:0 .5rem;background:#fafcff}
        .profile-tab{
          flex:1;padding:12px 4px;font-size:.8rem;font-weight:700;
          background:none;border:none;cursor:pointer;
          color:#8898bb;border-bottom:2px solid transparent;
          transition:color .15s,border-color .15s;
          font-family:'Inter',sans-serif;display:flex;align-items:center;justify-content:center;gap:5px;
          min-height:48px;
        }
        .profile-tab:hover{color:#003580}
        .profile-tab.active{color:#003580;border-bottom-color:#003580}

        /* scrollable content */
        .profile-content{flex:1;overflow-y:auto;padding:1.5rem;scrollbar-width:thin;background:#ffffff}
        .profile-content::-webkit-scrollbar{width:4px}
        .profile-content::-webkit-scrollbar-track{background:transparent}
        .profile-content::-webkit-scrollbar-thumb{background:rgba(0,53,128,0.15);border-radius:4px}

        /* info rows (profile tab) */
        .panel-section-label{font-size:.7rem;font-weight:800;letter-spacing:.1em;text-transform:uppercase;color:#8898bb;margin-bottom:.7rem}
        .panel-last-updated{font-size:.8rem;color:#8898bb;margin-bottom:1rem;margin-top:-.3rem}
        .info-row{display:flex;align-items:center;justify-content:space-between;gap:12px;padding:11px 0;border-bottom:1px solid rgba(0,53,128,0.07);font-size:.9rem}
        .info-key{color:#8898bb;flex-shrink:0;font-weight:500}
        .info-val{color:#0d1a3a;font-weight:700;text-align:right;overflow:hidden;text-overflow:ellipsis;white-space:nowrap;max-width:60%}

        /* settings toggles */
        .setting-row{display:flex;align-items:center;justify-content:space-between;gap:12px;padding:13px 0;border-bottom:1px solid rgba(0,53,128,0.07)}
        .setting-label{font-size:.9rem;font-weight:700;color:#0d1a3a;display:block}
        .setting-desc{font-size:.8rem;color:#8898bb;margin-top:3px;line-height:1.45}
        .toggle{width:46px;height:26px;border-radius:99px;background:rgba(0,53,128,.15);position:relative;cursor:pointer;transition:background .25s;flex-shrink:0;min-width:46px}
        .toggle.on{background:linear-gradient(135deg,#003580,#1a4fa0)}
        .toggle-knob{position:absolute;top:3px;left:3px;width:20px;height:20px;border-radius:50%;background:white;transition:transform .25s cubic-bezier(.34,1.56,.64,1);box-shadow:0 1px 4px rgba(0,53,128,.3)}
        .toggle.on .toggle-knob{transform:translateX(20px)}
        .toggle:active{transform:scale(.95)}
        .btn-danger{width:100%;padding:12px;border-radius:10px;border:1.5px solid rgba(204,0,1,.25);background:rgba(204,0,1,.06);color:#CC0001;font-size:.95rem;font-weight:700;cursor:pointer;font-family:'Inter',sans-serif;transition:background .2s;min-height:48px}
        .btn-danger:hover:not(:disabled){background:rgba(204,0,1,.12)}
        .btn-danger:disabled{opacity:.45;cursor:default}
        .preview-chip{font-size:.72rem;font-weight:700;padding:3px 10px;border-radius:99px;background:rgba(0,53,128,.1);border:1px solid rgba(0,53,128,.2);color:#003580}
        .delete-confirm-box{background:rgba(204,0,1,.04);border:1px solid rgba(204,0,1,.18);border-radius:12px;padding:1rem}
        .save-spinner{width:14px;height:14px;border:2px solid rgba(255,255,255,.3);border-top-color:white;border-radius:50%;display:inline-block;animation:spin .7s linear infinite}
        @keyframes spin{to{transform:rotate(360deg)}}

        /* T&C sections */
        .tnc-section{margin-bottom:1.2rem;padding-bottom:1.2rem;border-bottom:1px solid rgba(0,53,128,0.07)}
        .tnc-section:last-child{border-bottom:none}
        .tnc-title{font-size:.9rem;font-weight:700;color:#0d1a3a;margin-bottom:.4rem}
        .tnc-body{font-size:.85rem;color:#3d5080;line-height:1.7}

        /* Guidelines */
        .guide-item{display:flex;gap:14px;margin-bottom:1.2rem;padding-bottom:1.2rem;border-bottom:1px solid rgba(0,53,128,0.07);align-items:flex-start}
        .guide-item:last-child{border-bottom:none}
        .guide-icon{font-size:1.5rem;flex-shrink:0;margin-top:1px}
        .guide-title{font-size:.9rem;font-weight:700;color:#0d1a3a;margin-bottom:.3rem}
        .guide-body{font-size:.85rem;color:#3d5080;line-height:1.65}

        @media(max-width:480px){
          .profile-panel{width:100vw}
        }
      `}</style>

      {/* ── Mobile top bar (hamburger) ─────────────────────────────────────── */}
      <div className="mobile-top-bar">
        <button className="hamburger-btn" onClick={() => setMobileMenuOpen(true)} aria-label="Open menu">
          <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <line x1="3" y1="6" x2="21" y2="6"/><line x1="3" y1="12" x2="21" y2="12"/><line x1="3" y1="18" x2="21" y2="18"/>
          </svg>
        </button>
        <div style={{display:'flex',alignItems:'center',gap:8}}>
          <div style={{width:32,height:32,borderRadius:9,background:'linear-gradient(135deg,#003580,#1a4fa0)',display:'flex',alignItems:'center',justifyContent:'center'}}>
            <ShieldIcon size={16}/>
          </div>
          <span style={{fontWeight:800,fontSize:'.95rem',color:'#003580'}}>VoiceGuard</span>
        </div>
        <div className="user-avatar" style={{cursor:'pointer'}} onClick={() => {setProfileOpen(true);setProfileTab('profile')}}>{initials}</div>
      </div>

      {/* ── Mobile sidebar overlay backdrop ───────────────────────────────── */}
      {mobileMenuOpen && (
        <div className="sidebar-overlay" onClick={() => setMobileMenuOpen(false)} />
      )}

      {/* ── Sidebar + Main (flex row) ────────────────────────────────────── */}
      <div style={{display:'flex',flex:1}}>

      {/* ── Sidebar ─────────────────────────────────────────────────────────── */}
      <aside className={`dash-sidebar${mobileMenuOpen ? ' mobile-open' : ''}`}>
        {/* Top bar accent line — Malaysian govt style */}
        <div style={{position:'absolute',top:0,left:0,right:0,height:'4px',background:'linear-gradient(90deg,#003580,#1a4fa0,#CC0001)'}} />
        {/* Close button — only visible on mobile */}
        <button
          onClick={() => setMobileMenuOpen(false)}
          style={{display:'none',position:'absolute',top:12,right:12,background:'none',border:'none',cursor:'pointer',padding:6,borderRadius:8,color:'#8898bb'}}
          className="sidebar-close-mobile"
          aria-label="Close menu"
        >
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>
          </svg>
        </button>
        <div style={{display:'flex',alignItems:'center',gap:12,marginBottom:'2rem',paddingLeft:4,marginTop:'0.75rem'}}>
          <div style={{width:40,height:40,borderRadius:11,background:'linear-gradient(135deg,#003580,#1a4fa0)',display:'flex',alignItems:'center',justifyContent:'center',boxShadow:'0 4px 14px rgba(0,53,128,.3)'}}>
            <ShieldIcon size={18}/>
          </div>
          <span style={{fontWeight:800,fontSize:'1.05rem',letterSpacing:'-0.02em',color:'#003580'}}>
            VoiceGuard
          </span>
        </div>

        <nav style={{flex:1}}>
          <div style={{fontSize:'.7rem',fontWeight:800,letterSpacing:'.1em',textTransform:'uppercase',color:'#8898bb',padding:'0 14px',marginBottom:10}}>Main Menu</div>
          {NAV_HREFS.map(n=>(
            <Link key={n.href} href={n.disabled?'#':n.href}
              className={`nav-item${n.active?' nav-active':''}${n.disabled?' nav-disabled':''}`}
              onClick={() => setMobileMenuOpen(false)}>
              <n.icon size={20}/>{t(n.tKey)}
              {n.badge&&<span className="nav-badge">{n.badge}</span>}
            </Link>
          ))}
        </nav>

        <div style={{borderTop:'1px solid rgba(0,53,128,0.12)',paddingTop:'1rem'}}>
          {/* Language switcher in sidebar */}
          <div style={{padding:'0 8px 10px',display:'flex',alignItems:'center',justifyContent:'space-between'}}>
            <span style={{fontSize:'.72rem',fontWeight:700,letterSpacing:'.08em',textTransform:'uppercase',color:'#8898bb'}}>{t('lang_label')}</span>
            <LanguageSwitcher compact/>
          </div>
          {/* Clickable user chip */}
          <button className="user-profile-btn" onClick={()=>{setProfileOpen(true);setProfileTab('profile')}}>
            <div className="user-profile-avatar">{initials}</div>
            <div style={{minWidth:0,flex:1}}>
              <div style={{fontSize:'.9rem',fontWeight:700,color:'#0d1a3a',overflow:'hidden',textOverflow:'ellipsis',whiteSpace:'nowrap'}}>
                {displayName||userEmail.split('@')[0]}
              </div>
              <div style={{fontSize:'.75rem',color:'#8898bb',overflow:'hidden',textOverflow:'ellipsis',whiteSpace:'nowrap'}}>
                {userEmail}
              </div>
            </div>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{flexShrink:0,color:'#8898bb'}}><circle cx="12" cy="12" r="3"/><path d="M19.07 4.93a10 10 0 0 1 0 14.14M4.93 4.93a10 10 0 0 0 0 14.14"/></svg>
          </button>
          {/* ── Sign Out — uses server action, no /auth/signout route needed ── */}
          <form action={logout}>
            <button type="submit" className="signout-btn">
              <LogOutIcon size={20}/>{t('nav_signout')}
            </button>
          </form>
        </div>
      </aside>

      {/* ── Profile / Settings panel overlay ──────────────────────────────── */}
      {profileOpen&&(
        <>
          {/* Backdrop */}
          <div onClick={()=>setProfileOpen(false)}
            style={{position:'fixed',inset:0,background:'rgba(0,30,80,.35)',backdropFilter:'blur(3px)',zIndex:40}}/>

          {/* Panel */}
          <div className="profile-panel">
            {/* Panel header */}
            <div className="profile-panel-header">
              <div style={{display:'flex',alignItems:'center',gap:12}}>
                <div className="profile-big-avatar">{initials}</div>
                <div>
                  <div style={{fontSize:'1rem',fontWeight:700,color:'var(--text-primary)'}}>{displayName||userEmail.split('@')[0]}</div>
                  <div style={{fontSize:'.78rem',color:'var(--text-muted)',marginTop:2}}>{userEmail}</div>
                  {userPts&&(
                    <div style={{display:'flex',alignItems:'center',gap:5,marginTop:5}}>
                      <span style={{fontSize:'.65rem',fontWeight:700,padding:'1px 7px',borderRadius:99,background:lvlCol.bg,border:`1px solid ${lvlCol.border}`,color:lvlCol.color}}>{level}</span>
                      <span style={{fontSize:'.68rem',color:'#facc15',fontWeight:700,display:'flex',alignItems:'center',gap:2}}>
                        <StarIcon size={10}/>{userPts.total_points} pts
                      </span>
                    </div>
                  )}
                </div>
              </div>
              <button onClick={()=>setProfileOpen(false)} className="panel-close-btn">
                <XIcon size={15}/>
              </button>
            </div>

            {/* Tab bar */}
            <div className="profile-tabs">
              {([
                {id:'profile', label:t('tab_profile'),   icon:'👤'},
                {id:'settings',label:t('tab_settings'),  icon:'⚙️'},
                {id:'tnc',     label:t('tab_tnc'),        icon:'📜'},
                {id:'guide',   label:t('tab_guide'), icon:'📘'},
              ] as const).map(t=>(
                <button key={t.id}
                  className={`profile-tab${profileTab===t.id?' active':''}`}
                  onClick={()=>setProfileTab(t.id)}>
                  <span>{t.icon}</span>{t.label}
                </button>
              ))}
            </div>

            {/* Tab content */}
            <div className="profile-content">

              {/* ── PROFILE TAB ── */}
              {profileTab==='profile'&&(
                <div>
                  <p className="panel-section-label">{t('profile_account_info')}</p>
                  <div className="info-row"><span className="info-key">{t('profile_display_name')}</span><span className="info-val">{displayName||'—'}</span></div>
                  <div className="info-row"><span className="info-key">Email</span><span className="info-val">{userEmail}</span></div>
                  <div className="info-row"><span className="info-key">{t('profile_account_type')}</span><span className="info-val">{t('profile_free_plan')}</span></div>
                  <div className="info-row" style={{borderBottom:'none'}}><span className="info-key">{t('profile_member_since')}</span><span className="info-val">2025</span></div>

                  {userPts&&(
                    <>
                      <p className="panel-section-label" style={{marginTop:'1.25rem'}}>{t('profile_quiz_summary')}</p>
                      <div className="info-row"><span className="info-key">{t('profile_total_points')}</span><span className="info-val" style={{color:'#facc15',fontWeight:700}}>{userPts.total_points} pts</span></div>
                      <div className="info-row"><span className="info-key">{t('profile_level')}</span><span className="info-val" style={{color:lvlCol.color,fontWeight:700}}>{level}</span></div>
                      <div className="info-row"><span className="info-key">{t('profile_questions')}</span><span className="info-val">{userPts.total_attempted}</span></div>
                      <div className="info-row"><span className="info-key">{t('profile_correct')}</span><span className="info-val" style={{color:'#34d399'}}>{userPts.total_correct}</span></div>
                      <div className="info-row" style={{borderBottom:'none'}}><span className="info-key">{t('profile_streak')}</span><span className="info-val">{userPts.streak_days} day{userPts.streak_days!==1?'s':''} 🔥</span></div>
                    </>
                  )}
                </div>
              )}

              {/* ── SETTINGS TAB ── */}
              {profileTab==='settings'&&(
                <div>

                  {/* ── TWO-FACTOR AUTHENTICATION ── */}
                  <p className="panel-section-label">🔐 Two-Factor Authentication</p>
                  <div style={{
                    padding:'14px 16px', borderRadius:12,
                    background:'rgba(52,211,153,.06)', border:'1px solid rgba(52,211,153,.2)',
                    marginBottom:'1rem',
                  }}>
                    <div style={{display:'flex',alignItems:'center',justifyContent:'space-between',gap:12}}>
                      <div>
                        <div style={{fontSize:'.9rem',fontWeight:700,color:'#0d1a3a',display:'flex',alignItems:'center',gap:7}}>
                          Authenticator App
                          <span style={{fontSize:'.65rem',fontWeight:700,padding:'2px 8px',borderRadius:99,background:'rgba(52,211,153,.15)',border:'1px solid rgba(52,211,153,.3)',color:'#2a9d7a'}}>
                            ACTIVE
                          </span>
                        </div>
                        <div style={{fontSize:'.78rem',color:'#8898bb',marginTop:3,lineHeight:1.5}}>
                          Microsoft / Google Authenticator is protecting your account
                        </div>
                      </div>
                    </div>
                    <a href="/mfa-setup"
                      style={{
                        display:'inline-flex',alignItems:'center',gap:6,marginTop:10,
                        fontSize:'.78rem',fontWeight:700,color:'#003580',
                        textDecoration:'none',opacity:.8,
                      }}>
                      🔄 Re-configure authenticator →
                    </a>
                  </div>

                  {/* ── NOTIFICATIONS ── */}
                  <p className="panel-section-label" style={{marginTop:'1.25rem'}}>{t('settings_notifications')}</p>
                  <div className="setting-row">
                    <div>
                      <span className="setting-label">Scam alert notifications</span>
                      <div className="setting-desc">Get notified when a new scam alert is issued for your region</div>
                    </div>
                    <div className={`toggle${notifScamAlert?' on':''}`} onClick={()=>setNotifScamAlert(v=>!v)}>
                      <div className="toggle-knob"/>
                    </div>
                  </div>
                  <div className="setting-row">
                    <div>
                      <span className="setting-label">Daily quiz reminder</span>
                      <div className="setting-desc">A gentle reminder to complete today&apos;s safety quiz</div>
                    </div>
                    <div className={`toggle${notifQuizRemind?' on':''}`} onClick={()=>setNotifQuizRemind(v=>!v)}>
                      <div className="toggle-knob"/>
                    </div>
                  </div>
                  <div className="setting-row">
                    <div>
                      <span className="setting-label">Weekly security digest</span>
                      <div className="setting-desc">A weekly summary of cybersecurity news and scam trends</div>
                    </div>
                    <div className={`toggle${notifWeeklyDigest?' on':''}`} onClick={()=>setNotifWeeklyDigest(v=>!v)}>
                      <div className="toggle-knob"/>
                    </div>
                  </div>
                  <div className="setting-row">
                    <div>
                      <span className="setting-label">New awareness articles</span>
                      <div className="setting-desc">Notify me when new guides are published in the Awareness Hub</div>
                    </div>
                    <div className={`toggle${notifNewArticles?' on':''}`} onClick={()=>setNotifNewArticles(v=>!v)}>
                      <div className="toggle-knob"/>
                    </div>
                  </div>

                  {/* ── DISPLAY ── */}
                  <p className="panel-section-label" style={{marginTop:'1.5rem'}}>{t('settings_display')}</p>
                  <div className="setting-row">
                    <div>
                      <span className="setting-label">Large text mode</span>
                      <div className="setting-desc">Increases base font size across the dashboard for easier reading</div>
                    </div>
                    <div className={`toggle${dispLargeText?' on':''}`} onClick={()=>setDispLargeText(v=>!v)}>
                      <div className="toggle-knob"/>
                    </div>
                  </div>
                  <div className="setting-row">
                    <div>
                      <span className="setting-label">High contrast mode</span>
                      <div className="setting-desc">Boosts contrast and brightness for low-vision users</div>
                    </div>
                    <div className={`toggle${dispHighContrast?' on':''}`} onClick={()=>setDispHighContrast(v=>!v)}>
                      <div className="toggle-knob"/>
                    </div>
                  </div>
                  <div className="setting-row">
                    <div>
                      <span className="setting-label">Simplified interface</span>
                      <div className="setting-desc">Hides advanced features and shows only essential controls</div>
                    </div>
                    <div className={`toggle${dispSimplified?' on':''}`} onClick={()=>setDispSimplified(v=>!v)}>
                      <div className="toggle-knob"/>
                    </div>
                  </div>

                  {/* ── PRIVACY ── */}
                  <p className="panel-section-label" style={{marginTop:'1.5rem'}}>{t('settings_privacy')}</p>
                  <div className="setting-row">
                    <div>
                      <span className="setting-label">Share anonymised quiz data</span>
                      <div className="setting-desc">Helps improve question quality — no personal data is shared</div>
                    </div>
                    <div className={`toggle${privAnonymised?' on':''}`} onClick={()=>setPrivAnonymised(v=>!v)}>
                      <div className="toggle-knob"/>
                    </div>
                  </div>
                  <div className="setting-row">
                    <div>
                      <span className="setting-label">Usage analytics</span>
                      <div className="setting-desc">Helps us understand how features are used to improve VoiceGuard</div>
                    </div>
                    <div className={`toggle${privAnalytics?' on':''}`} onClick={()=>setPrivAnalytics(v=>!v)}>
                      <div className="toggle-knob"/>
                    </div>
                  </div>

                  {/* Settings auto-save silently */}

                </div>
              )}

              {/* ── T&C TAB ── */}
              {profileTab==='tnc'&&(
                <div>
                  <p className="panel-section-label">{t('tnc_title')}</p>
                  <p className="panel-last-updated">{t('tnc_updated')}</p>
                  {[
                    { title:"1. Acceptance of Terms", body:"By accessing or using VoiceGuard, you agree to be bound by these Terms and Conditions. If you do not agree, please do not use the application. These terms apply to all users, including visitors, registered users, and contributors." },
                    { title:"2. Use of the Platform", body:"VoiceGuard is provided for educational and awareness purposes only. The platform helps users identify and understand voice phishing (vishing) threats. You agree not to misuse the platform for any unlawful purpose, including but not limited to attempting to reverse-engineer, scrape, or attack the service." },
                    { title:"3. User Data & Privacy", body:"We collect only the data necessary to provide our service, including your email address, quiz results, and trusted contact information. Your data is stored securely via Supabase and is never sold to third parties. You may request deletion of your account and data at any time via Settings." },
                    { title:"4. Educational Content", body:"All cybersecurity content, news articles, quiz questions, and video recommendations on VoiceGuard are provided for educational purposes only. They do not constitute professional legal, financial, or security advice. Always consult qualified professionals for specific security concerns." },
                    { title:"5. Points & Rewards", body:"Points earned through the Daily Safety Quiz are for educational gamification purposes only. They have no monetary value and cannot be exchanged for cash, products, or services unless explicitly stated in a future rewards programme announcement." },
                    { title:"6. Third-Party Services", body:"VoiceGuard integrates with Google Gemini AI for content generation and YouTube for educational videos. Your use of these features is also subject to Google's Terms of Service and Privacy Policy. We are not responsible for third-party content." },
                    { title:"7. Changes to Terms", body:"We reserve the right to update these Terms at any time. Continued use of VoiceGuard after changes constitutes acceptance of the updated Terms. We will notify users of significant changes via the platform." },
                    { title:"8. Contact", body:"For questions regarding these Terms, please contact us at support@voiceguard.my or through the feedback form in the application." },
                  ].map(s=>(
                    <div key={s.title} className="tnc-section">
                      <div className="tnc-title">{s.title}</div>
                      <div className="tnc-body">{s.body}</div>
                    </div>
                  ))}
                </div>
              )}

              {/* ── GUIDELINES TAB ── */}
              {profileTab==='guide'&&(
                <div>
                  <p className="panel-section-label">{t('guide_title')}</p>
                  <p className="panel-last-updated">{t('guide_sub')}</p>
                  {[
                    { icon:'🛡️', title:"Stay Alert Daily",        body:"Check the dashboard every day. The Daily Safety Quiz takes less than 2 minutes and builds real scam-recognition habits over time. Consistency is more important than intensity." },
                    { icon:'📞', title:"Verify Suspicious Calls", body:"If you receive an unexpected call from a bank, government agency, or police, always hang up and call back using the official number from their website — never the number the caller gives you." },
                    { icon:'🔐', title:"Never Share OTPs",        body:"No legitimate organisation — not your bank, not PDRM, not Bank Negara — will ever ask for your One-Time Password (OTP) over a phone call. Sharing it is equivalent to handing over your account." },
                    { icon:'🤖', title:"Understand AI Threats",   body:"Modern AI can clone a voice from just 3 seconds of audio. If a family member calls in distress asking for money, always verify by calling them back on their known number or using your agreed family code word." },
                    { icon:'👥', title:"Use Trusted Contacts",    body:"Add your most trusted family members, doctor, and close friends to your Trusted Contacts list. When in doubt about any call or request, contact one of them before taking action." },
                    { icon:'📢', title:"Report Scams",            body:"If you receive a scam call, report it to PDRM (999), MCMC (1-800-18-8030), or Bank Negara Malaysia LINK (1-300-88-5465). Reporting helps protect others in your community." },
                    { icon:'📚', title:"Explore the Awareness Hub", body:"The Awareness Hub is updated with AI-generated news and educational content. Read at least one article per week to stay informed about the latest scam tactics used in Malaysia and globally." },
                    { icon:'🔒', title:"Protect Your Data",       body:"VoiceGuard stores your data securely. However, never share your login credentials with anyone. Enable MFA (Multi-Factor Authentication) in Settings for maximum account security." },
                  ].map(g=>(
                    <div key={g.title} className="guide-item">
                      <div className="guide-icon">{g.icon}</div>
                      <div>
                        <div className="guide-title">{g.title}</div>
                        <div className="guide-body">{g.body}</div>
                      </div>
                    </div>
                  ))}
                </div>
              )}

            </div>{/* end profile-content */}
          </div>{/* end profile-panel */}
        </>
      )}

      {/* ── Main ────────────────────────────────────────────────────────────── */}
      <main className="dash-main">

        {/* Header */}
        <div className="page-header">
          <div>
            <div style={{fontSize:'1.4rem',fontWeight:700,color:'var(--text-primary)'}}>
              {greeting.text}{' '}
              {displayName&&(
                <span style={{background:'linear-gradient(135deg,#a5b4fc,#8b5cf6)',WebkitBackgroundClip:'text',WebkitTextFillColor:'transparent'}}>
                  {displayName}
                </span>
              )}{' '}{greeting.emoji}
            </div>
            <div style={{fontSize:'.875rem',color:'var(--text-secondary)',marginTop:3}}>{greeting.sub}</div>
          </div>
          <div style={{display:'flex',alignItems:'center',gap:10}}>
            <LanguageSwitcher/>
            <div className="user-chip">
              <div className="user-avatar">{initials}</div>
              <div style={{display:'flex',flexDirection:'column',lineHeight:1.35}}>
                {displayName&&<span style={{fontSize:'.82rem',fontWeight:600,color:'var(--text-primary)'}}>{displayName}</span>}
                <span style={{fontSize:'.75rem',color:'var(--text-muted)'}}>{userEmail}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Voice Detector banner — live link */}
        <Link href="/detect" style={{textDecoration:'none',display:'block'}}>
          <div className="monitor-banner" style={{cursor:'pointer',transition:'background .2s,border-color .2s'}}
            onMouseEnter={e=>{(e.currentTarget as HTMLDivElement).style.background='rgba(99,102,241,.09)';(e.currentTarget as HTMLDivElement).style.borderColor='rgba(99,102,241,.28)'}}
            onMouseLeave={e=>{(e.currentTarget as HTMLDivElement).style.background='';(e.currentTarget as HTMLDivElement).style.borderColor=''}}>
            <div className="monitor-icon pulse-ring"><MicIcon size={22}/></div>
            <div style={{flex:1}}>
              <div style={{display:'flex',alignItems:'center',gap:8,marginBottom:4}}>
                <span style={{fontWeight:700,fontSize:'.95rem',color:'var(--text-primary)'}}>{t('monitor_title')}</span>
                <span style={{fontSize:'.68rem',fontWeight:700,letterSpacing:'.06em',padding:'3px 10px',borderRadius:99,background:'rgba(99,102,241,.15)',border:'1px solid rgba(99,102,241,.3)',color:'#6366f1',textTransform:'uppercase'}}>Try Now →</span>
              </div>
              <div style={{fontSize:'.825rem',color:'var(--text-secondary)'}}>
                Upload or record audio to detect AI-generated deepfake voices and vishing attacks.
              </div>
            </div>
          </div>
        </Link>


        <div className="dash-grid">

          {/* ── Awareness Hub ─────────────────────────────────────────────── */}
          <div className="hub-card">
            <div className="hub-header">
              <div className="hub-ai-badge"><SparklesIcon size={11}/>{t('hub_ai_badge')}</div>
              <div className="hub-title">{t('hub_title')}</div>
              <div className="hub-sub">{t('hub_sub')}</div>
              <Link href="/awareness" className="hub-cta">{t('hub_cta')} <ChevronRight size={15}/></Link>
            </div>
            {/* ── YouTube video player ── */}
            <div style={{padding:'1.25rem 1.5rem 1.5rem'}}>
              {/* Video counter + shuffle */}
              <div style={{display:'flex',alignItems:'center',justifyContent:'space-between',marginBottom:'0.875rem'}}>
                <div style={{display:'flex',alignItems:'center',gap:7}}>
                  <div style={{width:24,height:24,borderRadius:7,background:'rgba(255,0,0,.15)',border:'1px solid rgba(255,0,0,.25)',display:'flex',alignItems:'center',justifyContent:'center'}}>
                    <svg width="12" height="12" viewBox="0 0 24 24" fill="#ff4444"><path d="M23 7s-.3-2-1.2-2.8c-1.1-1.2-2.4-1.2-3-1.3C16.2 2.7 12 2.7 12 2.7s-4.2 0-6.8.2C4.6 3 3.3 3 2.2 4.2 1.3 5 1 7 1 7S.7 9.2.7 11.5v2.1c0 2.3.3 4.5.3 4.5s.3 2 1.2 2.8c1.1 1.2 2.6 1.1 3.3 1.2C7.2 22.3 12 22.3 12 22.3s4.2 0 6.8-.3c.6-.1 1.9-.1 3-1.3.9-.8 1.2-2.8 1.2-2.8s.3-2.2.3-4.5v-2.1C23.3 9.2 23 7 23 7z"/><polygon fill="white" points="9.75,15.02 15.5,11.5 9.75,7.98"/></svg>
                  </div>
                  <span style={{fontSize:'.7rem',fontWeight:700,letterSpacing:'.07em',textTransform:'uppercase',color:'#ff6b6b'}}>
                    {t('video_label')}
                  </span>
                </div>
                <div style={{display:'flex',alignItems:'center',gap:5}}>
                  <span style={{fontSize:'.7rem',color:'var(--text-muted)'}}>
                    {vidIdx+1}/{VIDEOS.length}
                  </span>
                  <button onClick={shuffleVideo} title="Shuffle"
                    className="vid-shuffle-btn" style={{background:'rgba(99,102,241,.1)',border:'1px solid rgba(99,102,241,.22)',borderRadius:7,width:28,height:28,display:'flex',alignItems:'center',justifyContent:'center',cursor:'pointer',color:'#a5b4fc',transition:'background .2s'}}>
                    <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                      <polyline points="16 3 21 3 21 8"/><line x1="4" y1="20" x2="21" y2="3"/>
                      <polyline points="21 16 21 21 16 21"/><line x1="15" y1="15" x2="21" y2="21"/>
                    </svg>
                  </button>
                </div>
              </div>

              {/* Thumbnail / embed toggle */}
              {!playing ? (
                <div className="vid-thumb-wrap" style={{position:'relative',borderRadius:12,overflow:'hidden',background:'#000',cursor:'pointer',aspectRatio:'16/9'}}
                  onClick={()=>setPlaying(true)}>
                  {/* YouTube thumbnail */}
                  <img
                    src={`https://img.youtube.com/vi/${currentVid.videoId}/hqdefault.jpg`}
                    alt={currentVid.title}
                    style={{width:'100%',height:'100%',objectFit:'cover',display:'block',opacity:.85}}
                  />
                  {/* Play button overlay */}
                  <div style={{position:'absolute',inset:0,display:'flex',alignItems:'center',justifyContent:'center',background:'rgba(0,0,0,.25)',transition:'background .2s'}}>
                    <div className="vid-play-btn" style={{width:56,height:56,borderRadius:'50%',background:'rgba(255,0,0,.9)',display:'flex',alignItems:'center',justifyContent:'center',boxShadow:'0 4px 20px rgba(255,0,0,.5)',transform:'scale(1)',transition:'transform .15s'}}>
                      <svg width="22" height="22" viewBox="0 0 24 24" fill="white"><polygon points="5 3 19 12 5 21 5 3"/></svg>
                    </div>
                  </div>
                  {/* Tag badge */}
                  <div style={{position:'absolute',top:8,left:8,background:'rgba(0,0,0,.7)',backdropFilter:'blur(6px)',borderRadius:6,padding:'3px 8px',fontSize:'.65rem',fontWeight:700,color:'#a5b4fc',letterSpacing:'.04em'}}>
                    {currentVid.tag}
                  </div>
                </div>
              ) : (
                <div style={{borderRadius:12,overflow:'hidden',aspectRatio:'16/9',background:'#000'}}>
                  <iframe
                    width="100%" height="100%"
                    src={`https://www.youtube.com/embed/${currentVid.videoId}?autoplay=1&rel=0&modestbranding=1`}
                    title={currentVid.title}
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                    allowFullScreen
                    style={{border:'none',display:'block'}}
                  />
                </div>
              )}

              {/* Video info */}
              <div style={{marginTop:'.75rem'}}>
                <div style={{fontSize:'.875rem',fontWeight:700,color:'var(--text-primary)',lineHeight:1.4,marginBottom:3}}>
                  {currentVid.title}
                </div>
                <div style={{fontSize:'.75rem',color:'var(--text-muted)',display:'flex',alignItems:'center',gap:6}}>
                  <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="8" r="4"/><path d="M6 20v-2a6 6 0 0 1 12 0v2"/></svg>
                  {currentVid.channel}
                </div>
              </div>

              {/* Prev / Next controls */}
              <div style={{display:'flex',gap:6,marginTop:'.875rem'}}>
                <button onClick={prevVideo}
                  className="vid-prev-btn" style={{flex:1,padding:'7px',borderRadius:8,border:'1px solid var(--border)',background:'rgba(255,255,255,.03)',color:'var(--text-secondary)',fontSize:'.78rem',fontWeight:600,cursor:'pointer',fontFamily:"'Inter',sans-serif",display:'flex',alignItems:'center',justifyContent:'center',gap:5,transition:'background .2s,border-color .2s'}}>
                  <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="15 18 9 12 15 6"/></svg>
                  Prev
                </button>
                <button onClick={nextVideo}
                  className="vid-next-btn" style={{flex:1,padding:'7px',borderRadius:8,border:'1px solid rgba(99,102,241,.3)',background:'rgba(99,102,241,.1)',color:'#a5b4fc',fontSize:'.78rem',fontWeight:600,cursor:'pointer',fontFamily:"'Inter',sans-serif",display:'flex',alignItems:'center',justifyContent:'center',gap:5,transition:'background .2s'}}>
                  Next
                  <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="9 18 15 12 9 6"/></svg>
                </button>
              </div>
            </div>
          </div>

          {/* ── Right column ──────────────────────────────────────────────── */}
          <div style={{display:'flex',flexDirection:'column',gap:'1.25rem'}}>

            {/* ══ DAILY SAFETY QUIZ ══ */}
            <div className="quiz-card">
              {/* Quiz header row */}
              <div style={{display:'flex',alignItems:'center',gap:8,marginBottom:'.75rem'}}>
                <div className="quiz-icon-wrap"><ZapIcon size={15}/></div>
                <div style={{flex:1}}>
                  <div style={{fontSize:'.68rem',fontWeight:700,letterSpacing:'.08em',textTransform:'uppercase',color:'#a5b4fc'}}>
                    {t('quiz_label')}
                  </div>
                  <div style={{fontSize:'.7rem',color:'var(--text-muted)',marginTop:1}}>
                    {t('quiz_from_db')}
                  </div>
                </div>
                {/* Level + pts */}
                {userPts&&(
                  <div style={{display:'flex',flexDirection:'column',alignItems:'flex-end',gap:3}}>
                    <span style={{fontSize:'.68rem',fontWeight:700,padding:'1px 7px',borderRadius:99,background:lvlCol.bg,border:`1px solid ${lvlCol.border}`,color:lvlCol.color}}>
                      {level}
                    </span>
                    <span style={{fontSize:'.7rem',color:'#facc15',fontWeight:700,display:'flex',alignItems:'center',gap:3}}>
                      <StarIcon size={10}/>{userPts.total_points} pts
                    </span>
                  </div>
                )}
              </div>

              {/* Progress bar to next level */}
              {userPts&&nextPts!==Infinity&&(
                <div style={{marginBottom:'.875rem'}}>
                  <div style={{display:'flex',justifyContent:'space-between',fontSize:'.67rem',color:'var(--text-muted)',marginBottom:3}}>
                    <span>{userPts.total_points} pts</span>
                    <span>{nextPts} pts → {nextName}</span>
                  </div>
                  <div className="prog-wrap"><div className="prog-fill" style={{width:`${barPct}%`}}/></div>
                </div>
              )}

              {/* ── All questions done today ── */}
              {noQ ? (
                <div style={{textAlign:'center',padding:'1.5rem 0',color:'var(--text-muted)',fontSize:'.855rem'}}>
                  <div style={{fontSize:'1.75rem',marginBottom:6}}>🎉</div>
                  <strong style={{color:'var(--text-primary)',display:'block',marginBottom:4}}>All done for today!</strong>
                  Come back tomorrow for new questions.
                  {userPts&&(
                    <div style={{marginTop:8,fontSize:'.78rem',color:lvlCol.color,fontWeight:600}}>
                      Total: {userPts.total_points} pts · {userPts.streak_days} day streak 🔥
                    </div>
                  )}
                </div>

              ) : !quizDone ? (
                <>
                  {/* Progress dots */}
                  <div className="quiz-progress">
                    {questions.map((_,i)=>(
                      <div key={i} className={`qp-dot${i<quizIdx?' done':i===quizIdx?' current':''}`}/>
                    ))}
                  </div>

                  {/* Difficulty + pts badge */}
                  <div style={{display:'flex',alignItems:'center',gap:6,marginBottom:'.6rem'}}>
                    {(() => {
                      const d = currentQ.difficulty
                      const dc = d==='hard'?{c:'#f87171',b:'rgba(248,113,113,.1)',bd:'rgba(248,113,113,.25)'}
                                :d==='medium'?{c:'#fb923c',b:'rgba(251,146,60,.1)',bd:'rgba(251,146,60,.25)'}
                                :{c:'#34d399',b:'rgba(52,211,153,.1)',bd:'rgba(52,211,153,.25)'}
                      return(
                        <span style={{fontSize:'.65rem',fontWeight:700,padding:'2px 7px',borderRadius:6,background:dc.b,border:`1px solid ${dc.bd}`,color:dc.c}}>
                          {d}
                        </span>
                      )
                    })()}
                    <span style={{fontSize:'.65rem',color:'#facc15',fontWeight:700,display:'flex',alignItems:'center',gap:3}}>
                      <StarIcon size={10}/> {currentQ.points_value} pts
                    </span>
                    <span style={{fontSize:'.65rem',color:'var(--text-muted)',marginLeft:'auto'}}>
                      {quizIdx+1}/{questions.length}
                    </span>
                  </div>

                  <div className="quiz-q">{currentQ.question}</div>

                  {currentQ.options.map((opt,i)=>{
                    let cls='quiz-option'
                    if(selected!==null){
                      if(i===currentQ.correct_index)       cls+=' correct'
                      else if(i===selected)                cls+=' wrong'
                      else                                 cls+=' neutral'
                    }
                    return(
                      <button key={i} className={cls} onClick={()=>handleAnswer(i)}
                        disabled={selected!==null||qPending}>
                        {selected!==null&&i===currentQ.correct_index&&<CheckIcon size={13}/>}
                        {selected!==null&&i===selected&&i!==currentQ.correct_index&&<XCircleIcon size={13}/>}
                        {opt}
                      </button>
                    )
                  })}

                  {showResult&&(
                    <>
                      {selected===currentQ.correct_index&&(
                        <div style={{display:'flex',alignItems:'center',gap:6,marginTop:8}}>
                          <span className="pts-pop"><StarIcon size={10}/> +{currentQ.points_value} pts!</span>
                          {qPending&&<span style={{fontSize:'.7rem',color:'var(--text-muted)'}}>saving…</span>}
                        </div>
                      )}
                      <div className="quiz-tip">{currentQ.explanation}</div>
                      <button className="btn-next" onClick={nextQuestion} disabled={qPending}>
                        {quizIdx+1<questions.length?t('quiz_next'):t('quiz_see_score')}
                      </button>
                    </>
                  )}
                </>

              ) : (
                /* Score screen */
                <div style={{textAlign:'center'}}>
                  <div style={{fontSize:'2.5rem',margin:'.5rem 0'}}>
                    {correct===questions.length?'🏆':correct>=questions.length/2?'👍':'📖'}
                  </div>
                  <div style={{fontSize:'1.4rem',fontWeight:800,color:'var(--text-primary)'}}>
                    {correct}/{questions.length} correct
                  </div>
                  {earnedNow>0&&(
                    <div style={{fontSize:'.875rem',color:'#facc15',fontWeight:700,display:'flex',alignItems:'center',justifyContent:'center',gap:4,margin:'.4rem 0'}}>
                      <StarIcon size={13}/> +{earnedNow} points earned!
                    </div>
                  )}
                  {userPts&&(
                    <div style={{fontSize:'.8rem',color:'var(--text-secondary)',margin:'.4rem 0 1rem',lineHeight:1.5}}>
                      Total: <strong style={{color:'var(--text-primary)'}}>{userPts.total_points} pts</strong>
                      {' · '}Level: <strong style={{color:lvlCol.color}}>{level}</strong>
                      {userPts.streak_days>0&&<span style={{color:'#fb923c'}}> · {userPts.streak_days}🔥</span>}
                    </div>
                  )}
                  <div style={{display:'flex',gap:8}}>
                    <button className="btn-next" style={{flex:1}} onClick={resetQuiz}>{t('quiz_try_again')}</button>
                    <Link href="/awareness" className="btn-next"
                      style={{flex:1,display:'flex',alignItems:'center',justifyContent:'center',textDecoration:'none'}}>
                      Learn More
                    </Link>
                  </div>
                </div>
              )}
            </div>

            {/* ══ TRUSTED CONTACTS ══ */}
            <div className="right-card">
              <div style={{display:'flex',alignItems:'center',justifyContent:'space-between',marginBottom:'1rem'}}>
                <p className="section-title" style={{marginBottom:0,display:'flex',alignItems:'center',gap:6}}>
                  <HeartIcon size={13}/> {t('contacts_title')}
                </p>
                <span style={{fontSize:'.72rem',fontWeight:700,padding:'2px 7px',borderRadius:6,background:'rgba(52,211,153,.1)',border:'1px solid rgba(52,211,153,.2)',color:'#34d399'}}>
                  {t('contacts_safe')}
                </span>
              </div>

              <p style={{fontSize:'.78rem',color:'var(--text-muted)',marginBottom:contacts.length?'.875rem':'.5rem',lineHeight:1.5}}>
                {t('contacts_sub')}
              </p>

              {contacts.length===0 ? (
                <div className="empty-c">
                  <div style={{fontSize:'1.75rem',marginBottom:5}}>👥</div>
                  <div style={{fontWeight:600,color:'var(--text-secondary)',marginBottom:3}}>{t('contacts_empty_title')}</div>
                  <div>{t('contacts_empty_sub')}</div>
                </div>
              ) : (
                contacts.map(c=>(
                  <div key={c.id} className="contact-row">
                    <div className="c-avatar">{c.name.charAt(0).toUpperCase()}</div>
                    <div style={{flex:1,minWidth:0}}>
                      <div style={{fontSize:'.855rem',fontWeight:600,color:'var(--text-primary)',overflow:'hidden',textOverflow:'ellipsis',whiteSpace:'nowrap'}}>{c.name}</div>
                      <div style={{fontSize:'.75rem',color:'var(--text-muted)',marginTop:1}}>{c.number}</div>
                    </div>
                    <span className="c-tag">{c.relation}</span>
                    <button className="del-btn" title="Remove" onClick={()=>handleDelete(c.id)}>
                      <TrashIcon size={13}/>
                    </button>
                  </div>
                ))
              )}

              {!showForm ? (
                <button className="btn-add-contact" style={{marginTop:contacts.length?'.875rem':'.5rem'}}
                  onClick={()=>setShowForm(true)}>
                  <PlusIcon size={13}/> {t('contacts_add')}
                </button>
              ) : (
                <div className="add-form">
                  {cErr&&<div className="f-err">{cErr}</div>}
                  <input className="fi" placeholder="Full name (e.g. Ahmad — Son)"
                    value={cName} onChange={e=>setCName(e.target.value)}/>
                  <input className="fi" placeholder="Phone (e.g. +60 12-345 6789)"
                    value={cNumber} onChange={e=>setCNumber(e.target.value)}/>
                  <select className="fs" value={cRelation} onChange={e=>setCRelation(e.target.value)}>
                    {RELATIONS.map(r=><option key={r} value={r}>{r}</option>)}
                  </select>
                  <div className="f-row">
                    <button className="btn-save" onClick={handleAdd} disabled={cPending}>
                      {cPending?t('contacts_saving'):'Save Contact'}
                    </button>
                    <button className="btn-cancel" onClick={()=>{setShowForm(false);setCErr('')}}>
                      <XIcon size={13}/>
                    </button>
                  </div>
                </div>
              )}
            </div>

            {/* ══ EMERGENCY HOTLINES ══ */}
            <div className="right-card">
              <p className="section-title" style={{display:'flex',alignItems:'center',gap:6}}>
                <PhoneIcon size={13}/> {t('hotlines_title')}
              </p>
              <p style={{fontSize:'.78rem',color:'var(--text-muted)',marginBottom:'.875rem',lineHeight:1.5}}>
                {t('hotlines_sub')}
              </p>
              {HOTLINES.map(h=>(
                <a key={h.label} href={`tel:${h.number.replace(/\D/g,'')}`} className="hotline-row">
                  <div className="h-dot" style={{background:h.color,boxShadow:`0 0 6px ${h.color}`}}/>
                  <span style={{fontSize:'.82rem',fontWeight:500,color:'var(--text-secondary)',flex:1}}>{h.label}</span>
                  <span style={{fontSize:'.82rem',fontWeight:700,fontFamily:'monospace',color:h.color}}>{h.number}</span>
                </a>
              ))}
            </div>

          </div>{/* end right col */}
        </div>{/* end dash-grid */}
      </main>
      </div>{/* end flex row */}
    </div>
  )
}
