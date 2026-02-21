'use client'

import { useState } from 'react'
import PostTags from './PostTags'
import QuickComments from './QuickComments'
import CommentSection from './CommentSection'

interface Post {
  id: string
  post_number: number
  topic: string
  body: string
  comments_count: number
  created_at: string
  signature: string | null
  city: string | null
  source_type: string | null
  confidence_level: string | null
  debate_intent: string | null
}

interface Comment {
  id: string
  body: string
  signature: string | null
  created_at: string
}

export default function ExpandablePostCard({ post }: { post: Post }) {
  const [expanded, setExpanded] = useState(false)
  const [comments, setComments] = useState<Comment[]>([])
  const [commentsLoaded, setCommentsLoaded] = useState(false)
  const [commentsCount, setCommentsCount] = useState(post.comments_count)
  const [translatedBody, setTranslatedBody] = useState<string | null>(null)
  const [translating, setTranslating] = useState(false)
  const [shareLabel, setShareLabel] = useState('Share')

  async function toggleExpand() {
    if (!expanded && !commentsLoaded) {
      const res = await fetch(`/api/comments?post_id=${post.id}`)
      if (res.ok) {
        const data: Comment[] = await res.json()
        setComments(data)
        setCommentsLoaded(true)
        setCommentsCount(data.length)
      }
    }
    setExpanded(v => !v)
  }

  async function handleTranslate() {
    if (translatedBody) {
      setTranslatedBody(null)
      return
    }
    setTranslating(true)
    try {
      const lang = (navigator.language || 'en').split('-')[0]
      const res = await fetch(
        `https://api.mymemory.translated.net/get?q=${encodeURIComponent(post.body)}&langpair=autodetect|${lang}`
      )
      const data = await res.json()
      if (data.responseStatus === 200 && data.responseData?.translatedText) {
        setTranslatedBody(data.responseData.translatedText)
      }
    } catch {
      // silently fail
    } finally {
      setTranslating(false)
    }
  }

  async function handleShare() {
    const url = `${window.location.origin}/post/${post.id}`
    if (typeof navigator.share === 'function') {
      try {
        await navigator.share({
          title: `Philosophy of ${post.topic}`,
          text: post.body.slice(0, 120),
          url,
        })
      } catch {
        // user cancelled
      }
    } else {
      try {
        await navigator.clipboard.writeText(url)
        setShareLabel('Link copied!')
        setTimeout(() => setShareLabel('Share'), 2000)
      } catch {
        // clipboard not available
      }
    }
  }

  return (
    <article className="border-t border-stone-200 py-6">
      <div className="flex items-start gap-4">
        <span className="font-mono text-xs text-stone-300 pt-0.5 w-14 shrink-0 text-right">
          #{post.post_number.toLocaleString()}
        </span>
        <div className="flex-1 min-w-0">
          <button onClick={toggleExpand} className="block w-full text-left group">
            <h2 className="text-lg font-semibold text-stone-900 group-hover:text-stone-600 transition-colors leading-snug mb-1">
              Philosophy of {post.topic}
            </h2>
          </button>

          <PostTags
            sourceType={post.source_type}
            confidenceLevel={post.confidence_level}
            debateIntent={post.debate_intent}
          />

          <p
            className={`text-sm leading-relaxed ${
              expanded
                ? 'text-stone-800 whitespace-pre-wrap'
                : 'text-stone-500 line-clamp-2 cursor-pointer'
            }`}
            onClick={!expanded ? toggleExpand : undefined}
          >
            {expanded && translatedBody ? translatedBody : post.body}
          </p>

          <div className="mt-3 flex items-center flex-wrap gap-x-4 gap-y-1 text-xs text-stone-400">
            <span className="font-medium">{post.signature || 'Anonymous'}</span>
            {post.city && <span>{post.city}</span>}
            <span>
              {new Date(post.created_at).toLocaleDateString('en-US', {
                month: 'short',
                day: 'numeric',
                year: 'numeric',
              })}
            </span>
            <button
              onClick={toggleExpand}
              className="hover:text-stone-700 transition-colors"
            >
              {expanded
                ? '↑ collapse'
                : `${commentsCount} ${commentsCount === 1 ? 'comment' : 'comments'} · expand`}
            </button>
          </div>

          {expanded && (
            <div className="mt-6 space-y-6">
              {/* Action buttons: share + translate */}
              <div className="flex flex-wrap gap-2">
                <button
                  onClick={handleShare}
                  className="text-xs text-stone-500 hover:text-stone-800 border border-stone-200 hover:border-stone-400 px-3 py-1 rounded-full transition-colors"
                >
                  {shareLabel}
                </button>
                <button
                  onClick={handleTranslate}
                  disabled={translating}
                  className="text-xs text-stone-500 hover:text-stone-800 border border-stone-200 hover:border-stone-400 px-3 py-1 rounded-full transition-colors disabled:opacity-50"
                >
                  {translating ? 'Translating…' : translatedBody ? 'Show original' : 'Translate'}
                </button>
              </div>

              {/* Quick comments */}
              <div className="border-t border-stone-100 pt-4">
                <QuickComments
                  postId={post.id}
                  onCommentAdded={() => setCommentsCount(c => c + 1)}
                />
              </div>

              {/* Comments */}
              <div className="border-t border-stone-100 pt-4">
                <CommentSection
                  postId={post.id}
                  initialComments={comments}
                  onCommentAdded={() => setCommentsCount(c => c + 1)}
                />
              </div>
            </div>
          )}
        </div>
      </div>
    </article>
  )
}
