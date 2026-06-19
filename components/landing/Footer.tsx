import Link from 'next/link'
import Logo from '@/components/layout/Logo'

export default function Footer() {
  const year = new Date().getFullYear()

  return (
    <footer className="border-t border-white/[0.06] py-10">
      {/* Top row: brand left, links right — single baseline */}
      <div className="flex flex-col items-center gap-5 sm:flex-row sm:justify-between sm:gap-4">
        {/* Brand */}
        <Logo className="text-lg" />

        {/* Links */}
        <nav className="flex flex-wrap items-center justify-center gap-x-6 gap-y-2 font-mono text-xs text-neutral-500">
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

      {/* Divider + copyright bar */}
      <div className="mt-6 border-t border-white/[0.06] pt-5">
        <p className="text-center font-mono text-[11px] text-neutral-600 sm:text-left">
          © {year} Shipyard · MIT License · Built on GenLayer
        </p>
      </div>
    </footer>
  )
}
