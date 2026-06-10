import './globals.css'
import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: '短剧工坊 - AI Short Drama Studio',
  description: '输入题材，AI 自动生成短剧剧本',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return children
}
