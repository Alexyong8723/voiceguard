import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { buildWeeklyAnalytics } from '@/app/admin/admin.actions'

/**
 * GET /api/admin/powerbi-export
 *
 * Returns the full VoiceGuard analytics payload as JSON.
 * Protected — requires an authenticated admin session cookie OR
 * a Bearer token matching ADMIN_EXPORT_TOKEN env var.
 *
 * Usage in Power BI:
 *   1. Get Data → Web → Advanced
 *   2. URL: https://<your-domain>/api/admin/powerbi-export
 *   3. HTTP Request Header: Authorization = Bearer <ADMIN_EXPORT_TOKEN>
 */
export async function GET(req: NextRequest) {
  // ── Auth option 1: Session cookie (browser / admin dashboard) ──────────────
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (user) {
    const { data: profile } = await supabase
      .from('profiles')
      .select('role')
      .eq('id', user.id)
      .single()

    if (profile?.role !== 'admin') {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }
  } else {
    // ── Auth option 2: Bearer token (Power BI / external tools) ─────────────
    const authHeader = req.headers.get('authorization') ?? ''
    const token      = authHeader.startsWith('Bearer ') ? authHeader.slice(7) : null
    const envToken   = process.env.ADMIN_EXPORT_TOKEN

    if (!envToken || token !== envToken) {
      return NextResponse.json(
        { error: 'Unauthorized. Provide a valid admin session cookie or Bearer token.' },
        { status: 401 },
      )
    }
  }

  try {
    const analytics = await buildWeeklyAnalytics()

    return NextResponse.json(analytics, {
      headers: {
        // Allow Power BI to cache for up to 1 hour
        'Cache-Control': 'private, max-age=3600',
        'Content-Type':  'application/json',
        // CORS for Power BI desktop client
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'GET',
        'Access-Control-Allow-Headers': 'Authorization, Content-Type',
      },
    })
  } catch (err) {
    const msg = err instanceof Error ? err.message : 'Unknown error'
    return NextResponse.json({ error: msg }, { status: 500 })
  }
}
