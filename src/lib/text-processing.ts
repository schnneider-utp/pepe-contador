/**
 * Calcula la similitud coseno entre dos vectores
 */
export function cosineSimilarity(vecA: number[], vecB: number[]): number {
  if (vecA.length !== vecB.length) {
    throw new Error('Vectors must have the same length')
  }

  let dotProduct = 0
  let normA = 0
  let normB = 0

  for (let i = 0; i < vecA.length; i++) {
    dotProduct += vecA[i] * vecB[i]
    normA += vecA[i] * vecA[i]
    normB += vecB[i] * vecB[i]
  }

  const denominator = Math.sqrt(normA) * Math.sqrt(normB)
  if (denominator === 0) return 0

  return dotProduct / denominator
}

/**
 * Realiza búsqueda semántica local en chunks de texto
 */
export function searchLocalChunks(
  queryEmbedding: number[],
  chunks: Array<{ content: string; embedding: number[] }>,
  topK: number = 5
): Array<{ content: string; similarity: number }> {
  const results = chunks.map((chunk) => ({
    content: chunk.content,
    similarity: cosineSimilarity(queryEmbedding, chunk.embedding),
  }))

  // Ordenar por similitud descendente
  results.sort((a, b) => b.similarity - a.similarity)

  // Retornar top K resultados
  return results.slice(0, topK)
}

/**
 * Formatea el contexto temporal para incluirlo en el mensaje del chat
 */
export function formatTemporaryContext(
  matches: Array<{ content: string; similarity: number }>,
  documentTitle: string
): string {
  if (matches.length === 0) return ''

  const parts = matches.map((m, i) => {
    return `Fragmento ${i + 1} (similitud: ${m.similarity.toFixed(3)}):\n${m.content}`
  })

  return `Contexto del documento temporal "${documentTitle}":\n\n${parts.join('\n\n')}`
}
