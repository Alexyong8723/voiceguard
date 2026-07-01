import { NextRequest, NextResponse } from 'next/server'

/**
 * GET /api/admin/keepalive
 *
 * Vercel cron job — runs every 10 minutes to ping the Hugging Face Space
 * and prevent it from going to sleep (cold start).
 *
 * Secured with CRON_SECRET so only Vercel cron can trigger it.
 */

const PYTHON_API = process.env.VOICEGUARD_API_URL ?? 'http://localhost:8000'

export async function GET(req: NextRequest) {
  // ── Auth: only allow Vercel cron runner ─────────────────────────────────────
  const authHeader = req.headers.get('authorization')
  if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const start = Date.now()

  try {
    const res = await fetch(`${PYTHON_API}/health`, {
      headers: {
        ...(process.env.VOICEGUARD_INTERNAL_SECRET
          ? { 'X-Internal-Token': process.env.VOICEGUARD_INTERNAL_SECRET }
          : {}),
      },
      // Allow up to 55s for the HF Space to wake from cold start
      signal: AbortSignal.timeout(55_000),
    })

    const latencyMs = Date.now() - start
    const body = await res.json().catch(() => ({}))

    console.log(`[keepalive] HF Space ping — status=${res.status} latency=${latencyMs}ms`)

    return NextResponse.json({
      ok: res.ok,
      status: res.status,
      latencyMs,
      hf: body,
      pingedAt: new Date().toISOString(),
    })
  } catch (err) {
    const latencyMs = Date.now() - start
    const msg = err instanceof Error ? err.message : String(err)
    console.error(`[keepalive] HF Space ping failed — ${msg}`)

    return NextResponse.json(
      { ok: false, error: msg, latencyMs, pingedAt: new Date().toISOString() },
      { status: 503 },
    )
  }
}
