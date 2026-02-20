import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'

export async function POST(request: Request) {
  const supabase = await createClient()

  const { topic, body, signature, source_type, confidence_level, debate_intent } = await request.json()

  if (!topic?.trim() || !body?.trim()) {
    return NextResponse.json({ error: 'Topic and body are required' }, { status: 400 })
  }

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
      topic:            topic.trim(),
      title:            topic.trim(),
      body:             body.trim(),
      signature:        signature?.trim() || null,
      source_type:      source_type || null,
      confidence_level: confidence_level || null,
      debate_intent:    debate_intent || null,
    })
    .select('id')
    .single()

  if (insertError) {
    return NextResponse.json({ error: insertError.message }, { status: 500 })
  }

  return NextResponse.json({ id: post.id, post_number: postNumber }, { status: 201 })
}
