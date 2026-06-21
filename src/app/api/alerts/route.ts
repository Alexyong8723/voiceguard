import { NextRequest, NextResponse } from 'next/server'
import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'

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

// Helper to convert timestamp to "X hours ago" format
function getTimeAgo(dateStr: string): string {
  const diffMs = Date.now() - new Date(dateStr).getTime()
  const diffHours = Math.floor(diffMs / (1000 * 60 * 60))
  if (diffHours < 1) return 'Just now'
  if (diffHours < 24) return `${diffHours} hour${diffHours > 1 ? 's' : ''} ago`
  const diffDays = Math.floor(diffHours / 24)
  if (diffDays === 1) return 'Yesterday'
  return `${diffDays} days ago`
}

export async function GET(_req: NextRequest) {
  const cookieStore = await cookies()
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return cookieStore.getAll()
        },
        setAll(cookiesToSet) {
          try {
            cookiesToSet.forEach(({ name, value, options }) => cookieStore.set(name, value, options))
          } catch {
            // Ignored in GET routes
          }
        },
      },
    }
  )

  const { data, error } = await supabase
    .from('alerts')
    .select('*')
    .order('created_at', { ascending: false })
    .limit(30) // Fetch the latest 30 alerts

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  // Map database fields to the expected frontend interface
  const alerts: AlertNotification[] = (data || []).map(row => ({
    id: String(row.id),
    type: row.type as any,
    title: row.title,
    body: row.body,
    source: row.source,
    region: row.region,
    category: row.category || '',
    actionLabel: row.action_label || undefined,
    actionUrl: row.action_url || undefined,
    isNew: row.is_new,
    tags: row.tags || [],
    timeAgo: getTimeAgo(row.created_at)
  }))

  const today = new Date().toISOString()

  return NextResponse.json(
    { alerts, generatedAt: today, source: 'database' },
    {
      headers: {
        'Cache-Control': 'no-store', // Disable caching so new alerts appear immediately
      },
    }
  )
}

