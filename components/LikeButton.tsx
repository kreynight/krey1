'use client'

import { useState, useEffect } from 'react'

interface Props {
  postId: string
  initialLikes: number
}

export default function LikeButton({ postId, initialLikes }: Props) {
  const [liked, setLiked] = useState(false)
  const [count, setCount] = useState(initialLikes)
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    const stored = JSON.parse(localStorage.getItem('liked_posts') || '[]') as string[]
    setLiked(stored.includes(postId))
  }, [postId])

  async function toggle() {
    setLoading(true)
    const newLiked = !liked
    setLiked(newLiked)
    setCount(c => newLiked ? c + 1 : c - 1)

    const res = await fetch('/api/likes', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ post_id: postId, liked }),
    })

    if (!res.ok) {
      setLiked(!newLiked)
      setCount(c => newLiked ? c - 1 : c + 1)
    } else {
      const stored = JSON.parse(localStorage.getItem('liked_posts') || '[]') as string[]
      if (newLiked) {
        localStorage.setItem('liked_posts', JSON.stringify([...stored, postId]))
      } else {
        localStorage.setItem('liked_posts', JSON.stringify(stored.filter((id: string) => id !== postId)))
      }
    }
    setLoading(false)
  }

  return (
    <button
      onClick={toggle}
      disabled={loading}
      className={`flex items-center gap-2 text-sm transition-colors ${
        liked ? 'text-stone-900 font-medium' : 'text-stone-400 hover:text-stone-700'
      }`}
    >
      <svg
        width="16" height="16" viewBox="0 0 24 24"
        fill={liked ? 'currentColor' : 'none'}
        stroke="currentColor" strokeWidth="2"
        strokeLinecap="round" strokeLinejoin="round"
      >
        <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/>
      </svg>
      {count} {count === 1 ? 'like' : 'likes'}
    </button>
  )
}
