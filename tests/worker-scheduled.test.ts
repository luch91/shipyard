import { beforeEach, describe, expect, it, vi } from 'vitest'

const { fetchMock } = vi.hoisted(() => ({ fetchMock: vi.fn() }))

vi.mock('vinext/server/fetch-handler', () => ({
  default: { fetch: fetchMock },
}))

import worker from '../worker'

const controller = {
  scheduledTime: Date.now(),
  cron: '10 0 * * *',
  noRetry: vi.fn(),
}

const ctx = {
  waitUntil: vi.fn(),
  passThroughOnException: vi.fn(),
  props: {},
}

beforeEach(() => {
  fetchMock.mockReset()
})

describe('Cloudflare scheduled analytics handler', () => {
  it('calls the rollup route in-process on the canonical production host', async () => {
    fetchMock.mockResolvedValue(new Response('{"ok":true}', { status: 200 }))

    await worker.scheduled(controller, { CRON_SECRET: 'test-cron-secret' }, ctx)

    expect(fetchMock).toHaveBeenCalledOnce()
    const request = fetchMock.mock.calls[0][0] as Request
    expect(request.url).toBe('https://genshipyard.com/api/cron/rollup')
    expect(request.headers.get('authorization')).toBe('Bearer test-cron-secret')
  })

  it('fails the invocation when the rollup route is unsuccessful', async () => {
    fetchMock.mockResolvedValue(new Response('redirect', { status: 308 }))

    await expect(
      worker.scheduled(controller, { CRON_SECRET: 'test-cron-secret' }, ctx),
    ).rejects.toThrow('Analytics rollup failed with status 308')
  })
})
