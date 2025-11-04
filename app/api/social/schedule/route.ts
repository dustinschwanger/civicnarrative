import { NextRequest, NextResponse } from 'next/server'
import { getLateClient, LateClient } from '@/lib/late'
import { createServerClient } from '@/lib/supabase-server'

export async function POST(request: NextRequest) {
  try {
    const { platform, content, scheduledFor, articleId, imageUrl, link } = await request.json()

    if (!platform || !content) {
      return NextResponse.json(
        { error: 'Platform and content are required' },
        { status: 400 }
      )
    }

    const lateClient = getLateClient()

    // Map platform name to LATE's expected format
    const latePlatform = LateClient.mapPlatform(platform)

    // Prepare media URLs array if image provided
    const mediaUrls = imageUrl ? [imageUrl] : undefined

    // Create post on LATE
    const scheduleDate = scheduledFor ? new Date(scheduledFor) : undefined
    const result = await lateClient.createPost({
      text: content,
      platforms: [latePlatform],
      mediaUrls,
      scheduledAt: scheduleDate,
      link: link || undefined,
    })

    if (!result.success) {
      throw new Error(result.error || 'Failed to schedule post on LATE')
    }

    // Save to database
    const supabase = createServerClient()
    const { data: socialPost, error: dbError } = await supabase
      .from('social_posts')
      .insert({
        article_id: articleId || null,
        platform: platform.toLowerCase(),
        content,
        scheduled_for: scheduledFor || null,
        buffer_post_id: result.post_id || null, // Keeping column name for compatibility
        status: scheduledFor ? 'scheduled' : 'published',
        published_at: scheduledFor ? null : new Date().toISOString(),
      })
      .select()
      .single()

    if (dbError) {
      console.error('Error saving social post to database:', dbError)
      // Don't fail the request if database save fails
    }

    return NextResponse.json({
      success: true,
      late_post_id: result.post_id,
      social_post: socialPost,
      scheduled_at: result.scheduled_at,
      status: result.status,
    })
  } catch (error) {
    console.error('Error scheduling post:', error)
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to schedule post' },
      { status: 500 }
    )
  }
}
