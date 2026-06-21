'use client'

import { useState, useMemo, useTransition } from 'react'
import { logout } from '@/app/auth/actions'
import { sendWeeklyReport, sendCustomReport, addAdminVideo, removeAdminVideo, addAdminAlert, removeAdminAlert } from './admin.actions'
import type {
  AdminUser,
  AdminStats,
  AuditLogEntry,
  UsersByLevel,
  DailyActivity,
  VideoItem,
  AlertItem,
} from './admin.actions'
import { useRouter } from 'next/navigation'

// ── Icons ─────────────────────────────────────────────────────────────────────
const ShieldIcon    = ({s=20}:{s?:number}) => <svg width={s} height={s} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></svg>
const UsersIcon     = ({s=20}:{s?:number}) => <svg width={s} height={s} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></svg>
const ActivityIcon  = ({s=20}:{s?:number}) => <svg width={s} height={s} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="22 12 18 12 15 21 9 3 6 12 2 12"/></svg>
const MicIcon       = ({s=20}:{s?:number}) => <svg width={s} height={s} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 1a3 3 0 0 0-3 3v8a3 3 0 0 0 6 0V4a3 3 0 0 0-3-3z"/><path d="M19 10v2a7 7 0 0 1-14 0v-2"/><line x1="12" y1="19" x2="12" y2="23"/><line x1="8" y1="23" x2="16" y2="23"/></svg>
const AlertTriangle = ({s=20}:{s?:number}) => <svg width={s} height={s} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m21.73 18-8-14a2 2 0 0 0-3.48 0l-8 14A2 2 0 0 0 4 21h16a2 2 0 0 0 1.73-3Z"/><line x1="12" y1="9" x2="12" y2="13"/><line x1="12" y1="17" x2="12.01" y2="17"/></svg>
const StarIcon      = ({s=20}:{s?:number}) => <svg width={s} height={s} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/></svg>
const TrendUpIcon   = ({s=16}:{s?:number}) => <svg width={s} height={s} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="23 6 13.5 15.5 8.5 10.5 1 18"/><polyline points="17 6 23 6 23 12"/></svg>
const SearchIcon    = ({s=16}:{s?:number}) => <svg width={s} height={s} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>
const LogOutIcon    = ({s=16}:{s?:number}) => <svg width={s} height={s} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/><polyline points="16 17 21 12 16 7"/><line x1="21" y1="12" x2="9" y2="12"/></svg>
const ChevronUp     = ({s=14}:{s?:number}) => <svg width={s} height={s} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="18 15 12 9 6 15"/></svg>
const ChevronDown   = ({s=14}:{s?:number}) => <svg width={s} height={s} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="6 9 12 15 18 9"/></svg>
const GridIcon      = ({s=20}:{s?:number}) => <svg width={s} height={s} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="3" width="7" height="7"/><rect x="14" y="3" width="7" height="7"/><rect x="14" y="14" width="7" height="7"/><rect x="3" y="14" width="7" height="7"/></svg>
const LogFileIcon   = ({s=20}:{s?:number}) => <svg width={s} height={s} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/><line x1="16" y1="13" x2="8" y2="13"/><line x1="16" y1="17" x2="8" y2="17"/><polyline points="10 9 9 9 8 9"/></svg>
const MailIcon      = ({s=16}:{s?:number}) => <svg width={s} height={s} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/><polyline points="22,6 12,13 2,6"/></svg>
const CheckIcon     = ({s=16}:{s?:number}) => <svg width={s} height={s} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"/></svg>
const XIcon         = ({s=16}:{s?:number}) => <svg width={s} height={s} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
const ShieldCheckIcon = ({s=20}:{s?:number}) => <svg width={s} height={s} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" /><polyline points="9 12 11 14 15 10"/></svg>

// ── Helpers ───────────────────────────────────────────────────────────────────
function timeAgo(iso: string | null): string {
  if (!iso) return '—'
  const diff = Date.now() - new Date(iso).getTime()
  const m = Math.floor(diff / 60000)
  if (m < 1)   return 'Just now'
  if (m < 60)  return `${m}m ago`
  const h = Math.floor(m / 60)
  if (h < 24)  return `${h}h ago`
  const d = Math.floor(h / 24)
  return `${d}d ago`
}

function fmtDate(iso: string): string {
  return new Date(iso).toLocaleDateString('en-MY', { day:'2-digit', month:'short', year:'numeric' })
}

function fmtShortDate(iso: string): string {
  const d = new Date(iso)
  return d.toLocaleDateString('en-MY', { month:'short', day:'numeric' })
}

const LEVEL_PALETTE: Record<string, { color: string; bg: string; border: string }> = {
  Beginner: { color:'#94a3b8', bg:'rgba(148,163,184,.15)', border:'rgba(148,163,184,.3)' },
  Aware:    { color:'#34d399', bg:'rgba(52,211,153,.15)',  border:'rgba(52,211,153,.3)'  },
  Guardian: { color:'#60a5fa', bg:'rgba(96,165,250,.15)',  border:'rgba(96,165,250,.3)'  },
  Expert:   { color:'#c084fc', bg:'rgba(192,132,252,.15)', border:'rgba(192,132,252,.3)' },
  Champion: { color:'#fbbf24', bg:'rgba(251,191,36,.15)',  border:'rgba(251,191,36,.3)'  },
}

const EVENT_PALETTE: Record<string, { color: string; bg: string }> = {
  login_success:         { color:'#34d399', bg:'rgba(52,211,153,.15)'  },
  login_failure:         { color:'#f87171', bg:'rgba(248,113,113,.15)' },
  logout:                { color:'#94a3b8', bg:'rgba(148,163,184,.12)' },
  signup_success:        { color:'#60a5fa', bg:'rgba(96,165,250,.15)'  },
  signup_failure:        { color:'#fb923c', bg:'rgba(251,146,60,.15)'  },
  detect_scan:           { color:'#a78bfa', bg:'rgba(167,139,250,.15)' },
  password_reset_request:{ color:'#fbbf24', bg:'rgba(251,191,36,.15)'  },
  password_reset_success:{ color:'#34d399', bg:'rgba(52,211,153,.15)'  },
}

// ── Props ─────────────────────────────────────────────────────────────────────
interface Props {
  adminName:     string
  adminEmail:    string
  users:         AdminUser[]
  stats:         AdminStats
  auditLogs:     AuditLogEntry[]
  usersByLevel:  UsersByLevel[]
  dailyActivity: DailyActivity[]
  videos:        VideoItem[]
  alerts:        AlertItem[]
}

type SortKey = 'full_name' | 'email' | 'level' | 'total_points' | 'streak_days' | 'created_at' | 'last_sign_in_at'
type NavTab  = 'overview' | 'users' | 'detections' | 'logs' | 'videos' | 'alerts'

// ── KPI Card ──────────────────────────────────────────────────────────────────
function KpiCard({
  icon, label, value, sub, color, iconBg,
}: {
  icon: React.ReactNode; label: string; value: string | number
  sub?: React.ReactNode; color: string; iconBg: string
}) {
  return (
    <div className="kpi-card">
      <div className="kpi-icon-wrap" style={{ background: iconBg }}>
        <div style={{ color }}>{icon}</div>
      </div>
      <div className="kpi-body">
        <p className="kpi-label">{label}</p>
        <p className="kpi-value" style={{ color }}>{value}</p>
        {sub && <p className="kpi-sub">{sub}</p>}
      </div>
    </div>
  )
}

// ── Donut Chart (CSS/SVG) ─────────────────────────────────────────────────────
function DonutChart({ data }: { data: UsersByLevel[] }) {
  const total = data.reduce((s, d) => s + d.count, 0)
  const COLORS = ['#94a3b8', '#34d399', '#60a5fa', '#c084fc', '#fbbf24']
  if (total === 0) {
    return <div style={{ textAlign:'center', color:'#4a5568', fontSize:'.85rem', padding:'2rem 0' }}>No data yet</div>
  }

  // Build SVG arcs
  const R = 70; const CX = 90; const CY = 90; const STROKE = 28
  let cumAngle = -90
  const segments: { path: string; color: string; level: string; count: number; pct: number }[] = []

  for (let i = 0; i < data.length; i++) {
    const pct   = data[i].count / total
    const angle = pct * 360
    if (angle === 0) continue
    const startRad = (cumAngle * Math.PI) / 180
    const endRad   = ((cumAngle + angle) * Math.PI) / 180
    const x1 = CX + R * Math.cos(startRad)
    const y1 = CY + R * Math.sin(startRad)
    const x2 = CX + R * Math.cos(endRad)
    const y2 = CY + R * Math.sin(endRad)
    const large = angle > 180 ? 1 : 0
    segments.push({
      path:  `M ${x1} ${y1} A ${R} ${R} 0 ${large} 1 ${x2} ${y2}`,
      color: COLORS[i] ?? '#94a3b8',
      level: data[i].level,
      count: data[i].count,
      pct:   Math.round(pct * 100),
    })
    cumAngle += angle
  }

  return (
    <div style={{ display:'flex', alignItems:'center', gap:'1.5rem', flexWrap:'wrap' }}>
      <svg width="180" height="180" viewBox="0 0 180 180">
        {segments.map((s, i) => (
          <path
            key={i}
            d={s.path}
            fill="none"
            stroke={s.color}
            strokeWidth={STROKE}
            strokeLinecap="butt"
            opacity={0.9}
          />
        ))}
        <text x={CX} y={CY - 6} textAnchor="middle" fontSize="22" fontWeight="800" fill="#e2e8f0">{total}</text>
        <text x={CX} y={CY + 14} textAnchor="middle" fontSize="10" fill="#94a3b8">Total Users</text>
      </svg>
      <div style={{ display:'flex', flexDirection:'column', gap:6 }}>
        {segments.map((s, i) => (
          <div key={i} style={{ display:'flex', alignItems:'center', gap:8, fontSize:'.82rem' }}>
            <div style={{ width:10, height:10, borderRadius:'50%', background:s.color, flexShrink:0 }} />
            <span style={{ color:'#94a3b8', minWidth:70 }}>{s.level}</span>
            <span style={{ color:'#e2e8f0', fontWeight:700 }}>{s.count}</span>
            <span style={{ color:'#4a5568' }}>({s.pct}%)</span>
          </div>
        ))}
      </div>
    </div>
  )
}

// ── Bar Chart (daily activity) ────────────────────────────────────────────────
function ActivityChart({ data }: { data: DailyActivity[] }) {
  const maxVal = Math.max(...data.map(d => d.logins + d.signups), 1)

  return (
    <div style={{ display:'flex', alignItems:'flex-end', gap:6, height:120, padding:'0 4px' }}>
      {data.map((d, i) => {
        const loginH  = (d.logins  / maxVal) * 100
        const signupH = (d.signups / maxVal) * 100
        return (
          <div key={i} style={{ flex:1, display:'flex', flexDirection:'column', alignItems:'center', gap:2 }}>
            <div style={{ display:'flex', flexDirection:'column', justifyContent:'flex-end', height:100, width:'100%', gap:2, position:'relative' }}>
              {/* Signup bar on top */}
              {d.signups > 0 && (
                <div style={{
                  width:'100%', height:`${signupH}%`,
                  background:'rgba(96,165,250,.7)', borderRadius:'4px 4px 0 0',
                  transition:'height .4s ease',
                  minHeight: d.signups > 0 ? 4 : 0,
                }} title={`Signups: ${d.signups}`} />
              )}
              {/* Login bar */}
              <div style={{
                width:'100%', height:`${Math.max(loginH, d.logins > 0 ? 4 : 0)}%`,
                background:'linear-gradient(180deg,#667eea,#764ba2)',
                borderRadius: d.signups > 0 ? '0' : '4px 4px 0 0',
                transition:'height .4s ease',
                minHeight: d.logins > 0 ? 4 : 0,
              }} title={`Logins: ${d.logins}`} />
            </div>
            <span style={{ fontSize:'.65rem', color:'#4a5568', textAlign:'center', whiteSpace:'nowrap' }}>
              {fmtShortDate(d.date)}
            </span>
          </div>
        )
      })}
    </div>
  )
}

// ── Main Component ─────────────────────────────────────────────────────────────
export default function AdminDashboardClient({
  adminName, adminEmail, users, stats, auditLogs, usersByLevel, dailyActivity, videos, alerts,
}: Props) {
  const router = useRouter()
  const [activeTab,   setActiveTab]   = useState<NavTab>('overview')
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)  

  // Alerts state
  const [showAddAlert, setShowAddAlert] = useState(false)
  const [newAlert, setNewAlert] = useState<Partial<AlertItem>>({ type: 'warning', title: '', body: '', source: '', region: 'Global', category: 'scam', tags: [], actionLabel: '', actionUrl: '' })
  const [isAddingAlert, setIsAddingAlert] = useState(false)
  const [isSendingPush, setIsSendingPush] = useState(false)

  const handleAddAlert = async () => {
    if (!newAlert.title || !newAlert.body || !newAlert.source) return alert('Title, Body, and Source are required')
    setIsAddingAlert(true)
    const res = await addAdminAlert({ ...newAlert, tags: typeof newAlert.tags === 'string' ? (newAlert.tags as string).split(',').map(s=>s.trim()) : newAlert.tags })
    setIsAddingAlert(false)
    if (res.success) { setShowAddAlert(false); setNewAlert({ type: 'warning', title: '', body: '', source: '', region: 'Global', category: 'scam' }); router.refresh() }
    else alert(res.error)
  }

  const handleRemoveAlert = async (id: string) => {
    if (!confirm('Remove this alert?')) return
    await removeAdminAlert(id)
    router.refresh()
  }

  const handleSendPush = async (alertData: AlertItem) => {
    if (!confirm('Send this as a push notification to all subscribed users?')) return
    setIsSendingPush(true)
    try {
      const res = await fetch('/api/push/send', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ title: alertData.title, body: alertData.body, url: '/alerts', tag: 'vg-alert' })
      })
      const data = await res.json()
      if (data.success) alert(`Push sent successfully to ${data.sent} devices.`)
      else alert('Failed: ' + data.error)
    } catch (err: any) {
      alert('Error sending push: ' + err.message)
    }
    setIsSendingPush(false)
  }

  // Videos state
  const [showAddVid,   setShowAddVid]   = useState(false)
  const [vidUrlInput,  setVidUrlInput]  = useState('')          // raw URL/ID typed by admin
  const [newVid,       setNewVid]       = useState({ id: '', title: '', channel: '', tag: '' })
  const [vidError,     setVidError]     = useState('')
  const [isAddingVid,  setIsAddingVid]  = useState(false)
  const [isFetching,   setIsFetching]   = useState(false)        // loading oEmbed
  const [thumbValid,   setThumbValid]   = useState<boolean|null>(null) // null=unchecked

  /** Extract an 11-char YouTube video ID from any URL format or bare ID */
  function parseYtId(raw: string): string {
    const s = raw.trim()
    // youtu.be/ID or youtu.be/ID?si=...
    const short = s.match(/youtu\.be\/([a-zA-Z0-9_-]{10,12})/)
    if (short) return short[1]
    // youtube.com/watch?v=ID
    const watch = s.match(/[?&]v=([a-zA-Z0-9_-]{10,12})/)
    if (watch) return watch[1]
    // youtube.com/embed/ID or /shorts/ID
    const embed = s.match(/(?:embed|shorts)\/([a-zA-Z0-9_-]{10,12})/)
    if (embed) return embed[1]
    // bare 11-char ID
    if (/^[a-zA-Z0-9_-]{10,12}$/.test(s)) return s
    return ''
  }

  /** Fetch title + channel via our oEmbed proxy, then validate thumbnail */
  const fetchVideoMeta = async (rawInput: string) => {
    const id = parseYtId(rawInput)
    if (!id) {
      setVidError('Could not extract a valid YouTube video ID from that URL.')
      setThumbValid(null)
      return
    }
    setVidError('')
    setIsFetching(true)
    setThumbValid(null)
    setNewVid(v => ({ ...v, id, title: '', channel: '' }))
    try {
      const res = await fetch(`/api/oembed?id=${id}`)
      const data = await res.json()
      if (!res.ok) {
        setVidError(data.error || 'Video is unavailable or private.')
        setThumbValid(false)
      } else {
        setNewVid(v => ({ ...v, id, title: data.title, channel: data.author_name }))
        setThumbValid(true)
      }
    } catch {
      setVidError('Network error — could not verify video.')
      setThumbValid(false)
    } finally {
      setIsFetching(false)
    }
  }

  const handleAddVideo = async () => {
    if (!newVid.id || !newVid.title || !newVid.channel || !newVid.tag) {
      setVidError('All fields are required. Use the "Fetch Info" button first.')
      return
    }
    if (thumbValid === false) {
      setVidError('Cannot save an unavailable or private video.')
      return
    }
    setVidError('')
    setIsAddingVid(true)
    const res = await addAdminVideo(newVid.id, newVid.title, newVid.channel, newVid.tag)
    setIsAddingVid(false)
    if (res.success) {
      setShowAddVid(false)
      setVidUrlInput('')
      setNewVid({ id: '', title: '', channel: '', tag: '' })
      setThumbValid(null)
      router.refresh()
    } else {
      setVidError(res.error || 'Failed to add video')
    }
  }

  const handleRemoveVideo = async (id: string) => {
    if (!confirm('Are you sure you want to remove this video?')) return
    const res = await removeAdminVideo(id)
    if (res.success) {
      router.refresh()
    } else {
      alert(res.error || 'Failed to remove video')
    }
  }
  const [search,      setSearch]      = useState('')
  const [sortKey,     setSortKey]     = useState<SortKey>('created_at')
  const [sortDir,     setSortDir]     = useState<'asc' | 'desc'>('desc')
  const [page,        setPage]        = useState(1)
  const [roleFilter,  setRoleFilter]  = useState<'all' | 'admin' | 'user'>('all')
  const [levelFilter, setLevelFilter] = useState<string>('all')
  const [isSendingReport, startTransition] = useTransition()
  const [reportStatus, setReportStatus]     = useState<string | null>(null)
  // ── Date-range report modal ──
  const todayStr    = new Date().toISOString().split('T')[0]
  const weekAgoStr  = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]
  const [showModal,   setShowModal]   = useState(false)
  const [modalStart,  setModalStart]  = useState(weekAgoStr)
  const [modalEnd,    setModalEnd]    = useState(todayStr)
  const [modalEmail,  setModalEmail]  = useState(adminEmail)
  const [modalStatus, setModalStatus] = useState<'idle' | 'sending' | 'sent' | 'error'>('idle')
  const [modalError,  setModalError]  = useState('')
  const PER_PAGE = 10

  // ── Filtered & sorted users ──────────────────────────────────────────────
  const filtered = useMemo(() => {
    let arr = [...users]
    if (roleFilter  !== 'all') arr = arr.filter(u => u.role === roleFilter)
    if (levelFilter !== 'all') arr = arr.filter(u => u.level === levelFilter)
    if (search.trim()) {
      const q = search.toLowerCase()
      arr = arr.filter(u =>
        u.full_name.toLowerCase().includes(q) ||
        u.email.toLowerCase().includes(q) ||
        u.level.toLowerCase().includes(q)
      )
    }
    arr.sort((a, b) => {
      const va = a[sortKey] ?? ''
      const vb = b[sortKey] ?? ''
      if (va < vb) return sortDir === 'asc' ? -1 : 1
      if (va > vb) return sortDir === 'asc' ?  1 : -1
      return 0
    })
    return arr
  }, [users, search, sortKey, sortDir, roleFilter, levelFilter])

  const pageCount    = Math.max(1, Math.ceil(filtered.length / PER_PAGE))
  const paginated    = filtered.slice((page - 1) * PER_PAGE, page * PER_PAGE)

  function toggleSort(key: SortKey) {
    if (sortKey === key) setSortDir(d => d === 'asc' ? 'desc' : 'asc')
    else { setSortKey(key); setSortDir('desc') }
    setPage(1)
  }

  function SortBtn({ col }: { col: SortKey }) {
    return (
      <span className="sort-btn" onClick={() => toggleSort(col)}>
        {sortKey === col
          ? (sortDir === 'asc' ? <ChevronUp /> : <ChevronDown />)
          : <span style={{ opacity:.3 }}><ChevronDown /></span>
        }
      </span>
    )
  }

  const initials = adminName.charAt(0).toUpperCase()

  return (
    <div className="admin-root">
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800;900&display=swap');

        *, *::before, *::after { box-sizing: border-box; margin:0; padding:0; }

        .admin-root {
          display:flex; min-height:100vh;
          background:#0f0f1a;
          font-family:'Inter',sans-serif;
          color:#e2e8f0;
        }

        /* ── Sidebar ─────────────────────────────────── */
        .admin-sidebar {
          width:240px; min-height:100vh;
          background:linear-gradient(180deg,#12122a 0%,#0d0d1f 100%);
          border-right:1px solid rgba(255,255,255,.06);
          display:flex; flex-direction:column;
          padding:1.5rem 1rem;
          position:sticky; top:0; z-index:20; flex-shrink:0;
        }
        .sidebar-logo {
          display:flex; align-items:center; gap:10px;
          margin-bottom:2.5rem; padding:0 6px;
        }
        .sidebar-logo-icon {
          width:36px; height:36px; border-radius:10px;
          background:linear-gradient(135deg,#667eea,#764ba2);
          display:flex; align-items:center; justify-content:center;
          box-shadow:0 4px 16px rgba(102,126,234,.4);
        }
        .sidebar-logo-text {
          font-size:1rem; font-weight:800; letter-spacing:-.02em;
          background:linear-gradient(135deg,#667eea,#a78bfa);
          -webkit-background-clip:text; -webkit-text-fill-color:transparent;
        }
        .sidebar-admin-badge {
          font-size:.62rem; font-weight:800; letter-spacing:.1em;
          text-transform:uppercase; padding:2px 7px; border-radius:5px;
          background:rgba(231,76,60,.15); color:#e74c3c;
          border:1px solid rgba(231,76,60,.25);
        }

        .sidebar-section-label {
          font-size:.65rem; font-weight:800; letter-spacing:.12em;
          text-transform:uppercase; color:#4a5568;
          padding:0 10px; margin-bottom:8px;
        }

        .nav-btn {
          display:flex; align-items:center; gap:10px;
          width:100%; padding:11px 12px; border-radius:10px;
          background:none; border:none; cursor:pointer;
          font-family:'Inter',sans-serif; font-size:.9rem; font-weight:600;
          color:#64748b; transition:background .2s,color .2s;
          margin-bottom:2px; text-align:left;
        }
        .nav-btn:hover { background:rgba(255,255,255,.05); color:#e2e8f0; }
        .nav-btn.active {
          background:rgba(102,126,234,.15);
          color:#a5b4fc;
          border-left:3px solid #667eea;
        }

        .sidebar-divider {
          height:1px; background:rgba(255,255,255,.06);
          margin:1rem 0;
        }

        .sidebar-user-card {
          margin-top:auto;
          padding:12px; border-radius:12px;
          background:rgba(255,255,255,.04);
          border:1px solid rgba(255,255,255,.07);
        }
        .sidebar-user-row {
          display:flex; align-items:center; gap:10px; margin-bottom:10px;
        }
        .sidebar-avatar {
          width:34px; height:34px; border-radius:50%;
          background:linear-gradient(135deg,#667eea,#764ba2);
          display:flex; align-items:center; justify-content:center;
          font-size:.85rem; font-weight:800; color:white; flex-shrink:0;
        }
        .sidebar-user-name  { font-size:.85rem; font-weight:700; color:#e2e8f0; }
        .sidebar-user-email { font-size:.72rem; color:#4a5568; overflow:hidden; text-overflow:ellipsis; white-space:nowrap; max-width:130px; }
        .signout-btn {
          width:100%; padding:9px 12px; border-radius:8px;
          background:rgba(231,76,60,.08); border:1px solid rgba(231,76,60,.2);
          color:#f87171; font-size:.85rem; font-weight:700;
          font-family:'Inter',sans-serif; cursor:pointer;
          display:flex; align-items:center; gap:8px;
          transition:background .2s;
        }
        .signout-btn:hover { background:rgba(231,76,60,.14); }

        /* ── Main area ───────────────────────────────── */
        .admin-main { flex:1; min-width:0; overflow-x:hidden; }

        /* Top bar */
        .admin-topbar {
          position:sticky; top:0; z-index:10;
          background:rgba(15,15,26,.92);
          backdrop-filter:blur(12px);
          border-bottom:1px solid rgba(255,255,255,.06);
          padding:1rem 2rem;
          display:flex; align-items:center; justify-content:space-between; gap:12px;
        }
        .topbar-title {
          font-size:1.15rem; font-weight:800; color:#e2e8f0;
          letter-spacing:-.02em;
        }
        .topbar-subtitle { font-size:.8rem; color:#4a5568; margin-top:1px; }
        .topbar-time {
          font-size:.8rem; color:#4a5568;
          background:rgba(255,255,255,.04); border:1px solid rgba(255,255,255,.07);
          padding:5px 12px; border-radius:8px;
        }

        /* Content */
        .admin-content { padding:1.75rem 2rem; }

        /* ── KPI Cards ───────────────────────────────── */
        .kpi-grid {
          display:grid;
          grid-template-columns:repeat(auto-fit,minmax(180px,1fr));
          gap:1rem; margin-bottom:1.75rem;
        }
        .kpi-card {
          background:rgba(255,255,255,.03);
          border:1px solid rgba(255,255,255,.07);
          border-radius:16px; padding:1.25rem;
          display:flex; align-items:flex-start; gap:14px;
          transition:border-color .2s, transform .2s;
          position:relative; overflow:hidden;
        }
        .kpi-card::before {
          content:''; position:absolute; inset:0; opacity:.03;
          background:linear-gradient(135deg,#667eea,#764ba2);
          pointer-events:none;
        }
        .kpi-card:hover { border-color:rgba(102,126,234,.3); transform:translateY(-2px); }
        .kpi-icon-wrap {
          width:44px; height:44px; border-radius:12px; flex-shrink:0;
          display:flex; align-items:center; justify-content:center;
        }
        .kpi-body   { flex:1; min-width:0; }
        .kpi-label  { font-size:.72rem; font-weight:700; letter-spacing:.05em; text-transform:uppercase; color:#4a5568; margin-bottom:4px; }
        .kpi-value  { font-size:1.7rem; font-weight:900; letter-spacing:-.04em; line-height:1; }
        .kpi-sub    { font-size:.75rem; color:#4a5568; margin-top:4px; display:flex; align-items:center; gap:4px; }

        /* ── Charts row ─────────────────────────────── */
        .charts-row {
          display:grid; grid-template-columns:1fr 280px;
          gap:1rem; margin-bottom:1.75rem;
        }
        @media(max-width:900px){ .charts-row{grid-template-columns:1fr} }

        .panel-card {
          background:rgba(255,255,255,.03);
          border:1px solid rgba(255,255,255,.07);
          border-radius:16px; padding:1.25rem 1.5rem;
        }
        .panel-title {
          font-size:.75rem; font-weight:800; letter-spacing:.09em;
          text-transform:uppercase; color:#4a5568; margin-bottom:1rem;
          display:flex; align-items:center; gap:8px;
        }
        .panel-title-accent {
          display:inline-block; width:3px; height:14px;
          border-radius:2px; background:linear-gradient(180deg,#667eea,#764ba2);
          margin-right:2px;
        }

        /* ── Legend pills for chart ─────────────────── */
        .chart-legend {
          display:flex; gap:10px; margin-bottom:10px; flex-wrap:wrap;
        }
        .legend-pill {
          display:flex; align-items:center; gap:5px;
          font-size:.72rem; color:#64748b;
        }
        .legend-dot {
          width:8px; height:8px; border-radius:2px; flex-shrink:0;
        }

        /* ── Users Table ─────────────────────────────── */
        .table-section { margin-bottom:1.75rem; }
        .table-controls {
          display:flex; align-items:center; gap:10px;
          flex-wrap:wrap; margin-bottom:1rem;
        }
        .search-wrap {
          position:relative; flex:1; min-width:200px; max-width:360px;
        }
        .search-input {
          width:100%; padding:9px 12px 9px 36px;
          background:rgba(255,255,255,.04);
          border:1px solid rgba(255,255,255,.09);
          border-radius:10px; color:#e2e8f0; font-size:.88rem;
          font-family:'Inter',sans-serif; outline:none;
          transition:border-color .2s;
        }
        .search-input:focus { border-color:rgba(102,126,234,.5); }
        .search-input::placeholder { color:#4a5568; }
        .search-icon {
          position:absolute; left:11px; top:50%; transform:translateY(-50%);
          color:#4a5568; pointer-events:none;
        }
        .filter-select {
          padding:9px 12px; background:rgba(255,255,255,.04);
          border:1px solid rgba(255,255,255,.09); border-radius:10px;
          color:#e2e8f0; font-size:.85rem; font-family:'Inter',sans-serif;
          outline:none; cursor:pointer;
        }
        .filter-select option { background:#1a1a2e; color:#e2e8f0; }
        .table-count {
          font-size:.8rem; color:#4a5568; margin-left:auto; white-space:nowrap;
        }

        .data-table-wrap {
          background:rgba(255,255,255,.02);
          border:1px solid rgba(255,255,255,.06);
          border-radius:14px; overflow:hidden;
        }
        .data-table { width:100%; border-collapse:collapse; }
        .data-table thead {
          background:rgba(255,255,255,.04);
          border-bottom:1px solid rgba(255,255,255,.06);
        }
        .data-table th {
          padding:11px 14px; text-align:left;
          font-size:.68rem; font-weight:800; letter-spacing:.08em;
          text-transform:uppercase; color:#4a5568; white-space:nowrap;
          user-select:none;
        }
        .th-sort {
          display:inline-flex; align-items:center; gap:4px; cursor:pointer;
          transition:color .15s;
        }
        .th-sort:hover { color:#94a3b8; }
        .sort-btn {
          display:inline-flex; align-items:center;
          cursor:pointer; color:#667eea;
        }
        .data-table td {
          padding:12px 14px; font-size:.875rem; color:#cbd5e1;
          border-bottom:1px solid rgba(255,255,255,.04);
          vertical-align:middle;
        }
        .data-table tbody tr:hover { background:rgba(255,255,255,.025); }
        .data-table tbody tr:last-child td { border-bottom:none; }

        /* user cell */
        .user-cell { display:flex; align-items:center; gap:10px; }
        .user-cell-avatar {
          width:32px; height:32px; border-radius:50%; flex-shrink:0;
          background:linear-gradient(135deg,#667eea,#764ba2);
          display:flex; align-items:center; justify-content:center;
          font-size:.78rem; font-weight:800; color:white;
        }
        .user-cell-name  { font-size:.875rem; font-weight:700; color:#e2e8f0; }
        .user-cell-email { font-size:.75rem; color:#4a5568; }

        /* badges */
        .role-badge {
          display:inline-flex; align-items:center; gap:4px;
          padding:3px 9px; border-radius:6px; font-size:.72rem; font-weight:700;
          letter-spacing:.03em;
        }
        .role-admin {
          background:rgba(231,76,60,.15); color:#f87171;
          border:1px solid rgba(231,76,60,.25);
        }
        .role-user {
          background:rgba(255,255,255,.06); color:#64748b;
          border:1px solid rgba(255,255,255,.09);
        }
        .level-badge {
          padding:3px 9px; border-radius:6px; font-size:.72rem; font-weight:700;
        }

        /* pagination */
        .pagination {
          display:flex; align-items:center; justify-content:flex-end; gap:6px;
          padding:.875rem 1rem; background:rgba(255,255,255,.02);
          border-top:1px solid rgba(255,255,255,.05);
        }
        .page-btn {
          width:32px; height:32px; border-radius:8px; border:1px solid rgba(255,255,255,.09);
          background:rgba(255,255,255,.04); color:#94a3b8;
          font-size:.8rem; font-weight:600; cursor:pointer;
          display:flex; align-items:center; justify-content:center;
          font-family:'Inter',sans-serif; transition:background .15s,color .15s;
        }
        .page-btn:hover:not(:disabled) { background:rgba(102,126,234,.15); color:#a5b4fc; }
        .page-btn.active { background:rgba(102,126,234,.25); color:#a5b4fc; border-color:rgba(102,126,234,.35); }
        .page-btn:disabled { opacity:.35; cursor:default; }
        .page-info { font-size:.78rem; color:#4a5568; }

        /* ── Audit log ───────────────────────────────── */
        .audit-log { display:flex; flex-direction:column; gap:6px; max-height:420px; overflow-y:auto; }
        .audit-log::-webkit-scrollbar { width:4px; }
        .audit-log::-webkit-scrollbar-track { background:transparent; }
        .audit-log::-webkit-scrollbar-thumb { background:rgba(255,255,255,.1); border-radius:4px; }
        .log-row {
          display:flex; align-items:flex-start; gap:10px;
          padding:10px 12px; border-radius:10px;
          background:rgba(255,255,255,.02);
          border:1px solid rgba(255,255,255,.05);
          transition:background .15s;
        }
        .log-row:hover { background:rgba(255,255,255,.05); }
        .log-event-badge {
          padding:3px 8px; border-radius:6px; font-size:.68rem; font-weight:700;
          letter-spacing:.03em; white-space:nowrap; flex-shrink:0;
        }
        .log-meta { flex:1; min-width:0; }
        .log-detail { font-size:.78rem; color:#4a5568; overflow:hidden; text-overflow:ellipsis; white-space:nowrap; }
        .log-time { font-size:.72rem; color:#374151; white-space:nowrap; flex-shrink:0; }

        /* ── Two-col layout for charts+log ─────────── */
        .bottom-row {
          display:grid; grid-template-columns:1fr 1fr;
          gap:1rem; margin-bottom:1.75rem;
        }
        @media(max-width:900px){ .bottom-row{grid-template-columns:1fr} }

        /* ── Responsive ─────────────────────────────── */
        /* ── Responsive ─────────────────────────────── */
        .mobile-top-bar {
          display:none; align-items:center; justify-content:space-between;
          padding:.75rem 1rem; background:rgba(15,15,26,.92); backdrop-filter:blur(12px);
          border-bottom:1px solid rgba(255,255,255,.06); position:sticky; top:0; z-index:30;
        }
        .hamburger-btn {
          background:none; border:none; cursor:pointer; padding:8px; border-radius:10px;
          color:#e2e8f0; display:flex; align-items:center; justify-content:center;
          transition:background .2s; min-width:40px; min-height:40px;
        }
        .hamburger-btn:hover { background:rgba(255,255,255,.08); }
        .sidebar-overlay { display:none; }

        @media(max-width:768px){
          .admin-sidebar {
            position:fixed; left:0; top:0; width:240px; height:100vh;
            z-index:60; transform:translateX(-100%);
            transition:transform .28s cubic-bezier(.16,1,.3,1);
            box-shadow:4px 0 32px rgba(0,0,0,.5);
            overflow:hidden;
          }
          .admin-sidebar.mobile-open { transform:translateX(0); }
          .admin-content { padding:1rem; }
          .admin-main { width:100%; }
          .admin-topbar  { padding:.875rem 1rem; }
          .kpi-grid      { grid-template-columns:repeat(2,1fr); }
          .mobile-top-bar { display:flex; }
          .sidebar-overlay { display:block; position:fixed; inset:0; background:rgba(0,0,0,.6); backdrop-filter:blur(3px); z-index:59; }
          .sidebar-close-mobile { display:flex !important; }
        }
        @media(max-width:480px){
          .kpi-grid { grid-template-columns:1fr; }
        }
      `}</style>

      {/* ── Mobile top bar (hamburger) ── */}
      <div className="mobile-top-bar">
        <button className="hamburger-btn" onClick={() => setMobileMenuOpen(true)} aria-label="Open menu">
          <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <line x1="3" y1="6" x2="21" y2="6"/><line x1="3" y1="12" x2="21" y2="12"/><line x1="3" y1="18" x2="21" y2="18"/>
          </svg>
        </button>
        <div style={{display:'flex',alignItems:'center',gap:8}}>
          <div style={{width:32,height:32,borderRadius:9,background:'linear-gradient(135deg,#667eea,#764ba2)',display:'flex',alignItems:'center',justifyContent:'center',color:'white'}}>
            <ShieldIcon s={16}/>
          </div>
          <span style={{fontWeight:800,fontSize:'.95rem',color:'#e2e8f0'}}>Admin</span>
        </div>
        <div style={{width:36,height:36,borderRadius:'50%',background:'linear-gradient(135deg,#667eea,#764ba2)',display:'flex',alignItems:'center',justifyContent:'center',fontSize:'.85rem',fontWeight:800,color:'white'}}>{initials}</div>
      </div>

      {/* ── Mobile sidebar overlay backdrop ── */}
      {mobileMenuOpen && (
        <div className="sidebar-overlay" onClick={() => setMobileMenuOpen(false)} />
      )}

      <div style={{display:'flex',flex:1,minWidth:0}}>

      {/* ── Sidebar ──────────────────────────────────────────────────────────── */}
      <aside className={`admin-sidebar${mobileMenuOpen ? ' mobile-open' : ''}`}>
        <button
          onClick={() => setMobileMenuOpen(false)}
          style={{display:'none',position:'absolute',top:12,right:12,background:'none',border:'none',cursor:'pointer',padding:6,borderRadius:8,color:'#94a3b8'}}
          className="sidebar-close-mobile" aria-label="Close menu">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>
          </svg>
        </button>
        <div className="sidebar-logo">
          <div className="sidebar-logo-icon"><ShieldIcon s={18} /></div>
          <div>
            <div className="sidebar-logo-text">VoiceGuard</div>
            <div className="sidebar-admin-badge">Admin</div>
          </div>
        </div>

        <div className="sidebar-section-label">Navigation</div>
        <button className={`nav-btn${activeTab==='overview'?' active':''}`} onClick={()=>{setActiveTab('overview');setMobileMenuOpen(false);}}>
          <GridIcon s={18} />Overview
        </button>
        <button className={`nav-btn${activeTab==='users'?' active':''}`} onClick={()=>{setActiveTab('users');setMobileMenuOpen(false);}}>
          <UsersIcon s={18} />Users
          <span style={{marginLeft:'auto',background:'rgba(102,126,234,.2)',color:'#a5b4fc',fontSize:'.7rem',fontWeight:700,padding:'2px 7px',borderRadius:6}}>
            {users.length}
          </span>
        </button>
        <button className={`nav-btn${activeTab==='detections'?' active':''}`} onClick={()=>{setActiveTab('detections');setMobileMenuOpen(false);}}>
          <ShieldCheckIcon s={18} />Detections
        </button>
        <button className={`nav-btn${activeTab==='logs'?' active':''}`} onClick={()=>{setActiveTab('logs');setMobileMenuOpen(false);}}>
          <LogFileIcon s={18} />Audit Logs
        </button>
        <button className={`nav-btn${activeTab==='videos'?' active':''}`} onClick={()=>{setActiveTab('videos');setMobileMenuOpen(false);}}>
          <ShieldIcon s={18} />Videos
        </button>
        <button className={`nav-btn${activeTab==='alerts'?' active':''}`} onClick={()=>{setActiveTab('alerts');setMobileMenuOpen(false);}}>
          <AlertTriangle s={18} />Alerts
        </button>

        <div className="sidebar-divider" />

        <div className="sidebar-user-card">
          <div className="sidebar-user-row">
            <div className="sidebar-avatar">{initials}</div>
            <div style={{flex:1,minWidth:0}}>
              <div className="sidebar-user-name">{adminName}</div>
              <div className="sidebar-user-email">{adminEmail}</div>
            </div>
          </div>
          <form action={logout}>
            <button type="submit" className="signout-btn">
              <LogOutIcon s={15} />Sign Out
            </button>
          </form>
        </div>
      </aside>

      {/* ── Main ─────────────────────────────────────────────────────────────── */}
      <main className="admin-main">
        {/* Top bar */}
        <div className="admin-topbar">
          <div>
            <div className="topbar-title">
              {activeTab === 'overview' ? '📊 Overview Dashboard' :
               activeTab === 'users'    ? '👥 User Management' :
               activeTab === 'detections'? '🎙️ Voice Detections' :
               activeTab === 'videos'   ? '📺 Educational Videos' :
               activeTab === 'alerts'   ? '🔔 Safety Alerts' :
                                          '📋 Audit Logs'}
            </div>
            <div className="topbar-subtitle">
              {activeTab === 'overview'
                ? `${stats.totalUsers} total users · ${stats.activeToday} active today`
                : activeTab === 'users'
                ? `${filtered.length} user${filtered.length !== 1 ? 's' : ''} found`
                : activeTab === 'detections'
                ? `${stats.totalScans} AI scans analyzed`
                : activeTab === 'videos'
                ? `${videos.length} videos available`
                : activeTab === 'alerts'
                ? `${alerts.length} active alerts`
                : `${auditLogs.length} recent events`}
            </div>
          </div>
          <div style={{display:'flex', alignItems:'center', gap:8}}>
            {/* Email report — opens date-range modal */}
            <button
              id="btn-email-report"
              onClick={() => { setShowModal(true); setModalStatus('idle'); setModalError('') }}
              style={{
                display:'flex', alignItems:'center', gap:6,
                padding:'6px 14px', borderRadius:8,
                background:'rgba(102,126,234,.15)',
                color:'#a5b4fc',
                border:'1px solid rgba(102,126,234,.3)',
                fontSize:'.8rem', fontWeight:600, cursor:'pointer',
                fontFamily:'Inter,sans-serif', transition:'all .2s',
              }}
            >
              <MailIcon />
              Email Report
            </button>

            <div className="topbar-time">
              {new Date().toLocaleDateString('en-MY', { weekday:'short', day:'2-digit', month:'short', year:'numeric' })}
            </div>
          </div>
        </div>

        {/* ── Date-Range Report Modal ─────────────────────────────────────── */}
        {showModal && (
          <div
            onClick={e => { if (e.target === e.currentTarget) setShowModal(false) }}
            style={{
              position:'fixed', inset:0, zIndex:9999,
              background:'rgba(0,0,0,.72)', backdropFilter:'blur(6px)',
              display:'flex', alignItems:'center', justifyContent:'center',
              padding:'16px',
            }}
          >
            <div style={{
              width:'100%', maxWidth:480,
              background:'linear-gradient(160deg,#13122e 0%,#1a1635 100%)',
              border:'1px solid rgba(99,102,241,.35)',
              borderRadius:22, padding:'28px 28px 24px',
              boxShadow:'0 24px 80px rgba(0,0,0,.7), 0 0 0 1px rgba(99,102,241,.15)',
              fontFamily:'Inter,sans-serif',
            }}>

              {/* Modal header */}
              <div style={{display:'flex', alignItems:'flex-start', justifyContent:'space-between', marginBottom:22}}>
                <div>
                  <div style={{display:'flex', alignItems:'center', gap:10, marginBottom:6}}>
                    <div style={{width:38, height:38, borderRadius:11, background:'linear-gradient(135deg,#6366f1,#8b5cf6)', display:'flex', alignItems:'center', justifyContent:'center', fontSize:18}}>📊</div>
                    <div>
                      <div style={{fontSize:'1.05rem', fontWeight:800, color:'#e2e8f0', letterSpacing:'-0.02em'}}>Email Analytics Report</div>
                      <div style={{fontSize:'.75rem', color:'#6b7280', marginTop:1}}>Sent as an Excel workbook (5 sheets)</div>
                    </div>
                  </div>
                </div>
                <button
                  onClick={() => setShowModal(false)}
                  style={{background:'none', border:'none', color:'#4b5563', cursor:'pointer', padding:4, display:'flex', borderRadius:8, flexShrink:0}}
                >
                  <XIcon s={18}/>
                </button>
              </div>

              {/* Quick presets */}
              <div style={{marginBottom:18}}>
                <div style={{fontSize:'.7rem', fontWeight:700, letterSpacing:'.08em', textTransform:'uppercase', color:'#4b5563', marginBottom:8}}>Quick Select</div>
                <div style={{display:'flex', gap:6, flexWrap:'wrap'}}>
                  {([
                    ['Last 7 days',  () => { const s = new Date(Date.now()-7*86400000); setModalStart(s.toISOString().split('T')[0]); setModalEnd(todayStr) }],
                    ['Last 30 days', () => { const s = new Date(Date.now()-30*86400000); setModalStart(s.toISOString().split('T')[0]); setModalEnd(todayStr) }],
                    ['This month',   () => { const n = new Date(); setModalStart(`${n.getFullYear()}-${String(n.getMonth()+1).padStart(2,'0')}-01`); setModalEnd(todayStr) }],
                    ['Last month',   () => { const n = new Date(); const m = n.getMonth()===0?12:n.getMonth(); const y = n.getMonth()===0?n.getFullYear()-1:n.getFullYear(); const last = new Date(y, m, 0).getDate(); setModalStart(`${y}-${String(m).padStart(2,'0')}-01`); setModalEnd(`${y}-${String(m).padStart(2,'0')}-${last}`) }],
                  ] as [string, () => void][]).map(([label, fn]) => (
                    <button key={label} onClick={fn} style={{
                      padding:'5px 12px', borderRadius:8,
                      background:'rgba(99,102,241,.12)', border:'1px solid rgba(99,102,241,.25)',
                      color:'#a5b4fc', fontSize:'.75rem', fontWeight:600, cursor:'pointer',
                      fontFamily:'Inter,sans-serif', transition:'all .18s',
                    }}>{label}</button>
                  ))}
                </div>
              </div>

              {/* Date pickers */}
              <div style={{display:'grid', gridTemplateColumns:'1fr 1fr', gap:12, marginBottom:16}}>
                {[['From', modalStart, setModalStart], ['To', modalEnd, setModalEnd]].map(([label, val, setter]) => (
                  <div key={label as string}>
                    <label style={{display:'block', fontSize:'.72rem', fontWeight:700, letterSpacing:'.07em', textTransform:'uppercase', color:'#6b7280', marginBottom:6}}>{label as string}</label>
                    <input
                      type="date"
                      value={val as string}
                      max={todayStr}
                      onChange={e => (setter as (v: string) => void)(e.target.value)}
                      style={{
                        width:'100%', padding:'9px 12px', borderRadius:10,
                        background:'rgba(15,14,40,.8)', border:'1px solid rgba(99,102,241,.3)',
                        color:'#e2e8f0', fontSize:'.88rem', fontFamily:'Inter,sans-serif',
                        outline:'none', boxSizing:'border-box',
                        colorScheme:'dark',
                      }}
                    />
                  </div>
                ))}
              </div>

              {/* Recipient email */}
              <div style={{marginBottom:20}}>
                <label style={{display:'block', fontSize:'.72rem', fontWeight:700, letterSpacing:'.07em', textTransform:'uppercase', color:'#6b7280', marginBottom:6}}>Send To</label>
                <input
                  type="email"
                  value={modalEmail}
                  onChange={e => setModalEmail(e.target.value)}
                  placeholder="admin@yourdomain.com"
                  style={{
                    width:'100%', padding:'9px 12px', borderRadius:10,
                    background:'rgba(15,14,40,.8)', border:'1px solid rgba(99,102,241,.3)',
                    color:'#e2e8f0', fontSize:'.88rem', fontFamily:'Inter,sans-serif',
                    outline:'none', boxSizing:'border-box',
                  }}
                />
              </div>

              {/* Preview badge */}
              <div style={{
                background:'rgba(99,102,241,.08)', border:'1px solid rgba(99,102,241,.2)',
                borderRadius:10, padding:'10px 14px', marginBottom:20,
                display:'flex', alignItems:'center', gap:10,
              }}>
                <span style={{fontSize:'1.1rem'}}>📎</span>
                <div style={{flex:1, minWidth:0}}>
                  <div style={{fontSize:'.78rem', fontWeight:700, color:'#a5b4fc'}}>
                    VoiceGuard-Report-{modalStart}-to-{modalEnd}.xlsx
                  </div>
                  <div style={{fontSize:'.7rem', color:'#4b5563', marginTop:2}}>
                    5 sheets · Summary · Daily Activity · User Levels · Detections · Audit Log
                  </div>
                </div>
              </div>

              {/* Error */}
              {modalStatus === 'error' && (
                <div style={{background:'rgba(248,113,113,.1)', border:'1px solid rgba(248,113,113,.3)', borderRadius:8, padding:'8px 12px', marginBottom:12, fontSize:'.8rem', color:'#f87171'}}>
                  ✕ {modalError}
                </div>
              )}

              {/* Actions */}
              <div style={{display:'flex', gap:10, justifyContent:'flex-end'}}>
                <button
                  onClick={() => setShowModal(false)}
                  style={{
                    padding:'10px 20px', borderRadius:10, background:'none',
                    border:'1px solid rgba(255,255,255,.1)', color:'#6b7280',
                    fontSize:'.85rem', fontWeight:600, cursor:'pointer', fontFamily:'Inter,sans-serif',
                  }}
                >Cancel</button>
                <button
                  id="btn-send-excel-report"
                  disabled={modalStatus === 'sending' || !modalStart || !modalEnd || !modalEmail}
                  onClick={() => {
                    setModalStatus('sending'); setModalError('')
                    startTransition(async () => {
                      const res = await sendCustomReport(modalEmail, modalStart, modalEnd)
                      if (res.ok) {
                        setModalStatus('sent')
                        setTimeout(() => setShowModal(false), 2500)
                      } else {
                        setModalStatus('error')
                        setModalError(res.error ?? 'Unknown error')
                      }
                    })
                  }}
                  style={{
                    display:'flex', alignItems:'center', gap:8,
                    padding:'10px 22px', borderRadius:10,
                    background: modalStatus === 'sent'
                      ? 'linear-gradient(135deg,#059669,#10b981)'
                      : 'linear-gradient(135deg,#6366f1,#8b5cf6)',
                    color:'white', fontSize:'.88rem', fontWeight:700,
                    border:'none', cursor: modalStatus === 'sending' ? 'default' : 'pointer',
                    fontFamily:'Inter,sans-serif',
                    boxShadow:'0 4px 16px rgba(99,102,241,.4)',
                    opacity: modalStatus === 'sending' ? .75 : 1,
                    transition:'all .2s',
                  }}
                >
                  {modalStatus === 'sending' ? (
                    <><svg style={{animation:'spin .8s linear infinite'}} width={14} height={14} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M21 12a9 9 0 1 1-6.219-8.56"/></svg>Generating Excel…</>
                  ) : modalStatus === 'sent' ? (
                    <><CheckIcon s={14}/>✓ Report Sent!</>
                  ) : (
                    <><MailIcon s={14}/>Send Excel Report</>
                  )}
                </button>
              </div>
            </div>
          </div>
        )}

        <div className="admin-content">

          {/* ── OVERVIEW TAB ───────────────────────────────────────────────── */}
          {activeTab === 'overview' && (<>

            {/* KPI Row */}
            <div className="kpi-grid">
              <KpiCard
                icon={<UsersIcon s={22} />}
                label="Total Users"
                value={stats.totalUsers.toLocaleString()}
                sub={<><TrendUpIcon s={12}/>{stats.newUsersThisWeek} new this week</>}
                color="#60a5fa"
                iconBg="rgba(96,165,250,.12)"
              />
              <KpiCard
                icon={<ActivityIcon s={22} />}
                label="Active Today"
                value={stats.activeToday.toLocaleString()}
                sub="Login events today"
                color="#34d399"
                iconBg="rgba(52,211,153,.12)"
              />
              <KpiCard
                icon={<MicIcon s={22} />}
                label="Voice Scans"
                value={stats.totalScans.toLocaleString()}
                sub="Total AI detections"
                color="#a78bfa"
                iconBg="rgba(167,139,250,.12)"
              />
              <KpiCard
                icon={<AlertTriangle s={22} />}
                label="Scams Flagged"
                value={stats.scamsDetected.toLocaleString()}
                sub="Spoofs detected"
                color="#f87171"
                iconBg="rgba(248,113,113,.12)"
              />
              <KpiCard
                icon={<StarIcon s={22} />}
                label="Avg. Points"
                value={stats.avgPoints.toLocaleString()}
                sub="Per active user"
                color="#fbbf24"
                iconBg="rgba(251,191,36,.12)"
              />
            </div>

            {/* Charts row */}
            <div className="charts-row">
              <div className="panel-card">
                <div className="panel-title">
                  <span className="panel-title-accent" />
                  Security Posture
                </div>
                <div style={{display:'flex', flexDirection:'column', gap:'1.5rem', marginTop:'1rem'}}>

                  <div>
                    <div style={{display:'flex', justifyContent:'space-between', fontSize:'.85rem', color:'#e2e8f0', fontWeight:600, marginBottom:8}}>
                      <span>Bona-fide Ratio (Real audio)</span>
                      <span>{stats.bonaFideRatio}%</span>
                    </div>
                    <div style={{width:'100%', height:8, background:'rgba(255,255,255,.1)', borderRadius:4, overflow:'hidden'}}>
                      <div style={{width:`${stats.bonaFideRatio}%`, height:'100%', background:'#c084fc', borderRadius:4}} />
                    </div>
                  </div>
                </div>
              </div>
              <div className="panel-card">
                <div className="panel-title">
                  <span className="panel-title-accent" />
                  Daily Activity — Last 7 Days
                </div>
                <div className="chart-legend">
                  <div className="legend-pill">
                    <div className="legend-dot" style={{background:'linear-gradient(135deg,#667eea,#764ba2)'}} />
                    Logins
                  </div>
                  <div className="legend-pill">
                    <div className="legend-dot" style={{background:'rgba(96,165,250,.7)'}} />
                    Sign-ups
                  </div>
                </div>
                <ActivityChart data={dailyActivity} />
              </div>
              <div className="panel-card">
                <div className="panel-title">
                  <span className="panel-title-accent" />
                  Users by Level
                </div>
                <DonutChart data={usersByLevel} />
              </div>
            </div>

            {/* Recent logs preview */}
            <div className="panel-card">
              <div className="panel-title" style={{marginBottom:'1rem'}}>
                <span className="panel-title-accent" />
                Recent Security Events
                <button
                  onClick={()=>setActiveTab('logs')}
                  style={{marginLeft:'auto',background:'none',border:'none',cursor:'pointer',color:'#667eea',fontSize:'.78rem',fontWeight:700,fontFamily:'Inter,sans-serif'}}
                >
                  View all →
                </button>
              </div>
              <div className="audit-log" style={{maxHeight:260}}>
                {auditLogs.slice(0,10).map(log => {
                  const pal = EVENT_PALETTE[log.event] ?? { color:'#94a3b8', bg:'rgba(148,163,184,.12)' }
                  return (
                    <div key={log.id} className="log-row">
                      <span className="log-event-badge" style={{background:pal.bg,color:pal.color}}>
                        {log.event.replace(/_/g,' ')}
                      </span>
                      <div className="log-meta">
                        <div className="log-detail">
                          {log.ip_address ? `IP: ${log.ip_address}` : 'No IP'}
                          {log.meta && Object.keys(log.meta).length > 0
                            ? ` · ${JSON.stringify(log.meta).slice(0,60)}` : ''}
                        </div>
                      </div>
                      <span className="log-time">{timeAgo(log.created_at)}</span>
                    </div>
                  )
                })}
                {auditLogs.length === 0 && (
                  <div style={{textAlign:'center',color:'#4a5568',padding:'2rem',fontSize:'.85rem'}}>No events yet</div>
                )}
              </div>
            </div>
          </>)}

          {/* ── USERS TAB ──────────────────────────────────────────────────── */}
          {activeTab === 'users' && (<>
            <div className="table-section">
              <div className="table-controls">
                <div className="search-wrap">
                  <span className="search-icon"><SearchIcon /></span>
                  <input
                    id="admin-search"
                    className="search-input"
                    placeholder="Search name, email, level…"
                    value={search}
                    onChange={e=>{ setSearch(e.target.value); setPage(1) }}
                  />
                </div>
                <select
                  id="admin-role-filter"
                  className="filter-select"
                  value={roleFilter}
                  onChange={e=>{ setRoleFilter(e.target.value as typeof roleFilter); setPage(1) }}
                >
                  <option value="all">All Roles</option>
                  <option value="admin">Admins</option>
                  <option value="user">Users</option>
                </select>
                <select
                  id="admin-level-filter"
                  className="filter-select"
                  value={levelFilter}
                  onChange={e=>{ setLevelFilter(e.target.value); setPage(1) }}
                >
                  <option value="all">All Levels</option>
                  {['Beginner','Aware','Guardian','Expert','Champion'].map(l=>(
                    <option key={l} value={l}>{l}</option>
                  ))}
                </select>
                <div className="table-count">
                  {filtered.length} result{filtered.length !== 1 ? 's' : ''}
                </div>
              </div>

              <div className="data-table-wrap">
                <table className="data-table">
                  <thead>
                    <tr>
                      <th><span className="th-sort" onClick={()=>toggleSort('full_name')}>Name <SortBtn col="full_name" /></span></th>
                      <th>Role</th>
                      <th><span className="th-sort" onClick={()=>toggleSort('level')}>Level <SortBtn col="level" /></span></th>
                      <th><span className="th-sort" onClick={()=>toggleSort('total_points')}>Points <SortBtn col="total_points" /></span></th>
                      <th><span className="th-sort" onClick={()=>toggleSort('streak_days')}>Streak <SortBtn col="streak_days" /></span></th>
                      <th><span className="th-sort" onClick={()=>toggleSort('created_at')}>Joined <SortBtn col="created_at" /></span></th>
                      <th><span className="th-sort" onClick={()=>toggleSort('last_sign_in_at')}>Last Active <SortBtn col="last_sign_in_at" /></span></th>
                    </tr>
                  </thead>
                  <tbody>
                    {paginated.length === 0 ? (
                      <tr>
                        <td colSpan={7} style={{textAlign:'center',color:'#4a5568',padding:'2.5rem',fontSize:'.875rem'}}>
                          No users match your filters
                        </td>
                      </tr>
                    ) : paginated.map(u => {
                      const lvlPal = LEVEL_PALETTE[u.level] ?? LEVEL_PALETTE.Beginner
                      return (
                        <tr key={u.id}>
                          <td>
                            <div className="user-cell">
                              <div className="user-cell-avatar">
                                {u.full_name.charAt(0).toUpperCase()}
                              </div>
                              <div>
                                <div className="user-cell-name">{u.full_name}</div>
                                <div className="user-cell-email">{u.email}</div>
                              </div>
                            </div>
                          </td>
                          <td>
                            <span className={`role-badge ${u.role === 'admin' ? 'role-admin' : 'role-user'}`}>
                              {u.role === 'admin' ? '👑 Admin' : 'User'}
                            </span>
                          </td>
                          <td>
                            <span className="level-badge" style={{
                              background: lvlPal.bg,
                              color:      lvlPal.color,
                              border:    `1px solid ${lvlPal.border}`,
                            }}>
                              {u.level}
                            </span>
                          </td>
                          <td style={{fontWeight:700,color:'#fbbf24'}}>{u.total_points.toLocaleString()}</td>
                          <td style={{color:'#94a3b8'}}>
                            {u.streak_days > 0
                              ? <span style={{color:'#f97316',fontWeight:700}}>🔥 {u.streak_days}d</span>
                              : '—'}
                          </td>

                          <td style={{color:'#64748b',fontSize:'.8rem'}}>{fmtDate(u.created_at)}</td>
                          <td style={{color:'#64748b',fontSize:'.8rem'}}>{timeAgo(u.last_sign_in_at)}</td>
                        </tr>
                      )
                    })}
                  </tbody>
                </table>

                {/* Pagination */}
                <div className="pagination">
                  <span className="page-info">Page {page} of {pageCount}</span>
                  <button className="page-btn" disabled={page===1} onClick={()=>setPage(p=>p-1)}>‹</button>
                  {Array.from({length:pageCount},(_,i)=>i+1)
                    .filter(p => Math.abs(p - page) <= 2 || p === 1 || p === pageCount)
                    .reduce<(number|'…')[]>((acc, p, i, arr) => {
                      if (i > 0 && (p as number) - (arr[i-1] as number) > 1) acc.push('…')
                      acc.push(p)
                      return acc
                    }, [])
                    .map((p, i) => p === '…'
                      ? <span key={i} className="page-info">…</span>
                      : <button key={i} className={`page-btn${p===page?' active':''}`} onClick={()=>setPage(p as number)}>{p}</button>
                    )
                  }
                  <button className="page-btn" disabled={page===pageCount} onClick={()=>setPage(p=>p+1)}>›</button>
                </div>
              </div>
            </div>
          </>)}

          {/* ── DETECTIONS TAB ─────────────────────────────────────────────── */}
          {activeTab === 'detections' && (() => {
            const detectionLogs = auditLogs.filter(log => log.event === 'detect_scan')
            return (
              <div className="panel-card">
                <div className="panel-title" style={{marginBottom:'1rem'}}>
                  <span className="panel-title-accent" />
                  Detailed Voice Detections
                  <span style={{marginLeft:'auto',color:'#4a5568',fontSize:'.75rem',fontWeight:500}}>
                    {detectionLogs.length} recent scans
                  </span>
                </div>
                <div className="data-table-wrap">
                  <table className="data-table">
                    <thead>
                      <tr>
                        <th>Date & Time</th>
                        <th>User ID</th>
                        <th>Label</th>
                        <th>Confidence</th>
                        <th>Filename</th>
                        <th>File Size</th>
                      </tr>
                    </thead>
                    <tbody>
                      {detectionLogs.length === 0 ? (
                        <tr>
                          <td colSpan={6} style={{textAlign:'center',color:'#4a5568',padding:'2.5rem',fontSize:'.875rem'}}>
                            No AI scans recorded yet
                          </td>
                        </tr>
                      ) : detectionLogs.map(log => {
                        const m = (log.meta || {}) as any
                        const isSpoof = m.label === 'spoof'
                        return (
                          <tr key={log.id}>
                            <td style={{color:'#64748b',fontSize:'.8rem'}}>
                              {new Date(log.created_at).toLocaleString('en-MY', { month:'short', day:'2-digit', hour:'2-digit', minute:'2-digit' })}
                            </td>
                            <td style={{color:'#94a3b8',fontSize:'.8rem'}}>{log.user_id ? log.user_id.slice(0,8) + '…' : 'Anonymous'}</td>
                            <td>
                              <span className="level-badge" style={{
                                background: isSpoof ? 'rgba(248,113,113,.15)' : 'rgba(192,132,252,.15)',
                                color:      isSpoof ? '#f87171' : '#c084fc',
                                border:    `1px solid ${isSpoof ? 'rgba(248,113,113,.3)' : 'rgba(192,132,252,.3)'}`,
                              }}>
                                {isSpoof ? '🚨 SPOOF' : '✅ BONA-FIDE'}
                              </span>
                            </td>
                            <td style={{fontWeight:700,color:isSpoof ? '#f87171' : '#c084fc'}}>{m.confidence ? `${m.confidence}%` : '—'}</td>
                            <td style={{color:'#cbd5e1',fontSize:'.85rem'}}>{m.filename || '—'}</td>
                            <td style={{color:'#64748b',fontSize:'.8rem'}}>{m.size ? `${(m.size / 1024).toFixed(1)} KB` : '—'}</td>
                          </tr>
                        )
                      })}
                    </tbody>
                  </table>
                </div>
              </div>
            )
          })()}

          {/* ── VIDEOS TAB ─────────────────────────────────────────────────── */}
          {activeTab === 'videos' && (
            <div className="panel-card">
              <div className="panel-title" style={{marginBottom:'1rem', display:'flex', justifyContent:'space-between'}}>
                <div>
                  <span className="panel-title-accent" />
                  Manage Educational Videos
                </div>
                <button
                  onClick={() => setShowAddVid(!showAddVid)}
                  style={{
                    background:'linear-gradient(135deg,#6366f1,#8b5cf6)', color:'white',
                    border:'none', borderRadius:8, padding:'6px 14px', fontSize:'.8rem', fontWeight:700, cursor:'pointer'
                  }}
                >
                  {showAddVid ? 'Cancel' : '+ Add Video'}
                </button>
              </div>

              {showAddVid && (
                <div style={{background:'rgba(255,255,255,.05)', padding:20, borderRadius:14, marginBottom:20, border:'1px solid rgba(255,255,255,.08)'}}>
                  <div style={{fontSize:'.78rem', color:'#94a3b8', marginBottom:14, lineHeight:1.5}}>
                    Paste any YouTube link (e.g. <code style={{background:'rgba(255,255,255,.07)',padding:'1px 6px',borderRadius:4,color:'#a5b4fc'}}>https://youtu.be/ABC123</code>) then click <strong style={{color:'#e2e8f0'}}>Fetch Info</strong> to auto-fill title and verify the video is public.
                  </div>

                  {/* Step 1: URL input + Fetch button */}
                  <div style={{display:'flex', gap:8, marginBottom:16}}>
                    <div style={{flex:1}}>
                      <label style={{fontSize:'.75rem', color:'#94a3b8', display:'block', marginBottom:4}}>YouTube URL or Video ID *</label>
                      <input
                        value={vidUrlInput}
                        onChange={e => { setVidUrlInput(e.target.value); setThumbValid(null); setVidError('') }}
                        onKeyDown={e => e.key === 'Enter' && fetchVideoMeta(vidUrlInput)}
                        placeholder="https://youtu.be/4HmBZF_09V4  or  4HmBZF_09V4"
                        style={{width:'100%', padding:'9px 12px', background:'rgba(0,0,0,.25)', border:`1px solid ${thumbValid===true ? 'rgba(52,211,153,.5)' : thumbValid===false ? 'rgba(248,113,113,.5)' : 'rgba(255,255,255,.12)'}`, borderRadius:8, color:'white', fontSize:'.85rem', fontFamily:"'Inter',sans-serif"}}
                      />
                    </div>
                    <div style={{display:'flex', alignItems:'flex-end'}}>
                      <button
                        onClick={() => fetchVideoMeta(vidUrlInput)}
                        disabled={isFetching || !vidUrlInput.trim()}
                        style={{padding:'9px 18px', background:'linear-gradient(135deg,#6366f1,#8b5cf6)', color:'white', border:'none', borderRadius:8, fontSize:'.85rem', fontWeight:700, cursor:isFetching||!vidUrlInput.trim()?'default':'pointer', opacity:isFetching||!vidUrlInput.trim()?0.55:1, whiteSpace:'nowrap', fontFamily:"'Inter',sans-serif"}}
                      >
                        {isFetching ? '⏳ Fetching…' : '🔍 Fetch Info'}
                      </button>
                    </div>
                  </div>

                  {/* Step 2: preview + editable fields (shown once ID is resolved) */}
                  {newVid.id && (
                    <div style={{display:'grid', gridTemplateColumns:'120px 1fr', gap:16, alignItems:'start', background:'rgba(0,0,0,.15)', padding:14, borderRadius:10, marginBottom:14}}>
                      {/* Thumbnail */}
                      <div>
                        <div style={{fontSize:'.7rem', color:'#4a5568', marginBottom:6, fontWeight:700, textTransform:'uppercase', letterSpacing:'.06em'}}>Preview</div>
                        <div style={{position:'relative', borderRadius:8, overflow:'hidden', aspectRatio:'16/9', background:'#000'}}>
                          <img
                            src={`https://img.youtube.com/vi/${newVid.id}/mqdefault.jpg`}
                            alt="thumbnail"
                            style={{width:'100%', height:'100%', objectFit:'cover', display:'block'}}
                            onError={() => setThumbValid(false)}
                            onLoad={() => { if (thumbValid !== false) setThumbValid(true) }}
                          />
                          {thumbValid === true && (
                            <div style={{position:'absolute', top:4, right:4, background:'rgba(52,211,153,.9)', borderRadius:'50%', width:20, height:20, display:'flex', alignItems:'center', justifyContent:'center', fontSize:'.7rem'}}>✓</div>
                          )}
                          {thumbValid === false && (
                            <div style={{position:'absolute', inset:0, background:'rgba(248,113,113,.15)', display:'flex', alignItems:'center', justifyContent:'center', fontSize:'.65rem', color:'#f87171', fontWeight:700, textAlign:'center', padding:4}}>Unavailable</div>
                          )}
                        </div>
                        <div style={{fontSize:'.65rem', color:'#4a5568', marginTop:4, textAlign:'center', fontFamily:'monospace'}}>{newVid.id}</div>
                      </div>
                      {/* Editable metadata */}
                      <div style={{display:'flex', flexDirection:'column', gap:10}}>
                        <div>
                          <label style={{fontSize:'.72rem', color:'#94a3b8', display:'block', marginBottom:3}}>Title (auto-filled, editable)</label>
                          <input
                            value={newVid.title} onChange={e=>setNewVid({...newVid, title: e.target.value})}
                            placeholder="Video title"
                            style={{width:'100%', padding:'7px 10px', background:'rgba(0,0,0,.2)', border:'1px solid rgba(255,255,255,.1)', borderRadius:7, color:'white', fontSize:'.84rem', fontFamily:"'Inter',sans-serif"}}
                          />
                        </div>
                        <div>
                          <label style={{fontSize:'.72rem', color:'#94a3b8', display:'block', marginBottom:3}}>Channel (auto-filled, editable)</label>
                          <input
                            value={newVid.channel} onChange={e=>setNewVid({...newVid, channel: e.target.value})}
                            placeholder="Channel name"
                            style={{width:'100%', padding:'7px 10px', background:'rgba(0,0,0,.2)', border:'1px solid rgba(255,255,255,.1)', borderRadius:7, color:'white', fontSize:'.84rem', fontFamily:"'Inter',sans-serif"}}
                          />
                        </div>
                        <div>
                          <label style={{fontSize:'.72rem', color:'#94a3b8', display:'block', marginBottom:3}}>Tag (category label)</label>
                          <input
                            value={newVid.tag} onChange={e=>setNewVid({...newVid, tag: e.target.value})}
                            placeholder="e.g. 🇲🇾 Malay  or  AI Scam  or  Documentary"
                            style={{width:'100%', padding:'7px 10px', background:'rgba(0,0,0,.2)', border:'1px solid rgba(255,255,255,.1)', borderRadius:7, color:'white', fontSize:'.84rem', fontFamily:"'Inter',sans-serif"}}
                          />
                        </div>
                      </div>
                    </div>
                  )}

                  {vidError && (
                    <div style={{color:'#f87171', fontSize:'.82rem', marginBottom:12, padding:'8px 12px', background:'rgba(248,113,113,.08)', border:'1px solid rgba(248,113,113,.2)', borderRadius:8}}>
                      ⚠️ {vidError}
                    </div>
                  )}

                  <div style={{display:'flex', gap:8, alignItems:'center'}}>
                    <button
                      onClick={handleAddVideo}
                      disabled={isAddingVid || !newVid.id || !newVid.title || !newVid.channel || !newVid.tag || thumbValid === false}
                      style={{background:thumbValid===true?'#34d399':'rgba(52,211,153,.35)', color:thumbValid===true?'#022c22':'#94a3b8', border:'none', borderRadius:8, padding:'9px 20px', fontSize:'.88rem', fontWeight:700, cursor:(isAddingVid||thumbValid!==true)?'default':'pointer', opacity:(isAddingVid||!newVid.id||!newVid.title||!newVid.channel||!newVid.tag||thumbValid!==true)?0.55:1, fontFamily:"'Inter',sans-serif"}}
                    >
                      {isAddingVid ? '⏳ Saving…' : '✅ Save Video'}
                    </button>
                    {thumbValid === true && !isAddingVid && (newVid.title && newVid.channel && newVid.tag) && (
                      <span style={{fontSize:'.78rem', color:'#34d399'}}>Video verified & ready to save</span>
                    )}
                    {thumbValid === true && !isAddingVid && (!newVid.title || !newVid.channel || !newVid.tag) && (
                      <span style={{fontSize:'.78rem', color:'#fbbf24'}}>⚠️ Please fill in all fields (Title, Channel, Tag) to save</span>
                    )}
                    {thumbValid === false && (
                      <span style={{fontSize:'.78rem', color:'#f87171'}}>Video is unavailable — cannot save</span>
                    )}
                  </div>
                </div>
              )}

              <div className="data-table-wrap">
                <table className="data-table">
                  <thead>
                    <tr>
                      <th>Thumbnail</th>
                      <th>Title</th>
                      <th>Channel</th>
                      <th>Tag</th>
                      <th style={{textAlign:'right'}}>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {videos.map(v => (
                      <tr key={v.id}>
                        <td>
                          <img src={`https://img.youtube.com/vi/${v.videoId}/mqdefault.jpg`} alt={v.title} style={{width:100, borderRadius:6}} />
                        </td>
                        <td style={{fontWeight:600, color:'#e2e8f0'}}>{v.title}</td>
                        <td style={{color:'#94a3b8'}}>{v.channel}</td>
                        <td>
                          <span style={{background:'rgba(255,255,255,.05)', padding:'4px 8px', borderRadius:6, fontSize:'.75rem', border:'1px solid rgba(255,255,255,.1)'}}>{v.tag}</span>
                        </td>
                        <td style={{textAlign:'right'}}>
                          <button
                            onClick={() => handleRemoveVideo(v.id)}
                            style={{background:'rgba(248,113,113,.15)', color:'#f87171', border:'1px solid rgba(248,113,113,.3)', borderRadius:6, padding:'4px 8px', fontSize:'.75rem', fontWeight:600, cursor:'pointer'}}
                          >
                            Remove
                          </button>
                        </td>
                      </tr>
                    ))}
                    {videos.length === 0 && (
                      <tr>
                        <td colSpan={5} style={{textAlign:'center', padding:'2rem', color:'#94a3b8', fontSize:'.85rem'}}>No videos available.</td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* ── ALERTS TAB ─────────────────────────────────────────────────── */}
          {activeTab === 'alerts' && (
            <div className="panel-card">
              <div style={{display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:'1.5rem'}}>
                <div className="panel-title" style={{marginBottom:0}}>
                  <span className="panel-title-accent" />
                  Manage Global Alerts
                </div>
                <button
                  onClick={() => setShowAddAlert(!showAddAlert)}
                  style={{background:'linear-gradient(135deg,#667eea,#764ba2)', color:'white', border:'none', padding:'8px 16px', borderRadius:8, fontSize:'.85rem', fontWeight:700, cursor:'pointer'}}
                >
                  {showAddAlert ? 'Close' : '+ Add Alert'}
                </button>
              </div>

              {showAddAlert && (
                <div style={{background:'rgba(255,255,255,.03)', padding:'1.5rem', borderRadius:12, marginBottom:'1.5rem', border:'1px solid rgba(255,255,255,.06)'}}>
                  <div style={{display:'grid', gridTemplateColumns:'1fr 1fr', gap:12, marginBottom:12}}>
                    <input type="text" placeholder="Title" value={newAlert.title} onChange={e=>setNewAlert({...newAlert, title: e.target.value})} className="search-input" />
                    <select value={newAlert.type} onChange={e=>setNewAlert({...newAlert, type: e.target.value as any})} className="filter-select">
                      <option value="critical">Critical</option>
                      <option value="warning">Warning</option>
                      <option value="trend">Trend</option>
                      <option value="info">Info</option>
                      <option value="tip">Tip</option>
                    </select>
                    <input type="text" placeholder="Source (e.g., PDRM)" value={newAlert.source} onChange={e=>setNewAlert({...newAlert, source: e.target.value})} className="search-input" />
                    <input type="text" placeholder="Category (e.g., scam, vishing)" value={newAlert.category} onChange={e=>setNewAlert({...newAlert, category: e.target.value})} className="search-input" />
                    <input type="text" placeholder="Action Label (optional)" value={newAlert.actionLabel} onChange={e=>setNewAlert({...newAlert, actionLabel: e.target.value})} className="search-input" />
                    <input type="text" placeholder="Action URL (optional)" value={newAlert.actionUrl} onChange={e=>setNewAlert({...newAlert, actionUrl: e.target.value})} className="search-input" />
                    <input type="text" placeholder="Tags (comma separated)" value={newAlert.tags} onChange={e=>setNewAlert({...newAlert, tags: e.target.value as any})} className="search-input" style={{gridColumn:'span 2'}} />
                    <textarea placeholder="Alert Body/Description" value={newAlert.body} onChange={e=>setNewAlert({...newAlert, body: e.target.value})} className="search-input" rows={3} style={{gridColumn:'span 2', resize:'vertical'}} />
                  </div>
                  <button onClick={handleAddAlert} disabled={isAddingAlert} style={{background:'#34d399', color:'#064e3b', border:'none', padding:'8px 16px', borderRadius:8, fontSize:'.85rem', fontWeight:700, cursor:isAddingAlert?'not-allowed':'pointer'}}>
                    {isAddingAlert ? 'Saving...' : 'Save Alert'}
                  </button>
                </div>
              )}

              <div className="data-table-wrap" style={{overflowX:'auto'}}>
                <table className="data-table">
                  <thead>
                    <tr>
                      <th>Type</th>
                      <th>Alert Details</th>
                      <th>Tags</th>
                      <th style={{textAlign:'right'}}>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {alerts.map(a => (
                      <tr key={a.id}>
                        <td>
                          <span style={{background:a.type==='critical'?'rgba(239,68,68,.15)':a.type==='warning'?'rgba(245,158,11,.15)':'rgba(59,130,246,.15)', color:a.type==='critical'?'#ef4444':a.type==='warning'?'#f59e0b':'#3b82f6', padding:'4px 8px', borderRadius:6, fontSize:'.7rem', fontWeight:700, textTransform:'uppercase'}}>
                            {a.type}
                          </span>
                        </td>
                        <td>
                          <div style={{fontWeight:600, color:'#e2e8f0', marginBottom:4}}>{a.title}</div>
                          <div style={{fontSize:'.75rem', color:'#94a3b8'}}>{a.body.substring(0, 100)}...</div>
                          <div style={{fontSize:'.7rem', color:'#64748b', marginTop:4}}>Source: {a.source}</div>
                        </td>
                        <td>
                          <div style={{display:'flex', gap:4, flexWrap:'wrap', maxWidth:150}}>
                            {a.tags?.map(t => <span key={t} style={{background:'rgba(255,255,255,.05)', padding:'2px 6px', borderRadius:4, fontSize:'.65rem'}}>{t}</span>)}
                          </div>
                        </td>
                        <td style={{textAlign:'right'}}>
                          <div style={{display:'flex', gap:8, justifyContent:'flex-end'}}>
                            <button onClick={() => handleSendPush(a)} disabled={isSendingPush} style={{background:'rgba(167,139,250,.15)', color:'#a78bfa', border:'1px solid rgba(167,139,250,.3)', borderRadius:6, padding:'4px 8px', fontSize:'.75rem', fontWeight:600, cursor:isSendingPush?'not-allowed':'pointer'}}>
                              Push
                            </button>
                            <button onClick={() => handleRemoveAlert(a.id)} style={{background:'rgba(248,113,113,.15)', color:'#f87171', border:'1px solid rgba(248,113,113,.3)', borderRadius:6, padding:'4px 8px', fontSize:'.75rem', fontWeight:600, cursor:'pointer'}}>
                              Del
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                    {alerts.length === 0 && (
                      <tr><td colSpan={4} style={{textAlign:'center', padding:'2rem', color:'#94a3b8', fontSize:'.85rem'}}>No alerts found.</td></tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* ── AUDIT LOGS TAB ─────────────────────────────────────────────── */}
          {activeTab === 'logs' && (
            <div className="panel-card">
              <div className="panel-title" style={{marginBottom:'1rem'}}>
                <span className="panel-title-accent" />
                Security Event Log
                <span style={{marginLeft:'auto',color:'#4a5568',fontSize:'.75rem',fontWeight:500}}>
                  Last 50 events
                </span>
              </div>
              <div className="audit-log" style={{maxHeight:'70vh'}}>
                {auditLogs.map(log => {
                  const pal = EVENT_PALETTE[log.event] ?? { color:'#94a3b8', bg:'rgba(148,163,184,.12)' }
                  const metaStr = log.meta && Object.keys(log.meta).length > 0
                    ? Object.entries(log.meta).map(([k,v])=>`${k}: ${String(v)}`).join(' · ')
                    : null
                  return (
                    <div key={log.id} className="log-row">
                      <span className="log-event-badge" style={{background:pal.bg, color:pal.color}}>
                        {log.event.replace(/_/g,' ')}
                      </span>
                      <div className="log-meta">
                        <div className="log-detail">
                          {log.user_id ? `UID: ${log.user_id.slice(0,8)}…` : 'Anonymous'}
                          {log.ip_address ? ` · ${log.ip_address}` : ''}
                          {metaStr ? ` · ${metaStr.slice(0,80)}` : ''}
                        </div>
                      </div>
                      <span className="log-time">
                        {new Date(log.created_at).toLocaleString('en-MY', {
                          month:'short', day:'2-digit', hour:'2-digit', minute:'2-digit'
                        })}
                      </span>
                    </div>
                  )
                })}
                {auditLogs.length === 0 && (
                  <div style={{textAlign:'center',color:'#4a5568',padding:'3rem',fontSize:'.875rem'}}>
                    No audit events recorded yet
                  </div>
                )}
              </div>
            </div>
          )}

        </div>
      </main>
      </div>{/* flex row wrapper */}
    </div>
  )
}
