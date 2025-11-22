import { NextResponse } from "next/server"
import * as XLSX from "xlsx"

export async function POST(req: Request) {
    try {
        const formData = await req.formData()
        const file = formData.get("file") as File

        if (!file) {
            return NextResponse.json({ error: "No file provided" }, { status: 400 })
        }

        // Leer el archivo Excel
        const arrayBuffer = await file.arrayBuffer()
        const workbook = XLSX.read(arrayBuffer, { type: "array" })

        // Extraer texto de todas las hojas
        const sheets: Array<{ name: string; content: string }> = []
        let allText = ""

        for (const sheetName of workbook.SheetNames) {
            const worksheet = workbook.Sheets[sheetName]

            // Convertir la hoja a JSON para procesarla
            const jsonData: any[] = XLSX.utils.sheet_to_json(worksheet, { header: 1, defval: "" })

            // Convertir cada fila a texto
            const sheetText = jsonData
                .map((row: any[]) => {
                    // Filtrar celdas vacías y unir con " | "
                    return row
                        .filter((cell) => cell !== null && cell !== undefined && cell !== "")
                        .join(" | ")
                })
                .filter((line) => line.trim().length > 0)
                .join("\n")

            if (sheetText.trim().length > 0) {
                sheets.push({
                    name: sheetName,
                    content: sheetText,
                })

                // Agregar al texto completo con encabezado de hoja
                allText += `\n\n=== HOJA: ${sheetName} ===\n\n${sheetText}`
            }
        }

        return NextResponse.json({
            text: allText.trim(),
            sheets: sheets.length,
            sheetNames: workbook.SheetNames,
            details: sheets,
        })
    } catch (error: any) {
        console.error("excel:extract:error", { message: error?.message, stack: error?.stack })
        return NextResponse.json({ error: error?.message || "Error extracting Excel" }, { status: 500 })
    }
}
