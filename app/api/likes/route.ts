import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'

export async function POST(request: Request) {
  const supabase = await createClient()

  const { post_id, liked } = await request.json()
  if (!post_id) {
    return NextResponse.json({ error: 'post_id required' }, { status: 400 })
  }

  // liked = current state; toggle it
  const fn = liked ? 'unlike_post' : 'like_post'
  const { error } = await supabase.rpc(fn, { post_id })

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })

  return NextResponse.json({ liked: !liked })
}
