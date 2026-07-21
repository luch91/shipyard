import { describe, it, expect } from 'vitest'
import { timeAgo } from '@/lib/activity/timeAgo'

const NOW = Date.parse('2026-07-21T12:00:00.000Z')
const ago = (ms: number) => new Date(NOW - ms).toISOString()

const SEC = 1_000
const MIN = 60 * SEC
const HOUR = 60 * MIN
const DAY = 24 * HOUR

describe('timeAgo', () => {
  it('formats each unit', () => {
    expect(timeAgo(ago(30 * SEC), NOW)).toBe('just now')
    expect(timeAgo(ago(5 * MIN), NOW)).toBe('5m ago')
    expect(timeAgo(ago(3 * HOUR), NOW)).toBe('3h ago')
    expect(timeAgo(ago(4 * DAY), NOW)).toBe('4d ago')
    expect(timeAgo(ago(60 * DAY), NOW)).toBe('2mo ago')
    expect(timeAgo(ago(400 * DAY), NOW)).toBe('1y ago')
  })

  it('does not render a negative duration when the clock is skewed', () => {
    // The timestamp is the server's, the comparison is the browser's — a few
    // seconds of skew must not produce "-1m ago".
    expect(timeAgo(new Date(NOW + 30 * SEC).toISOString(), NOW)).toBe('just now')
  })

  it('returns an empty string for an unparseable timestamp', () => {
    expect(timeAgo('not-a-date', NOW)).toBe('')
  })

  it('crosses each boundary at the right point', () => {
    expect(timeAgo(ago(MIN - 1), NOW)).toBe('just now')
    expect(timeAgo(ago(MIN), NOW)).toBe('1m ago')
    expect(timeAgo(ago(HOUR - 1), NOW)).toBe('59m ago')
    expect(timeAgo(ago(HOUR), NOW)).toBe('1h ago')
    expect(timeAgo(ago(DAY - 1), NOW)).toBe('23h ago')
    expect(timeAgo(ago(DAY), NOW)).toBe('1d ago')
  })
})
