import { NextResponse } from "next/server"
import { PDFParse } from "pdf-parse"

export const runtime = "nodejs"

export async function POST(req: Request) {
  const form = await req.formData()
  const file = form.get("file") as File | null
  if (!file) return NextResponse.json({ error: "missing_file" }, { status: 400 })
  const buf = Buffer.from(await file.arrayBuffer())
  try {
    console.log("rag:extract:start", { size: buf.length })
    const parser = new PDFParse({ data: buf })
    const result = await parser.getText()
    const pages = (result.numpages as number) || undefined
    console.log("rag:extract:success", { pages, length: result.text?.length })
    return NextResponse.json({ text: result.text, pages })
  } catch (e: any) {
    console.error("rag:extract:error", { message: e?.message, stack: e?.stack })
    return NextResponse.json({ error: e?.message || "parse_error" }, { status: 500 })
  }
}