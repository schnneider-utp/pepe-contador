"use client"
import React, { useEffect, useRef, useState } from "react"
import { Header } from "@/components/header"
import { ChatPanel } from "@/components/chat"
import { AppTabsController } from "@/components/app-tabs-controller"
import { UserRagUploader } from "@/components/user-rag-uploader"
import { ThemeToggle } from "@/components/theme-toggle"
import { TemporaryContextProvider } from "@/contexts/temporary-context"

export default function HomePage() {
  const containerRef = useRef<HTMLDivElement | null>(null)
  const [chatW, setChatW] = useState<number>(400)

  useEffect(() => {
    const xl = window.matchMedia("(min-width: 1280px)").matches
    setChatW(xl ? 400 : 300)
  }, [])

  const onResizeMouseDown = (e: React.MouseEvent<HTMLDivElement>) => {
    e.preventDefault()
    const rect = containerRef.current?.getBoundingClientRect()
    if (!rect) return
    const MIN = 280
    const MAX = 720
    const move = (ev: MouseEvent) => {
      const x = ev.clientX - rect.left
      const w = Math.max(MIN, Math.min(MAX, x))
      setChatW(w)
    }
    const up = () => {
      window.removeEventListener("mousemove", move)
      window.removeEventListener("mouseup", up)
    }
    window.addEventListener("mousemove", move)
    window.addEventListener("mouseup", up)
  }
  return (
    <TemporaryContextProvider>
      <div className="min-h-screen bg-background flex flex-col">
        <Header />
        <UserRagUploader />
        <ThemeToggle />

        <main className="flex-1 container mx-auto px-4 py-6 md:py-8 overflow-x-hidden overflow-y-auto min-h-0">
          <div className="mb-6 text-center">
            <h1 className="text-4xl md:text-5xl font-bold text-foreground mb-3 text-balance">
              Gestión de Archivos y Procesos
            </h1>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto text-pretty">
              Sube tus archivos a Google Drive organizados por fecha y activa procesos contables con un solo clic
            </p>
          </div>

          <div ref={containerRef} style={{ ["--chat-w" as any]: `${chatW}px` }} className="grid lg:grid-cols-[var(--chat-w)_4px_1fr] xl:grid-cols-[var(--chat-w)_4px_1fr] gap-6 max-w-7xl mx-auto h-full min-h-0">
            <aside className="hidden lg:block h-full">
              <ChatPanel />
            </aside>
            <div onMouseDown={onResizeMouseDown} className="hidden lg:block w-1 bg-border rounded-sm cursor-col-resize" />
            <section className="h-full flex flex-col overflow-x-hidden overflow-y-auto min-h-0">
              <AppTabsController />
            </section>
          </div>
        </main>
      </div>
    </TemporaryContextProvider>
  )
}
