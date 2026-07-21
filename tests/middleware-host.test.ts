import { describe, it, expect, afterEach, vi } from 'vitest'

// The middleware's production gate decides whether every request is forced to the
// canonical host. Getting it wrong is not cosmetic in either direction:
//   - too broad (the old NODE_ENV check, which is 'production' for preview builds
//     too) sent every preview deployment 308 straight to production, so nothing
//     could be reviewed before it went live;
//   - too narrow would silently stop enforcing the canonical host in production.
// These tests pin both edges.

const PREVIEW_HOST = 'shipyard-1iou5wxmd-oluchi-judiths-projects.vercel.app'

async function runMiddleware(host: string, path = '/') {
  vi.resetModules()
  const [{ middleware }, { NextRequest }] = await Promise.all([
    import('../middleware'),
    import('next/server'),
  ])
  const req = new NextRequest(`https://${host}${path}`, { headers: { host } })
  return middleware(req)
}

/** NextResponse.next() marks itself with x-middleware-next rather than a status. */
function isPassThrough(res: Response) {
  return res.headers.get('x-middleware-next') === '1'
}

afterEach(() => {
  vi.unstubAllEnvs()
})

describe('canonical-host middleware', () => {
  it('does NOT redirect preview deployments', async () => {
    vi.stubEnv('VERCEL_ENV', 'preview')
    vi.stubEnv('NODE_ENV', 'production') // what a preview build actually looks like
    const res = await runMiddleware(PREVIEW_HOST)
    expect(isPassThrough(res)).toBe(true)
    expect(res.headers.get('location')).toBeNull()
  })

  it('redirects a non-canonical host to the canonical one in production', async () => {
    vi.stubEnv('VERCEL_ENV', 'production')
    vi.stubEnv('NODE_ENV', 'production')
    const res = await runMiddleware(PREVIEW_HOST, '/builders')
    expect(res.status).toBe(308)
    expect(res.headers.get('location')).toBe('https://genshipyard.com/builders')
  })

  it('leaves the canonical host alone', async () => {
    vi.stubEnv('VERCEL_ENV', 'production')
    vi.stubEnv('NODE_ENV', 'production')
    const res = await runMiddleware('genshipyard.com', '/builders')
    expect(isPassThrough(res)).toBe(true)
  })

  it('still enforces the canonical host when VERCEL_ENV is unavailable', async () => {
    // System env vars not exposed, or a self-hosted production build: the fallback
    // must keep enforcing rather than silently switching the redirect off.
    vi.stubEnv('VERCEL_ENV', '')
    vi.stubEnv('NODE_ENV', 'production')
    const res = await runMiddleware('some-other-host.example.com')
    expect(res.status).toBe(308)
    expect(res.headers.get('location')).toBe('https://genshipyard.com/')
  })

  it('does not touch local dev', async () => {
    vi.stubEnv('VERCEL_ENV', '')
    vi.stubEnv('NODE_ENV', 'development')
    const res = await runMiddleware('localhost:3000')
    expect(isPassThrough(res)).toBe(true)
  })

  it('serves /skills at the root of the skills subdomain', async () => {
    vi.stubEnv('VERCEL_ENV', 'production')
    vi.stubEnv('NODE_ENV', 'production')
    const res = await runMiddleware('skills.genshipyard.com')
    // A rewrite, not a redirect — the URL stays put.
    expect(res.headers.get('location')).toBeNull()
    expect(res.headers.get('x-middleware-rewrite')).toContain('/skills')
  })
})
