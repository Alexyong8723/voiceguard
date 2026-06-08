/**
 * auditLog.ts — Server-side security audit logging
 * ==================================================
 * Writes security events (login, scan, failures) to the `audit_logs`
 * Supabase table using the service role key so end-users cannot tamper
 * with log entries.
 *
 * NEVER import this file in client components — it uses a server-only key.
 */

import { createClient as createSupabaseClient } from '@supabase/supabase-js'

// ── Service-role client (write-only to audit table) ───────────────────────────
// This client bypasses RLS and should NEVER be exposed to the browser.
function getServiceClient() {
  const url    = process.env.NEXT_PUBLIC_SUPABASE_URL
  const svcKey = process.env.SUPABASE_SERVICE_ROLE_KEY

  if (!url || !svcKey) {
    // Non-fatal: log to console if env vars are missing (e.g. local dev without service key)
    console.warn('[auditLog] SUPABASE_SERVICE_ROLE_KEY not set — audit logging disabled.')
    return null
  }

  return createSupabaseClient(url, svcKey, {
    auth: { persistSession: false, autoRefreshToken: false },
  })
}

// ── Event types ───────────────────────────────────────────────────────────────
export type AuditEvent =
  | 'login_success'
  | 'login_failure'
  | 'logout'
  | 'signup_success'
  | 'signup_failure'
  | 'password_reset_request'
  | 'password_reset_success'
  | 'detect_scan'
  | 'detect_rate_limited'
  | 'detect_unauthorized'
  | 'api_unauthorized'

export interface AuditLogParams {
  event: AuditEvent
  userId?: string | null
  ipAddress?: string | null
  userAgent?: string | null
  meta?: Record<string, unknown>
}

/**
 * Write a security event to the audit_logs table.
 * Fire-and-forget — does NOT throw on failure so it never breaks the caller.
 */
export async function writeAuditLog(params: AuditLogParams): Promise<void> {
  const supabase = getServiceClient()
  if (!supabase) return   // silently skip if service key not configured

  const { event, userId, ipAddress, userAgent, meta } = params

  try {
    const { error } = await supabase.from('audit_logs').insert({
      event,
      user_id:    userId    ?? null,
      ip_address: ipAddress ?? null,
      user_agent: userAgent ?? null,
      meta:       meta      ?? {},
    })

    if (error) {
      // Log to server console only — never expose to client
      console.error('[auditLog] Insert failed:', error.message)
    }
  } catch (err) {
    console.error('[auditLog] Unexpected error:', err)
  }
}
