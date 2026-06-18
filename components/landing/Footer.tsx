import Link from 'next/link'
import { Anchor } from 'lucide-react'

export default function Footer() {
  const year = new Date().getFullYear()

  return (
    <footer className="border-t border-white/[0.06] py-10">
      <div className="flex flex-col items-center gap-6 sm:flex-row sm:justify-between">
        {/* Brand */}
        <Link href="/" className="flex items-center gap-2 transition-colors hover:opacity-80">
          <Anchor size={16} className="text-emerald-400" />
          <span className="font-mono text-sm font-semibold text-white">
            Ship<span className="text-emerald-400">yard</span>
          </span>
        </Link>

        {/* Links */}
        <nav className="flex flex-wrap items-center justify-center gap-x-5 gap-y-2 font-mono text-xs text-neutral-500">
          <Link href="/terms" className="transition-colors hover:text-neutral-300">
            Terms
          </Link>
          <Link href="/privacy" className="transition-colors hover:text-neutral-300">
            Privacy
          </Link>
          <a
            href="https://docs.genlayer.com"
            target="_blank"
            rel="noopener noreferrer"
            className="transition-colors hover:text-neutral-300"
          >
            Docs
          </a>
          <a
            href="https://github.com/luch91/shipyard"
            target="_blank"
            rel="noopener noreferrer"
            className="transition-colors hover:text-neutral-300"
          >
            GitHub
          </a>
        </nav>
      </div>

      <p className="mt-6 text-center font-mono text-[11px] text-neutral-600">
        © {year} Shipyard · MIT License · Built on GenLayer
      </p>
    </footer>
  )
}
