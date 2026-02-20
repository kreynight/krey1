import { createClient } from '@/lib/supabase/server'
import Link from 'next/link'
import { notFound } from 'next/navigation'
import LikeButton from '@/components/LikeButton'
import CommentSection from '@/components/CommentSection'

export const dynamic = 'force-dynamic'

export default async function PostPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const supabase = await createClient()

  const { data: post } = await supabase
    .from('posts')
    .select('id, post_number, topic, body, likes_count, comments_count, created_at, signature')
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
        <div className="mt-3 flex items-center gap-3 text-sm text-stone-400">
          <span className="font-medium text-stone-600">{post.signature || 'Anonymous'}</span>
          <span>·</span>
          <time>{new Date(post.created_at).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}</time>
        </div>
      </div>

      {/* Body */}
      <div className="prose-post text-stone-800 mb-10">
        {post.body}
      </div>

      {/* Divider */}
      <div className="border-t border-stone-200 pt-6 mb-8 flex items-center gap-6">
        <LikeButton postId={post.id} initialLikes={post.likes_count} />
        <span className="text-sm text-stone-400">{post.comments_count} {post.comments_count === 1 ? 'comment' : 'comments'}</span>
      </div>

      {/* Comments */}
      <CommentSection postId={post.id} initialComments={comments ?? []} />
    </article>
  )
}
