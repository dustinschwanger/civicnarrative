import { NextRequest, NextResponse } from 'next/server'
import { createServerClient } from '@/lib/supabase-server'
import { lateClient } from '@/lib/late'

// GET /api/social/posts/[id] - Fetch single post
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const supabase = createServerClient()
    const { id } = params

    const { data: post, error } = await supabase
      .from('social_posts')
      .select(`
        *,
        articles (
          id,
          title,
          slug,
          excerpt
        )
      `)
      .eq('id', id)
      .single()

    if (error || !post) {
      return NextResponse.json(
        { error: 'Post not found' },
        { status: 404 }
      )
    }

    return NextResponse.json({ post })
  } catch (error) {
    console.error('Error in GET /api/social/posts/[id]:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

// PATCH /api/social/posts/[id] - Update post
export async function PATCH(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const supabase = createServerClient()
    const { id } = params
    const body = await request.json()

    const {
      content,
      scheduledFor,
      platform,
      imageUrl,
      link,
    } = body

    // Fetch existing post
    const { data: existingPost, error: fetchError } = await supabase
      .from('social_posts')
      .select('*')
      .eq('id', id)
      .single()

    if (fetchError || !existingPost) {
      return NextResponse.json(
        { error: 'Post not found' },
        { status: 404 }
      )
    }

    // Can only update scheduled or draft posts
    if (existingPost.status === 'published') {
      return NextResponse.json(
        { error: 'Cannot update published posts' },
        { status: 400 }
      )
    }

    // Prepare update data for database
    const dbUpdateData: any = {}

    if (content !== undefined) {
      dbUpdateData.content = content
    }

    if (scheduledFor !== undefined) {
      dbUpdateData.scheduled_for = scheduledFor
    }

    if (platform !== undefined) {
      dbUpdateData.platform = platform
    }

    // If post has a LATE post ID, try to update it there too
    if (existingPost.buffer_post_id) {
      try {
        const lateUpdateData: any = {}

        if (content !== undefined) {
          lateUpdateData.text = content
        }

        if (scheduledFor !== undefined) {
          lateUpdateData.scheduled_at = new Date(scheduledFor).toISOString()
        }

        if (imageUrl !== undefined) {
          lateUpdateData.media_urls = imageUrl ? [imageUrl] : []
        }

        if (link !== undefined) {
          lateUpdateData.link = link
        }

        // Update in LATE API
        await lateClient.updatePost(existingPost.buffer_post_id, lateUpdateData)
      } catch (lateError) {
        console.error('Error updating post in LATE API:', lateError)
        // Continue with database update even if LATE update fails
      }
    }

    // Update in database
    const { data: updatedPost, error: updateError } = await supabase
      .from('social_posts')
      .update(dbUpdateData)
      .eq('id', id)
      .select(`
        *,
        articles (
          id,
          title,
          slug
        )
      `)
      .single()

    if (updateError) {
      console.error('Error updating post in database:', updateError)
      return NextResponse.json(
        { error: 'Failed to update post' },
        { status: 500 }
      )
    }

    return NextResponse.json({
      success: true,
      post: updatedPost,
    })
  } catch (error: any) {
    console.error('Error in PATCH /api/social/posts/[id]:', error)
    return NextResponse.json(
      { error: error.message || 'Failed to update post' },
      { status: 500 }
    )
  }
}

// DELETE /api/social/posts/[id] - Delete post
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const supabase = createServerClient()
    const { id } = params

    // Fetch existing post
    const { data: existingPost, error: fetchError } = await supabase
      .from('social_posts')
      .select('*')
      .eq('id', id)
      .single()

    if (fetchError || !existingPost) {
      return NextResponse.json(
        { error: 'Post not found' },
        { status: 404 }
      )
    }

    // Can only delete scheduled or draft posts (not published)
    if (existingPost.status === 'published') {
      return NextResponse.json(
        { error: 'Cannot delete published posts' },
        { status: 400 }
      )
    }

    // If post has a LATE post ID, delete it there first
    if (existingPost.buffer_post_id) {
      try {
        await lateClient.deletePost(existingPost.buffer_post_id)
      } catch (lateError) {
        console.error('Error deleting post from LATE API:', lateError)
        // Continue with database deletion even if LATE deletion fails
      }
    }

    // Delete from database
    const { error: deleteError } = await supabase
      .from('social_posts')
      .delete()
      .eq('id', id)

    if (deleteError) {
      console.error('Error deleting post from database:', deleteError)
      return NextResponse.json(
        { error: 'Failed to delete post' },
        { status: 500 }
      )
    }

    return NextResponse.json({
      success: true,
      message: 'Post deleted successfully',
    })
  } catch (error: any) {
    console.error('Error in DELETE /api/social/posts/[id]:', error)
    return NextResponse.json(
      { error: error.message || 'Failed to delete post' },
      { status: 500 }
    )
  }
}
