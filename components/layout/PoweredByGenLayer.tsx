'use client'

import { usePathname } from 'next/navigation'

export default function PoweredByGenLayer() {
  const pathname = usePathname()

  if (pathname.startsWith('/admin')) return null

  return (
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
        className="rounded-full invert"
      />
      {/* Label hidden on mobile so the badge stays compact and avoids content. */}
      <span className="hidden font-mono text-[11px] text-neutral-500 sm:inline">
        Powered by <span className="text-neutral-300">GenLayer</span>
      </span>
    </a>
  )
}
