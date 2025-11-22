'use client'

import * as React from 'react'
import { Upload, X, FileText, AlertCircle, Trash2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardHeader, CardTitle, CardContent, CardDescription } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Badge } from '@/components/ui/badge'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { ScrollArea } from '@/components/ui/scroll-area'
import { useTemporaryContext } from '@/contexts/temporary-context'
import { GoogleGenerativeAIEmbeddings } from '@langchain/google-genai'

export function TemporaryContextSection() {
    const { documents, addDocument, removeDocument, clearAll } = useTemporaryContext()
    const [file, setFile] = React.useState<File | null>(null)
    const [title, setTitle] = React.useState('')
    const [apiKey, setApiKey] = React.useState('')
    const [uploading, setUploading] = React.useState(false)
    const [error, setError] = React.useState<string | null>(null)
    const [progress, setProgress] = React.useState<string | null>(null)

    const canUpload = apiKey.trim().length > 0 && title.trim().length > 0 && file !== null && !uploading

    async function handleUpload() {
        if (!canUpload || !file) return
        setUploading(true)
        setError(null)
        setProgress('Extrayendo texto...')

        try {
            // Extraer texto del archivo
            let text: string
            if (file.type === 'application/pdf') {
                const r = await readPdfText(file)
                text = r.text
            } else if (
                file.type === 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' ||
                file.type === 'application/vnd.ms-excel' ||
                file.name.endsWith('.xlsx') ||
                file.name.endsWith('.xls')
            ) {
                const r = await readExcelText(file)
                text = r.text
                setProgress(`Extraído de ${r.sheets} hojas: ${r.sheetNames.join(', ')}`)
            } else {
                text = await readTextFile(file)
            }

            if (!text || text.trim().length === 0) {
                throw new Error('El archivo está vacío o no se pudo extraer texto')
            }

            setProgress('Dividiendo en fragmentos...')

            // Dividir en chunks
            const { RecursiveCharacterTextSplitter }: any = await import('@langchain/textsplitters')
            const splitter = new RecursiveCharacterTextSplitter({ chunkSize: 1200, chunkOverlap: 200 })
            const parts: string[] = await splitter.splitText(text)

            setProgress(`Generando embeddings (${parts.length} fragmentos)...`)

            // Generar embeddings
            const embeddings = new GoogleGenerativeAIEmbeddings({ apiKey, model: 'text-embedding-004' })
            const vectors: number[][] = await embeddings.embedDocuments(parts)

            // Crear documento temporal
            const chunks = parts.map((content, i) => ({
                content,
                embedding: vectors[i],
            }))

            const doc = {
                id: crypto.randomUUID(),
                title: title.trim(),
                filename: file.name,
                chunks,
                uploadedAt: new Date(),
            }

            addDocument(doc)

            // Limpiar formulario
            setFile(null)
            setTitle('')
            setProgress(null)

            // Limpiar el input de archivos
            const fileInput = document.getElementById('temp-file-upload') as HTMLInputElement
            if (fileInput) fileInput.value = ''
        } catch (err) {
            const msg = (err as any)?.message || 'Error al procesar el archivo'
            setError(msg)
            setProgress(null)
        } finally {
            setUploading(false)
        }
    }

    function onFileChange(e: React.ChangeEvent<HTMLInputElement>) {
        const f = e.target.files?.[0] ?? null
        setFile(f)
        setError(null)
    }

    return (
        <Card id="temporary-context-section" className="border-2 hover:border-primary/50 transition-colors">
            <CardHeader>
                <div className="flex items-center gap-3 mb-2">
                    <div className="p-2 bg-primary/10 rounded-lg">
                        <FileText className="h-6 w-6 text-primary" />
                    </div>
                    <div className="flex-1">
                        <CardTitle className="text-2xl">Contexto Temporal</CardTitle>
                        {documents.length > 0 && (
                            <Badge variant="secondary" className="mt-1">
                                {documents.length} {documents.length === 1 ? 'documento activo' : 'documentos activos'}
                            </Badge>
                        )}
                    </div>
                </div>
                <CardDescription className="text-base">
                    Sube documentos temporales (PDF, Excel, TXT, MD) para proporcionar contexto al chat. Los documentos se mantienen solo durante esta sesión.
                </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
                {/* Lista de documentos activos */}
                {documents.length > 0 && (
                    <div className="space-y-3">
                        <div className="flex items-center justify-between">
                            <Label className="text-base font-semibold">Documentos Activos</Label>
                            <Button variant="outline" size="sm" onClick={clearAll} className="gap-2">
                                <Trash2 className="size-4" />
                                Limpiar todo
                            </Button>
                        </div>
                        <div className="space-y-2">
                            {documents.map((doc) => (
                                <div
                                    key={doc.id}
                                    className="flex items-center justify-between gap-3 rounded-lg bg-secondary/30 p-4 border border-border hover:border-primary/50 transition-colors"
                                >
                                    <div className="flex-1 min-w-0">
                                        <div className="font-medium text-foreground mb-1">{doc.title}</div>
                                        <div className="text-sm text-muted-foreground">
                                            {doc.filename} • {doc.chunks.length} fragmentos
                                        </div>
                                    </div>
                                    <Button
                                        variant="ghost"
                                        size="icon"
                                        className="shrink-0 hover:bg-destructive/10 hover:text-destructive"
                                        onClick={() => removeDocument(doc.id)}
                                    >
                                        <X className="size-5" />
                                    </Button>
                                </div>
                            ))}
                        </div>
                    </div>
                )}

                {/* Formulario de subida */}
                <div className="space-y-4 pt-4 border-t">
                    <Label className="text-base font-semibold">Agregar Nuevo Documento</Label>

                    <div className="space-y-2">
                        <Label htmlFor="temp-api-key" className="text-sm">
                            Google API Key
                        </Label>
                        <Input
                            id="temp-api-key"
                            type="password"
                            value={apiKey}
                            onChange={(e) => setApiKey(e.target.value)}
                            placeholder="Ingresa tu API key de Google (Gemini)"
                            disabled={uploading}
                        />
                        <p className="text-xs text-muted-foreground">
                            Se usa solo para generar embeddings. No se almacena.
                        </p>
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="temp-title" className="text-sm">
                            Título del Documento
                        </Label>
                        <Input
                            id="temp-title"
                            value={title}
                            onChange={(e) => setTitle(e.target.value)}
                            placeholder="Ej: Manual de Contabilidad 2024"
                            disabled={uploading || !apiKey.trim()}
                        />
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="temp-file-upload" className="text-sm">
                            Archivo
                        </Label>
                        <Input
                            id="temp-file-upload"
                            type="file"
                            accept="text/plain,text/markdown,application/pdf,application/vnd.openxmlformats-officedocument.spreadsheetml.sheet,application/vnd.ms-excel,.xlsx,.xls"
                            onChange={onFileChange}
                            disabled={uploading || !title.trim() || !apiKey.trim()}
                        />
                        {file && (
                            <div className="text-sm text-muted-foreground bg-muted/30 rounded p-2">
                                📄 {file.name} • {(file.size / 1024).toFixed(1)} KB
                            </div>
                        )}
                    </div>

                    {error && (
                        <Alert variant="destructive">
                            <AlertCircle className="size-4" />
                            <AlertDescription className="text-sm">{error}</AlertDescription>
                        </Alert>
                    )}

                    {progress && (
                        <div className="bg-primary/10 rounded-lg p-3 border border-primary/20">
                            <div className="text-sm text-primary animate-pulse font-medium">{progress}</div>
                        </div>
                    )}

                    <Button onClick={handleUpload} disabled={!canUpload} className="w-full h-12 text-lg font-semibold" size="lg">
                        {uploading ? (
                            <>
                                <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-primary-foreground mr-2" />
                                Procesando...
                            </>
                        ) : (
                            <>
                                <Upload className="size-5 mr-2" />
                                Subir Documento Temporal
                            </>
                        )}
                    </Button>
                </div>

                {documents.length === 0 && (
                    <div className="bg-muted/30 rounded-lg p-8 border border-border text-center">
                        <FileText className="size-12 mx-auto mb-3 text-muted-foreground" />
                        <p className="text-base font-medium text-foreground mb-2">
                            No hay documentos temporales
                        </p>
                        <p className="text-sm text-muted-foreground">
                            Sube un documento (PDF, Excel, TXT, MD) para proporcionar contexto al chat. Los documentos se mantienen solo durante esta sesión.
                        </p>
                    </div>
                )}

                <div className="bg-muted/30 rounded-lg p-4 border border-border">
                    <p className="text-sm text-muted-foreground">
                        <strong className="text-foreground">Nota:</strong> Los documentos temporales se usan para proporcionar contexto al chat sin almacenarlos permanentemente. Se perderán al recargar la página.
                    </p>
                </div>
            </CardContent>
        </Card>
    )
}

async function readTextFile(file: File): Promise<string> {
    const buf = await file.arrayBuffer()
    const decoder = new TextDecoder()
    return decoder.decode(buf)
}

async function readPdfText(file: File): Promise<{ text: string; pages: number }> {
    const data = new FormData()
    data.append('file', file)
    const res = await fetch('/api/rag/extract', { method: 'POST', body: data })
    if (!res.ok) {
        const body = await res.text()
        throw new Error(`Error al extraer PDF: ${body}`)
    }
    const json = await res.json()
    return { text: json.text as string, pages: (json.pages as number) || 0 }
}

async function readExcelText(file: File): Promise<{ text: string; sheets: number; sheetNames: string[] }> {
    const data = new FormData()
    data.append('file', file)
    const res = await fetch('/api/excel/extract', { method: 'POST', body: data })
    if (!res.ok) {
        const body = await res.text()
        throw new Error(`Error al extraer Excel: ${body}`)
    }
    const json = await res.json()
    return {
        text: json.text as string,
        sheets: (json.sheets as number) || 0,
        sheetNames: (json.sheetNames as string[]) || [],
    }
}
