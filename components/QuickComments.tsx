'use client'

import { useState } from 'react'

const OPTIONS = ['Agree', 'Thought-provoking', 'Appreciate', 'Curious'] as const

interface Props {
  postId: string
  onCommentAdded?: () => void
}

export default function QuickComments({ postId, onCommentAdded }: Props) {
  const [pending, setPending] = useState<string | null>(null)
  const [signature, setSignature] = useState('')
  const [posting, setPosting] = useState(false)

  function select(label: string) {
    if (pending === label) {
      setPending(null)
      setSignature('')
    } else {
      setPending(label)
    }
  }

  async function confirm() {
    if (!pending) return
    setPosting(true)
    try {
      const res = await fetch('/api/comments', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          post_id: postId,
          body: pending,
          signature: signature.trim() || null,
        }),
      })
      if (res.ok) {
        onCommentAdded?.()
        setPending(null)
        setSignature('')
      }
    } finally {
      setPosting(false)
    }
  }

  return (
    <div>
      <p className="text-xs text-stone-400 mb-2">Quick comment</p>
      <div className="flex flex-wrap gap-2">
        {OPTIONS.map(label => (
          <button
            key={label}
            onClick={() => select(label)}
            className={`text-xs px-3 py-1 rounded-full border transition-colors ${
              pending === label
                ? 'border-stone-700 bg-stone-900 text-white'
                : 'border-stone-200 text-stone-500 hover:border-stone-400 hover:text-stone-700'
            }`}
          >
            {label}
          </button>
        ))}
      </div>

      {pending && (
        <div className="mt-3 flex flex-wrap items-center gap-2">
          <span className="text-xs text-stone-500">
            Post &ldquo;{pending}&rdquo; as a quick comment?
          </span>
          <input
            type="text"
            value={signature}
            onChange={e => setSignature(e.target.value)}
            maxLength={50}
            placeholder="Your name (optional)"
            className="border border-stone-300 rounded px-2 py-1 text-xs bg-white focus:outline-none focus:ring-1 focus:ring-stone-400 w-36"
          />
          <button
            onClick={confirm}
            disabled={posting}
            className="text-xs bg-stone-900 text-white px-3 py-1 rounded-full hover:bg-stone-700 transition-colors disabled:opacity-50"
          >
            {posting ? 'Posting…' : 'Post'}
          </button>
          <button
            onClick={() => { setPending(null); setSignature('') }}
            className="text-xs text-stone-400 hover:text-stone-600 transition-colors"
          >
            Cancel
          </button>
        </div>
      )}
    </div>
  )
}
