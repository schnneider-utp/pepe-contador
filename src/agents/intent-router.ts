import { normalizeText } from "@/agents/utils";

export type IntentAction = "file_upload" | "secondary_upload" | "history" | null;

export interface IntentResult {
  action: IntentAction;
  guide?: string;
}

const FILE_UPLOAD_KEYWORDS = [
  "factura",
  "facturas",
  "imagen",
  "imágenes",
  "imagenes",
  "foto",
  "fotos",
];

const DOC_UPLOAD_KEYWORDS = ["documento", "documentos", "doc", "docs", "pdf"];

const HISTORY_KEYWORDS = [
  "historial",
  "ver documentos",
  "documentos subidos",
  "ya se subieron",
  "subidos",
];

export function detectIntent(message: string): IntentResult {
  const text = normalizeText(message);

  const includesAny = (arr: string[]) => arr.some((k) => text.includes(k));

  if (includesAny(HISTORY_KEYWORDS)) {
    return {
      action: "history",
      guide:
        "Abriendo la sección de documentos ya subidos. Sigue las indicaciones en pantalla para revisar el historial.",
    };
  }

  const mentionsUpload = text.includes("subir") || text.includes("cargar") || text.includes("adjuntar") || text.includes("analizar") || text.includes("procesar");

  if (mentionsUpload && includesAny(FILE_UPLOAD_KEYWORDS)) {
    return {
      action: "file_upload",
      guide:
        "Te llevo a la sección para subir imágenes o facturas. Sigue los pasos para seleccionar y subir tus archivos.",
    };
  }

  if (mentionsUpload && includesAny(DOC_UPLOAD_KEYWORDS)) {
    return {
      action: "secondary_upload",
      guide:
        "Te llevo a la sección para subir documentos. Usa el selector para elegir tus archivos y confirmar la subida.",
    };
  }

  return { action: null };
}