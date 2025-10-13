"use client"

import type React from "react"

import { useState, useCallback } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Upload, FolderOpen, CheckCircle2, AlertCircle } from "lucide-react"
import { useToast } from "@/hooks/use-toast"

export function FileUploadSection() {
  const [files, setFiles] = useState<File[]>([])
  const [uploading, setUploading] = useState(false)
  const [uploadStatus, setUploadStatus] = useState<"idle" | "success" | "error">("idle")
  const { toast } = useToast()

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      setFiles(Array.from(e.target.files))
      setUploadStatus("idle")
    }
  }

  const handleDrop = useCallback((e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault()
    if (e.dataTransfer.files) {
      setFiles(Array.from(e.dataTransfer.files))
      setUploadStatus("idle")
    }
  }, [])

  const handleDragOver = useCallback((e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault()
  }, [])

  const handleUpload = async () => {
    if (files.length === 0) {
      toast({
        title: "No hay archivos",
        description: "Por favor selecciona archivos para subir",
        variant: "destructive",
      })
      return
    }

    setUploading(true)
    setUploadStatus("idle")

    try {
      const formData = new FormData()
      files.forEach((file) => formData.append("files", file))

      const response = await fetch("/api/upload-to-drive", {
        method: "POST",
        body: formData,
      })

      if (!response.ok) throw new Error("Error al subir archivos")

      const data = await response.json()

      setUploadStatus("success")
      toast({
        title: "¡Archivos subidos!",
        description: `${files.length} archivo(s) subido(s) a la carpeta: ${data.folderName}`,
      })

      setFiles([])
    } catch (error) {
      console.error("[v0] Error uploading files:", error)
      setUploadStatus("error")
      toast({
        title: "Error al subir",
        description: "Hubo un problema al subir los archivos. Por favor intenta de nuevo.",
        variant: "destructive",
      })
    } finally {
      setUploading(false)
    }
  }

  return (
    <Card className="border-2 hover:border-primary/50 transition-colors">
      <CardHeader>
        <div className="flex items-center gap-3 mb-2">
          <div className="p-2 bg-primary/10 rounded-lg">
            <Upload className="h-6 w-6 text-primary" />
          </div>
          <CardTitle className="text-2xl">Subir Archivos</CardTitle>
        </div>
        <CardDescription className="text-base">
          Los archivos se organizarán automáticamente en carpetas por fecha en Google Drive
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div
          onDrop={handleDrop}
          onDragOver={handleDragOver}
          className="border-2 border-dashed border-border rounded-lg p-8 text-center hover:border-primary/50 transition-colors cursor-pointer bg-muted/20"
        >
          <input type="file" multiple onChange={handleFileChange} className="hidden" id="file-upload" />
          <label htmlFor="file-upload" className="cursor-pointer">
            <FolderOpen className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
            <p className="text-lg font-medium text-foreground mb-2">
              Arrastra archivos aquí o haz clic para seleccionar
            </p>
            <p className="text-sm text-muted-foreground">Soporta múltiples archivos</p>
          </label>
        </div>

        {files.length > 0 && (
          <div className="bg-secondary/30 rounded-lg p-4">
            <p className="font-medium text-foreground mb-2">{files.length} archivo(s) seleccionado(s):</p>
            <ul className="space-y-1 max-h-32 overflow-y-auto">
              {files.map((file, index) => (
                <li key={index} className="text-sm text-muted-foreground truncate">
                  • {file.name}
                </li>
              ))}
            </ul>
          </div>
        )}

        <Button
          onClick={handleUpload}
          disabled={uploading || files.length === 0}
          className="w-full h-12 text-lg font-semibold"
          size="lg"
        >
          {uploading ? (
            <>
              <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-primary-foreground mr-2" />
              Subiendo...
            </>
          ) : (
            <>
              <Upload className="mr-2 h-5 w-5" />
              Subir a Google Drive
            </>
          )}
        </Button>

        {uploadStatus === "success" && (
          <div className="flex items-center gap-2 text-primary bg-primary/10 p-3 rounded-lg">
            <CheckCircle2 className="h-5 w-5" />
            <span className="font-medium">Archivos subidos exitosamente</span>
          </div>
        )}

        {uploadStatus === "error" && (
          <div className="flex items-center gap-2 text-destructive bg-destructive/10 p-3 rounded-lg">
            <AlertCircle className="h-5 w-5" />
            <span className="font-medium">Error al subir archivos</span>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
