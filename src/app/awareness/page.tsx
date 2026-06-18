'use client'

import { useState, useRef } from 'react'
import Link from 'next/link'
import { useLang, LanguageSwitcher } from '@/lib/LanguageContext'
import { SidebarUserPanel } from '@/lib/SidebarUserPanel'

// ── Icons ────────────────────────────────────────────────────────────────────
const ShieldIcon = ({ size = 20 }: { size?: number }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
  </svg>
)
const PhoneIcon = ({ size = 20 }: { size?: number }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07A19.5 19.5 0 0 1 4.69 12a19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 3.6 1.28h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L7.91 9a16 16 0 0 0 6.27 6.27l.91-.91a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z" />
  </svg>
)
const AlertTriangleIcon = ({ size = 20 }: { size?: number }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="m21.73 18-8-14a2 2 0 0 0-3.48 0l-8 14A2 2 0 0 0 4 21h16a2 2 0 0 0 1.73-3z" />
    <line x1="12" y1="9" x2="12" y2="13" /><line x1="12" y1="17" x2="12.01" y2="17" />
  </svg>
)
const BellIcon = ({ size = 20 }: { size?: number }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9" />
    <path d="M13.73 21a2 2 0 0 1-3.46 0" />
  </svg>
)
const BookOpenIcon = ({ size = 20 }: { size?: number }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z" />
    <path d="M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z" />
  </svg>
)
const ActivityIcon = ({ size = 20 }: { size?: number }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <polyline points="22 12 18 12 15 21 9 3 6 12 2 12" />
  </svg>
)
const LogOutIcon = ({ size = 20 }: { size?: number }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
    <polyline points="16 17 21 12 16 7" /><line x1="21" y1="12" x2="9" y2="12" />
  </svg>
)
const MicIcon = ({ size = 20 }: { size?: number }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M12 1a3 3 0 0 0-3 3v8a3 3 0 0 0 6 0V4a3 3 0 0 0-3-3z" />
    <path d="M19 10v2a7 7 0 0 1-14 0v-2" />
    <line x1="12" y1="19" x2="12" y2="23" /><line x1="8" y1="23" x2="16" y2="23" />
  </svg>
)
const TrendingUpIcon = ({ size = 20 }: { size?: number }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <polyline points="23 6 13.5 15.5 8.5 10.5 1 18" />
    <polyline points="17 6 23 6 23 12" />
  </svg>
)
const GlobeIcon = ({ size = 20 }: { size?: number }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="12" cy="12" r="10" /><line x1="2" y1="12" x2="22" y2="12" />
    <path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z" />
  </svg>
)
const SparklesIcon = ({ size = 20 }: { size?: number }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="m12 3-1.912 5.813a2 2 0 0 1-1.275 1.275L3 12l5.813 1.912a2 2 0 0 1 1.275 1.275L12 21l1.912-5.813a2 2 0 0 1 1.275-1.275L21 12l-5.813-1.912a2 2 0 0 1-1.275-1.275L12 3Z" />
    <path d="M5 3v4" /><path d="M3 5h4" /><path d="M19 17v4" /><path d="M17 19h4" />
  </svg>
)
const SearchIcon = ({ size = 18 }: { size?: number }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="11" cy="11" r="8" /><line x1="21" y1="21" x2="16.65" y2="16.65" />
  </svg>
)
const XIcon = ({ size = 16 }: { size?: number }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" />
  </svg>
)
const ChevronDownIcon = ({ size = 16 }: { size?: number }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <polyline points="6 9 12 15 18 9" />
  </svg>
)
const RefreshIcon = ({ size = 16 }: { size?: number }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <polyline points="23 4 23 10 17 10" /><polyline points="1 20 1 14 7 14" />
    <path d="M3.51 9a9 9 0 0 1 14.85-3.36L23 10M1 14l4.64 4.36A9 9 0 0 0 20.49 15" />
  </svg>
)
const KeyIcon = ({ size = 16 }: { size?: number }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="m21 2-1 1" /><path d="m20 3-9.5 9.5" />
    <circle cx="8" cy="16" r="5" /><path d="m15 9 1 1" />
  </svg>
)
const CheckIcon = ({ size = 14 }: { size?: number }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
    <polyline points="20 6 9 17 4 12" />
  </svg>
)
const ExternalLinkIcon = ({ size = 13 }: { size?: number }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6" />
    <polyline points="15 3 21 3 21 9" /><line x1="10" y1="14" x2="21" y2="3" />
  </svg>
)
const EyeOffIcon = ({ size = 15 }: { size?: number }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24" />
    <line x1="1" y1="1" x2="23" y2="23" />
  </svg>
)
const EyeIcon = ({ size = 15 }: { size?: number }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
    <circle cx="12" cy="12" r="3" />
  </svg>
)

// ── Types ─────────────────────────────────────────────────────────────────────
interface NewsItem {
  id: string
  title: string
  summary: string
  fullContent: string
  country: string
  category: string
  severity: 'critical' | 'high' | 'medium' | 'info'
  timeAgo: string
  source: string
  tags: string[]
  svgVisual: string
  seniorInsight?: string
  url?: string
}

// ── Constants ─────────────────────────────────────────────────────────────────
const REGIONS = [
  { id: 'all', flag: '🌐', label: 'Global' },
  { id: 'MY',  flag: '🇲🇾', label: 'Malaysia' },
  { id: 'SG',  flag: '🇸🇬', label: 'Singapore' },
  { id: 'US',  flag: '🇺🇸', label: 'United States' },
  { id: 'UK',  flag: '🇬🇧', label: 'United Kingdom' },
  { id: 'AU',  flag: '🇦🇺', label: 'Australia' },
  { id: 'IN',  flag: '🇮🇳', label: 'India' },
]

const CATEGORIES = [
  { id: 'all',     label: 'All Topics' },
  { id: 'vishing', label: 'Vishing' },
  { id: 'ai',      label: 'AI Threats' },
  { id: 'scam',    label: 'Scam Alerts' },
  { id: 'malware', label: 'Malware' },
  { id: 'breach',  label: 'Data Breach' },
]

const SEV: Record<string, { label: string; color: string; bg: string; border: string }> = {
  critical: { label: 'Critical', color: '#f87171', bg: 'rgba(248,113,113,0.09)', border: 'rgba(248,113,113,0.28)' },
  high:     { label: 'High',     color: '#fb923c', bg: 'rgba(251,146,60,0.09)',  border: 'rgba(251,146,60,0.28)' },
  medium:   { label: 'Medium',   color: '#facc15', bg: 'rgba(250,204,21,0.08)',  border: 'rgba(250,204,21,0.25)' },
  info:     { label: 'Info',     color: '#34d399', bg: 'rgba(52,211,153,0.08)',  border: 'rgba(52,211,153,0.25)' },
}

// ── Animated SVG threat visual ────────────────────────────────────────────────
function makeSvg(sev: string, title: string): string {
  const pal: Record<string, { a: string; b: string }> = {
    critical: { a: '#f87171', b: '#fca5a5' },
    high:     { a: '#fb923c', b: '#fdba74' },
    medium:   { a: '#facc15', b: '#fde047' },
    info:     { a: '#34d399', b: '#6ee7b7' },
  }
  const p = pal[sev] || pal.info
  const label = title.split(' ').slice(0, 5).join(' ')
  return `<svg viewBox="0 0 360 130" xmlns="http://www.w3.org/2000/svg" style="width:100%;height:130px;display:block;border-radius:10px">
  <defs>
    <radialGradient id="rg${sev}" cx="50%" cy="50%" r="55%">
      <stop offset="0%" stop-color="${p.a}" stop-opacity="0.22"/>
      <stop offset="100%" stop-color="${p.a}" stop-opacity="0"/>
    </radialGradient>
    <filter id="bl"><feGaussianBlur stdDeviation="10"/></filter>
  </defs>
  <rect width="360" height="130" fill="#0c0e18" rx="10"/>
  <ellipse cx="180" cy="65" rx="100" ry="60" fill="url(#rg${sev})" filter="url(#bl)">
    <animate attributeName="rx" values="100;130;100" dur="5s" repeatCount="indefinite"/>
  </ellipse>
  <!-- outer pulse -->
  <circle cx="180" cy="58" r="36" fill="none" stroke="${p.a}" stroke-width="1" opacity="0">
    <animate attributeName="r" values="36;62;36" dur="3s" repeatCount="indefinite"/>
    <animate attributeName="opacity" values="0.55;0;0.55" dur="3s" repeatCount="indefinite"/>
  </circle>
  <circle cx="180" cy="58" r="24" fill="none" stroke="${p.a}" stroke-width="1.2" opacity="0">
    <animate attributeName="r" values="24;46;24" dur="3s" begin="0.5s" repeatCount="indefinite"/>
    <animate attributeName="opacity" values="0.7;0;0.7" dur="3s" begin="0.5s" repeatCount="indefinite"/>
  </circle>
  <!-- shield -->
  <path d="M180 38 L194 43.5 L194 56 C194 65.5 180 72 180 72 C180 72 166 65.5 166 56 L166 43.5 Z"
        fill="none" stroke="${p.b}" stroke-width="1.8" stroke-linejoin="round">
    <animate attributeName="opacity" values="1;0.55;1" dur="2.2s" repeatCount="indefinite"/>
  </path>
  <line x1="180" y1="50" x2="180" y2="58" stroke="${p.b}" stroke-width="2" stroke-linecap="round"/>
  <circle cx="180" cy="62.5" r="1.8" fill="${p.b}"/>
  <!-- particles -->
  <circle cx="70"  cy="35"  r="2"   fill="${p.a}" opacity="0.45"><animate attributeName="cy" values="35;24;35"   dur="3.2s" repeatCount="indefinite"/><animate attributeName="opacity" values="0.45;0.1;0.45" dur="3.2s" repeatCount="indefinite"/></circle>
  <circle cx="290" cy="90"  r="2"   fill="${p.a}" opacity="0.4"> <animate attributeName="cy" values="90;78;90"   dur="4s"   repeatCount="indefinite"/><animate attributeName="opacity" values="0.4;0.1;0.4"   dur="4s"   repeatCount="indefinite"/></circle>
  <circle cx="260" cy="28"  r="1.5" fill="${p.b}" opacity="0.4"> <animate attributeName="cy" values="28;18;28"   dur="2.8s" repeatCount="indefinite"/></circle>
  <circle cx="95"  cy="105" r="1.5" fill="${p.b}" opacity="0.35"><animate attributeName="cy" values="105;95;105" dur="3.8s" repeatCount="indefinite"/></circle>
  <circle cx="310" cy="42"  r="1.2" fill="${p.a}" opacity="0.3"> <animate attributeName="cy" values="42;32;42"   dur="2.5s" repeatCount="indefinite"/></circle>
  <!-- waveform lines -->
  <polyline points="20,80 35,65 45,80 55,50 65,80 75,70 85,80" fill="none" stroke="${p.a}" stroke-width="1" opacity="0.25"/>
  <polyline points="275,80 285,62 295,80 305,55 315,80 325,68 340,80" fill="none" stroke="${p.a}" stroke-width="1" opacity="0.25"/>
  <!-- label -->
  <text x="180" y="95" text-anchor="middle" font-family="Inter,system-ui,sans-serif" font-size="9" font-weight="600" fill="${p.b}" opacity="0.65">${label}</text>
</svg>`
}

// ── Senior-friendly visual infographic (always visible) ───────────────────────
function makeVisualInsight(sev: string, category: string, title: string): string {
  const pal: Record<string, { a: string; b: string; bg: string }> = {
    critical: { a: '#f87171', b: '#fca5a5', bg: '#2d0f0f' },
    high:     { a: '#fb923c', b: '#fdba74', bg: '#2d1a0a' },
    medium:   { a: '#facc15', b: '#fde047', bg: '#2a2005' },
    info:     { a: '#34d399', b: '#6ee7b7', bg: '#052a1e' },
  }
  const p = pal[sev] || pal.info

  // Category-specific attacker icon path
  const catIcons: Record<string, string> = {
    vishing: 'M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07A19.5 19.5 0 0 1 4.69 12a19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 3.6 1.28h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L7.91 9a16 16 0 0 0 6.27 6.27l.91-.91a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z',
    ai:      'm12 3-1.912 5.813a2 2 0 0 1-1.275 1.275L3 12l5.813 1.912a2 2 0 0 1 1.275 1.275L12 21l1.912-5.813a2 2 0 0 1 1.275-1.275L21 12l-5.813-1.912a2 2 0 0 1-1.275-1.275L12 3Z',
    scam:    'M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z',
    malware: 'M9 3H5a2 2 0 0 0-2 2v4m6-6h10a2 2 0 0 1 2 2v4M9 3v18m0 0h10a2 2 0 0 0 2-2V9M9 21H5a2 2 0 0 1-2-2V9m0 0h18',
    breach:  'M21 2l-1 1M20 3l-9.5 9.5M15 9l1 1M8 16a5 5 0 1 0 0-10 5 5 0 0 0 0 10z',
  }
  const iconPath = catIcons[category] || catIcons.scam

  // Severity meter (5 bars)
  const sevLevel = { critical: 5, high: 4, medium: 3, info: 1 }[sev] ?? 3
  const bars = [1,2,3,4,5].map(i => {
    const filled = i <= sevLevel
    const x = 246 + (i - 1) * 12
    return `<rect x="${x}" y="${filled ? 62 : 68}" width="8" height="${filled ? 14 : 8}" rx="2" fill="${filled ? p.a : 'rgba(255,255,255,0.08)'}" opacity="${filled ? 1 : 1}"/>`
  }).join('')

  // Step labels based on category
  const steps: Record<string, [string,string,string]> = {
    vishing: ['Scammer calls\nyou', 'Pretends to be\nbank / police', 'Tricks you into\ngiving money'],
    ai:      ['AI clones\na voice', 'Sends fake\naudio / video', 'Steals your\ntrust & money'],
    scam:    ['Scammer\ncontacts you', 'Creates fake\nstory or offer', 'Steals money\nor personal data'],
    malware: ['Malicious\nlink / file sent', 'Infects your\ndevice silently', 'Steals data\nremotely'],
    breach:  ['Company gets\nhacked', 'Your data is\nstolen', 'Sold on dark\nweb / misused'],
  }
  const [s1, s2, s3] = steps[category] ?? steps.scam
  const label = title.split(' ').slice(0, 6).join(' ')

  return `<svg viewBox="0 0 360 160" xmlns="http://www.w3.org/2000/svg" style="width:100%;height:160px;display:block;border-radius:12px">
  <defs>
    <linearGradient id="vi-bg" x1="0" y1="0" x2="1" y2="1">
      <stop offset="0%" stop-color="${p.bg}"/>
      <stop offset="100%" stop-color="#0c0e18"/>
    </linearGradient>
    <linearGradient id="vi-bar" x1="0" y1="0" x2="1" y2="0">
      <stop offset="0%" stop-color="${p.a}"/>
      <stop offset="100%" stop-color="${p.b}"/>
    </linearGradient>
    <filter id="vi-glow"><feGaussianBlur stdDeviation="3" result="blur"/><feMerge><feMergeNode in="blur"/><feMergeNode in="SourceGraphic"/></feMerge></filter>
  </defs>
  <!-- background -->
  <rect width="360" height="160" fill="url(#vi-bg)" rx="12"/>
  <rect width="360" height="1" y="0" fill="${p.a}" opacity="0.4"/>

  <!-- HOW THIS SCAM WORKS header -->
  <rect x="12" y="10" width="180" height="18" rx="5" fill="${p.a}" opacity="0.12"/>
  <text x="20" y="22" font-family="Inter,system-ui,sans-serif" font-size="8.5" font-weight="700" fill="${p.b}" letter-spacing="0.06em">HOW THIS SCAM WORKS</text>

  <!-- Severity label -->
  <text x="240" y="56" font-family="Inter,system-ui,sans-serif" font-size="7" font-weight="700" fill="${p.a}" letter-spacing="0.05em" opacity="0.8">THREAT LEVEL</text>
  ${bars}

  <!-- Step boxes -->
  <!-- Step 1 -->
  <rect x="12" y="38" width="86" height="72" rx="10" fill="rgba(255,255,255,0.04)" stroke="${p.a}" stroke-width="1" stroke-opacity="0.3"/>
  <circle cx="55" cy="62" r="16" fill="${p.a}" opacity="0.13"/>
  <svg x="43" y="50" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="${p.b}" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="${iconPath}"/></svg>
  <text x="55" y="88" text-anchor="middle" font-family="Inter,system-ui,sans-serif" font-size="8" fill="rgba(255,255,255,0.75)" font-weight="500">${s1.replace('\n', ' ')}</text>
  <text x="55" y="100" text-anchor="middle" font-family="Inter,system-ui,sans-serif" font-size="7.5" fill="rgba(255,255,255,0.5)">${s1.includes('\n') ? s1.split('\n')[1] : ''}</text>
  <rect x="12" y="38" width="26" height="15" rx="5" fill="${p.a}"/>
  <text x="25" y="48" text-anchor="middle" font-family="Inter,system-ui,sans-serif" font-size="8" font-weight="800" fill="#0c0e18">1</text>

  <!-- Arrow 1 -->
  <line x1="100" y1="74" x2="128" y2="74" stroke="${p.a}" stroke-width="1.5" stroke-opacity="0.5" stroke-dasharray="3,2"/>
  <polygon points="128,70 136,74 128,78" fill="${p.a}" opacity="0.6"/>

  <!-- Step 2 -->
  <rect x="136" y="38" width="86" height="72" rx="10" fill="rgba(255,255,255,0.04)" stroke="${p.a}" stroke-width="1" stroke-opacity="0.3"/>
  <circle cx="179" cy="62" r="16" fill="${p.a}" opacity="0.13"/>
  <svg x="167" y="50" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="${p.b}" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round">
    <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/>
  </svg>
  <text x="179" y="88" text-anchor="middle" font-family="Inter,system-ui,sans-serif" font-size="8" fill="rgba(255,255,255,0.75)" font-weight="500">${s2.replace('\n', ' ')}</text>
  <text x="179" y="100" text-anchor="middle" font-family="Inter,system-ui,sans-serif" font-size="7.5" fill="rgba(255,255,255,0.5)">${s2.includes('\n') ? s2.split('\n')[1] : ''}</text>
  <rect x="136" y="38" width="26" height="15" rx="5" fill="${p.a}"/>
  <text x="149" y="48" text-anchor="middle" font-family="Inter,system-ui,sans-serif" font-size="8" font-weight="800" fill="#0c0e18">2</text>

  <!-- Arrow 2 -->
  <line x1="224" y1="74" x2="252" y2="74" stroke="${p.a}" stroke-width="1.5" stroke-opacity="0.5" stroke-dasharray="3,2"/>
  <polygon points="252,70 260,74 252,78" fill="${p.a}" opacity="0.6"/>

  <!-- Step 3 -->
  <rect x="260" y="38" width="86" height="72" rx="10" fill="rgba(255,255,255,0.04)" stroke="${p.a}" stroke-width="1.5" stroke-opacity="0.5"/>
  <circle cx="303" cy="62" r="16" fill="${p.a}" opacity="0.18"/>
  <svg x="291" y="50" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="${p.b}" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round">
    <line x1="12" y1="1" x2="12" y2="23"/><path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"/>
  </svg>
  <text x="303" y="88" text-anchor="middle" font-family="Inter,system-ui,sans-serif" font-size="8" fill="${p.b}" font-weight="700">${s3.replace('\n', ' ')}</text>
  <text x="303" y="100" text-anchor="middle" font-family="Inter,system-ui,sans-serif" font-size="7.5" fill="${p.b}" opacity="0.7">${s3.includes('\n') ? s3.split('\n')[1] : ''}</text>
  <rect x="260" y="38" width="26" height="15" rx="5" fill="${p.a}"/>
  <text x="273" y="48" text-anchor="middle" font-family="Inter,system-ui,sans-serif" font-size="8" font-weight="800" fill="#0c0e18">3</text>

  <!-- Bottom label -->
  <text x="12" y="148" font-family="Inter,system-ui,sans-serif" font-size="7.5" fill="rgba(255,255,255,0.35)" font-style="italic">${label}</text>
  <text x="348" y="148" text-anchor="end" font-family="Inter,system-ui,sans-serif" font-size="7.5" font-weight="700" fill="${p.a}" opacity="0.7">VoiceGuard</text>
</svg>`
}

// ── Seed news (shown while AI loads or if no key) ─────────────────────────────
const SEED: NewsItem[] = [
  {
    id: 's1', country: 'MY', category: 'vishing', severity: 'critical',
    title: 'PDRM warns of surge in Macau scam voice calls targeting retirees',
    summary: 'Malaysian police issued a nationwide advisory after a 43% spike in vishing calls impersonating Jabatan Imigresen and Bank Negara officers in Q1 2025.',
    fullContent: 'The Royal Malaysia Police (PDRM) Cyber Forensics unit reported a 43% increase in voice phishing incidents targeting individuals aged 55 and above. Callers impersonate immigration officers, claiming the victim\'s MyKad is linked to money laundering.\n\nVictims are instructed to transfer savings to a "safe account" for investigation. PDRM urges the public to hang up immediately and verify via the official Talian Kasih 15999 hotline.\n\nOver RM 18 million was lost in Q1 2025 alone. The syndicate operates from boiler rooms in neighbouring countries and uses number spoofing to display legitimate-looking local numbers.',
    timeAgo: '2 hours ago', source: 'PDRM Cyber Forensics',
    tags: ['Macau Scam', 'Vishing', 'Malaysia', 'PDRM'], svgVisual: '',
  },
  {
    id: 's2', country: 'all', category: 'ai', severity: 'critical',
    title: 'AI voice cloning used in $25M Hong Kong deepfake CFO fraud',
    summary: 'A finance worker was tricked into wiring $25 million after a deepfake video call with AI-cloned voices of the CFO and colleagues.',
    fullContent: 'A multinational company lost HK$200 million (≈USD 25M) after a finance employee was convinced via a deepfake video conference that included AI-cloned voices of senior executives.\n\nThe attacker used publicly available footage to recreate facial and vocal likenesses. The fraud was only discovered when the employee contacted headquarters directly.\n\nExperts warn this represents a new class of AI-enabled social engineering that bypasses traditional verification. Organisations are advised to implement out-of-band verification for all fund transfers above a set threshold.',
    timeAgo: '1 day ago', source: 'South China Morning Post',
    tags: ['AI Clone', 'Deepfake', 'Corporate Fraud', 'CFO Scam'], svgVisual: '',
  },
  {
    id: 's3', country: 'SG', category: 'vishing', severity: 'high',
    title: 'Singapore SPF: WhatsApp voice note phishing on the rise',
    summary: 'Scammers send voice notes mimicking bank officials asking victims to "press 1" to unfreeze accounts via WhatsApp.',
    fullContent: 'Singapore Police Force (SPF) Anti-Scam Command (ASCom) has flagged a new attack vector where scammers leverage WhatsApp voice messages to impersonate DBS, OCBC, and UOB bank representatives.\n\nThe voice notes instruct recipients to call back a spoofed number. The believability is enhanced by AI voice synthesis that mimics professional customer service tone.\n\nSPF advises users to never call numbers provided in unsolicited messages and to verify through official banking apps directly.',
    timeAgo: '5 hours ago', source: 'Singapore Police Force',
    tags: ['WhatsApp', 'Vishing', 'Singapore', 'Bank Scam'], svgVisual: '',
  },
  {
    id: 's4', country: 'US', category: 'ai', severity: 'high',
    title: 'FTC reports robocall volumes hit 5.5 billion in 2024, AI-voiced scams dominate',
    summary: 'US FTC data shows AI-generated robocall scams now account for 38% of all reported fraud calls, surpassing human-operated operations.',
    fullContent: 'The Federal Trade Commission (FTC) 2024 Consumer Sentinel Network report reveals robocall fraud losses exceeded USD 1.1 billion. AI voice synthesis now powers the majority of social security impersonation, IRS scam, and Medicare fraud calls.\n\nThe FTC is proposing new rules requiring caller ID authentication for AI-generated voice content. The Bipartisan TRACED Act enforcement actions resulted in 14 major carrier fines, but the volume continues to grow due to offshore operations.',
    timeAgo: '3 days ago', source: 'US Federal Trade Commission',
    tags: ['Robocall', 'FTC', 'AI Voice', 'USA'], svgVisual: '',
  },
  {
    id: 's5', country: 'MY', category: 'scam', severity: 'medium',
    title: 'MCMC Malaysia blocks 4,200 scam numbers in nationwide crackdown',
    summary: 'The Malaysian Communications and Multimedia Commission terminated over 4,200 phone numbers linked to organised vishing syndicates.',
    fullContent: 'The Malaysian Communications and Multimedia Commission (MCMC) conducted a nationwide enforcement sweep dubbed Ops Siber Sejahtera targeting vishing syndicates.\n\n4,200 active scam numbers were blocked across Maxis, Celcom, Digi, and Umobile networks. 830 unregistered prepaid SIMs were confiscated.\n\nMCMC is collaborating with PDRM, BNM, and AGC to prosecute operators under the CMA 1998 and AMLA 2001. Report suspicious numbers at aduan.mcmc.gov.my.',
    timeAgo: '6 hours ago', source: 'MCMC Malaysia',
    tags: ['MCMC', 'Enforcement', 'Malaysia', 'SIM Block'], svgVisual: '',
  },
  {
    id: 's6', country: 'UK', category: 'ai', severity: 'high',
    title: 'UK NCSC: "Hi Mum" WhatsApp scam evolves with AI voice clips',
    summary: 'The National Cyber Security Centre warns the family impersonation scam now uses AI-cloned voice snippets to bypass victim suspicion.',
    fullContent: 'The UK\'s National Cyber Security Centre (NCSC) and Action Fraud issued an updated advisory on the "Hi Mum" scam, where fraudsters impersonate family members in distress.\n\nThe latest iteration uses 3-5 second AI-cloned voice clips embedded in WhatsApp audio messages. Losses in England and Wales exceeded £1.5 million in H2 2024.\n\nThe NCSC recommends families establish a verbal codeword for financial emergencies and to always video-call back before sending money.',
    timeAgo: '12 hours ago', source: 'UK NCSC',
    tags: ['Hi Mum Scam', 'AI Clone', 'UK', 'Family Fraud'], svgVisual: '',
  },
].map(n => ({ ...n, svgVisual: makeSvg(n.severity, n.title) })) as NewsItem[]

// ── Server-side news fetch ────────────────────────────────────────────────────
async function fetchNewsFromServer(
  region: string,
  category: string,
  query: string,
): Promise<NewsItem[]> {
  const res = await fetch('/api/awareness/news', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ region, category, query }),
  })
  const data = await res.json()
  if (!res.ok) throw new Error(data.error || `Server error ${res.status}`)
  if (!Array.isArray(data.articles) || data.articles.length === 0)
    throw new Error('No articles returned')
  return data.articles.map((item: NewsItem) => ({
    ...item,
    svgVisual: makeSvg(item.severity, item.title),
  }))
}

// ── Nav ───────────────────────────────────────────────────────────────────────

// ─────────────────────────────────────────────────────────────────────────────
// Component
// ─────────────────────────────────────────────────────────────────────────────
export default function AwarenessPage() {
  const userEmail = 'user@example.com'
  const { t } = useLang()
  const NAV = [
    { label: t('nav_dashboard'),  icon: ActivityIcon,  href: '/dashboard', active: false, disabled: false, badge: '' },
    { label: t('nav_awareness'),  icon: BookOpenIcon,  href: '/awareness', active: true,  disabled: false, badge: '' },
    { label: t('nav_alerts'),     icon: BellIcon,      href: '/alerts',    active: false, disabled: false, badge: '' },
    { label: t('nav_detect'),       icon: PhoneIcon,     href: '/detect',    active: false, disabled: false, badge: '' },
  ]

  // News state
  const [news,        setNews]        = useState<NewsItem[]>(SEED)
  const [loading,     setLoading]     = useState(false)
  const [aiLoaded,    setAiLoaded]    = useState(false)
  const [errorMsg,    setErrorMsg]    = useState('')
  const [errorDetail, setErrorDetail] = useState('')
  const [expandedId,  setExpandedId]  = useState<string | null>(null)
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)

  // Filters
  const [region,     setRegion]     = useState('all')
  const [category,   setCategory]   = useState('all')
  const [inputVal,   setInputVal]   = useState('')
  const [searchQ,    setSearchQ]    = useState('')

  const searchRef = useRef<HTMLInputElement>(null)

  // Fetch news from secure server-side route
  // queryOverride lets handleSearch pass the fresh value before React state updates
  const loadNews = async (queryOverride?: string) => {
    setLoading(true)
    setErrorMsg('')
    setErrorDetail('')
    try {
      const q = queryOverride !== undefined ? queryOverride : searchQ
      const items = await fetchNewsFromServer(region, category, q)
      setNews(items)
      setAiLoaded(true)
      setExpandedId(null)
    } catch (e: unknown) {
      const msg = e instanceof Error ? e.message : String(e)
      setErrorMsg('Could not fetch live news — showing curated articles instead.')
      setErrorDetail(msg)
      setNews(SEED)
      setAiLoaded(false)
    } finally {
      setLoading(false)
    }
  }

  const handleSearch = (ev: React.FormEvent) => {
    ev.preventDefault()
    // Pass inputVal directly — React state (searchQ) won't update until next render
    setSearchQ(inputVal)
    loadNews(inputVal)
  }

  const filtered = news.filter(item => {
    const mr = region   === 'all' || item.country  === region   || item.country  === 'all'
    const mc = category === 'all' || item.category === category
    const mq = !searchQ ||
      item.title.toLowerCase().includes(searchQ.toLowerCase()) ||
      item.summary.toLowerCase().includes(searchQ.toLowerCase()) ||
      item.tags.some(t => t.toLowerCase().includes(searchQ.toLowerCase()))
    return mr && mc && mq
  })

  return (
    <div style={{ display: 'flex', flexDirection: 'column', minHeight: '100vh', background: 'var(--bg-primary)', fontFamily: "'Inter', sans-serif" }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&display=swap');

        .dash-sidebar {
          width: 240px; min-height: 100vh; background: #ffffff;
          border-right: 1px solid rgba(0,53,128,0.12); display: flex; flex-direction: column;
          padding: 1.5rem 1rem; position: sticky; top: 0; z-index: 20; flex-shrink: 0;
          box-shadow: 2px 0 12px rgba(0,53,128,0.06);
        }
        .nav-item {
          display: flex; align-items: center; gap: 12px; padding: 13px 14px; border-radius: 12px;
          font-size: 1rem; font-weight: 600; color: #3d5080; text-decoration: none;
          cursor: pointer; transition: background .2s, color .2s; border: none; background: none;
          width: 100%; text-align: left; margin-bottom: 4px; font-family: 'Inter', sans-serif; min-height: 50px;
        }
        .nav-item:hover:not(.nav-disabled) { background: rgba(0,53,128,0.07); color: #003580; }
        .nav-item.nav-active  { background: rgba(0,53,128,0.1); color: #003580; border-left: 3px solid #003580; }
        .nav-item.nav-disabled{ opacity: .45; cursor: default; }
        .nav-badge {
          margin-left: auto; font-size: .7rem; font-weight: 700; letter-spacing: .05em;
          padding: 3px 9px; border-radius: 99px;
          background: rgba(245,168,0,.15); color: #a07800; border: 1px solid rgba(245,168,0,.3);
        }
        .aw-main { flex: 1; min-width: 0; padding: 2rem 2.5rem; overflow-x: hidden; max-width: 900px; }
        @media(max-width:700px){
          .dash-sidebar{position:fixed;left:0;top:0;height:100vh;z-index:60;transform:translateX(-100%);transition:transform .28s cubic-bezier(.16,1,.3,1);box-shadow:4px 0 32px rgba(0,30,80,.18)}
          .dash-sidebar.mobile-open{transform:translateX(0)}
          .aw-main{padding:1rem 1rem 5rem}
          .mobile-top-bar{display:flex}
        }
        .mobile-top-bar{display:none;align-items:center;justify-content:space-between;padding:.75rem 1rem;background:#fff;border-bottom:1px solid rgba(0,53,128,.1);position:sticky;top:0;z-index:30;box-shadow:0 2px 8px rgba(0,53,128,.06)}
        .hamburger-btn{background:none;border:none;cursor:pointer;padding:8px;border-radius:10px;color:#003580;display:flex;align-items:center;justify-content:center;transition:background .2s;min-width:40px;min-height:40px}
        .hamburger-btn:hover{background:rgba(0,53,128,.08)}
        .sidebar-overlay{display:none}
        @media(max-width:700px){.sidebar-overlay{display:block;position:fixed;inset:0;background:rgba(0,30,80,.4);backdrop-filter:blur(3px);z-index:59}}
        @media(max-width:700px){.sidebar-close-mobile{display:flex!important}}

        /* hero */
        .aw-hero {
          background: linear-gradient(135deg,rgba(99,102,241,.12),rgba(139,92,246,.07));
          border: 1px solid rgba(99,102,241,.2); border-radius: 20px;
          padding: 1.75rem 2rem 1.5rem; margin-bottom: 1.5rem; position: relative; overflow: hidden;
        }
        .aw-hero::before {
          content:''; position:absolute; right:-60px; top:-60px; width:220px; height:220px;
          background:radial-gradient(circle,rgba(99,102,241,.2) 0%,transparent 70%);
          border-radius:50%; pointer-events:none;
        }
        .ai-badge {
          display:inline-flex; align-items:center; gap:5px; font-size:.68rem; font-weight:700;
          letter-spacing:.07em; text-transform:uppercase; padding:3px 10px; border-radius:99px;
          background:rgba(99,102,241,.18); border:1px solid rgba(99,102,241,.35); color:#a5b4fc; margin-bottom:.7rem;
        }

        /* key panel */
        .key-panel {
          background: rgba(99,102,241,.07); border: 1px solid rgba(99,102,241,.22);
          border-radius: 14px; padding: 1.25rem 1.5rem; margin-bottom: 1.5rem;
        }
        .key-input-wrap {
          display:flex; align-items:center; gap:8px;
          background: var(--bg-card); border: 1px solid var(--border);
          border-radius: 10px; padding: 0 12px; height: 42px; margin-top: 10px;
          transition: border-color .2s;
        }
        .key-input-wrap:focus-within { border-color: rgba(99,102,241,.5); }
        .key-input {
          flex:1; background:none; border:none; outline:none;
          color: var(--text-primary); font-size: .875rem; font-family:'Inter',sans-serif;
          letter-spacing:.04em;
        }
        .key-input::placeholder { color: var(--text-muted); }

        /* search */
        .search-wrap { display:flex; align-items:center; gap:8px; margin-bottom:1.5rem; }
        .search-box {
          flex:1; display:flex; align-items:center; gap:10px;
          background: var(--bg-card); border:1px solid var(--border);
          border-radius:12px; padding:0 14px; height:46px; transition:border-color .2s;
        }
        .search-box:focus-within { border-color: rgba(99,102,241,.5); }
        .search-input {
          flex:1; background:none; border:none; outline:none;
          color:var(--text-primary); font-size:.9rem; font-family:'Inter',sans-serif;
        }
        .search-input::placeholder { color:var(--text-muted); }
        .btn-primary {
          height:46px; padding:0 20px; border-radius:12px;
          background:linear-gradient(135deg,#6366f1,#8b5cf6); color:white;
          font-size:.875rem; font-weight:600; border:none; cursor:pointer;
          display:flex; align-items:center; gap:7px; white-space:nowrap;
          box-shadow:0 4px 14px rgba(99,102,241,.35); transition:opacity .2s;
          font-family:'Inter',sans-serif;
        }
        .btn-primary:hover:not(:disabled) { opacity:.88; }
        .btn-primary:disabled { opacity:.5; cursor:default; }
        .btn-icon {
          height:46px; width:46px; border-radius:12px; flex-shrink:0;
          background:var(--bg-card); border:1px solid var(--border);
          display:flex; align-items:center; justify-content:center;
          cursor:pointer; color:var(--text-secondary); transition:color .2s,border-color .2s;
          background:none;
        }
        .btn-icon:hover { color:var(--accent-primary); border-color:rgba(99,102,241,.35); }

        /* tabs */
        .tab-scroll {
          display:flex; gap:6px; overflow-x:auto; padding-bottom:4px; margin-bottom:1.5rem; scrollbar-width:none;
        }
        .tab-scroll::-webkit-scrollbar { display:none; }
        .rtab {
          display:flex; align-items:center; gap:6px; padding:7px 14px; border-radius:99px;
          font-size:.82rem; font-weight:600; white-space:nowrap;
          border:1px solid var(--border); background:var(--bg-card);
          color:var(--text-secondary); cursor:pointer; transition:all .2s; font-family:'Inter',sans-serif;
        }
        .rtab:hover { border-color:rgba(99,102,241,.3); color:var(--text-primary); }
        .rtab.active { background:rgba(99,102,241,.14); border-color:rgba(99,102,241,.4); color:var(--accent-primary); }
        .ctab {
          padding:6px 14px; border-radius:99px; font-size:.8rem; font-weight:600; white-space:nowrap;
          border:1px solid var(--border); background:transparent;
          color:var(--text-muted); cursor:pointer; transition:all .2s; font-family:'Inter',sans-serif;
        }
        .ctab:hover { color:var(--text-primary); border-color:rgba(99,102,241,.25); }
        .ctab.active { background:rgba(99,102,241,.12); border-color:rgba(99,102,241,.35); color:var(--accent-primary); }

        /* error banner */
        .err-banner {
          background:rgba(248,113,113,.07); border:1px solid rgba(248,113,113,.25);
          border-radius:12px; padding:12px 16px; margin-bottom:1.25rem; font-size:.835rem; color:#fca5a5;
        }
        .err-detail {
          margin-top:8px; font-size:.75rem; color:rgba(252,165,165,.7);
          background:rgba(0,0,0,.2); border-radius:8px; padding:8px 10px;
          font-family:monospace; word-break:break-all; line-height:1.5;
        }
        .warn-banner {
          background:rgba(251,146,60,.07); border:1px solid rgba(251,146,60,.22);
          border-radius:10px; padding:10px 14px; margin-bottom:1.25rem;
          font-size:.82rem; color:#fdba74; display:flex; align-items:center; gap:8px;
        }

        /* news card */
        .news-card {
          background:var(--bg-card); border:1px solid var(--border);
          border-radius:16px; overflow:hidden; margin-bottom:12px;
          transition:border-color .2s, transform .18s;
        }
        .news-card:hover { transform:translateY(-1px); }
        .news-meta {
          display:flex; align-items:center; gap:8px; flex-wrap:wrap; padding:1rem 1.25rem 0;
        }
        .sev-pill {
          font-size:.67rem; font-weight:700; letter-spacing:.05em; text-transform:uppercase;
          padding:3px 10px; border-radius:99px; border:1px solid; flex-shrink:0;
        }
        .cat-chip {
          font-size:.68rem; font-weight:600; padding:2px 8px; border-radius:6px;
          background:rgba(99,102,241,.1); color:#a5b4fc; border:1px solid rgba(99,102,241,.18);
        }
        .news-time { font-size:.72rem; color:var(--text-muted); margin-left:auto; }
        .news-title { font-size:.975rem; font-weight:700; color:var(--text-primary); margin:.6rem 1.25rem .4rem; line-height:1.4; }
        .news-summary { font-size:.845rem; color:var(--text-secondary); line-height:1.55; margin:0 1.25rem .6rem; }
        .news-tags { display:flex; gap:5px; flex-wrap:wrap; margin:0 1.25rem .75rem; }
        .tag-pill {
          font-size:.68rem; padding:2px 8px; border-radius:6px;
          background:rgba(255,255,255,.04); border:1px solid rgba(255,255,255,.07); color:var(--text-muted);
        }

        /* visual insight panel (always visible) */
        .visual-insight-wrap {
          margin: 0 1.25rem .75rem;
          border-radius: 12px;
          overflow: hidden;
          border: 1px solid rgba(255,255,255,.07);
        }
        .senior-insight-panel {
          margin: 0 1.25rem .5rem;
          padding: 12px 16px;
          border-radius: 12px;
          background: #0f172a;
          border: 1px solid #1e3a5f;
          display: flex;
          gap: 10px;
          align-items: flex-start;
        }
        .senior-insight-icon {
          font-size: 1.25rem;
          flex-shrink: 0;
          margin-top: 1px;
          line-height: 1;
        }
        .senior-insight-label {
          font-size: .65rem;
          font-weight: 800;
          letter-spacing: .07em;
          text-transform: uppercase;
          color: #34d399;
          margin-bottom: 4px;
        }
        .senior-insight-text {
          font-size: .84rem;
          color: #e2e8f0;
          line-height: 1.6;
          margin: 0;
          font-weight: 500;
        }

        .expand-btn {
          display:flex; align-items:center; gap:5px; padding:8px 1.25rem 1rem;
          background:none; border:none; cursor:pointer; font-size:.8rem; font-weight:600;
          color:var(--accent-primary); font-family:'Inter',sans-serif; transition:opacity .2s;
        }
        .expand-btn:hover { opacity:.75; }
        .chevron { transition:transform .25s; }
        .chevron.open { transform:rotate(180deg); }
        .news-full {
          border-top:1px solid rgba(255,255,255,.06); padding:1.25rem;
          animation:revealDown .25s cubic-bezier(.16,1,.3,1);
        }
        @keyframes revealDown { from{opacity:0;transform:translateY(-8px)} to{opacity:1;transform:translateY(0)} }
        .news-full p { font-size:.875rem; color:var(--text-secondary); line-height:1.7; margin-bottom:12px; }
        .source-row { display:flex; align-items:center; gap:6px; margin-top:.5rem; font-size:.78rem; color:var(--text-muted); }
        .source-dot { width:6px; height:6px; border-radius:50%; background:#34d399; flex-shrink:0; }

        /* skeleton */
        .skeleton {
          background:linear-gradient(90deg,rgba(255,255,255,.04) 0%,rgba(255,255,255,.08) 50%,rgba(255,255,255,.04) 100%);
          background-size:200% 100%; animation:shimmer 1.5s infinite; border-radius:8px;
        }
        @keyframes shimmer { 0%{background-position:-200% 0} 100%{background-position:200% 0} }
        .skel-card { background:var(--bg-card); border:1px solid var(--border); border-radius:16px; padding:1.25rem; margin-bottom:12px; }

        .count-badge {
          display:inline-flex; align-items:center; font-size:.72rem; font-weight:700;
          padding:2px 8px; border-radius:99px;
          background:rgba(99,102,241,.12); color:#a5b4fc; border:1px solid rgba(99,102,241,.22);
          margin-left:8px;
        }
        .empty-state { text-align:center; padding:4rem 2rem; color:var(--text-muted); font-size:.9rem; }

        .btn-sm {
          display:inline-flex; align-items:center; gap:5px; padding:6px 14px; border-radius:8px;
          font-size:.8rem; font-weight:600; border:none; cursor:pointer; font-family:'Inter',sans-serif; transition:opacity .2s;
        }
        .btn-sm:hover { opacity:.85; }
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
            <ShieldIcon size={16} />
          </div>
          <span style={{fontWeight:800,fontSize:'.95rem',color:'#003580'}}>VoiceGuard</span>
        </div>
        <div style={{width:36,height:36,borderRadius:'50%',background:'linear-gradient(135deg,#003580,#1a4fa0)',display:'flex',alignItems:'center',justifyContent:'center',fontSize:'.85rem',fontWeight:700,color:'white'}}>
          U
        </div>
      </div>

      {/* ── Mobile overlay ── */}
      {mobileMenuOpen && (
        <div className="sidebar-overlay" onClick={() => setMobileMenuOpen(false)} />
      )}

      <div style={{display:'flex',flex:1}}>

      {/* ── Sidebar ── */}
      <aside className={`dash-sidebar${mobileMenuOpen ? ' mobile-open' : ''}`} style={{ position: 'relative' }}>
        <div style={{ position:'absolute',top:0,left:0,right:0,height:'4px',background:'linear-gradient(90deg,#003580,#1a4fa0,#CC0001)' }}/>
        <button onClick={() => setMobileMenuOpen(false)}
          style={{display:'none',position:'absolute',top:12,right:12,background:'none',border:'none',cursor:'pointer',padding:6,borderRadius:8,color:'#8898bb'}}
          className="sidebar-close-mobile" aria-label="Close menu">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>
          </svg>
        </button>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: '2rem', paddingLeft: 4, marginTop: '0.75rem' }}>
          <div style={{ width: 40, height: 40, borderRadius: 11, background: 'linear-gradient(135deg,#003580,#1a4fa0)', display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 4px 14px rgba(0,53,128,.3)' }}>
            <ShieldIcon size={18} />
          </div>
          <span style={{ fontWeight: 800, fontSize: '1.05rem', letterSpacing: '-0.02em', color: '#003580' }}>
            VoiceGuard
          </span>
        </div>
        <nav style={{ flex: 1 }}>
          <div style={{ fontSize: '.7rem', fontWeight: 800, letterSpacing: '.1em', textTransform: 'uppercase', color: '#8898bb', padding: '0 14px', marginBottom: 10 }}>Main Menu</div>
          {NAV.map(item => (
            <Link key={item.label} href={item.disabled ? '#' : item.href}
              className={`nav-item${item.active ? ' nav-active' : ''}${item.disabled ? ' nav-disabled' : ''}`}>
              <item.icon size={20} />{item.label}
              {item.badge && <span className="nav-badge">{item.badge}</span>}
            </Link>
          ))}
        </nav>
        <SidebarUserPanel />
      </aside>

      {/* ── Main ── */}
      <main className="aw-main">

        {/* Hero */}
        <div className="aw-hero">
          <div style={{display:"flex",justifyContent:"flex-end",marginBottom:".5rem"}}><LanguageSwitcher/></div>
          <div className="ai-badge"><SparklesIcon size={11} /> {t('hub_ai_badge')}</div>
          <h1 style={{ fontSize: '1.35rem', fontWeight: 800, color: 'var(--text-primary)', letterSpacing: '-0.025em', marginBottom: '.4rem' }}>
            {t('awareness_title')}
          </h1>
          <p style={{ fontSize: '.855rem', color: 'var(--text-secondary)', lineHeight: 1.65, maxWidth: 520, marginBottom: 0 }}>
            {t('awareness_sub')}
          </p>
        </div>

        {/* Live news info banner */}
        <div className="warn-banner" style={{ background: 'rgba(52,211,153,.07)', borderColor: 'rgba(52,211,153,.22)', color: '#6ee7b7' }}>
          <GlobeIcon size={14} />
          <span>Live cyber news powered by <strong style={{ color: 'var(--text-primary)' }}>NewsAPI</strong> · Senior safety insights by <strong style={{ color: 'var(--text-primary)' }}>Gemini AI</strong></span>
          <button className="btn-sm" style={{ marginLeft: 'auto', background: 'rgba(52,211,153,.12)', color: '#34d399' }}
            onClick={() => loadNews()} disabled={loading}>
            <RefreshIcon size={12} /> Refresh
          </button>
        </div>

        {/* Error banner with full debug detail */}
        {errorMsg && (
          <div className="err-banner">
            <div style={{ display: 'flex', alignItems: 'center', gap: 7, marginBottom: errorDetail ? 6 : 0 }}>
              <AlertTriangleIcon size={15} />
              <span>{errorMsg}</span>
            </div>
            {errorDetail && (
              <div className="err-detail">
                <strong>Debug:</strong> {errorDetail}
              </div>
            )}
          </div>
        )}

        {/* Search */}
        <form className="search-wrap" onSubmit={handleSearch}>
          <div className="search-box">
            <SearchIcon size={16} />
            <input ref={searchRef} className="search-input"
              placeholder={t('awareness_search_ph')}
              value={inputVal}
              onChange={e => setInputVal(e.target.value)} />
            {inputVal && (
              <button type="button" onClick={() => { setInputVal(''); setSearchQ('') }}
                style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-muted)', padding: 2, display: 'flex' }}>
                <XIcon size={14} />
              </button>
            )}
          </div>
          <button type="submit" className="btn-primary" disabled={loading}>
            <SparklesIcon size={14} />{loading ? t('awareness_ai_search') : t('awareness_ai_search')}
          </button>
          <button type="button" className="btn-icon" style={{ border: '1px solid var(--border)' }}
            onClick={() => loadNews()} disabled={loading} title="Refresh AI news">
            <RefreshIcon size={15} />
          </button>
        </form>

        {/* Region tabs */}
        <div style={{ marginBottom: '.5rem' }}>
          <div style={{ fontSize: '.68rem', fontWeight: 700, letterSpacing: '.08em', textTransform: 'uppercase', color: 'var(--text-muted)', marginBottom: '.6rem' }}>{t('awareness_region')}</div>
          <div className="tab-scroll">
            {REGIONS.map(r => (
              <button key={r.id} className={`rtab${region === r.id ? ' active' : ''}`} onClick={() => setRegion(r.id)}>
                <span style={{ fontSize: '1rem' }}>{r.flag}</span>{r.label}
              </button>
            ))}
          </div>
        </div>

        {/* Category tabs */}
        <div style={{ marginBottom: '1.5rem' }}>
          <div style={{ fontSize: '.68rem', fontWeight: 700, letterSpacing: '.08em', textTransform: 'uppercase', color: 'var(--text-muted)', marginBottom: '.6rem' }}>{t('awareness_category')}</div>
          <div className="tab-scroll">
            {CATEGORIES.map(c => (
              <button key={c.id} className={`ctab${category === c.id ? ' active' : ''}`} onClick={() => setCategory(c.id)}>
                {c.label}
              </button>
            ))}
          </div>
        </div>

        {/* Count + source */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: '1rem' }}>
          <span style={{ fontSize: '.75rem', fontWeight: 700, letterSpacing: '.06em', textTransform: 'uppercase', color: 'var(--text-muted)' }}>
            {aiLoaded ? `✨ ${t('awareness_ai_news')}` : `📌 ${t('awareness_curated')}`}
          </span>
          <span className="count-badge">{filtered.length} {t('awareness_articles')}</span>
          {!aiLoaded && !loading && (
            <button onClick={() => loadNews()}
              style={{ marginLeft: 4, background: 'none', border: 'none', cursor: 'pointer', fontSize: '.75rem', color: 'var(--accent-primary)', fontWeight: 600, fontFamily: 'Inter, sans-serif', display: 'flex', alignItems: 'center', gap: 4 }}>
              <SparklesIcon size={12}/>{t('awareness_load_live')}
            </button>
          )}
        </div>

        {/* Skeletons */}
        {loading && [1,2,3].map(i => (
          <div key={i} className="skel-card">
            <div style={{ display:'flex', gap:8, marginBottom:12 }}>
              <div className="skeleton" style={{ width:60, height:22, borderRadius:99 }}/>
              <div className="skeleton" style={{ width:80, height:22, borderRadius:99 }}/>
              <div className="skeleton" style={{ width:70, height:22, borderRadius:99, marginLeft:'auto' }}/>
            </div>
            <div className="skeleton" style={{ height:18, width:'80%', marginBottom:8 }}/>
            <div className="skeleton" style={{ height:14, width:'95%', marginBottom:6 }}/>
            <div className="skeleton" style={{ height:14, width:'65%' }}/>
          </div>
        ))}

        {/* Empty state */}
        {!loading && filtered.length === 0 && (
          <div className="empty-state">
            <SearchIcon size={40} />
            <p>No articles match your filters.</p>
            <p style={{ fontSize:'.82rem', marginTop:4 }}>Try changing region, category, or search term.</p>
          </div>
        )}

        {/* News cards */}
        {!loading && filtered.map(item => {
          const sev    = SEV[item.severity] ?? SEV.info
          const isOpen = expandedId === item.id
          const reg    = REGIONS.find(r => r.id === item.country)
          // Build the visual infographic for this card (always shown)
          const visualSvg = makeVisualInsight(item.severity, item.category, item.title)
          return (
            <div key={item.id} className="news-card"
              style={{ borderColor: sev.border, boxShadow: isOpen ? `0 0 28px ${sev.bg}` : `0 0 0 0 transparent` }}>

              <div className="news-meta">
                <span className="sev-pill" style={{ color:sev.color, background:sev.bg, borderColor:sev.border }}>{sev.label}</span>
                <span className="cat-chip">{CATEGORIES.find(c => c.id === item.category)?.label ?? item.category}</span>
                {reg && <span style={{ fontSize:'.74rem', color:'var(--text-muted)' }}>{reg.flag} {reg.label}</span>}
                <span className="news-time">{item.timeAgo}</span>
              </div>

              <div className="news-title">{item.title}</div>
              <div className="news-summary">{item.summary}</div>
              <div className="news-tags">
                {item.tags.map(tag => <span key={tag} className="tag-pill">#{tag}</span>)}
              </div>

              {/* ── Visual Insight — always visible ── */}
              <div className="visual-insight-wrap"
                dangerouslySetInnerHTML={{ __html: visualSvg }} />

              {/* ── Senior Citizen Insight — always visible ── */}
              {item.seniorInsight && (
                <div className="senior-insight-panel">
                  <div className="senior-insight-icon">👴</div>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div className="senior-insight-label">💡 What This Means For You</div>
                    <p className="senior-insight-text">{item.seniorInsight}</p>
                  </div>
                </div>
              )}

              <button className="expand-btn" onClick={() => setExpandedId(isOpen ? null : item.id)}>
                {isOpen ? t('awareness_show_less') : t('awareness_read_full')}
                <span className={`chevron${isOpen ? ' open' : ''}`}><ChevronDownIcon size={14}/></span>
              </button>

              {isOpen && (
                <div className="news-full">
                  {/* Source row */}
                  <div className="source-row" style={{ marginBottom: 14 }}>
                    <span className="source-dot"/>
                    {t('awareness_source')}: <strong style={{ color:'var(--text-secondary)', marginLeft:3 }}>{item.source}</strong>
                  </div>

                  {/* Read Full Article link */}
                  {item.url ? (
                    <a
                      href={item.url}
                      target="_blank"
                      rel="noreferrer"
                      style={{
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: 8,
                        padding: '10px 20px',
                        borderRadius: 10,
                        background: 'linear-gradient(135deg,#6366f1,#8b5cf6)',
                        color: 'white',
                        fontFamily: "'Inter',sans-serif",
                        fontSize: '.875rem',
                        fontWeight: 700,
                        textDecoration: 'none',
                        boxShadow: '0 4px 16px rgba(99,102,241,.35)',
                        transition: 'opacity .2s',
                      }}
                      onMouseOver={e => (e.currentTarget.style.opacity = '0.88')}
                      onMouseOut={e => (e.currentTarget.style.opacity = '1')}
                    >
                      <ExternalLinkIcon size={15}/>
                      Read Full Article
                    </a>
                  ) : (
                    <div style={{
                      display: 'inline-flex', alignItems: 'center', gap: 8,
                      padding: '10px 18px', borderRadius: 10,
                      background: 'rgba(255,255,255,.05)', border: '1px solid rgba(255,255,255,.1)',
                      color: 'var(--text-muted)', fontSize: '.84rem', fontFamily: "'Inter',sans-serif",
                    }}>
                      <ExternalLinkIcon size={14}/>
                      No external link available
                    </div>
                  )}
                </div>
              )}
            </div>
          )
        })}
      </main>
      </div>{/* end flex row */}
    </div>
  )
}
