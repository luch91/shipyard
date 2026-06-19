'use client'

import { useCallback, useEffect, useState } from 'react'
import { NEW_SEEN_PREFIX } from '@/components/layout/navItems'

// Tracks which "New" nav badges the user has already seen (persisted in
// localStorage). A badge shows until the user clicks that route, then never
// again. Shared by Sidebar and BottomNav so behavior stays identical.
export function useNavNew() {
  const [seen, setSeen] = useState<Record<string, boolean>>({})

  useEffect(() => {
    // Hydrate from localStorage on mount (client-only, avoids SSR mismatch).
    const next: Record<string, boolean> = {}
    try {
      for (let i = 0; i < localStorage.length; i++) {
        const key = localStorage.key(i)
        if (key?.startsWith(NEW_SEEN_PREFIX)) next[key.slice(NEW_SEEN_PREFIX.length)] = true
      }
    } catch {
      /* localStorage unavailable — treat all as unseen */
    }
    setSeen(next)
  }, [])

  // Show "New" only after hydration (server + first render show nothing, so SSR
  // and client agree), for items flagged isNew and not yet seen.
  const showNew = useCallback(
    (href: string, isNew: boolean) => isNew && !seen[href],
    [seen]
  )

  const markSeen = useCallback((href: string) => {
    setSeen((prev) => (prev[href] ? prev : { ...prev, [href]: true }))
    try {
      localStorage.setItem(`${NEW_SEEN_PREFIX}${href}`, '1')
    } catch {
      /* non-fatal */
    }
  }, [])

  return { showNew, markSeen }
}
