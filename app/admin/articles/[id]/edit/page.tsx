'use client'

import { useState, useEffect } from 'react'
import { useRouter, useParams } from 'next/navigation'
import AdminLayout from '@/components/admin/AdminLayout'
import { withAdminAuth } from '@/contexts/AdminContext'
import TiptapEditor from '@/components/admin/TiptapEditor'
import MediaLibrary from '@/components/admin/MediaLibrary'
import SocialPostGenerator from '@/components/admin/SocialPostGenerator'
import { ArticleFormData, Category, Article } from '@/types'
import { generateSlug } from '@/lib/utils'

function EditArticlePage() {
  const router = useRouter()
  const params = useParams()
  const articleId = params.id as string

  const [formData, setFormData] = useState<ArticleFormData>({
    title: '',
    slug: '',
    content: '',
    excerpt: '',
    author_name: '',
    category_id: '',
    status: 'draft',
    featured: false,
    hide_main_image: false,
    image_url: '',
    seo_title: '',
    seo_description: '',
  })
  const [categories, setCategories] = useState<Category[]>([])
  const [saving, setSaving] = useState(false)
  const [loading, setLoading] = useState(true)
  const [showMediaLibrary, setShowMediaLibrary] = useState(false)
  const [showSocialPosts, setShowSocialPosts] = useState(false)
  const [currentArticle, setCurrentArticle] = useState<Article | null>(null)

  useEffect(() => {
    fetchCategories()
    fetchArticle()
  }, [articleId])

  const fetchCategories = async () => {
    try {
      const response = await fetch('/api/categories')
      if (response.ok) {
        const data = await response.json()
        setCategories(data.categories || [])
      }
    } catch (error) {
      console.error('Error fetching categories:', error)
    }
  }

  const fetchArticle = async () => {
    try {
      const response = await fetch(`/api/articles/${articleId}`)
      if (!response.ok) {
        throw new Error('Failed to fetch article')
      }
      const data = await response.json()
      const article = data.article

      setCurrentArticle(article)
      setFormData({
        title: article.title || '',
        slug: article.slug || '',
        content: article.content || '',
        excerpt: article.excerpt || '',
        author_name: article.author_name || '',
        category_id: article.category_id || '',
        status: article.status || 'draft',
        featured: article.featured || false,
        hide_main_image: article.hide_main_image || false,
        image_url: article.image_url || '',
        seo_title: article.seo_title || '',
        seo_description: article.seo_description || '',
      })
    } catch (error) {
      console.error('Error fetching article:', error)
      alert('Failed to load article')
      router.push('/admin/articles')
    } finally {
      setLoading(false)
    }
  }

  const handleTitleChange = (title: string) => {
    setFormData((prev) => ({
      ...prev,
      title,
      seo_title: prev.seo_title || title.substring(0, 60),
    }))
  }

  const handleSave = async (status: 'draft' | 'review' | 'published') => {
    // Validation
    if (!formData.title.trim()) {
      alert('Please enter a title')
      return
    }
    if (!formData.slug.trim()) {
      alert('Please enter a slug')
      return
    }
    if (!formData.content.trim()) {
      alert('Please enter some content')
      return
    }
    if (!formData.excerpt.trim()) {
      alert('Please enter an excerpt')
      return
    }
    if (!formData.category_id) {
      alert('Please select a category')
      return
    }

    setSaving(true)

    try {
      const response = await fetch(`/api/articles/${articleId}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ...formData,
          status,
        }),
      })

      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.error || 'Failed to save article')
      }

      const data = await response.json()
      setCurrentArticle(data.article)

      alert(`Article ${status === 'published' ? 'published' : 'saved'} successfully!`)

      // Refresh the article data
      fetchArticle()
    } catch (error) {
      console.error('Error saving article:', error)
      alert(error instanceof Error ? error.message : 'Failed to save article')
    } finally {
      setSaving(false)
    }
  }

  const handleDelete = async () => {
    if (!confirm('Are you sure you want to delete this article? This action cannot be undone.')) {
      return
    }

    try {
      const response = await fetch(`/api/articles/${articleId}`, {
        method: 'DELETE',
      })

      if (!response.ok) {
        throw new Error('Failed to delete article')
      }

      alert('Article deleted successfully')
      router.push('/admin/articles')
    } catch (error) {
      console.error('Error deleting article:', error)
      alert('Failed to delete article')
    }
  }

  if (loading) {
    return (
      <AdminLayout>
        <div className="flex items-center justify-center h-64">
          <div className="relative">
            <div className="h-16 w-16 rounded-full border-4 border-gray-200"></div>
            <div className="h-16 w-16 rounded-full border-4 border-blue-600 border-t-transparent animate-spin absolute top-0 left-0"></div>
          </div>
        </div>
      </AdminLayout>
    )
  }

  return (
    <AdminLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Edit Article</h1>
            <p className="text-gray-600 mt-1">Update your article details</p>
          </div>
          <div className="flex gap-3">
            {currentArticle && currentArticle.status === 'published' && (
              <button
                onClick={() => setShowSocialPosts(true)}
                className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors flex items-center gap-2"
              >
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                  <path d="M15 8a3 3 0 10-2.977-2.63l-4.94 2.47a3 3 0 100 4.319l4.94 2.47a3 3 0 10.895-1.789l-4.94-2.47a3.027 3.027 0 000-.74l4.94-2.47C13.456 7.68 14.19 8 15 8z" />
                </svg>
                Social Posts
              </button>
            )}
            <button
              onClick={handleDelete}
              className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
            >
              Delete Article
            </button>
          </div>
        </div>

        {/* Status Badge */}
        {currentArticle && (
          <div className="flex items-center gap-2">
            <span className="text-sm font-medium text-gray-700">Status:</span>
            <span
              className={`px-3 py-1 rounded-full text-xs font-medium ${
                currentArticle.status === 'published'
                  ? 'bg-green-50 text-green-700 border border-green-200'
                  : currentArticle.status === 'review'
                  ? 'bg-amber-50 text-amber-700 border border-amber-200'
                  : 'bg-gray-50 text-gray-700 border border-gray-200'
              }`}
            >
              {currentArticle.status.charAt(0).toUpperCase() + currentArticle.status.slice(1)}
            </span>
          </div>
        )}

        {/* Article Form */}
        <div className="space-y-6">
          {/* Basic Info Card */}
          <div className="bg-white rounded-lg shadow p-6 space-y-4">
            <h2 className="text-xl font-semibold text-gray-900">Article Details</h2>

            {/* Title */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Title *
              </label>
              <input
                type="text"
                value={formData.title}
                onChange={(e) => handleTitleChange(e.target.value)}
                placeholder="Enter article title..."
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
              />
            </div>

            {/* Slug */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                URL Slug *
              </label>
              <input
                type="text"
                value={formData.slug}
                onChange={(e) => setFormData({ ...formData, slug: e.target.value })}
                placeholder="article-url-slug"
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none font-mono text-sm"
              />
            </div>

            {/* Category */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Category *
              </label>
              <select
                value={formData.category_id}
                onChange={(e) => setFormData({ ...formData, category_id: e.target.value })}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
              >
                <option value="">Select a category</option>
                {categories.map((category) => (
                  <option key={category.id} value={category.id}>
                    {category.name}
                  </option>
                ))}
              </select>
            </div>

            {/* Author */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Author Name
              </label>
              <input
                type="text"
                value={formData.author_name}
                onChange={(e) => setFormData({ ...formData, author_name: e.target.value })}
                placeholder="John Doe"
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
              />
            </div>

            {/* Excerpt */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Excerpt * ({formData.excerpt.length}/300)
              </label>
              <textarea
                value={formData.excerpt}
                onChange={(e) => setFormData({ ...formData, excerpt: e.target.value.substring(0, 300) })}
                placeholder="Brief summary of the article..."
                rows={3}
                maxLength={300}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none resize-none"
              />
            </div>

            {/* Featured Image */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Featured Image
              </label>
              {formData.image_url ? (
                <div className="relative">
                  <img
                    src={formData.image_url}
                    alt="Featured"
                    className="w-full h-48 object-cover rounded-lg"
                  />
                  <button
                    onClick={() => setFormData({ ...formData, image_url: '' })}
                    className="absolute top-2 right-2 p-2 bg-red-500 text-white rounded-lg hover:bg-red-600"
                  >
                    Remove
                  </button>
                </div>
              ) : (
                <button
                  onClick={() => setShowMediaLibrary(true)}
                  className="w-full px-4 py-8 border-2 border-dashed border-gray-300 rounded-lg hover:border-blue-600 transition-colors text-gray-600 hover:text-blue-600"
                >
                  Click to select image
                </button>
              )}
            </div>

            {/* Flags */}
            <div className="flex gap-4">
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={formData.featured}
                  onChange={(e) => setFormData({ ...formData, featured: e.target.checked })}
                  className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-600"
                />
                <span className="text-sm font-medium text-gray-700">Featured Article</span>
              </label>
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={formData.hide_main_image}
                  onChange={(e) => setFormData({ ...formData, hide_main_image: e.target.checked })}
                  className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-600"
                />
                <span className="text-sm font-medium text-gray-700">Hide Main Image</span>
              </label>
            </div>
          </div>

          {/* Content Editor Card */}
          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">Content *</h2>
            <TiptapEditor
              value={formData.content}
              onChange={(content) => setFormData({ ...formData, content })}
              height="500px"
            />
          </div>

          {/* SEO Card */}
          <div className="bg-white rounded-lg shadow p-6 space-y-4">
            <h2 className="text-xl font-semibold text-gray-900">SEO Settings</h2>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                SEO Title ({formData.seo_title.length}/60)
              </label>
              <input
                type="text"
                value={formData.seo_title}
                onChange={(e) => setFormData({ ...formData, seo_title: e.target.value.substring(0, 60) })}
                placeholder="SEO optimized title..."
                maxLength={60}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                SEO Description ({formData.seo_description.length}/160)
              </label>
              <textarea
                value={formData.seo_description}
                onChange={(e) => setFormData({ ...formData, seo_description: e.target.value.substring(0, 160) })}
                placeholder="SEO meta description..."
                rows={3}
                maxLength={160}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none resize-none"
              />
            </div>
          </div>

          {/* Action Buttons */}
          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex flex-wrap gap-3">
              <button
                onClick={() => handleSave('draft')}
                disabled={saving}
                className="px-6 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Save as Draft
              </button>
              <button
                onClick={() => handleSave('review')}
                disabled={saving}
                className="px-6 py-3 bg-yellow-500 text-white rounded-lg hover:bg-yellow-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Submit for Review
              </button>
              <button
                onClick={() => handleSave('published')}
                disabled={saving}
                className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-all shadow-sm hover:shadow disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
              >
                {saving ? (
                  <>
                    <div className="h-5 w-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                    Saving...
                  </>
                ) : (
                  'Publish Now'
                )}
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Media Library Modal */}
      {showMediaLibrary && (
        <MediaLibrary
          onSelect={(media) => {
            if ('file_url' in media) {
              setFormData({ ...formData, image_url: media.file_url })
            }
            setShowMediaLibrary(false)
          }}
          onClose={() => setShowMediaLibrary(false)}
          maxSelection={1}
          allowedTypes={['image']}
          mode="modal"
        />
      )}

      {/* Social Post Generator */}
      {showSocialPosts && currentArticle && (
        <SocialPostGenerator
          article={currentArticle}
          onClose={() => setShowSocialPosts(false)}
        />
      )}
    </AdminLayout>
  )
}

export default withAdminAuth(EditArticlePage)
