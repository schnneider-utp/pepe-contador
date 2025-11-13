import { Header } from "@/components/header"
import { ChatPanel } from "@/components/chat"
import { AppTabsController } from "@/components/app-tabs-controller"
import { UserRagUploader } from "@/components/user-rag-uploader"
import { ThemeToggle } from "@/components/theme-toggle"

export default function HomePage() {
  return (
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

        <div className="grid lg:grid-cols-[400px_1fr] xl:grid-cols-[500px_1fr] gap-6 max-w-7xl mx-auto h-full min-h-0">
          <aside className="hidden lg:block h-full">
            <ChatPanel />
          </aside>

          <section className="h-full flex flex-col overflow-x-hidden overflow-y-auto min-h-0">
            <AppTabsController />
          </section>
        </div>
      </main>
    </div>
  )
}
