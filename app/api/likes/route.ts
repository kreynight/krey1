import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'

export async function POST(request: Request) {
  const supabase = await createClient()

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) {
    return NextResponse.json({ error: 'Not authenticated' }, { status: 401 })
  }

  const { post_id, liked } = await request.json()
  if (!post_id) {
    return NextResponse.json({ error: 'post_id required' }, { status: 400 })
  }

  if (liked) {
    // Unlike
    const { error } = await supabase
      .from('likes')
      .delete()
      .eq('post_id', post_id)
      .eq('user_id', user.id)

    if (error) return NextResponse.json({ error: error.message }, { status: 500 })
    return NextResponse.json({ liked: false })
  } else {
    // Like
    const { error } = await supabase
      .from('likes')
      .insert({ post_id, user_id: user.id })

    if (error) return NextResponse.json({ error: error.message }, { status: 500 })
    return NextResponse.json({ liked: true })
  }
}
