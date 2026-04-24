'use client'

import React, { createContext, useContext, useMemo, useState } from 'react'

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
          <div
            key={t.id}
            className="card"
            style={{
              padding: '10px 12px',
              minWidth: 260,
              borderColor:
                t.kind === 'error'
                  ? 'rgba(183,28,28,.35)'
                  : t.kind === 'success'
                    ? 'rgba(27,122,78,.25)'
                    : 'rgba(66,165,245,.25)',
              background:
                t.kind === 'error'
                  ? 'var(--redl)'
                  : t.kind === 'success'
                    ? 'var(--greenl)'
                    : 'var(--pl)',
            }}
          >
            <div style={{ fontWeight: 800, color: 'var(--t2)', fontSize: 12.5 }}>{t.message}</div>
          </div>
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

