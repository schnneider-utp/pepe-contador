'use client'

import React, { createContext, useContext, useEffect, useState } from "react"

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
  const [state, setState] = useState({ width: 0, height: 0, scale: 1 })

  useEffect(() => {
    function update() {
      const w = window.innerWidth
      const h = window.innerHeight
      const s = Math.min(w / designWidth, h / designHeight) || 1
      setState({ width: w, height: h, scale: s })
    }

    update()
    window.addEventListener("resize", update)
    window.addEventListener("orientationchange", update)
    return () => {
      window.removeEventListener("resize", update)
      window.removeEventListener("orientationchange", update)
    }
  }, [designWidth, designHeight])

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
      <div
        style={{
          position: "fixed",
          inset: 0,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          overflow: "hidden",
          // ensure this container doesn't create scrollbars
        }}
      >
        <div
          style={{
            width: designWidth,
            height: designHeight,
            transform: `scale(${state.scale})`,
            transformOrigin: "center",
            // prevent inner overflow from affecting outer page
          }}
        >
          {children}
        </div>
      </div>
    </ViewportContext.Provider>
  )
}

export function useViewport() {
  const ctx = useContext(ViewportContext)
  if (!ctx) throw new Error("useViewport must be used inside ViewportProvider")
  return ctx
}