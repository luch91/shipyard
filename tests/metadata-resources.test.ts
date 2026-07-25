import { readFileSync } from 'node:fs'
import { resolve } from 'node:path'
import { describe, expect, it } from 'vitest'
import { GET as getFeed } from '../app/feed.xml/route'
import manifest from '../app/manifest'
import sitemap from '../app/sitemap'

function readPublicFile(path: string): string {
  return readFileSync(resolve(process.cwd(), 'public', path), 'utf8')
}

describe('public discovery resources', () => {
  it('publishes a canonical sitemap while keeping API routes out of crawler scope', () => {
    const robots = readPublicFile('robots.txt')

    expect(robots).toContain('Sitemap: https://genshipyard.com/sitemap.xml')
    expect(robots).toContain('User-agent: OAI-SearchBot')
    expect(robots).toContain('User-agent: ClaudeBot')
    expect(robots).toContain('User-agent: PerplexityBot')
    expect(robots.match(/Disallow: \/api\//g)?.length).toBeGreaterThanOrEqual(1)
  })

  it('only emits unique, public, canonical HTTPS URLs in the sitemap', () => {
    const entries = sitemap()
    const urls = entries.map((entry) => entry.url)

    expect(new Set(urls).size).toBe(urls.length)
    expect(urls.every((url) => url.startsWith('https://genshipyard.com/'))).toBe(true)
    expect(urls).toContain('https://genshipyard.com/')
    expect(urls).not.toEqual(
      expect.arrayContaining([
        expect.stringContaining('/admin'),
        expect.stringContaining('/api/'),
        expect.stringContaining('/handoff'),
        expect.stringContaining('/history'),
      ]),
    )
  })

  it('exposes an installable manifest with the verified SVG icon', () => {
    const data = manifest()

    expect(data.id).toBe('/')
    expect(data.start_url).toBe('/')
    expect(data.scope).toBe('/')
    expect(data.name).toContain('Shipyard')
    expect(data.icons).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          src: '/icon.svg',
          type: 'image/svg+xml',
        }),
      ]),
    )
  })

  it('labels llms.txt as an emerging proposal and ai.txt as non-standard', () => {
    expect(readPublicFile('llms.txt')).toMatch(/emerging llms\.txt proposal/i)
    expect(readPublicFile('ai.txt')).toMatch(/not an\s+adopted web standard/i)
  })
})

describe('security and syndication resources', () => {
  it('publishes the mandatory RFC 9116 security.txt fields and canonical URL', () => {
    const security = readPublicFile('.well-known/security.txt')

    expect(security).toMatch(/^Contact: https:\/\//m)
    expect(security).toMatch(/^Expires: \d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}Z$/m)
    expect(security).toContain(
      'Canonical: https://genshipyard.com/.well-known/security.txt',
    )
    expect(security).toContain('Preferred-Languages: en')
  })

  it('serves a stable RSS document with a self link and unique item identifiers', async () => {
    const response = getFeed()
    const body = await response.text()
    const guids = [...body.matchAll(/<guid isPermaLink="false">(.+)<\/guid>/g)].map(
      ([, guid]) => guid,
    )

    expect(response.status).toBe(200)
    expect(response.headers.get('content-type')).toBe(
      'application/rss+xml; charset=utf-8',
    )
    expect(body).toContain('<rss version="2.0"')
    expect(body).toContain(
      '<atom:link href="https://genshipyard.com/feed.xml" rel="self" type="application/rss+xml" />',
    )
    expect(guids.length).toBeGreaterThan(0)
    expect(new Set(guids).size).toBe(guids.length)
  })
})
