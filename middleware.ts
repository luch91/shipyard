import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

const CANONICAL_HOST = 'genshipyard.com'

export function middleware(request: NextRequest) {
  const host = request.headers.get('host') ?? ''
  if (host && host !== CANONICAL_HOST && !host.startsWith('localhost')) {
    const url = request.nextUrl.clone()
    url.host = CANONICAL_HOST
    url.protocol = 'https'
    url.port = ''
    return NextResponse.redirect(url, { status: 308 })
  }
  return NextResponse.next()
}

export const config = {
  matcher: ['/((?!_next/static|_next/image|favicon.ico).*)'],
}
