'use client'

import { useState, useEffect } from 'react'
import {
  SparklesIcon,
  CheckCircleIcon,
  ExclamationCircleIcon,
  DocumentTextIcon,
  PencilSquareIcon,
  CalendarIcon,
  PaperAirplaneIcon,
} from '@heroicons/react/24/outline'

interface Article {
  id: string
  title: string
  slug: string
  content: string
  excerpt: string
}

interface PostVariation {
  angle: string
  platform: string
  text: string
  rationale: string
  selected?: boolean
}

export default function ContentIdeasGenerator() {
  const [mode, setMode] = useState<'article' | 'custom'>('article')
  const [articles, setArticles] = useState<Article[]>([])
  const [selectedArticleId, setSelectedArticleId] = useState('')
  const [customTitle, setCustomTitle] = useState('')
  const [customContent, setCustomContent] = useState('')
  const [loading, setLoading] = useState(false)
  const [loadingArticles, setLoadingArticles] = useState(true)
  const [variations, setVariations] = useState<PostVariation[]>([])
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')
  const [scheduledDate, setScheduledDate] = useState('')

  useEffect(() => {
    fetchArticles()
  }, [])

  const fetchArticles = async () => {
    setLoadingArticles(true)
    try {
      const response = await fetch('/api/articles?status=published&limit=100')
      if (!response.ok) throw new Error('Failed to fetch articles')
      const data = await response.json()
      setArticles(data.articles || [])
    } catch (err) {
      console.error('Error fetching articles:', err)
    } finally {
      setLoadingArticles(false)
    }
  }

  const handleGenerate = async () => {
    setError('')
    setSuccess('')
    setVariations([])

    // Validation
    if (mode === 'article' && !selectedArticleId) {
      setError('Please select an article')
      return
    }

    if (mode === 'custom' && (!customTitle || !customContent)) {
      setError('Please provide both title and content')
      return
    }

    setLoading(true)

    try {
      const selectedArticle = articles.find(a => a.id === selectedArticleId)

      const response = await fetch('/api/ai/generate-post-variations', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: mode === 'article' ? selectedArticle?.title : customTitle,
          content: mode === 'article' ? selectedArticle?.content : customContent,
        }),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || 'Failed to generate variations')
      }

      // Add selected flag to each variation
      const variationsWithSelection = data.variations.map((v: PostVariation) => ({
        ...v,
        selected: false,
      }))

      setVariations(variationsWithSelection)
      setSuccess(`Generated ${variationsWithSelection.length} post variations!`)
    } catch (err: any) {
      setError(err.message || 'Failed to generate variations')
    } finally {
      setLoading(false)
    }
  }

  const toggleVariation = (index: number) => {
    const updated = [...variations]
    updated[index].selected = !updated[index].selected
    setVariations(updated)
  }

  const toggleAll = () => {
    const allSelected = variations.every(v => v.selected)
    setVariations(variations.map(v => ({ ...v, selected: !allSelected })))
  }

  const handleScheduleSelected = async () => {
    const selectedVariations = variations.filter(v => v.selected)

    if (selectedVariations.length === 0) {
      setError('Please select at least one variation to schedule')
      return
    }

    setLoading(true)
    setError('')
    setSuccess('')

    try {
      let successCount = 0
      let failCount = 0

      for (const variation of selectedVariations) {
        try {
          const response = await fetch('/api/social/posts', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              platform: variation.platform,
              content: variation.text,
              scheduledFor: scheduledDate || null,
              articleId: mode === 'article' ? selectedArticleId : null,
            }),
          })

          if (response.ok) {
            successCount++
          } else {
            failCount++
          }
        } catch (err) {
          failCount++
        }
      }

      if (successCount > 0) {
        setSuccess(`Successfully ${scheduledDate ? 'scheduled' : 'published'} ${successCount} post(s)!`)
        // Deselect all after scheduling
        setVariations(variations.map(v => ({ ...v, selected: false })))
      }

      if (failCount > 0) {
        setError(`Failed to schedule ${failCount} post(s)`)
      }
    } catch (err: any) {
      setError(err.message || 'Failed to schedule posts')
    } finally {
      setLoading(false)
    }
  }

  const selectedCount = variations.filter(v => v.selected).length

  return (
    <div className="space-y-6">
      {/* Mode Toggle */}
      <div className="bg-white rounded-lg border border-gray-200 p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
          <SparklesIcon className="h-6 w-6 text-blue-600" />
          AI Content Generator
        </h3>

        {/* Tabs */}
        <div className="flex gap-4 mb-6 border-b border-gray-200">
          <button
            onClick={() => setMode('article')}
            className={`pb-3 px-1 border-b-2 font-medium text-sm transition-colors ${
              mode === 'article'
                ? 'border-blue-600 text-blue-600'
                : 'border-transparent text-gray-500 hover:text-gray-700'
            }`}
          >
            <div className="flex items-center gap-2">
              <DocumentTextIcon className="h-5 w-5" />
              From Article
            </div>
          </button>
          <button
            onClick={() => setMode('custom')}
            className={`pb-3 px-1 border-b-2 font-medium text-sm transition-colors ${
              mode === 'custom'
                ? 'border-blue-600 text-blue-600'
                : 'border-transparent text-gray-500 hover:text-gray-700'
            }`}
          >
            <div className="flex items-center gap-2">
              <PencilSquareIcon className="h-5 w-5" />
              Custom Content
            </div>
          </button>
        </div>

        {/* Article Mode */}
        {mode === 'article' && (
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Select Article
            </label>
            {loadingArticles ? (
              <div className="flex items-center gap-2 text-gray-500">
                <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-blue-600"></div>
                Loading articles...
              </div>
            ) : (
              <select
                value={selectedArticleId}
                onChange={(e) => setSelectedArticleId(e.target.value)}
                className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
              >
                <option value="">Choose an article...</option>
                {articles.map((article) => (
                  <option key={article.id} value={article.id}>
                    {article.title}
                  </option>
                ))}
              </select>
            )}
          </div>
        )}

        {/* Custom Mode */}
        {mode === 'custom' && (
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Title
              </label>
              <input
                type="text"
                value={customTitle}
                onChange={(e) => setCustomTitle(e.target.value)}
                placeholder="Enter your content title..."
                className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Content
              </label>
              <textarea
                value={customContent}
                onChange={(e) => setCustomContent(e.target.value)}
                placeholder="Paste or write your content here..."
                rows={6}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all resize-none"
              />
            </div>
          </div>
        )}

        {/* Generate Button */}
        <button
          onClick={handleGenerate}
          disabled={loading || (mode === 'article' ? !selectedArticleId : !customTitle || !customContent)}
          className="mt-6 w-full flex items-center justify-center gap-2 px-6 py-3 bg-gradient-to-r from-blue-600 to-blue-700 text-white font-semibold rounded-lg hover:from-blue-700 hover:to-blue-800 disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-md hover:shadow-lg"
        >
          {loading ? (
            <>
              <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
              Generating...
            </>
          ) : (
            <>
              <SparklesIcon className="h-5 w-5" />
              Generate Post Variations
            </>
          )}
        </button>

        {/* Messages */}
        {error && (
          <div className="mt-4 flex items-center gap-2 p-4 bg-red-50 border border-red-200 rounded-lg text-red-800">
            <ExclamationCircleIcon className="h-5 w-5 flex-shrink-0" />
            <span className="text-sm font-medium">{error}</span>
          </div>
        )}

        {success && (
          <div className="mt-4 flex items-center gap-2 p-4 bg-green-50 border border-green-200 rounded-lg text-green-800">
            <CheckCircleIcon className="h-5 w-5 flex-shrink-0" />
            <span className="text-sm font-medium">{success}</span>
          </div>
        )}
      </div>

      {/* Variations List */}
      {variations.length > 0 && (
        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <div className="flex items-center justify-between mb-4">
            <h4 className="text-lg font-semibold text-gray-900">
              Generated Variations ({variations.length})
            </h4>
            <button
              onClick={toggleAll}
              className="text-sm font-medium text-blue-600 hover:text-blue-700"
            >
              {variations.every(v => v.selected) ? 'Deselect All' : 'Select All'}
            </button>
          </div>

          {/* Bulk Actions */}
          {selectedCount > 0 && (
            <div className="mb-4 p-4 bg-blue-50 border border-blue-200 rounded-lg">
              <div className="flex items-center gap-4">
                <span className="text-sm font-medium text-blue-900">
                  {selectedCount} selected
                </span>
                <div className="flex-1 flex items-center gap-3">
                  <label className="text-sm font-medium text-blue-900">Schedule for:</label>
                  <input
                    type="datetime-local"
                    value={scheduledDate}
                    onChange={(e) => setScheduledDate(e.target.value)}
                    min={new Date().toISOString().slice(0, 16)}
                    className="px-3 py-1.5 border border-blue-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500"
                  />
                  <button
                    onClick={handleScheduleSelected}
                    disabled={loading}
                    className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 disabled:opacity-50 transition-all"
                  >
                    <PaperAirplaneIcon className="h-4 w-4" />
                    {scheduledDate ? 'Schedule Selected' : 'Publish Selected'}
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* Variations Grid */}
          <div className="space-y-4">
            {variations.map((variation, index) => (
              <div
                key={index}
                className={`border rounded-lg p-4 transition-all ${
                  variation.selected
                    ? 'border-blue-300 bg-blue-50'
                    : 'border-gray-200 hover:bg-gray-50'
                }`}
              >
                <div className="flex items-start gap-4">
                  <input
                    type="checkbox"
                    checked={variation.selected}
                    onChange={() => toggleVariation(index)}
                    className="mt-1 h-5 w-5 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                  />
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-purple-100 text-purple-800">
                        {variation.angle}
                      </span>
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                        {variation.platform}
                      </span>
                    </div>
                    <p className="text-sm text-gray-900 mb-2 whitespace-pre-wrap">
                      {variation.text}
                    </p>
                    <p className="text-xs text-gray-600 italic">
                      <strong>Why:</strong> {variation.rationale}
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
