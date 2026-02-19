'use client'

import { useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'

interface Props {
  currentUsername: string
  currentBio: string
}

export default function EditProfileForm({ currentUsername, currentBio }: Props) {
  const [open, setOpen] = useState(false)
  const [username, setUsername] = useState(currentUsername)
  const [bio, setBio] = useState(currentBio)
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const router = useRouter()
  const supabase = createClient()

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    setError('')

    const { data: { user } } = await supabase.auth.getUser()
    if (!user) { setError('Not authenticated'); setLoading(false); return }

    const { error } = await supabase
      .from('profiles')
      .update({ username: username.trim(), bio: bio.trim() })
      .eq('id', user.id)

    if (error) {
      setError(error.message.includes('unique') ? 'That username is already taken' : error.message)
      setLoading(false)
    } else {
      setOpen(false)
      router.push(`/profile/${username.trim()}`)
      router.refresh()
    }
  }

  if (!open) {
    return (
      <button
        onClick={() => setOpen(true)}
        className="text-sm text-stone-500 hover:text-stone-800 underline transition-colors"
      >
        Edit profile
      </button>
    )
  }

  return (
    <form onSubmit={handleSubmit} className="border border-stone-200 rounded-lg p-4 bg-white space-y-4 max-w-sm">
      <div>
        <label className="block text-xs font-medium mb-1 text-stone-600" htmlFor="ep-username">Username</label>
        <input
          id="ep-username"
          type="text"
          required
          maxLength={30}
          value={username}
          onChange={e => setUsername(e.target.value.toLowerCase().replace(/[^a-z0-9_]/g, ''))}
          className="w-full border border-stone-300 rounded-md px-3 py-1.5 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-stone-400"
        />
        <p className="mt-0.5 text-xs text-stone-400">Lowercase letters, numbers, and underscores only.</p>
      </div>
      <div>
        <label className="block text-xs font-medium mb-1 text-stone-600" htmlFor="ep-bio">Bio</label>
        <textarea
          id="ep-bio"
          rows={2}
          maxLength={200}
          value={bio}
          onChange={e => setBio(e.target.value)}
          className="w-full border border-stone-300 rounded-md px-3 py-1.5 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-stone-400 resize-none"
          placeholder="A short bio…"
        />
      </div>

      {error && <p className="text-red-600 text-xs">{error}</p>}

      <div className="flex gap-2">
        <button
          type="submit"
          disabled={loading}
          className="bg-stone-900 text-white px-4 py-1.5 rounded-md text-sm font-medium hover:bg-stone-700 transition-colors disabled:opacity-50"
        >
          {loading ? 'Saving…' : 'Save'}
        </button>
        <button
          type="button"
          onClick={() => { setOpen(false); setUsername(currentUsername); setBio(currentBio) }}
          className="text-sm text-stone-500 hover:text-stone-800 transition-colors"
        >
          Cancel
        </button>
      </div>
    </form>
  )
}
