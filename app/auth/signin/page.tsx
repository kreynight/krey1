'use client'

import { useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import Link from 'next/link'
import { useRouter } from 'next/navigation'

export default function SignInPage() {
  const supabase = createClient()
  const router = useRouter()

  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    setError('')

    const { error } = await supabase.auth.signInWithPassword({ email, password })

    if (error) {
      // Translate Supabase's generic error into something friendlier
      if (error.message.toLowerCase().includes('invalid login')) {
        setError('Incorrect email or password.')
      } else if (error.message.toLowerCase().includes('email not confirmed')) {
        setError('Please confirm your email first — check your inbox for a link from us.')
      } else {
        setError(error.message)
      }
      setLoading(false)
      return
    }

    router.push('/')
    router.refresh()
  }

  return (
    <div className="max-w-sm mx-auto mt-20">
      <h1 className="text-2xl font-semibold mb-1">Sign in</h1>
      <p className="text-stone-500 text-sm mb-8">Welcome back.</p>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-sm font-medium mb-1.5 text-stone-700" htmlFor="email">
            Email
          </label>
          <input
            id="email"
            type="email"
            required
            autoFocus
            value={email}
            onChange={e => setEmail(e.target.value)}
            className="w-full border border-stone-300 rounded-md px-3 py-2 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-stone-400"
          />
        </div>

        <div>
          <label className="block text-sm font-medium mb-1.5 text-stone-700" htmlFor="password">
            Password
          </label>
          <input
            id="password"
            type="password"
            required
            value={password}
            onChange={e => setPassword(e.target.value)}
            className="w-full border border-stone-300 rounded-md px-3 py-2 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-stone-400"
          />
        </div>

        {error && (
          <p className="text-red-600 text-sm bg-red-50 border border-red-200 rounded-md px-3 py-2">
            {error}
          </p>
        )}

        <button
          type="submit"
          disabled={loading}
          className="w-full bg-stone-900 text-white py-2.5 rounded-md text-sm font-medium hover:bg-stone-700 transition-colors disabled:opacity-50"
        >
          {loading ? 'Signing in…' : 'Sign in'}
        </button>
      </form>

      <p className="mt-6 text-sm text-stone-500 text-center">
        No account yet?{' '}
        <Link href="/auth/signup" className="text-stone-900 underline">
          Join
        </Link>
      </p>
    </div>
  )
}
