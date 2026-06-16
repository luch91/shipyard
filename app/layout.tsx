import type { Metadata } from 'next'
import { Suspense } from 'react'
import { headers } from 'next/headers'
import { Toaster } from 'react-hot-toast'
import Header from '@/components/layout/Header'
import Sidebar from '@/components/layout/Sidebar'
import BottomNav from '@/components/layout/BottomNav'
import { PostHogProvider } from '@/components/providers/PostHogProvider'
import { PostHogPageView } from '@/components/providers/PostHogPageView'
import { SidebarProvider } from '@/components/providers/SidebarContext'
import { Web3Provider } from '@/components/providers/Web3Provider'
import '@rainbow-me/rainbowkit/styles.css'
import './globals.css'

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL ?? 'https://genshipyard.com'

const jsonLd = {
  '@context': 'https://schema.org',
  '@graph': [
    {
      '@type': 'Organization',
      name: 'Shipyard',
      url: SITE_URL,
      description: 'Browser-based deployment and management platform for GenLayer Intelligent Contracts',
    },
    {
      '@type': 'WebApplication',
      name: 'Shipyard',
      url: SITE_URL,
      description:
        'No-CLI deployment platform for GenLayer Intelligent Contracts. Upload Python-based smart contracts, configure parameters, and deploy to Bradbury, Asimov, Studionet, or Localnet testnets directly from the browser.',
      applicationCategory: 'DeveloperApplication',
      operatingSystem: 'Any',
      offers: { '@type': 'Offer', price: '0', priceCurrency: 'USD' },
      featureList: [
        'Browser-based Intelligent Contract deployment',
        'No CLI or local environment required',
        'Contract template library',
        'Multi-network support (Bradbury, Asimov, Studionet, Localnet)',
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
  title: {
    default: 'Shipyard — Deploy Intelligent Contracts on GenLayer',
    template: '%s — Shipyard',
  },
  description:
    'Browser-based deployment platform for GenLayer Intelligent Contracts. Deploy Python smart contracts to Bradbury, Asimov, Studionet, or Localnet testnets in under 60 seconds — no CLI required.',
  keywords: ['GenLayer', 'Intelligent Contracts', 'smart contract deployment', 'Web3', 'Python smart contracts', 'testnet deployment'],
  openGraph: {
    title: 'Shipyard — Deploy Intelligent Contracts on GenLayer',
    description: 'Deploy Python-based GenLayer Intelligent Contracts from your browser. No CLI, no local tooling required.',
    type: 'website',
    siteName: 'Shipyard',
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
        <PostHogProvider>
        <SidebarProvider>
        <Suspense><PostHogPageView /></Suspense>
        <Header />
        <div className="flex min-h-screen">
          <Sidebar />
          {/* pb on mobile clears the fixed BottomNav so content isn't hidden behind it */}
          <main className="min-w-0 flex-1 pb-16 lg:pb-0">{children}</main>
        </div>

        {/* Mobile bottom navigation — hidden on lg where the Sidebar is shown */}
        <BottomNav />

        {/* GenLayer logo — fixed bottom-right */}
        <a
          href="https://genlayer.com"
          target="_blank"
          rel="noopener noreferrer"
          aria-label="Powered by GenLayer"
          className="fixed bottom-[4.5rem] right-4 z-50 flex items-center gap-2 rounded-full border border-neutral-800 bg-neutral-950/90 py-1.5 pl-1.5 pr-1.5 shadow-lg backdrop-blur-sm transition-all hover:border-neutral-600 hover:shadow-emerald-500/10 sm:pr-3 lg:bottom-4"
        >
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src="https://pbs.twimg.com/profile_images/2011221321754034176/AaBmFyfD_400x400.jpg"
            alt="GenLayer"
            width={22}
            height={22}
            className="rounded-full"
          />
          {/* Label hidden on mobile so the badge stays a compact icon and doesn't overlap content */}
          <span className="hidden font-mono text-[11px] text-neutral-500 sm:inline">
            Powered by <span className="text-neutral-300">GenLayer</span>
          </span>
        </a>

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
        </PostHogProvider>
        </Web3Provider>
      </body>
    </html>
  )
}
