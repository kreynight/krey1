import type { Metadata } from 'next'
import './globals.css'
import Navbar from '@/components/Navbar'

export const metadata: Metadata = {
  title: 'Philosophy Of.',
  description: "Share your philosophy on the things that matter — and the things that don't.",
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className="min-h-screen antialiased">
        <Navbar />
        <main className="max-w-2xl mx-auto px-4 py-10">
          {children}
        </main>
      </body>
    </html>
  )
}
