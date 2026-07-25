import { BLOG_POSTS } from '@/lib/blog/posts'
import { SITE_NAME, SITE_URL } from '@/lib/metadata/site'

const productItems = [
  {
    title: 'Professional landing and deploy experience',
    description:
      'Shipyard refreshed its landing and deploy surfaces and aligned the product around five network environments, including Localnet and Clarke coming soon.',
    link: `${SITE_URL}/`,
    guid: `${SITE_URL}/#update-2026-07-25-ui`,
    published: 'Sat, 25 Jul 2026 00:00:00 GMT',
  },
  {
    title: 'Public GenLayer activity feed',
    description:
      'The contract registry now includes recent public deployment, verification, and fork activity.',
    link: `${SITE_URL}/registry`,
    guid: `${SITE_URL}/registry#update-2026-07-22-activity`,
    published: 'Wed, 22 Jul 2026 00:00:00 GMT',
  },
  {
    title: 'Builder leaderboards and profiles',
    description:
      'Shipyard added public builder reputation rankings and profiles backed by verified contract activity.',
    link: `${SITE_URL}/builders`,
    guid: `${SITE_URL}/builders#update-2026-07-20-builders`,
    published: 'Mon, 20 Jul 2026 00:00:00 GMT',
  },
] as const

const articleItems = BLOG_POSTS.map((post) => ({
  title: post.title,
  description: post.description,
  link: `${SITE_URL}/blog/${post.slug}`,
  guid: `${SITE_URL}/blog/${post.slug}`,
  published: new Date(`${post.publishedAt}T00:00:00Z`).toUTCString(),
}))

const items = [...articleItems, ...productItems]

function escapeXml(value: string): string {
  return value
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;')
    .replaceAll("'", '&apos;')
}

export function GET() {
  const entries = items
    .map(
      (item) => `    <item>
      <title>${escapeXml(item.title)}</title>
      <description>${escapeXml(item.description)}</description>
      <link>${escapeXml(item.link)}</link>
      <guid isPermaLink="false">${escapeXml(item.guid)}</guid>
      <pubDate>${item.published}</pubDate>
    </item>`,
    )
    .join('\n')

  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0" xmlns:atom="http://www.w3.org/2005/Atom">
  <channel>
    <title>${SITE_NAME} Guides and Product Updates</title>
    <description>Technical GenLayer guides and product updates from Shipyard.</description>
    <link>${SITE_URL}</link>
    <language>en</language>
    <lastBuildDate>${items[0].published}</lastBuildDate>
    <atom:link href="${SITE_URL}/feed.xml" rel="self" type="application/rss+xml" />
${entries}
  </channel>
</rss>
`

  return new Response(xml, {
    headers: {
      'Content-Type': 'application/rss+xml; charset=utf-8',
      'Cache-Control': 'public, max-age=3600, s-maxage=86400, stale-while-revalidate=604800',
    },
  })
}
