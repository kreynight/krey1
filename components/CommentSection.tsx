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
  const [translations, setTranslations] = useState<Record<string, string>>({})
  const [translatingId, setTranslatingId] = useState<string | null>(null)

  async function translateComment(comment: Comment) {
    if (translations[comment.id]) {
      setTranslations(prev => { const next = { ...prev }; delete next[comment.id]; return next })
      return
    }
    setTranslatingId(comment.id)
    try {
      const lang = (navigator.language || 'en').split('-')[0]
      const res = await fetch(
        `https://api.mymemory.translated.net/get?q=${encodeURIComponent(comment.body)}&langpair=autodetect|${lang}`
      )
      const data = await res.json()
      if (data.responseStatus === 200 && data.responseData?.translatedText) {
        setTranslations(prev => ({ ...prev, [comment.id]: data.responseData.translatedText }))
      }
    } catch {
      // silently fail
    } finally {
      setTranslatingId(null)
    }
  }

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
              <p className="text-sm text-stone-600 leading-relaxed">
                {translations[comment.id] ?? comment.body}
              </p>
              <button
                onClick={() => translateComment(comment)}
                disabled={translatingId === comment.id}
                className="mt-1 text-[11px] text-stone-400 hover:text-stone-600 transition-colors disabled:opacity-50"
              >
                {translatingId === comment.id
                  ? 'Translating…'
                  : translations[comment.id]
                  ? 'Show original'
                  : 'Translate'}
              </button>
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
