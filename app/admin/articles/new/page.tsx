'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import AdminLayout from '@/components/admin/AdminLayout'
import { withAdminAuth } from '@/contexts/AdminContext'
import TiptapEditor from '@/components/admin/TiptapEditor'
import AIResearchChat from '@/components/admin/AIResearchChat'
import MediaLibrary from '@/components/admin/MediaLibrary'
import SocialPostGenerator from '@/components/admin/SocialPostGenerator'
import { ArticleFormData, Category, MediaFile, Article } from '@/types'
import { generateSlug } from '@/lib/utils'

function NewArticlePage() {
  const router = useRouter()
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
  const [showMediaLibrary, setShowMediaLibrary] = useState(false)
  const [aiGenerated, setAiGenerated] = useState(false)
  const [showSuccessModal, setShowSuccessModal] = useState(false)
  const [showSocialPosts, setShowSocialPosts] = useState(false)
  const [publishedArticle, setPublishedArticle] = useState<Article | null>(null)

  useEffect(() => {
    fetchCategories()
  }, [])

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

  const handleTitleChange = (title: string) => {
    setFormData((prev) => ({
      ...prev,
      title,
      slug: prev.slug || generateSlug(title),
      seo_title: prev.seo_title || title.substring(0, 60),
    }))
  }

  const handleAIContentGenerated = (content: {
    content: string
    title: string
    excerpt: string
  }) => {
    // Directly set the new content without clearing first
    setFormData((prev) => ({
      ...prev,
      title: content.title || prev.title,
      slug: prev.slug || generateSlug(content.title),
      content: content.content || '',
      excerpt: content.excerpt || prev.excerpt,
      seo_title: prev.seo_title || content.title.substring(0, 60),
    }))
    setAiGenerated(true)
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
      const response = await fetch('/api/articles', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ...formData,
          status,
          ai_generated: aiGenerated,
          ai_model: aiGenerated ? 'claude-3-5-sonnet-20241022' : null,
        }),
      })

      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.error || 'Failed to save article')
      }

      const data = await response.json()

      // If published, show success modal with social post option
      if (status === 'published') {
        setPublishedArticle(data.article)
        setShowSuccessModal(true)
      } else {
        // For drafts and review, redirect to edit page
        router.push(`/admin/articles/${data.article.id}/edit`)
      }
    } catch (error) {
      console.error('Error saving article:', error)
      alert(error instanceof Error ? error.message : 'Failed to save article')
    } finally {
      setSaving(false)
    }
  }

  return (
    <AdminLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Create New Article</h1>
            <p className="text-gray-600 mt-1">Use AI to research and draft your article</p>
          </div>
        </div>

        {/* Stacked Layout */}
        <div className="space-y-6">
          {/* AI Research Chat */}
          <div className="h-[600px]">
            <AIResearchChat onContentGenerated={handleAIContentGenerated} />
          </div>

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
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent outline-none"
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
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent outline-none font-mono text-sm"
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
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent outline-none"
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
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent outline-none"
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
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent outline-none resize-none"
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
                    className="w-full px-4 py-8 border-2 border-dashed border-gray-300 rounded-lg hover:border-primary transition-colors text-gray-600 hover:text-primary"
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
                    className="w-4 h-4 text-primary border-gray-300 rounded focus:ring-primary"
                  />
                  <span className="text-sm font-medium text-gray-700">Featured Article</span>
                </label>
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={formData.hide_main_image}
                    onChange={(e) => setFormData({ ...formData, hide_main_image: e.target.checked })}
                    className="w-4 h-4 text-primary border-gray-300 rounded focus:ring-primary"
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
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent outline-none"
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
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent outline-none resize-none"
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
                  className="px-6 py-3 bg-primary text-white rounded-lg hover:bg-primary-dark transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                >
                  {saving ? (
                    <>
                      <div className="spinner h-5 w-5 border-2 border-white border-t-transparent rounded-full"></div>
                      Publishing...
                    </>
                  ) : (
                    'Publish Now'
                  )}
                </button>
              </div>
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

      {/* Success Modal */}
      {showSuccessModal && publishedArticle && !showSocialPosts && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-lg shadow-xl w-full max-w-md p-6">
            {/* Success Icon */}
            <div className="flex justify-center mb-4">
              <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center">
                <svg className="w-8 h-8 text-green-600" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                </svg>
              </div>
            </div>

            {/* Title */}
            <h2 className="text-2xl font-bold text-gray-900 text-center mb-2">
              Article Published!
            </h2>
            <p className="text-gray-600 text-center mb-6">
              Your article has been successfully published.
            </p>

            {/* Options */}
            <div className="space-y-3">
              <button
                onClick={() => {
                  setShowSuccessModal(false)
                  setShowSocialPosts(true)
                }}
                className="w-full px-6 py-3 bg-primary text-white rounded-lg hover:bg-primary-dark transition-colors flex items-center justify-center gap-2"
              >
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                  <path d="M15 8a3 3 0 10-2.977-2.63l-4.94 2.47a3 3 0 100 4.319l4.94 2.47a3 3 0 10.895-1.789l-4.94-2.47a3.027 3.027 0 000-.74l4.94-2.47C13.456 7.68 14.19 8 15 8z" />
                </svg>
                Create Social Posts
              </button>

              <button
                onClick={() => router.push(`/admin/articles/${publishedArticle.id}/edit`)}
                className="w-full px-6 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
              >
                Go to Article
              </button>

              <button
                onClick={() => router.push('/admin/articles')}
                className="w-full px-6 py-3 text-gray-600 hover:text-gray-900 transition-colors"
              >
                Back to Articles
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Social Post Generator */}
      {showSocialPosts && publishedArticle && (
        <SocialPostGenerator
          article={publishedArticle}
          onClose={() => {
            setShowSocialPosts(false)
            router.push(`/admin/articles/${publishedArticle.id}/edit`)
          }}
        />
      )}
    </AdminLayout>
  )
}

export default withAdminAuth(NewArticlePage)
