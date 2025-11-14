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
  private modelName: string

  constructor(opts: ChatbotOptions) {
    const { apiKey, modelName = 'gemini-2.0-flash', temperature = 0.2 } = opts
    this.model = new ChatGoogleGenerativeAI({ apiKey, model: modelName, temperature })
    this.apiKey = apiKey
    this.modelName = modelName
    this.messages = [
      new SystemMessage(
        'Situación\nEstás desarrollando un agente de IA especializado en contabilidad colombiana que procesa documentos contables en formato de imagen y PDF. El agente debe analizar información financiera, realizar cálculos contables y proporcionar interpretaciones precisas basadas en documentos reales del usuario.\n\nTarea\nActúa como un contador profesional experto que analiza, interpreta y procesa documentos contables (facturas, estados financieros, recibos, comprobantes, balances, etc.) con precisión técnica y rigor contable. Extrae información relevante, identifica patrones financieros, detecta inconsistencias y proporciona análisis contables fundamentados.\n\nObjetivo\nProporciona asesoramiento contable de calidad profesional que ayude al usuario a comprender, organizar y gestionar su información financiera con confiabilidad y exactitud, minimizando errores y facilitando la toma de decisiones informadas.\n\nConocimiento\n- Domina partida doble, deudor-acreedor, activos, pasivos, patrimonio, ingresos, gastos, depreciación, provisiones y conciliaciones.\n- Reconoce y valida formatos estándar: facturas (RUC/NIT, impuestos), estados de resultados, balances generales, libros diarios, comprobantes de pago y documentos de soporte.\n- Ante datos incompletos, ilegibles o inconsistentes, señálalo explícitamente y sugiere acciones correctivas.\n- Aplica normativas vigentes (NIIF y normas locales según el contexto) cuando sea pertinente.\n\nEstilo\nResponde siempre en español, de forma clara, concisa y estructurada. Prioriza la precisión técnica sobre la brevedad cuando ambas entren en conflicto. Eres un experto contador en análisis financiero, auditoría y asesoramiento contable. Tu rol es interpretar documentos con rigor profesional, identificar riesgos y guiar al usuario con recomendaciones basadas en principios contables sólidos segun la ley colombiana, caudno se te haga alguna pregunta contable de primera mano respondo segun lo que dice la ey colombiana o lo que diga la DIAN.'
      ),
      new SystemMessage(
        'Guardrails\n- Usa solo la información disponible en el contexto proporcionado o en el mensaje del usuario.\n- Si falta información, dilo explícitamente y no inventes datos.\n- Marca los campos faltantes como "No encontrado".\n- Cuando se use RAG, cita los fragmentos utilizados con sus índices.\n- Responde siempre en español y en el formato solicitado.\n- Si el tema no es contable, redirige en una sola línea.\n- No te presentes como profesional humano; aclara que la respuesta es generada por IA.'
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

  private isAccountingQuery(userText: string): boolean {
    const t = userText.toLowerCase()
    return /(contab|factur|estado|balance|comprobante|recibo|egreso|ingreso|patrimonio|activo|pasivo|depreciaci|provisi|niif|impuesto|iva|retenci[oó]n|dian|rut|nit|nómina|auditor|conciliaci|asiento|partida|cost[o]?|gasto|flujo de caja|declaraci[oó]n|renta)/.test(t)
  }

  private computeTemperature(userText: string): number {
    const t = userText.toLowerCase()
    const extraction = /(extrae|extraer|valor|importe|monto|total|subtotal|iva|retenci[oó]n|cop|n[ií]mero|sum[a]?|balance|asiento|partida)/.test(t)
    return extraction ? 0.1 : 0.2
  }

  private computeMaxTokens(userText: string): number {
    const t = userText.toLowerCase()
    const extraction = /(extrae|extraer|valor|importe|monto|total|subtotal|iva|retenci[oó]n|cop|n[ií]mero|sum[a]?|balance|asiento|partida)/.test(t)
    const guidance = /(c[oó]mo|como|gu[ií]a|pasos|proceso|generar|hacer).*(declaraci[oó]n|renta|impuesto|balance|estado|factura|conciliaci[oó]n)/.test(t)
    if (extraction) return 1024
    if (guidance) return 2048
    return 1024
  }

  private hasCitations(text: string): boolean {
    return /fragmentos usados\s*:/i.test(text)
  }

  private isExplanation(userText: string): boolean {
    const t = userText.toLowerCase()
    return /(que es|qué es|definici[oó]n|explica|expl[ií]came|describir|describe)/.test(t)
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
      if (!this.isAccountingQuery(userText)) {
        const brief = 'Responde en un maximo de 5 líneas: "Aclara brevemente que la respuesta es generada por IA y que tu enfoque principal es contable; ofrece reconducir la conversación hacia un objetivo contable si el usuario lo desea.".'
        return this.send(`${userText}\n\n${brief}`)
      }
      return this.send(userText)
    }
    return this.sendRag(userText)
  }

  async send(userText: string): Promise<string> {
    /* Monitoreo deshabilitado temporalmente
    const t0 = Date.now()
    */
    const outbound: BaseMessage[] = []
    if (this.messages.length > 0) outbound.push(this.messages[0])
    if (this.messages.length > 1) outbound.push(...this.messages.slice(1).filter((m) => !(m instanceof SystemMessage)))
    outbound.push(new HumanMessage(userText))
    const t = userText.toLowerCase()
    const nonAccounting = !this.isAccountingQuery(userText)
    const guidance = /(c[oó]mo|como|gu[ií]a|pasos|proceso|generar|hacer).*(declaraci[oó]n|renta|impuesto|balance|estado|factura|conciliaci[oó]n)/.test(t)
    if (guidance) {
      outbound.push(
        new HumanMessage(
          'Responde de forma concisa y estructurada: máximo 8 viñetas claras, con secciones "Requisitos", "Pasos", "Advertencias" y "Siguientes acciones". Evita saturar al usuario y ofrece ampliar detalles solo si se solicita.'
        )
      )
    }
    if (this.isExplanation(userText)) {
      outbound.push(
        new HumanMessage(
          'Estructura la respuesta con: una línea de definición y luego 3–5 viñetas con Funciones, Ámbito y Puntos clave. Usa saltos de línea y viñetas.'
        )
      )
    }
    if (nonAccounting) {
      outbound.push(
        new HumanMessage(
          'Aclara brevemente que la respuesta es generada por IA y que tu enfoque principal es contable; ofrece reconducir la conversación hacia un objetivo contable si el usuario lo desea.'
        )
      )
    }
    const lm = new ChatGoogleGenerativeAI({ apiKey: this.apiKey, model: this.modelName, temperature: this.computeTemperature(userText), maxOutputTokens: this.computeMaxTokens(userText) })
    const ai = await lm.invoke(outbound)
    this.messages.push(new HumanMessage(userText))
    this.messages.push(ai)
    const reply = normalizeContent(ai.content)
    /* Monitoreo deshabilitado temporalmente
    const t1 = Date.now()
    try {
      await fetch('/api/monitor/log', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ used_rag: false, user_text: userText, model_reply: reply, model: 'gemini-2.0-flash', latency_ms: t1 - t0 })
      })
    } catch {}
    */
    return reply
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
        `Contexto del documento:\n\n${context}\n\nUsa este contexto para responder con precisión. Si no es suficiente, indica qué falta y solicita más detalles. Al final incluye: "Fragmentos usados: {lista de índices}" y no agregues información fuera del contexto.`
      )
      /* Monitoreo deshabilitado temporalmente
      const t0 = Date.now()
      */
      const outbound: BaseMessage[] = []
      if (this.messages.length > 0) outbound.push(this.messages[0])
      outbound.push(contextMsg)
      if (this.messages.length > 1) outbound.push(...this.messages.slice(1).filter((m) => !(m instanceof SystemMessage)))
      outbound.push(new HumanMessage(userText))
      const t = userText.toLowerCase()
      const guidance = /(c[oó]mo|como|gu[ií]a|pasos|proceso|generar|hacer).*(declaraci[oó]n|renta|impuesto|balance|estado|factura|conciliaci[oó]n)/.test(t)
      if (guidance) {
        outbound.push(
          new HumanMessage(
            'Responde de forma concisa y estructurada: máximo 8 viñetas claras, con secciones "Requisitos", "Pasos", "Advertencias" y "Siguientes acciones". Usa únicamente los fragmentos citados.'
          )
        )
      }
      if (this.isExplanation(userText)) {
        outbound.push(
          new HumanMessage(
            'Estructura la respuesta con: una línea de definición y luego 3–5 viñetas con Funciones, Ámbito y Puntos clave. Usa solo el contexto citado.'
          )
        )
      }
      const lm = new ChatGoogleGenerativeAI({ apiKey: this.apiKey, model: this.modelName, temperature: this.computeTemperature(userText), maxOutputTokens: this.computeMaxTokens(userText) })
      let ai = await lm.invoke(outbound)
      this.messages.push(new HumanMessage(userText))
      this.messages.push(ai)
      let reply = normalizeContent(ai.content)
      if (!this.hasCitations(reply)) {
        const correction = new HumanMessage('Corrige la respuesta: incluye "Fragmentos usados: {índices}" y no agregues información fuera del contexto.')
        const retryOutbound: BaseMessage[] = []
        if (this.messages.length > 0) retryOutbound.push(this.messages[0])
        retryOutbound.push(contextMsg)
        retryOutbound.push(...this.messages.slice(1).filter((m) => !(m instanceof SystemMessage)))
        retryOutbound.push(new HumanMessage(userText))
        retryOutbound.push(correction)
        ai = await lm.invoke(retryOutbound)
        reply = normalizeContent(ai.content)
      }
      /* Monitoreo deshabilitado temporalmente
      const t1 = Date.now()
      try {
        await fetch('/api/monitor/log', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ used_rag: true, user_text: userText, model_reply: reply, model: 'gemini-2.0-flash', latency_ms: t1 - t0, fragment_count: matches.length })
        })
      } catch {}
      */
      return reply
    } catch (err) {
      return this.send(userText)
    }
  }

  reset() {
    this.messages = [
      new SystemMessage(
        'Situación\nEstás desarrollando un agente de IA especializado en contabilidad que procesa documentos contables en formato de imagen y PDF. El agente debe analizar información financiera, realizar cálculos contables y proporcionar interpretaciones precisas basadas en documentos reales del usuario.\n\nTarea\nActúa como un contador profesional experto que analiza, interpreta y procesa documentos contables (facturas, estados financieros, recibos, comprobantes, balances, etc.) con precisión técnica y rigor contable. Extrae información relevante, identifica patrones financieros, detecta inconsistencias y proporciona análisis contables fundamentados.\n\nObjetivo\nProporciona asesoramiento contable de calidad profesional que ayude al usuario a comprender, organizar y gestionar su información financiera con confiabilidad y exactitud, minimizando errores y facilitando la toma de decisiones informadas.\n\nConocimiento\n- Domina partida doble, deudor-acreedor, activos, pasivos, patrimonio, ingresos, gastos, depreciación, provisiones y conciliaciones.\n- Reconoce y valida formatos estándar: facturas (RUC/NIT, impuestos), estados de resultados, balances generales, libros diarios, comprobantes de pago y documentos de soporte.\n- Ante datos incompletos, ilegibles o inconsistentes, señálalo explícitamente y sugiere acciones correctivas.\n- Aplica normativas vigentes (NIIF y normas locales según el contexto) cuando sea pertinente.\n\nEstilo\nResponde siempre en español, de forma clara, concisa y estructurada. Prioriza la precisión técnica sobre la brevedad cuando ambas entren en conflicto. Eres un experto contador con más de 15 años de experiencia en análisis financiero, auditoría y asesoramiento contable. Tu rol es interpretar documentos con rigor profesional, identificar riesgos y guiar al usuario con recomendaciones basadas en principios contables sólidos.'
      ),
      new SystemMessage(
        'Guardrails\n- Usa solo la información disponible en el contexto proporcionado o en el mensaje del usuario.\n- Si falta información, dilo explícitamente y no inventes datos.\n- Marca los campos faltantes como "No encontrado".\n- Cuando se use RAG, cita los fragmentos utilizados con sus índices.\n- Responde siempre en español y en el formato solicitado.\n- Si el tema no es contable, redirige en una sola línea.\n- No te presentes como profesional humano; aclara que la respuesta es generada por IA.'
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