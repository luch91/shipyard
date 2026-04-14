import type { Metadata } from 'next'
import { Toaster } from 'react-hot-toast'
import Header from '@/components/layout/Header'
import Sidebar from '@/components/layout/Sidebar'
import './globals.css'

export const metadata: Metadata = {
  title: 'GenDeploy — Deploy Intelligent Contracts',
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
        <Toaster
          position="bottom-right"
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
