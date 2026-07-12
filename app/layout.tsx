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
