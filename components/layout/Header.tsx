'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { ExternalLink } from 'lucide-react'
import GithubIcon from '@/components/ui/GithubIcon'
import { ConnectButton } from '@rainbow-me/rainbowkit'
import Logo from './Logo'

export default function Header() {
  const pathname = usePathname()

  // Header only renders on the landing page.
  // All app pages use the sidebar for navigation instead.
  if (pathname !== '/') return null

  return (
    <header className="sticky top-0 z-50 border-b border-white/[0.07] bg-[#080b09]/95 backdrop-blur-md">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6">
        {/* Logo */}
        <Logo className="text-lg" />

        {/* Landing nav */}
        <nav className="flex items-center gap-4">
          {/* Docs + GitHub hidden on small screens — CTA is the priority */}
          <a
            href="https://docs.genlayer.com"
            target="_blank"
            rel="noopener noreferrer"
            className="hidden items-center gap-1 text-sm font-medium text-neutral-400 transition-colors hover:text-white sm:flex"
            aria-label="Open GenLayer docs in new tab"
          >
            Docs
            <ExternalLink size={12} />
          </a>
          <a
            href="https://github.com/genlayerlabs"
            target="_blank"
            rel="noopener noreferrer"
            className="hidden items-center gap-1 text-sm font-medium text-neutral-400 transition-colors hover:text-white sm:flex"
            aria-label="Shipyard on GitHub"
          >
            <GithubIcon size={15} />
            GitHub
          </a>
          <ConnectButton chainStatus="none" />
          <Link
            href="/deploy"
            className="hidden min-h-10 items-center rounded-md bg-emerald-400 px-4 text-sm font-semibold text-[#07100b] transition-colors hover:bg-emerald-300 sm:flex"
          >
            Start Deploying →
          </Link>
        </nav>
      </div>
    </header>
  )
}
