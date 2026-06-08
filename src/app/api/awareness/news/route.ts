import { NextRequest, NextResponse } from 'next/server'
import { groqChat, parseGroqJson } from '@/lib/groq'

// ── Types ─────────────────────────────────────────────────────────────────────
export interface NewsItem {
  id: string
  title: string
  summary: string
  fullContent: string
  url?: string
  imageUrl?: string
  country: string
  category: string
  severity: 'critical' | 'high' | 'medium' | 'info'
  timeAgo: string
  source: string
  tags: string[]
  seniorInsight: string
}

// ── Env ───────────────────────────────────────────────────────────────────────
const NEWS_KEY = process.env.NEWS_API_KEY

// ── Constants ─────────────────────────────────────────────────────────────────
const REGION_LABEL: Record<string, string> = {
  all: '', MY: 'Malaysia', SG: 'Singapore', US: 'United States',
  UK: 'United Kingdom', AU: 'Australia', IN: 'India',
}

const CATEGORY_QUERY: Record<string, string> = {
  all:     'cybersecurity OR scam OR vishing OR fraud',
  vishing: 'voice phishing vishing phone scam',
  ai:      'AI deepfake voice clone cybersecurity',
  scam:    'online scam fraud cybercrime',
  malware: 'malware ransomware cyberattack',
  breach:  'data breach hack leaked',
}

function humanTime(iso: string): string {
  const diff = Date.now() - new Date(iso).getTime()
  const m = Math.floor(diff / 60000)
  if (m < 60) return `${m} min ago`
  const h = Math.floor(m / 60)
  if (h < 24) return `${h} hour${h > 1 ? 's' : ''} ago`
  return `${Math.floor(h / 24)} day${Math.floor(h / 24) > 1 ? 's' : ''} ago`
}

function guessSeverity(title: string, desc: string): 'critical' | 'high' | 'medium' | 'info' {
  const text = (title + ' ' + desc).toLowerCase()
  if (/ransomware|breach|million|billion|critical|emergency/.test(text)) return 'critical'
  if (/scam|phishing|fraud|malware|hack|stolen|warning/.test(text)) return 'high'
  if (/alert|risk|vulnerability|exploit/.test(text)) return 'medium'
  return 'info'
}

function guessCategory(title: string, desc: string): string {
  const text = (title + ' ' + desc).toLowerCase()
  if (/vish|voice phish|phone call|robocall/.test(text)) return 'vishing'
  if (/ai|deepfake|voice clone|artificial/.test(text)) return 'ai'
  if (/malware|ransomware|virus|trojan/.test(text)) return 'malware'
  if (/breach|leak|hack|stolen data/.test(text)) return 'breach'
  return 'scam'
}

// ── Fetch real news from NewsAPI ──────────────────────────────────────────────
async function fetchFromNewsAPI(
  q: string,
  region: string,
  category: string,
): Promise<Omit<NewsItem, 'seniorInsight'>[]> {
  if (!NEWS_KEY) throw new Error('NEWS_API_KEY not configured')

  const regionQ = REGION_LABEL[region] || ''
  const catQ    = CATEGORY_QUERY[category] || 'cybersecurity'
  const query   = [catQ, regionQ, q].filter(Boolean).join(' ')

  // NewsAPI free tier supports up to 1 month of history (90 days causes 426 error)
  const fromDate = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]

  const url = new URL('https://newsapi.org/v2/everything')
  url.searchParams.set('q', query)
  url.searchParams.set('language', 'en')
  url.searchParams.set('sortBy', 'publishedAt')
  url.searchParams.set('pageSize', '20')
  url.searchParams.set('from', fromDate)
  url.searchParams.set('apiKey', NEWS_KEY)

  const res = await fetch(url.toString(), { next: { revalidate: 300 } })
  if (!res.ok) throw new Error(`NewsAPI ${res.status}`)

  const data = await res.json()
  if (data.status !== 'ok') throw new Error(data.message || 'NewsAPI error')

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  return data.articles.filter((a: any) => a.title && a.description).map((a: any, i: number) => ({
    id:          `na-${i}-${Date.now()}`,
    title:       a.title.replace(/ - [^-]+$/, '').trim(),
    summary:     a.description || '',
    fullContent: a.content?.replace(/\[\+\d+ chars\]/, '').trim() || a.description || '',
    url:         a.url || undefined,
    imageUrl:    a.urlToImage || undefined,
    country:     region === 'all' ? 'all' : region,
    category:    category === 'all' ? guessCategory(a.title, a.description) : category,
    severity:    guessSeverity(a.title, a.description),
    timeAgo:     humanTime(a.publishedAt),
    source:      a.source?.name || 'News Source',
    tags:        [],
  }))
}

// ── Groq: enrich articles with plain-language senior insights ─────────────────
async function enrichWithInsights(
  articles: Omit<NewsItem, 'seniorInsight'>[],
): Promise<NewsItem[]> {
  if (articles.length === 0) return []

  const summaries = articles
    .map((a, i) => `${i + 1}. TITLE: ${a.title}\nSUMMARY: ${a.summary}`)
    .join('\n\n')

  const prompt = `For each news headline below, write a SHORT, SIMPLE insight (2-3 sentences max) that explains the danger in everyday language and tells seniors (aged 60+) exactly what to watch out for or do. Use a warm, reassuring tone with no technical jargon.

Return ONLY a valid JSON array: [{"index": 1, "insight": "..."}, ...]
Start with [ and end with ].

NEWS ITEMS:
${summaries}`

  try {
    const raw      = await groqChat(prompt, { temperature: 0.5, maxTokens: 1500 })
    const insights = parseGroqJson<{ index: number; insight: string }[]>(raw)
    const map      = new Map(insights.map(x => [x.index, x.insight]))

    return articles.map((a, i) => ({ ...a, seniorInsight: map.get(i + 1) || '' }))
  } catch (e) {
    console.warn('[awareness/news] Insight enrichment error:', e)
    return articles.map(a => ({ ...a, seniorInsight: '' }))
  }
}

// ── Groq: fully generate news when NewsAPI unavailable ────────────────────────
async function generateFromGroq(
  q: string,
  region: string,
  category: string,
): Promise<NewsItem[]> {
  const regionHint = REGION_LABEL[region] ? `in ${REGION_LABEL[region]}` : 'globally'
  const catHint    = CATEGORY_QUERY[category] || 'cybersecurity'
  const searchHint = q ? `Focus specifically on: "${q}".` : ''

  const prompt = `Generate 4 cybersecurity news articles about ${catHint} threats ${regionHint}. ${searchHint}

Return ONLY a valid JSON array. Each item must have exactly these fields (keep values concise):
{"id":"uid","title":"headline under 80 chars","summary":"1-2 sentences under 150 chars","fullContent":"2 short paragraphs","country":"${region === 'all' ? 'all' : region}","category":"${category === 'all' ? 'scam' : category}","severity":"high","timeAgo":"3 days ago","source":"source name","tags":["tag1","tag2"],"seniorInsight":"1 sentence warning for seniors."}

Start with [ and end with ]. No extra text.`

  const raw = await groqChat(prompt, { temperature: 0.5, maxTokens: 2500 })

  // Attempt to repair truncated JSON by trimming to the last complete object
  let cleanRaw = raw
  const jsonStart = cleanRaw.indexOf('[')
  if (jsonStart > 0) cleanRaw = cleanRaw.slice(jsonStart)
  try {
    const articles = parseGroqJson<NewsItem[]>(cleanRaw)
    return articles
  } catch {
    // Try to salvage partial array by cutting at last complete object
    const lastBrace = cleanRaw.lastIndexOf('},')
    if (lastBrace > 0) {
      const salvaged = cleanRaw.slice(0, lastBrace + 1) + ']'
      return parseGroqJson<NewsItem[]>(salvaged)
    }
    throw new Error('Groq returned unparseable JSON')
  }
}


// ── Route Handler ─────────────────────────────────────────────────────────────
export async function POST(req: NextRequest) {
  let body: { region?: string; category?: string; query?: string }
  try { body = await req.json() }
  catch { return NextResponse.json({ error: 'Invalid request body.' }, { status: 400 }) }

  const region   = body.region   || 'all'
  const category = body.category || 'all'
  const query    = (body.query   || '').trim()

  // 1. Try real news from NewsAPI + enrich with Groq insights
  if (NEWS_KEY) {
    try {
      const raw      = await fetchFromNewsAPI(query, region, category)
      const articles = await enrichWithInsights(raw)
      return NextResponse.json({ articles, source: 'newsapi+groq' })
    } catch (e) {
      console.warn('[awareness/news] NewsAPI failed:', e instanceof Error ? e.message : e)
    }
  }

  // 2. Fully generate with Groq (includes seniorInsight)
  try {
    const articles = await generateFromGroq(query, region, category)
    return NextResponse.json({ articles, source: 'groq' })
  } catch (e) {
    const msg = e instanceof Error ? e.message : 'Unknown error'
    console.error('[awareness/news] Groq failed:', msg)
    return NextResponse.json({ error: msg }, { status: 502 })
  }
}
