import { NextResponse } from "next/server"

export async function POST(req: Request) {
  try {
    // URL del webhook de Make (usando directamente la URL proporcionada)
    const makeWebhookUrl = "http://localhost:5678/webhook-test/c57ef14e-1211-4d80-84f0-d24019ad0d13"

    const contentType = req.headers.get("content-type") || ""
    let response: Response

    if (contentType.includes("multipart/form-data")) {
      const inForm = await req.formData()
      const outForm = new FormData()

      for (const [key, value] of inForm.entries()) {
        if (value instanceof File) {
          outForm.append(key, value, value.name)
        } else {
          outForm.append(key, String(value))
        }
      }

      outForm.append("timestamp", new Date().toISOString())
      outForm.append("action", "trigger_accounting_process")
      outForm.append("source", "web_app")

      response = await fetch(makeWebhookUrl, {
        method: "POST",
        body: outForm,
      })
    } else {
      response = await fetch(makeWebhookUrl, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          timestamp: new Date().toISOString(),
          action: "trigger_accounting_process",
          source: "web_app",
        }),
      })
    }

    if (!response.ok) {
      throw new Error("Error al comunicarse con Make")
    }

    const responseText = await response.text()
    console.log("[v0] Make webhook response:", responseText)

    return NextResponse.json({
      success: true,
      message: "Proceso contable activado correctamente",
      response: responseText,
    })
  } catch (error) {
    console.error("[v0] Error triggering accounting process:", error)
    return NextResponse.json({ error: "Error al activar el proceso contable" }, { status: 500 })
  }
}