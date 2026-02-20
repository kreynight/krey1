'use client'

import { useState, useEffect } from 'react'

type ReactionType = 'agree' | 'thought_provoking' | 'appreciate' | 'curious'

const REACTIONS: { type: ReactionType; label: string }[] = [
  { type: 'agree',             label: 'Agree' },
  { type: 'thought_provoking', label: 'Thought-provoking' },
  { type: 'appreciate',        label: 'Appreciate' },
  { type: 'curious',           label: 'Curious' },
]

interface Counts {
  agree: number
  thought_provoking: number
  appreciate: number
  curious: number
}

interface Props {
  postId:              string
  agreeCount:          number
  thoughtProvokingCount: number
  appreciateCount:     number
  curiousCount:        number
}

export default function ReactionBar({
  postId,
  agreeCount,
  thoughtProvokingCount,
  appreciateCount,
  curiousCount,
}: Props) {
  const [counts, setCounts] = useState<Counts>({
    agree:             agreeCount,
    thought_provoking: thoughtProvokingCount,
    appreciate:        appreciateCount,
    curious:           curiousCount,
  })
  const [active, setActive] = useState<ReactionType | null>(null)
  const [sessionId, setSessionId] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    let sid = localStorage.getItem('session_id')
    if (!sid) {
      sid = crypto.randomUUID()
      localStorage.setItem('session_id', sid)
    }
    setSessionId(sid)

    const stored = JSON.parse(localStorage.getItem('post_reactions') || '{}')
    setActive(stored[postId] ?? null)
  }, [postId])

  async function react(type: ReactionType) {
    if (!sessionId || loading) return
    setLoading(true)

    const prev = { counts: { ...counts }, active }
    const toggling = active === type

    // Optimistic update
    setCounts(c => {
      const next = { ...c }
      if (active) next[active] = Math.max(0, next[active] - 1)
      if (!toggling) next[type] = next[type] + 1
      return next
    })
    setActive(toggling ? null : type)

    const res = await fetch('/api/reactions', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ post_id: postId, session_id: sessionId, reaction_type: type }),
    })

    if (!res.ok) {
      setCounts(prev.counts)
      setActive(prev.active)
    } else {
      const data = await res.json()
      const stored = JSON.parse(localStorage.getItem('post_reactions') || '{}')
      if (data.reaction) {
        stored[postId] = data.reaction
      } else {
        delete stored[postId]
      }
      localStorage.setItem('post_reactions', JSON.stringify(stored))
    }
    setLoading(false)
  }

  return (
    <div className="flex flex-wrap gap-2">
      {REACTIONS.map(({ type, label }) => {
        const count = counts[type]
        const isActive = active === type
        return (
          <button
            key={type}
            onClick={() => react(type)}
            disabled={loading}
            className={`flex items-center gap-1.5 px-3 py-1 rounded-full text-xs border transition-colors ${
              isActive
                ? 'border-stone-700 bg-stone-900 text-white'
                : 'border-stone-200 text-stone-500 hover:border-stone-400 hover:text-stone-700'
            }`}
          >
            {label}
            {count > 0 && (
              <span className="tabular-nums">{count}</span>
            )}
          </button>
        )
      })}
    </div>
  )
}
