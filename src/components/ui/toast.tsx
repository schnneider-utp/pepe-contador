'use client'

import * as React from 'react'

// Tipos esperados por use-toast
export type ToastActionElement = React.ReactNode

export type ToastProps = {
  open?: boolean
  onOpenChange?: (open: boolean) => void
  title?: React.ReactNode
  description?: React.ReactNode
  action?: ToastActionElement
}

type ToastComponentProps = ToastProps & {
  onClose?: () => void
}

export function Toast({ title, description, action, onClose }: ToastComponentProps) {
  return (
    <div className="pointer-events-auto w-80 rounded-lg border border-border bg-card shadow-lg">
      <div className="p-4">
        {title && (
          <div className="text-sm font-semibold text-foreground">{title}</div>
        )}
        {description && (
          <div className="mt-1 text-sm text-muted-foreground">{description}</div>
        )}
        {action && (
          <div className="mt-3">{action}</div>
        )}
        <div className="mt-3 flex justify-end">
          <button
            type="button"
            onClick={onClose}
            className="inline-flex items-center rounded-md border border-input bg-background px-2 py-1 text-xs text-foreground hover:bg-muted"
          >
            Cerrar
          </button>
        </div>
      </div>
    </div>
  )
}

export function ToastTitle({ children }: { children?: React.ReactNode }) {
  return <div className="text-sm font-semibold text-foreground">{children}</div>
}

export function ToastDescription({ children }: { children?: React.ReactNode }) {
  return <div className="mt-1 text-sm text-muted-foreground">{children}</div>
}

export function ToastAction({ children }: { children?: React.ReactNode }) {
  return <div className="mt-3">{children}</div>
}

export function ToastViewport({ children }: { children?: React.ReactNode }) {
  return (
    <div className="fixed bottom-4 right-4 z-50 flex flex-col gap-3">{children}</div>
  )
}
