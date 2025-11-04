import { NextRequest, NextResponse } from 'next/server'
import { createServerClient } from '@/lib/supabase-server'

// GET /api/social/stats - Get dashboard statistics
export async function GET(request: NextRequest) {
  try {
    const supabase = createServerClient()

    // Get total counts by status
    const { data: posts, error } = await supabase
      .from('social_posts')
      .select('status, platform, created_at')

    if (error) {
      console.error('Error fetching stats:', error)
      return NextResponse.json(
        { error: 'Failed to fetch statistics' },
        { status: 500 }
      )
    }

    // Calculate stats
    const total = posts?.length || 0
    const published = posts?.filter(p => p.status === 'published').length || 0
    const scheduled = posts?.filter(p => p.status === 'scheduled').length || 0
    const draft = posts?.filter(p => p.status === 'draft').length || 0
    const failed = posts?.filter(p => p.status === 'failed').length || 0

    // Count by platform
    const platformCounts = {
      twitter: posts?.filter(p => p.platform === 'twitter').length || 0,
      facebook: posts?.filter(p => p.platform === 'facebook').length || 0,
      linkedin: posts?.filter(p => p.platform === 'linkedin').length || 0,
      instagram: posts?.filter(p => p.platform === 'instagram').length || 0,
    }

    // Recent activity (last 7 days)
    const sevenDaysAgo = new Date()
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7)
    const recentPosts = posts?.filter(p =>
      new Date(p.created_at) >= sevenDaysAgo
    ).length || 0

    return NextResponse.json({
      total,
      published,
      scheduled,
      draft,
      failed,
      platformCounts,
      recentPosts,
    })
  } catch (error) {
    console.error('Error in GET /api/social/stats:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
