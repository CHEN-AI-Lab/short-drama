import React, { useState } from 'react'

const labelClass =
  'block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1'

const baseInputClass = [
  'block w-full rounded-lg border bg-white px-3 py-2 text-sm',
  'text-gray-900 placeholder-gray-400',
  'border-gray-300 dark:border-gray-600',
  'dark:bg-gray-800 dark:text-gray-100 dark:placeholder-gray-500',
  'focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500',
  'transition-colors',
].join(' ')

const errorInputClass =
  'border-red-500 dark:border-red-400 focus:ring-red-500 focus:border-red-500'

const errorTextClass = 'mt-1 text-sm text-red-600 dark:text-red-400'

type ChangeHandler = (e: React.ChangeEvent<HTMLInputElement>) => void

interface InputProps {
  label?: string
  error?: string
  showPasswordToggle?: boolean
  type?: string
  value?: string | number
  onChange?: ChangeHandler
  placeholder?: string
  required?: boolean
  autoComplete?: string
  minLength?: number
  id?: string
  className?: string
  name?: string
  disabled?: boolean
  readOnly?: boolean
  maxLength?: number
}

function Input({
  label,
  error,
  className = '',
  id,
  type = 'text',
  showPasswordToggle = false,
  onChange,
  value,
  placeholder,
  required,
  autoComplete,
  minLength,
  name,
  disabled,
  readOnly,
  maxLength,
}: InputProps) {
  const inputId = id || (label ? label.toLowerCase().replace(/\s+/g, '-') : 'input-field')
  const [showPassword, setShowPassword] = useState(false)

  const isPasswordWithToggle = type === 'password' && showPasswordToggle
  const resolvedType = isPasswordWithToggle
    ? showPassword ? 'text' : 'password'
    : type

  const inputClasses = [
    baseInputClass,
    error && errorInputClass,
    isPasswordWithToggle && 'pr-10',
    className,
  ].filter(Boolean).join(' ')

  const inputElement = (
    <input
      id={inputId}
      type={resolvedType}
      className={inputClasses}
      value={value}
      onChange={onChange}
      placeholder={placeholder}
      required={required}
      autoComplete={autoComplete}
      minLength={minLength}
      name={name}
      disabled={disabled}
      readOnly={readOnly}
      maxLength={maxLength}
      aria-invalid={error ? 'true' : undefined}
      aria-describedby={error ? `${inputId}-error` : undefined}
    />
  )

  const toggleBtn = (
    <button
      type="button"
      onClick={() => setShowPassword((prev) => !prev)}
      className="flex items-center justify-center text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
      aria-label={showPassword ? 'Hide password' : 'Show password'}
      tabIndex={-1}
    >
      {showPassword ? (
        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
          <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24" />
          <line x1="1" y1="1" x2="23" y2="23" />
        </svg>
      ) : (
        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
          <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
          <circle cx="12" cy="12" r="3" />
        </svg>
      )}
    </button>
  )

  return (
    <div className="w-full">
      {label && (
        <label htmlFor={inputId} className={labelClass}>
          {label}
        </label>
      )}
      {isPasswordWithToggle ? (
        <div style={{ position: 'relative' }}>
          {inputElement}
          <div
            style={{
              position: 'absolute',
              top: 0,
              bottom: 0,
              right: '4px',
              display: 'flex',
              alignItems: 'center',
              zIndex: 1,
            }}
          >
            {toggleBtn}
          </div>
        </div>
      ) : (
        inputElement
      )}
      {error && (
        <p id={`${inputId}-error`} className={errorTextClass} role="alert">
          {error}
        </p>
      )}
    </div>
  )
}

export default Input