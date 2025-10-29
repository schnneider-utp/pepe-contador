import type React from "react"
import type { Metadata } from "next"
import { GeistSans } from "geist/font/sans"
import { GeistMono } from "geist/font/mono"
import { Analytics } from "@vercel/analytics/next"
import { Toaster } from "@/components/ui/toaster"
import { ThemeProvider } from "@/components/theme-provider"
import { ThemeToggle } from "@/components/theme-toggle"
import { Suspense } from "react"
import "./globals.css"
import { ViewportProvider } from "@/components/viewport-provider"
import { SafeAreaProvider } from "@/components/safe-area-provider"

export const metadata: Metadata = {
  title: "Sistema de Gestión - Archivos y Contabilidad",
  description: "Sube archivos a Google Drive y activa procesos contables",
  generator: "v0.app",
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="es" suppressHydrationWarning>
      <body className={`font-sans ${GeistSans.variable} ${GeistMono.variable} antialiased`}>
        <ThemeProvider defaultTheme="system" storageKey="theme-preference">
          <SafeAreaProvider>
            <ViewportProvider designWidth={1440} designHeight={900}>
              <Suspense fallback={null}>
                {children}
                <ThemeToggle />
                <Toaster />
              </Suspense>
            </ViewportProvider>
          </SafeAreaProvider>
          <Analytics />
        </ThemeProvider>
      </body>
    </html>
  )
}
