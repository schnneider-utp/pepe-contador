'use client'

import * as React from 'react'
import { Settings, Upload, FileText, FolderOpen, Sparkles } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Badge } from '@/components/ui/badge'
import { Drawer, DrawerTrigger, DrawerContent, DrawerHeader, DrawerTitle, DrawerDescription, DrawerFooter, DrawerClose } from '@/components/ui/drawer'
import { Tooltip, TooltipTrigger, TooltipContent } from '@/components/ui/tooltip'

export function UserRagUploader() {
  return (
    <Drawer direction="right">
      <Tooltip>
        <TooltipTrigger asChild>
          <DrawerTrigger asChild>
            <Button
              variant="outline"
              size="icon-lg"
              className="fixed top-4 right-4 z-50 bg-background shadow-xs hover:shadow-md transition-transform hover:scale-[1.03]"
            >
              <Settings className="size-6" />
              <span className="sr-only">Abrir RAG</span>
            </Button>
          </DrawerTrigger>
        </TooltipTrigger>
        <TooltipContent side="left">Configuración y subida de documentos RAG</TooltipContent>
      </Tooltip>

      <DrawerContent className="data-[vaul-drawer-direction=right]:sm:max-w-md md:max-w-xl xl:max-w-2xl">
        <DrawerHeader>
          <DrawerTitle>RAG de Documentos</DrawerTitle>
          <DrawerDescription>Sube tus archivos para construir conocimiento contable personalizado</DrawerDescription>
        </DrawerHeader>

        <div className="p-4 space-y-4">
          <Card className="hover:border-primary transition-colors">
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="text-lg">Zona de subida</CardTitle>
                <Badge className="gap-1"><Sparkles className="size-3" /> Dinámico</Badge>
              </div>
            </CardHeader>
            <CardContent>
              <div className="grid gap-3">
                <div className="group border border-dashed rounded-lg p-6 flex flex-col items-center justify-center text-center transition-all hover:bg-accent hover:text-accent-foreground">
                  <Upload className="size-7 mb-2 transition-transform group-hover:scale-110" />
                  <div className="text-sm">Arrastra y suelta tus archivos aquí</div>
                  <div className="text-xs text-muted-foreground">PDF, imágenes y documentos contables</div>
                  <div className="mt-4 flex items-center gap-2">
                    <Button variant="default" className="gap-2"><FolderOpen className="size-4" /> Seleccionar documentos</Button>
                    <Button variant="outline" className="gap-2"><FileText className="size-4" /> Ver guía</Button>
                  </div>
                </div>

                <div className="grid md:grid-cols-2 gap-3">
                  <Card>
                    <CardHeader>
                      <CardTitle className="text-base">Tipos reconocidos</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="flex flex-wrap gap-2">
                        <Badge>Facturas</Badge>
                        <Badge>Estados financieros</Badge>
                        <Badge>Recibos</Badge>
                        <Badge>Comprobantes</Badge>
                        <Badge>Balances</Badge>
                      </div>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardHeader>
                      <CardTitle className="text-base">Documentos seleccionados</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <ScrollArea className="h-32 rounded-md border">
                        <div className="p-3 text-sm text-muted-foreground">Aún no hay documentos</div>
                      </ScrollArea>
                    </CardContent>
                  </Card>
                </div>
              </div>
            </CardContent>
          </Card>

          <div className="flex justify-end gap-2">
            <DrawerClose asChild>
              <Button variant="outline">Cerrar</Button>
            </DrawerClose>
            <Button className="gap-2"><Sparkles className="size-4" /> Continuar</Button>
          </div>
        </div>

        <DrawerFooter />
      </DrawerContent>
    </Drawer>
  )
}