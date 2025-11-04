import Link from 'next/link'
import { createServerClient } from '@/lib/supabase-server'
import './articles-list.css'

interface Article {
  id: string
  title: string
  slug: string
  excerpt: string
  author_name: string | null
  image_url: string | null
  published_at: string
  created_at: string
  categories: {
    id: string
    name: string
    slug: string
  } | null
}

async function getArticles(): Promise<Article[]> {
  const supabase = createServerClient()

  const { data, error } = await supabase
    .from('articles')
    .select('*, categories(id, name, slug)')
    .eq('status', 'published')
    .order('published_at', { ascending: false })

  if (error || !data) {
    console.error('Error fetching articles:', error)
    return []
  }

  return data as Article[]
}

export const metadata = {
  title: 'Insights & Articles - Civic Narrative',
  description: 'Stay informed on civic tech, transparency, and government communication best practices.',
}

export default async function ArticlesPage() {
  const articles = await getArticles()

  return (
    <>
      {/* Header */}
      <div className="articles-list-header">
        <div className="articles-list-container">
          <Link href="/" className="back-link">
            ← Back to Homepage
          </Link>
          <h1 className="articles-list-title">Insights & Learning</h1>
          <p className="articles-list-subtitle">
            Stay informed on civic tech, transparency, and government communication best practices
          </p>
        </div>
      </div>

      {/* Articles Grid */}
      <div className="articles-list-content">
        <div className="articles-list-container">
          {articles.length === 0 ? (
            <div className="no-articles">
              <p>No articles published yet. Check back soon!</p>
            </div>
          ) : (
            <div className="articles-grid">
              {articles.map((article) => (
                <Link
                  href={`/articles/${article.slug}`}
                  key={article.id}
                  className="article-card-link"
                >
                  <article className="article-card">
                    {article.image_url && (
                      <div className="article-card-image">
                        <img src={article.image_url} alt={article.title} />
                      </div>
                    )}
                    <div className="article-card-content">
                      <div className="article-card-meta">
                        {article.categories && (
                          <span className="article-card-category">
                            {article.categories.name}
                          </span>
                        )}
                        <span className="article-card-date">
                          {new Date(article.published_at).toLocaleDateString('en-US', {
                            year: 'numeric',
                            month: 'long',
                            day: 'numeric'
                          })}
                        </span>
                      </div>
                      <h2 className="article-card-title">{article.title}</h2>
                      <p className="article-card-excerpt">{article.excerpt}</p>
                      {article.author_name && (
                        <p className="article-card-author">By {article.author_name}</p>
                      )}
                      <span className="article-card-read-more">
                        Read Article →
                      </span>
                    </div>
                  </article>
                </Link>
              ))}
            </div>
          )}
        </div>
      </div>
    </>
  )
}
