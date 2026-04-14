import type { Metadata } from 'next'
import { Toaster } from 'react-hot-toast'
import Header from '@/components/layout/Header'
import Sidebar from '@/components/layout/Sidebar'
import './globals.css'

export const metadata: Metadata = {
  title: 'Shipyard — Deploy Intelligent Contracts',
  description:
    'Browser-based deployment platform for GenLayer Intelligent Contracts. Deploy to Bradbury, Asimov, Studionet, or Localnet in under 60 seconds.',
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className="dark">
      <body className="min-h-screen bg-neutral-950 font-sans antialiased">
        <Header />
        <div className="flex" style={{ minHeight: 'calc(100vh - 56px)' }}>
          <Sidebar />
          <main className="min-w-0 flex-1">{children}</main>
        </div>

        {/* GenLayer logo — fixed bottom-right */}
        <a
          href="https://genlayer.com"
          target="_blank"
          rel="noopener noreferrer"
          aria-label="Powered by GenLayer"
          className="fixed bottom-4 right-4 z-50 flex items-center gap-2 rounded-full border border-neutral-800 bg-neutral-950/90 py-1.5 pl-1.5 pr-3 shadow-lg backdrop-blur-sm transition-all hover:border-neutral-600 hover:shadow-emerald-500/10"
        >
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src="https://pbs.twimg.com/profile_images/2011221321754034176/AaBmFyfD_400x400.jpg"
            alt="GenLayer"
            width={22}
            height={22}
            className="rounded-full"
          />
          <span className="font-mono text-[11px] text-neutral-500">
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
      </body>
    </html>
  )
}
