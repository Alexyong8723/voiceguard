import { NextRequest, NextResponse } from 'next/server'
import webpush from 'web-push'
import { createAdminClient } from '@/lib/supabase/admin'

webpush.setVapidDetails(
  process.env.VAPID_CONTACT || 'mailto:admin@voiceguard.app',
  process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY!,
  process.env.VAPID_PRIVATE_KEY!
)

export async function POST(req: NextRequest) {
  try {
    const admin = createAdminClient()
    
    // Optional: verify caller is admin. 
    // In our case, the frontend fetches session or it's a test.
    
    const payload = await req.json()

    const { data: subs, error } = await admin.from('push_subscriptions').select('*')
    if (error) throw error
    if (!subs || subs.length === 0) {
      return NextResponse.json({ success: true, message: 'No active subscriptions' })
    }

    const notificationPayload = JSON.stringify({
      title: payload.title || 'Security Alert',
      body: payload.body || 'New alert from VoiceGuard',
      icon: '/icon512_maskable.png', 
      data: {
        url: payload.url || '/alerts',
      },
      tag: payload.tag || 'vg-alert'
    })

    const results = await Promise.allSettled(
      subs.map(sub => 
        webpush.sendNotification(
          {
            endpoint: sub.endpoint,
            keys: { p256dh: sub.p256dh, auth: sub.auth }
          },
          notificationPayload
        )
      )
    )

    // Clean up invalid endpoints (HTTP 410 Gone or 404 Not Found)
    const toDelete: string[] = []
    results.forEach((res, idx) => {
      if (res.status === 'rejected') {
        if (res.reason?.statusCode === 410 || res.reason?.statusCode === 404) {
          toDelete.push(subs[idx].endpoint)
        }
      }
    })

    if (toDelete.length > 0) {
      await admin.from('push_subscriptions').delete().in('endpoint', toDelete)
    }

    return NextResponse.json({ success: true, sent: subs.length, removed: toDelete.length })
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 })
  }
}
