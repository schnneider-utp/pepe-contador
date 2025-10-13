import { FileUploadSection } from "@/components/file-upload-section"
import { AccountingTriggerSection } from "@/components/accounting-trigger-section"
import { Header } from "@/components/header"

export default function HomePage() {
  return (
    <div className="min-h-screen bg-background">
      <Header />

      <main className="container mx-auto px-4 py-8 md:py-12">
        <div className="mb-8 text-center">
          <h1 className="text-4xl md:text-5xl font-bold text-foreground mb-4 text-balance">
            Gestión de Archivos y Procesos
          </h1>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto text-pretty">
            Sube tus archivos a Google Drive organizados por fecha y activa procesos contables con un solo clic
          </p>
        </div>

        <div className="grid lg:grid-cols-2 gap-8 max-w-7xl mx-auto">
          <FileUploadSection />
          <AccountingTriggerSection />
        </div>
      </main>
    </div>
  )
}
