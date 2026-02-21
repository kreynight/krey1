'use client'

import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'

function getSessionId(): string {
  const key = 'po_session_id'
  let id = localStorage.getItem(key)
  if (!id) {
    id = crypto.randomUUID()
    localStorage.setItem(key, id)
  }
  return id
}

export default function ActiveUsers() {
  const [count, setCount] = useState<number | null>(null)

  useEffect(() => {
    const supabase = createClient()
    const sessionId = getSessionId()

    const ping = async () => {
      const { data } = await supabase.rpc('ping_active_session', { p_session_id: sessionId })
      if (typeof data === 'number') setCount(data)
    }

    ping()
    const interval = setInterval(ping, 60_000)
    return () => clearInterval(interval)
  }, [])

  if (count === null) return null

  return (
    <span className="hidden sm:flex items-center gap-1.5 text-xs text-stone-400 font-mono">
      <span className="w-1.5 h-1.5 rounded-full bg-green-400 shrink-0" />
      {count} online
    </span>
  )
}
