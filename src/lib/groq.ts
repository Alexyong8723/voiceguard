/**
 * Groq AI helper — drop-in replacement for Gemini.
 *
 * Groq is free at https://console.groq.com
 * Free tier: 14,400 requests/day  |  30 requests/minute
 * Model: llama-3.1-8b-instant (open-source, Meta Llama 3.1)
 *
 * Set GROQ_API_KEY in .env.local — never use NEXT_PUBLIC_ prefix.
 */

const GROQ_API_URL = 'https://api.groq.com/openai/v1/chat/completions'
const GROQ_MODEL   = 'llama-3.1-8b-instant'   // fast, free, open-source

export interface GroqOptions {
  temperature?:    number   // 0.0–1.0  (default 0.6)
  maxTokens?:      number   // default 2048
  systemPrompt?:   string   // optional system message
}

/**
 * Send a prompt to Groq and get the text response back.
 * Throws on network error or non-OK HTTP status.
 */
export async function groqChat(
  userPrompt: string,
  opts: GroqOptions = {},
): Promise<string> {
  const apiKey = process.env.GROQ_API_KEY
  if (!apiKey) throw new Error('GROQ_API_KEY is not configured in .env.local')

  const messages: { role: string; content: string }[] = []

  if (opts.systemPrompt) {
    messages.push({ role: 'system', content: opts.systemPrompt })
  }
  messages.push({ role: 'user', content: userPrompt })

  const res = await fetch(GROQ_API_URL, {
    method:  'POST',
    headers: {
      'Content-Type':  'application/json',
      'Authorization': `Bearer ${apiKey}`,
    },
    body: JSON.stringify({
      model:       GROQ_MODEL,
      messages,
      temperature: opts.temperature ?? 0.6,
      max_tokens:  opts.maxTokens  ?? 2048,
    }),
  })

  if (!res.ok) {
    const errText = await res.text().catch(() => '')
    throw new Error(`Groq API ${res.status}: ${errText.slice(0, 200)}`)
  }

  const data = await res.json()
  return (data.choices?.[0]?.message?.content ?? '').trim()
}

/**
 * Parse JSON from a Groq response, stripping any accidental markdown fences.
 */
export function parseGroqJson<T>(raw: string): T {
  const clean = raw.replace(/^```(?:json)?/m, '').replace(/```\s*$/m, '').trim()
  return JSON.parse(clean) as T
}
