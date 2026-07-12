'use client'

import { usePathname, useRouter } from 'next/navigation'
import { ChevronLeft } from 'lucide-react'
import Logo from './Logo'

// Mobile-only top bar (below `lg`) for app pages. The landing page has its own
// Header and desktop uses the Sidebar, so this only fills the gap on mobile —
// most importantly it gives a back button on deep pages like /interact/[address]
// that aren't in the BottomNav.
export default function MobileTopBar() {
  const pathname = usePathname()
  const router   = useRouter()

  // Landing has its own Header. The admin control room is intentionally
  // standalone on mobile as well as desktop.
  if (pathname === '/' || pathname.startsWith('/admin')) return null

  const goBack = () => {
    // Fall back to the app home when there's no in-app history to pop
    // (e.g. the page was opened directly from an external link).
    if (typeof window !== 'undefined' && window.history.length > 1) router.back()
    else router.push('/deploy')
  }

  return (
    <header
      className="sticky top-0 z-40 flex h-12 items-center gap-2 border-b border-white/[0.06]
                 bg-neutral-950/90 px-3 backdrop-blur-sm lg:hidden"
    >
      <button
        type="button"
        onClick={goBack}
        aria-label="Go back"
        className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg text-neutral-400
                   transition-colors hover:bg-white/[0.04] hover:text-neutral-100"
      >
        <ChevronLeft size={18} />
      </button>
      <Logo showMark={false} className="text-base" />
    </header>
  )
}
