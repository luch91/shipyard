'use client'

import { useEffect, useState } from 'react'

/**
 * Returns true when the viewport is below `breakpointPx` (default 768px = Tailwind's
 * `md`). Returns false on the server and on the first client render so the markup
 * matches SSR, then updates after mount — avoiding hydration mismatches.
 */
export function useIsMobile(breakpointPx = 768): boolean {
  const [isMobile, setIsMobile] = useState(false)

  useEffect(() => {
    const mq = window.matchMedia(`(max-width: ${breakpointPx - 1}px)`)
    const update = () => setIsMobile(mq.matches)
    update()
    mq.addEventListener('change', update)
    return () => mq.removeEventListener('change', update)
  }, [breakpointPx])

  return isMobile
}
