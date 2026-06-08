import { NextRequest, NextResponse } from 'next/server'
import { groqChat, parseGroqJson } from '@/lib/groq'

export interface NewsArticle {
  id: string
  title: string
  summary: string
  fullContent: string
  url?: string
  imageUrl?: string
  country: string
  category: string
  severity: 'critical' | 'high' | 'medium' | 'info'
  publishedAt: string
  timeAgo: string
  source: string
  tags: string[]
}

// ── Env ───────────────────────────────────────────────────────────────────────
const NEWS_KEY = process.env.NEWS_API_KEY

// ── Helpers ───────────────────────────────────────────────────────────────────
const REGION_LABEL: Record<string, string> = {
  all: '', MY: 'Malaysia', SG: 'Singapore', US: 'United States',
  UK: 'United Kingdom', AU: 'Australia', IN: 'India', CN: 'China',
}

const CATEGORY_QUERY: Record<string, string> = {
  all: 'cybersecurity OR scam OR vishing',
  vishing: 'voice phishing vishing phone scam',
  ai: 'AI deepfake voice clone cybersecurity',
  scam: 'online scam fraud cybercrime',
  malware: 'malware ransomware cyberattack',
  breach: 'data breach hack leaked',
}

function humanTime(iso: string): string {
  const diff = Date.now() - new Date(iso).getTime()
  const m = Math.floor(diff / 60000)
  if (m < 60) return `${m}m ago`
  const h = Math.floor(m / 60)
  if (h < 24) return `${h}h ago`
  return `${Math.floor(h / 24)}d ago`
}

// ── NewsAPI ───────────────────────────────────────────────────────────────────
async function fromNewsAPI(q: string, region: string, category: string): Promise<NewsArticle[]> {
  if (!NEWS_KEY) throw new Error('NEWS_API_KEY not set')

  const regionQ = REGION_LABEL[region] || ''
  const catQ    = CATEGORY_QUERY[category] || 'cybersecurity'
  const query   = [catQ, regionQ, q].filter(Boolean).join(' ')

  const url = new URL('https://newsapi.org/v2/everything')
  url.searchParams.set('q', query)
  url.searchParams.set('language', 'en')
  url.searchParams.set('sortBy', 'publishedAt')
  url.searchParams.set('pageSize', '8')
  url.searchParams.set('apiKey', NEWS_KEY)

  const res = await fetch(url.toString(), { next: { revalidate: 300 } })
  if (!res.ok) throw new Error(`NewsAPI ${res.status}`)

  const data = await res.json()
  if (data.status !== 'ok') throw new Error(data.message || 'NewsAPI error')

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  return data.articles.filter((a: any) => a.title && a.description).map((a: any, i: number) => ({
    id: `na-${i}-${Date.now()}`,
    title: a.title.replace(' - ' + (a.source?.name || ''), ''),
    summary: a.description || '',
    fullContent: a.content?.replace(/\[\+\d+ chars\]/, '').trim() || a.description || '',
    url: a.url,
    imageUrl: a.urlToImage || undefined,
    country: region === 'all' ? 'all' : region,
    category: category === 'all' ? 'scam' : category,
    severity: 'medium' as const,
    publishedAt: a.publishedAt,
    timeAgo: humanTime(a.publishedAt),
    source: a.source?.name || 'NewsAPI',
    tags: [],
  }))
}

// ── Groq (AI generated) ───────────────────────────────────────────────────────
async function fromGroq(q: string, region: string, category: string): Promise<NewsArticle[]> {
  const regionHint = REGION_LABEL[region] ? `in ${REGION_LABEL[region]}` : 'globally'
  const catHint    = CATEGORY_QUERY[category] || 'cybersecurity'
  const searchHint = q ? `Focus specifically on: "${q}".` : ''

  const prompt = `You are a cybersecurity news analyst. Generate 5 realistic, detailed cybersecurity news articles about ${catHint} threats ${regionHint} from 2024–2025. ${searchHint}

Respond with ONLY a valid JSON array (no markdown fences). Schema:
[{"id":"unique-id","title":"headline max 90 chars","summary":"2 sentences max 170 chars","fullContent":"3 detailed paragraphs explaining the threat, victims affected, statistics, and protective advice","country":"${region === 'all' ? 'ISO-2 code or all' : region}","category":"${category === 'all' ? 'vishing|ai|scam|malware|breach' : category}","severity":"critical|high|medium|info","publishedAt":"2025-MM-DDTHH:MM:SSZ","timeAgo":"X hours/days ago","source":"realistic authority name","tags":["tag1","tag2","tag3"]}]

Start with [ and end with ].`

  const raw      = await groqChat(prompt, { temperature: 0.65, maxTokens: 2500 })
  const articles = parseGroqJson<NewsArticle[]>(raw)
  return articles
}

// ── Handler ───────────────────────────────────────────────────────────────────
export async function POST(req: NextRequest) {
  let body: { query?: string; region?: string; category?: string }
  try { body = await req.json() } catch { return NextResponse.json({ error: 'Bad request' }, { status: 400 }) }

  const query    = (body.query || '').trim()
  const region   = body.region   || 'all'
  const category = body.category || 'all'

  // 1. Try real news (NewsAPI)
  if (NEWS_KEY) {
    try {
      const articles = await fromNewsAPI(query, region, category)
      return NextResponse.json({ articles, source: 'newsapi' })
    } catch (e) {
      console.warn('[awareness/search] NewsAPI failed:', e instanceof Error ? e.message : e)
    }
  }

  // 2. AI-generated via Groq (Llama 3.1 open-source)
  try {
    const articles = await fromGroq(query, region, category)
    return NextResponse.json({ articles, source: 'groq' })
  } catch (e) {
    const msg = e instanceof Error ? e.message : 'Unknown error'
    console.error('[awareness/search] Groq failed:', msg)
    return NextResponse.json({ error: msg }, { status: 502 })
  }
}
