import { NextResponse } from "next/server"
import { createClient } from "@supabase/supabase-js"

export async function POST(req: Request) {
  if (!process.env.SUPABASE_URL || !process.env.SUPABASE_ANON_KEY) {
    console.error("rag:ingest:env_missing", { url: !!process.env.SUPABASE_URL, key: !!process.env.SUPABASE_ANON_KEY })
    return NextResponse.json({ error: "missing_supabase_env" }, { status: 500 })
  }
  const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_ANON_KEY)
  const { title, metadata, chunks, document_id } = await req.json()
  let docId = document_id as string | undefined
  if (!docId) {
    if (!title) return NextResponse.json({ error: "missing_title" }, { status: 400 })
    docId = crypto.randomUUID()
    const { error: dErr } = await supabase.from("documents").insert([{ id: docId, title, metadata }])
    if (dErr) {
      console.error("rag:ingest:doc_error", { message: dErr.message, code: (dErr as any)?.code })
      return NextResponse.json({ error: dErr.message }, { status: 500 })
    }
    console.log("rag:ingest:create", { document_id: docId, title })
  }

  const list = Array.isArray(chunks) ? chunks : []
  if (list.length > 0) {
    const rows = list.map((c: { content: string; embedding: number[]; metadata?: any }) => ({
      document_id: docId!,
      content: c.content,
      embedding: c.embedding,
      metadata: c.metadata ?? metadata,
    }))
    const dims = Array.isArray(rows[0]?.embedding) ? rows[0].embedding.length : null
    const numeric = Array.isArray(rows[0]?.embedding) ? rows[0].embedding.every((n: any) => typeof n === "number") : false
    console.log("rag:ingest:validate", { document_id: docId, count: rows.length, dims, numeric })
    if (dims !== 768 || !numeric) {
      console.error("rag:ingest:invalid_embedding", { dims, numeric })
      return NextResponse.json({ error: "invalid_embedding" }, { status: 400 })
    }
    const { error: cErr } = await supabase.from("chunks").insert(rows)
    if (cErr) {
      console.error("rag:ingest:supabase_error", { message: cErr.message, code: (cErr as any)?.code })
      return NextResponse.json({ error: cErr.message }, { status: 500 })
    }
    console.log("rag:ingest:insert", { document_id: docId, count: rows.length })
    return NextResponse.json({ document_id: docId, indexed_count: rows.length })
  }

  return NextResponse.json({ document_id: docId, indexed_count: 0 })
}