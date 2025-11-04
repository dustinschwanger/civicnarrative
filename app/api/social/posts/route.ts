import { NextRequest, NextResponse } from 'next/server'
import { createServerClient } from '@/lib/supabase-server'
import { lateClient } from '@/lib/late'

// GET /api/social/posts - Fetch posts with filters
export async function GET(request: NextRequest) {
  try {
    const supabase = createServerClient()
    const searchParams = request.nextUrl.searchParams

    // Parse query parameters
    const platforms = searchParams.get('platforms')?.split(',').filter(Boolean)
    const statuses = searchParams.get('statuses')?.split(',').filter(Boolean)
    const search = searchParams.get('search')
    const startDate = searchParams.get('startDate')
    const endDate = searchParams.get('endDate')
    const limit = parseInt(searchParams.get('limit') || '20')
    const offset = parseInt(searchParams.get('offset') || '0')

    // Build query
    let query = supabase
      .from('social_posts')
      .select(`
        *,
        articles (
          id,
          title,
          slug
        )
      `)
      .order('created_at', { ascending: false })
      .range(offset, offset + limit - 1)

    // Apply filters
    if (platforms && platforms.length > 0) {
      query = query.in('platform', platforms)
    }

    if (statuses && statuses.length > 0) {
      query = query.in('status', statuses)
    }

    if (search) {
      query = query.ilike('content', `%${search}%`)
    }

    if (startDate) {
      query = query.gte('created_at', startDate)
    }

    if (endDate) {
      query = query.lte('created_at', endDate)
    }

    const { data: posts, error, count } = await query

    if (error) {
      console.error('Error fetching posts:', error)
      return NextResponse.json(
        { error: 'Failed to fetch posts' },
        { status: 500 }
      )
    }

    // Get total count for pagination
    let countQuery = supabase
      .from('social_posts')
      .select('*', { count: 'exact', head: true })

    if (platforms && platforms.length > 0) {
      countQuery = countQuery.in('platform', platforms)
    }
    if (statuses && statuses.length > 0) {
      countQuery = countQuery.in('status', statuses)
    }
    if (search) {
      countQuery = countQuery.ilike('content', `%${search}%`)
    }
    if (startDate) {
      countQuery = countQuery.gte('created_at', startDate)
    }
    if (endDate) {
      countQuery = countQuery.lte('created_at', endDate)
    }

    const { count: totalCount } = await countQuery

    return NextResponse.json({
      posts: posts || [],
      total: totalCount || 0,
      limit,
      offset,
    })
  } catch (error) {
    console.error('Error in GET /api/social/posts:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

// POST /api/social/posts - Create new standalone post
export async function POST(request: NextRequest) {
  try {
    const supabase = createServerClient()
    const body = await request.json()

    const {
      platform,
      content,
      scheduledFor,
      articleId,
      imageUrl,
      link,
    } = body

    // Validate required fields
    if (!platform || !content) {
      return NextResponse.json(
        { error: 'Platform and content are required' },
        { status: 400 }
      )
    }

    // Map platform names to LATE format
    const platformMap: { [key: string]: string } = {
      twitter: 'twitter',
      facebook: 'facebook',
      linkedin: 'linkedin',
      instagram: 'instagram',
    }

    const latePlatform = platformMap[platform]
    if (!latePlatform) {
      return NextResponse.json(
        { error: 'Invalid platform' },
        { status: 400 }
      )
    }

    // Prepare LATE API post data
    const postData: any = {
      text: content,
      platforms: [latePlatform],
    }

    // Add optional fields
    if (imageUrl) {
      postData.media_urls = [imageUrl]
    }

    if (link) {
      postData.link = link
    }

    if (scheduledFor) {
      postData.scheduled_at = new Date(scheduledFor).toISOString()
    }

    // Create post in LATE API
    const latePost = await lateClient.createPost(postData)

    // Save to database
    const { data: dbPost, error: dbError } = await supabase
      .from('social_posts')
      .insert({
        platform,
        content,
        scheduled_for: scheduledFor || null,
        article_id: articleId || null,
        buffer_post_id: latePost.id, // LATE post ID
        status: scheduledFor ? 'scheduled' : 'published',
      })
      .select()
      .single()

    if (dbError) {
      console.error('Error saving post to database:', dbError)
      return NextResponse.json(
        { error: 'Failed to save post' },
        { status: 500 }
      )
    }

    return NextResponse.json({
      success: true,
      post: dbPost,
      latePostId: latePost.id,
    })
  } catch (error: any) {
    console.error('Error in POST /api/social/posts:', error)
    return NextResponse.json(
      { error: error.message || 'Failed to create post' },
      { status: 500 }
    )
  }
}
