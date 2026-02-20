import type { Metadata } from 'next'
import './globals.css'
import Navbar from '@/components/Navbar'
import Link from 'next/link'

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
        <footer className="border-t border-stone-200 mt-8">
          <div className="max-w-2xl mx-auto px-4 py-5 flex items-center justify-between text-xs text-stone-400">
            <span>Philosophy Of.</span>
            <Link href="/about" className="hover:text-stone-700 transition-colors">About</Link>
          </div>
        </footer>
      </body>
    </html>
  )
}
