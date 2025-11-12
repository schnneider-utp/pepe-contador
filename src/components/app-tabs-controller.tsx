"use client"

import { useEffect, useState } from "react"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { FileUploadSection } from "@/components/file-upload-section"
import { SecondaryUploadSection } from "@/components/secondary-upload-section"
import { AccountingTriggerSection } from "@/components/accounting-trigger-section"

export function AppTabsController() {
  const [activeTab, setActiveTab] = useState<string>("upload")

  useEffect(() => {
    const handler = (e: Event) => {
      const detail = (e as CustomEvent).detail as { value?: string } | undefined
      if (!detail?.value) return
      setActiveTab(detail.value)
    }
    window.addEventListener("app:set-tab", handler as EventListener)
    return () => window.removeEventListener("app:set-tab", handler as EventListener)
  }, [])

  return (
    <Tabs value={activeTab} onValueChange={setActiveTab} className="flex h-full flex-col">
      <TabsList className="mb-4 w-full">
        <TabsTrigger value="upload">Subir Imagenes</TabsTrigger>
        <TabsTrigger value="upload2">Subir Documentos</TabsTrigger>
        <TabsTrigger value="historial">Historial</TabsTrigger>
      </TabsList>
      <div className="flex-1 overflow-y-auto">
        <TabsContent value="upload">
          <FileUploadSection />
        </TabsContent>
        <TabsContent value="upload2">
          <SecondaryUploadSection />
        </TabsContent>
        <TabsContent value="historial">
          <AccountingTriggerSection />
        </TabsContent>
      </div>
    </Tabs>
  )
}