import './globals.css'
import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: '振钢大厦 API',
  description: '振钢大厦管理系统 API 服务',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="zh-CN">
      <body>{children}</body>
    </html>
  )
} 