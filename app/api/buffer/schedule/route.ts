import { NextRequest, NextResponse } from 'next/server'
import { getBufferClient } from '@/lib/buffer'
import { createServerClient } from '@/lib/supabase-server'

export async function POST(request: NextRequest) {
  try {
    const { platform, content, scheduledFor, articleId, imageUrl } = await request.json()

    if (!platform || !content) {
      return NextResponse.json(
        { error: 'Platform and content are required' },
        { status: 400 }
      )
    }

    const bufferClient = getBufferClient()

    // Get Buffer profiles
    const profiles = await bufferClient.getProfiles()

    // Map platform names to Buffer service names
    const platformMap: { [key: string]: string } = {
      twitter: 'twitter',
      facebook: 'facebook',
      linkedin: 'linkedin',
      instagram: 'instagram',
    }

    const bufferService = platformMap[platform.toLowerCase()]
    const profile = profiles.find((p: any) => p.service === bufferService)

    if (!profile) {
      return NextResponse.json(
        { error: `No Buffer profile found for ${platform}` },
        { status: 404 }
      )
    }

    // Create post on Buffer
    const scheduleDate = scheduledFor ? new Date(scheduledFor) : undefined
    const result = await bufferClient.createPost({
      profileIds: [profile.id],
      text: content,
      scheduledAt: scheduleDate,
      media: imageUrl
        ? {
            picture: imageUrl,
          }
        : undefined,
    })

    if (!result.success) {
      throw new Error(result.message || 'Failed to schedule post on Buffer')
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
        buffer_post_id: result.updates?.[0]?.id || null,
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
      buffer_post_id: result.updates?.[0]?.id,
      social_post: socialPost,
    })
  } catch (error) {
    console.error('Error scheduling post:', error)
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to schedule post' },
      { status: 500 }
    )
  }
}
