'use client'
import * as React from 'react'

const MOBILE_BREAKPOINT = 768

export function useIsMobile(): boolean | undefined {
  const [isMobile, setIsMobile] = React.useState<boolean | undefined>(undefined)

  React.useEffect(() => {
    if (typeof window === 'undefined') return

    const update = () => setIsMobile(window.innerWidth < MOBILE_BREAKPOINT)

    const mql = window.matchMedia(`(max-width: ${MOBILE_BREAKPOINT - 1}px)`)

    // inicial
    update()

    // add listener (compat)
    if (typeof mql.addEventListener === 'function') {
      mql.addEventListener('change', update)
    } else {
      // @ts-ignore older browsers
      mql.addListener(update)
    }

    // también reaccionar a resize por seguridad (cambios manuales tamaño)
    window.addEventListener('resize', update)

    return () => {
      if (typeof mql.removeEventListener === 'function') {
        mql.removeEventListener('change', update)
      } else {
        // @ts-ignore
        mql.removeListener(update)
      }
      window.removeEventListener('resize', update)
    }
  }, [])

  return isMobile
}
