import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { alertsLimiter, getClientIp } from '@/lib/rateLimit'
import { writeAuditLog } from '@/lib/auditLog'
import { groqChat, parseGroqJson } from '@/lib/groq'

export interface AlertNotification {
  id: string
  type: 'critical' | 'warning' | 'trend' | 'info' | 'tip'
  title: string
  body: string
  source: string
  region: string
  timeAgo: string
  category: string
  actionLabel?: string
  actionUrl?: string
  isNew: boolean
  tags: string[]
}

export async function GET(req: NextRequest) {
  // ── ① Auth guard ────────────────────────────────────────────────────────────
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) {
    const ip = getClientIp(req)
    await writeAuditLog({ event: 'api_unauthorized', ipAddress: ip, meta: { route: '/api/alerts' } })
    return NextResponse.json(
      { error: 'Authentication required.' },
      { status: 401 },
    )
  }

  // ── ② Rate limiting ─────────────────────────────────────────────────────────
  const ip    = getClientIp(req)
  const limit = alertsLimiter.check(ip)
  if (!limit.ok) {
    return NextResponse.json(
      { error: 'Too many requests. Please wait before refreshing alerts.' },
      { status: 429 },
    )
  }

  const today = new Date().toLocaleDateString('en-MY', {
    day: 'numeric', month: 'long', year: 'numeric',
  })

  const prompt = `Today is ${today}. Generate exactly 8 push notification-style cybersecurity alerts for a Malaysian senior citizen safety app called VoiceGuard. Cover: active scam trends, urgent vishing warnings, AI threat updates, and safety tips.

Return ONLY a valid JSON array — no markdown, no extra text. Each item must follow this exact schema:
[
  {
    "id": "unique-id-string",
    "type": "critical|warning|trend|info|tip",
    "title": "Short alert title (max 60 chars)",
    "body": "Alert description in plain language understandable by seniors (max 180 chars)",
    "source": "Authority name (e.g. PDRM, Bank Negara, MCMC, MyCERT, SPF, FTC)",
    "region": "MY or SG or Global",
    "timeAgo": "e.g. Just now, 10 minutes ago, 2 hours ago, 1 day ago",
    "category": "vishing|scam|ai|malware|breach|tip",
    "actionLabel": "Short action button text or null",
    "actionUrl": "/awareness or /dashboard or null",
    "isNew": true or false,
    "tags": ["tag1", "tag2"]
  }
]

Rules:
- At least 2 must be "critical" or "warning" type with isNew: true
- At least 2 must be "trend" type (rising threat patterns)
- At least 2 must be "tip" or "info" type (safety tips)
- Prioritise Malaysia and Singapore context
- Use plain, friendly language seniors can understand
- Start your response with [ and end with ]`

  try {
    const raw    = await groqChat(prompt, { temperature: 0.6, maxTokens: 2500 })
    const alerts = parseGroqJson<AlertNotification[]>(raw)

    return NextResponse.json({ alerts, generatedAt: new Date().toISOString() })
  } catch (err) {
    const msg = err instanceof Error ? err.message : 'Unknown error'
    console.error('[api/alerts] Groq error:', msg)
    return NextResponse.json({ error: msg }, { status: 502 })
  }
}
