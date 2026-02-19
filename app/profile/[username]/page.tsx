import { createClient } from '@/lib/supabase/server'
import Link from 'next/link'
import { notFound } from 'next/navigation'
import EditProfileForm from '@/components/EditProfileForm'

export const revalidate = 0

export default async function ProfilePage({ params }: { params: Promise<{ username: string }> }) {
  const { username } = await params
  const supabase = await createClient()

  const { data: { user: currentUser } } = await supabase.auth.getUser()

  const { data: profile } = await supabase
    .from('profiles')
    .select('id, username, bio, created_at')
    .eq('username', username)
    .single()

  if (!profile) notFound()

  const { data: posts } = await supabase
    .from('posts')
    .select('id, post_number, topic, title, likes_count, comments_count, created_at')
    .eq('author_id', profile.id)
    .order('post_number', { ascending: true })

  const isOwner = currentUser?.id === profile.id

  return (
    <div>
      <div className="mb-10">
        <div className="flex items-start justify-between">
          <div>
            <h1 className="text-2xl font-bold text-stone-900">{profile.username}</h1>
            {profile.bio && (
              <p className="mt-2 text-stone-500 text-sm leading-relaxed max-w-md">{profile.bio}</p>
            )}
            <p className="mt-2 text-xs text-stone-400">
              Member since {new Date(profile.created_at).toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}
              {' · '}{posts?.length ?? 0} {posts?.length === 1 ? 'post' : 'posts'}
            </p>
          </div>
        </div>

        {isOwner && (
          <div className="mt-6">
            <EditProfileForm currentUsername={profile.username} currentBio={profile.bio ?? ''} />
          </div>
        )}
      </div>

      {/* Posts */}
      {!posts || posts.length === 0 ? (
        <p className="text-stone-400 text-sm py-8 text-center">No posts yet.</p>
      ) : (
        <div className="space-y-px">
          {posts.map(post => (
            <article key={post.id} className="group border-t border-stone-200 py-5">
              <div className="flex items-start gap-4">
                <span className="font-mono text-xs text-stone-300 pt-0.5 w-14 shrink-0 text-right">
                  #{post.post_number.toLocaleString()}
                </span>
                <div className="flex-1 min-w-0">
                  <p className="text-xs uppercase tracking-wider text-stone-400 mb-1">
                    Philosophy of {post.topic}
                  </p>
                  <Link href={`/post/${post.id}`} className="block">
                    <h2 className="font-semibold text-stone-900 group-hover:text-stone-600 transition-colors">
                      {post.title}
                    </h2>
                  </Link>
                  <div className="mt-2 flex items-center gap-3 text-xs text-stone-400">
                    <span>{new Date(post.created_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}</span>
                    <span>{post.likes_count} likes</span>
                    <span>{post.comments_count} comments</span>
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
