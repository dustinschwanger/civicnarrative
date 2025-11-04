import { notFound } from 'next/navigation'
import Link from 'next/link'
import { createServerClient } from '@/lib/supabase-server'
import '../article.css'

interface Article {
  id: string
  title: string
  slug: string
  content: string
  excerpt: string
  author_name: string | null
  image_url: string | null
  published_at: string
  created_at: string
  seo_title: string | null
  seo_description: string | null
  categories: {
    id: string
    name: string
    slug: string
  } | null
}

async function getArticle(slug: string): Promise<Article | null> {
  const supabase = createServerClient()

  const { data, error } = await supabase
    .from('articles')
    .select('*, categories(id, name, slug)')
    .eq('slug', slug)
    .eq('status', 'published')
    .single()

  if (error || !data) {
    return null
  }

  return data as Article
}

export async function generateMetadata({ params }: { params: { slug: string } }) {
  const article = await getArticle(params.slug)

  if (!article) {
    return {
      title: 'Article Not Found',
    }
  }

  return {
    title: article.seo_title || article.title,
    description: article.seo_description || article.excerpt,
  }
}

export default async function ArticlePage({ params }: { params: { slug: string } }) {
  const article = await getArticle(params.slug)

  if (!article) {
    notFound()
  }

  return (
    <>
      <div className="article-header">
        <div className="article-container">
          <Link href="/" className="back-link">
            ← Back to Homepage
          </Link>

          <div className="article-meta">
            {article.categories && (
              <span className="article-category">{article.categories.name}</span>
            )}
            <span>{new Date(article.published_at).toLocaleDateString('en-US', {
              year: 'numeric',
              month: 'long',
              day: 'numeric'
            })}</span>
            {article.author_name && <span>By {article.author_name}</span>}
          </div>

          <h1 className="article-title">{article.title}</h1>
          <p className="article-excerpt">{article.excerpt}</p>
        </div>
      </div>

      <div className="article-content-wrapper">
        {article.image_url && (
          <div className="article-featured-image">
            <img src={article.image_url} alt={article.title} />
          </div>
        )}

        <div className="article-content" dangerouslySetInnerHTML={{ __html: article.content }} />
      </div>
    </>
  )
}
