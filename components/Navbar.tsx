'use client'

import Link from 'next/link'
import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'

export default function Navbar() {
  const [counter, setCounter] = useState<number | null>(null)
  const supabase = createClient()

  useEffect(() => {
    supabase
      .from('post_counter')
      .select('current_number')
      .eq('id', 1)
      .single()
      .then(({ data }) => { if (data) setCounter(data.current_number) })
  }, [])

  return (
    <nav className="border-b border-stone-200 bg-[#faf9f7]">
      <div className="max-w-2xl mx-auto px-4 h-14 flex items-center justify-between">
        <Link href="/" className="text-lg font-semibold tracking-tight text-stone-900 hover:opacity-70 transition-opacity">
          Philosophy Of.
        </Link>

        <div className="flex items-center gap-4 text-sm">
          {counter !== null && (
            <span className="text-stone-400 tabular-nums font-mono text-xs hidden sm:block">
              #{counter.toLocaleString()} left
            </span>
          )}
          <Link
            href="/new"
            className="bg-stone-900 text-white px-3 py-1.5 rounded-md hover:bg-stone-700 transition-colors text-sm"
          >
            Write
          </Link>
        </div>
      </div>
    </nav>
  )
}
