<table>
  <tr>
    <td align="center" width="42%">
      <img src="public/Pepe%20contador.png" alt="Pepe Contador" width="360" />
    </td>
    <td align="left">
      <h1>Pepe Contador</h1>
      <p><em>Gestión de archivos y procesos contables con IA y RAG</em></p>
      <p>
        <img alt="Next.js" src="https://img.shields.io/badge/Next.js-000000?logo=next.js&logoColor=white" />
        <img alt="React" src="https://img.shields.io/badge/React-20232a?logo=react&logoColor=61DAFB" />
        <img alt="TypeScript" src="https://img.shields.io/badge/TypeScript-3178C6?logo=typescript&logoColor=white" />
        <img alt="Tailwind CSS" src="https://img.shields.io/badge/Tailwind%20CSS-06B6D4?logo=tailwindcss&logoColor=white" />
        <br/>
        <img alt="Radix UI" src="https://img.shields.io/badge/Radix%20UI-161618" />
        <img alt="LangChain" src="https://img.shields.io/badge/LangChain-0B3D91" />
        <img alt="Google Generative AI" src="https://img.shields.io/badge/Google%20Generative%20AI-4285F4?logo=google&logoColor=white" />
        <img alt="Supabase" src="https://img.shields.io/badge/Supabase-3ECF8E?logo=supabase&logoColor=white" />
        <img alt="pgvector" src="https://img.shields.io/badge/pgvector-3581B8?logo=postgresql&logoColor=white" />
      </p>
      <p>
        <a href="#instalación">Instalación</a> • <a href="#uso">Uso</a> • <a href="#variables-de-entorno-env">.env</a>
      </p>
    </td>
  </tr>
</table>

# Pepe Contador

Aplicación web para: subir archivos a Google Drive, activar procesos contables vía webhooks, gestionar un chat contable con IA y usar RAG sobre documentos subidos.

## Stack Tecnológico
- Framework: Next.js 15, React 19, TypeScript
- UI: Radix UI, Tailwind CSS
- IA: LangChain (`@langchain/core`, `@langchain/google-genai`)
  - Modelo: `gemini-2.0-flash` (chat)
  - Embeddings: `text-embedding-004` (RAG)
- RAG: Supabase + `pgvector`
- PDF: `pdf-parse`, `pdfjs-dist`

## Arquitectura
- Chat y agentes:
  - `src/agents/chatbot.ts` administra el historial y decide si usar RAG
  - `src/components/chat.tsx` UI del chat con spinner y guía de órdenes
  - Orquestador de órdenes de UI vía intención: `src/agents/orchestrator.ts`, `src/agents/intent-router.ts`, `src/agents/ui-actions.ts`
- Subida de archivos:
  - Gastos: `src/components/file-upload-section.tsx` → `/api/trigger-gastos`
  - Ingresos: `src/components/secondary-upload-section.tsx` → `/api/trigger-ingresos`
  - Historial: `src/components/accounting-trigger-section.tsx` (usa `localStorage`)
- RAG y documentos:
  - Extracción/ingesta/consulta: `src/app/api/rag/{extract, ingest, query}/route.ts`
  - Uploader de documentos con embeddings: `src/components/user-rag-uploader.tsx`
- Menú principal y secciones:
  - Tabs: `src/components/app-tabs-controller.tsx` (Subir Gastos, Subir Ingresos, Historial)

## Agentes de IA
- Chat contable:
  - Mantiene el mensaje del sistema como primero
  - Heurística para rapidez: saludos y preguntas simples responden sin RAG
  - RAG solo cuando el prompt lo amerita (referencias a documento, texto largo)
  - Citas de fragmentos en respuestas con RAG

## Endpoints API
- Subida y procesos:
  - `POST /api/trigger-gastos` (webhook de gastos)
  - `POST /api/trigger-ingresos` (webhook de ingresos)
- RAG:
  - `POST /api/rag/extract` extrae texto de PDF/MD/Texto
  - `POST /api/rag/ingest` ingesta chunks con embeddings en Supabase
  - `POST /api/rag/query` consulta vectorial vía RPC `match_chunks`

## Variables de Entorno (.env)
Configura estas variables en `.env.local` o `.env`:

- `SUPABASE_URL` URL de tu proyecto Supabase
- `SUPABASE_ANON_KEY` llave pública de Supabase (rol anon)
- `MAKE_WEBHOOK_GASTOS_URL` webhook para gastos
- `MAKE_WEBHOOK_INGRESOS_URL` webhook para ingresos

El chat usa tu API key de Gemini ingresada en el cliente. No se guarda en el servidor.

## Instalación
1. Requisitos
   - Node.js 18 o superior
   - Cuenta y proyecto en Supabase con `pgvector`

2. Instalación
   ```bash
   npm install
   ```

3. Desarrollo
   ```bash
   npm run dev
   ```
   Abre `http://localhost:3000`.


## Uso
- Activar chat
  - Ingresa tu API key de Gemini en el panel del chat
  - Saludos responden al instante; preguntas contables responden rápido; RAG se activa cuando el prompt requiere contexto del documento

- Subir gastos
  - Pestaña “Subir Gastos” → selecciona o arrastra imágenes/facturas
  - Envía al webhook definido en `MAKE_WEBHOOK_GASTOS_URL`
  - Se registra en el historial local

- Subir ingresos
  - Pestaña “Subir Ingresos” → selecciona o arrastra documentos/PDF
  - Envía al webhook definido en `MAKE_WEBHOOK_INGRESOS_URL`
  - Se registra en el historial local

- RAG sobre documentos
  - Usa el panel “Cargar documento” (UserRagUploader)
  - Se extrae texto, se generan embeddings (768 dims) y se ingesta en Supabase
  - El chat utilizará fragmentos relevantes al preguntar por contenido del documento

## Configuración rápida de Supabase (RAG)
Asegúrate de tener:
- Tabla `documents` y `chunks` con `embedding vector(768)`
- Función RPC `public.match_chunks` que reciba `query_embedding`, `match_count`, `similarity_threshold` y opcional `document_id`

## Esquema Postgres (copiar y pegar)
```sql
create extension if not exists vector;
create extension if not exists pgcrypto;

create table if not exists public.documents (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  source_url text,
  metadata jsonb,
  created_at timestamp with time zone default now()
);

drop table if exists public.chunks cascade;

create table public.chunks (
  id uuid primary key default gen_random_uuid(),
  document_id uuid not null references public.documents(id) on delete cascade,
  content text not null,
  embedding vector(768) not null,
  metadata jsonb
);

create index if not exists chunks_embedding_idx
  on public.chunks using ivfflat (embedding vector_cosine_ops);

create index if not exists chunks_document_id_idx
  on public.chunks (document_id);

create or replace function public.match_chunks(
  query_embedding vector(768),
  match_count integer default 5,
  similarity_threshold float default 0.3,
  document_id uuid default null
)
returns table (
  content text,
  metadata jsonb,
  document_id uuid,
  similarity float
)
language sql stable as $$
  select
    c.content,
    c.metadata,
    c.document_id,
    1 - (c.embedding <=> query_embedding) as similarity
  from public.chunks c
  where (document_id is null or c.document_id = document_id)
    and (1 - (c.embedding <=> query_embedding)) >= similarity_threshold
  order by c.embedding <=> query_embedding asc
  limit match_count;
$$;
```

## Scripts
- `npm run dev` desarrollo
- `npm run build` build de producción
- `npm run start` servidor de producción
- `npm run lint` linting (opcional)

## Notas
- El mensaje del sistema va siempre primero en el prompt del modelo
- La heurística de `ChatService` evita RAG en saludos y preguntas simples para mantener velocidad
- Los webhooks se leen desde variables de entorno y no se exponen en el cliente