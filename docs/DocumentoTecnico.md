
# **Proyecto Final – Introducción a la Inteligencia Artificial**

# **Sistema de Gestión Contable Automatizado con IA**

### **Integrantes del equipo:**

**Wilson Andres Henao,**
**Jean Schnneider Arias Suares y**
**Juan Esteban Jaramillo Cano**

### **Tecnologías utilizadas:**

Next.js · TypeScript · Supabase · LangChain · Google Gemini · n8n · Google Drive · Google Sheets

---

<div align="center">

## **Documento Técnico**

### **Asistente Contable Inteligente con Automatización y RAG**

#### *Optimización de procesos contables mediante IA generativa y flujos automatizados*

</div>

---

# **Contenido**

1. [Introducción](#-1-introducción)
2. [Problema a resolver](#-2-problema-a-resolver)
3. [Metodología](#-3-metodología)
4. [Arquitectura de agentes](#-4-arquitectura-de-agentes)
5. [Resultados y conclusiones](#-5-resultados-y-conclusiones)
6. [Trabajo futuro](#-6-trabajo-futuro)

---

# **1. Introducción**

Este proyecto presenta un **asistente contable automatizado con Inteligencia Artificial**, diseñado para procesar facturas, comprobantes de pago y documentos financieros, extraer su información relevante y registrarla automáticamente.

Además, incorpora un sistema **RAG (Retrieval-Augmented Generation)** que permite realizar consultas inteligentes sobre documentos cargados por el usuario.

El objetivo principal es **demostrar cómo la IA moderna puede integrarse en flujos contables reales**, reduciendo tiempos y errores.

---

# **2. Problema a resolver**

Los procesos contables manuales enfrentan dificultades como:

* Transcripción manual de datos desde facturas e imágenes.
* Errores humanos en los montos, fechas y cálculos.
* Tiempo perdido organizando documentos.
* Dificultad al buscar información en documentos antiguos.

Este proyecto busca **automatizar la extracción, registro y consulta de información contable**, creando un sistema inteligente completamente funcional.

---

# **3. Metodología**

## **1. Extracción de contenido**

* El usuario sube **PDFs, imágenes o documentos** desde la interfaz web.
* Dependiendo del tipo de proceso:

  * Gastos → Agente de Gastos (n8n)
  * Ingresos → Agente de Ingresos (n8n)
  * Documentos generales → Sistema RAG (Next.js)

Los PDFs se procesan mediante el endpoint `/api/rag/extract` o mediante nodos OCR en n8n.

---

## **2. División en chunks (Chunking)**

Los documentos del módulo RAG se fragmentan usando:

```
RecursiveCharacterTextSplitter
chunkSize: 1200
chunkOverlap: 200
```

Esto mejora la recuperación de contexto en las consultas del usuario.

---

## **3. Generación de embeddings**

Se crean vectores de cada chunk con:

```
GoogleGenerativeAIEmbeddings
model: "text-embedding-004"
```

Los embeddings y metadatos se guardan en **Supabase**.

---

##  **4. Arquitectura multiagente (n8n + Gemini)**

### **Agente Contable – Gastos**

* Recibe facturas
* Guarda el archivo en Drive
* Extrae texto
* Procesa con Gemini
* Limpia totales (JS)
* Registra en Google Sheets

### **Agente Contable – Ingresos**

* Recibe comprobantes de ingreso
* Guarda el archivo en Drive
* Extrae texto
* Procesa la información con Gemini
* Limpia totales mediante un script en JavaScript
* Registra los datos en Google Sheets (hoja *Ingresos*)
---

## **5. Interfaz en Next.js**

Incluye:

* Módulo para subir gastos
* Módulo para subir ingresos
* Chat activado por API key de Gemini
* Cargador RAG con vista previa PDF y barra de progreso
* **Historial de archivos procesados**, que muestra:

  * Nombre
  * Tipo de documento
  * Fecha de procesamiento
  * Estado
  * Icono visual de registro

---

#  **4. Arquitectura de agentes**

```
                           ┌────────────────────────────┐
                           │         Usuario            │
                           └─────────────┬──────────────┘
                                         │
             ┌───────────────────────────┼────────────────────────────┐
             │                           │                            │
             ▼                           ▼                            ▼
   Subir Gastos                   Subir Ingresos              Subir Documento RAG
             │                           │                            │
             ▼                           ▼                            ▼
   Webhook → n8n AGENTE GASTOS   Webhook → n8n AGENTE INGRESOS    API Next.js
             │                           │                            │
             ├─ Guarda en Drive          ├─ Guarda en Drive           ├─ Extrae texto
             ├─ Extrae texto             ├─ Extrae texto              ├─ Chunking
             ├─ IA Gemini                ├─ IA Gemini                 ├─ Embeddings
             ├─ Limpieza campos          ├─ Limpieza campos           └─ Supabase (Vector DB)
             └─ Sheets: Gastos           └─ Sheets: Ingresos
```

---

#  **5. Resultados y conclusiones**

## **Resultados logrados**

* Sistema completamente funcional desde carga → extracción → registro.
* Integración real con:

  * Google Drive
  * Google Sheets
  * Supabase
  * Gemini
  * n8n
* Historial visual de archivos procesados.
* Sistema RAG operativo para consultas inteligentes.
* Cargador con barra de progreso y vista previa.

---

## **Conclusiones**

* La IA generativa puede automatizar tareas contables de forma confiable.
* n8n facilita la construcción de agentes empresariales reales.
* El uso de chunking + embeddings mejora drásticamente la calidad de las respuestas del asistente.
* El historial permite transparencia y trazabilidad.

---

#  **6. Trabajo futuro**

* Añadir autenticación de usuarios.
* Panel de estadísticas (gastos/ingresos por mes).
* Notificaciones por correo cuando el archivo sea procesado.
* OCR avanzado para facturas borrosas.
* Integración del RAG con el chat contable.
* Exportación mensual automática en PDF.
* Modo multiempresa.

---

