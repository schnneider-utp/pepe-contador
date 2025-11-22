'use client'

import React, { createContext, useContext, useState, useCallback } from 'react'

export type TemporaryDocument = {
    id: string
    title: string
    filename: string
    chunks: Array<{ content: string; embedding: number[] }>
    uploadedAt: Date
}

type TemporaryContextType = {
    documents: TemporaryDocument[]
    addDocument: (doc: TemporaryDocument) => void
    removeDocument: (id: string) => void
    clearAll: () => void
    hasDocuments: boolean
}

const TemporaryContext = createContext<TemporaryContextType | undefined>(undefined)

export function TemporaryContextProvider({ children }: { children: React.ReactNode }) {
    const [documents, setDocuments] = useState<TemporaryDocument[]>([])

    const addDocument = useCallback((doc: TemporaryDocument) => {
        setDocuments((prev) => [...prev, doc])
    }, [])

    const removeDocument = useCallback((id: string) => {
        setDocuments((prev) => prev.filter((doc) => doc.id !== id))
    }, [])

    const clearAll = useCallback(() => {
        setDocuments([])
    }, [])

    const hasDocuments = documents.length > 0

    return (
        <TemporaryContext.Provider
            value={{ documents, addDocument, removeDocument, clearAll, hasDocuments }}
        >
            {children}
        </TemporaryContext.Provider>
    )
}

export function useTemporaryContext() {
    const context = useContext(TemporaryContext)
    if (!context) {
        throw new Error('useTemporaryContext must be used within TemporaryContextProvider')
    }
    return context
}
