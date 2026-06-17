import { NextResponse } from 'next/server'
import { sendCustomReport } from '@/app/admin/admin.actions'
import { writeAuditLog } from '@/lib/auditLog'

// Required for Vercel edge/serverless routes handling cron jobs
export const maxDuration = 60 // Allow up to 60s for Excel gen + email sending

export async function GET(request: Request) {
  try {
    // 1. Verify authorization using the CRON_SECRET
    const url = new URL(request.url)
    const authHeader = request.headers.get('authorization')
    const queryToken = url.searchParams.get('token')
    
    const cronSecret = process.env.CRON_SECRET
    if (!cronSecret) {
      return NextResponse.json({ error: 'Server misconfiguration: CRON_SECRET not set' }, { status: 500 })
    }

    const isAuthorized = 
      authHeader === `Bearer ${cronSecret}` || 
      queryToken === cronSecret

    if (!isAuthorized) {
      // Intentionally opaque error for security
      return new NextResponse('Unauthorized', { status: 401 })
    }

    // 2. Determine target email
    const adminEmail = process.env.ADMIN_REPORT_EMAIL
    if (!adminEmail) {
      return NextResponse.json({ error: 'Server misconfiguration: ADMIN_REPORT_EMAIL not set' }, { status: 500 })
    }

    // 3. Calculate 3-day date range
    const now = new Date()
    const endDate = now.toISOString().split('T')[0]
    
    const start = new Date(now.getTime() - 3 * 24 * 60 * 60 * 1000)
    const startDate = start.toISOString().split('T')[0]

    // 4. Generate & Send the report (reuses the Excel + Resend logic)
    console.log(`[cron] Initiating scheduled report generation for ${startDate} to ${endDate}...`)
    
    // We pass skipAuth = true because cron has no browser session
    const res = await sendCustomReport(adminEmail, startDate, endDate, true)
    
    if (!res.ok) {
      console.error('[cron] Failed to send report:', res.error)
      return NextResponse.json({ error: res.error }, { status: 500 })
    }

    // 5. Write to audit log
    await writeAuditLog({
      event: 'scheduled_report_sent',
      meta: {
        recipient: adminEmail,
        period: `${startDate} to ${endDate}`,
        trigger: 'cron_3d'
      }
    })

    console.log('[cron] Successfully sent scheduled report')
    return NextResponse.json({ ok: true, sentTo: adminEmail, period: `${startDate} to ${endDate}` })
  } catch (error: any) {
    console.error('[cron] Unhandled error:', error)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}
