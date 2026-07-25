import type { MetadataRoute } from 'next'
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
] as const

export default function sitemap(): MetadataRoute.Sitemap {
  return INDEXABLE_PATHS.map((path) => ({
    url: absoluteUrl(path),
  }))
}
