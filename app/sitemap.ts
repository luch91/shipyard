import type { MetadataRoute } from 'next'
import { BLOG_POSTS } from '@/lib/blog/posts'
import { absoluteUrl } from '@/lib/metadata/site'

const INDEXABLE_PATHS = [
  '/',
  '/deploy',
  '/templates',
  '/compare',
  '/registry',
  '/builders',
  '/skills',
  '/terms',
  '/privacy',
  '/blog',
] as const

export default function sitemap(): MetadataRoute.Sitemap {
  return [
    ...INDEXABLE_PATHS.map((path) => ({
      url: absoluteUrl(path),
    })),
    ...BLOG_POSTS.map((post) => ({
      url: absoluteUrl(`/blog/${post.slug}`),
      lastModified: new Date(post.publishedAt),
    })),
  ]
}
