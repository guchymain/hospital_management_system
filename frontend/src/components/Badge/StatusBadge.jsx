import React from 'react'
import { capitalize } from '../../utils/formatters'

export const StatusBadge = ({ status, className = '' }) => {
  if (!status) return null

  const normalized = status.toLowerCase()

  const styles = {
    // Appointment statuses
    scheduled: 'bg-blue-50 text-blue-700 border-blue-200',
    completed: 'bg-emerald-50 text-emerald-700 border-emerald-200',
    cancelled: 'bg-rose-50 text-rose-700 border-rose-200',
    
    // Roles
    admin: 'bg-purple-50 text-purple-700 border-purple-200',
    doctor: 'bg-teal-50 text-teal-700 border-teal-200',
    nurse: 'bg-amber-50 text-amber-700 border-amber-200',
    receptionist: 'bg-cyan-50 text-cyan-700 border-cyan-200'
  }

  const currentClass = styles[normalized] || 'bg-slate-50 text-slate-700 border-slate-200'

  return (
    <span
      className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold border ${currentClass} ${className}`}
    >
      <span className="w-1.5 h-1.5 rounded-full bg-current mr-1.5 opacity-70"></span>
      {capitalize(status)}
    </span>
  )
}
