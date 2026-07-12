/** @type {import('next').NextConfig} */

// ─── Enforced baseline security headers (all routes) ───────────────────────────
// Deliberately no script/style CSP here — see the Report-Only policy below. The
// enforced CSP contains ONLY frame-ancestors, which cannot affect resource
// loading; it just blocks the site (notably the /handoff wallet approval page)
// from being embedded in a hostile iframe (clickjacking).
const securityHeaders = [
  { key: 'X-Content-Type-Options', value: 'nosniff' },
  { key: 'Referrer-Policy', value: 'strict-origin-when-cross-origin' },
  { key: 'Strict-Transport-Security', value: 'max-age=63072000; includeSubDomains' },
  { key: 'X-Frame-Options', value: 'DENY' },
  { key: 'Content-Security-Policy', value: "frame-ancestors 'none'" },
]

// ─── Content-Security-Policy: REPORT-ONLY (does not block anything) ─────────────
// This is a first-draft policy grounded in what the app actually loads:
//   - Google Fonts  (globals.css @import)         -> style-src/font-src
//   - Monaco editor (@monaco-editor/react)        -> script-src/worker-src cdn.jsdelivr.net + blob:
//   - GenLayer RPC reads (genlayer-js in browser) -> connect-src *.genlayer.com
//   - WalletConnect v2                            -> connect-src/frame-src *.walletconnect.*
//   - Next.js inline bootstrap + JSON-LD          -> script-src 'unsafe-inline'
// Report-Only means violations are reported to the browser devtools console but
// NOTHING is blocked, so it is safe to ship. Before switching this to an ENFORCED
// `Content-Security-Policy`, exercise the app (connect a wallet, open the Monaco
// editor, deploy/verify) and fold any reported origins in — the individual wallet
// providers (MetaMask/Coinbase/etc.) reach their own endpoints that only show up
// at runtime. The goal for enforcement is to drop 'unsafe-inline'/'unsafe-eval'
// via nonces once the origin list is complete.
const cspReportOnly = [
  "default-src 'self'",
  "base-uri 'self'",
  "object-src 'none'",
  "frame-ancestors 'none'",
  "img-src 'self' data: blob: https:",
  "font-src 'self' https://fonts.gstatic.com data:",
  "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com",
  "script-src 'self' 'unsafe-inline' 'unsafe-eval' https://cdn.jsdelivr.net",
  "worker-src 'self' blob:",
  "connect-src 'self' https://*.genlayer.com https://*.walletconnect.com https://*.walletconnect.org wss://*.walletconnect.com wss://*.walletconnect.org https://cdn.jsdelivr.net",
  "frame-src 'self' https://*.walletconnect.com https://*.walletconnect.org",
].join('; ')

const nextConfig = {
  reactStrictMode: true,
  experimental: {
    serverComponentsExternalPackages: ['genlayer-js'],
    // Enables instrumentation.ts (register() runs once at server startup) so we
    // can log an env-configuration summary. Stable/default in Next 15; behind
    // this flag on 14.2.
    instrumentationHook: true,
  },
  async headers() {
    return [
      {
        source: '/:path*',
        headers: [
          ...securityHeaders,
          { key: 'Content-Security-Policy-Report-Only', value: cspReportOnly },
        ],
      },
    ]
  },
}
module.exports = nextConfig
