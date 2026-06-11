import './globals.css'
import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: {
    default: '短剧工坊 - AI Short Drama Studio',
    template: '%s | 短剧工坊 - AI Short Drama Studio',
  },
  description: '输入题材，AI 自动生成短剧剧本 — 霸总、穿越、甜宠、仙侠，一键生成专业短剧脚本',
  icons: {
    icon: '/icon.svg',
  },
  openGraph: {
    title: '短剧工坊 - AI Short Drama Studio',
    description: 'AI 驱动短剧剧本生成器，输入题材一键生成专业剧本',
    type: 'website',
    locale: 'zh_CN',
  },
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="zh-CN" suppressHydrationWarning>
      <body className="min-h-screen bg-gray-50 text-gray-900 dark:bg-gray-950 dark:text-gray-100 transition-colors antialiased">
        {children}
      </body>
    </html>
  )
}
