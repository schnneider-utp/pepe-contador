'use client'

import * as React from 'react'
import { Settings } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Drawer, DrawerTrigger, DrawerContent, DrawerHeader, DrawerTitle, DrawerFooter, DrawerClose } from '@/components/ui/drawer'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { GoogleGenerativeAIEmbeddings } from '@langchain/google-genai'

export function UserRagUploader() {
  const [apiKey, setApiKey] = React.useState('')
  const [title, setTitle] = React.useState('')
  const [file, setFile] = React.useState<File | null>(null)
  const [busy, setBusy] = React.useState(false)
  const [pdfPreview, setPdfPreview] = React.useState<string | null>(null)
  const [pdfInfo, setPdfInfo] = React.useState<string | null>(null)
  const [progress, setProgress] = React.useState<{ total: number; done: number } | null>(null)
  const canSubmit = apiKey.trim().length > 0 && title.trim().length > 0 && !!file && !busy

  async function handleSubmit() {
    if (!canSubmit || !file) return
    setBusy(true)
    try {
      console.log('rag:uploader:start', { name: file.name, type: file.type, size: file.size })
      let text: string
      if (file.type === 'application/pdf') {
        const r = await readPdfText(file)
        text = r.text
        setPdfInfo(`${r.pages} páginas`)
      } else {
        text = await readTextFile(file)
      }
      console.log('rag:uploader:extracted', { length: text.length })
      const { RecursiveCharacterTextSplitter }: any = await import('@langchain/textsplitters')
      const splitter = new RecursiveCharacterTextSplitter({ chunkSize: 1200, chunkOverlap: 200 })
      const parts: string[] = await splitter.splitText(text)
      console.log('rag:uploader:chunks', { count: parts.length })
      const embeddings = new GoogleGenerativeAIEmbeddings({ apiKey, model: 'text-embedding-004' })
      const sampleVec = await embeddings.embedQuery(parts[0] || '')
      console.log('rag:uploader:vector_sample', { dims: sampleVec.length, preview: sampleVec.slice(0, 5) })
      const initRes = await fetch('/api/rag/ingest', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ title, metadata: { filename: file.name, size: file.size, type: file.type, embedding_model: 'text-embedding-004' } }),
      })
      if (!initRes.ok) {
        const t = await initRes.text()
        console.error('rag:uploader:create_failed', { status: initRes.status, body: t })
        throw new Error('create_failed')
      }
      const { document_id } = await initRes.json()

      const batchSize = 100
      const totalBatches = Math.ceil(parts.length / batchSize)
      setProgress({ total: totalBatches, done: 0 })
      for (let b = 0; b < totalBatches; b++) {
        const start = b * batchSize
        const end = Math.min(parts.length, start + batchSize)
        const slice = parts.slice(start, end)
        console.log('rag:uploader:batch', { b, start, end })
        const vecs: number[][] = await embeddings.embedDocuments(slice)
        const rows = slice.map((content: string, i: number) => ({ content, embedding: vecs[i] }))
        const res = await fetch('/api/rag/ingest', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ document_id, chunks: rows }),
        })
        if (!res.ok) {
          const t = await res.text()
          console.error('rag:uploader:batch_failed', { status: res.status, body: t })
          throw new Error('batch_failed')
        }
        setProgress({ total: totalBatches, done: b + 1 })
        await new Promise((r) => setTimeout(r, 0))
      }
      console.log('rag:uploader:done', { document_id })
    } finally {
      setBusy(false)
    }
  }

  function onFile(e: React.ChangeEvent<HTMLInputElement>) {
    const f = e.target.files?.[0] ?? null
    setFile(f)
    setPdfPreview(null)
    setPdfInfo(null)
    if (f && f.type === 'application/pdf') {
      const url = URL.createObjectURL(f)
      setPdfPreview(url)
    }
  }

  return (
    <Drawer direction="right">
      <DrawerTrigger asChild>
        <Button
          variant="outline"
          size="icon-lg"
          className="fixed top-4 right-4 z-50 bg-background shadow-xs hover:shadow-md transition-transform hover:scale-[1.03]"
        >
          <Settings className="size-6" />
          <span className="sr-only">Abrir RAG</span>
        </Button>
      </DrawerTrigger>

      <DrawerContent className="data-[vaul-drawer-direction=right]:sm:max-w-md md:max-w-xl xl:max-w-2xl">
        <DrawerHeader>
          <DrawerTitle>Subir documento RAG</DrawerTitle>
        </DrawerHeader>

        <div className="p-4 space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Datos</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="space-y-2">
                <Label>Google API Key</Label>
                <Input value={apiKey} onChange={(e) => setApiKey(e.target.value)} placeholder="Ingresa tu API key" />
              </div>
              <div className="space-y-2">
                <Label>Título</Label>
                <Input value={title} onChange={(e) => setTitle(e.target.value)} placeholder="Título del documento" />
              </div>
              <div className="space-y-2">
                <Label>Archivo</Label>
                <Input type="file" accept="text/plain,text/markdown,application/pdf" onChange={onFile} disabled={apiKey.trim().length === 0 || title.trim().length === 0} />
              </div>
              <ScrollArea className="h-24 rounded-md border">
                <div className="p-3 text-sm">
                  {file ? `${file.name} • ${file.type} • ${file.size} bytes` : 'Aún no hay documento'}
                  {pdfInfo ? ` • ${pdfInfo}` : ''}
                </div>
              </ScrollArea>
              {pdfPreview ? (
                <div className="mt-2">
                  <object data={`${pdfPreview}#page=1`} type="application/pdf" className="w-full h-40 rounded-md border" />
                </div>
              ) : null}
              {progress ? (
                <div className="mt-2">
                  <div className="h-2 bg-muted rounded">
                    <div className="h-2 bg-primary rounded" style={{ width: `${(progress.done / progress.total) * 100}%` }} />
                  </div>
                  <div className="text-xs mt-1">{progress.done} / {progress.total} lotes</div>
                </div>
              ) : null}
            </CardContent>
          </Card>
          <div className="flex justify-end gap-2">
            <DrawerClose asChild>
              <Button variant="outline">Cerrar</Button>
            </DrawerClose>
            <Button onClick={handleSubmit} disabled={!canSubmit}>{busy ? 'Subiendo...' : 'Subir'}</Button>
          </div>
        </div>

        <DrawerFooter />
      </DrawerContent>
    </Drawer>
  )
}

async function readTextFile(file: File) {
  const buf = await file.arrayBuffer()
  const decoder = new TextDecoder()
  return decoder.decode(buf)
}

async function readPdfText(file: File) {
  const data = new FormData()
  data.append('file', file)
  const res = await fetch('/api/rag/extract', { method: 'POST', body: data })
  if (!res.ok) {
    const body = await res.text()
    console.error('rag:uploader:extract_failed', { status: res.status, body })
    throw new Error('extract_failed')
  }
  const json = await res.json()
  return { text: json.text as string, pages: (json.pages as number) || 0 }
}

async function readInputFile(file: File) {
  if (file.type === 'application/pdf') {
    const r = await readPdfText(file)
    return r.text
  }
  return readTextFile(file)
}