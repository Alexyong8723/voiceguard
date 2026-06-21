import { NextRequest, NextResponse } from 'next/server'

/**
 * GET /api/oembed?id=VIDEO_ID
 * Proxies the YouTube oEmbed endpoint (no API key needed).
 * Returns { title, author_name } or { error }.
 */
export async function GET(req: NextRequest) {
  const videoId = req.nextUrl.searchParams.get('id')?.trim()
  if (!videoId) {
    return NextResponse.json({ error: 'Missing video ID' }, { status: 400 })
  }

  // Validate ID format (YouTube IDs are 11 alphanumeric chars / dashes / underscores)
  if (!/^[a-zA-Z0-9_-]{10,12}$/.test(videoId)) {
    return NextResponse.json({ error: 'Invalid YouTube video ID' }, { status: 400 })
  }

  try {
    const url = `https://www.youtube.com/oembed?url=https://www.youtube.com/watch?v=${videoId}&format=json`
    const res = await fetch(url, {
      // 5-second timeout
      signal: AbortSignal.timeout(5000),
      headers: { 'User-Agent': 'VoiceGuard/1.0' },
    })

    if (!res.ok) {
      // 401 = private / 404 = deleted
      return NextResponse.json(
        { error: res.status === 404 ? 'Video not found or unavailable' : 'Video is private or restricted' },
        { status: 422 }
      )
    }

    const data = await res.json()
    return NextResponse.json({
      title:       data.title       ?? '',
      author_name: data.author_name ?? '',
    })
  } catch {
    return NextResponse.json({ error: 'Failed to reach YouTube' }, { status: 502 })
  }
}
