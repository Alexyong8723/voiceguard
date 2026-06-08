'use client'

import { useState, useMemo } from 'react'
import { logout } from '@/app/auth/actions'
import type {
  AdminUser,
  AdminStats,
  AuditLogEntry,
  UsersByLevel,
  DailyActivity,
} from './admin.actions'

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
}

type SortKey = 'full_name' | 'email' | 'level' | 'total_points' | 'streak_days' | 'created_at' | 'last_sign_in_at'
type NavTab  = 'overview' | 'users' | 'logs'

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
  adminName, adminEmail, users, stats, auditLogs, usersByLevel, dailyActivity,
}: Props) {
  const [activeTab,   setActiveTab]   = useState<NavTab>('overview')
  const [search,      setSearch]      = useState('')
  const [sortKey,     setSortKey]     = useState<SortKey>('created_at')
  const [sortDir,     setSortDir]     = useState<'asc' | 'desc'>('desc')
  const [page,        setPage]        = useState(1)
  const [roleFilter,  setRoleFilter]  = useState<'all' | 'admin' | 'user'>('all')
  const [levelFilter, setLevelFilter] = useState<string>('all')
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
        @media(max-width:768px){
          .admin-sidebar { display:none; }
          .admin-content { padding:1rem; }
          .admin-topbar  { padding:.875rem 1rem; }
          .kpi-grid      { grid-template-columns:repeat(2,1fr); }
        }
        @media(max-width:480px){
          .kpi-grid { grid-template-columns:1fr; }
        }
      `}</style>

      {/* ── Sidebar ──────────────────────────────────────────────────────────── */}
      <aside className="admin-sidebar">
        <div className="sidebar-logo">
          <div className="sidebar-logo-icon"><ShieldIcon s={18} /></div>
          <div>
            <div className="sidebar-logo-text">VoiceGuard</div>
            <div className="sidebar-admin-badge">Admin</div>
          </div>
        </div>

        <div className="sidebar-section-label">Navigation</div>
        <button className={`nav-btn${activeTab==='overview'?' active':''}`} onClick={()=>setActiveTab('overview')}>
          <GridIcon s={18} />Overview
        </button>
        <button className={`nav-btn${activeTab==='users'?' active':''}`} onClick={()=>setActiveTab('users')}>
          <UsersIcon s={18} />Users
          <span style={{marginLeft:'auto',background:'rgba(102,126,234,.2)',color:'#a5b4fc',fontSize:'.7rem',fontWeight:700,padding:'2px 7px',borderRadius:6}}>
            {users.length}
          </span>
        </button>
        <button className={`nav-btn${activeTab==='logs'?' active':''}`} onClick={()=>setActiveTab('logs')}>
          <LogFileIcon s={18} />Audit Logs
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
                                          '📋 Audit Logs'}
            </div>
            <div className="topbar-subtitle">
              {activeTab === 'overview'
                ? `${stats.totalUsers} total users · ${stats.activeToday} active today`
                : activeTab === 'users'
                ? `${filtered.length} user${filtered.length !== 1 ? 's' : ''} found`
                : `${auditLogs.length} recent events`}
            </div>
          </div>
          <div className="topbar-time">
            {new Date().toLocaleDateString('en-MY', { weekday:'short', day:'2-digit', month:'short', year:'numeric' })}
          </div>
        </div>

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
    </div>
  )
}
