'use client'

import Link from 'next/link'
import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'

export default function Navbar() {
  const [username, setUsername] = useState<string | null>(null)
  const [counter, setCounter] = useState<number | null>(null)
  const [authed, setAuthed] = useState(false)
  const supabase = createClient()

  useEffect(() => {
    async function load() {
      const { data: { user } } = await supabase.auth.getUser()
      if (user) {
        setAuthed(true)
        const { data: profile } = await supabase
          .from('profiles')
          .select('username')
          .eq('id', user.id)
          .single()
        if (profile) setUsername(profile.username)
      }
    }
    load()

    supabase
      .from('post_counter')
      .select('current_number')
      .eq('id', 1)
      .single()
      .then(({ data }) => { if (data) setCounter(data.current_number) })

    const { data: listener } = supabase.auth.onAuthStateChange(async (event, session) => {
      if (session?.user) {
        setAuthed(true)
        const { data: profile } = await supabase
          .from('profiles')
          .select('username')
          .eq('id', session.user.id)
          .single()
        if (profile) setUsername(profile.username)
      } else {
        setAuthed(false)
        setUsername(null)
      }
    })
    return () => listener.subscription.unsubscribe()
  }, [])

  async function signOut() {
    try {
      await supabase.auth.signOut()
    } catch (_) {
      // ignore — redirect regardless
    }
    window.location.href = '/'
  }

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
          {authed ? (
            <>
              <Link
                href="/new"
                className="bg-stone-900 text-white px-3 py-1.5 rounded-md hover:bg-stone-700 transition-colors text-sm"
              >
                Write
              </Link>
              {username && (
                <Link href={`/profile/${username}`} className="text-stone-600 hover:text-stone-900 transition-colors">
                  {username}
                </Link>
              )}
              <button onClick={signOut} className="text-stone-400 hover:text-stone-700 transition-colors">
                Sign out
              </button>
            </>
          ) : (
            <>
              <Link href="/auth/signin" className="text-stone-600 hover:text-stone-900 transition-colors">
                Sign in
              </Link>
              <Link
                href="/auth/signup"
                className="bg-stone-900 text-white px-3 py-1.5 rounded-md hover:bg-stone-700 transition-colors"
              >
                Join
              </Link>
            </>
          )}
        </div>
      </div>
    </nav>
  )
}
