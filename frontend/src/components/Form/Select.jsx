import React from 'react'

export const Select = ({
  label,
  id,
  name,
  value,
  onChange,
  options = [],
  placeholder = 'Select an option',
  required = false,
  error,
  helperText,
  disabled = false,
  className = '',
  ...props
}) => {
  const selectId = id || name

  return (
    <div className={`w-full ${className}`}>
      {label && (
        <label htmlFor={selectId} className="block text-sm font-medium text-slate-700 mb-1">
          {label} {required && <span className="text-rose-500">*</span>}
        </label>
      )}
      <select
        id={selectId}
        name={name}
        value={value}
        onChange={onChange}
        required={required}
        disabled={disabled}
        className={`w-full px-3.5 py-2 rounded-lg border text-sm text-slate-900 bg-white focus:outline-none focus:ring-2 transition disabled:bg-slate-50 disabled:text-slate-500 ${
          error
            ? 'border-rose-300 focus:border-rose-500 focus:ring-rose-200'
            : 'border-slate-300 focus:border-teal-500 focus:ring-teal-100'
        }`}
        {...props}
      >
        <option value="" disabled>
          {placeholder}
        </option>
        {options.map((opt) => {
          const val = typeof opt === 'object' ? opt.value : opt
          const text = typeof opt === 'object' ? opt.label : opt
          return (
            <option key={val} value={val}>
              {text}
            </option>
          )
        })}
      </select>
      {error ? (
        <p className="mt-1 text-xs text-rose-600">{error}</p>
      ) : helperText ? (
        <p className="mt-1 text-xs text-slate-500">{helperText}</p>
      ) : null}
    </div>
  )
}
