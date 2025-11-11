'use client'

import * as React from 'react'
import { useToast } from '@/hooks/use-toast'
import { Toast, ToastViewport } from '@/components/ui/toast'

export function Toaster() {
  const { toasts, dismiss } = useToast()

  return (
    <ToastViewport>
      {toasts.map((t) => (
        <Toast
          key={t.id}
          title={t.title}
          description={t.description}
          action={t.action}
          onClose={() => dismiss(t.id)}
        />
      ))}
    </ToastViewport>
  )
}
