import { NextRequest, NextResponse } from 'next/server'
import { GENLAYER_SYSTEM_PROMPT } from '@/lib/ai/systemPrompt'
import { AI_MODELS } from '@/lib/ai/models'

// ── Types ─────────────────────────────────────────────────────────────────────

interface GenerateRequest {
  description: string
  modelId: string
}

interface OpenRouterMessage {
  role: 'user' | 'assistant' | 'system'
  content: string
}

// ── Rate limiting — simple in-memory store ────────────────────────────────────
// Limits free-model users to 10 generations per hour per IP.
// Paid models (no :free suffix) bypass this limit.
// Resets on server restart — intentional for serverless deployment.

const rateLimitMap = new Map<string, { count: number; resetAt: number }>()
const FREE_LIMIT = 10
const WINDOW_MS = 60 * 60 * 1000

function checkRateLimit(ip: string, modelId: string): { allowed: boolean; remaining: number } {
  if (!modelId.includes(':free')) return { allowed: true, remaining: Infinity }

  const now = Date.now()
  const entry = rateLimitMap.get(ip)

  if (!entry || now > entry.resetAt) {
    rateLimitMap.set(ip, { count: 1, resetAt: now + WINDOW_MS })
    return { allowed: true, remaining: FREE_LIMIT - 1 }
  }

  if (entry.count >= FREE_LIMIT) {
    return { allowed: false, remaining: 0 }
  }

  entry.count++
  return { allowed: true, remaining: FREE_LIMIT - entry.count }
}

// ── Route handler ─────────────────────────────────────────────────────────────

export async function POST(req: NextRequest) {
  const apiKey = process.env.OPENROUTER_API_KEY
  if (!apiKey) {
    return NextResponse.json(
      { error: 'OpenRouter API key not configured.' },
      { status: 500 }
    )
  }

  let body: GenerateRequest
  try {
    body = await req.json()
  } catch {
    return NextResponse.json({ error: 'Invalid request body.' }, { status: 400 })
  }

  const { description, modelId } = body

  if (!description?.trim()) {
    return NextResponse.json({ error: 'Description is required.' }, { status: 400 })
  }

  if (!modelId || !AI_MODELS.find((m) => m.id === modelId)) {
    return NextResponse.json({ error: 'Invalid model ID.' }, { status: 400 })
  }

  const ip = req.headers.get('x-forwarded-for')?.split(',')[0].trim() ?? 'unknown'
  const { allowed, remaining } = checkRateLimit(ip, modelId)

  if (!allowed) {
    return NextResponse.json(
      { error: 'Rate limit reached for free models. Try the paid Qwen3 Coder or wait 1 hour.' },
      { status: 429 }
    )
  }

  try {
    const messages: OpenRouterMessage[] = [
      { role: 'user', content: description.trim() },
    ]

    const response = await fetch('https://openrouter.ai/api/v1/chat/completions', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
        'HTTP-Referer': 'https://genshipyard.com',
        'X-Title': 'Shipyard - GenLayer Deploy Platform',
      },
      body: JSON.stringify({
        model: modelId,
        max_tokens: 2048,
        temperature: 0.2,
        messages: [
          { role: 'system', content: GENLAYER_SYSTEM_PROMPT },
          ...messages,
        ],
      }),
    })

    if (!response.ok) {
      const err = await response.json().catch(() => ({}))
      const message = (err as { error?: { message?: string } })?.error?.message ?? `OpenRouter error ${response.status}`
      return NextResponse.json({ error: message }, { status: response.status })
    }

    const data = await response.json()
    const contract = data?.choices?.[0]?.message?.content ?? ''

    if (!contract.trim()) {
      return NextResponse.json(
        { error: 'Model returned an empty response. Try a different description.' },
        { status: 500 }
      )
    }

    // Strip markdown code fences if model added them despite instructions
    const cleaned = contract
      .replace(/^```python\n?/i, '')
      .replace(/^```\n?/i, '')
      .replace(/\n?```$/i, '')
      .trim()

    return NextResponse.json({
      contract: cleaned,
      model: modelId,
      remaining: remaining === Infinity ? null : remaining,
    })
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Unknown error'
    console.error('[generate] OpenRouter call failed:', message)
    return NextResponse.json(
      { error: 'Failed to reach the AI service. Try again.' },
      { status: 500 }
    )
  }
}
