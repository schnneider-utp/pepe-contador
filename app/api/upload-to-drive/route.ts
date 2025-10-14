import { type NextRequest, NextResponse } from "next/server"

const WEBHOOK_URL = "https://hook.us2.make.com/hv6tie5an1bma04wpj0dssc8b13ooeqo"

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData()
    const files = formData.getAll("files") as File[]

    if (files.length === 0) {
      return NextResponse.json({ error: "No se proporcionaron archivos" }, { status: 400 })
    }

    // Crear nombre de carpeta basado en la fecha actual
    const now = new Date()
    const folderName = `${now.getDate()} de ${now.toLocaleString("es-ES", { month: "long" })} ${now.getFullYear()}`

    console.log("[v0] Preparando archivos para enviar al webhook:", folderName)
    console.log("[v0] Número de archivos:", files.length)

    // Crear un nuevo FormData para enviar al webhook
    const webhookFormData = new FormData()
    
    // Agregar cada archivo al FormData
    for (const file of files) {
      webhookFormData.append("files", file)
    }

    // Agregar información adicional
    webhookFormData.append("folderName", folderName)
    webhookFormData.append("timestamp", now.toISOString())

    // Enviar archivos al webhook
    const response = await fetch(WEBHOOK_URL, {
      method: "POST",
      body: webhookFormData,
    })

    if (!response.ok) {
      throw new Error(`Error al enviar archivos al webhook: ${response.statusText}`)
    }

    const webhookResponse = await response.text()

    return NextResponse.json({
      success: true,
      folderName,
      filesUploaded: files.length,
      message: "Archivos enviados correctamente al webhook",
      webhookResponse
    })
  } catch (error) {
    console.error("[v0] Error al enviar archivos al webhook:", error)
    return NextResponse.json({ 
      error: "Error al procesar la solicitud",
      details: error instanceof Error ? error.message : "Error desconocido"
    }, { status: 500 })
  }
}
