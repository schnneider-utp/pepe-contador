import { NextResponse } from "next/server"
import { createClient } from "@supabase/supabase-js"

export const runtime = "nodejs"

export async function POST(req: Request) {
  try {
    if (!process.env.SUPABASE_URL || !process.env.SUPABASE_ANON_KEY) {
      console.error("rag:query:env_missing", { url: !!process.env.SUPABASE_URL, key: !!process.env.SUPABASE_ANON_KEY })
      return NextResponse.json({ error: "missing_supabase_env" }, { status: 500 })
    }
    const { embedding, top_k, document_id, similarity_threshold } = await req.json()
    const vec = Array.isArray(embedding) ? embedding : []
    const dims = vec.length
    const numeric = vec.every((n: any) => typeof n === "number")
    if (dims !== 768 || !numeric) {
      console.error("rag:query:invalid_embedding", { dims, numeric })
      return NextResponse.json({ error: "invalid_embedding" }, { status: 400 })
    }
    const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_ANON_KEY)
    const count = typeof top_k === "number" && top_k > 0 && top_k <= 50 ? top_k : 5
    const threshold = typeof similarity_threshold === "number" ? similarity_threshold : 0.3

    const params: any = { query_embedding: vec, match_count: count, similarity_threshold: threshold }
    if (document_id) params.document_id = document_id

    const { data, error } = await supabase.rpc("match_chunks", params)
    if (error) {
      console.error("rag:query:rpc_error", { message: error.message, code: (error as any)?.code })
      return NextResponse.json({ error: error.message }, { status: 500 })
    }
    const items = Array.isArray(data) ? data : []
    console.log("rag:query:ok", { count: items.length })
    return NextResponse.json({ matches: items })
  } catch (e: any) {
    console.error("rag:query:error", { message: e?.message, stack: e?.stack })
    return NextResponse.json({ error: e?.message || "query_error" }, { status: 500 })
  }
}