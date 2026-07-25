import type { Metadata } from 'next'
import { Suspense } from 'react'
import { headers } from 'next/headers'
import { Toaster } from 'react-hot-toast'
import Header from '@/components/layout/Header'
import MobileTopBar from '@/components/layout/MobileTopBar'
import Sidebar from '@/components/layout/Sidebar'
import BottomNav from '@/components/layout/BottomNav'
import AppMain from '@/components/layout/AppMain'
import PoweredByGenLayer from '@/components/layout/PoweredByGenLayer'
import { AnalyticsPageView } from '@/components/providers/AnalyticsPageView'
import { SidebarProvider } from '@/components/providers/SidebarContext'
import { Web3Provider } from '@/components/providers/Web3Provider'
import { SiweAuthProvider } from '@/components/providers/SiweAuthProvider'
import {
  absoluteUrl,
  DEFAULT_DESCRIPTION,
  DEFAULT_TITLE,
  SITE_NAME,
  SITE_URL,
  SOCIAL_IMAGE_PATH,
} from '@/lib/metadata/site'
import '@rainbow-me/rainbowkit/styles.css'
import './globals.css'

const jsonLd = {
  '@context': 'https://schema.org',
  '@graph': [
    {
      '@type': 'Organization',
      '@id': `${SITE_URL}/#organization`,
      name: SITE_NAME,
      url: SITE_URL,
      logo: absoluteUrl('/icon.svg'),
      sameAs: ['https://github.com/luch91/shipyard'],
      description: 'Browser-based deployment and management platform for GenLayer Intelligent Contracts',
    },
    {
      '@type': 'WebSite',
      '@id': `${SITE_URL}/#website`,
      url: SITE_URL,
      name: SITE_NAME,
      description: DEFAULT_DESCRIPTION,
      publisher: { '@id': `${SITE_URL}/#organization` },
      inLanguage: 'en',
    },
    {
      '@type': 'WebApplication',
      '@id': `${SITE_URL}/#webapplication`,
      name: 'Shipyard',
      url: SITE_URL,
      description:
        'No-CLI deployment platform for GenLayer Intelligent Contracts. Deploy to Bradbury, Asimov, Studionet, or Localnet directly from the browser, with Clarke coming soon.',
      applicationCategory: 'DeveloperApplication',
      operatingSystem: 'Any',
      browserRequirements: 'Requires a modern browser; wallet features require a compatible browser wallet.',
      isPartOf: { '@id': `${SITE_URL}/#website` },
      publisher: { '@id': `${SITE_URL}/#organization` },
      offers: { '@type': 'Offer', price: '0', priceCurrency: 'USD' },
      featureList: [
        'Browser-based Intelligent Contract deployment',
        'No CLI required for hosted networks',
        'Contract template library',
        'Multi-network support (Bradbury, Asimov, Studionet, Localnet, with Clarke coming soon)',
        'Network comparison deployment',
        'On-chain contract registry',
        'Contract interaction interface',
        'Real-time deployment logs',
      ],
    },
  ],
}

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  applicationName: SITE_NAME,
  title: {
    default: DEFAULT_TITLE,
    template: '%s — Shipyard',
  },
  description: DEFAULT_DESCRIPTION,
  keywords: ['GenLayer', 'Intelligent Contracts', 'smart contract deployment', 'Web3', 'Python smart contracts', 'testnet deployment'],
  authors: [{ name: 'Shipyard contributors', url: 'https://github.com/luch91/shipyard/graphs/contributors' }],
  creator: 'Shipyard contributors',
  publisher: SITE_NAME,
  category: 'Developer tools',
  referrer: 'strict-origin-when-cross-origin',
  formatDetection: {
    telephone: false,
    address: false,
    email: false,
  },
  manifest: '/manifest.webmanifest',
  icons: {
    icon: [{ url: '/icon.svg', type: 'image/svg+xml' }],
    shortcut: ['/icon.svg'],
  },
  alternates: {
    types: {
      'application/rss+xml': absoluteUrl('/feed.xml'),
    },
  },
  robots: {
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
  verification: process.env.GOOGLE_SITE_VERIFICATION
    ? { google: process.env.GOOGLE_SITE_VERIFICATION }
    : undefined,
  openGraph: {
    title: DEFAULT_TITLE,
    description: DEFAULT_DESCRIPTION,
    url: SITE_URL,
    type: 'website',
    siteName: SITE_NAME,
    locale: 'en_US',
    images: [
      {
        url: absoluteUrl(SOCIAL_IMAGE_PATH),
        width: 1200,
        height: 630,
        alt: 'Shipyard — GenLayer Intelligent Contract deployment',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: DEFAULT_TITLE,
    description: DEFAULT_DESCRIPTION,
    images: [absoluteUrl(SOCIAL_IMAGE_PATH)],
  },
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  const cookie = headers().get('cookie')

  return (
    <html lang="en" className="dark">
      <body className="min-h-screen bg-neutral-950 font-sans antialiased">
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
        />
        <Web3Provider cookie={cookie}>
        <SiweAuthProvider>
        <SidebarProvider>
        <Suspense><AnalyticsPageView /></Suspense>
        <Header />
        <MobileTopBar />
        <div className="flex min-h-screen">
          <Sidebar />
          {/* Mobile padding clears BottomNav; the standalone admin shell omits both. */}
          <AppMain>{children}</AppMain>
        </div>

        {/* Mobile bottom navigation — hidden on lg where the Sidebar is shown */}
        <BottomNav />

        <PoweredByGenLayer />

        <Toaster
          position="bottom-center"
          toastOptions={{
            style: {
              background: '#171717',
              color: '#e5e5e5',
              border: '1px solid #262626',
              fontFamily: 'Syne, sans-serif',
              fontSize: '13px',
            },
            success: {
              iconTheme: { primary: '#34d399', secondary: '#171717' },
            },
            error: {
              iconTheme: { primary: '#f87171', secondary: '#171717' },
            },
          }}
        />
        </SidebarProvider>
        </SiweAuthProvider>
        </Web3Provider>
      </body>
    </html>
  )
}
