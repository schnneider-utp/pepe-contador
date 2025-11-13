'use client'

import { AIMessage, HumanMessage, SystemMessage, BaseMessage } from '@langchain/core/messages'
import { ChatGoogleGenerativeAI, GoogleGenerativeAIEmbeddings } from '@langchain/google-genai'

export type ChatbotOptions = {
  apiKey: string
  modelName?: string
  temperature?: number
}

export class ChatService {
  private model: ChatGoogleGenerativeAI
  private messages: BaseMessage[] = []
  private apiKey: string

  constructor(opts: ChatbotOptions) {
    const { apiKey, modelName = 'gemini-2.0-flash', temperature = 0.2 } = opts
    this.model = new ChatGoogleGenerativeAI({ apiKey, model: modelName, temperature })
    this.apiKey = apiKey
    this.messages = [
      new SystemMessage(
        'Situación\nEstás desarrollando un agente de IA especializado en contabilidad que procesa documentos contables en formato de imagen y PDF. El agente debe analizar información financiera, realizar cálculos contables y proporcionar interpretaciones precisas basadas en documentos reales del usuario.\n\nTarea\nActúa como un contador profesional experto que analiza, interpreta y procesa documentos contables (facturas, estados financieros, recibos, comprobantes, balances, etc.) con precisión técnica y rigor contable. Extrae información relevante, identifica patrones financieros, detecta inconsistencias y proporciona análisis contables fundamentados.\n\nObjetivo\nProporciona asesoramiento contable de calidad profesional que ayude al usuario a comprender, organizar y gestionar su información financiera con confiabilidad y exactitud, minimizando errores y facilitando la toma de decisiones informadas.\n\nConocimiento\n- Domina partida doble, deudor-acreedor, activos, pasivos, patrimonio, ingresos, gastos, depreciación, provisiones y conciliaciones.\n- Reconoce y valida formatos estándar: facturas (RUC/NIT, impuestos), estados de resultados, balances generales, libros diarios, comprobantes de pago y documentos de soporte.\n- Ante datos incompletos, ilegibles o inconsistentes, señálalo explícitamente y sugiere acciones correctivas.\n- Aplica normativas vigentes (NIIF y normas locales según el contexto) cuando sea pertinente.\n\nEstilo\nResponde siempre en español, de forma clara, concisa y estructurada. Prioriza la precisión técnica sobre la brevedad cuando ambas entren en conflicto. Eres un experto contador con más de 15 años de experiencia en análisis financiero, auditoría y asesoramiento contable. Tu rol es interpretar documentos con rigor profesional, identificar riesgos y guiar al usuario con recomendaciones basadas en principios contables sólidos.'
      ),
    ]
  }

  private shouldUseRag(userText: string): boolean {
    const t = userText.toLowerCase()
    const wc = t.split(/\s+/).filter(Boolean).length
    const isGreeting = /(\bhola\b|\bhello\b|\bhi\b|\bbuenas\b|\bbuenos dias\b|\bbuenas tardes\b|\bbuenas noches\b|\bo?ye\b|\bque tal\b|\bqué tal\b)/.test(t)
    if (isGreeting || wc < 3) return false
    const ragHint = /(\bdocumento\b|\bpdf\b|\barchivo\b|\bpágina\b|\bcapítulo\b|\bsegún el documento\b|\ben el documento\b|\bdel documento\b|\bfactura\b|\bestado\b|\bbalance\b|\bcomprobante\b|\brecibo\b|\btabla\b|\banexo\b|\bsección\b|\breferencia\b)/.test(t)
    return ragHint || t.length > 80
  }

  async sendSmart(userText: string): Promise<string> {
    const t = userText.toLowerCase()
    const isGreeting = /(\bhola\b|\bhello\b|\bhi\b|\bbuenas\b|\bbuenos dias\b|\bbuenas tardes\b|\bbuenas noches\b|\bo?ye\b|\bque tal\b|\bqué tal\b)/.test(t)
    if (isGreeting) {
      this.messages.push(new HumanMessage(userText))
      const quick = 'Hola, ¿en qué te puedo ayudar?'
      this.messages.push(new AIMessage(quick))
      return quick
    }
    if (!this.shouldUseRag(userText)) {
      return this.send(userText)
    }
    return this.sendRag(userText)
  }

  async send(userText: string): Promise<string> {
    const outbound: BaseMessage[] = []
    if (this.messages.length > 0) outbound.push(this.messages[0])
    if (this.messages.length > 1) outbound.push(...this.messages.slice(1).filter((m) => !(m instanceof SystemMessage)))
    outbound.push(new HumanMessage(userText))
    const ai = await this.model.invoke(outbound)
    this.messages.push(new HumanMessage(userText))
    this.messages.push(ai)
    return normalizeContent(ai.content)
  }

  async sendRag(userText: string, opts?: { topK?: number; documentId?: string }): Promise<string> {
    try {
      const topK = opts?.topK ?? 5
      const documentId = opts?.documentId
      const embeddings = new GoogleGenerativeAIEmbeddings({ apiKey: this.apiKey, model: 'text-embedding-004' })
      const qvec = await embeddings.embedQuery(userText)
      const res = await fetch('/api/rag/query', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ embedding: qvec, top_k: topK, document_id: documentId }),
      })
      if (!res.ok) {
        const body = await res.text()
        throw new Error(`rag_query_failed:${body}`)
      }
      const json = await res.json()
      const matches = Array.isArray(json.matches) ? json.matches : []
      const parts = matches.map((m: any, i: number) => {
        const content = typeof m?.content === 'string' ? m.content : ''
        return `Fragmento ${i + 1}:\n${content}`
      })
      const context = parts.join('\n\n')
      const contextMsg = new HumanMessage(
        `Contexto del documento:\n\n${context}\n\nUsa este contexto para responder con precisión. Si no es suficiente, indica qué falta y solicita más detalles.`
      )
      const outbound: BaseMessage[] = []
      if (this.messages.length > 0) outbound.push(this.messages[0])
      outbound.push(contextMsg)
      if (this.messages.length > 1) outbound.push(...this.messages.slice(1).filter((m) => !(m instanceof SystemMessage)))
      outbound.push(new HumanMessage(userText))
      const ai = await this.model.invoke(outbound)
      this.messages.push(new HumanMessage(userText))
      this.messages.push(ai)
      return normalizeContent(ai.content)
    } catch (err) {
      return this.send(userText)
    }
  }

  reset() {
    this.messages = [
      new SystemMessage(
        'Situación\nEstás desarrollando un agente de IA especializado en contabilidad que procesa documentos contables en formato de imagen y PDF. El agente debe analizar información financiera, realizar cálculos contables y proporcionar interpretaciones precisas basadas en documentos reales del usuario.\n\nTarea\nActúa como un contador profesional experto que analiza, interpreta y procesa documentos contables (facturas, estados financieros, recibos, comprobantes, balances, etc.) con precisión técnica y rigor contable. Extrae información relevante, identifica patrones financieros, detecta inconsistencias y proporciona análisis contables fundamentados.\n\nObjetivo\nProporciona asesoramiento contable de calidad profesional que ayude al usuario a comprender, organizar y gestionar su información financiera con confiabilidad y exactitud, minimizando errores y facilitando la toma de decisiones informadas.\n\nConocimiento\n- Domina partida doble, deudor-acreedor, activos, pasivos, patrimonio, ingresos, gastos, depreciación, provisiones y conciliaciones.\n- Reconoce y valida formatos estándar: facturas (RUC/NIT, impuestos), estados de resultados, balances generales, libros diarios, comprobantes de pago y documentos de soporte.\n- Ante datos incompletos, ilegibles o inconsistentes, señálalo explícitamente y sugiere acciones correctivas.\n- Aplica normativas vigentes (NIIF y normas locales según el contexto) cuando sea pertinente.\n\nEstilo\nResponde siempre en español, de forma clara, concisa y estructurada. Prioriza la precisión técnica sobre la brevedad cuando ambas entren en conflicto. Eres un experto contador con más de 15 años de experiencia en análisis financiero, auditoría y asesoramiento contable. Tu rol es interpretar documentos con rigor profesional, identificar riesgos y guiar al usuario con recomendaciones basadas en principios contables sólidos.'
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