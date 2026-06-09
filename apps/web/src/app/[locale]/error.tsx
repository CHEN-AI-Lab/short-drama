'use client'

import { useParams } from 'next/navigation'

export default function ErrorPage({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  const params = useParams()
  const locale = params?.locale as string || 'zh-CN'
  const isChinese = locale === 'zh-CN'

  return (
    <div className="min-h-[60vh] flex items-center justify-center">
      <div className="text-center max-w-md">
        <div className="text-6xl mb-4">😵</div>
        <h1 className="text-2xl font-bold mb-2 text-gray-900 dark:text-white">
          {isChinese ? '出错了' : 'Something went wrong'}
        </h1>
        <p className="text-gray-500 dark:text-gray-400 mb-6">
          {isChinese
            ? '页面遇到了意外错误，请刷新重试'
            : 'The page encountered an unexpected error. Please refresh and try again.'}
        </p>
        <button
          onClick={reset}
          className="px-6 py-2.5 bg-indigo-600 text-white rounded-xl hover:bg-indigo-700 transition-colors"
        >
          {isChinese ? '重试' : 'Retry'}
        </button>
      </div>
    </div>
  )
}