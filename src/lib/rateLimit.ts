/**
 * rateLimit.ts — In-memory sliding-window rate limiter
 * =====================================================
 * Works in Next.js Node runtime (not edge). No external dependencies.
 *
 * Usage:
 *   const limiter = createRateLimiter({ windowMs: 60_000, max: 10 })
 *   const result  = limiter.check(ip)
 *   if (!result.ok) return NextResponse.json({ error: 'Too many requests' }, { status: 429 })
 */

export interface RateLimitResult {
  ok: boolean
  remaining: number
  resetAt: number   // Unix ms when the window resets
}

export interface RateLimiterOptions {
  /** Window size in milliseconds */
  windowMs: number
  /** Maximum requests allowed per window per key */
  max: number
}

interface WindowEntry {
  timestamps: number[]
  resetAt: number
}

export function createRateLimiter(options: RateLimiterOptions) {
  const { windowMs, max } = options
  const store = new Map<string, WindowEntry>()

  // Periodically clean up expired entries to prevent memory leaks
  const cleanup = () => {
    const now = Date.now()
    for (const [key, entry] of store.entries()) {
      if (now > entry.resetAt) store.delete(key)
    }
  }
  // Run cleanup every 5 minutes
  if (typeof globalThis !== 'undefined') {
    const interval = setInterval(cleanup, 5 * 60 * 1000)
    // Allow Node.js to exit even if this interval is active
    if (interval.unref) interval.unref()
  }

  return {
    /**
     * Check and record a request for the given key (typically an IP address).
     * Returns { ok, remaining, resetAt }.
     */
    check(key: string): RateLimitResult {
      const now = Date.now()
      let entry = store.get(key)

      // Start a fresh window if none exists or the old one has expired
      if (!entry || now > entry.resetAt) {
        entry = { timestamps: [], resetAt: now + windowMs }
        store.set(key, entry)
      }

      // Prune timestamps that are outside the current window
      const windowStart = now - windowMs
      entry.timestamps = entry.timestamps.filter(ts => ts > windowStart)

      if (entry.timestamps.length >= max) {
        return { ok: false, remaining: 0, resetAt: entry.resetAt }
      }

      entry.timestamps.push(now)
      return {
        ok: true,
        remaining: max - entry.timestamps.length,
        resetAt: entry.resetAt,
      }
    },
  }
}

// ── Pre-built limiters used across the app ────────────────────────────────────

/** /api/detect — 10 requests per 60 s per IP */
export const detectLimiter = createRateLimiter({ windowMs: 60_000, max: 10 })

/** /api/alerts — 20 requests per 60 s per IP */
export const alertsLimiter = createRateLimiter({ windowMs: 60_000, max: 20 })

/** Login attempts — 5 per 5 min per IP */
export const loginLimiter  = createRateLimiter({ windowMs: 5 * 60_000, max: 5 })

// ── Helper to extract a stable IP from NextRequest ────────────────────────────
export function getClientIp(request: Request): string {
  // Standard forwarded-for header (set by reverse proxies / Vercel)
  const xff = request.headers.get('x-forwarded-for')
  if (xff) return xff.split(',')[0].trim()
  // Vercel real IP
  const realIp = request.headers.get('x-real-ip')
  if (realIp) return realIp.trim()
  return 'unknown'
}
