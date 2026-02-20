'use client'

import { useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import Link from 'next/link'
import { useRouter } from 'next/navigation'

type PhasePhone = 'idle' | 'code_sent'

export default function SignInPage() {
  const supabase = createClient()
  const router = useRouter()

  // email/password
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')

  // phone OTP
  const [phone, setPhone] = useState('')
  const [otp, setOtp] = useState('')
  const [phonePhase, setPhonePhase] = useState<PhasePhone>('idle')

  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  // ── Google ────────────────────────────────────────────────────────────────
  async function signInWithGoogle() {
    setError('')
    await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: { redirectTo: `${window.location.origin}/auth/callback` },
    })
  }

  // ── Phone: send OTP ───────────────────────────────────────────────────────
  async function sendOtp(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    setError('')
    const { error } = await supabase.auth.signInWithOtp({ phone })
    if (error) {
      setError(error.message)
    } else {
      setPhonePhase('code_sent')
    }
    setLoading(false)
  }

  // ── Phone: verify OTP ─────────────────────────────────────────────────────
  async function verifyOtp(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    setError('')
    const { error } = await supabase.auth.verifyOtp({ phone, token: otp, type: 'sms' })
    if (error) {
      setError(error.message)
      setLoading(false)
    } else {
      router.push('/')
      router.refresh()
    }
  }

  // ── Email / password ──────────────────────────────────────────────────────
  async function signInEmail(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    setError('')
    const { error } = await supabase.auth.signInWithPassword({ email, password })
    if (error) {
      setError(error.message)
      setLoading(false)
    } else {
      router.push('/')
      router.refresh()
    }
  }

  return (
    <div className="max-w-sm mx-auto mt-16">
      <h1 className="text-2xl font-semibold mb-1">Sign in</h1>
      <p className="text-stone-500 text-sm mb-8">Welcome back.</p>

      {/* ── Google ── */}
      <button
        onClick={signInWithGoogle}
        className="w-full flex items-center justify-center gap-3 border border-stone-300 bg-white rounded-md px-4 py-2.5 text-sm font-medium text-stone-700 hover:bg-stone-50 transition-colors"
      >
        <GoogleIcon />
        Continue with Google
      </button>

      <Divider />

      {/* ── Phone OTP ── */}
      {phonePhase === 'idle' ? (
        <form onSubmit={sendOtp} className="space-y-3">
          <div>
            <label className="block text-sm font-medium mb-1.5 text-stone-700" htmlFor="phone">
              Phone number
            </label>
            <div className="flex gap-2">
              <input
                id="phone"
                type="tel"
                required
                value={phone}
                onChange={e => setPhone(e.target.value)}
                placeholder="+1 555 000 0000"
                className="flex-1 border border-stone-300 rounded-md px-3 py-2 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-stone-400"
              />
              <button
                type="submit"
                disabled={loading || !phone}
                className="bg-stone-900 text-white px-4 py-2 rounded-md text-sm font-medium hover:bg-stone-700 transition-colors disabled:opacity-50 whitespace-nowrap"
              >
                {loading ? '…' : 'Send code'}
              </button>
            </div>
            <p className="mt-1 text-xs text-stone-400">Include country code, e.g. +1 for US</p>
          </div>
          {error && <p className="text-red-600 text-xs">{error}</p>}
        </form>
      ) : (
        <form onSubmit={verifyOtp} className="space-y-3">
          <p className="text-sm text-stone-500">Code sent to <strong className="text-stone-800">{phone}</strong></p>
          <div>
            <label className="block text-sm font-medium mb-1.5 text-stone-700" htmlFor="otp">
              6-digit code
            </label>
            <input
              id="otp"
              type="text"
              inputMode="numeric"
              pattern="\d{6}"
              maxLength={6}
              required
              value={otp}
              onChange={e => setOtp(e.target.value.replace(/\D/g, ''))}
              placeholder="123456"
              className="w-full border border-stone-300 rounded-md px-3 py-2 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-stone-400 tracking-widest font-mono"
              autoFocus
            />
          </div>
          {error && <p className="text-red-600 text-xs">{error}</p>}
          <div className="flex gap-3">
            <button
              type="submit"
              disabled={loading || otp.length < 6}
              className="bg-stone-900 text-white px-5 py-2 rounded-md text-sm font-medium hover:bg-stone-700 transition-colors disabled:opacity-50"
            >
              {loading ? 'Verifying…' : 'Verify'}
            </button>
            <button
              type="button"
              onClick={() => { setPhonePhase('idle'); setOtp(''); setError('') }}
              className="text-sm text-stone-400 hover:text-stone-700 transition-colors"
            >
              Change number
            </button>
          </div>
        </form>
      )}

      <Divider />

      {/* ── Email / password ── */}
      <form onSubmit={signInEmail} className="space-y-3">
        <div>
          <label className="block text-sm font-medium mb-1.5 text-stone-700" htmlFor="email">Email</label>
          <input
            id="email"
            type="email"
            required
            value={email}
            onChange={e => setEmail(e.target.value)}
            className="w-full border border-stone-300 rounded-md px-3 py-2 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-stone-400"
          />
        </div>
        <div>
          <label className="block text-sm font-medium mb-1.5 text-stone-700" htmlFor="password">Password</label>
          <input
            id="password"
            type="password"
            required
            value={password}
            onChange={e => setPassword(e.target.value)}
            className="w-full border border-stone-300 rounded-md px-3 py-2 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-stone-400"
          />
        </div>
        {error && <p className="text-red-600 text-xs">{error}</p>}
        <button
          type="submit"
          disabled={loading}
          className="w-full bg-stone-900 text-white py-2.5 rounded-md text-sm font-medium hover:bg-stone-700 transition-colors disabled:opacity-50"
        >
          {loading ? 'Signing in…' : 'Sign in with email'}
        </button>
      </form>

      <p className="mt-6 text-sm text-stone-500 text-center">
        No account yet?{' '}
        <Link href="/auth/signup" className="text-stone-900 underline">Join</Link>
      </p>
    </div>
  )
}

function Divider() {
  return (
    <div className="flex items-center gap-3 my-5">
      <div className="flex-1 h-px bg-stone-200" />
      <span className="text-xs text-stone-400">or</span>
      <div className="flex-1 h-px bg-stone-200" />
    </div>
  )
}

function GoogleIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 18 18">
      <path fill="#4285F4" d="M17.64 9.2c0-.637-.057-1.251-.164-1.84H9v3.481h4.844c-.209 1.125-.843 2.078-1.796 2.717v2.258h2.908c1.702-1.567 2.684-3.875 2.684-6.615z"/>
      <path fill="#34A853" d="M9 18c2.43 0 4.467-.806 5.956-2.184l-2.908-2.258c-.806.54-1.837.859-3.048.859-2.344 0-4.328-1.584-5.036-3.711H.957v2.332C2.438 15.983 5.482 18 9 18z"/>
      <path fill="#FBBC05" d="M3.964 10.71c-.18-.54-.282-1.117-.282-1.71s.102-1.17.282-1.71V4.958H.957C.347 6.173 0 7.548 0 9s.348 2.827.957 4.042l3.007-2.332z"/>
      <path fill="#EA4335" d="M9 3.58c1.321 0 2.508.454 3.44 1.345l2.582-2.58C13.463.891 11.426 0 9 0 5.482 0 2.438 2.017.957 4.958L3.964 6.29C4.672 4.163 6.656 3.58 9 3.58z"/>
    </svg>
  )
}
