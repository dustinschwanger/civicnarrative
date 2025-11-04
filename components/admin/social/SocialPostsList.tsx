'use client'

import { useState, useEffect } from 'react'
import {
  PencilIcon,
  TrashIcon,
  ClockIcon,
  CheckCircleIcon,
  ExclamationCircleIcon,
  DocumentTextIcon,
  ChevronLeftIcon,
  ChevronRightIcon,
} from '@heroicons/react/24/outline'
import { formatDistanceToNow } from 'date-fns'

interface SocialPost {
  id: string
  platform: string
  content: string
  status: string
  scheduled_for: string | null
  created_at: string
  buffer_post_id: string | null
  article_id: string | null
  articles?: {
    id: string
    title: string
    slug: string
  } | null
}

interface SocialPostsListProps {
  platforms: string[]
  statuses: string[]
  search: string
  startDate: string
  endDate: string
  onEdit: (post: SocialPost) => void
  onDelete: (post: SocialPost) => void
}

const PLATFORM_CONFIG = {
  twitter: { label: 'Twitter/X', color: 'bg-blue-100 text-blue-800', icon: '𝕏' },
  facebook: { label: 'Facebook', color: 'bg-blue-200 text-blue-900', icon: 'f' },
  linkedin: { label: 'LinkedIn', color: 'bg-blue-300 text-blue-900', icon: 'in' },
  instagram: { label: 'Instagram', color: 'bg-pink-100 text-pink-800', icon: '📷' },
}

const STATUS_CONFIG = {
  draft: { label: 'Draft', color: 'bg-gray-100 text-gray-800', icon: DocumentTextIcon },
  scheduled: { label: 'Scheduled', color: 'bg-yellow-100 text-yellow-800', icon: ClockIcon },
  published: { label: 'Published', color: 'bg-green-100 text-green-800', icon: CheckCircleIcon },
  failed: { label: 'Failed', color: 'bg-red-100 text-red-800', icon: ExclamationCircleIcon },
}

export default function SocialPostsList({
  platforms,
  statuses,
  search,
  startDate,
  endDate,
  onEdit,
  onDelete,
}: SocialPostsListProps) {
  const [posts, setPosts] = useState<SocialPost[]>([])
  const [loading, setLoading] = useState(true)
  const [total, setTotal] = useState(0)
  const [page, setPage] = useState(1)
  const limit = 20

  useEffect(() => {
    fetchPosts()
  }, [platforms, statuses, search, startDate, endDate, page])

  const fetchPosts = async () => {
    setLoading(true)
    try {
      const params = new URLSearchParams({
        limit: limit.toString(),
        offset: ((page - 1) * limit).toString(),
      })

      if (platforms.length > 0) {
        params.append('platforms', platforms.join(','))
      }
      if (statuses.length > 0) {
        params.append('statuses', statuses.join(','))
      }
      if (search) {
        params.append('search', search)
      }
      if (startDate) {
        params.append('startDate', startDate)
      }
      if (endDate) {
        params.append('endDate', endDate)
      }

      const response = await fetch(`/api/social/posts?${params}`)
      if (!response.ok) throw new Error('Failed to fetch posts')

      const data = await response.json()
      setPosts(data.posts || [])
      setTotal(data.total || 0)
    } catch (error) {
      console.error('Error fetching posts:', error)
      setPosts([])
    } finally {
      setLoading(false)
    }
  }

  const totalPages = Math.ceil(total / limit)

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    )
  }

  if (posts.length === 0) {
    return (
      <div className="text-center py-12 bg-white rounded-lg border border-gray-200">
        <DocumentTextIcon className="mx-auto h-12 w-12 text-gray-400" />
        <h3 className="mt-2 text-sm font-semibold text-gray-900">No posts found</h3>
        <p className="mt-1 text-sm text-gray-500">
          {search || platforms.length > 0 || statuses.length > 0
            ? 'Try adjusting your filters'
            : 'Get started by creating a new post'}
        </p>
      </div>
    )
  }

  return (
    <div className="space-y-4">
      {/* Posts Table */}
      <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Platform
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Content
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Status
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Scheduled
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Created
                </th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {posts.map((post) => {
                const platformConfig = PLATFORM_CONFIG[post.platform as keyof typeof PLATFORM_CONFIG]
                const statusConfig = STATUS_CONFIG[post.status as keyof typeof STATUS_CONFIG]
                const StatusIcon = statusConfig.icon

                return (
                  <tr key={post.id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${platformConfig.color}`}>
                        {platformConfig.icon} {platformConfig.label}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <div className="max-w-md">
                        <p className="text-sm text-gray-900 line-clamp-2">
                          {post.content}
                        </p>
                        {post.articles && (
                          <p className="text-xs text-gray-500 mt-1">
                            Article: {post.articles.title}
                          </p>
                        )}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-medium ${statusConfig.color}`}>
                        <StatusIcon className="h-3.5 w-3.5" />
                        {statusConfig.label}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {post.scheduled_for ? (
                        <div>
                          <div className="font-medium text-gray-900">
                            {new Date(post.scheduled_for).toLocaleDateString()}
                          </div>
                          <div className="text-xs">
                            {new Date(post.scheduled_for).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                          </div>
                        </div>
                      ) : (
                        <span className="text-gray-400">—</span>
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {formatDistanceToNow(new Date(post.created_at), { addSuffix: true })}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <div className="flex items-center justify-end gap-2">
                        <button
                          onClick={() => onEdit(post)}
                          className="text-blue-600 hover:text-blue-900 transition-colors p-1 rounded hover:bg-blue-50"
                          title="Edit post"
                          disabled={post.status === 'published'}
                        >
                          <PencilIcon className="h-5 w-5" />
                        </button>
                        <button
                          onClick={() => onDelete(post)}
                          className="text-red-600 hover:text-red-900 transition-colors p-1 rounded hover:bg-red-50"
                          title="Delete post"
                          disabled={post.status === 'published'}
                        >
                          <TrashIcon className="h-5 w-5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex items-center justify-between bg-white px-4 py-3 border border-gray-200 rounded-lg">
          <div className="flex items-center gap-2">
            <p className="text-sm text-gray-700">
              Showing <span className="font-medium">{(page - 1) * limit + 1}</span> to{' '}
              <span className="font-medium">{Math.min(page * limit, total)}</span> of{' '}
              <span className="font-medium">{total}</span> posts
            </p>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => setPage(page - 1)}
              disabled={page === 1}
              className="relative inline-flex items-center px-3 py-2 border border-gray-300 text-sm font-medium rounded-lg text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
            >
              <ChevronLeftIcon className="h-5 w-5" />
            </button>
            <span className="text-sm text-gray-700">
              Page <span className="font-medium">{page}</span> of <span className="font-medium">{totalPages}</span>
            </span>
            <button
              onClick={() => setPage(page + 1)}
              disabled={page === totalPages}
              className="relative inline-flex items-center px-3 py-2 border border-gray-300 text-sm font-medium rounded-lg text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
            >
              <ChevronRightIcon className="h-5 w-5" />
            </button>
          </div>
        </div>
      )}
    </div>
  )
}
