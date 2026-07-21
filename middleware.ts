import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

const CANONICAL_HOST = 'genshipyard.com'
const SKILLS_HOST = 'skills.genshipyard.com'

// Whether this is the real production deployment. NODE_ENV is 'production' for
// every `next build`, including preview deployments, so testing it here sent
// previews to the canonical host — i.e. straight to production — which made them
// impossible to review. VERCEL_ENV ('production' | 'preview' | 'development')
// is the signal that actually distinguishes them. Fall back to NODE_ENV when
// VERCEL_ENV is absent (local builds, or system env vars not exposed) so the
// canonical host stays enforced rather than silently switching off.
const vercelEnv = process.env.VERCEL_ENV
const IS_PRODUCTION_DEPLOYMENT = vercelEnv
  ? vercelEnv === 'production'
  : process.env.NODE_ENV === 'production'

export function middleware(request: NextRequest) {
  const host = request.headers.get('host') ?? ''
  // Only enforce host rules in production — in dev this would bounce LAN
  // previews (e.g. a phone hitting the machine's IP) to production.
  if (IS_PRODUCTION_DEPLOYMENT) {
    // The skills subdomain is the catalog front door: serve /skills at its root,
    // and send every other path to the canonical apex so the app isn't duplicated
    // under the subdomain.
    if (host === SKILLS_HOST) {
      const url = request.nextUrl.clone()
      if (url.pathname === '/') {
        url.pathname = '/skills'
        return NextResponse.rewrite(url)
      }
      url.host = CANONICAL_HOST
      url.protocol = 'https'
      url.port = ''
      return NextResponse.redirect(url, { status: 308 })
    }

    // Everything else: enforce the canonical host (except localhost).
    if (host && host !== CANONICAL_HOST && !host.startsWith('localhost')) {
      const url = request.nextUrl.clone()
      url.host = CANONICAL_HOST
      url.protocol = 'https'
      url.port = ''
      return NextResponse.redirect(url, { status: 308 })
    }
  }
  return NextResponse.next()
}

export const config = {
  matcher: ['/((?!_next/static|_next/image|favicon.ico).*)'],
}
