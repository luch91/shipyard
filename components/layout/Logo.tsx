import Link from 'next/link'
import clsx from 'clsx'

// Single source of truth for the Shipyard brand lockup so the Header, Sidebar,
// and Footer can never drift apart. `showMark` toggles the icon.svg badge — the
// Sidebar uses the wordmark only.
export default function Logo({
  showMark = true,
  className,
}: {
  showMark?: boolean
  className?: string
}) {
  return (
    <Link
      href="/"
      className={clsx(
        'flex items-center gap-2 text-white transition-opacity hover:opacity-80',
        className
      )}
    >
      {showMark && (
        <div className="relative h-9 w-9 shrink-0">
          <div className="absolute inset-0 rounded-full bg-emerald-400/20 blur-lg" />
          <div className="relative flex h-9 w-9 items-center justify-center rounded-xl border border-white/[0.08] bg-gradient-to-br from-white/[0.04] to-emerald-400/[0.04] backdrop-blur-xl">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src="/icon.svg" alt="Shipyard" width={18} height={18} className="logo-pulse" />
          </div>
        </div>
      )}
      <span className="font-[Syne] font-bold">
        Ship<span className="text-emerald-400">yard</span>
      </span>
    </Link>
  )
}
