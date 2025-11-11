"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { History, FileText, Calendar, Clock, ChevronDown, ChevronUp } from "lucide-react"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible"

type UploadRecord = {
  folderName: string
  filesCount: number
  timestamp: string
  fileNames: string[]
}

export function AccountingTriggerSection() {
  const [uploadHistory, setUploadHistory] = useState<UploadRecord[]>([])
  const [expandedItems, setExpandedItems] = useState<{[key: string]: boolean}>({})

  // Función para formatear la fecha
  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr)
    return {
      date: date.toLocaleString('es-ES', {
        day: 'numeric',
        month: 'long',
        year: 'numeric',
      }),
      time: date.toLocaleString('es-ES', {
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit',
        hour12: false
      })
    }
  }

  // Cargar historial desde localStorage
  useEffect(() => {
    const loadHistory = () => {
      const history = JSON.parse(localStorage.getItem('uploadHistory') || '[]')
      setUploadHistory(history)
    }

    // Cargar al inicio
    loadHistory()

    // Escuchar cambios en localStorage
    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === 'uploadHistory') {
        loadHistory()
      }
    }

    window.addEventListener('storage', handleStorageChange)
    return () => window.removeEventListener('storage', handleStorageChange)
  }, [])

  const toggleExpand = (timestamp: string) => {
    setExpandedItems(prev => ({
      ...prev,
      [timestamp]: !prev[timestamp]
    }))
  }

  return (
    <Card className="border-2 hover:border-primary/50 transition-colors">
      <CardHeader>
        <div className="flex items-center gap-3 mb-2">
          <div className="p-2 bg-primary/10 rounded-lg">
            <History className="h-6 w-6 text-primary" />
          </div>
          <CardTitle className="text-2xl">Historial de Archivos</CardTitle>
        </div>
        <CardDescription className="text-base">
          Registro de archivos procesados organizados por fecha
        </CardDescription>
      </CardHeader>
      <CardContent>
        <ScrollArea className="h-[400px] pr-4">
          <div className="space-y-4">
            {uploadHistory.map((record) => {
              const formattedDate = formatDate(record.timestamp)
              return (
                <Collapsible
                  key={record.timestamp}
                  open={expandedItems[record.timestamp]}
                  onOpenChange={() => toggleExpand(record.timestamp)}
                  className="bg-secondary/30 rounded-lg p-4 space-y-2"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Calendar className="h-5 w-5 text-primary" />
                      <h3 className="font-semibold text-foreground">
                        {record.folderName}
                      </h3>
                    </div>
                    <CollapsibleTrigger asChild>
                      <button className="hover:bg-secondary/50 p-1 rounded-full transition-colors">
                        {expandedItems[record.timestamp] ? (
                          <ChevronUp className="h-4 w-4" />
                        ) : (
                          <ChevronDown className="h-4 w-4" />
                        )}
                      </button>
                    </CollapsibleTrigger>
                  </div>

                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <FileText className="h-4 w-4" />
                    <span>{record.filesCount} archivo(s) procesado(s)</span>
                  </div>

                  <div className="flex flex-col gap-1 text-xs text-muted-foreground">
                    <div className="flex items-center gap-2">
                      <Clock className="h-3 w-3" />
                      <span>Hora: {formattedDate.time}</span>
                    </div>
                  </div>

                  <CollapsibleContent className="pt-2">
                    <ScrollArea className="h-[200px]">
                      <div className="bg-background/50 rounded-lg p-3 space-y-1">
                        <p className="text-sm font-medium mb-2 sticky top-0 bg-background/50 backdrop-blur-sm p-2 rounded-t-lg">
                          Archivos:
                        </p>
                        {record.fileNames.map((fileName, index) => (
                          <p key={index} className="text-sm text-muted-foreground pl-3 py-1 hover:bg-secondary/20 rounded-lg transition-colors">
                            • {fileName}
                          </p>
                        ))}
                      </div>
                    </ScrollArea>
                  </CollapsibleContent>
                </Collapsible>
              )
            })}
          </div>

          {uploadHistory.length === 0 && (
            <div className="text-center py-8 text-muted-foreground">
              <History className="h-12 w-12 mx-auto mb-4 opacity-50" />
              <p>No hay registros de archivos procesados</p>
            </div>
          )}
        </ScrollArea>

        <div className="bg-muted/30 rounded-lg p-4 border border-border mt-4">
          <p className="text-sm text-muted-foreground">
            <strong className="text-foreground">Nota:</strong> Este historial muestra los últimos archivos
            procesados por el sistema.
          </p>
        </div>
      </CardContent>
    </Card>
  )
}
