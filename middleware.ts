import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

const CANONICAL_HOST = 'genshipyard.com'
const SKILLS_HOST = 'skills.genshipyard.com'

// Cloudflare sets this explicitly per Worker. Keep the Vercel fallback while the
// old deployment remains available as a rollback target.
const deploymentEnvironment = process.env.DEPLOYMENT_ENV ?? process.env.VERCEL_ENV
const IS_PRODUCTION_DEPLOYMENT = deploymentEnvironment
  ? deploymentEnvironment === 'production'
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
