import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'

export async function POST(request: Request) {
  const supabase = await createClient()

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) {
    return NextResponse.json({ error: 'Not authenticated' }, { status: 401 })
  }

  const { topic, title, body } = await request.json()

  if (!topic?.trim() || !title?.trim() || !body?.trim()) {
    return NextResponse.json({ error: 'All fields are required' }, { status: 400 })
  }

  // Atomically claim the next post number via our Postgres function
  const { data: postNumber, error: fnError } = await supabase.rpc('claim_post_number')
  if (fnError || postNumber === null) {
    return NextResponse.json(
      { error: fnError?.message ?? 'No post numbers remaining' },
      { status: 409 }
    )
  }

  const { data: post, error: insertError } = await supabase
    .from('posts')
    .insert({
      post_number: postNumber,
      author_id: user.id,
      topic: topic.trim(),
      title: title.trim(),
      body: body.trim(),
    })
    .select('id')
    .single()

  if (insertError) {
    return NextResponse.json({ error: insertError.message }, { status: 500 })
  }

  return NextResponse.json({ id: post.id, post_number: postNumber }, { status: 201 })
}
