import { describe, it, expect } from 'vitest'
import { getClientIp } from '@/lib/ratelimit'

// getClientIp is what every rate limit keys on. If it can be spoofed, the limits
// (incl. the OpenRouter cost cap) are meaningless — so its header handling is
// security-relevant, not cosmetic.

function reqWith(headers: Record<string, string>): Request {
  return new Request('http://example.com/', { headers })
}

describe('getClientIp', () => {
  it('prefers x-real-ip', () => {
    expect(getClientIp(reqWith({ 'x-real-ip': '203.0.113.7' }))).toBe('203.0.113.7')
  })

  it('trims whitespace on x-real-ip', () => {
    expect(getClientIp(reqWith({ 'x-real-ip': '  203.0.113.7  ' }))).toBe('203.0.113.7')
  })

  it('falls back to the LAST x-forwarded-for entry (the platform-appended one)', () => {
    expect(getClientIp(reqWith({ 'x-forwarded-for': '198.51.100.5' }))).toBe('198.51.100.5')
    expect(getClientIp(reqWith({ 'x-forwarded-for': '1.1.1.1, 2.2.2.2, 203.0.113.9' }))).toBe(
      '203.0.113.9'
    )
  })

  it('is not spoofable via a client-supplied leftmost x-forwarded-for', () => {
    // A client sends a fake IP; the platform appends the true one last. We must
    // key on the trusted last value, never the attacker-controlled first.
    const spoofed = reqWith({ 'x-forwarded-for': 'evil-spoof, 203.0.113.42' })
    expect(getClientIp(spoofed)).toBe('203.0.113.42')
    expect(getClientIp(spoofed)).not.toBe('evil-spoof')
  })

  it('returns "unknown" when no IP headers are present', () => {
    expect(getClientIp(reqWith({}))).toBe('unknown')
  })
})
