import React from 'react'
import { Activity } from 'lucide-react'

export const AuthLayout = ({ children }) => {
  return (
    <div className="flex min-h-screen flex-col justify-center items-center bg-slate-100/70 p-4 sm:p-6 lg:p-8">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <div className="inline-flex h-12 w-12 items-center justify-center rounded-xl bg-teal-600 text-white shadow-md mb-3">
            <Activity className="h-7 w-7" />
          </div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900">Hospital Management System</h1>
          <p className="text-sm text-slate-500 mt-1">Clinical & Administrative Services Portal</p>
        </div>

        <div className="rounded-2xl bg-white p-6 sm:p-8 shadow-xl shadow-slate-200/50 border border-slate-200/80">
          {children}
        </div>

        <div className="text-center mt-6 text-xs text-slate-400">
          Secure Electronic Medical Record & Hospital Administration System
        </div>
      </div>
    </div>
  )
}
