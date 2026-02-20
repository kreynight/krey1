import { createClient } from '@/lib/supabase/server'
import Link from 'next/link'

export const dynamic = 'force-dynamic'

export default async function FeedPage() {
  const supabase = await createClient()

  const { data: posts } = await supabase
    .from('posts')
    .select('id, post_number, topic, body, likes_count, comments_count, created_at, signature')
    .order('post_number', { ascending: true })
    .limit(50)

  const { data: counter } = await supabase
    .from('post_counter')
    .select('current_number')
    .eq('id', 1)
    .single()

  return (
    <div>
      <div className="mb-12">
        <h1 className="text-4xl font-bold tracking-tight mb-2 text-stone-900">
          Philosophy Of.
        </h1>
        <p className="text-stone-500 text-base leading-relaxed max-w-lg">
          A space for personal philosophies on specific things. Small talk. Risk. Being late.
          Quitting. Every post is numbered — there are only 100,000 ever.
        </p>
        {counter && (
          <p className="mt-3 font-mono text-sm text-stone-400">
            {counter.current_number.toLocaleString()} posts remaining
          </p>
        )}
      </div>

      {!posts || posts.length === 0 ? (
        <div className="text-center py-20 text-stone-400">
          <p className="text-lg mb-2">No posts yet.</p>
          <p className="text-sm">Be the first to write a philosophy.</p>
          <Link href="/new" className="mt-4 inline-block bg-stone-900 text-white px-4 py-2 rounded-md text-sm hover:bg-stone-700 transition-colors">
            Get started
          </Link>
        </div>
      ) : (
        <div className="space-y-px">
          {posts.map((post) => (
            <article key={post.id} className="group border-t border-stone-200 py-6">
              <div className="flex items-start gap-4">
                <span className="font-mono text-xs text-stone-300 pt-0.5 w-14 shrink-0 text-right">
                  #{post.post_number.toLocaleString()}
                </span>
                <div className="flex-1 min-w-0">
                  <Link href={`/post/${post.id}`} className="block">
                    <h2 className="text-lg font-semibold text-stone-900 group-hover:text-stone-600 transition-colors leading-snug mb-2">
                      Philosophy of {post.topic}
                    </h2>
                  </Link>
                  <p className="text-stone-500 text-sm line-clamp-2 leading-relaxed">
                    {post.body}
                  </p>
                  <div className="mt-3 flex items-center gap-4 text-xs text-stone-400">
                    <span className="font-medium">{post.signature || 'Anonymous'}</span>
                    <span>{new Date(post.created_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}</span>
                    <span>{post.likes_count} {post.likes_count === 1 ? 'like' : 'likes'}</span>
                    <span>{post.comments_count} {post.comments_count === 1 ? 'comment' : 'comments'}</span>
                  </div>
                </div>
              </div>
            </article>
          ))}
        </div>
      )}
    </div>
  )
}
