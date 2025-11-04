import { NextRequest, NextResponse } from 'next/server'
import { generateSocialPosts } from '@/lib/perplexity'

export async function POST(request: NextRequest) {
  try {
    const { title, excerpt, url } = await request.json()

    if (!title || !excerpt) {
      return NextResponse.json(
        { error: 'Title and excerpt are required' },
        { status: 400 }
      )
    }

    const posts = await generateSocialPosts(title, excerpt)

    return NextResponse.json({ posts })
  } catch (error) {
    console.error('Error in POST /api/ai/generate-social-posts:', error)
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to generate social posts' },
      { status: 500 }
    )
  }
}
