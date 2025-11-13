'use client'

import { useRef, useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Spinner } from '@/components/ui/spinner'
import { ChatService } from '@/agents/chatbot'
import { handleUserInstruction } from '@/agents/orchestrator'

type Message = { id: number; text: string; author: 'yo' | 'sistema' }

export function ChatPanel() {
  const [messages, setMessages] = useState<Message[]>([
    { id: 0, text: 'Chat bloqueado. Ingresa tu API key de Google para activar Gemini.', author: 'sistema' },
  ])
  const [input, setInput] = useState('')
  const [apiKey, setApiKey] = useState('')
  const [unlocked, setUnlocked] = useState(false)
  const [sending, setSending] = useState(false)
  const [editingKey, setEditingKey] = useState(false)
  const [apiKeyDraft, setApiKeyDraft] = useState('')
  const serviceRef = useRef<ChatService | null>(null)
  const idRef = useRef(0)
  const nextId = () => {
    idRef.current += 1
    return idRef.current
  }

  const openEditKey = () => {
    setApiKeyDraft(apiKey)
    setEditingKey(true)
  }

  const saveApiKey = () => {
    const key = apiKeyDraft.trim()
    if (!key) {
      setApiKey('')
      serviceRef.current = null
      setUnlocked(false)
      setEditingKey(false)
      setMessages((prev) => [
        ...prev,
        { id: nextId(), text: 'API key eliminada. Chat bloqueado.', author: 'sistema' },
      ])
      return
    }
    try {
      serviceRef.current = new ChatService({ apiKey: key })
      setApiKey(key)
      setUnlocked(true)
      setEditingKey(false)
      setMessages((prev) => [
        ...prev,
        { id: nextId(), text: 'API key actualizada. Gemini listo.', author: 'sistema' },
      ])
    } catch (err) {
      setMessages((prev) => [
        ...prev,
        { id: nextId(), text: 'No se pudo guardar la API key. Verifica el valor.', author: 'sistema' },
      ])
    }
  }

  const unlockChat = () => {
    const key = apiKey.trim()
    if (!key) return
    try {
      serviceRef.current = new ChatService({ apiKey: key })
      setUnlocked(true)
      setMessages((prev) => [
        ...prev,
        { id: nextId(), text: 'Gemini activado. Ya puedes chatear conmigo.', author: 'sistema' },
      ])
    } catch (err) {
      setMessages((prev) => [
        ...prev,
        { id: nextId(), text: 'No se pudo activar el chat. Verifica tu API key.', author: 'sistema' },
      ])
    }
  }

  const sendMessage = async () => {
    if (!input.trim() || !unlocked || !serviceRef.current) return
    const userText = input.trim()
    setInput('')
    setMessages((prev) => [...prev, { id: nextId(), text: userText, author: 'yo' }])
    const orchestration = handleUserInstruction(userText)
    if (orchestration.guide) {
      setMessages((prev) => [
        ...prev,
        { id: nextId(), text: orchestration.guide!, author: 'sistema' },
      ])
    }
    const t = userText.toLowerCase()
    const isGreeting = /(\bhola\b|\bhello\b|\bhi\b|\bbuenas\b|\bbuenos dias\b|\bbuenas tardes\b|\bbuenas noches\b|\bo?ye\b|\bque tal\b|\bqué tal\b)/.test(t)
    if (isGreeting) {
      setMessages((prev) => [...prev, { id: nextId(), text: 'Hola, ¿en qué te puedo ayudar?', author: 'sistema' }])
      return
    }
    setSending(true)
    try {
      const svc = serviceRef.current as any
      const reply = typeof svc.sendSmart === 'function'
        ? await svc.sendSmart(userText)
        : typeof svc.sendRag === 'function'
          ? await svc.sendRag(userText)
          : await svc.send(userText)
      setMessages((prev) => [...prev, { id: nextId(), text: reply, author: 'sistema' }])
    } catch (err) {
      const msg = (err as any)?.message || 'Error al consultar Gemini. Revisa tu API key o intenta de nuevo.'
      setMessages((prev) => [
        ...prev,
        { id: nextId(), text: msg, author: 'sistema' },
      ])
    } finally {
      setSending(false)
    }
  }

  return (
    <Card className="h-[600px] border-2 flex flex-col">
      <CardHeader>
        <CardTitle>Chat {unlocked ? '(activo)' : '(bloqueado)'}</CardTitle>
      </CardHeader>
      <CardContent className="flex-1 flex flex-col gap-3 min-h-0">
        {!unlocked ? (
          <div className="space-y-3">
            <Input
              value={apiKey}
              onChange={(e) => setApiKey(e.target.value)}
              placeholder="Ingresa tu API key de Google (Gemini)"
            />
            <Button onClick={unlockChat} disabled={!apiKey.trim()}>Activar chat</Button>
            <p className="text-xs text-muted-foreground">
              La clave se usa solo en este navegador para consultas a Gemini.
            </p>
            <a
              href="https://aistudio.google.com/app/apikey"
              target="_blank"
              rel="noopener noreferrer"
              className="text-xs underline text-primary"
            >
              Obtener API key de Gemini (Google AI Studio)
            </a>
          </div>
        ) : null}
        <ScrollArea className="flex-1 h-full rounded-md border border-border p-3 overflow-y-auto">
          <div className="space-y-3">
            {messages.map((m) => (
              <div
                key={m.id}
                className={
                  m.author === 'yo'
                    ? 'ml-auto max-w-[85%] rounded-lg bg-primary/10 px-3 py-2 text-foreground'
                    : 'mr-auto max-w-[85%] rounded-lg bg-muted px-3 py-2 text-foreground'
                }
              >
                {m.text}
              </div>
            ))}
          </div>
        </ScrollArea>
        <div className="flex gap-2 items-center">
          <Input
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder={unlocked ? 'Escribe un mensaje' : 'Bloqueado: ingresa API key'}
            disabled={!unlocked || sending}
          />
          <Button onClick={sendMessage} disabled={!unlocked || sending}>Enviar</Button>
          {sending ? (
            <div className="flex items-center text-sm text-muted-foreground">
              <Spinner className="mr-2" /> Generando...
            </div>
          ) : null}
        </div>
        {unlocked ? (
          <div className="mt-2 space-y-2">
            {!editingKey ? (
              <Button variant="outline" size="sm" onClick={openEditKey}>Editar API key</Button>
            ) : (
              <div className="space-y-2">
                <Input
                  value={apiKeyDraft}
                  onChange={(e) => setApiKeyDraft(e.target.value)}
                  placeholder="Editar API key de Google (Gemini)"
                />
                <div className="flex gap-2">
                  <Button onClick={saveApiKey}>Guardar</Button>
                  <Button variant="secondary" onClick={() => setEditingKey(false)}>Cancelar</Button>
                  <a
                    href="https://aistudio.google.com/app/apikey"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-xs underline text-primary self-center"
                  >
                    Obtener API key
                  </a>
                </div>
                <p className="text-xs text-muted-foreground">Puedes actualizar o eliminar la clave para bloquear el chat.</p>
              </div>
            )}
          </div>
        ) : null}
      </CardContent>
    </Card>
  )
}