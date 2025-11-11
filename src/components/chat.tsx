'use client'

import { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'

type Message = { id: number; text: string; author: 'yo' | 'sistema' }

export function ChatPanel() {
  const [messages, setMessages] = useState<Message[]>([
    { id: 1, text: 'Hola, este es tu asistente.', author: 'sistema' },
    { id: 2, text: 'El chat queda fijo a la izquierda.', author: 'sistema' },
  ])
  const [input, setInput] = useState('')

  const sendMessage = () => {
    if (!input.trim()) return
    setMessages((prev) => [...prev, { id: Date.now(), text: input.trim(), author: 'yo' }])
    setInput('')
  }

  return (
    <Card className="h-[600px] border-2 flex flex-col">
      <CardHeader>
        <CardTitle>Chat</CardTitle>
      </CardHeader>
      <CardContent className="flex-1 flex flex-col gap-3 min-h-0">
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
        <div className="flex gap-2">
          <Input
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Escribe un mensaje"
          />
          <Button onClick={sendMessage}>Enviar</Button>
        </div>
      </CardContent>
    </Card>
  )
}