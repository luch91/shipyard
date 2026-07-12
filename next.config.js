/** @type {import('next').NextConfig} */

// Baseline security headers applied to every route. Deliberately does NOT set a
// script/style Content-Security-Policy yet — a strict CSP can break the wallet
// connectors, WalletConnect, and the Monaco editor, so that needs separate
// report-only testing. The CSP here contains ONLY frame-ancestors, which cannot
// affect resource loading; it just blocks the site (notably the /handoff wallet
// approval page) from being embedded in a hostile iframe (clickjacking).
const securityHeaders = [
  { key: 'X-Content-Type-Options', value: 'nosniff' },
  { key: 'Referrer-Policy', value: 'strict-origin-when-cross-origin' },
  { key: 'Strict-Transport-Security', value: 'max-age=63072000; includeSubDomains' },
  { key: 'X-Frame-Options', value: 'DENY' },
  { key: 'Content-Security-Policy', value: "frame-ancestors 'none'" },
]

const nextConfig = {
  reactStrictMode: true,
  experimental: { serverComponentsExternalPackages: ['genlayer-js'] },
  async headers() {
    return [{ source: '/:path*', headers: securityHeaders }]
  },
}
module.exports = nextConfig
