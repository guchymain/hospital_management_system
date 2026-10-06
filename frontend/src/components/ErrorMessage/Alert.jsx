import React from 'react'
import { AlertCircle, CheckCircle2, Info, X } from 'lucide-react'

export const Alert = ({ type = 'error', message, onClose, className = '' }) => {
  if (!message) return null

  const styles = {
    error: {
      container: 'bg-rose-50 border-rose-200 text-rose-800',
      icon: <AlertCircle className="w-5 h-5 text-rose-600 flex-shrink-0" />
    },
    success: {
      container: 'bg-emerald-50 border-emerald-200 text-emerald-800',
      icon: <CheckCircle2 className="w-5 h-5 text-emerald-600 flex-shrink-0" />
    },
    info: {
      container: 'bg-cyan-50 border-cyan-200 text-cyan-800',
      icon: <Info className="w-5 h-5 text-cyan-600 flex-shrink-0" />
    },
    warning: {
      container: 'bg-amber-50 border-amber-200 text-amber-800',
      icon: <AlertCircle className="w-5 h-5 text-amber-600 flex-shrink-0" />
    }
  }

  const current = styles[type] || styles.error

  return (
    <div className={`flex items-start gap-3 p-4 rounded-lg border text-sm transition-all ${current.container} ${className}`}>
      {current.icon}
      <div className="flex-1 font-medium leading-relaxed">{message}</div>
      {onClose && (
        <button
          onClick={onClose}
          type="button"
          className="text-slate-400 hover:text-slate-700 transition p-0.5 rounded"
          aria-label="Dismiss"
        >
          <X className="w-4 h-4" />
        </button>
      )}
    </div>
  )
}
