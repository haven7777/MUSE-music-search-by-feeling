'use client'

import { AnimatePresence, motion } from 'framer-motion'
import { createContext, useCallback, useContext, useState } from 'react'
import { CheckCircle, X, AlertCircle } from 'lucide-react'

interface Toast {
  id: string
  message: string
  type: 'success' | 'error' | 'info'
}

interface ToastContextValue {
  showToast: (message: string, type?: Toast['type']) => void
}

const ToastCtx = createContext<ToastContextValue | null>(null)

export function ToastProvider({ children }: { children: React.ReactNode }) {
  const [toasts, setToasts] = useState<Toast[]>([])

  const showToast = useCallback((message: string, type: Toast['type'] = 'success') => {
    const id = Math.random().toString(36).slice(2)
    setToasts((prev) => [...prev, { id, message, type }])
    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id))
    }, 2500)
  }, [])

  return (
    <ToastCtx.Provider value={{ showToast }}>
      {children}
      <div
        aria-live="polite"
        aria-atomic="true"
        className="fixed left-1/2 -translate-x-1/2 z-50 flex flex-col gap-2 items-center pointer-events-none"
        style={{ bottom: 'calc(1.5rem + env(safe-area-inset-bottom, 0px))' }}
      >
        <AnimatePresence>
          {toasts.map((toast) => (
            <motion.div
              key={toast.id}
              initial={{ opacity: 0, y: 16, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 8, scale: 0.95 }}
              transition={{ duration: 0.2 }}
              className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-medium pointer-events-auto"
              style={{
                background: toast.type === 'success'
                  ? 'rgba(var(--muse-primary-rgb, 139,92,246), 0.92)'
                  : 'rgba(20,20,30,0.95)',
                border: toast.type === 'success'
                  ? '1px solid rgba(var(--muse-primary-rgb, 139,92,246), 0.5)'
                  : '1px solid rgba(255,255,255,0.12)',
                backdropFilter: 'blur(12px)',
                color: 'white',
                boxShadow: '0 4px 24px rgba(0,0,0,0.4)',
              }}
            >
              {toast.type === 'success' && (
                <CheckCircle className="w-4 h-4 flex-shrink-0" style={{ color: '#22c55e' }} />
              )}
              {toast.type === 'error' && (
                <AlertCircle className="w-4 h-4 flex-shrink-0" style={{ color: '#ef4444' }} />
              )}
              {toast.message}
              <button
                onClick={() => setToasts((prev) => prev.filter((t) => t.id !== toast.id))}
                className="ml-1 opacity-50 hover:opacity-100 transition-opacity p-2 -mr-1"
                aria-label="Dismiss notification"
                style={{ minWidth: '36px', minHeight: '36px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
              >
                <X className="w-3.5 h-3.5" />
              </button>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>
    </ToastCtx.Provider>
  )
}

export function useToast(): ToastContextValue {
  const ctx = useContext(ToastCtx)
  if (!ctx) throw new Error('useToast must be used within ToastProvider')
  return ctx
}
