'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'

export default function NewPostPage() {
  const [topic, setTopic] = useState('')
  const [title, setTitle] = useState('')
  const [body, setBody] = useState('')
  const [signature, setSignature] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const router = useRouter()

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    setError('')

    const res = await fetch('/api/posts', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        topic: topic.trim(),
        title: title.trim(),
        body: body.trim(),
        signature: signature.trim() || null,
      }),
    })

    const data = await res.json()
    if (!res.ok) {
      setError(data.error || 'Something went wrong')
      setLoading(false)
    } else {
      router.push(`/post/${data.id}`)
    }
  }

  return (
    <div className="max-w-xl mx-auto">
      <h1 className="text-2xl font-semibold mb-1 text-stone-900">New Philosophy</h1>
      <p className="text-stone-500 text-sm mb-8">
        What&apos;s your philosophy on something specific? Be direct. Be personal.
      </p>

      <form onSubmit={handleSubmit} className="space-y-5">
        <div>
          <label className="block text-sm font-medium mb-1.5 text-stone-700" htmlFor="topic">
            Topic
          </label>
          <div className="flex items-center border border-stone-300 rounded-md bg-white overflow-hidden focus-within:ring-2 focus-within:ring-stone-400">
            <span className="pl-3 pr-1 text-stone-400 text-sm whitespace-nowrap select-none">Philosophy of</span>
            <input
              id="topic"
              type="text"
              required
              maxLength={80}
              value={topic}
              onChange={e => setTopic(e.target.value)}
              className="flex-1 py-2 pr-3 text-sm bg-transparent focus:outline-none"
              placeholder="being late"
            />
          </div>
          <p className="mt-1 text-xs text-stone-400">e.g. "being late", "small talk", "quitting", "risk"</p>
        </div>

        <div>
          <label className="block text-sm font-medium mb-1.5 text-stone-700" htmlFor="title">
            Title
          </label>
          <input
            id="title"
            type="text"
            required
            maxLength={150}
            value={title}
            onChange={e => setTitle(e.target.value)}
            className="w-full border border-stone-300 rounded-md px-3 py-2 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-stone-400"
            placeholder="Lateness is a form of optimism"
          />
        </div>

        <div>
          <label className="block text-sm font-medium mb-1.5 text-stone-700" htmlFor="body">
            Your philosophy
          </label>
          <textarea
            id="body"
            required
            rows={10}
            maxLength={10000}
            value={body}
            onChange={e => setBody(e.target.value)}
            className="w-full border border-stone-300 rounded-md px-3 py-2 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-stone-400 resize-y leading-relaxed"
            placeholder="Write your philosophy here…"
          />
          <p className="mt-1 text-xs text-stone-400 text-right">{body.length}/10,000</p>
        </div>

        <div>
          <label className="block text-sm font-medium mb-1.5 text-stone-700" htmlFor="signature">
            Signature <span className="text-stone-400 font-normal">(optional)</span>
          </label>
          <input
            id="signature"
            type="text"
            maxLength={50}
            value={signature}
            onChange={e => setSignature(e.target.value)}
            className="w-full border border-stone-300 rounded-md px-3 py-2 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-stone-400"
            placeholder="How you'd like to be known"
          />
          <p className="mt-1 text-xs text-stone-400">Leave blank to post anonymously</p>
        </div>

        {error && <p className="text-red-600 text-sm">{error}</p>}

        <button
          type="submit"
          disabled={loading}
          className="bg-stone-900 text-white px-6 py-2.5 rounded-md text-sm font-medium hover:bg-stone-700 transition-colors disabled:opacity-50"
        >
          {loading ? 'Publishing…' : 'Publish'}
        </button>
      </form>
    </div>
  )
}
