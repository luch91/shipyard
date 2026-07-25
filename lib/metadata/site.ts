import type { Metadata } from 'next'

export const SITE_NAME = 'Shipyard'
export const SITE_URL = 'https://genshipyard.com'
export const DEFAULT_TITLE = 'Shipyard — Deploy Intelligent Contracts on GenLayer'
export const DEFAULT_DESCRIPTION =
  'Browser-based deployment platform for GenLayer Intelligent Contracts. Deploy to Bradbury, Asimov, Studionet, or Localnet, with Clarke coming soon.'
export const SOCIAL_IMAGE_PATH = '/opengraph-image'

export function absoluteUrl(path = '/'): string {
  return new URL(path, SITE_URL).toString()
}

interface PageMetadataOptions {
  title: string
  description: string
  path: string
  absoluteTitle?: boolean
  noIndex?: boolean
}

export function createPageMetadata({
  title,
  description,
  path,
  absoluteTitle = false,
  noIndex = false,
}: PageMetadataOptions): Metadata {
  const canonical = absoluteUrl(path)
  const socialTitle = absoluteTitle ? title : `${title} — ${SITE_NAME}`

  return {
    title: absoluteTitle ? { absolute: title } : title,
    description,
    alternates: {
      canonical,
      types: {
        'application/rss+xml': absoluteUrl('/feed.xml'),
      },
    },
    openGraph: {
      title: socialTitle,
      description,
      url: canonical,
      siteName: SITE_NAME,
      type: 'website',
      locale: 'en_US',
      images: [
        {
          url: absoluteUrl(SOCIAL_IMAGE_PATH),
          width: 1200,
          height: 630,
          alt: `${SITE_NAME} — GenLayer Intelligent Contract deployment`,
        },
      ],
    },
    twitter: {
      card: 'summary_large_image',
      title: socialTitle,
      description,
      images: [absoluteUrl(SOCIAL_IMAGE_PATH)],
    },
    robots: noIndex
      ? {
          index: false,
          follow: false,
          noarchive: true,
        }
      : {
          index: true,
          follow: true,
          googleBot: {
            index: true,
            follow: true,
            'max-image-preview': 'large',
            'max-snippet': -1,
            'max-video-preview': -1,
          },
        },
  }
}
