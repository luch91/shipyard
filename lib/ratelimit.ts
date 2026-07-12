import { getRedis } from './redis'

// Shared fixed-window rate limiter. Uses Upstash Redis when configured so the
// limit is GLOBAL across serverless instances; falls back to a per-instance
// in-memory window when Redis is absent or errors — it must never hard-fail the
// caller (matches the app's degrade-without-Redis contract).

export type RateResult = { allowed: boolean; remaining: number; retryAfter: number }

const memory = new Map<string, { count: number; resetAt: number }>()

function memoryLimit(key: string, limit: number, windowSeconds: number): RateResult {
  const now = Date.now()
  const entry = memory.get(key)
  if (!entry || now > entry.resetAt) {
    memory.set(key, { count: 1, resetAt: now + windowSeconds * 1000 })
    return { allowed: true, remaining: limit - 1, retryAfter: windowSeconds }
  }
  entry.count++
  return {
    allowed: entry.count <= limit,
    remaining: Math.max(0, limit - entry.count),
    retryAfter: Math.max(1, Math.ceil((entry.resetAt - now) / 1000)),
  }
}

/**
 * Increment the counter for `key` and report whether it is within `limit` for the
 * current `windowSeconds` bucket. Fixed-window (one Redis INCR + first-hit EXPIRE).
 */
export async function rateLimit(
  key: string,
  limit: number,
  windowSeconds: number
): Promise<RateResult> {
  const redis = getRedis()
  if (!redis) return memoryLimit(key, limit, windowSeconds)
  try {
    const redisKey = `ratelimit:${key}`
    const count = await redis.incr(redisKey)
    if (count === 1) await redis.expire(redisKey, windowSeconds)
    let retryAfter = windowSeconds
    if (count > limit) {
      const ttl = await redis.ttl(redisKey)
      if (ttl > 0) retryAfter = ttl
    }
    return { allowed: count <= limit, remaining: Math.max(0, limit - count), retryAfter }
  } catch {
    // Transient Redis failure — degrade to the in-memory window rather than 500.
    return memoryLimit(key, limit, windowSeconds)
  }
}

/**
 * The real client IP. On Vercel the edge appends the true client IP as the LAST
 * `x-forwarded-for` entry and mirrors it in `x-real-ip`, so neither is spoofable
 * by a client-supplied header — unlike the leftmost `x-forwarded-for` value, which
 * the client controls. Prefer `x-real-ip`, then the last forwarded entry.
 */
export function getClientIp(req: Request): string {
  const realIp = req.headers.get('x-real-ip')?.trim()
  if (realIp) return realIp
  const xff = req.headers.get('x-forwarded-for')
  if (xff) {
    const parts = xff.split(',').map((s) => s.trim()).filter(Boolean)
    if (parts.length) return parts[parts.length - 1]
  }
  return 'unknown'
}
