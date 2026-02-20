import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'

const VALID = ['agree', 'thought_provoking', 'appreciate', 'curious']

export async function POST(request: Request) {
  const supabase = await createClient()

  const { post_id, session_id, reaction_type } = await request.json()

  if (!post_id || !session_id || !VALID.includes(reaction_type)) {
    return NextResponse.json({ error: 'Invalid request' }, { status: 400 })
  }

  // Check for existing reaction from this session
  const { data: existing } = await supabase
    .from('reactions')
    .select('reaction_type')
    .eq('post_id', post_id)
    .eq('session_id', session_id)
    .maybeSingle()

  if (!existing) {
    // No reaction yet — insert
    const { error } = await supabase
      .from('reactions')
      .insert({ post_id, session_id, reaction_type })
    if (error) return NextResponse.json({ error: error.message }, { status: 500 })
    return NextResponse.json({ reaction: reaction_type })
  }

  if (existing.reaction_type === reaction_type) {
    // Same reaction — toggle off
    const { error } = await supabase
      .from('reactions')
      .delete()
      .eq('post_id', post_id)
      .eq('session_id', session_id)
    if (error) return NextResponse.json({ error: error.message }, { status: 500 })
    return NextResponse.json({ reaction: null })
  }

  // Different reaction — update
  const { error } = await supabase
    .from('reactions')
    .update({ reaction_type })
    .eq('post_id', post_id)
    .eq('session_id', session_id)
  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json({ reaction: reaction_type })
}
