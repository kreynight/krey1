'use client'

import { useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import Link from 'next/link'

export default function SignUpPage() {
  const supabase = createClient()

  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    setError('')

    const { data, error } = await supabase.auth.signUp({ email, password })

    if (error) {
      setError(error.message)
      setLoading(false)
      return
    }

    // If email confirmation is disabled in Supabase, the session is created
    // immediately and we can redirect. Otherwise, prompt them to check email.
    if (data.session) {
      window.location.href = '/'
    } else {
      window.location.href = '/auth/confirm?email=' + encodeURIComponent(email)
    }
  }

  return (
    <div className="max-w-sm mx-auto mt-20">
      <h1 className="text-2xl font-semibold mb-1">Join Philosophy Of.</h1>
      <p className="text-stone-500 text-sm mb-8">
        Share your take on anything. Every post counts — literally.
      </p>

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
            placeholder="you@example.com"
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
            minLength={6}
            value={password}
            onChange={e => setPassword(e.target.value)}
            className="w-full border border-stone-300 rounded-md px-3 py-2 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-stone-400"
            placeholder="At least 6 characters"
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
          {loading ? 'Creating account…' : 'Create account'}
        </button>
      </form>

      <p className="mt-6 text-sm text-stone-500 text-center">
        Already have an account?{' '}
        <Link href="/auth/signin" className="text-stone-900 underline">
          Sign in
        </Link>
      </p>
    </div>
  )
}
