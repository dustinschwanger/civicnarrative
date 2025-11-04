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
  ChatBubbleLeftRightIcon,
  ArrowPathIcon,
  PhotoIcon,
  LinkIcon,
  XMarkIcon,
} from '@heroicons/react/24/outline'
import Image from 'next/image'

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
  imageUrl?: string
  link?: string
  mediaUrls?: string[]
}

interface PlatformInfo {
  id: string
  name: string
  icon: string
  color: string
}

const PLATFORMS: PlatformInfo[] = [
  { id: 'twitter', name: 'Twitter/X', icon: '𝕏', color: 'bg-black' },
  { id: 'facebook', name: 'Facebook', icon: 'f', color: 'bg-blue-600' },
  { id: 'linkedin', name: 'LinkedIn', icon: 'in', color: 'bg-blue-700' },
  { id: 'instagram', name: 'Instagram', icon: 'IG', color: 'bg-gradient-to-br from-purple-600 to-pink-500' },
]

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

  // Platform selection
  const [selectedPlatforms, setSelectedPlatforms] = useState<string[]>(['twitter', 'facebook', 'linkedin', 'instagram'])

  // Generate More functionality
  const [showGenerateMoreOptions, setShowGenerateMoreOptions] = useState(false)
  const [generateMoreMode, setGenerateMoreMode] = useState<'auto' | 'chat'>('auto')
  const [chatPrompt, setChatPrompt] = useState('')

  // Edit modal
  const [editingPost, setEditingPost] = useState<{ index: number; post: PostVariation } | null>(null)
  const [uploadingFile, setUploadingFile] = useState(false)

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

  const togglePlatform = (platformId: string) => {
    setSelectedPlatforms(prev =>
      prev.includes(platformId)
        ? prev.filter(p => p !== platformId)
        : [...prev, platformId]
    )
  }

  const handleGenerate = async (userPrompt?: string) => {
    setError('')
    setSuccess('')
    if (!userPrompt) {
      setVariations([]) // Only clear if it's the initial generation
    }

    // Validation
    if (mode === 'article' && !selectedArticleId) {
      setError('Please select an article')
      return
    }

    if (mode === 'custom' && (!customTitle || !customContent)) {
      setError('Please provide both title and content')
      return
    }

    if (selectedPlatforms.length === 0) {
      setError('Please select at least one platform')
      return
    }

    setLoading(true)
    setShowGenerateMoreOptions(false)
    setChatPrompt('')

    try {
      const selectedArticle = articles.find(a => a.id === selectedArticleId)

      const response = await fetch('/api/ai/generate-post-variations', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: mode === 'article' ? selectedArticle?.title : customTitle,
          content: mode === 'article' ? selectedArticle?.content : customContent,
          platforms: selectedPlatforms,
          currentPosts: userPrompt ? variations : [], // Pass existing posts for context when generating more
          userPrompt,
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

      // Append to existing variations if generating more, otherwise replace
      if (userPrompt) {
        setVariations(prev => [...prev, ...variationsWithSelection])
        setSuccess(`Generated ${variationsWithSelection.length} more post variations!`)
      } else {
        setVariations(variationsWithSelection)
        setSuccess(`Generated ${variationsWithSelection.length} post variations!`)
      }
    } catch (err: any) {
      setError(err.message || 'Failed to generate variations')
    } finally {
      setLoading(false)
    }
  }

  const handleGenerateMore = () => {
    if (generateMoreMode === 'auto') {
      handleGenerate('Generate more variations with different approaches')
    } else {
      if (!chatPrompt.trim()) {
        setError('Please provide some direction for the new posts')
        return
      }
      handleGenerate(chatPrompt)
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

  const handleEditPost = (index: number) => {
    setEditingPost({ index, post: { ...variations[index] } })
  }

  const handleSaveEdit = () => {
    if (!editingPost) return

    const updated = [...variations]
    updated[editingPost.index] = editingPost.post
    setVariations(updated)
    setEditingPost(null)
    setSuccess('Post updated successfully')
  }

  const handleCancelEdit = () => {
    setEditingPost(null)
  }

  const updateEditingPost = (field: keyof PostVariation, value: any) => {
    if (!editingPost) return
    setEditingPost({
      ...editingPost,
      post: {
        ...editingPost.post,
        [field]: value,
      },
    })
  }

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (!file) return

    setUploadingFile(true)
    setError('')

    try {
      const formData = new FormData()
      formData.append('file', file)

      const response = await fetch('/api/social/upload-media', {
        method: 'POST',
        body: formData,
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || 'Failed to upload file')
      }

      // Add the URL to the editing post
      updateEditingPost('imageUrl', data.url)
      setSuccess('File uploaded successfully')
    } catch (err: any) {
      setError(err.message || 'Failed to upload file')
    } finally {
      setUploadingFile(false)
    }
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
              imageUrl: variation.imageUrl || null,
              link: variation.link || null,
              mediaUrls: variation.mediaUrls || [],
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

  // Group variations by platform
  const groupedVariations = variations.reduce((acc, variation, index) => {
    if (!acc[variation.platform]) {
      acc[variation.platform] = []
    }
    acc[variation.platform].push({ ...variation, originalIndex: index })
    return acc
  }, {} as Record<string, Array<PostVariation & { originalIndex: number }>>)

  const selectedCount = variations.filter(v => v.selected).length

  return (
    <div className="space-y-6">
      {/* Edit Modal */}
      {editingPost && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-900">Edit Post</h3>
              <button
                onClick={handleCancelEdit}
                className="text-gray-400 hover:text-gray-600"
              >
                <XMarkIcon className="h-6 w-6" />
              </button>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Post Content
                </label>
                <textarea
                  value={editingPost.post.text}
                  onChange={(e) => updateEditingPost('text', e.target.value)}
                  rows={6}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all resize-none"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Image/Video (optional)
                </label>
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={editingPost.post.imageUrl || ''}
                    onChange={(e) => updateEditingPost('imageUrl', e.target.value)}
                    placeholder="https://example.com/image.jpg or upload below"
                    className="flex-1 px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                  />
                  <label className={`px-4 py-2.5 bg-blue-600 border border-blue-600 rounded-lg hover:bg-blue-700 transition-all cursor-pointer flex items-center justify-center ${uploadingFile ? 'opacity-50 cursor-not-allowed' : ''}`}>
                    {uploadingFile ? (
                      <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                    ) : (
                      <PhotoIcon className="h-5 w-5 text-white" />
                    )}
                    <input
                      type="file"
                      accept="image/*,video/*"
                      onChange={handleFileUpload}
                      disabled={uploadingFile}
                      className="hidden"
                    />
                  </label>
                </div>
                <p className="mt-1 text-xs text-gray-500">
                  Upload an image or video (max 10MB), or paste a URL above
                </p>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Link (optional)
                </label>
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={editingPost.post.link || ''}
                    onChange={(e) => updateEditingPost('link', e.target.value)}
                    placeholder="https://example.com/article"
                    className="flex-1 px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                  />
                  <button className="px-4 py-2.5 bg-gray-100 border border-gray-300 rounded-lg hover:bg-gray-200 transition-all">
                    <LinkIcon className="h-5 w-5 text-gray-600" />
                  </button>
                </div>
              </div>
            </div>

            <div className="flex gap-3 mt-6">
              <button
                onClick={handleSaveEdit}
                className="flex-1 px-4 py-2.5 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 transition-all"
              >
                Save Changes
              </button>
              <button
                onClick={handleCancelEdit}
                className="px-4 py-2.5 bg-gray-100 text-gray-700 font-medium rounded-lg hover:bg-gray-200 transition-all"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

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

        {/* Platform Selection */}
        <div className="mt-6">
          <label className="block text-sm font-medium text-gray-700 mb-3">
            Select Platforms to Generate Content For
          </label>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            {PLATFORMS.map((platform) => (
              <label
                key={platform.id}
                className={`flex items-center gap-3 p-3 border-2 rounded-lg cursor-pointer transition-all ${
                  selectedPlatforms.includes(platform.id)
                    ? 'border-blue-500 bg-blue-50'
                    : 'border-gray-200 hover:border-gray-300'
                }`}
              >
                <input
                  type="checkbox"
                  checked={selectedPlatforms.includes(platform.id)}
                  onChange={() => togglePlatform(platform.id)}
                  className="h-5 w-5 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                />
                <div className="flex items-center gap-2">
                  <div className={`w-8 h-8 ${platform.color} rounded flex items-center justify-center text-white font-bold text-xs`}>
                    {platform.icon}
                  </div>
                  <span className="text-sm font-medium text-gray-900">{platform.name}</span>
                </div>
              </label>
            ))}
          </div>
        </div>

        {/* Generate Button */}
        <button
          onClick={() => handleGenerate()}
          disabled={loading || selectedPlatforms.length === 0 || (mode === 'article' ? !selectedArticleId : !customTitle || !customContent)}
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

      {/* Variations List - Grouped by Platform */}
      {variations.length > 0 && (
        <div className="space-y-6">
          {/* Header with Actions */}
          <div className="bg-white rounded-lg border border-gray-200 p-6">
            <div className="flex items-center justify-between mb-4">
              <h4 className="text-lg font-semibold text-gray-900">
                Generated Posts ({variations.length})
              </h4>
              <div className="flex items-center gap-3">
                <button
                  onClick={toggleAll}
                  className="text-sm font-medium text-blue-600 hover:text-blue-700"
                >
                  {variations.every(v => v.selected) ? 'Deselect All' : 'Select All'}
                </button>
              </div>
            </div>

            {/* Bulk Actions */}
            {selectedCount > 0 && (
              <div className="mb-4 p-4 bg-blue-50 border border-blue-200 rounded-lg">
                <div className="flex items-center gap-4 flex-wrap">
                  <span className="text-sm font-medium text-blue-900">
                    {selectedCount} selected
                  </span>
                  <div className="flex-1 flex items-center gap-3 flex-wrap">
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

            {/* Generate More Options */}
            <div className="space-y-3">
              {!showGenerateMoreOptions ? (
                <button
                  onClick={() => setShowGenerateMoreOptions(true)}
                  disabled={loading}
                  className="w-full flex items-center justify-center gap-2 px-4 py-2.5 bg-gray-100 text-gray-700 font-medium rounded-lg hover:bg-gray-200 disabled:opacity-50 transition-all border border-gray-300"
                >
                  <ArrowPathIcon className="h-5 w-5" />
                  Generate More Posts
                </button>
              ) : (
                <div className="space-y-3 p-4 bg-gray-50 rounded-lg border border-gray-200">
                  <div className="flex items-center gap-3">
                    <label className="flex items-center gap-2 cursor-pointer">
                      <input
                        type="radio"
                        checked={generateMoreMode === 'auto'}
                        onChange={() => setGenerateMoreMode('auto')}
                        className="h-4 w-4 text-blue-600"
                      />
                      <span className="text-sm font-medium text-gray-700">Let AI Choose</span>
                    </label>
                    <label className="flex items-center gap-2 cursor-pointer">
                      <input
                        type="radio"
                        checked={generateMoreMode === 'chat'}
                        onChange={() => setGenerateMoreMode('chat')}
                        className="h-4 w-4 text-blue-600"
                      />
                      <span className="text-sm font-medium text-gray-700">Custom Direction</span>
                    </label>
                  </div>

                  {generateMoreMode === 'chat' && (
                    <textarea
                      value={chatPrompt}
                      onChange={(e) => setChatPrompt(e.target.value)}
                      placeholder="E.g., 'Create more question-based posts' or 'Focus on benefits for small businesses'"
                      rows={3}
                      className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all resize-none text-sm"
                    />
                  )}

                  <div className="flex gap-2">
                    <button
                      onClick={handleGenerateMore}
                      disabled={loading}
                      className="flex-1 flex items-center justify-center gap-2 px-4 py-2 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 disabled:opacity-50 transition-all"
                    >
                      {loading ? (
                        <>
                          <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                          Generating...
                        </>
                      ) : (
                        <>
                          <SparklesIcon className="h-4 w-4" />
                          Generate
                        </>
                      )}
                    </button>
                    <button
                      onClick={() => {
                        setShowGenerateMoreOptions(false)
                        setChatPrompt('')
                      }}
                      className="px-4 py-2 bg-gray-200 text-gray-700 font-medium rounded-lg hover:bg-gray-300 transition-all"
                    >
                      Cancel
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Posts Grouped by Platform */}
          {Object.entries(groupedVariations).map(([platformId, platformPosts]) => {
            const platformInfo = PLATFORMS.find(p => p.id === platformId)
            if (!platformInfo) return null

            return (
              <div key={platformId} className="bg-white rounded-lg border border-gray-200 p-6">
                <div className="flex items-center gap-3 mb-4">
                  <div className={`w-10 h-10 ${platformInfo.color} rounded-lg flex items-center justify-center text-white font-bold`}>
                    {platformInfo.icon}
                  </div>
                  <h5 className="text-lg font-semibold text-gray-900">
                    {platformInfo.name} ({platformPosts.length})
                  </h5>
                </div>

                <div className="space-y-3">
                  {platformPosts.map(({ originalIndex, ...variation }) => (
                    <div
                      key={originalIndex}
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
                          onChange={() => toggleVariation(originalIndex)}
                          className="mt-1 h-5 w-5 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                        />
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-2">
                            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-purple-100 text-purple-800">
                              {variation.angle}
                            </span>
                          </div>
                          <p className="text-sm text-gray-900 mb-2 whitespace-pre-wrap">
                            {variation.text}
                          </p>
                          {variation.imageUrl && (
                            <div className="mb-2 flex items-center gap-2 text-xs text-gray-600">
                              <PhotoIcon className="h-4 w-4" />
                              <span>Image attached</span>
                            </div>
                          )}
                          {variation.link && (
                            <div className="mb-2 flex items-center gap-2 text-xs text-gray-600">
                              <LinkIcon className="h-4 w-4" />
                              <span className="truncate max-w-md">{variation.link}</span>
                            </div>
                          )}
                          <p className="text-xs text-gray-600 italic mb-3">
                            <strong>Why:</strong> {variation.rationale}
                          </p>
                          <button
                            onClick={() => handleEditPost(originalIndex)}
                            className="text-sm font-medium text-blue-600 hover:text-blue-700 flex items-center gap-1"
                          >
                            <PencilSquareIcon className="h-4 w-4" />
                            Edit Post
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}
