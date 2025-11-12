import { Header } from "@/components/header"
import { ChatPanel } from "@/components/chat"
import { AppTabsController } from "@/components/app-tabs-controller"

export default function HomePage() {
  return (
    <div className="min-h-screen bg-background flex flex-col">
      <Header />

      <main className="flex-1 container mx-auto px-4 py-6 md:py-8 overflow-hidden">
        <div className="mb-6 text-center">
          <h1 className="text-4xl md:text-5xl font-bold text-foreground mb-3 text-balance">
            Gestión de Archivos y Procesos
          </h1>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto text-pretty">
            Sube tus archivos a Google Drive organizados por fecha y activa procesos contables con un solo clic
          </p>
        </div>

        <div className="grid lg:grid-cols-[380px_1fr] gap-6 max-w-7xl mx-auto h-full">
          <aside className="hidden lg:block h-full">
            <ChatPanel />
          </aside>

          <section className="h-full flex flex-col overflow-hidden">
            <AppTabsController />
          </section>
        </div>
      </main>
    </div>
  )
}
