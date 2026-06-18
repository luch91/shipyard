'use client'

import { usePathname, useSearchParams } from 'next/navigation'
import { useEffect } from 'react'
import { track } from '@/lib/analytics'

// Fires a first-party page_viewed event on each client navigation.
export function AnalyticsPageView() {
  const pathname = usePathname()
  const searchParams = useSearchParams()

  useEffect(() => {
    if (!pathname) return
    const search = searchParams.toString()
    track('page_viewed', { path: search ? `${pathname}?${search}` : pathname })
  }, [pathname, searchParams])

  return null
}
