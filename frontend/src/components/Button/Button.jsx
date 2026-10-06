import React from 'react'
import { Spinner } from '../Loading/Spinner'

export const Button = ({
  children,
  type = 'button',
  variant = 'primary',
  size = 'md',
  loading = false,
  disabled = false,
  icon: Icon,
  className = '',
  onClick,
  ...props
}) => {
  const baseClasses = 'inline-flex items-center justify-center font-medium rounded-lg transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed select-none'

  const variants = {
    primary: 'bg-teal-600 hover:bg-teal-700 text-white focus:ring-teal-500 shadow-sm',
    secondary: 'bg-white hover:bg-slate-50 text-slate-700 border border-slate-300 focus:ring-slate-400 shadow-sm',
    danger: 'bg-rose-600 hover:bg-rose-700 text-white focus:ring-rose-500 shadow-sm',
    ghost: 'text-slate-600 hover:bg-slate-100 hover:text-slate-900 focus:ring-slate-300',
    outline: 'border border-teal-600 text-teal-600 hover:bg-teal-50 focus:ring-teal-500'
  }

  const sizes = {
    sm: 'text-xs px-2.5 py-1.5 gap-1.5',
    md: 'text-sm px-4 py-2 gap-2',
    lg: 'text-base px-5 py-2.5 gap-2.5'
  }

  return (
    <button
      type={type}
      disabled={disabled || loading}
      onClick={onClick}
      className={`${baseClasses} ${variants[variant] || variants.primary} ${sizes[size] || sizes.md} ${className}`}
      {...props}
    >
      {loading ? (
        <Spinner size="sm" className={variant === 'primary' || variant === 'danger' ? 'border-white border-t-transparent' : 'border-teal-600 border-t-transparent'} />
      ) : (
        Icon && <Icon className="w-4 h-4 flex-shrink-0" />
      )}
      <span>{children}</span>
    </button>
  )
}
