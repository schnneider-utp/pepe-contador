import { NextResponse } from "next/server"

export async function POST(req: Request) {
  try {
    const makeWebhookUrl = process.env.MAKE_WEBHOOK_INGRESOS_URL
    if (!makeWebhookUrl) {
      return NextResponse.json({ error: "missing_make_webhook_ingresos_url" }, { status: 500 })
    }

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
      outForm.append("action", "subir_ingresos")
      if (!outForm.has("source")) outForm.append("source", "web_app")

      response = await fetch(makeWebhookUrl, {
        method: "POST",
        body: outForm,
      })
    } else {
      response = await fetch(makeWebhookUrl, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          timestamp: new Date().toISOString(),
          action: "subir_ingresos",
          source: "web_app",
        }),
      })
    }

    if (!response.ok) {
      throw new Error("Error al comunicarse con Make (ingresos)")
    }

    const responseText = await response.text()
    return NextResponse.json({ success: true, message: "Ingresos enviados", response: responseText })
  } catch (error) {
    console.error("[v0] Error triggering ingresos:", error)
    return NextResponse.json({ error: "Error al enviar ingresos" }, { status: 500 })
  }
}