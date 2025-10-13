"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Calculator, Play, CheckCircle2, AlertCircle } from "lucide-react"
import { useToast } from "@/hooks/use-toast"

export function AccountingTriggerSection() {
  const [triggering, setTriggering] = useState(false)
  const [triggerStatus, setTriggerStatus] = useState<"idle" | "success" | "error">("idle")
  const { toast } = useToast()

  const handleTrigger = async () => {
    setTriggering(true)
    setTriggerStatus("idle")

    try {
      const response = await fetch("/api/trigger-accounting", {
        method: "POST",
      })

      if (!response.ok) throw new Error("Error al activar el proceso")

      const data = await response.json()

      setTriggerStatus("success")
      toast({
        title: "¡Proceso activado!",
        description: "El proceso contable se ha iniciado correctamente en Make",
      })

      console.log("[v0] Trigger response:", data)
    } catch (error) {
      console.error("[v0] Error triggering accounting process:", error)
      setTriggerStatus("error")
      toast({
        title: "Error al activar",
        description: "Hubo un problema al activar el proceso. Por favor intenta de nuevo.",
        variant: "destructive",
      })
    } finally {
      setTriggering(false)
    }
  }

  return (
    <Card className="border-2 hover:border-primary/50 transition-colors">
      <CardHeader>
        <div className="flex items-center gap-3 mb-2">
          <div className="p-2 bg-primary/10 rounded-lg">
            <Calculator className="h-6 w-6 text-primary" />
          </div>
          <CardTitle className="text-2xl">Proceso Contable</CardTitle>
        </div>
        <CardDescription className="text-base">
          Activa el proceso contable automatizado en Make con un solo clic
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="bg-secondary/30 rounded-lg p-6 space-y-4">
          <div className="flex items-start gap-3">
            <div className="bg-primary text-primary-foreground rounded-full w-8 h-8 flex items-center justify-center font-bold flex-shrink-0">
              1
            </div>
            <div>
              <h3 className="font-semibold text-foreground mb-1">Preparación</h3>
              <p className="text-sm text-muted-foreground">
                Asegúrate de que todos los archivos necesarios estén subidos
              </p>
            </div>
          </div>

          <div className="flex items-start gap-3">
            <div className="bg-primary text-primary-foreground rounded-full w-8 h-8 flex items-center justify-center font-bold flex-shrink-0">
              2
            </div>
            <div>
              <h3 className="font-semibold text-foreground mb-1">Activación</h3>
              <p className="text-sm text-muted-foreground">Haz clic en el botón para iniciar el proceso en Make</p>
            </div>
          </div>

          <div className="flex items-start gap-3">
            <div className="bg-primary text-primary-foreground rounded-full w-8 h-8 flex items-center justify-center font-bold flex-shrink-0">
              3
            </div>
            <div>
              <h3 className="font-semibold text-foreground mb-1">Procesamiento</h3>
              <p className="text-sm text-muted-foreground">
                El sistema procesará automáticamente la información contable
              </p>
            </div>
          </div>
        </div>

        <Button onClick={handleTrigger} disabled={triggering} className="w-full h-14 text-lg font-semibold" size="lg">
          {triggering ? (
            <>
              <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-primary-foreground mr-2" />
              Activando proceso...
            </>
          ) : (
            <>
              <Play className="mr-2 h-5 w-5" />
              Activar Proceso Contable
            </>
          )}
        </Button>

        {triggerStatus === "success" && (
          <div className="flex items-center gap-2 text-primary bg-primary/10 p-3 rounded-lg">
            <CheckCircle2 className="h-5 w-5" />
            <span className="font-medium">Proceso activado exitosamente</span>
          </div>
        )}

        {triggerStatus === "error" && (
          <div className="flex items-center gap-2 text-destructive bg-destructive/10 p-3 rounded-lg">
            <AlertCircle className="h-5 w-5" />
            <span className="font-medium">Error al activar el proceso</span>
          </div>
        )}

        <div className="bg-muted/30 rounded-lg p-4 border border-border">
          <p className="text-sm text-muted-foreground">
            <strong className="text-foreground">Nota:</strong> Este botón activará el webhook configurado en Make.
            Asegúrate de tener tu escenario de Make configurado y activo.
          </p>
        </div>
      </CardContent>
    </Card>
  )
}
