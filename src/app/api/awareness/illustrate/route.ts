import { NextRequest, NextResponse } from 'next/server'
import { groqChat, parseGroqJson } from '@/lib/groq'

export interface IllustrationData {
  headline:   string    // 1 plain-language sentence
  scenario:   string    // What the scammer does (simple terms)
  redFlags:   string[]  // 3 warning signs, short phrases
  safeAction: string    // One clear action to take
  emoji:      string    // Relevant emoji
  severity:   string    // critical | high | medium | info
}

export async function POST(req: NextRequest) {
  let body: { title: string; summary: string; fullContent: string; severity?: string }
  try { body = await req.json() } catch {
    return NextResponse.json({ error: 'Bad request' }, { status: 400 })
  }

  const prompt = `You are helping senior citizens (age 60+) understand a cybersecurity threat. Read the article below and create a simple visual explanation.

ARTICLE TITLE: ${body.title}
SUMMARY: ${body.summary}
CONTENT: ${body.fullContent.slice(0, 800)}

Return ONLY valid JSON (no markdown):
{
  "headline": "One very simple sentence (max 12 words) warning what this threat is. Use simple everyday words.",
  "scenario": "In 2-3 simple sentences, describe what a scammer actually does in this attack. Use simple words a grandparent would understand. No jargon.",
  "redFlags": ["Short warning sign 1 (max 8 words)", "Short warning sign 2 (max 8 words)", "Short warning sign 3 (max 8 words)"],
  "safeAction": "One clear action sentence starting with a verb, e.g. Hang up and call your bank directly.",
  "emoji": "Single most relevant emoji for this threat",
  "severity": "${body.severity || 'high'}"
}

Start with { and end with }.`

  try {
    const raw          = await groqChat(prompt, { temperature: 0.4, maxTokens: 600 })
    const illustration = parseGroqJson<IllustrationData>(raw)
    return NextResponse.json(illustration)
  } catch (e) {
    return NextResponse.json(
      { error: e instanceof Error ? e.message : 'Failed to generate illustration' },
      { status: 502 }
    )
  }
}
