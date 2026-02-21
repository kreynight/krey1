import { createClient } from '@/lib/supabase/server'
import Link from 'next/link'
import { notFound } from 'next/navigation'
import ReactionBar from '@/components/ReactionBar'
import CommentSection from '@/components/CommentSection'
import PostTags from '@/components/PostTags'

export const dynamic = 'force-dynamic'

export default async function PostPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const supabase = await createClient()

  const { data: post } = await supabase
    .from('posts')
    .select(`
      id, post_number, topic, body, comments_count, created_at, signature, city,
      agree_count, thought_provoking_count, appreciate_count, curious_count,
      source_type, confidence_level, debate_intent
    `)
    .eq('id', id)
    .single()

  if (!post) notFound()

  const { data: comments } = await supabase
    .from('comments')
    .select('id, body, signature, created_at')
    .eq('post_id', id)
    .order('created_at', { ascending: true })

  return (
    <article>
      {/* Header */}
      <div className="mb-8">
        <Link href="/" className="text-xs text-stone-400 hover:text-stone-700 transition-colors">
          ← Feed
        </Link>
        <p className="mt-4 font-mono text-xs text-stone-300">#{post.post_number.toLocaleString()}</p>
        <h1 className="mt-2 text-3xl font-bold tracking-tight text-stone-900 leading-tight">
          Philosophy of {post.topic}
        </h1>
        <PostTags
          sourceType={post.source_type}
          confidenceLevel={post.confidence_level}
          debateIntent={post.debate_intent}
        />
        <div className="mt-2 flex items-center gap-3 text-sm text-stone-400">
          <span className="font-medium text-stone-600">{post.signature || 'Anonymous'}</span>
          {post.city && <><span>·</span><span>{post.city}</span></>}
          <span>·</span>
          <time>{new Date(post.created_at).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}</time>
        </div>
      </div>

      {/* Body */}
      <div className="prose-post text-stone-800 mb-10">
        {post.body}
      </div>

      {/* Reactions + comment count */}
      <div className="border-t border-stone-200 pt-6 mb-8 space-y-3">
        <ReactionBar
          postId={post.id}
          agreeCount={post.agree_count}
          thoughtProvokingCount={post.thought_provoking_count}
          appreciateCount={post.appreciate_count}
          curiousCount={post.curious_count}
        />
        <p className="text-xs text-stone-400">{post.comments_count} {post.comments_count === 1 ? 'comment' : 'comments'}</p>
      </div>

      {/* Comments */}
      <CommentSection postId={post.id} initialComments={comments ?? []} />
    </article>
  )
}
