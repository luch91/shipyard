import { NextRequest, NextResponse } from 'next/server'
import { GENLAYER_SYSTEM_PROMPT } from '@/lib/ai/systemPrompt'
import { AI_MODELS } from '@/lib/ai/models'
import { validateContract } from '@/lib/genlayer/parser'
import { rateLimit, getClientIp } from '@/lib/ratelimit'

// ── Types ─────────────────────────────────────────────────────────────────────

interface GenerateRequest {
  description: string
  modelId: string
}

interface OpenRouterMessage {
  role: 'user' | 'assistant' | 'system'
  content: string
}

// ── Limits ────────────────────────────────────────────────────────────────────
// Every generation can cost up to two OpenRouter calls (the initial generation
// plus one repair pass), so the endpoint is rate limited per client IP to protect
// the account from being drained. The limiter lives in lib/ratelimit.ts (Redis-
// backed and global across serverless instances; in-memory fallback without Redis).

const GENERATE_LIMIT = 3 // generations per IP per window
const WINDOW_SECONDS = 24 * 60 * 60 // 24 hours
const MAX_DESCRIPTION_CHARS = 4000

// ── OpenRouter call + output cleaning ─────────────────────────────────────────

async function callOpenRouter(
  apiKey: string,
  modelId: string,
  messages: OpenRouterMessage[]
): Promise<{ ok: true; content: string } | { ok: false; status: number; message: string }> {
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
      messages,
    }),
  })

  if (!response.ok) {
    const err = await response.json().catch(() => ({}))
    const message =
      (err as { error?: { message?: string } })?.error?.message ?? `OpenRouter error ${response.status}`
    return { ok: false, status: response.status, message }
  }

  const data = await response.json()
  const content = data?.choices?.[0]?.message?.content ?? ''
  return { ok: true, content }
}

function cleanContract(raw: string): string {
  let c = raw.trim()
  // Strip markdown code fences if the model added them despite instructions
  c = c
    .replace(/^```(?:python|py)?\n?/i, '')
    .replace(/\n?```$/i, '')
    .trim()
  // If the model added prose before the contract, slice from the pinned-hash header
  const headerIdx = c.search(/#\s*\{\s*"Depends"/)
  if (headerIdx > 0) c = c.slice(headerIdx).trim()
  return c
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

  if (description.trim().length > MAX_DESCRIPTION_CHARS) {
    return NextResponse.json(
      { error: `Description is too long (max ${MAX_DESCRIPTION_CHARS} characters).` },
      { status: 400 }
    )
  }

  if (!modelId || !AI_MODELS.find((m) => m.id === modelId)) {
    return NextResponse.json({ error: 'Invalid model ID.' }, { status: 400 })
  }

  // Rate limit every request (each costs real tokens), keyed by the real client IP.
  const ip = getClientIp(req)
  const { allowed, remaining, retryAfter } = await rateLimit(
    `generate:${ip}`,
    GENERATE_LIMIT,
    WINDOW_SECONDS
  )
  if (!allowed) {
    return NextResponse.json(
      { error: 'Generation rate limit reached. Please wait a bit and try again.' },
      { status: 429, headers: { 'Retry-After': String(retryAfter) } }
    )
  }

  try {
    const baseMessages: OpenRouterMessage[] = [
      { role: 'system', content: GENLAYER_SYSTEM_PROMPT },
      { role: 'user', content: description.trim() },
    ]

    const first = await callOpenRouter(apiKey, modelId, baseMessages)
    if (!first.ok) {
      return NextResponse.json({ error: first.message }, { status: first.status })
    }

    let contract = cleanContract(first.content)
    if (!contract.trim()) {
      return NextResponse.json(
        { error: 'Model returned an empty response. Try a different description.' },
        { status: 500 }
      )
    }

    // Reliability pass: if the generated contract fails validation, ask the model
    // to fix the specific errors once. Only adopt the retry if it actually validates;
    // otherwise keep the original. Improves the deployability of AI output.
    const validation = validateContract(contract)
    let repaired = false
    if (!validation.valid) {
      const repairMessages: OpenRouterMessage[] = [
        ...baseMessages,
        { role: 'assistant', content: contract },
        {
          role: 'user',
          content:
            'The contract has these validation errors that prevent deployment:\n' +
            validation.errors.map((e) => `- ${e}`).join('\n') +
            '\n\nReturn a corrected version that fixes these errors. Output ONLY the raw ' +
            'Python code starting with the header line — no explanation, no markdown.',
        },
      ]

      const retry = await callOpenRouter(apiKey, modelId, repairMessages)
      if (retry.ok) {
        const fixed = cleanContract(retry.content)
        if (fixed.trim() && validateContract(fixed).valid) {
          contract = fixed
          repaired = true
        }
      }
    }

    return NextResponse.json({
      contract,
      model: modelId,
      remaining,
      repaired,
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
