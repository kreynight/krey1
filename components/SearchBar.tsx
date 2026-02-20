'use client'

import { useRouter, useSearchParams, usePathname } from 'next/navigation'
import { useCallback, useState } from 'react'

const TIME_OPTIONS = [
  { label: 'All time',   value: '' },
  { label: 'Today',      value: 'today' },
  { label: 'This week',  value: 'week' },
  { label: 'This month', value: 'month' },
  { label: 'This year',  value: 'year' },
]

export default function SearchBar() {
  const router   = useRouter()
  const pathname = usePathname()
  const searchParams = useSearchParams()

  const [keyword, setKeyword] = useState(searchParams.get('q') ?? '')

  const updateParams = useCallback(
    (updates: Record<string, string>) => {
      const params = new URLSearchParams(searchParams.toString())
      for (const [key, value] of Object.entries(updates)) {
        if (value) params.set(key, value)
        else params.delete(key)
      }
      const qs = params.toString()
      router.push(qs ? `${pathname}?${qs}` : pathname)
    },
    [router, pathname, searchParams],
  )

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    updateParams({ q: keyword.trim() })
  }

  const handleClear = () => {
    setKeyword('')
    updateParams({ q: '', time: '' })
  }

  const activeTime = searchParams.get('time') ?? ''
  const hasFilters = !!keyword || !!activeTime

  return (
    <div className="mb-8">
      <form onSubmit={handleSubmit} className="flex gap-2 mb-3">
        <input
          type="text"
          value={keyword}
          onChange={e => setKeyword(e.target.value)}
          placeholder="Search philosophies…"
          className="flex-1 text-sm border border-stone-200 rounded-md px-3 py-2 text-stone-900 placeholder:text-stone-400 focus:outline-none focus:ring-1 focus:ring-stone-400 bg-white"
        />
        <button
          type="submit"
          className="px-4 py-2 text-sm bg-stone-900 text-white rounded-md hover:bg-stone-700 transition-colors"
        >
          Search
        </button>
        {hasFilters && (
          <button
            type="button"
            onClick={handleClear}
            className="px-3 py-2 text-sm text-stone-500 border border-stone-200 rounded-md hover:bg-stone-50 transition-colors"
          >
            Clear
          </button>
        )}
      </form>

      <div className="flex gap-1.5 flex-wrap">
        {TIME_OPTIONS.map(opt => (
          <button
            key={opt.value || 'all'}
            type="button"
            onClick={() => updateParams({ time: opt.value })}
            className={`text-xs px-3 py-1 rounded-full border transition-colors ${
              activeTime === opt.value
                ? 'bg-stone-900 text-white border-stone-900'
                : 'text-stone-500 border-stone-200 hover:border-stone-400'
            }`}
          >
            {opt.label}
          </button>
        ))}
      </div>
    </div>
  )
}
