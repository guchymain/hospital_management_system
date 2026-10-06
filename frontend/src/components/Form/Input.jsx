import React from 'react'

export const Input = ({
  label,
  id,
  name,
  type = 'text',
  value,
  onChange,
  placeholder,
  required = false,
  error,
  helperText,
  disabled = false,
  className = '',
  ...props
}) => {
  const inputId = id || name

  return (
    <div className={`w-full ${className}`}>
      {label && (
        <label htmlFor={inputId} className="block text-sm font-medium text-slate-700 mb-1">
          {label} {required && <span className="text-rose-500">*</span>}
        </label>
      )}
      <input
        id={inputId}
        name={name}
        type={type}
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        required={required}
        disabled={disabled}
        className={`w-full px-3.5 py-2 rounded-lg border text-sm text-slate-900 bg-white placeholder:text-slate-400 focus:outline-none focus:ring-2 transition disabled:bg-slate-50 disabled:text-slate-500 ${
          error
            ? 'border-rose-300 focus:border-rose-500 focus:ring-rose-200'
            : 'border-slate-300 focus:border-teal-500 focus:ring-teal-100'
        }`}
        {...props}
      />
      {error ? (
        <p className="mt-1 text-xs text-rose-600">{error}</p>
      ) : helperText ? (
        <p className="mt-1 text-xs text-slate-500">{helperText}</p>
      ) : null}
    </div>
  )
}
