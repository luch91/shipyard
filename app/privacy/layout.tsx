import Link from 'next/link'
import Logo from '@/components/layout/Logo'

export default function LegalLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-neutral-950">
      <header className="border-b border-white/[0.08] bg-[#080b09]/95">
        <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6">
          <Logo className="text-lg" />
          <nav className="flex items-center gap-5 text-sm font-medium">
            <Link href="/terms" className="text-neutral-200 transition-colors hover:text-emerald-300">
              Terms
            </Link>
            <Link href="/privacy" className="text-neutral-400 transition-colors hover:text-emerald-300">
              Privacy
            </Link>
            <Link
              href="/deploy"
              className="hidden min-h-10 items-center rounded-md bg-emerald-400 px-4 text-[#07100b] transition-colors hover:bg-emerald-300 sm:inline-flex"
            >
              Start Deploying →
            </Link>
          </nav>
        </div>
      </header>

      {children}

      <footer className="border-t border-white/[0.08] bg-[#080b09]">
        <div className="mx-auto flex max-w-7xl flex-col gap-3 px-4 py-8 text-sm text-neutral-500 sm:flex-row sm:items-center sm:justify-between sm:px-6">
          <p>Shipyard tools for building with GenLayer.</p>
          <div className="flex gap-5">
            <Link href="/terms" className="transition-colors hover:text-neutral-200">Terms</Link>
            <Link href="/privacy" className="transition-colors hover:text-neutral-200">Privacy</Link>
            <Link href="/" className="transition-colors hover:text-neutral-200">Shipyard home</Link>
          </div>
        </div>
      </footer>
    </div>
  )
}