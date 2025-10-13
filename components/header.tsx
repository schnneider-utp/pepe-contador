import { Cloud, FileText } from "lucide-react"

export function Header() {
  return (
    <header className="border-b border-border bg-card">
      <div className="container mx-auto px-4 py-4">
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2 bg-primary text-primary-foreground px-4 py-2 rounded-lg">
            <Cloud className="h-6 w-6" />
            <FileText className="h-6 w-6" />
          </div>
          <div>
            <h2 className="text-xl font-bold text-foreground">Sistema de Gestión</h2>
            <p className="text-sm text-muted-foreground">Archivos y Contabilidad</p>
          </div>
        </div>
      </div>
    </header>
  )
}
