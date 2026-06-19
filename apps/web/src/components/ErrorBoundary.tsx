'use client'

import React, { useState, type ReactNode } from 'react'

interface ErrorBoundaryProps {
  children: ReactNode
  fallback?: ReactNode
  locale?: string
}

export default function ErrorBoundary({ children, fallback, locale }: ErrorBoundaryProps) {
  const [hasError, setHasError] = useState(false)

  if (hasError) {
    if (fallback) return <>{fallback}</>

    const isChinese = locale === 'zh-CN'
    return (
      <div className="rounded-2xl border border-red-300 dark:border-red-700 bg-red-50 dark:bg-red-900/30 px-5 py-6 text-center">
        <div className="text-4xl mb-3">😵</div>
        <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-1">
          {isChinese ? '出错了' : 'Something went wrong'}
        </h3>
        <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
          {isChinese
            ? '生成过程中出现意外错误，请重试'
            : 'An unexpected error occurred while generating.'}
        </p>
        <button
          type="button"
          onClick={() => setHasError(false)}
          className="inline-flex items-center px-4 py-2 bg-indigo-600 text-white text-sm font-medium rounded-xl hover:bg-indigo-700 transition-colors"
        >
          {isChinese ? '重试' : 'Retry'}
        </button>
      </div>
    )
  }

  return (
    <ErrorBoundaryInner onError={() => setHasError(true)}>
      {children}
    </ErrorBoundaryInner>
  )
}

class ErrorBoundaryInner extends React.Component<
  { children: ReactNode; onError: () => void },
  { hasError: boolean }
> {
  state = { hasError: false }

  static getDerivedStateFromError() {
    return { hasError: true }
  }

  componentDidCatch(error: Error) {
    console.error('ErrorBoundary caught:', error)
    this.props.onError()
  }

  render() {
    if (this.state.hasError) return null
    return this.props.children
  }
}