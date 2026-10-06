import React from 'react'

export const Spinner = ({ size = 'md', className = '' }) => {
  const sizeClasses = {
    sm: 'w-4 h-4 border-2',
    md: 'w-6 h-6 border-2',
    lg: 'w-10 h-10 border-3',
    xl: 'w-16 h-16 border-4'
  }

  return (
    <div
      className={`inline-block animate-spin rounded-full border-teal-600 border-t-transparent ${sizeClasses[size] || sizeClasses.md} ${className}`}
      role="status"
      aria-label="Loading"
    >
      <span className="sr-only">Loading...</span>
    </div>
  )
}

export const PageLoader = ({ message = 'Loading...' }) => {
  return (
    <div className="flex flex-col items-center justify-center p-12 min-h-[300px]">
      <Spinner size="lg" />
      <p className="mt-4 text-sm font-medium text-slate-500">{message}</p>
    </div>
  )
}

export const SkeletonRow = ({ columns = 5 }) => {
  return (
    <tr className="animate-pulse border-b border-slate-100">
      {Array.from({ length: columns }).map((_, i) => (
        <td key={i} className="py-4 px-4">
          <div className="h-4 bg-slate-200 rounded w-full max-w-[120px]"></div>
        </td>
      ))}
    </tr>
  )
}
