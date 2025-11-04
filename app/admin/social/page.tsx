'use client'

import { useState, useEffect } from 'react'
import {
  ChartBarIcon,
  ListBulletIcon,
  CalendarIcon,
  PlusCircleIcon,
  SparklesIcon,
  ClockIcon,
  CheckCircleIcon,
  ExclamationCircleIcon,
  DocumentTextIcon,
} from '@heroicons/react/24/outline'
import SocialFilters from '@/components/admin/social/SocialFilters'
import SocialPostsList from '@/components/admin/social/SocialPostsList'
import SocialCalendar from '@/components/admin/social/SocialCalendar'
import CreatePostForm from '@/components/admin/social/CreatePostForm'
import ContentIdeasGenerator from '@/components/admin/social/ContentIdeasGenerator'

interface Stats {
  total: number
  published: number
  scheduled: number
  draft: number
  failed: number
  platformCounts: {
    twitter: number
    facebook: number
    linkedin: number
    instagram: number
  }
  recentPosts: number
}

type TabType = 'list' | 'calendar' | 'create' | 'ai'

export default function SocialMediaPage() {
  const [activeTab, setActiveTab] = useState<TabType>('list')
  const [stats, setStats] = useState<Stats | null>(null)
  const [loadingStats, setLoadingStats] = useState(true)

  // Filter states
  const [platforms, setPlatforms] = useState<string[]>([])
  const [statuses, setStatuses] = useState<string[]>([])
  const [search, setSearch] = useState('')
  const [startDate, setStartDate] = useState('')
  const [endDate, setEndDate] = useState('')

  useEffect(() => {
    fetchStats()
  }, [])

  const fetchStats = async () => {
    setLoadingStats(true)
    try {
      const response = await fetch('/api/social/stats')
      if (!response.ok) throw new Error('Failed to fetch stats')
      const data = await response.json()
      setStats(data)
    } catch (error) {
      console.error('Error fetching stats:', error)
    } finally {
      setLoadingStats(false)
    }
  }

  const clearFilters = () => {
    setPlatforms([])
    setStatuses([])
    setSearch('')
    setStartDate('')
    setEndDate('')
  }

  const handleEdit = (post: any) => {
    // TODO: Implement edit modal
    console.log('Edit post:', post)
  }

  const handleDelete = async (post: any) => {
    if (!confirm('Are you sure you want to delete this post?')) return

    try {
      const response = await fetch(`/api/social/posts/${post.id}`, {
        method: 'DELETE',
      })

      if (!response.ok) throw new Error('Failed to delete post')

      // Refresh stats and list
      fetchStats()
      // The list will auto-refresh via its useEffect
    } catch (error: any) {
      alert(error.message || 'Failed to delete post')
    }
  }

  const tabs = [
    { id: 'list' as TabType, label: 'All Posts', icon: ListBulletIcon },
    { id: 'calendar' as TabType, label: 'Calendar', icon: CalendarIcon },
    { id: 'create' as TabType, label: 'Create Post', icon: PlusCircleIcon },
    { id: 'ai' as TabType, label: 'AI Generator', icon: SparklesIcon },
  ]

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Social Media Management</h1>
          <p className="text-gray-600 mt-1">Manage and schedule your social media posts</p>
        </div>
      </div>

      {/* Stats Dashboard */}
      {!loadingStats && stats && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {/* Total Posts */}
          <div className="bg-white rounded-lg border border-gray-200 p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Total Posts</p>
                <p className="text-3xl font-bold text-gray-900 mt-2">{stats.total}</p>
              </div>
              <ChartBarIcon className="h-10 w-10 text-gray-400" />
            </div>
          </div>

          {/* Scheduled */}
          <div className="bg-white rounded-lg border border-gray-200 p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Scheduled</p>
                <p className="text-3xl font-bold text-yellow-600 mt-2">{stats.scheduled}</p>
              </div>
              <ClockIcon className="h-10 w-10 text-yellow-400" />
            </div>
          </div>

          {/* Published */}
          <div className="bg-white rounded-lg border border-gray-200 p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Published</p>
                <p className="text-3xl font-bold text-green-600 mt-2">{stats.published}</p>
              </div>
              <CheckCircleIcon className="h-10 w-10 text-green-400" />
            </div>
          </div>

          {/* Recent (7 days) */}
          <div className="bg-white rounded-lg border border-gray-200 p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Last 7 Days</p>
                <p className="text-3xl font-bold text-blue-600 mt-2">{stats.recentPosts}</p>
              </div>
              <DocumentTextIcon className="h-10 w-10 text-blue-400" />
            </div>
          </div>
        </div>
      )}

      {/* Platform Breakdown */}
      {!loadingStats && stats && (
        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <h3 className="text-sm font-semibold text-gray-700 mb-4">By Platform</h3>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="flex items-center gap-3">
              <div className="w-3 h-3 rounded-full bg-blue-500"></div>
              <div>
                <p className="text-xs text-gray-600">Twitter/X</p>
                <p className="text-lg font-bold text-gray-900">{stats.platformCounts.twitter}</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <div className="w-3 h-3 rounded-full bg-blue-600"></div>
              <div>
                <p className="text-xs text-gray-600">Facebook</p>
                <p className="text-lg font-bold text-gray-900">{stats.platformCounts.facebook}</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <div className="w-3 h-3 rounded-full bg-blue-700"></div>
              <div>
                <p className="text-xs text-gray-600">LinkedIn</p>
                <p className="text-lg font-bold text-gray-900">{stats.platformCounts.linkedin}</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <div className="w-3 h-3 rounded-full bg-pink-500"></div>
              <div>
                <p className="text-xs text-gray-600">Instagram</p>
                <p className="text-lg font-bold text-gray-900">{stats.platformCounts.instagram}</p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Tabs */}
      <div className="border-b border-gray-200">
        <nav className="flex space-x-8">
          {tabs.map((tab) => {
            const Icon = tab.icon
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center gap-2 py-4 px-1 border-b-2 font-medium text-sm transition-colors ${
                  activeTab === tab.id
                    ? 'border-blue-600 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                <Icon className="h-5 w-5" />
                {tab.label}
              </button>
            )
          })}
        </nav>
      </div>

      {/* Tab Content */}
      <div className="space-y-6">
        {activeTab === 'list' && (
          <>
            <SocialFilters
              platforms={platforms}
              statuses={statuses}
              search={search}
              startDate={startDate}
              endDate={endDate}
              onPlatformsChange={setPlatforms}
              onStatusesChange={setStatuses}
              onSearchChange={setSearch}
              onStartDateChange={setStartDate}
              onEndDateChange={setEndDate}
              onClearFilters={clearFilters}
            />
            <SocialPostsList
              platforms={platforms}
              statuses={statuses}
              search={search}
              startDate={startDate}
              endDate={endDate}
              onEdit={handleEdit}
              onDelete={handleDelete}
            />
          </>
        )}

        {activeTab === 'calendar' && <SocialCalendar />}

        {activeTab === 'create' && (
          <CreatePostForm
            onSuccess={() => {
              fetchStats()
              setActiveTab('list')
            }}
          />
        )}

        {activeTab === 'ai' && <ContentIdeasGenerator />}
      </div>
    </div>
  )
}
