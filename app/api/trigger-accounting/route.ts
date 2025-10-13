import { NextResponse } from "next/server"

export async function POST() {
  try {
    // URL del webhook de Make (deberás configurar esto)
    const makeWebhookUrl = process.env.MAKE_WEBHOOK_URL

    if (!makeWebhookUrl) {
      console.error("[v0] MAKE_WEBHOOK_URL not configured")
      return NextResponse.json(
        { error: "Webhook no configurado. Por favor configura MAKE_WEBHOOK_URL en las variables de entorno." },
        { status: 500 },
      )
    }

    // Enviar trigger a Make
    const response = await fetch(makeWebhookUrl, {
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

    if (!response.ok) {
      throw new Error("Error al comunicarse con Make")
    }

    const data = await response.json().catch(() => ({}))

    return NextResponse.json({
      success: true,
      message: "Proceso contable activado correctamente",
      data,
    })
  } catch (error) {
    console.error("[v0] Error triggering accounting process:", error)
    return NextResponse.json({ error: "Error al activar el proceso contable" }, { status: 500 })
  }
}
