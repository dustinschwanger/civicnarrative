import { NextRequest, NextResponse } from 'next/server'
import { createServerClient } from '@/lib/supabase-server'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const limit = parseInt(searchParams.get('limit') || '10')
    const offset = parseInt(searchParams.get('offset') || '0')
    const category = searchParams.get('category')
    const status = searchParams.get('status')
    const featured = searchParams.get('featured')
    const search = searchParams.get('search')

    const supabase = createServerClient()

    let query = supabase
      .from('articles')
      .select('*, categories(id, name, slug)', { count: 'exact' })
      .order('created_at', { ascending: false })
      .range(offset, offset + limit - 1)

    if (category) {
      query = query.eq('categories.slug', category)
    }

    if (status) {
      query = query.eq('status', status)
    }

    if (featured === 'true') {
      query = query.eq('featured', true)
    }

    if (search) {
      query = query.or(`title.ilike.%${search}%,excerpt.ilike.%${search}%`)
    }

    const { data, error, count } = await query

    if (error) {
      console.error('Error fetching articles:', error)
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    return NextResponse.json({
      articles: data,
      count,
      total: count,
    })
  } catch (error) {
    console.error('Error in GET /api/articles:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const supabase = createServerClient()

    // Validate required fields
    if (!body.title || !body.slug || !body.content || !body.excerpt) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      )
    }

    // Check if slug already exists
    const { data: existingArticle } = await supabase
      .from('articles')
      .select('id')
      .eq('slug', body.slug)
      .single()

    if (existingArticle) {
      return NextResponse.json(
        { error: 'An article with this slug already exists' },
        { status: 400 }
      )
    }

    // Insert article
    const { data, error } = await supabase
      .from('articles')
      .insert([
        {
          title: body.title,
          slug: body.slug,
          content: body.content,
          excerpt: body.excerpt,
          author_name: body.author_name || null,
          category_id: body.category_id || null,
          status: body.status || 'draft',
          featured: body.featured || false,
          hide_main_image: body.hide_main_image || false,
          image_url: body.image_url || null,
          seo_title: body.seo_title || null,
          seo_description: body.seo_description || null,
          ai_generated: body.ai_generated || false,
          ai_prompt: body.ai_prompt || null,
          ai_model: body.ai_model || null,
          generation_date: body.ai_generated ? new Date().toISOString() : null,
          published_at:
            body.status === 'published' ? new Date().toISOString() : null,
        },
      ])
      .select()
      .single()

    if (error) {
      console.error('Error creating article:', error)
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    return NextResponse.json({ article: data }, { status: 201 })
  } catch (error) {
    console.error('Error in POST /api/articles:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
