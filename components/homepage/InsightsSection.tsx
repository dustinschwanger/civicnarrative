'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'

interface Article {
  id: string
  title: string
  slug: string
  excerpt: string
  published_at: string
  created_at: string
}

export default function InsightsSection() {
  const [articles, setArticles] = useState<Article[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(false)

  useEffect(() => {
    async function loadArticles() {
      try {
        const response = await fetch('/api/articles?status=published&limit=3')

        if (!response.ok) {
          console.error('Failed to fetch articles:', response.statusText)
          setError(true)
          setLoading(false)
          return
        }

        const data = await response.json()
        const fetchedArticles = data.articles || []

        if (fetchedArticles.length > 0) {
          setArticles(fetchedArticles)
        } else {
          // Keep default articles if no published articles
          setError(false)
        }

        setLoading(false)
      } catch (err) {
        console.error('Error loading articles:', err)
        setError(true)
        setLoading(false)
      }
    }

    loadArticles()
  }, [])

  // Default articles as fallback
  const defaultArticles = [
    {
      id: '1',
      title: '5 Ways AI Improves Citizen Engagement',
      excerpt: 'Discover how artificial intelligence is helping local governments respond faster, communicate clearer, and build trust with residents through 24/7 accessibility.',
      slug: '#',
    },
    {
      id: '2',
      title: 'Making Government Websites Accessible to All',
      excerpt: 'A practical guide to WCAG compliance, inclusive design, and ensuring every resident can access vital services regardless of ability or device.',
      slug: '#',
    },
    {
      id: '3',
      title: 'The ROI of Transparent Communication',
      excerpt: 'Data-driven insights on how proactive transparency reduces FOIA requests, call center volume, and staff burnout while increasing resident satisfaction.',
      slug: '#',
    },
  ]

  const displayArticles = articles.length > 0 ? articles : defaultArticles

  return (
    <section className="insights" id="about">
      <div className="container">
        <h2 className="section-title">Insights & Learning</h2>
        <p className="section-subtitle">Stay informed on civic tech and transparency best practices</p>

        <div className="insights-carousel">
          {displayArticles.map((article) => (
            <Link href={`/articles/${article.slug}`} key={article.id} className="insight-card-link">
              <article className="insight-card">
                <div className="insight-accent"></div>
                <h3>{article.title}</h3>
                <p>{article.excerpt}</p>
                <span className="insight-link">
                  Read More →
                </span>
              </article>
            </Link>
          ))}
        </div>

        <div className="insights-actions">
          <a href="#" className="btn btn-outline">See All Articles</a>
        </div>
      </div>
    </section>
  )
}
