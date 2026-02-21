import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url)
  const post_id = searchParams.get('post_id')

  if (!post_id) {
    return NextResponse.json({ error: 'post_id required' }, { status: 400 })
  }

  const supabase = await createClient()

  const { data: comments, error } = await supabase
    .from('comments')
    .select('id, body, signature, created_at')
    .eq('post_id', post_id)
    .order('created_at', { ascending: true })

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })

  return NextResponse.json(comments ?? [])
}

export async function POST(request: Request) {
  const supabase = await createClient()

  const { post_id, body, signature } = await request.json()
  if (!post_id || !body?.trim()) {
    return NextResponse.json({ error: 'post_id and body required' }, { status: 400 })
  }

  const { data: comment, error } = await supabase
    .from('comments')
    .insert({ post_id, body: body.trim(), signature: signature?.trim() || null })
    .select('id, body, signature, created_at')
    .single()

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })

  return NextResponse.json(comment, { status: 201 })
}
