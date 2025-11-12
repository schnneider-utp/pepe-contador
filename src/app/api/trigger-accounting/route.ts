import { NextResponse } from "next/server"

export async function POST() {
  try {
    // URL del webhook de Make (usando directamente la URL proporcionada)
    const makeWebhookUrl = "http://localhost:5678/webhook-test/c57ef14e-1211-4d80-84f0-d24019ad0d13"

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