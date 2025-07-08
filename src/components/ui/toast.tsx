import * as React from "react"
import { CheckCircle, XCircle, AlertTriangle, Info, X } from "lucide-react"
import { cn } from "@/lib/utils"

export interface ToastProps {
  id: string
  title?: string
  description?: string
  variant?: "default" | "success" | "error" | "warning" | "info"
  duration?: number
  onClose?: () => void
}

const ToastVariants = {
  default: {
    container: "bg-white border-gray-200 text-gray-900",
    icon: Info,
    iconColor: "text-blue-500"
  },
  success: {
    container: "bg-green-50 border-green-200 text-green-900",
    icon: CheckCircle,
    iconColor: "text-green-500"
  },
  error: {
    container: "bg-red-50 border-red-200 text-red-900",
    icon: XCircle,
    iconColor: "text-red-500"
  },
  warning: {
    container: "bg-yellow-50 border-yellow-200 text-yellow-900",
    icon: AlertTriangle,
    iconColor: "text-yellow-500"
  },
  info: {
    container: "bg-blue-50 border-blue-200 text-blue-900",
    icon: Info,
    iconColor: "text-blue-500"
  }
}

export function Toast({
  id,
  title,
  description,
  variant = "default",
  duration = 5000,
  onClose,
}: ToastProps) {
  const variantConfig = ToastVariants[variant]
  const Icon = variantConfig.icon

  React.useEffect(() => {
    if (duration > 0) {
      const timer = setTimeout(() => {
        onClose?.()
      }, duration)
      return () => clearTimeout(timer)
    }
  }, [duration, onClose])

  return (
    <div
      className={cn(
        "pointer-events-auto w-full max-w-sm overflow-hidden rounded-lg border shadow-lg transition-all",
        "animate-in slide-in-from-top-full duration-300",
        variantConfig.container
      )}
    >
      <div className="p-4">
        <div className="flex items-start">
          <div className="flex-shrink-0">
            <Icon className={cn("h-5 w-5", variantConfig.iconColor)} />
          </div>
          <div className="ml-3 w-0 flex-1">
            {title && (
              <p className="text-sm font-medium">{title}</p>
            )}
            {description && (
              <p className={cn("text-sm", title ? "mt-1" : "")}>
                {description}
              </p>
            )}
          </div>
          <div className="ml-4 flex flex-shrink-0">
            <button
              className="inline-flex rounded-md text-gray-400 hover:text-gray-600 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2"
              onClick={onClose}
            >
              <span className="sr-only">Close</span>
              <X className="h-4 w-4" />
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

export interface ToastContextType {
  addToast: (toast: Omit<ToastProps, "id" | "onClose">) => void
  removeToast: (id: string) => void
}

const ToastContext = React.createContext<ToastContextType | undefined>(undefined)

export function ToastProvider({ children }: { children: React.ReactNode }) {
  const [toasts, setToasts] = React.useState<ToastProps[]>([])

  const addToast = React.useCallback((toast: Omit<ToastProps, "id" | "onClose">) => {
    const id = Math.random().toString(36).substring(2, 9)
    setToasts((prev) => [...prev, { ...toast, id }])
  }, [])

  const removeToast = React.useCallback((id: string) => {
    setToasts((prev) => prev.filter((toast) => toast.id !== id))
  }, [])

  return (
    <ToastContext.Provider value={{ addToast, removeToast }}>
      {children}
      <div className="pointer-events-none fixed inset-0 z-50 flex items-end px-4 py-6 sm:items-start sm:p-6">
        <div className="flex w-full flex-col items-center space-y-4 sm:items-end">
          {toasts.map((toast) => (
            <Toast
              key={toast.id}
              {...toast}
              onClose={() => removeToast(toast.id)}
            />
          ))}
        </div>
      </div>
    </ToastContext.Provider>
  )
}

export function useToast() {
  const context = React.useContext(ToastContext)
  if (context === undefined) {
    throw new Error("useToast must be used within a ToastProvider")
  }
  return context
}
