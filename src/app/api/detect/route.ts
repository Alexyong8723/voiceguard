import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { createAdminClient } from '@/lib/supabase/admin'
import { detectLimiter, getClientIp } from '@/lib/rateLimit'
import { writeAuditLog } from '@/lib/auditLog'

/**
 * POST /api/detect
 *
 * Security hardened proxy route:
 *  ① Auth guard       — request must carry a valid Supabase session
 *  ② Rate limiting    — max 10 requests / 60 s per IP (429 otherwise)
 *  ③ Input validation — MIME type + file-size check before forwarding
 *  ④ Internal token   — attaches X-Internal-Token to upstream call
 *  ⑤ Audit logging    — every scan (success or failure) is logged
 *
 * Keeps the Python service URL and internal secret entirely server-side.
 */

const PYTHON_API = process.env.VOICEGUARD_API_URL ?? 'http://localhost:8000'

/** Allowed audio MIME prefixes (browser MediaRecorder + common uploads) */
const ALLOWED_MIME_PREFIXES = ['audio/', 'application/octet-stream']

/** Max file size accepted at the Next.js layer: 10 MB */
const MAX_BYTES = 10 * 1024 * 1024

/** Allowed file extensions whitelist */
const ALLOWED_EXTENSIONS = new Set(['.wav', '.webm', '.ogg', '.mp3', '.flac', '.m4a', '.opus'])

// ── Helper: return a 429 JSON response ───────────────────────────────────────
function tooManyRequests() {
  return NextResponse.json(
    { error: 'Too many requests. Please wait a moment before trying again.' },
    { status: 429 },
  )
}

// ── Helper: return a 401 JSON response ───────────────────────────────────────
function unauthorized() {
  return NextResponse.json(
    { error: 'Authentication required. Please sign in to use the detection service.' },
    { status: 401 },
  )
}

export async function POST(req: NextRequest) {
  const ip        = getClientIp(req)
  const userAgent = req.headers.get('user-agent') ?? undefined

  // ── ① Auth guard ────────────────────────────────────────────────────────────
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    await writeAuditLog({ event: 'detect_unauthorized', ipAddress: ip, userAgent, meta: { reason: 'no session' } })
    return unauthorized()
  }

  // ── ② Rate limiting ─────────────────────────────────────────────────────────
  const limit = detectLimiter.check(ip)
  if (!limit.ok) {
    await writeAuditLog({
      event: 'detect_rate_limited',
      userId: user.id,
      ipAddress: ip,
      userAgent,
      meta: { resetAt: limit.resetAt },
    })
    return tooManyRequests()
  }

  // ── ③ Parse multipart body ──────────────────────────────────────────────────
  let formData: FormData
  try {
    formData = await req.formData()
  } catch {
    return NextResponse.json(
      { error: 'Invalid form data. Send a multipart/form-data request with an "audio" field.' },
      { status: 400 },
    )
  }

  const audioFile = formData.get('audio')
  if (!audioFile || !(audioFile instanceof Blob)) {
    return NextResponse.json(
      { error: 'Missing "audio" field in form data.' },
      { status: 400 },
    )
  }

  // ── ③a Input validation — MIME type ─────────────────────────────────────────
  const contentType = audioFile.type ?? ''
  const mimeOk = !contentType || ALLOWED_MIME_PREFIXES.some(p => contentType.startsWith(p))
  if (!mimeOk) {
    return NextResponse.json(
      { error: `Unsupported file type: "${contentType}". Please upload a WAV, WebM, OGG, MP3, FLAC, or M4A audio file.` },
      { status: 415 },
    )
  }

  // ── ③b Input validation — file extension ────────────────────────────────────
  const filename = audioFile instanceof File ? audioFile.name : 'audio.webm'
  const ext = filename.includes('.') ? '.' + filename.split('.').pop()!.toLowerCase() : ''
  if (ext && !ALLOWED_EXTENSIONS.has(ext)) {
    return NextResponse.json(
      { error: `Unsupported file extension "${ext}". Allowed: ${[...ALLOWED_EXTENSIONS].join(', ')}` },
      { status: 415 },
    )
  }

  // ── ③c Input validation — file size (Next.js layer: 10 MB) ─────────────────
  if (audioFile.size > MAX_BYTES) {
    return NextResponse.json(
      { error: `File too large. Maximum allowed size is ${MAX_BYTES / 1024 / 1024} MB.` },
      { status: 413 },
    )
  }

  // ── ④ Re-build FormData for the Python endpoint ─────────────────────────────
  const upstream = new FormData()
  upstream.append('file', audioFile, filename)

  // ── ④ Call Python backend with internal secret ───────────────────────────────
  let pyRes: Response
  try {
    pyRes = await fetch(`${PYTHON_API}/predict`, {
      method: 'POST',
      body: upstream,
      headers: {
        // Internal shared secret — Python validates this header
        ...(process.env.VOICEGUARD_INTERNAL_SECRET
          ? { 'X-Internal-Token': process.env.VOICEGUARD_INTERNAL_SECRET }
          : {}),
      },
    })
  } catch (err) {
    const msg = err instanceof Error ? err.message : String(err)
    return NextResponse.json(
      {
        error:
          'Cannot reach the VoiceGuard Python API. ' +
          'Make sure api_server.py is running on port 8000.\n' +
          `Detail: ${msg}`,
      },
      { status: 503 },
    )
  }

  // ── ⑤ Parse response ─────────────────────────────────────────────────────────
  const body = await pyRes.json().catch(() => ({ error: 'Invalid JSON from Python API' }))

  // ── Insert into database tables ───────────────────────────────────────────────
  const admin = await createAdminClient()
  
  // Insert into audio_files
  const { data: audioData, error: audioError } = await admin.from('audio_files').insert({
    user_id: user.id,
    filename: filename,
    file_path: null, // file saved temporarily in memory, not storage
    format: ext.replace('.', '') || 'unknown',
    file_size_bytes: audioFile.size,
    status: pyRes.status === 200 ? 'completed' : 'failed',
  }).select('id').single()

  if (!audioError && audioData) {
    // Insert into detection_results
    await admin.from('detection_results').insert({
      audio_file_id: audioData.id,
      user_id: user.id,
      classification: body?.label ?? null,
      confidence_score: body?.confidence ?? null,
      detected_anomalies: {},
      explanation: null,
      model_used: 'VoiceGuard API',
    })
  }

  // ── ⑤ Audit log — record every scan result ──────────────────────────────────
  await writeAuditLog({
    event: 'detect_scan',
    userId: user.id,
    ipAddress: ip,
    userAgent,
    meta: {
      filename,
      fileSizeBytes: audioFile.size,
      mimeType: contentType,
      label:      body?.label      ?? null,
      confidence: body?.confidence ?? null,
      status:     pyRes.status,
    },
  })

  return NextResponse.json(body, { status: pyRes.status })
}

export async function GET(req: NextRequest) {
  // Health probe — checks whether the Python backend is reachable
  // Auth guard: only authenticated users can probe health
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return unauthorized()

  try {
    const res = await fetch(`${PYTHON_API}/health`, {
      next: { revalidate: 0 },
      headers: {
        ...(process.env.VOICEGUARD_INTERNAL_SECRET
          ? { 'X-Internal-Token': process.env.VOICEGUARD_INTERNAL_SECRET }
          : {}),
      },
    })
    const body = await res.json()
    return NextResponse.json({ nextjs: 'ok', python: body })
  } catch (err) {
    const msg = err instanceof Error ? err.message : String(err)
    return NextResponse.json(
      { nextjs: 'ok', python: 'unreachable', detail: msg },
      { status: 503 },
    )
  }
}
