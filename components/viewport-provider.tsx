'use client'

import React, { createContext, useContext, useEffect, useState } from "react"
import { useIsMobile } from '@/hooks/use-mobile'

type ViewportState = {
  width: number
  height: number
  scale: number
  designWidth: number
  designHeight: number
}

const ViewportContext = createContext<ViewportState | undefined>(undefined)

export function ViewportProvider({
  children,
  designWidth = 1440,
  designHeight = 900,
}: {
  children: React.ReactNode
  designWidth?: number
  designHeight?: number
}) {
  const isMobile = useIsMobile()
  const [state, setState] = useState({ width: 0, height: 0, scale: 1 })

  useEffect(() => {
    function update() {
      const w = window.innerWidth
      const h = window.innerHeight
      // Only apply scaling on non-mobile. Treat undefined (SSR/hydration) as "mobile" mode
      const shouldScale = isMobile === false
      const s = shouldScale ? (Math.min(w / designWidth, h / designHeight) || 1) : 1
      setState({ width: w, height: h, scale: s })
    }

    update()
    window.addEventListener("resize", update)
    window.addEventListener("orientationchange", update)
    return () => {
      window.removeEventListener("resize", update)
      window.removeEventListener("orientationchange", update)
    }
  }, [designWidth, designHeight, isMobile])

  return (
    <ViewportContext.Provider
      value={{
        width: state.width,
        height: state.height,
        scale: state.scale,
        designWidth,
        designHeight,
      }}
    >
      { /* On desktop (isMobile === false) keep the fixed centered scaled canvas.
           On mobile or while undetermined, render children responsively (no scale). */ }
      {isMobile === false ? (
        <div
          style={{
            position: "fixed",
            inset: 0,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            overflow: "hidden",
          }}
        >
          <div
            style={{
              width: designWidth,
              height: designHeight,
              transform: `scale(${state.scale})`,
              transformOrigin: "center",
            }}
          >
            {children}
          </div>
        </div>
      ) : (
        <div
          style={{
            width: '100%',
            minHeight: '100%',
            boxSizing: 'border-box',
          }}
        >
          {children}
        </div>
      )}
    </ViewportContext.Provider>
  )
}

export function useViewport() {
  const ctx = useContext(ViewportContext)
  if (!ctx) throw new Error("useViewport must be used inside ViewportProvider")
  return ctx
}