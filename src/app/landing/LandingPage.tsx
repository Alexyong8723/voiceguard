'use client'

import { useState, useEffect, useRef } from 'react'
import Link from 'next/link'

// ── Icons ─────────────────────────────────────────────────────────────────────
const ShieldIcon = ({ size = 24, color = "currentColor" }: { size?: number, color?: string }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
  </svg>
)
const MicIcon = ({ size = 24 }: { size?: number }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M12 1a3 3 0 0 0-3 3v8a3 3 0 0 0 6 0V4a3 3 0 0 0-3-3z" />
    <path d="M19 10v2a7 7 0 0 1-14 0v-2" />
    <line x1="12" y1="19" x2="12" y2="23" /><line x1="8" y1="23" x2="16" y2="23" />
  </svg>
)
const ZapIcon = ({ size = 24 }: { size?: number }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2" />
  </svg>
)
const BellIcon = ({ size = 24 }: { size?: number }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9" />
    <path d="M13.73 21a2 2 0 0 1-3.46 0" />
  </svg>
)
const CheckIcon = ({ size = 18 }: { size?: number }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
    <polyline points="20 6 9 17 4 12" />
  </svg>
)
const ArrowRightIcon = ({ size = 18 }: { size?: number }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
    <line x1="5" y1="12" x2="19" y2="12" /><polyline points="12 5 19 12 12 19" />
  </svg>
)
const GlobeIcon = ({ size = 24 }: { size?: number }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="12" cy="12" r="10" /><line x1="2" y1="12" x2="22" y2="12" />
    <path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z" />
  </svg>
)
const BookIcon = ({ size = 24 }: { size?: number }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z" />
    <path d="M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z" />
  </svg>
)
const UsersIcon = ({ size = 24 }: { size?: number }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" /><circle cx="9" cy="7" r="4" />
    <path d="M23 21v-2a4 4 0 0 0-3-3.87" /><path d="M16 3.13a4 4 0 0 1 0 7.75" />
  </svg>
)
const LockIcon = ({ size = 24 }: { size?: number }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
    <path d="M7 11V7a5 5 0 0 1 10 0v4" />
  </svg>
)
const MenuIcon = () => (
  <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
    <line x1="3" y1="6" x2="21" y2="6"/><line x1="3" y1="12" x2="21" y2="12"/><line x1="3" y1="18" x2="21" y2="18"/>
  </svg>
)
const CloseIcon = () => (
  <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
    <line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>
  </svg>
)

// ── Animated waveform bars ────────────────────────────────────────────────────
function Waveform({ active = true, color = '#ffffff', bars = 28 }: { active?: boolean; color?: string; bars?: number }) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 3, height: 48 }}>
      {Array.from({ length: bars }, (_, i) => (
        <div
          key={i}
          style={{
            width: 3,
            borderRadius: 99,
            background: color,
            opacity: active ? 0.85 : 0.25,
            animation: active ? `wave ${0.8 + (i % 5) * 0.15}s ease-in-out ${i * 0.04}s infinite alternate` : 'none',
            height: active ? `${16 + Math.sin(i * 0.7) * 14 + Math.cos(i * 1.3) * 8}px` : '8px',
            transition: 'height 0.4s ease',
          }}
        />
      ))}
    </div>
  )
}

// ── Animated counter ──────────────────────────────────────────────────────────
function Counter({ target, suffix = '', duration = 2000 }: { target: number; suffix?: string; duration?: number }) {
  const [count, setCount] = useState(0)
  const ref = useRef<HTMLSpanElement>(null)
  const started = useRef(false)

  useEffect(() => {
    const observer = new IntersectionObserver(([entry]) => {
      if (entry.isIntersecting && !started.current) {
        started.current = true
        const start = Date.now()
        const tick = () => {
          const elapsed = Date.now() - start
          const progress = Math.min(elapsed / duration, 1)
          const ease = 1 - Math.pow(1 - progress, 3)
          setCount(Math.floor(ease * target))
          if (progress < 1) requestAnimationFrame(tick)
        }
        requestAnimationFrame(tick)
      }
    }, { threshold: 0.5 })
    if (ref.current) observer.observe(ref.current)
    return () => observer.disconnect()
  }, [target, duration])

  return <span ref={ref}>{count.toLocaleString()}{suffix}</span>
}

// ── Main Component ────────────────────────────────────────────────────────────
export default function LandingPage() {
  const [mobileOpen, setMobileOpen] = useState(false)
  const [scrolled, setScrolled] = useState(false)

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 40)
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  const navLinks = [
    { label: 'Features', href: '#features' },
    { label: 'How It Works', href: '#how-it-works' },
    { label: 'Threats', href: '#threats' },
    { label: 'About', href: '#about' },
  ]

  return (
    <div style={{ fontFamily: "'Inter', sans-serif", background: '#f4f6fb', color: '#0d1a3a', overflowX: 'hidden' }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700;800;900&display=swap');
        @keyframes wave {
          from { transform: scaleY(1); }
          to   { transform: scaleY(1.6); }
        }
        @keyframes fadeUp {
          from { opacity:0; transform:translateY(32px); }
          to   { opacity:1; transform:translateY(0); }
        }
        @keyframes fadeIn {
          from { opacity:0; } to { opacity:1; }
        }
        @keyframes pulse-ring {
          0%   { transform: scale(1);   opacity: 0.6; }
          100% { transform: scale(1.8); opacity: 0; }
        }
        @keyframes float {
          0%,100% { transform: translateY(0px); }
          50%      { transform: translateY(-12px); }
        }
        @keyframes spin {
          to { transform: rotate(360deg); }
        }
        @keyframes shimmer-scan {
          0%   { top: 0%; opacity:0.9; }
          50%  { opacity: 0.6; }
          100% { top: 100%; opacity:0; }
        }
        .lp-nav-link {
          color: #3d5080; text-decoration: none; font-weight: 600; font-size: .93rem;
          padding: 6px 2px; position: relative; transition: color .2s;
        }
        .lp-nav-link::after {
          content:''; position:absolute; bottom:-2px; left:0; right:0; height:2px;
          background: #003580; border-radius:99px; transform:scaleX(0); transition:transform .2s;
        }
        .lp-nav-link:hover { color:#003580; }
        .lp-nav-link:hover::after { transform:scaleX(1); }
        .lp-btn-primary {
          display:inline-flex; align-items:center; gap:8px;
          background: linear-gradient(135deg, #003580, #1a4fa0);
          color: white; border: none; border-radius: 12px;
          padding: 14px 28px; font-size: .97rem; font-weight: 700;
          cursor: pointer; text-decoration: none; font-family: 'Inter', sans-serif;
          box-shadow: 0 6px 24px rgba(0,53,128,.35);
          transition: transform .2s, box-shadow .2s;
        }
        .lp-btn-primary:hover {
          transform: translateY(-2px);
          box-shadow: 0 10px 32px rgba(0,53,128,.45);
        }
        .lp-btn-outline {
          display:inline-flex; align-items:center; gap:8px;
          background: transparent; color: #003580;
          border: 2px solid rgba(0,53,128,.25); border-radius: 12px;
          padding: 13px 26px; font-size: .97rem; font-weight: 700;
          cursor: pointer; text-decoration: none; font-family: 'Inter', sans-serif;
          transition: border-color .2s, background .2s, transform .2s;
        }
        .lp-btn-outline:hover {
          border-color: #003580; background: rgba(0,53,128,.05);
          transform: translateY(-2px);
        }
        .lp-feature-card {
          background: #ffffff; border: 1px solid rgba(0,53,128,.1);
          border-radius: 20px; padding: 2rem;
          transition: transform .25s, box-shadow .25s, border-color .25s;
          cursor: default;
          animation: fadeUp .6s ease both;
        }
        .lp-feature-card:hover {
          transform: translateY(-6px);
          box-shadow: 0 16px 48px rgba(0,53,128,.12);
          border-color: rgba(0,53,128,.25);
        }
        .lp-step-card {
          background: #ffffff; border: 1px solid rgba(0,53,128,.1);
          border-radius: 20px; padding: 2rem 1.75rem;
          text-align: center; position: relative;
          transition: transform .25s, box-shadow .25s;
        }
        .lp-step-card:hover {
          transform: translateY(-4px);
          box-shadow: 0 12px 36px rgba(0,53,128,.10);
        }
        .threat-card {
          background: #fff; border: 1px solid rgba(0,53,128,.1);
          border-radius: 16px; padding: 1.5rem;
          transition: transform .2s, box-shadow .2s;
        }
        .threat-card:hover {
          transform: translateY(-3px);
          box-shadow: 0 10px 30px rgba(0,53,128,.10);
        }
        .lp-stat-card {
          background: rgba(255,255,255,.12); border: 1px solid rgba(255,255,255,.2);
          border-radius: 16px; padding: 1.75rem 2rem; text-align: center;
          backdrop-filter: blur(10px);
          transition: background .2s;
        }
        .lp-stat-card:hover { background: rgba(255,255,255,.18); }
        .mobile-menu {
          display: none;
          position: fixed; inset:0; background: rgba(0,20,60,.55);
          backdrop-filter: blur(6px); z-index: 200;
          align-items: flex-start; justify-content: flex-end;
        }
        .mobile-menu.open { display: flex; }
        .mobile-menu-panel {
          background: #fff; width: 280px; min-height: 100vh;
          padding: 1.5rem; display: flex; flex-direction: column; gap: 8px;
          box-shadow: -8px 0 40px rgba(0,30,80,.25);
          animation: fadeIn .2s ease;
        }
        .faq-item {
          background:#fff; border:1px solid rgba(0,53,128,.1); border-radius:14px;
          overflow: hidden; transition: box-shadow .2s;
        }
        .faq-item:hover { box-shadow: 0 4px 16px rgba(0,53,128,.08); }
        .faq-btn {
          width:100%; text-align:left; background:none; border:none; cursor:pointer;
          padding:1.25rem 1.5rem; display:flex; align-items:center; justify-content:space-between;
          gap:12px; font-family:'Inter',sans-serif; font-size:.97rem; font-weight:700;
          color:#0d1a3a;
        }
        .faq-answer {
          padding:0 1.5rem 1.25rem; font-size:.9rem; color:#3d5080; line-height:1.7;
        }
        @media(max-width:768px) {
          .lp-hero-title { font-size:2.4rem !important; }
          .lp-features-grid { grid-template-columns: 1fr !important; }
          .lp-steps-grid { grid-template-columns: 1fr !important; }
          .lp-threats-grid { grid-template-columns: 1fr !important; }
          .lp-stats-grid { grid-template-columns: 1fr 1fr !important; }
          .lp-hero-btns { flex-direction: column !important; }
          .lp-desktop-nav { display: none !important; }
          .lp-mobile-btn { display: flex !important; }
          .lp-hero-visual { display: none !important; }
          .lp-section-pad { padding: 4rem 1.25rem !important; }
          .lp-hero-pad { padding: 6rem 1.25rem 3rem !important; }
        }
      `}</style>

      {/* ── NAV ─────────────────────────────────────────────────────────────── */}
      <nav style={{
        position: 'fixed', top: 0, left: 0, right: 0, zIndex: 100,
        background: scrolled ? 'rgba(255,255,255,.95)' : 'transparent',
        backdropFilter: scrolled ? 'blur(12px)' : 'none',
        borderBottom: scrolled ? '1px solid rgba(0,53,128,.1)' : '1px solid transparent',
        transition: 'all .3s ease',
        boxShadow: scrolled ? '0 4px 24px rgba(0,53,128,.08)' : 'none',
      }}>
        <div style={{ maxWidth: 1200, margin: '0 auto', padding: '0 2rem', height: 68, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          {/* Logo */}
          <Link href="/" style={{ display: 'flex', alignItems: 'center', gap: 10, textDecoration: 'none' }}>
            <div style={{ width: 38, height: 38, borderRadius: 10, background: 'linear-gradient(135deg,#003580,#1a4fa0)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white', boxShadow: '0 4px 12px rgba(0,53,128,.3)' }}>
              <ShieldIcon size={18} />
            </div>
            <span style={{ fontSize: '1.2rem', fontWeight: 800, color: '#003580', letterSpacing: '-0.02em' }}>VoiceGuard</span>
          </Link>

          {/* Desktop nav */}
          <div className="lp-desktop-nav" style={{ display: 'flex', alignItems: 'center', gap: 32 }}>
            {navLinks.map(l => (
              <a key={l.label} href={l.href} className="lp-nav-link">{l.label}</a>
            ))}
          </div>

          {/* CTA buttons */}
          <div className="lp-desktop-nav" style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            <Link href="/login" style={{ color: '#003580', fontWeight: 700, fontSize: '.93rem', textDecoration: 'none', padding: '8px 16px', borderRadius: 10, transition: 'background .2s' }}
              onMouseEnter={e => (e.currentTarget.style.background = 'rgba(0,53,128,.06)')}
              onMouseLeave={e => (e.currentTarget.style.background = 'transparent')}>
              Sign In
            </Link>
            <Link href="/signup" className="lp-btn-primary" style={{ padding: '10px 22px', fontSize: '.9rem', borderRadius: 10 }}>
              Get Started Free
            </Link>
          </div>

          {/* Mobile hamburger */}
          <button className="lp-mobile-btn" style={{ display: 'none', background: 'none', border: 'none', cursor: 'pointer', color: '#003580', padding: 6, borderRadius: 8 }}
            onClick={() => setMobileOpen(true)}>
            <MenuIcon />
          </button>
        </div>
      </nav>

      {/* ── MOBILE MENU ─────────────────────────────────────────────────────── */}
      <div className={`mobile-menu${mobileOpen ? ' open' : ''}`} onClick={() => setMobileOpen(false)}>
        <div className="mobile-menu-panel" onClick={e => e.stopPropagation()}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
            <span style={{ fontWeight: 800, color: '#003580', fontSize: '1.1rem' }}>VoiceGuard</span>
            <button onClick={() => setMobileOpen(false)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#003580' }}><CloseIcon /></button>
          </div>
          {navLinks.map(l => (
            <a key={l.label} href={l.href} onClick={() => setMobileOpen(false)}
              style={{ display: 'block', padding: '14px 16px', borderRadius: 12, color: '#3d5080', fontWeight: 600, textDecoration: 'none', fontSize: '.97rem', transition: 'background .2s' }}
              onMouseEnter={e => (e.currentTarget.style.background = 'rgba(0,53,128,.06)')}
              onMouseLeave={e => (e.currentTarget.style.background = 'transparent')}>
              {l.label}
            </a>
          ))}
          <div style={{ marginTop: 'auto', paddingTop: '1.5rem', display: 'flex', flexDirection: 'column', gap: 10 }}>
            <Link href="/login" style={{ textAlign: 'center', padding: '14px', borderRadius: 12, color: '#003580', fontWeight: 700, textDecoration: 'none', border: '2px solid rgba(0,53,128,.2)' }}>Sign In</Link>
            <Link href="/signup" className="lp-btn-primary" style={{ justifyContent: 'center' }}>Get Started Free</Link>
          </div>
        </div>
      </div>

      {/* ── HERO ─────────────────────────────────────────────────────────────── */}
      <section style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', position: 'relative', overflow: 'hidden', background: 'linear-gradient(145deg, #eef2ff 0%, #f4f6fb 45%, #e8eeff 100%)' }}>
        {/* Background decorations */}
        <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: 4, background: 'linear-gradient(90deg,#003580 0%,#1a4fa0 50%,#CC0001 100%)', zIndex: 1 }} />
        <div style={{ position: 'absolute', top: '10%', right: '-5%', width: 500, height: 500, background: 'radial-gradient(circle, rgba(0,53,128,.07) 0%, transparent 70%)', borderRadius: '50%', pointerEvents: 'none' }} />
        <div style={{ position: 'absolute', bottom: '5%', left: '-5%', width: 400, height: 400, background: 'radial-gradient(circle, rgba(204,0,1,.04) 0%, transparent 70%)', borderRadius: '50%', pointerEvents: 'none' }} />
        {/* Grid */}
        <div style={{ position: 'absolute', inset: 0, backgroundImage: 'linear-gradient(rgba(0,53,128,.03) 1px,transparent 1px),linear-gradient(90deg,rgba(0,53,128,.03) 1px,transparent 1px)', backgroundSize: '40px 40px', pointerEvents: 'none' }} />

        <div className="lp-hero-pad" style={{ maxWidth: 1200, margin: '0 auto', padding: '8rem 2rem 4rem', width: '100%', display: 'grid', gridTemplateColumns: '1fr 1fr', alignItems: 'center', gap: '4rem', position: 'relative', zIndex: 2 }}>
          {/* Left: copy */}
          <div style={{ animation: 'fadeUp .7s ease both' }}>
            {/* Badge */}
            <div style={{ display: 'inline-flex', alignItems: 'center', gap: 7, background: 'rgba(204,0,1,.08)', border: '1px solid rgba(204,0,1,.2)', borderRadius: 99, padding: '5px 14px', marginBottom: '1.5rem' }}>
              <span style={{ width: 7, height: 7, borderRadius: '50%', background: '#CC0001', animation: 'pulse-ring 1.5s ease-out infinite', display: 'inline-block' }} />
              <span style={{ fontSize: '.78rem', fontWeight: 700, color: '#CC0001', letterSpacing: '.06em', textTransform: 'uppercase' }}>AI-Powered Protection · Malaysia</span>
            </div>

            <h1 className="lp-hero-title" style={{ fontSize: '3.4rem', fontWeight: 900, lineHeight: 1.12, letterSpacing: '-0.04em', color: '#0d1a3a', marginBottom: '1.5rem' }}>
              Stop Voice Scams{' '}
              <span style={{ background: 'linear-gradient(135deg,#003580,#1a4fa0)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>Before They</span>{' '}
              <span style={{ color: '#CC0001' }}>Strike</span>
            </h1>

            <p style={{ fontSize: '1.1rem', color: '#3d5080', lineHeight: 1.7, marginBottom: '2rem', maxWidth: 480 }}>
              VoiceGuard uses advanced AI to detect deepfake audio, vishing calls, and voice-cloning scams in real time — protecting you and your loved ones from modern cyber fraud.
            </p>

            <div className="lp-hero-btns" style={{ display: 'flex', gap: 14, flexWrap: 'wrap', marginBottom: '2.5rem' }}>
              <Link href="/signup" className="lp-btn-primary">
                Start Free <ArrowRightIcon size={16} />
              </Link>
              <a href="#how-it-works" className="lp-btn-outline">
                See How It Works
              </a>
            </div>

            {/* Trust badges */}
            <div style={{ display: 'flex', gap: 20, flexWrap: 'wrap' }}>
              {['Free to use', 'MFA secured', 'Malaysia-first'].map(b => (
                <div key={b} style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: '.83rem', color: '#3d5080', fontWeight: 600 }}>
                  <span style={{ color: '#00875a', display: 'flex' }}><CheckIcon size={15} /></span>{b}
                </div>
              ))}
            </div>
          </div>

          {/* Right: visual */}
          <div className="lp-hero-visual" style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', animation: 'fadeUp .9s ease .2s both' }}>
            {/* Shield visual */}
            <div style={{ position: 'relative', width: 380, height: 420 }}>
              {/* Glowing rings */}
              {[1.4, 1.2, 1.0].map((scale, i) => (
                <div key={i} style={{
                  position: 'absolute', inset: 0, borderRadius: '50%',
                  border: `1px solid rgba(0,53,128,${0.08 - i * 0.02})`,
                  transform: `scale(${scale})`, margin: 'auto',
                  top: '50%', left: '50%', translate: '-50% -50%',
                  width: 260, height: 260,
                }} />
              ))}

              {/* Main shield */}
              <div style={{
                position: 'absolute', top: '50%', left: '50%', translate: '-50% -50%',
                width: 200, height: 200, borderRadius: '50%',
                background: 'linear-gradient(135deg,#003580,#1a4fa0)',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                boxShadow: '0 20px 60px rgba(0,53,128,.4), 0 0 0 1px rgba(255,255,255,.1)',
                animation: 'float 4s ease-in-out infinite',
              }}>
                <ShieldIcon size={80} color="rgba(255,255,255,.9)" />
              </div>

              {/* Floating threat cards */}
              {[
                { label: 'Deepfake Detected', icon: '🎭', x: -20, y: 60, color: '#CC0001', delay: '0s' },
                { label: 'Vishing Blocked', icon: '📵', x: 180, y: 80, color: '#003580', delay: '.4s' },
                { label: 'AI Voice Clone', icon: '🤖', x: 60, y: 300, color: '#f5a800', delay: '.8s' },
              ].map(c => (
                <div key={c.label} style={{
                  position: 'absolute', left: c.x, top: c.y,
                  background: '#ffffff', border: `1px solid ${c.color}22`,
                  borderLeft: `3px solid ${c.color}`,
                  borderRadius: 12, padding: '10px 14px',
                  boxShadow: '0 8px 24px rgba(0,30,80,.12)',
                  display: 'flex', alignItems: 'center', gap: 8,
                  animation: `float 4s ease-in-out ${c.delay} infinite`,
                  whiteSpace: 'nowrap', zIndex: 3,
                }}>
                  <span style={{ fontSize: '1.1rem' }}>{c.icon}</span>
                  <div>
                    <div style={{ fontSize: '.72rem', color: c.color, fontWeight: 700 }}>ALERT</div>
                    <div style={{ fontSize: '.82rem', fontWeight: 700, color: '#0d1a3a' }}>{c.label}</div>
                  </div>
                </div>
              ))}

              {/* Waveform at bottom */}
              <div style={{ position: 'absolute', bottom: 20, left: '50%', transform: 'translateX(-50%)' }}>
                <Waveform bars={22} color="#003580" />
              </div>
            </div>
          </div>
        </div>

        {/* Scroll indicator */}
        <div style={{ position: 'absolute', bottom: 32, left: '50%', transform: 'translateX(-50%)', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 6, color: '#8898bb', fontSize: '.75rem', fontWeight: 600, animation: 'fadeIn 2s ease 1s both' }}>
          <span>Scroll to explore</span>
          <div style={{ width: 1.5, height: 32, background: 'rgba(0,53,128,.2)', borderRadius: 99 }} />
        </div>
      </section>

      {/* ── STATS BAR ────────────────────────────────────────────────────────── */}
      <section style={{ background: 'linear-gradient(135deg,#003580,#002460)', padding: '3.5rem 2rem' }}>
        <div className="lp-stats-grid" style={{ maxWidth: 1100, margin: '0 auto', display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', gap: '1.5rem' }}>
          {[
            { value: 98, suffix: '%', label: 'Detection Accuracy' },
            { value: 50000, suffix: '+', label: 'Threats Identified' },
            { value: 12000, suffix: '+', label: 'Malaysians Protected' },
            { value: 4, suffix: ' sec', label: 'Average Response Time' },
          ].map(s => (
            <div key={s.label} className="lp-stat-card">
              <div style={{ fontSize: '2.4rem', fontWeight: 900, color: '#ffffff', letterSpacing: '-0.04em', lineHeight: 1 }}>
                <Counter target={s.value} suffix={s.suffix} />
              </div>
              <div style={{ fontSize: '.87rem', color: 'rgba(255,255,255,.65)', fontWeight: 600, marginTop: 8 }}>{s.label}</div>
            </div>
          ))}
        </div>
      </section>

      {/* ── FEATURES ─────────────────────────────────────────────────────────── */}
      <section id="features" className="lp-section-pad" style={{ padding: '6rem 2rem', background: '#f4f6fb' }}>
        <div style={{ maxWidth: 1100, margin: '0 auto' }}>
          <div style={{ textAlign: 'center', marginBottom: '3.5rem' }}>
            <div style={{ display: 'inline-flex', alignItems: 'center', gap: 7, background: 'rgba(0,53,128,.08)', border: '1px solid rgba(0,53,128,.15)', borderRadius: 99, padding: '5px 16px', marginBottom: '1rem' }}>
              <span style={{ fontSize: '.78rem', fontWeight: 700, color: '#003580', letterSpacing: '.06em' }}>FEATURES</span>
            </div>
            <h2 style={{ fontSize: '2.4rem', fontWeight: 900, letterSpacing: '-0.04em', color: '#0d1a3a', marginBottom: '.75rem' }}>
              Everything You Need to Stay Safe
            </h2>
            <p style={{ fontSize: '1rem', color: '#3d5080', maxWidth: 520, margin: '0 auto', lineHeight: 1.7 }}>
              A complete toolkit against voice-based cyber threats — from real-time detection to awareness training.
            </p>
          </div>

          <div className="lp-features-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: '1.25rem' }}>
            {[
              {
                icon: <MicIcon size={22} />, color: '#CC0001', bg: 'rgba(204,0,1,.08)',
                title: 'Real-Time Voice Analysis',
                desc: 'Upload or record audio clips and get instant AI-powered verdicts on whether the voice is synthetic, cloned, or genuine.',
                items: ['Deepfake audio detection', 'Voice clone identification', 'Live recording analysis'],
                delay: '0s',
              },
              {
                icon: <BellIcon size={22} />, color: '#003580', bg: 'rgba(0,53,128,.08)',
                title: 'Threat Alerts & News',
                desc: 'Stay informed with real-time scam alerts and AI-curated news about the latest vishing and voice phishing threats.',
                items: ['Regional scam alerts', 'AI-curated threat news', 'Push notifications'],
                delay: '.1s',
              },
              {
                icon: <BookIcon size={22} />, color: '#f5a800', bg: 'rgba(245,168,0,.1)',
                title: 'Awareness Training',
                desc: 'Interactive quizzes, threat simulations, and educational content designed specifically for seniors and first-time users.',
                items: ['Daily quiz challenges', 'Points & rewards', 'Multi-language support'],
                delay: '.2s',
              },
              {
                icon: <GlobeIcon size={22} />, color: '#00875a', bg: 'rgba(0,135,90,.08)',
                title: 'Malaysia-First Coverage',
                desc: 'Tailored threat intelligence covering PDRM, MCMC, and Bank Negara advisories — in Bahasa Malaysia and English.',
                items: ['PDRM & MCMC alerts', 'BM / EN / 中文 support', 'Local scam database'],
                delay: '.3s',
              },
              {
                icon: <LockIcon size={22} />, color: '#6366f1', bg: 'rgba(99,102,241,.08)',
                title: 'Enterprise-Grade Security',
                desc: 'MFA-protected accounts, audit logging, and role-based access ensure your data and findings stay private.',
                items: ['TOTP & Google OAuth', 'Full audit trail', 'Admin dashboard'],
                delay: '.4s',
              },
              {
                icon: <UsersIcon size={22} />, color: '#f59e0b', bg: 'rgba(245,158,11,.08)',
                title: 'Trusted Contacts Network',
                desc: 'Add family members and trusted contacts who can verify suspicious calls on your behalf before you act.',
                items: ['Emergency contact list', 'Verification requests', 'Family protection'],
                delay: '.5s',
              },
            ].map(f => (
              <div key={f.title} className="lp-feature-card" style={{ animationDelay: f.delay }}>
                <div style={{ width: 48, height: 48, borderRadius: 14, background: f.bg, display: 'flex', alignItems: 'center', justifyContent: 'center', color: f.color, marginBottom: '1.25rem' }}>
                  {f.icon}
                </div>
                <h3 style={{ fontSize: '1.05rem', fontWeight: 800, color: '#0d1a3a', marginBottom: '.6rem', lineHeight: 1.3 }}>{f.title}</h3>
                <p style={{ fontSize: '.875rem', color: '#3d5080', lineHeight: 1.65, marginBottom: '1rem' }}>{f.desc}</p>
                <ul style={{ listStyle: 'none', display: 'flex', flexDirection: 'column', gap: 7 }}>
                  {f.items.map(i => (
                    <li key={i} style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: '.83rem', color: '#3d5080', fontWeight: 600 }}>
                      <span style={{ color: f.color, flexShrink: 0 }}><CheckIcon size={14} /></span>{i}
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── HOW IT WORKS ─────────────────────────────────────────────────────── */}
      <section id="how-it-works" style={{ padding: '6rem 2rem', background: '#ffffff' }}>
        <div style={{ maxWidth: 1100, margin: '0 auto' }}>
          <div style={{ textAlign: 'center', marginBottom: '3.5rem' }}>
            <div style={{ display: 'inline-flex', alignItems: 'center', gap: 7, background: 'rgba(0,53,128,.08)', border: '1px solid rgba(0,53,128,.15)', borderRadius: 99, padding: '5px 16px', marginBottom: '1rem' }}>
              <span style={{ fontSize: '.78rem', fontWeight: 700, color: '#003580', letterSpacing: '.06em' }}>HOW IT WORKS</span>
            </div>
            <h2 style={{ fontSize: '2.4rem', fontWeight: 900, letterSpacing: '-0.04em', color: '#0d1a3a', marginBottom: '.75rem' }}>
              3 Steps to Complete Protection
            </h2>
            <p style={{ fontSize: '1rem', color: '#3d5080', maxWidth: 500, margin: '0 auto', lineHeight: 1.7 }}>
              From sign-up to your first scan in under two minutes.
            </p>
          </div>

          <div className="lp-steps-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: '1.5rem' }}>
            {[
              {
                step: '01', icon: <UsersIcon size={28} />, color: '#003580', bg: 'rgba(0,53,128,.08)',
                title: 'Create Your Account',
                desc: 'Sign up free in 30 seconds using your email or Google account. Your privacy is protected with enterprise-grade MFA security.',
              },
              {
                step: '02', icon: <MicIcon size={28} />, color: '#CC0001', bg: 'rgba(204,0,1,.08)',
                title: 'Upload Suspicious Audio',
                desc: 'Received a suspicious voice call or audio clip? Upload it to VoiceGuard\'s AI detection engine for instant analysis.',
              },
              {
                step: '03', icon: <ShieldIcon size={28} />, color: '#00875a', bg: 'rgba(0,135,90,.08)',
                title: 'Get Instant Results',
                desc: 'Our AI returns a verdict in seconds — whether the voice is real, cloned, or synthesised — with a confidence score.',
              },
            ].map((s, i) => (
              <div key={s.step} className="lp-step-card">
                {/* Connector line (not on last) */}
                {i < 2 && (
                  <div style={{ position: 'absolute', top: '2.5rem', right: '-0.75rem', width: '1.5rem', height: 2, background: 'rgba(0,53,128,.15)', zIndex: 2 }} />
                )}
                <div style={{ width: 64, height: 64, borderRadius: '50%', background: s.bg, display: 'flex', alignItems: 'center', justifyContent: 'center', color: s.color, margin: '0 auto 1.25rem', position: 'relative' }}>
                  {s.icon}
                  <div style={{ position: 'absolute', top: -4, right: -4, width: 22, height: 22, borderRadius: '50%', background: s.color, color: '#fff', fontSize: '.6rem', fontWeight: 800, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    {s.step.replace('0', '')}
                  </div>
                </div>
                <h3 style={{ fontSize: '1.05rem', fontWeight: 800, color: '#0d1a3a', marginBottom: '.6rem' }}>{s.title}</h3>
                <p style={{ fontSize: '.875rem', color: '#3d5080', lineHeight: 1.65 }}>{s.desc}</p>
              </div>
            ))}
          </div>

          {/* Live demo CTA */}
          <div style={{ textAlign: 'center', marginTop: '3rem' }}>
            <Link href="/signup" className="lp-btn-primary">
              Try It Free — No Credit Card <ArrowRightIcon size={16} />
            </Link>
          </div>
        </div>
      </section>

      {/* ── AUDIO DEMO VISUAL ────────────────────────────────────────────────── */}
      <section style={{ padding: '5rem 2rem', background: 'linear-gradient(145deg,#0d1a3a,#003580)' }}>
        <div style={{ maxWidth: 860, margin: '0 auto', textAlign: 'center' }}>
          <h2 style={{ fontSize: '2rem', fontWeight: 900, color: '#ffffff', letterSpacing: '-0.03em', marginBottom: '.75rem' }}>
            See the AI Detector in Action
          </h2>
          <p style={{ fontSize: '1rem', color: 'rgba(255,255,255,.65)', marginBottom: '2.5rem', lineHeight: 1.7 }}>
            Our model analyses micro-patterns in audio that are invisible to the human ear — detecting voice synthesis artefacts with 98% accuracy.
          </p>

          {/* Fake detector UI */}
          <div style={{ background: 'rgba(255,255,255,.05)', border: '1px solid rgba(255,255,255,.12)', borderRadius: 24, padding: '2rem', backdropFilter: 'blur(10px)' }}>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem', marginBottom: '1.5rem' }}>
              {/* Real audio */}
              <div style={{ background: 'rgba(0,135,90,.12)', border: '1px solid rgba(0,135,90,.3)', borderRadius: 16, padding: '1.25rem' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: '1rem' }}>
                  <div style={{ width: 10, height: 10, borderRadius: '50%', background: '#34d399' }} />
                  <span style={{ fontSize: '.8rem', fontWeight: 700, color: '#34d399', letterSpacing: '.05em' }}>GENUINE VOICE</span>
                </div>
                <Waveform bars={20} color="#34d399" />
                <div style={{ marginTop: '1rem', fontSize: '1.5rem', fontWeight: 900, color: '#34d399' }}>97.2%</div>
                <div style={{ fontSize: '.75rem', color: 'rgba(255,255,255,.5)', marginTop: 2 }}>Confidence: Real Human</div>
              </div>
              {/* Fake audio */}
              <div style={{ background: 'rgba(248,113,113,.1)', border: '1px solid rgba(248,113,113,.3)', borderRadius: 16, padding: '1.25rem' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: '1rem' }}>
                  <div style={{ width: 10, height: 10, borderRadius: '50%', background: '#f87171', animation: 'pulse-ring 1s ease-out infinite' }} />
                  <span style={{ fontSize: '.8rem', fontWeight: 700, color: '#f87171', letterSpacing: '.05em' }}>DEEPFAKE DETECTED</span>
                </div>
                <Waveform bars={20} color="#f87171" />
                <div style={{ marginTop: '1rem', fontSize: '1.5rem', fontWeight: 900, color: '#f87171' }}>96.8%</div>
                <div style={{ fontSize: '.75rem', color: 'rgba(255,255,255,.5)', marginTop: 2 }}>Confidence: AI-Generated</div>
              </div>
            </div>
            <div style={{ background: 'rgba(255,255,255,.04)', borderRadius: 12, padding: '1rem 1.25rem', display: 'flex', alignItems: 'center', gap: 12 }}>
              <span style={{ fontSize: '1.2rem' }}>🔬</span>
              <span style={{ fontSize: '.85rem', color: 'rgba(255,255,255,.6)', lineHeight: 1.5 }}>
                AI model analyses <strong style={{ color: 'rgba(255,255,255,.85)' }}>spectral artefacts</strong>, <strong style={{ color: 'rgba(255,255,255,.85)' }}>formant irregularities</strong>, and <strong style={{ color: 'rgba(255,255,255,.85)' }}>GAN fingerprints</strong> invisible to the human ear.
              </span>
            </div>
          </div>
        </div>
      </section>

      {/* ── THREAT LANDSCAPE ─────────────────────────────────────────────────── */}
      <section id="threats" className="lp-section-pad" style={{ padding: '6rem 2rem', background: '#f4f6fb' }}>
        <div style={{ maxWidth: 1100, margin: '0 auto' }}>
          <div style={{ textAlign: 'center', marginBottom: '3rem' }}>
            <div style={{ display: 'inline-flex', alignItems: 'center', gap: 7, background: 'rgba(204,0,1,.08)', border: '1px solid rgba(204,0,1,.2)', borderRadius: 99, padding: '5px 16px', marginBottom: '1rem' }}>
              <span style={{ fontSize: '.78rem', fontWeight: 700, color: '#CC0001', letterSpacing: '.06em' }}>⚠ THREAT LANDSCAPE</span>
            </div>
            <h2 style={{ fontSize: '2.4rem', fontWeight: 900, letterSpacing: '-0.04em', color: '#0d1a3a', marginBottom: '.75rem' }}>
              The Threats Are Real & Growing
            </h2>
            <p style={{ fontSize: '1rem', color: '#3d5080', maxWidth: 520, margin: '0 auto', lineHeight: 1.7 }}>
              Voice phishing scams cost Malaysians over <strong>RM 1.2 billion</strong> in 2024 alone. Know what you're up against.
            </p>
          </div>

          <div className="lp-threats-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: '1.25rem' }}>
            {[
              {
                flag: '🇲🇾', country: 'Malaysia', severity: 'CRITICAL', sColor: '#f87171', sBg: 'rgba(248,113,113,.1)',
                title: 'Macau Scam — PDRM Advisory',
                desc: 'Impersonators pose as Bank Negara or Jabatan Imigresen officers to demand fund transfers to "safe accounts". RM 18M lost in Q1 2025.',
                tags: ['Vishing', 'Macau Scam', 'PDRM'],
              },
              {
                flag: '🌐', country: 'Global', severity: 'HIGH', sColor: '#fb923c', sBg: 'rgba(251,146,60,.1)',
                title: '$25M CFO Deepfake Video Scam',
                desc: 'A finance worker wired USD 25M after a deepfake video call featured AI-cloned voices of their CFO and senior executives.',
                tags: ['AI Clone', 'Deepfake', 'Corporate'],
              },
              {
                flag: '🇸🇬', country: 'Singapore', severity: 'HIGH', sColor: '#fb923c', sBg: 'rgba(251,146,60,.1)',
                title: 'WhatsApp Voice Note Phishing',
                desc: 'SPF warns of AI-voiced WhatsApp messages impersonating DBS and OCBC banks, directing victims to call spoofed numbers.',
                tags: ['WhatsApp', 'Singapore', 'SPF'],
              },
            ].map(t => (
              <div key={t.title} className="threat-card">
                <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: '.85rem' }}>
                  <span style={{ fontSize: '1.2rem' }}>{t.flag}</span>
                  <span style={{ fontSize: '.75rem', color: '#8898bb', fontWeight: 600 }}>{t.country}</span>
                  <span style={{ marginLeft: 'auto', fontSize: '.67rem', fontWeight: 700, letterSpacing: '.05em', padding: '3px 10px', borderRadius: 99, background: t.sBg, color: t.sColor, border: `1px solid ${t.sColor}44` }}>
                    {t.severity}
                  </span>
                </div>
                <h4 style={{ fontSize: '.97rem', fontWeight: 800, color: '#0d1a3a', marginBottom: '.6rem', lineHeight: 1.4 }}>{t.title}</h4>
                <p style={{ fontSize: '.84rem', color: '#3d5080', lineHeight: 1.65, marginBottom: '.85rem' }}>{t.desc}</p>
                <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
                  {t.tags.map(tag => (
                    <span key={tag} style={{ fontSize: '.68rem', padding: '3px 9px', borderRadius: 6, background: 'rgba(0,53,128,.06)', color: '#3d5080', fontWeight: 600, border: '1px solid rgba(0,53,128,.1)' }}>{tag}</span>
                  ))}
                </div>
              </div>
            ))}
          </div>

          <div style={{ textAlign: 'center', marginTop: '2.5rem' }}>
            <Link href="/signup" style={{ color: '#003580', fontWeight: 700, fontSize: '.93rem', textDecoration: 'none', display: 'inline-flex', alignItems: 'center', gap: 6 }}>
              View all threat alerts after sign-in <ArrowRightIcon size={15} />
            </Link>
          </div>
        </div>
      </section>

      {/* ── FAQ ──────────────────────────────────────────────────────────────── */}
      <section id="about" style={{ padding: '6rem 2rem', background: '#ffffff' }}>
        <div style={{ maxWidth: 720, margin: '0 auto' }}>
          <div style={{ textAlign: 'center', marginBottom: '3rem' }}>
            <div style={{ display: 'inline-flex', alignItems: 'center', gap: 7, background: 'rgba(0,53,128,.08)', border: '1px solid rgba(0,53,128,.15)', borderRadius: 99, padding: '5px 16px', marginBottom: '1rem' }}>
              <span style={{ fontSize: '.78rem', fontWeight: 700, color: '#003580', letterSpacing: '.06em' }}>FAQ</span>
            </div>
            <h2 style={{ fontSize: '2.2rem', fontWeight: 900, letterSpacing: '-0.04em', color: '#0d1a3a' }}>Common Questions</h2>
          </div>

          <FaqList />
        </div>
      </section>

      {/* ── FINAL CTA ────────────────────────────────────────────────────────── */}
      <section style={{ padding: '6rem 2rem', background: 'linear-gradient(135deg,#003580,#002460)', position: 'relative', overflow: 'hidden' }}>
        <div style={{ position: 'absolute', top: '-30%', right: '-10%', width: 500, height: 500, background: 'radial-gradient(circle,rgba(204,0,1,.15) 0%,transparent 65%)', borderRadius: '50%', pointerEvents: 'none' }} />
        <div style={{ position: 'absolute', bottom: '-20%', left: '-5%', width: 400, height: 400, background: 'radial-gradient(circle,rgba(245,168,0,.1) 0%,transparent 65%)', borderRadius: '50%', pointerEvents: 'none' }} />

        <div style={{ maxWidth: 700, margin: '0 auto', textAlign: 'center', position: 'relative', zIndex: 2 }}>
          <div style={{ width: 72, height: 72, borderRadius: '50%', background: 'rgba(255,255,255,.1)', border: '2px solid rgba(255,255,255,.2)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 1.5rem', color: 'white' }}>
            <ShieldIcon size={32} />
          </div>
          <h2 style={{ fontSize: '2.6rem', fontWeight: 900, color: '#ffffff', letterSpacing: '-0.04em', marginBottom: '1rem', lineHeight: 1.15 }}>
            Protect Yourself &amp; Your Family Today
          </h2>
          <p style={{ fontSize: '1.05rem', color: 'rgba(255,255,255,.7)', lineHeight: 1.7, marginBottom: '2.5rem' }}>
            Join thousands of Malaysians who trust VoiceGuard to detect voice scams before they cause harm. Free to use, always.
          </p>
          <div style={{ display: 'flex', gap: 14, justifyContent: 'center', flexWrap: 'wrap' }}>
            <Link href="/signup" style={{ display: 'inline-flex', alignItems: 'center', gap: 8, background: '#ffffff', color: '#003580', border: 'none', borderRadius: 12, padding: '15px 32px', fontSize: '1rem', fontWeight: 800, cursor: 'pointer', textDecoration: 'none', boxShadow: '0 8px 28px rgba(0,0,0,.2)', transition: 'transform .2s, box-shadow .2s' }}
              onMouseEnter={e => { e.currentTarget.style.transform = 'translateY(-2px)'; e.currentTarget.style.boxShadow = '0 12px 36px rgba(0,0,0,.3)' }}
              onMouseLeave={e => { e.currentTarget.style.transform = ''; e.currentTarget.style.boxShadow = '0 8px 28px rgba(0,0,0,.2)' }}>
              Create Free Account <ArrowRightIcon size={16} />
            </Link>
            <Link href="/login" style={{ display: 'inline-flex', alignItems: 'center', gap: 8, background: 'transparent', color: 'rgba(255,255,255,.9)', border: '2px solid rgba(255,255,255,.3)', borderRadius: 12, padding: '13px 28px', fontSize: '1rem', fontWeight: 700, cursor: 'pointer', textDecoration: 'none', transition: 'border-color .2s, background .2s' }}
              onMouseEnter={e => { e.currentTarget.style.borderColor = 'rgba(255,255,255,.7)'; e.currentTarget.style.background = 'rgba(255,255,255,.07)' }}
              onMouseLeave={e => { e.currentTarget.style.borderColor = 'rgba(255,255,255,.3)'; e.currentTarget.style.background = 'transparent' }}>
              Sign In
            </Link>
          </div>
        </div>
      </section>

      {/* ── FOOTER ───────────────────────────────────────────────────────────── */}
      <footer style={{ background: '#0d1a3a', padding: '3rem 2rem 2rem', color: 'rgba(255,255,255,.55)' }}>
        <div style={{ maxWidth: 1100, margin: '0 auto' }}>
          <div style={{ display: 'grid', gridTemplateColumns: '1.5fr 1fr 1fr 1fr', gap: '2rem', marginBottom: '2.5rem' }}>
            {/* Brand */}
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: '1rem' }}>
                <div style={{ width: 34, height: 34, borderRadius: 9, background: 'linear-gradient(135deg,#003580,#1a4fa0)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white' }}>
                  <ShieldIcon size={16} />
                </div>
                <span style={{ fontWeight: 800, color: 'white', fontSize: '1.05rem' }}>VoiceGuard</span>
              </div>
              <p style={{ fontSize: '.85rem', lineHeight: 1.7, maxWidth: 240 }}>
                AI-powered voice phishing protection built for Malaysia and Southeast Asia. Stay safe from deepfake audio scams.
              </p>
            </div>

            {/* Links */}
            {[
              { title: 'Platform', links: [{ l: 'Dashboard', h: '/dashboard' }, { l: 'Detect Audio', h: '/detect' }, { l: 'Threat Alerts', h: '/alerts' }, { l: 'Awareness Hub', h: '/awareness' }] },
              { title: 'Account', links: [{ l: 'Sign In', h: '/login' }, { l: 'Create Account', h: '/signup' }, { l: 'Reset Password', h: '/forgot-password' }] },
              { title: 'Legal', links: [{ l: 'Terms of Service', h: '/terms' }, { l: 'Privacy Policy', h: '/privacy' }] },
            ].map(col => (
              <div key={col.title}>
                <div style={{ fontSize: '.78rem', fontWeight: 700, color: 'rgba(255,255,255,.45)', letterSpacing: '.07em', textTransform: 'uppercase', marginBottom: '.85rem' }}>{col.title}</div>
                {col.links.map(l => (
                  <Link key={l.l} href={l.h} style={{ display: 'block', color: 'rgba(255,255,255,.6)', textDecoration: 'none', fontSize: '.88rem', fontWeight: 500, marginBottom: '.6rem', transition: 'color .2s' }}
                    onMouseEnter={e => (e.currentTarget.style.color = 'white')}
                    onMouseLeave={e => (e.currentTarget.style.color = 'rgba(255,255,255,.6)')}>
                    {l.l}
                  </Link>
                ))}
              </div>
            ))}
          </div>

          <div style={{ borderTop: '1px solid rgba(255,255,255,.08)', paddingTop: '1.5rem', display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 12 }}>
            <span style={{ fontSize: '.82rem' }}>© 2025 VoiceGuard. Built for Malaysia 🇲🇾</span>
            <div style={{ display: 'flex', gap: 16 }}>
              <span style={{ fontSize: '.78rem', background: 'rgba(255,255,255,.06)', border: '1px solid rgba(255,255,255,.1)', borderRadius: 6, padding: '3px 10px', color: 'rgba(255,255,255,.45)' }}>98% Accuracy</span>
              <span style={{ fontSize: '.78rem', background: 'rgba(255,255,255,.06)', border: '1px solid rgba(255,255,255,.1)', borderRadius: 6, padding: '3px 10px', color: 'rgba(255,255,255,.45)' }}>MFA Secured</span>
            </div>
          </div>
        </div>
      </footer>
    </div>
  )
}

// ── FAQ accordion ─────────────────────────────────────────────────────────────
const FAQS = [
  { q: 'Is VoiceGuard free to use?', a: 'Yes! VoiceGuard is completely free for individual users. Create an account and start detecting deepfake audio and staying updated on the latest vishing threats immediately.' },
  { q: 'How accurate is the voice deepfake detection?', a: 'Our AI model achieves 98% detection accuracy on our benchmark dataset. It analyses spectral artefacts, formant patterns, and GAN fingerprints in audio that are invisible to the human ear.' },
  { q: 'What file formats can I upload for detection?', a: 'VoiceGuard supports MP3, WAV, M4A, OGG, and FLAC audio files up to 50MB. You can also record audio directly through your device\'s microphone within the platform.' },
  { q: 'Is my data private and secure?', a: 'Absolutely. All audio uploads are processed securely and never stored permanently. Your account is protected by multi-factor authentication (MFA), and we maintain a full audit log for transparency.' },
  { q: 'Does it work in Bahasa Malaysia?', a: 'Yes. VoiceGuard fully supports Bahasa Malaysia, English, and Chinese (Mandarin) across the dashboard, alerts, and awareness content.' },
]

function FaqList() {
  const [open, setOpen] = useState<number | null>(null)
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
      {FAQS.map((f, i) => (
        <div key={i} className="faq-item">
          <button className="faq-btn" onClick={() => setOpen(open === i ? null : i)}>
            <span>{f.q}</span>
            <span style={{ fontSize: '1.2rem', color: '#003580', transition: 'transform .25s', transform: open === i ? 'rotate(45deg)' : 'rotate(0deg)', flexShrink: 0, lineHeight: 1 }}>+</span>
          </button>
          {open === i && (
            <div className="faq-answer">{f.a}</div>
          )}
        </div>
      ))}
    </div>
  )
}
