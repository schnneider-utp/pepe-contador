'use client'

import { AIMessage, HumanMessage, SystemMessage, BaseMessage } from '@langchain/core/messages'
import { ChatGoogleGenerativeAI } from '@langchain/google-genai'

export type ChatbotOptions = {
  apiKey: string
  modelName?: string
  temperature?: number
}

export class ChatService {
  private model: ChatGoogleGenerativeAI
  private messages: BaseMessage[] = []

  constructor(opts: ChatbotOptions) {
    const { apiKey, modelName = 'gemini-2.0-flash', temperature = 0.7 } = opts
    this.model = new ChatGoogleGenerativeAI({ apiKey, model: modelName, temperature })
    this.messages = [
      new SystemMessage(
        'Eres un asistente útil. Responde en español, de forma clara y concisa.'
      ),
    ]
  }

  async send(userText: string): Promise<string> {
    this.messages.push(new HumanMessage(userText))
    const ai = await this.model.invoke(this.messages)
    this.messages.push(ai)
    return normalizeContent(ai.content)
  }

  reset() {
    this.messages = [
      new SystemMessage(
        'Eres un asistente útil. Responde en español, de forma clara y concisa.'
      ),
    ]
  }
}

function normalizeContent(content: unknown): string {
  if (typeof content === 'string') return content
  if (Array.isArray(content)) {
    // LangChain puede devolver segmentos multimodales; extraemos texto
    return content
      .map((c: any) => (typeof c === 'string' ? c : c?.text ?? ''))
      .filter(Boolean)
      .join('\n')
  }
  try {
    return JSON.stringify(content)
  } catch {
    return String(content)
  }
}