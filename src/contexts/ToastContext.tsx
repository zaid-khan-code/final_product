'use client'

import React, { createContext, useContext, useMemo, useState } from 'react'
import { Card } from '@/components/ui/Card'

type Toast = { id: string; message: string; kind: 'info' | 'success' | 'error' }

type ToastCtx = {
  showToast: (message: string, kind?: Toast['kind']) => void
}

const ToastContext = createContext<ToastCtx | null>(null)

export function ToastProvider({ children }: { children: React.ReactNode }) {
  const [toasts, setToasts] = useState<Toast[]>([])

  const api = useMemo<ToastCtx>(
    () => ({
      showToast: (message, kind = 'info') => {
        const id = `${Date.now()}-${Math.random().toString(16).slice(2)}`
        setToasts((t) => [...t, { id, message, kind }])
        window.setTimeout(() => setToasts((t) => t.filter((x) => x.id !== id)), 3200)
      },
    }),
    []
  )

  return (
    <ToastContext.Provider value={api}>
      {children}
      <div
        style={{
          position: 'fixed',
          right: 14,
          top: 14,
          display: 'flex',
          flexDirection: 'column',
          gap: 8,
          zIndex: 2000,
        }}
      >
        {toasts.map((t) => (
          <Card
            key={t.id}
            className="toast-card"
            style={{
              padding: '10px 12px',
              minWidth: 260,
            }}
            data-kind={t.kind}
          >
            <div style={{ fontWeight: 800, color: 'var(--t2)', fontSize: 12.5 }}>{t.message}</div>
          </Card>
        ))}
      </div>
    </ToastContext.Provider>
  )
}

export function useToast() {
  const ctx = useContext(ToastContext)
  if (!ctx) throw new Error('useToast must be used within ToastProvider')
  return ctx
}
