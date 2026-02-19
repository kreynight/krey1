import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'

export async function POST(request: Request) {
  const supabase = await createClient()

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) {
    return NextResponse.json({ error: 'Not authenticated' }, { status: 401 })
  }

  const { post_id, body } = await request.json()
  if (!post_id || !body?.trim()) {
    return NextResponse.json({ error: 'post_id and body required' }, { status: 400 })
  }

  const { data: comment, error } = await supabase
    .from('comments')
    .insert({ post_id, author_id: user.id, body: body.trim() })
    .select(`
      id,
      body,
      created_at,
      profiles (username)
    `)
    .single()

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })

  return NextResponse.json(comment, { status: 201 })
}
