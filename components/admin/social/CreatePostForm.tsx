'use client'

import { useState } from 'react'
import {
  PaperAirplaneIcon,
  CalendarIcon,
  PhotoIcon,
  LinkIcon,
  XMarkIcon,
  CheckCircleIcon,
  ExclamationCircleIcon,
} from '@heroicons/react/24/outline'

interface CreatePostFormProps {
  onSuccess?: () => void
}

const PLATFORM_OPTIONS = [
  { value: 'twitter', label: 'Twitter/X', maxChars: 280 },
  { value: 'facebook', label: 'Facebook', maxChars: 5000 },
  { value: 'linkedin', label: 'LinkedIn', maxChars: 3000 },
  { value: 'instagram', label: 'Instagram', maxChars: 2200 },
]

export default function CreatePostForm({ onSuccess }: CreatePostFormProps) {
  const [platform, setPlatform] = useState('')
  const [content, setContent] = useState('')
  const [scheduledFor, setScheduledFor] = useState('')
  const [imageUrl, setImageUrl] = useState('')
  const [link, setLink] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState(false)

  const selectedPlatform = PLATFORM_OPTIONS.find(p => p.value === platform)
  const maxChars = selectedPlatform?.maxChars || 280
  const charsRemaining = maxChars - content.length
  const isOverLimit = charsRemaining < 0

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setSuccess(false)

    // Validation
    if (!platform || !content) {
      setError('Platform and content are required')
      return
    }

    if (isOverLimit) {
      setError(`Content exceeds ${maxChars} character limit`)
      return
    }

    setLoading(true)

    try {
      const response = await fetch('/api/social/posts', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          platform,
          content,
          scheduledFor: scheduledFor || null,
          imageUrl: imageUrl || null,
          link: link || null,
        }),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || 'Failed to create post')
      }

      setSuccess(true)
      // Reset form
      setPlatform('')
      setContent('')
      setScheduledFor('')
      setImageUrl('')
      setLink('')

      // Call success callback
      if (onSuccess) {
        setTimeout(() => {
          onSuccess()
        }, 1500)
      }
    } catch (err: any) {
      setError(err.message || 'Failed to create post')
    } finally {
      setLoading(false)
    }
  }

  const handleReset = () => {
    setPlatform('')
    setContent('')
    setScheduledFor('')
    setImageUrl('')
    setLink('')
    setError('')
    setSuccess(false)
  }

  return (
    <div className="bg-white rounded-lg border border-gray-200 p-6">
      <h3 className="text-lg font-semibold text-gray-900 mb-4">Create New Post</h3>

      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Platform Selection */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Platform <span className="text-red-500">*</span>
          </label>
          <select
            value={platform}
            onChange={(e) => setPlatform(e.target.value)}
            className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
            required
          >
            <option value="">Select a platform</option>
            {PLATFORM_OPTIONS.map((p) => (
              <option key={p.value} value={p.value}>
                {p.label}
              </option>
            ))}
          </select>
        </div>

        {/* Content Textarea */}
        <div>
          <div className="flex items-center justify-between mb-2">
            <label className="block text-sm font-medium text-gray-700">
              Content <span className="text-red-500">*</span>
            </label>
            <span className={`text-sm font-medium ${
              isOverLimit ? 'text-red-600' : charsRemaining < 20 ? 'text-yellow-600' : 'text-gray-500'
            }`}>
              {charsRemaining} characters remaining
            </span>
          </div>
          <textarea
            value={content}
            onChange={(e) => setContent(e.target.value)}
            placeholder="Write your post content here..."
            rows={6}
            className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all resize-none ${
              isOverLimit ? 'border-red-300 bg-red-50' : 'border-gray-300'
            }`}
            required
          />
        </div>

        {/* Schedule Date/Time */}
        <div>
          <label className="flex items-center gap-2 text-sm font-medium text-gray-700 mb-2">
            <CalendarIcon className="h-4 w-4" />
            Schedule for later (optional)
          </label>
          <input
            type="datetime-local"
            value={scheduledFor}
            onChange={(e) => setScheduledFor(e.target.value)}
            min={new Date().toISOString().slice(0, 16)}
            className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
          />
        </div>

        {/* Image URL */}
        <div>
          <label className="flex items-center gap-2 text-sm font-medium text-gray-700 mb-2">
            <PhotoIcon className="h-4 w-4" />
            Image URL (optional)
          </label>
          <input
            type="url"
            value={imageUrl}
            onChange={(e) => setImageUrl(e.target.value)}
            placeholder="https://example.com/image.jpg"
            className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
          />
        </div>

        {/* Link */}
        <div>
          <label className="flex items-center gap-2 text-sm font-medium text-gray-700 mb-2">
            <LinkIcon className="h-4 w-4" />
            Link (optional)
          </label>
          <input
            type="url"
            value={link}
            onChange={(e) => setLink(e.target.value)}
            placeholder="https://example.com/article"
            className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
          />
        </div>

        {/* Error Message */}
        {error && (
          <div className="flex items-center gap-2 p-4 bg-red-50 border border-red-200 rounded-lg text-red-800">
            <ExclamationCircleIcon className="h-5 w-5 flex-shrink-0" />
            <span className="text-sm font-medium">{error}</span>
          </div>
        )}

        {/* Success Message */}
        {success && (
          <div className="flex items-center gap-2 p-4 bg-green-50 border border-green-200 rounded-lg text-green-800">
            <CheckCircleIcon className="h-5 w-5 flex-shrink-0" />
            <span className="text-sm font-medium">
              Post {scheduledFor ? 'scheduled' : 'published'} successfully!
            </span>
          </div>
        )}

        {/* Action Buttons */}
        <div className="flex gap-3 pt-2">
          <button
            type="submit"
            disabled={loading || !platform || !content || isOverLimit}
            className="flex-1 flex items-center justify-center gap-2 px-6 py-3 bg-blue-600 text-white font-semibold rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-sm hover:shadow-md"
          >
            {loading ? (
              <>
                <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                Creating...
              </>
            ) : (
              <>
                <PaperAirplaneIcon className="h-5 w-5" />
                {scheduledFor ? 'Schedule Post' : 'Publish Now'}
              </>
            )}
          </button>
          <button
            type="button"
            onClick={handleReset}
            disabled={loading}
            className="px-6 py-3 border border-gray-300 text-gray-700 font-semibold rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
          >
            <XMarkIcon className="h-5 w-5" />
          </button>
        </div>
      </form>
    </div>
  )
}
