import { Suspense } from 'react'
import { createClient } from '@/lib/supabase/server'
import Link from 'next/link'
import SearchBar from '@/components/SearchBar'
import ExpandablePostCard from '@/components/ExpandablePostCard'

export const dynamic = 'force-dynamic'

function timeToISO(time: string | undefined): string | null {
  if (!time) return null
  const now = Date.now()
  const ms: Record<string, number> = {
    today: 24 * 60 * 60 * 1000,
    week:   7 * 24 * 60 * 60 * 1000,
    month: 30 * 24 * 60 * 60 * 1000,
    year: 365 * 24 * 60 * 60 * 1000,
  }
  return ms[time] ? new Date(now - ms[time]).toISOString() : null
}

export default async function FeedPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string; time?: string }>
}) {
  const { q, time } = await searchParams
  const keyword = q?.trim() ?? ''
  const supabase = await createClient()

  let query = supabase
    .from('posts')
    .select(`
      id, post_number, topic, body, comments_count, created_at, signature, city,
      agree_count, thought_provoking_count, appreciate_count, curious_count,
      source_type, confidence_level, debate_intent
    `)
    .order('post_number', { ascending: true })
    .limit(keyword || time ? 200 : 50)

  if (keyword) {
    query = query.or(`topic.ilike.%${keyword}%,body.ilike.%${keyword}%`)
  }

  const cutoff = timeToISO(time)
  if (cutoff) {
    query = query.gte('created_at', cutoff)
  }

  const { data: posts } = await query

  const { data: counter } = await supabase
    .from('post_counter')
    .select('current_number')
    .eq('id', 1)
    .single()

  const isSearching = !!(keyword || time)

  return (
    <div>
      <div className="mb-12">
        <h1 className="text-4xl font-bold tracking-tight mb-2 text-stone-900">
          Philosophy Of.
        </h1>
        <p className="text-stone-500 text-base leading-relaxed max-w-lg">
          A space for personal philosophies on specific things. Small talk. Risk. Being late.
          Quitting. Every post is numbered — there are only 100,000 ever. Write in any language. Perspective has no borders. 🌐
        </p>
        {counter && (
          <p className="mt-3 font-mono text-sm text-stone-400">
            {counter.current_number.toLocaleString()} posts remaining
          </p>
        )}
      </div>

      <Suspense>
        <SearchBar />
      </Suspense>

      {isSearching && posts && posts.length > 0 && (
        <p className="text-xs text-stone-400 mb-4 font-mono">
          {posts.length} result{posts.length !== 1 ? 's' : ''}
          {keyword ? ` for "${keyword}"` : ''}
        </p>
      )}

      {!posts || posts.length === 0 ? (
        <div className="text-center py-20 text-stone-400">
          {isSearching ? (
            <>
              <p className="text-lg mb-2">No posts matched your search.</p>
              <p className="text-sm">Try different keywords or a wider time range.</p>
            </>
          ) : (
            <>
              <p className="text-lg mb-2">No posts yet.</p>
              <p className="text-sm">Be the first to write a philosophy.</p>
              <Link href="/new" className="mt-4 inline-block bg-stone-900 text-white px-4 py-2 rounded-md text-sm hover:bg-stone-700 transition-colors">
                Get started
              </Link>
            </>
          )}
        </div>
      ) : (
        <div className="space-y-px">
          {posts.map((post) => (
            <ExpandablePostCard key={post.id} post={post} />
          ))}
        </div>
      )}
    </div>
  )
}
