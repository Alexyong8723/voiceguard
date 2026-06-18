'use client'

import { useState, useRef, useEffect, useCallback } from 'react'
import Link from 'next/link'
import { useLang, LanguageSwitcher } from '@/lib/LanguageContext'
import { SidebarUserPanel } from '@/lib/SidebarUserPanel'

// ── Icons ─────────────────────────────────────────────────────────────────────
const ShieldIcon = ({ s = 20 }: { s?: number }) => <svg width={s} height={s} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" /></svg>
const BellIcon = ({ s = 20 }: { s?: number }) => <svg width={s} height={s} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9" /><path d="M13.73 21a2 2 0 0 1-3.46 0" /></svg>
const BookIcon = ({ s = 20 }: { s?: number }) => <svg width={s} height={s} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z" /><path d="M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z" /></svg>
const ActivityIcon = ({ s = 20 }: { s?: number }) => <svg width={s} height={s} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="22 12 18 12 15 21 9 3 6 12 2 12" /></svg>
const MicIcon = ({ s = 20 }: { s?: number }) => <svg width={s} height={s} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 1a3 3 0 0 0-3 3v8a3 3 0 0 0 6 0V4a3 3 0 0 0-3-3z" /><path d="M19 10v2a7 7 0 0 1-14 0v-2" /><line x1="12" y1="19" x2="12" y2="23" /><line x1="8" y1="23" x2="16" y2="23" /></svg>
const MicOffIcon = ({ s = 20 }: { s?: number }) => <svg width={s} height={s} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="1" y1="1" x2="23" y2="23" /><path d="M9 9v3a3 3 0 0 0 5.12 2.12M15 9.34V4a3 3 0 0 0-5.94-.6" /><path d="M17 16.95A7 7 0 0 1 5 12v-2m14 0v2a7 7 0 0 1-.11 1.23" /><line x1="12" y1="19" x2="12" y2="23" /><line x1="8" y1="23" x2="16" y2="23" /></svg>
const UploadIcon = ({ s = 20 }: { s?: number }) => <svg width={s} height={s} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="16 16 12 12 8 16" /><line x1="12" y1="12" x2="12" y2="21" /><path d="M20.39 18.39A5 5 0 0 0 18 9h-1.26A8 8 0 1 0 3 16.3" /></svg>
const CheckIcon = ({ s = 20 }: { s?: number }) => <svg width={s} height={s} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12" /></svg>
const XCircleIcon = ({ s = 20 }: { s?: number }) => <svg width={s} height={s} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10" /><line x1="15" y1="9" x2="9" y2="15" /><line x1="9" y1="9" x2="15" y2="15" /></svg>
const SparklesIcon = ({ s = 14 }: { s?: number }) => <svg width={s} height={s} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m12 3-1.912 5.813a2 2 0 0 1-1.275 1.275L3 12l5.813 1.912a2 2 0 0 1 1.275 1.275L12 21l1.912-5.813a2 2 0 0 1 1.275-1.275L21 12l-5.813-1.912a2 2 0 0 1-1.275-1.275L12 3Z" /><path d="M5 3v4" /><path d="M3 5h4" /><path d="M19 17v4" /><path d="M17 19h4" /></svg>
const TrashIcon = ({ s = 14 }: { s?: number }) => <svg width={s} height={s} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="3 6 5 6 21 6" /><path d="M19 6l-1 14H6L5 6" /><path d="M10 11v6" /><path d="M14 11v6" /><path d="M9 6V4h6v2" /></svg>
const StopIcon = ({ s = 20 }: { s?: number }) => <svg width={s} height={s} viewBox="0 0 24 24" fill="currentColor" stroke="none"><rect x="4" y="4" width="16" height="16" rx="2" /></svg>
const AlertTriIcon = ({ s = 16 }: { s?: number }) => <svg width={s} height={s} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m21.73 18-8-14a2 2 0 0 0-3.48 0l-8 14A2 2 0 0 0 4 21h16a2 2 0 0 0 1.73-3z" /><line x1="12" y1="9" x2="12" y2="13" /><line x1="12" y1="17" x2="12.01" y2="17" /></svg>
const InfoIcon = ({ s = 16 }: { s?: number }) => <svg width={s} height={s} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10" /><line x1="12" y1="16" x2="12" y2="12" /><line x1="12" y1="8" x2="12.01" y2="8" /></svg>

// ── Types ─────────────────────────────────────────────────────────────────────
interface PredictResult {
  label: 'REAL' | 'FAKE'
  confidence: number
  real_prob: number
  fake_prob: number
  device: string
}

interface ScanRecord {
  id: string
  filename: string
  label: 'REAL' | 'FAKE'
  confidence: number
  real_prob: number
  fake_prob: number
  timestamp: Date
  source: 'upload' | 'recording'
}

type AppState = 'idle' | 'recording' | 'processing' | 'result' | 'error'

// ── Helpers ───────────────────────────────────────────────────────────────────
function fmtPct(v: number) { return `${(v * 100).toFixed(1)}%` }
function fmtTime(d: Date) {
  return d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })
}

// ── Animated SVG confidence ring ─────────────────────────────────────────────
function ConfidenceRing({ value, isFake }: { value: number; isFake: boolean }) {
  const R = 54
  const C = 2 * Math.PI * R
  const dash = C * value

  const color = isFake ? '#f87171' : '#34d399'
  const glow = isFake ? 'rgba(248,113,113,0.35)' : 'rgba(52,211,153,0.35)'

  return (
    <svg width={130} height={130} style={{ display: 'block' }}>
      <defs>
        <filter id="ring-glow">
          <feGaussianBlur stdDeviation="4" result="blur" />
          <feMerge><feMergeNode in="blur" /><feMergeNode in="SourceGraphic" /></feMerge>
        </filter>
      </defs>
      {/* Background track */}
      <circle cx={65} cy={65} r={R} fill="none" stroke="rgba(255,255,255,0.06)" strokeWidth={10} />
      {/* Progress arc */}
      <circle
        cx={65} cy={65} r={R}
        fill="none"
        stroke={color}
        strokeWidth={10}
        strokeLinecap="round"
        strokeDasharray={`${dash} ${C}`}
        strokeDashoffset={C * 0.25}  /* start at top */
        style={{
          transform: 'rotate(-90deg)',
          transformOrigin: '65px 65px',
          filter: `drop-shadow(0 0 8px ${glow})`,
          transition: 'stroke-dasharray 1s cubic-bezier(.34,1.56,.64,1)',
        }}
      />
      {/* Glow centre */}
      <circle cx={65} cy={65} r={40} fill={`${color}0A`} />
      {/* Text */}
      <text x={65} y={60} textAnchor="middle" fill={color}
        fontSize={22} fontWeight={800} fontFamily="Inter,sans-serif">
        {fmtPct(value)}
      </text>
      <text x={65} y={76} textAnchor="middle" fill="rgba(255,255,255,0.45)"
        fontSize={10} fontFamily="Inter,sans-serif" fontWeight={600}>
        CONFIDENCE
      </text>
    </svg>
  )
}

// ── Waveform canvas visualiser ────────────────────────────────────────────────
function WaveformVisualiser({ analyser, active }: { analyser: AnalyserNode | null; active: boolean }) {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const rafRef = useRef<number>(0)

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas || !analyser || !active) return
    const ctx = canvas.getContext('2d')!
    const buf = new Uint8Array(analyser.frequencyBinCount)

    const draw = () => {
      rafRef.current = requestAnimationFrame(draw)
      analyser.getByteTimeDomainData(buf)

      const { width: W, height: H } = canvas
      ctx.clearRect(0, 0, W, H)

      // Gradient stroke
      const grad = ctx.createLinearGradient(0, 0, W, 0)
      grad.addColorStop(0, 'rgba(99,102,241,0.6)')
      grad.addColorStop(0.5, 'rgba(139,92,246,0.9)')
      grad.addColorStop(1, 'rgba(99,102,241,0.6)')

      ctx.beginPath()
      ctx.lineWidth = 2.5
      ctx.strokeStyle = grad

      const sliceW = W / buf.length
      let x = 0
      for (let i = 0; i < buf.length; i++) {
        const y = (buf[i] / 128.0) * (H / 2)
        i === 0 ? ctx.moveTo(x, y) : ctx.lineTo(x, y)
        x += sliceW
      }
      ctx.stroke()
    }
    draw()
    return () => cancelAnimationFrame(rafRef.current)
  }, [analyser, active])

  return (
    <canvas
      ref={canvasRef}
      width={560}
      height={80}
      style={{ width: '100%', height: 80, borderRadius: 12 }}
    />
  )
}

// ── Probability bar ────────────────────────────────────────────────────────────
function ProbBar({ label, value, color, delay = 0 }: { label: string; value: number; color: string; delay?: number }) {
  const [width, setWidth] = useState(0)
  useEffect(() => {
    const t = setTimeout(() => setWidth(value * 100), delay)
    return () => clearTimeout(t)
  }, [value, delay])

  return (
    <div style={{ marginBottom: 10 }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 4 }}>
        <span style={{ fontSize: '.8rem', fontWeight: 600, color: 'var(--text-secondary)' }}>{label}</span>
        <span style={{ fontSize: '.8rem', fontWeight: 700, color }}>{fmtPct(value)}</span>
      </div>
      <div style={{ height: 8, background: 'rgba(255,255,255,0.07)', borderRadius: 99, overflow: 'hidden' }}>
        <div style={{
          height: '100%',
          width: `${width}%`,
          background: color,
          borderRadius: 99,
          boxShadow: `0 0 8px ${color}60`,
          transition: 'width 1s cubic-bezier(.34,1.56,.64,1)',
        }} />
      </div>
    </div>
  )
}

// ── Main Page ─────────────────────────────────────────────────────────────────
export default function DetectPage() {
  const { t } = useLang()

  const NAV = [
    { label: t('nav_dashboard'), icon: ActivityIcon, href: '/dashboard', active: false },
    { label: t('nav_awareness'), icon: BookIcon, href: '/awareness', active: false },
    { label: t('nav_alerts'), icon: BellIcon, href: '/alerts', active: false },
    { label: t('nav_detect'), icon: MicIcon, href: '/detect', active: true },
  ]

  // ── State ───────────────────────────────────────────────────────────────
  const [state, setState] = useState<AppState>('idle')
  const [result, setResult] = useState<PredictResult | null>(null)
  const [errorMsg, setErrorMsg] = useState('')
  const [dragOver, setDragOver] = useState(false)
  const [fileName, setFileName] = useState('')
  const [fileSize, setFileSize] = useState(0)
  const [history, setHistory] = useState<ScanRecord[]>([])
  const [recSeconds, setRecSeconds] = useState(0)
  const [backendOk, setBackendOk] = useState<boolean | null>(null)
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)

  // Recording refs
  const analyserRef = useRef<AnalyserNode | null>(null)
  const mediaRecRef = useRef<MediaRecorder | null>(null)
  const chunksRef = useRef<Blob[]>([])
  const streamRef = useRef<MediaStream | null>(null)
  const recTimerRef = useRef<ReturnType<typeof setInterval> | null>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)
  const progTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  // ── Progress bar ──────────────────────────────────────────────────────────
  const [progStage, setProgStage] = useState(0)
  const [progPct, setProgPct] = useState(0)

  const STAGES = [
    { label: t('detect_stage1'), pct: 15, ms: 400 },
    { label: t('detect_stage2'), pct: 38, ms: 900 },
    { label: t('detect_stage3'), pct: 75, ms: 3500 },
    { label: t('detect_stage4'), pct: 92, ms: 1000 },
  ]

  const startProgressBar = useCallback(() => {
    if (progTimerRef.current) clearTimeout(progTimerRef.current)
    setProgStage(0); setProgPct(0)
    let stage = 0
    const advance = () => {
      if (stage >= STAGES.length) return
      const { pct, ms } = STAGES[stage]
      setProgStage(stage); setProgPct(pct)
      stage++
      progTimerRef.current = setTimeout(advance, ms)
    }
    advance()
  }, []) // eslint-disable-line react-hooks/exhaustive-deps

  const stopProgressBar = useCallback((success: boolean) => {
    if (progTimerRef.current) clearTimeout(progTimerRef.current)
    setProgPct(success ? 100 : 0)
  }, [])

  // ── Health probe ────────────────────────────────────────────────────────
  useEffect(() => {
    fetch('/api/detect')
      .then(r => setBackendOk(r.ok))
      .catch(() => setBackendOk(false))
  }, [])

  // ── Audio upload & analyse ───────────────────────────────────────────────
  const runInference = useCallback(async (blob: Blob, name: string, source: 'upload' | 'recording') => {
    setState('processing')
    setErrorMsg('')
    setResult(null)
    setFileName(name)
    setFileSize(blob.size)
    startProgressBar()
    const form = new FormData()
    form.append('audio', blob, name)

    try {
      const res = await fetch('/api/detect', { method: 'POST', body: form })
      const data = await res.json()

      if (!res.ok) {
        throw new Error(data.error || `Server error ${res.status}`)
      }

      const pred = data as PredictResult
      stopProgressBar(true)
      setResult(pred)
      setState('result')

      setHistory(prev => [
        {
          id: `scan-${Date.now()}`,
          filename: name,
          label: pred.label,
          confidence: pred.confidence,
          real_prob: pred.real_prob,
          fake_prob: pred.fake_prob,
          timestamp: new Date(),
          source,
        },
        ...prev.slice(0, 9), // keep last 10
      ])
    } catch (e: unknown) {
      const msg = e instanceof Error ? e.message : String(e)
      stopProgressBar(false)
      setErrorMsg(msg)
      setState('error')
    }
  }, [startProgressBar, stopProgressBar]) // eslint-disable-line react-hooks/exhaustive-deps

  const handleFile = useCallback((file: File) => {
    const allowed = ['.wav', '.flac', '.mp3', '.m4a', '.ogg']
    const ext = file.name.toLowerCase().match(/\.[^.]+$/)?.[0] ?? ''
    if (!allowed.includes(ext)) {
      setErrorMsg(`Unsupported format "${ext}". Please use WAV, FLAC, MP3, M4A, or OGG.`)
      setState('error')
      return
    }
    runInference(file, file.name, 'upload')
  }, [runInference])

  // ── Drop zone ────────────────────────────────────────────────────────────
  const onDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    setDragOver(false)
    const file = e.dataTransfer.files?.[0]
    if (file) handleFile(file)
  }, [handleFile])

  // ── Microphone recording ─────────────────────────────────────────────────
  const startRecording = useCallback(async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true })
      streamRef.current = stream

      // Set up analyser for waveform
      const audioCtx = new AudioContext()
      const source = audioCtx.createMediaStreamSource(stream)
      const analyser = audioCtx.createAnalyser()
      analyser.fftSize = 2048
      source.connect(analyser)
      analyserRef.current = analyser

      // MediaRecorder — prefer WAV-like codecs
      const mimeType = MediaRecorder.isTypeSupported('audio/webm;codecs=pcm')
        ? 'audio/webm;codecs=pcm'
        : MediaRecorder.isTypeSupported('audio/webm')
          ? 'audio/webm'
          : ''

      const rec = new MediaRecorder(stream, mimeType ? { mimeType } : undefined)
      mediaRecRef.current = rec
      chunksRef.current = []

      rec.ondataavailable = e => { if (e.data.size > 0) chunksRef.current.push(e.data) }

      rec.onstop = () => {
        const blob = new Blob(chunksRef.current, { type: rec.mimeType || 'audio/webm' })
        const ext = rec.mimeType.includes('ogg') ? '.ogg' : '.webm'
        runInference(blob, `recording${ext}`, 'recording')
        stream.getTracks().forEach(t => t.stop())
        streamRef.current = null
        analyserRef.current = null
      }

      rec.start(100)
      setState('recording')
      setRecSeconds(0)
      recTimerRef.current = setInterval(() => setRecSeconds(s => s + 1), 1000)
    } catch (err) {
      const msg = err instanceof Error ? err.message : String(err)
      setErrorMsg(`Microphone error: ${msg}`)
      setState('error')
    }
  }, [runInference])

  const stopRecording = useCallback(() => {
    if (recTimerRef.current) clearInterval(recTimerRef.current)
    mediaRecRef.current?.stop()
    setState('processing')
  }, [])

  const resetAll = useCallback(() => {
    setState('idle')
    setResult(null)
    setErrorMsg('')
    setFileName('')
    setFileSize(0)
    setRecSeconds(0)
  }, [])

  // ── Derived values ────────────────────────────────────────────────────────
  const isFake = result?.label === 'FAKE'
  const resultColor = isFake ? '#f87171' : '#34d399'
  const resultBg = isFake ? 'rgba(248,113,113,0.08)' : 'rgba(52,211,153,0.08)'
  const resultBorder = isFake ? 'rgba(248,113,113,0.25)' : 'rgba(52,211,153,0.25)'

  // ── Render ────────────────────────────────────────────────────────────────
  return (
    <div style={{ display: 'flex', flexDirection: 'column', minHeight: '100vh', background: 'var(--bg-primary)', fontFamily: "'Inter',sans-serif" }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&display=swap');

        /* ── Sidebar (matches Dashboard white style) ── */
        .det-sidebar{width:240px;min-height:100vh;background:#ffffff;border-right:1px solid rgba(0,53,128,0.12);display:flex;flex-direction:column;padding:1.5rem 1rem;position:sticky;top:0;z-index:20;flex-shrink:0;box-shadow:2px 0 12px rgba(0,53,128,0.06)}
        .det-main{flex:1;min-width:0;padding:2rem 2.5rem;overflow-x:hidden;max-width:820px}
        @media(max-width:768px){
          .det-sidebar{position:fixed;left:0;top:0;width:240px;height:100vh;z-index:60;transform:translateX(-100%);transition:transform .28s cubic-bezier(.16,1,.3,1);box-shadow:4px 0 32px rgba(0,30,80,.18);overflow:hidden}
          .det-sidebar.mobile-open{transform:translateX(0)}
          .det-main{padding:1rem 1rem 5rem;width:100%}
          .mobile-top-bar{display:flex}
        }
        .mobile-top-bar{display:none;align-items:center;justify-content:space-between;padding:.75rem 1rem;background:#ffffff;border-bottom:1px solid rgba(0,53,128,.1);position:sticky;top:0;z-index:30;box-shadow:0 2px 8px rgba(0,53,128,.06)}
        .hamburger-btn{background:none;border:none;cursor:pointer;padding:8px;border-radius:10px;color:#003580;display:flex;align-items:center;justify-content:center;transition:background .2s;min-width:40px;min-height:40px}
        .hamburger-btn:hover{background:rgba(0,53,128,.08)}
        .sidebar-overlay{display:none}
        @media(max-width:768px){.sidebar-overlay{display:block;position:fixed;inset:0;background:rgba(0,30,80,.4);backdrop-filter:blur(3px);z-index:59}}
        @media(max-width:768px){.sidebar-close-mobile{display:flex!important}}

        /* ── Nav ── */
        .nav-item{display:flex;align-items:center;gap:12px;padding:13px 14px;border-radius:12px;font-size:1rem;font-weight:600;color:#3d5080;text-decoration:none;cursor:pointer;transition:background .2s,color .2s;border:none;background:none;width:100%;text-align:left;margin-bottom:4px;font-family:'Inter',sans-serif;min-height:50px}
        .nav-item:hover{background:rgba(0,53,128,0.07);color:#003580}
        .nav-item.nav-active{background:rgba(0,53,128,0.1);color:#003580;border-left:3px solid #003580}

        /* ── Page header ── */
        .ai-badge{display:inline-flex;align-items:center;gap:5px;font-size:.68rem;font-weight:700;letter-spacing:.07em;text-transform:uppercase;padding:3px 10px;border-radius:99px;background:rgba(99,102,241,.18);border:1px solid rgba(99,102,241,.35);color:#a5b4fc;margin-bottom:.7rem}

        /* ── Drop zone ── */
        .drop-zone{
          border:2px dashed rgba(99,102,241,.35);border-radius:20px;
          padding:3rem 2rem;text-align:center;cursor:pointer;
          transition:all .25s;background:rgba(99,102,241,.04);
          position:relative;overflow:hidden;
        }
        .drop-zone:hover,.drop-zone.drag-over{
          border-color:rgba(99,102,241,.7);
          background:rgba(99,102,241,.09);
          transform:scale(1.01);
        }
        .drop-zone::before{
          content:'';position:absolute;inset:0;
          background:radial-gradient(ellipse at 50% 0%,rgba(99,102,241,.15) 0%,transparent 70%);
          pointer-events:none;
        }

        /* ── Buttons ── */
        .btn-primary{display:flex;align-items:center;gap:8px;padding:11px 24px;border-radius:12px;border:none;background:linear-gradient(135deg,#6366f1,#8b5cf6);color:white;font-size:.9rem;font-weight:700;cursor:pointer;font-family:'Inter',sans-serif;box-shadow:0 4px 16px rgba(99,102,241,.35);transition:opacity .2s,transform .15s}
        .btn-primary:hover:not(:disabled){opacity:.9;transform:translateY(-1px)}
        .btn-primary:disabled{opacity:.5;cursor:default;transform:none}
        .btn-danger{display:flex;align-items:center;gap:8px;padding:11px 24px;border-radius:12px;border:none;background:linear-gradient(135deg,#f87171,#ef4444);color:white;font-size:.9rem;font-weight:700;cursor:pointer;font-family:'Inter',sans-serif;box-shadow:0 4px 16px rgba(248,113,113,.35);transition:opacity .2s,transform .15s}
        .btn-danger:hover{opacity:.9;transform:translateY(-1px)}
        .btn-ghost{display:flex;align-items:center;gap:7px;padding:9px 18px;border-radius:10px;border:1px solid var(--border);background:none;color:var(--text-secondary);font-size:.85rem;font-weight:600;cursor:pointer;font-family:'Inter',sans-serif;transition:all .2s}
        .btn-ghost:hover{border-color:rgba(99,102,241,.4);color:var(--text-primary)}

        /* ── Recording indicator ── */
        @keyframes rec-pulse{0%,100%{opacity:1}50%{opacity:.25}}
        .rec-dot{width:10px;height:10px;border-radius:50%;background:#f87171;animation:rec-pulse 1s ease-in-out infinite;flex-shrink:0}

        /* ── Processing spinner ── */
        @keyframes spin-ring{to{stroke-dashoffset:0}}
        .spinner-ring{animation:spin 1.2s linear infinite}
        @keyframes spin{to{transform:rotate(360deg)}}

        /* ── Result card ── */
        .result-label{font-size:3rem;font-weight:900;letter-spacing:-.04em;line-height:1}

        /* ── History table ── */
        .hist-row{display:grid;grid-template-columns:1fr 90px 90px 60px;gap:8px;align-items:center;padding:10px 14px;border-radius:10px;font-size:.82rem;transition:background .15s}
        .hist-row:hover{background:rgba(255,255,255,.04)}
        .hist-label{font-weight:700;padding:2px 8px;border-radius:6px;font-size:.72rem;letter-spacing:.04em}

        /* ── Backend status bar ── */
        .backend-bar{display:flex;align-items:center;gap:8px;padding:9px 14px;border-radius:10px;margin-bottom:1.25rem;font-size:.82rem}
        .backend-bar.ok{background:rgba(52,211,153,.07);border:1px solid rgba(52,211,153,.2);color:#34d399}
        .backend-bar.err{background:rgba(248,113,113,.07);border:1px solid rgba(248,113,113,.2);color:#f87171}
        .backend-bar.checking{background:rgba(96,165,250,.07);border:1px solid rgba(96,165,250,.2);color:#60a5fa}

        /* ── Waveform wrapper ── */
        .waveform-wrap{background:rgba(99,102,241,.07);border:1px solid rgba(99,102,241,.18);border-radius:14px;padding:1rem 1.25rem;margin-top:1.25rem}

        /* ── Appear animation ── */
        @keyframes fadeUp{from{opacity:0;transform:translateY(16px)}to{opacity:1;transform:translateY(0)}}
        .fade-up{animation:fadeUp .4s cubic-bezier(.16,1,.3,1)}

        /* ── Pulse glow on result ── */
        @keyframes glow-pulse{0%,100%{box-shadow:0 0 0 0 rgba(52,211,153,.2)}50%{box-shadow:0 0 32px 8px rgba(52,211,153,.12)}}
        @keyframes glow-pulse-red{0%,100%{box-shadow:0 0 0 0 rgba(248,113,113,.2)}50%{box-shadow:0 0 32px 8px rgba(248,113,113,.12)}}
        .result-real{animation:glow-pulse 2s ease-in-out infinite}
        .result-fake{animation:glow-pulse-red 2s ease-in-out infinite}
      `}</style>

      {/* ── Mobile top bar ── */}
      <div className="mobile-top-bar">
        <button className="hamburger-btn" onClick={() => setMobileMenuOpen(true)} aria-label="Open menu">
          <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <line x1="3" y1="6" x2="21" y2="6"/><line x1="3" y1="12" x2="21" y2="12"/><line x1="3" y1="18" x2="21" y2="18"/>
          </svg>
        </button>
        <div style={{display:'flex',alignItems:'center',gap:8}}>
          <div style={{width:32,height:32,borderRadius:9,background:'linear-gradient(135deg,#003580,#1a4fa0)',display:'flex',alignItems:'center',justifyContent:'center'}}>
            <ShieldIcon s={16} />
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

      {/* ── Sidebar ───────────────────────────────────────────────────────────── */}
      <aside className={`det-sidebar${mobileMenuOpen ? ' mobile-open' : ''}`} style={{ position: 'relative' }}>
        <button onClick={() => setMobileMenuOpen(false)}
          style={{display:'none',position:'absolute',top:12,right:12,background:'none',border:'none',cursor:'pointer',padding:6,borderRadius:8,color:'#8898bb'}}
          className="sidebar-close-mobile" aria-label="Close menu">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>
          </svg>
        </button>
        <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: '4px', background: 'linear-gradient(90deg,#003580,#1a4fa0,#CC0001)' }} />
        <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: '2rem', paddingLeft: 4, marginTop: '0.75rem' }}>
          <div style={{ width: 40, height: 40, borderRadius: 11, background: 'linear-gradient(135deg,#003580,#1a4fa0)', display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 4px 14px rgba(0,53,128,.3)' }}>
            <ShieldIcon s={18} />
          </div>
          <span style={{ fontWeight: 800, fontSize: '1.05rem', letterSpacing: '-0.02em', color: '#003580' }}>
            VoiceGuard
          </span>
        </div>

        <nav style={{ flex: 1 }}>
          <div style={{ fontSize: '.7rem', fontWeight: 800, letterSpacing: '.1em', textTransform: 'uppercase', color: '#8898bb', padding: '0 14px', marginBottom: 10 }}>Main Menu</div>
          {NAV.map(n => (
            <Link key={n.href} href={n.href}
              className={`nav-item${n.active ? ' nav-active' : ''}`}>
              <n.icon s={20} />{n.label}
            </Link>
          ))}
        </nav>

        <SidebarUserPanel />
      </aside>

      {/* ── Main content ─────────────────────────────────────────────────────── */}
      <main className="det-main">

        {/* Header */}
        <div style={{ marginBottom: '1.75rem' }}>
          <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', flexWrap: 'wrap', gap: 12 }}>
            <div>
              <h1 style={{ fontSize: '1.65rem', fontWeight: 900, color: 'var(--text-primary)', letterSpacing: '-.03em', marginBottom: 4, display: 'flex', alignItems: 'center', gap: 10 }}>
                <MicIcon s={26} />
                {t('detect_title')}
              </h1>
            </div>
            <LanguageSwitcher />
          </div>
        </div>

        {/* Backend status */}
        <div className={`backend-bar ${backendOk === null ? 'checking' : backendOk ? 'ok' : 'err'}`}>
          <div style={{ width: 8, height: 8, borderRadius: '50%', background: 'currentColor', flexShrink: 0, opacity: backendOk === null ? 0.5 : 1 }} />
          {backendOk === null && <span>{t('detect_engine_checking')}</span>}
          {backendOk === true && <span><strong>{t('detect_engine_online')}</strong> — {t('detect_engine_online_sub')}</span>}
          {backendOk === false && (
            <span>
              <strong>{t('detect_engine_offline')}</strong>{' '}
              {t('detect_engine_offline_sub')}
            </span>
          )}
        </div>

        {/* ── IDLE / RESULT: upload zone + mic controls ─────────────────────── */}
        {(state === 'idle' || state === 'result' || state === 'error') && (
          <div className="fade-up">

            {/* Drop zone */}
            <div
              id="drop-zone"
              className={`drop-zone${dragOver ? ' drag-over' : ''}`}
              onDrop={onDrop}
              onDragOver={e => { e.preventDefault(); setDragOver(true) }}
              onDragLeave={() => setDragOver(false)}
              onClick={() => fileInputRef.current?.click()}
            >
              <input
                ref={fileInputRef}
                type="file"
                accept=".wav,.flac,.mp3,.m4a,.ogg,audio/*"
                style={{ display: 'none' }}
                onChange={e => { const f = e.target.files?.[0]; if (f) handleFile(f); e.target.value = '' }}
              />
              <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 12, position: 'relative', zIndex: 1 }}>
                <div style={{ width: 64, height: 64, borderRadius: 18, background: 'linear-gradient(135deg,rgba(99,102,241,.25),rgba(139,92,246,.2))', border: '1px solid rgba(99,102,241,.3)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <UploadIcon s={28} />
                </div>
                <div>
                  <div style={{ fontSize: '1rem', fontWeight: 700, color: 'var(--text-primary)', marginBottom: 4 }}>
                    {t('detect_drop_title')}
                  </div>
                  <div style={{ fontSize: '.82rem', color: 'var(--text-muted)' }}>
                    {t('detect_drop_sub')} <span style={{ color: '#a5b4fc', fontWeight: 600 }}>{t('detect_drop_browse')}</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Divider */}
            <div style={{ display: 'flex', alignItems: 'center', gap: 12, margin: '1.25rem 0' }}>
              <div style={{ flex: 1, height: 1, background: 'var(--border)' }} />
              <span style={{ fontSize: '.78rem', color: 'var(--text-muted)', fontWeight: 600 }}>{t('detect_or')}</span>
              <div style={{ flex: 1, height: 1, background: 'var(--border)' }} />
            </div>

            {/* Mic button */}
            <div style={{ display: 'flex', justifyContent: 'center' }}>
              <button
                id="start-recording-btn"
                className="btn-primary"
                onClick={startRecording}
                disabled={false}
                style={{ padding: '13px 36px', fontSize: '1rem' }}
              >
                <MicIcon s={20} /> {t('detect_record_btn')}
              </button>
            </div>

            {/* Error display */}
            {state === 'error' && errorMsg && (
              <div style={{ marginTop: '1.25rem', background: 'rgba(248,113,113,.07)', border: '1px solid rgba(248,113,113,.25)', borderRadius: 14, padding: '1rem 1.25rem', display: 'flex', gap: 10, alignItems: 'flex-start' }}>
                <AlertTriIcon s={16} />
                <div>
                <div style={{ fontWeight: 700, color: '#fca5a5', marginBottom: 4 }}>{t('detect_failed_title')}</div>
                  <div style={{ fontSize: '.83rem', color: '#fca5a5', opacity: .8, lineHeight: 1.55 }}>{errorMsg}</div>
                </div>
              </div>
            )}
          </div>
        )}

        {/* ── RECORDING state ──────────────────────────────────────────────── */}
        {state === 'recording' && (
          <div className="fade-up" style={{ textAlign: 'center' }}>
            <div className="waveform-wrap" style={{ marginBottom: '1.5rem' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: '.75rem' }}>
                <div className="rec-dot" />
                <span style={{ fontWeight: 700, color: '#f87171', fontSize: '.9rem' }}>{t('detect_recording')}</span>
                <span style={{ marginLeft: 'auto', fontVariantNumeric: 'tabular-nums', fontSize: '.9rem', fontWeight: 600, color: 'var(--text-secondary)' }}>
                  {String(Math.floor(recSeconds / 60)).padStart(2, '0')}:{String(recSeconds % 60).padStart(2, '0')}
                </span>
              </div>
              <WaveformVisualiser analyser={analyserRef.current} active={state === 'recording'} />
            </div>

            <button id="stop-recording-btn" className="btn-danger" onClick={stopRecording} style={{ margin: '0 auto' }}>
              <StopIcon s={16} /> {t('detect_stop_btn')}
            </button>
            <p style={{ marginTop: '1rem', fontSize: '.8rem', color: 'var(--text-muted)' }}>
              {t('detect_tip')}
            </p>
          </div>
        )}

        {/* ── PROCESSING state ──────────────────────────────────────────────── */}
        {state === 'processing' && (
          <div className="fade-up" style={{ padding: '2rem 0' }}>

            {/* Spinner + title */}
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', marginBottom: '2rem' }}>
              <svg width={72} height={72} viewBox="0 0 80 80" style={{ marginBottom: '1.25rem' }}>
                <circle cx={40} cy={40} r={32} fill="none" stroke="rgba(99,102,241,.12)" strokeWidth={8} />
                <circle cx={40} cy={40} r={32} fill="none" stroke="url(#spinGrad2)" strokeWidth={8}
                  strokeLinecap="round" strokeDasharray="50 150" className="spinner-ring"
                  style={{ transformOrigin: '40px 40px' }} />
                <defs>
                  <linearGradient id="spinGrad2" x1="0" y1="0" x2="1" y2="1">
                    <stop offset="0%" stopColor="#6366f1" />
                    <stop offset="100%" stopColor="#8b5cf6" />
                  </linearGradient>
                </defs>
              </svg>
              <div style={{ fontWeight: 800, fontSize: '1.15rem', color: 'var(--text-primary)', marginBottom: 6 }}>
                {t('detect_analysing')}
              </div>
              <div style={{ fontSize: '.85rem', color: 'var(--text-secondary)' }}>
                {fileName && <span><em>{fileName}</em>{fileSize > 0 && ` · ${(fileSize / 1024).toFixed(0)} KB`}</span>}
              </div>
            </div>

            {/* ── Progress bar ── */}
            <div style={{ background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: 18, padding: '1.5rem 1.75rem' }}>

              {/* Bar track */}
              <div style={{ height: 10, background: 'rgba(99,102,241,.1)', borderRadius: 99, overflow: 'hidden', marginBottom: '1.25rem', position: 'relative' }}>
                <div style={{
                  height: '100%',
                  width: `${progPct}%`,
                  background: 'linear-gradient(90deg,#6366f1,#8b5cf6)',
                  borderRadius: 99,
                  boxShadow: '0 0 12px rgba(99,102,241,.5)',
                  transition: 'width 0.8s cubic-bezier(.4,0,.2,1)',
                }} />
                {/* Shimmer overlay */}
                <div style={{
                  position: 'absolute', inset: 0,
                  background: 'linear-gradient(90deg,transparent 0%,rgba(255,255,255,.18) 50%,transparent 100%)',
                  backgroundSize: '200% 100%',
                  animation: 'shimmerBar 1.8s linear infinite',
                  borderRadius: 99,
                }} />
              </div>

              {/* Stage steps */}
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', gap: 8 }}>
                {STAGES.map((s, i) => {
                  const done = i < progStage
                  const current = i === progStage
                  return (
                    <div key={s.label} style={{ textAlign: 'center' }}>
                      {/* Step circle */}
                      <div style={{
                        width: 32, height: 32, borderRadius: '50%', margin: '0 auto 6px',
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                        background: done ? 'linear-gradient(135deg,#6366f1,#8b5cf6)' : current ? 'rgba(99,102,241,.15)' : 'rgba(255,255,255,.05)',
                        border: `2px solid ${done ? '#6366f1' : current ? 'rgba(99,102,241,.5)' : 'rgba(255,255,255,.1)'}`,
                        transition: 'all .4s',
                        boxShadow: current ? '0 0 14px rgba(99,102,241,.4)' : 'none',
                      }}>
                        {done
                          ? <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12" /></svg>
                          : <span style={{ fontSize: '.72rem', fontWeight: 700, color: current ? '#a5b4fc' : 'rgba(255,255,255,.25)' }}>{i + 1}</span>
                        }
                      </div>
                      {/* Label */}
                      <div style={{ fontSize: '.72rem', fontWeight: current ? 700 : 500, color: done ? '#a5b4fc' : current ? 'var(--text-primary)' : 'var(--text-muted)', lineHeight: 1.3, transition: 'color .4s' }}>
                        {s.label}
                      </div>
                      {/* Pulsing dot on current */}
                      {current && (
                        <div style={{ width: 6, height: 6, borderRadius: '50%', background: '#6366f1', margin: '4px auto 0', animation: 'rec-pulse 1s ease-in-out infinite' }} />
                      )}
                    </div>
                  )
                })}
              </div>

              {/* Percentage */}
              <div style={{ textAlign: 'right', marginTop: '1rem', fontSize: '.78rem', fontWeight: 700, color: '#a5b4fc' }}>
                {progPct}%
              </div>
            </div>

            <style>{`@keyframes shimmerBar{0%{background-position:-200% 0}100%{background-position:200% 0}}`}</style>
          </div>
        )}

        {/* ── RESULT state ──────────────────────────────────────────────────── */}
        {state === 'result' && result && (
          <div className="fade-up" style={{ marginTop: '1.5rem' }}>
            {/* Main result card */}
            <div
              className={isFake ? 'result-fake' : 'result-real'}
              style={{
                background: resultBg,
                border: `1px solid ${resultBorder}`,
                borderRadius: 24,
                padding: '2rem',
                marginBottom: '1.5rem',
                display: 'grid',
                gridTemplateColumns: '1fr auto',
                gap: '1.5rem',
                alignItems: 'center',
              }}
            >
              {/* Left: label */}
              <div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: '1rem' }}>
                  <div style={{ width: 40, height: 40, borderRadius: 12, background: `${resultColor}18`, border: `1px solid ${resultColor}35`, display: 'flex', alignItems: 'center', justifyContent: 'center', color: resultColor }}>
                    {isFake ? <XCircleIcon s={20} /> : <CheckIcon s={20} />}
                  </div>
                  <div style={{ fontSize: '.72rem', fontWeight: 700, letterSpacing: '.08em', textTransform: 'uppercase', color: resultColor, opacity: .7 }}>
                    {t('detect_result_label')}
                  </div>
                </div>

                <div className="result-label" style={{ color: resultColor, marginBottom: '.5rem' }}>
                  {isFake ? '❌ FAKE' : '✅ REAL'}
                </div>
                <div style={{ fontSize: '.9rem', color: 'var(--text-secondary)', marginBottom: '1.25rem', lineHeight: 1.55 }}>
                  {isFake ? t('detect_result_fake_desc') : t('detect_result_real_desc')}
                </div>

                {/* Prob bars */}
                <div style={{ maxWidth: 340 }}>
                  <ProbBar label={t('detect_prob_real')} value={result.real_prob} color="#34d399" delay={200} />
                  <ProbBar label={t('detect_prob_fake')} value={result.fake_prob} color="#f87171" delay={350} />
                </div>

                <div style={{ marginTop: '1rem', display: 'flex', gap: 8, flexWrap: 'wrap' }}>
                  <div style={{ fontSize: '.72rem', padding: '3px 10px', borderRadius: 99, background: 'rgba(255,255,255,.06)', border: '1px solid rgba(255,255,255,.1)', color: 'var(--text-muted)', fontWeight: 600 }}>
                    📁 {fileName || 'audio'}
                  </div>
                  <div style={{ fontSize: '.72rem', padding: '3px 10px', borderRadius: 99, background: 'rgba(255,255,255,.06)', border: '1px solid rgba(255,255,255,.1)', color: 'var(--text-muted)', fontWeight: 600 }}>
                    🖥 {result.device.toUpperCase()}
                  </div>
                </div>
              </div>

              {/* Right: confidence ring */}
              <ConfidenceRing value={result.confidence} isFake={isFake} />
            </div>

            {/* Action row */}
            <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
              <button id="scan-another-btn" className="btn-primary" onClick={resetAll}>
                <MicIcon s={16} /> {t('detect_scan_another')}
              </button>
              <Link href="/alerts" className="btn-ghost" style={{ textDecoration: 'none', display: 'flex', alignItems: 'center', gap: 7 }}>
                <BellIcon s={16} /> {t('detect_view_alerts')}
              </Link>
              <Link href="/awareness" className="btn-ghost" style={{ textDecoration: 'none', display: 'flex', alignItems: 'center', gap: 7 }}>
                <BookIcon s={16} /> {t('detect_learn_more')}
              </Link>
            </div>

            {/* Info tip */}
            <div style={{ marginTop: '1rem', display: 'flex', gap: 8, alignItems: 'flex-start', background: 'rgba(96,165,250,.07)', border: '1px solid rgba(96,165,250,.2)', borderRadius: 12, padding: '10px 14px', fontSize: '.8rem', color: '#93c5fd' }}>
              <InfoIcon s={14} />
              <span>{t('detect_info_tip')}</span>
            </div>
          </div>
        )}

        {/* ── Scan history ──────────────────────────────────────────────────── */}
        {history.length > 0 && state !== 'recording' && state !== 'processing' && (
          <div style={{ marginTop: '2.5rem' }} className="fade-up">
            <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: '1rem' }}>
              <h2 style={{ fontSize: '.9rem', fontWeight: 700, color: 'var(--text-primary)', letterSpacing: '-.01em' }}>
                {t('detect_history_title')}
              </h2>
              <span style={{ fontSize: '.68rem', fontWeight: 700, padding: '2px 8px', borderRadius: 99, background: 'rgba(99,102,241,.12)', color: '#a5b4fc', border: '1px solid rgba(99,102,241,.22)' }}>
                {history.length} scan{history.length !== 1 ? 's' : ''}
              </span>
              <button
                onClick={() => setHistory([])}
                style={{ marginLeft: 'auto', background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: 4, fontSize: '.75rem', fontFamily: "'Inter',sans-serif" }}
              >
                <TrashIcon s={12} /> {t('detect_history_clear')}
              </button>
            </div>

            <div style={{ background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: 16, overflow: 'hidden' }}>
              {/* Header row */}
              <div className="hist-row" style={{ borderBottom: '1px solid var(--border)', background: 'rgba(255,255,255,.03)' }}>
                <span style={{ fontSize: '.72rem', fontWeight: 700, color: 'var(--text-muted)', letterSpacing: '.06em', textTransform: 'uppercase' }}>{t('detect_hist_file')}</span>
                <span style={{ fontSize: '.72rem', fontWeight: 700, color: 'var(--text-muted)', letterSpacing: '.06em', textTransform: 'uppercase', textAlign: 'center' }}>{t('detect_hist_result')}</span>
                <span style={{ fontSize: '.72rem', fontWeight: 700, color: 'var(--text-muted)', letterSpacing: '.06em', textTransform: 'uppercase', textAlign: 'center' }}>{t('detect_hist_confidence')}</span>
                <span style={{ fontSize: '.72rem', fontWeight: 700, color: 'var(--text-muted)', letterSpacing: '.06em', textTransform: 'uppercase', textAlign: 'right' }}>{t('detect_hist_time')}</span>
              </div>

              {history.map(rec => (
                <div key={rec.id} className="hist-row" style={{ borderBottom: '1px solid rgba(255,255,255,.04)' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 7, minWidth: 0 }}>
                    <span style={{ fontSize: '1rem' }}>{rec.source === 'recording' ? '🎙' : '📁'}</span>
                    <span style={{ fontSize: '.82rem', color: 'var(--text-secondary)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{rec.filename}</span>
                  </div>
                  <div style={{ textAlign: 'center' }}>
                    <span
                      className="hist-label"
                      style={{
                        color: rec.label === 'FAKE' ? '#f87171' : '#34d399',
                        background: rec.label === 'FAKE' ? 'rgba(248,113,113,.1)' : 'rgba(52,211,153,.1)',
                        border: `1px solid ${rec.label === 'FAKE' ? 'rgba(248,113,113,.25)' : 'rgba(52,211,153,.25)'}`,
                      }}
                    >
                      {rec.label === 'FAKE' ? '❌ FAKE' : '✅ REAL'}
                    </span>
                  </div>
                  <div style={{ textAlign: 'center', fontSize: '.82rem', fontWeight: 600, color: 'var(--text-secondary)' }}>
                    {fmtPct(rec.confidence)}
                  </div>
                  <div style={{ textAlign: 'right', fontSize: '.75rem', color: 'var(--text-muted)' }}>
                    {fmtTime(rec.timestamp)}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* ── How it works ─────────────────────────────────────────────────── */}
        {state === 'idle' && history.length === 0 && (
          <div style={{ marginTop: '2.5rem' }} className="fade-up">
            <h2 style={{ fontSize: '.9rem', fontWeight: 700, color: 'var(--text-primary)', letterSpacing: '-.01em', marginBottom: '1rem' }}>How the Detection Works</h2>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(180px,1fr))', gap: 12 }}>
              {[
                { icon: '🎙', title: 'Audio Input', desc: 'Upload or record any suspicious voice call or message' },
                { icon: '🌊', title: 'Wav2Vec2', desc: 'Pre-trained transformer extracts deep waveform features' },
                { icon: '🔬', title: 'CNN Spectrogram', desc: 'Residual CNN analyses the log-Mel spectrogram pattern' },
                { icon: '🤖', title: 'Fusion Head', desc: 'Both branches combine into a binary REAL / FAKE verdict' },
              ].map(c => (
                <div key={c.title} style={{ background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: 14, padding: '1rem 1.125rem' }}>
                  <div style={{ fontSize: '1.4rem', marginBottom: '.5rem' }}>{c.icon}</div>
                  <div style={{ fontWeight: 700, fontSize: '.875rem', color: 'var(--text-primary)', marginBottom: 4 }}>{c.title}</div>
                  <div style={{ fontSize: '.78rem', color: 'var(--text-secondary)', lineHeight: 1.55 }}>{c.desc}</div>
                </div>
              ))}
            </div>
          </div>
        )}

      </main>
      </div>{/* end flex row */}
    </div>
  )
}
