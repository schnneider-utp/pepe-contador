/*
// Monitoreo deshabilitado temporalmente
import { NextResponse } from "next/server"
import { createClient } from "@supabase/supabase-js"

export async function POST(req: Request) {
  try {
    const body = await req.json()
    const url = process.env.SUPABASE_URL
    const key = process.env.SUPABASE_ANON_KEY
    if (!url || !key) {
      return NextResponse.json({ ok: false, error: "missing_supabase_env" }, { status: 500 })
    }
    const supabase = createClient(url, key)
    const payload = {
      created_at: new Date().toISOString(),
      used_rag: !!body.used_rag,
      user_text: String(body.user_text || ""),
      model_reply: String(body.model_reply || ""),
      model: String(body.model || ""),
      latency_ms: typeof body.latency_ms === "number" ? body.latency_ms : null,
      fragment_count: typeof body.fragment_count === "number" ? body.fragment_count : null,
    }
    const { error } = await supabase.from("chat_logs").insert([payload])
    if (error) {
      return NextResponse.json({ ok: false, error: error.message }, { status: 500 })
    }
    return NextResponse.json({ ok: true })
  } catch (err) {
    return NextResponse.json({ ok: false, error: String(err) }, { status: 500 })
  }
}
*/