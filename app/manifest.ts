import type { MetadataRoute } from 'next'

export default function manifest(): MetadataRoute.Manifest {
  return {
    id: '/',
    name: 'Shipyard — GenLayer Intelligent Contract Deployment',
    short_name: 'Shipyard',
    description:
      'Deploy and manage GenLayer Intelligent Contracts directly from your browser.',
    start_url: '/',
    scope: '/',
    display: 'standalone',
    background_color: '#080b09',
    theme_color: '#080b09',
    lang: 'en',
    categories: ['developer', 'productivity', 'utilities'],
    icons: [
      {
        src: '/icon.svg',
        sizes: 'any',
        type: 'image/svg+xml',
        purpose: 'any',
      },
    ],
  }
}
