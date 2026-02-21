'use client'

import { useState } from 'react'

interface Comment {
  id: string
  body: string
  signature: string | null
  created_at: string
}

interface Props {
  postId: string
  initialComments: Comment[]
  onCommentAdded?: () => void
}

export default function CommentSection({ postId, initialComments, onCommentAdded }: Props) {
  const [comments, setComments] = useState<Comment[]>(initialComments)
  const [body, setBody] = useState('')
  const [signature, setSignature] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!body.trim()) return
    setLoading(true)
    setError('')

    const res = await fetch('/api/comments', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ post_id: postId, body: body.trim(), signature: signature.trim() || null }),
    })

    const data = await res.json()
    if (!res.ok) {
      setError(data.error || 'Failed to post comment')
    } else {
      setComments(prev => [...prev, data])
      setBody('')
      setSignature('')
      onCommentAdded?.()
    }
    setLoading(false)
  }

  return (
    <div>
      <h2 className="text-sm font-semibold text-stone-700 mb-5 uppercase tracking-wider">
        {comments.length} {comments.length === 1 ? 'Comment' : 'Comments'}
      </h2>

      <div className="space-y-6 mb-8">
        {comments.map(comment => (
          <div key={comment.id} className="flex gap-3">
            <div className="flex-1">
              <div className="flex items-center gap-2 mb-1">
                <span className="text-sm font-medium text-stone-700">
                  {comment.signature || 'Anonymous'}
                </span>
                <span className="text-xs text-stone-400">
                  {new Date(comment.created_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                </span>
              </div>
              <p className="text-sm text-stone-600 leading-relaxed">{comment.body}</p>
            </div>
          </div>
        ))}
      </div>

      <form onSubmit={handleSubmit} className="space-y-3">
        <textarea
          value={body}
          onChange={e => setBody(e.target.value)}
          rows={3}
          maxLength={2000}
          placeholder="Add a comment…"
          className="w-full border border-stone-300 rounded-md px-3 py-2 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-stone-400 resize-none"
        />
        <input
          type="text"
          value={signature}
          onChange={e => setSignature(e.target.value)}
          maxLength={50}
          placeholder="Signature (optional)"
          className="w-full border border-stone-300 rounded-md px-3 py-2 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-stone-400"
        />
        {error && <p className="text-red-600 text-xs">{error}</p>}
        <button
          type="submit"
          disabled={loading || !body.trim()}
          className="bg-stone-900 text-white px-4 py-2 rounded-md text-sm font-medium hover:bg-stone-700 transition-colors disabled:opacity-50"
        >
          {loading ? 'Posting…' : 'Post comment'}
        </button>
      </form>
    </div>
  )
}
