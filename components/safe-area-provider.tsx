'use client'

import React, { createContext, useContext, useEffect, useState } from 'react'
import { useIsMobile } from '@/hooks/use-mobile'

type SafeAreaInsets = {
  top: number
  right: number
  bottom: number
  left: number
}

const SafeAreaContext = createContext<SafeAreaInsets | undefined>(undefined)

function parsePx(value: string | null) {
  if (!value) return 0
  const n = parseFloat(value.replace('px', '').trim())
  return Number.isFinite(n) ? n : 0
}

export function SafeAreaProvider({
  children,
}: {
  children: React.ReactNode
}) {
  const isMobile = useIsMobile()
  const [insets, setInsets] = useState<SafeAreaInsets>({
    top: 0,
    right: 0,
    bottom: 0,
    left: 0,
  })

  function readCssVars() {
    if (typeof window === 'undefined') return
    const cs = getComputedStyle(document.documentElement)
    const top = parsePx(cs.getPropertyValue('--safe-top'))
    const right = parsePx(cs.getPropertyValue('--safe-right'))
    const bottom = parsePx(cs.getPropertyValue('--safe-bottom'))
    const left = parsePx(cs.getPropertyValue('--safe-left'))
    setInsets({ top, right, bottom, left })
  }

  // set CSS var --app-height to avoid 100vh shrink on mobile browsers
  useEffect(() => {
    if (typeof document === 'undefined') return

    const setAppHeight = () => {
      const vh = (window.visualViewport && window.visualViewport.height) ? window.visualViewport.height : window.innerHeight
      document.documentElement.style.setProperty('--app-height', `${Math.round(vh)}px`)
    }

    setAppHeight()
    window.addEventListener('resize', setAppHeight)
    // visualViewport better reflects keyboard / URL bar changes
    // @ts-ignore
    if (window.visualViewport && window.visualViewport.addEventListener) {
      // @ts-ignore
      window.visualViewport.addEventListener('resize', setAppHeight)
    }
    return () => {
      window.removeEventListener('resize', setAppHeight)
      // @ts-ignore
      if (window.visualViewport && window.visualViewport.removeEventListener) {
        // @ts-ignore
        window.visualViewport.removeEventListener('resize', setAppHeight)
      }
    }
  }, [])

  useEffect(() => {
    // read safe-area CSS var values into context
    readCssVars()
    // update on resize / visualViewport as well
    const onResize = () => readCssVars()
    window.addEventListener('resize', onResize)
    // @ts-ignore
    if (window.visualViewport && window.visualViewport.addEventListener) {
      // @ts-ignore
      window.visualViewport.addEventListener('resize', onResize)
    }
    return () => {
      window.removeEventListener('resize', onResize)
      // @ts-ignore
      if (window.visualViewport && window.visualViewport.removeEventListener) {
        // @ts-ignore
        window.visualViewport.removeEventListener('resize', onResize)
      }
    }
  }, [])

  // wrapper applies safe-area padding and uses the computed --app-height
  // On mobile allow vertical scrolling so content can occupy required space.
  // If isMobile is undefined (during SSR/hydration) default to allowing scroll
  const wrapperStyle: React.CSSProperties = {
    paddingTop: 'env(safe-area-inset-top)',
    paddingRight: 'env(safe-area-inset-right)',
    paddingBottom: 'env(safe-area-inset-bottom)',
    paddingLeft: 'env(safe-area-inset-left)',
    height: 'var(--app-height, 100vh)',
    minHeight: 'var(--app-height, 100vh)',
    boxSizing: 'border-box',
    overflowY: isMobile === false ? 'hidden' : 'auto',
    WebkitOverflowScrolling: 'touch',
  }

  return (
    <SafeAreaContext.Provider value={insets}>
      <div style={wrapperStyle}>
        {children}
      </div>
    </SafeAreaContext.Provider>
  )
}

export function useSafeArea() {
  const ctx = useContext(SafeAreaContext)
  if (!ctx) {
    return { top: 0, right: 0, bottom: 0, left: 0 }
  }
  return ctx
}