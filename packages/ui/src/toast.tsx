import React, { useCallback, useEffect, useRef, useState } from 'react'

/* ------------------------------------------------------------------ */
/*  Types                                                              */
/* ------------------------------------------------------------------ */

type ToastType = 'success' | 'error' | 'info'

interface ToastItem {
  id: number
  message: string
  type: ToastType
  visible: boolean
}

/* ------------------------------------------------------------------ */
/*  Styles                                                             */
/* ------------------------------------------------------------------ */

const typeStyles: Record<ToastType, string> = {
  success:
    'bg-green-600 text-white dark:bg-green-500',
  error:
    'bg-red-600 text-white dark:bg-red-500',
  info:
    'bg-gray-800 text-white dark:bg-gray-700 dark:text-gray-100',
}

const iconMap: Record<ToastType, React.ReactNode> = {
  success: (
    <svg className="h-5 w-5 shrink-0" viewBox="0 0 20 20" fill="currentColor">
      <path
        fillRule="evenodd"
        d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.857-9.809a.75.75 0 00-1.214-.882l-3.483 4.79-1.88-1.88a.75.75 0 10-1.06 1.061l2.5 2.5a.75.75 0 001.137-.089l4-5.5z"
        clipRule="evenodd"
      />
    </svg>
  ),
  error: (
    <svg className="h-5 w-5 shrink-0" viewBox="0 0 20 20" fill="currentColor">
      <path
        fillRule="evenodd"
        d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.28 7.22a.75.75 0 00-1.06 1.06L8.94 10l-1.72 1.72a.75.75 0 101.06 1.06L10 11.06l1.72 1.72a.75.75 0 101.06-1.06L11.06 10l1.72-1.72a.75.75 0 00-1.06-1.06L10 8.94 8.28 7.22z"
        clipRule="evenodd"
      />
    </svg>
  ),
  info: (
    <svg className="h-5 w-5 shrink-0" viewBox="0 0 20 20" fill="currentColor">
      <path
        fillRule="evenodd"
        d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a.75.75 0 000 1.5h.253a.25.25 0 01.244.304l-.459 2.066A1.75 1.75 0 0010.747 15H11a.75.75 0 000-1.5h-.253a.25.25 0 01-.244-.304l.459-2.066A1.75 1.75 0 009.253 9H9z"
        clipRule="evenodd"
      />
    </svg>
  ),
}

/* ------------------------------------------------------------------ */
/*  Toast Component                                                    */
/* ------------------------------------------------------------------ */

interface ToastProps {
  message: string
  type: ToastType
  visible: boolean
  onClose: () => void
}

const Toast: React.FC<ToastProps> = ({ message, type, visible, onClose }) => {
  return (
    <div
      className={[
        'flex items-center gap-2 rounded-lg px-4 py-3 shadow-lg',
        'transition-all duration-300 ease-in-out',
        typeStyles[type],
        visible
          ? 'opacity-100 translate-x-0'
          : 'opacity-0 translate-x-full',
      ].join(' ')}
      role="alert"
    >
      {iconMap[type]}
      <span className="flex-1 text-sm font-medium">{message}</span>
      <button
        type="button"
        onClick={onClose}
        className="shrink-0 rounded p-0.5 opacity-70 hover:opacity-100 transition-opacity"
        aria-label="Close"
      >
        <svg className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
          <path d="M6.28 5.22a.75.75 0 00-1.06 1.06L8.94 10l-3.72 3.72a.75.75 0 101.06 1.06L10 11.06l3.72 3.72a.75.75 0 101.06-1.06L11.06 10l3.72-3.72a.75.75 0 00-1.06-1.06L10 8.94 6.28 5.22z" />
        </svg>
      </button>
    </div>
  )
}

/* ------------------------------------------------------------------ */
/*  ToastContainer (rendered by the hook)                              */
/* ------------------------------------------------------------------ */

interface ToastContainerProps {
  toasts: ToastItem[]
  removeToast: (id: number) => void
}

const ToastContainer: React.FC<ToastContainerProps> = ({
  toasts,
  removeToast,
}) => {
  return (
    <div className="fixed top-4 right-4 z-50 flex flex-col gap-2 max-w-sm w-full pointer-events-none">
      {toasts.map((t) => (
        <div key={t.id} className="pointer-events-auto">
          <Toast
            message={t.message}
            type={t.type}
            visible={t.visible}
            onClose={() => removeToast(t.id)}
          />
        </div>
      ))}
    </div>
  )
}

/* ------------------------------------------------------------------ */
/*  useToast hook                                                      */
/* ------------------------------------------------------------------ */

interface UseToastReturn {
  toast: (message: string, type?: ToastType) => void
  ToastContainer: React.FC
}

let nextId = 1
const AUTO_DISMISS_MS = 4000
const ANIMATION_MS = 300

function useToast(): UseToastReturn {
  const [toasts, setToasts] = useState<ToastItem[]>([])
  const timersRef = useRef<Map<number, ReturnType<typeof setTimeout>>>(
    new Map()
  )

  const removeToast = useCallback((id: number) => {
    // Start fade-out
    setToasts((prev) =>
      prev.map((t) => (t.id === id ? { ...t, visible: false } : t))
    )

    // Fully remove after animation
    const timer = setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id))
      timersRef.current.delete(id)
    }, ANIMATION_MS)

    timersRef.current.set(id, timer)
  }, [])

  const addToast = useCallback(
    (message: string, type: ToastType = 'info') => {
      const id = nextId++

      setToasts((prev) => [
        ...prev,
        { id, message, type, visible: false },
      ])

      // Trigger slide-in on next frame
      requestAnimationFrame(() => {
        setToasts((prev) =>
          prev.map((t) => (t.id === id ? { ...t, visible: true } : t))
        )
      })

      // Auto-dismiss
      const dismissTimer = setTimeout(() => {
        removeToast(id)
      }, AUTO_DISMISS_MS)

      timersRef.current.set(id, dismissTimer)
    },
    [removeToast]
  )

  // Cleanup all timers on unmount
  useEffect(() => {
    const currentTimers = timersRef.current
    return () => {
      currentTimers.forEach((timer) => clearTimeout(timer))
      currentTimers.clear()
    }
  }, [])

  const MemoizedContainer = React.useMemo(
    () =>
      function Container() {
        return <ToastContainer toasts={toasts} removeToast={removeToast} />
      },
    [toasts, removeToast]
  )

  return { toast: addToast, ToastContainer: MemoizedContainer }
}

export { useToast }
export default Toast