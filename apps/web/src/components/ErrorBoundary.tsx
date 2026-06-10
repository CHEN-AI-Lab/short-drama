'use client'

import React from 'react'

interface ErrorBoundaryProps {
  children: React.ReactNode
  fallback?: React.ReactNode
  locale?: string
}

interface ErrorBoundaryState {
  hasError: boolean
  error: Error | null
}

export default class ErrorBoundary extends React.Component<
  ErrorBoundaryProps,
  ErrorBoundaryState
> {
  constructor(props: ErrorBoundaryProps) {
    super(props)
    this.state = { hasError: false, error: null }
  }

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return { hasError: true, error }
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.error('ErrorBoundary caught:', error, errorInfo)
  }

  handleRetry = () => {
    this.setState({ hasError: false, error: null })
  }

  render() {
    if (this.state.hasError) {
      if (this.props.fallback) {
        return this.props.fallback
      }

      const isChinese = this.props.locale === 'zh-CN'
      const title = isChinese ? '出错了' : 'Something went wrong'
      const message = isChinese
        ? '生成过程中出现意外错误，请重试'
        : 'An unexpected error occurred while generating. Please try again.'
      const retryLabel = isChinese ? '重试' : 'Retry'

      return (
        <div className="rounded-2xl border border-red-300 dark:border-red-700 bg-red-50 dark:bg-red-900/30 px-5 py-6 text-center">
          <div className="text-4xl mb-3">😵</div>
          <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-1">
            {title}
          </h3>
          <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
            {message}
          </p>
          <button
            type="button"
            onClick={this.handleRetry}
            className="inline-flex items-center px-4 py-2 bg-indigo-600 text-white text-sm font-medium rounded-xl hover:bg-indigo-700 transition-colors"
          >
            {retryLabel}
          </button>
        </div>
      )
    }

    return this.props.children
  }
}