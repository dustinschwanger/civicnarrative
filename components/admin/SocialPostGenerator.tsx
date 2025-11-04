'use client'

import { useState, useEffect } from 'react'
import { Article, SocialPost } from '@/types'

interface SocialPostGeneratorProps {
  article: Article
  onClose?: () => void
}

interface GeneratedPost {
  platform: 'twitter' | 'facebook' | 'linkedin' | 'instagram'
  content: string
  scheduledFor?: string
  isScheduling?: boolean
  mediaUrl?: string
  link?: string
}

export default function SocialPostGenerator({
  article,
  onClose,
}: SocialPostGeneratorProps) {
  const [posts, setPosts] = useState<GeneratedPost[]>([])
  const [loading, setLoading] = useState(false)
  const [scheduling, setScheduling] = useState(false)
  const [profiles, setProfiles] = useState<any[]>([])
  const [showVariationsModal, setShowVariationsModal] = useState(false)
  const [variations, setVariations] = useState<any[]>([])
  const [loadingVariations, setLoadingVariations] = useState(false)

  useEffect(() => {
    fetchSocialProfiles()
  }, [])

  const fetchSocialProfiles = async () => {
    try {
      const response = await fetch('/api/social/profiles')
      if (response.ok) {
        const data = await response.json()
        setProfiles(data.profiles || [])
      }
    } catch (error) {
      console.error('Error fetching social profiles:', error)
    }
  }

  const handleGeneratePosts = async () => {
    setLoading(true)

    try {
      const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://yoursite.com'
      const articleUrl = `${siteUrl}/articles/${article.slug}`

      const response = await fetch('/api/ai/generate-social-posts', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          title: article.title,
          excerpt: article.excerpt,
          url: articleUrl,
        }),
      })

      if (!response.ok) {
        throw new Error('Failed to generate posts')
      }

      const data = await response.json()

      setPosts(
        data.posts.map((post: any) => ({
          platform: post.platform,
          content: post.content,
          mediaUrl: article.image_url || '',
          link: articleUrl,
        }))
      )
    } catch (error) {
      console.error('Error generating posts:', error)
      alert('Failed to generate social posts. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  const handleUpdatePost = (index: number, content: string) => {
    setPosts((prev) => {
      const newPosts = [...prev]
      newPosts[index].content = content
      return newPosts
    })
  }

  const handleSetSchedule = (index: number, datetime: string) => {
    setPosts((prev) => {
      const newPosts = [...prev]
      newPosts[index].scheduledFor = datetime
      return newPosts
    })
  }

  const handleSetMediaUrl = (index: number, url: string) => {
    setPosts((prev) => {
      const newPosts = [...prev]
      newPosts[index].mediaUrl = url
      return newPosts
    })
  }

  const handleSetLink = (index: number, url: string) => {
    setPosts((prev) => {
      const newPosts = [...prev]
      newPosts[index].link = url
      return newPosts
    })
  }

  const handleSchedulePost = async (post: GeneratedPost, index: number) => {
    // Set this specific post as scheduling
    setPosts((prev) => {
      const newPosts = [...prev]
      newPosts[index] = { ...newPosts[index], isScheduling: true }
      return newPosts
    })

    try {
      const response = await fetch('/api/social/schedule', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          platform: post.platform,
          content: post.content,
          scheduledFor: post.scheduledFor || null,
          articleId: article.id,
          imageUrl: post.mediaUrl || null,
          link: post.link || null,
        }),
      })

      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.error || 'Failed to schedule post')
      }

      alert(`Successfully ${post.scheduledFor ? 'scheduled' : 'published'} post to ${post.platform}!`)
    } catch (error) {
      console.error('Error scheduling post:', error)
      alert(error instanceof Error ? error.message : 'Failed to schedule post')
    } finally {
      // Clear scheduling state for this post
      setPosts((prev) => {
        const newPosts = [...prev]
        newPosts[index] = { ...newPosts[index], isScheduling: false }
        return newPosts
      })
    }
  }

  const handleScheduleAll = async () => {
    setScheduling(true)

    for (let i = 0; i < posts.length; i++) {
      try {
        await handleSchedulePost(posts[i], i)
      } catch (error) {
        console.error(`Error scheduling ${posts[i].platform} post:`, error)
      }
    }

    setScheduling(false)
    alert('All posts processed! Check individual results above.')
  }

  const handleGenerateVariations = async () => {
    setLoadingVariations(true)
    setShowVariationsModal(true)

    try {
      const response = await fetch('/api/ai/generate-post-variations', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          title: article.title,
          content: article.content || article.excerpt,
          currentPosts: posts,
        }),
      })

      if (!response.ok) {
        throw new Error('Failed to generate variations')
      }

      const data = await response.json()
      setVariations(data.variations || [])
    } catch (error) {
      console.error('Error generating variations:', error)
      alert('Failed to generate variations. Please try again.')
      setShowVariationsModal(false)
    } finally {
      setLoadingVariations(false)
    }
  }

  const handleAddVariation = (variation: any) => {
    const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://yoursite.com'
    const articleUrl = `${siteUrl}/articles/${article.slug}`

    setPosts((prev) => [
      ...prev,
      {
        platform: variation.platform as 'twitter' | 'facebook' | 'linkedin' | 'instagram',
        content: variation.text,
        mediaUrl: article.image_url || '',
        link: articleUrl,
      },
    ])
    alert(`Added ${variation.angle} post to your list!`)
  }

  const PlatformIcon = ({ platform }: { platform: string }) => {
    const iconClass = "w-5 h-5"

    switch (platform) {
      case 'twitter':
        return (
          <svg className={iconClass} fill="currentColor" viewBox="0 0 24 24">
            <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/>
          </svg>
        )
      case 'facebook':
        return (
          <svg className={iconClass} fill="currentColor" viewBox="0 0 24 24">
            <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
          </svg>
        )
      case 'linkedin':
        return (
          <svg className={iconClass} fill="currentColor" viewBox="0 0 24 24">
            <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/>
          </svg>
        )
      case 'instagram':
        return (
          <svg className={iconClass} fill="currentColor" viewBox="0 0 24 24">
            <path d="M12 0C8.74 0 8.333.015 7.053.072 5.775.132 4.905.333 4.14.63c-.789.306-1.459.717-2.126 1.384S.935 3.35.63 4.14C.333 4.905.131 5.775.072 7.053.012 8.333 0 8.74 0 12s.015 3.667.072 4.947c.06 1.277.261 2.148.558 2.913.306.788.717 1.459 1.384 2.126.667.666 1.336 1.079 2.126 1.384.766.296 1.636.499 2.913.558C8.333 23.988 8.74 24 12 24s3.667-.015 4.947-.072c1.277-.06 2.148-.262 2.913-.558.788-.306 1.459-.718 2.126-1.384.666-.667 1.079-1.335 1.384-2.126.296-.765.499-1.636.558-2.913.06-1.28.072-1.687.072-4.947s-.015-3.667-.072-4.947c-.06-1.277-.262-2.149-.558-2.913-.306-.789-.718-1.459-1.384-2.126C21.319 1.347 20.651.935 19.86.63c-.765-.297-1.636-.499-2.913-.558C15.667.012 15.26 0 12 0zm0 2.16c3.203 0 3.585.016 4.85.071 1.17.055 1.805.249 2.227.415.562.217.96.477 1.382.896.419.42.679.819.896 1.381.164.422.36 1.057.413 2.227.057 1.266.07 1.646.07 4.85s-.015 3.585-.074 4.85c-.061 1.17-.256 1.805-.421 2.227-.224.562-.479.96-.899 1.382-.419.419-.824.679-1.38.896-.42.164-1.065.36-2.235.413-1.274.057-1.649.07-4.859.07-3.211 0-3.586-.015-4.859-.074-1.171-.061-1.816-.256-2.236-.421-.569-.224-.96-.479-1.379-.899-.421-.419-.69-.824-.9-1.38-.165-.42-.359-1.065-.42-2.235-.045-1.26-.061-1.649-.061-4.844 0-3.196.016-3.586.061-4.861.061-1.17.255-1.814.42-2.234.21-.57.479-.96.9-1.381.419-.419.81-.689 1.379-.898.42-.166 1.051-.361 2.221-.421 1.275-.045 1.65-.06 4.859-.06l.045.03zm0 3.678c-3.405 0-6.162 2.76-6.162 6.162 0 3.405 2.76 6.162 6.162 6.162 3.405 0 6.162-2.76 6.162-6.162 0-3.405-2.76-6.162-6.162-6.162zM12 16c-2.21 0-4-1.79-4-4s1.79-4 4-4 4 1.79 4 4-1.79 4-4 4zm7.846-10.405c0 .795-.646 1.44-1.44 1.44-.795 0-1.44-.646-1.44-1.44 0-.794.646-1.439 1.44-1.439.793-.001 1.44.645 1.44 1.439z"/>
          </svg>
        )
      default:
        return (
          <svg className={iconClass} fill="currentColor" viewBox="0 0 24 24">
            <path d="M7 10l5 5 5-5z"/>
          </svg>
        )
    }
  }

  const getPlatformColor = (platform: string) => {
    switch (platform) {
      case 'twitter':
        return 'bg-black'
      case 'facebook':
        return 'bg-blue-600'
      case 'linkedin':
        return 'bg-blue-700'
      case 'instagram':
        return 'bg-gradient-to-r from-purple-500 via-pink-500 to-orange-500'
      default:
        return 'bg-gray-600'
    }
  }

  const getPlatformName = (platform: string) => {
    switch (platform) {
      case 'twitter':
        return 'X / Twitter'
      case 'facebook':
        return 'Facebook'
      case 'linkedin':
        return 'LinkedIn'
      case 'instagram':
        return 'Instagram'
      default:
        return platform
    }
  }

  const getCharacterLimit = (platform: string) => {
    switch (platform) {
      case 'twitter':
        return 280
      case 'facebook':
        return 5000
      case 'linkedin':
        return 3000
      case 'instagram':
        return 2200
      default:
        return 1000
    }
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-4xl max-h-[90vh] flex flex-col">
        {/* Header */}
        <div className="p-6 border-b border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-2xl font-bold text-gray-900">Social Media Posts</h2>
              <p className="text-sm text-gray-600 mt-1">
                Generate and schedule posts for {article.title}
              </p>
            </div>
            {onClose && (
              <button
                onClick={onClose}
                className="p-2 rounded-lg hover:bg-gray-100 transition-colors"
              >
                <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
                </svg>
              </button>
            )}
          </div>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6">
          {posts.length === 0 ? (
            <div className="text-center py-12">
              <svg className="w-16 h-16 mx-auto mb-4 text-gray-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
              </svg>
              <p className="text-gray-600 mb-4">Generate optimized social media posts for this article</p>
              <button
                onClick={handleGeneratePosts}
                disabled={loading}
                className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-all shadow-sm hover:shadow disabled:opacity-50 disabled:cursor-not-allowed inline-flex items-center gap-2"
              >
                {loading ? (
                  <>
                    <div className="h-5 w-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                    Generating Posts...
                  </>
                ) : (
                  <>
                    <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                      <path d="M13.586 3.586a2 2 0 112.828 2.828l-.793.793-2.828-2.828.793-.793zM11.379 5.793L3 14.172V17h2.828l8.38-8.379-2.83-2.828z" />
                    </svg>
                    Generate Social Posts
                  </>
                )}
              </button>
            </div>
          ) : (
            <div className="space-y-6">
              {posts.map((post, index) => (
                <div key={index} className="border border-gray-200 rounded-lg p-6">
                  {/* Platform Header */}
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-3">
                      <div className={`${getPlatformColor(post.platform)} text-white w-10 h-10 rounded-lg flex items-center justify-center shadow-sm`}>
                        <PlatformIcon platform={post.platform} />
                      </div>
                      <div>
                        <h3 className="font-semibold text-gray-900">{getPlatformName(post.platform)}</h3>
                        <p className="text-sm text-gray-500">
                          {post.content.length} / {getCharacterLimit(post.platform)} characters
                        </p>
                      </div>
                    </div>
                    <button
                      onClick={() => handleSchedulePost(post, index)}
                      disabled={post.isScheduling || scheduling}
                      className="px-4 py-2.5 bg-green-600 text-white text-sm font-medium rounded-lg hover:bg-green-700 transition-all shadow-sm hover:shadow disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      {post.isScheduling ? 'Scheduling...' : post.scheduledFor ? 'Schedule' : 'Post Now'}
                    </button>
                  </div>

                  {/* Content Editor */}
                  <textarea
                    value={post.content}
                    onChange={(e) => handleUpdatePost(index, e.target.value)}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none resize-none"
                    rows={4}
                    maxLength={getCharacterLimit(post.platform)}
                  />

                  {/* Schedule Date/Time */}
                  <div className="mt-4">
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Schedule for later (optional)
                    </label>
                    <input
                      type="datetime-local"
                      value={post.scheduledFor || ''}
                      onChange={(e) => handleSetSchedule(index, e.target.value)}
                      className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
                    />
                  </div>

                  {/* Media URL */}
                  <div className="mt-4">
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Image URL (optional)
                    </label>
                    <input
                      type="url"
                      value={post.mediaUrl || ''}
                      onChange={(e) => handleSetMediaUrl(index, e.target.value)}
                      placeholder="https://example.com/image.jpg"
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
                    />
                    {post.mediaUrl && (
                      <div className="mt-2">
                        <img
                          src={post.mediaUrl}
                          alt="Preview"
                          className="w-full h-32 object-cover rounded-lg"
                          onError={(e) => {
                            e.currentTarget.style.display = 'none'
                          }}
                        />
                      </div>
                    )}
                  </div>

                  {/* Link URL */}
                  <div className="mt-4">
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Link URL (optional)
                    </label>
                    <input
                      type="url"
                      value={post.link || ''}
                      onChange={(e) => handleSetLink(index, e.target.value)}
                      placeholder="https://example.com/article"
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
                    />
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Footer */}
        {posts.length > 0 && (
          <div className="p-6 border-t border-gray-200 flex justify-between items-center">
            <div className="flex gap-2">
              <button
                onClick={handleGeneratePosts}
                disabled={loading}
                className="px-4 py-2 text-blue-600 border border-blue-600 rounded-lg hover:bg-blue-50 transition-all disabled:opacity-50"
              >
                Regenerate Posts
              </button>
              <button
                onClick={handleGenerateVariations}
                disabled={loadingVariations}
                className="px-4 py-2 text-purple-600 border border-purple-600 rounded-lg hover:bg-purple-50 transition-all disabled:opacity-50 inline-flex items-center gap-2"
              >
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                  <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                </svg>
                Generate Variations
              </button>
            </div>
            <div className="flex gap-2">
              {onClose && (
                <button
                  onClick={onClose}
                  className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  Close
                </button>
              )}
              <button
                onClick={handleScheduleAll}
                disabled={scheduling}
                className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-all shadow-sm hover:shadow disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {scheduling ? 'Scheduling...' : 'Schedule All Posts'}
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Variations Modal */}
      {showVariationsModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-lg shadow-xl w-full max-w-4xl max-h-[90vh] flex flex-col">
            {/* Modal Header */}
            <div className="p-6 border-b border-gray-200">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-xl font-bold text-gray-900">Post Variations</h3>
                  <p className="text-sm text-gray-600 mt-1">
                    Choose variations to add to your posts
                  </p>
                </div>
                <button
                  onClick={() => setShowVariationsModal(false)}
                  className="p-2 rounded-lg hover:bg-gray-100 transition-colors"
                >
                  <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
                  </svg>
                </button>
              </div>
            </div>

            {/* Modal Content */}
            <div className="flex-1 overflow-y-auto p-6">
              {loadingVariations ? (
                <div className="flex flex-col items-center justify-center py-12">
                  <div className="h-12 w-12 border-4 border-purple-600 border-t-transparent rounded-full animate-spin mb-4"></div>
                  <p className="text-gray-600">Generating creative variations...</p>
                </div>
              ) : variations.length === 0 ? (
                <div className="text-center py-12">
                  <p className="text-gray-600">No variations generated yet.</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {variations.map((variation, index) => (
                    <div
                      key={index}
                      className="border border-gray-200 rounded-lg p-4 hover:bg-gray-50 transition-colors"
                    >
                      <div className="flex items-start justify-between gap-4">
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
                        <button
                          onClick={() => {
                            handleAddVariation(variation)
                            setShowVariationsModal(false)
                          }}
                          className="flex-shrink-0 px-4 py-2 bg-purple-600 text-white text-sm font-medium rounded-lg hover:bg-purple-700 transition-all"
                        >
                          Add to Posts
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
