'use client'

import { useEffect, useState } from 'react'
import AdminLayout from '@/components/admin/AdminLayout'
import { withAdminAuth } from '@/contexts/AdminContext'
import { supabase } from '@/lib/supabase-client'
import Link from 'next/link'
import {
  DocumentTextIcon,
  CheckCircleIcon,
  DocumentDuplicateIcon,
  CalendarIcon,
  PhotoIcon,
  PlusCircleIcon,
  FolderOpenIcon,
  ArrowUpTrayIcon,
  ShareIcon,
  ArrowTrendingUpIcon,
} from '@heroicons/react/24/outline'

function AdminDashboard() {
  const [stats, setStats] = useState({
    totalArticles: 0,
    publishedArticles: 0,
    draftArticles: 0,
    scheduledPosts: 0,
    mediaFiles: 0,
  })
  const [loading, setLoading] = useState(true)
  const [recentArticles, setRecentArticles] = useState<any[]>([])

  useEffect(() => {
    fetchDashboardData()
  }, [])

  const fetchDashboardData = async () => {
    try {
      // Fetch article stats
      const { count: totalArticles } = await supabase
        .from('articles')
        .select('*', { count: 'exact', head: true })

      const { count: publishedArticles } = await supabase
        .from('articles')
        .select('*', { count: 'exact', head: true })
        .eq('status', 'published')

      const { count: draftArticles } = await supabase
        .from('articles')
        .select('*', { count: 'exact', head: true })
        .eq('status', 'draft')

      const { count: scheduledPosts } = await supabase
        .from('social_posts')
        .select('*', { count: 'exact', head: true })
        .eq('status', 'scheduled')

      const { count: mediaFiles } = await supabase
        .from('media_library')
        .select('*', { count: 'exact', head: true })

      // Fetch recent articles
      const { data: articles } = await supabase
        .from('articles')
        .select('id, title, status, created_at')
        .order('created_at', { ascending: false })
        .limit(5)

      setStats({
        totalArticles: totalArticles || 0,
        publishedArticles: publishedArticles || 0,
        draftArticles: draftArticles || 0,
        scheduledPosts: scheduledPosts || 0,
        mediaFiles: mediaFiles || 0,
      })

      setRecentArticles(articles || [])
    } catch (error) {
      console.error('Error fetching dashboard data:', error)
    } finally {
      setLoading(false)
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
      <div className="space-y-8">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Dashboard</h1>
            <p className="text-gray-600 mt-2 flex items-center gap-2">
              <ArrowTrendingUpIcon className="h-5 w-5 text-green-600" />
              Overview of your content management system
            </p>
          </div>
          <Link
            href="/admin/articles/new"
            className="flex items-center gap-2 px-5 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium transition-all duration-200 shadow-sm hover:shadow-md"
          >
            <PlusCircleIcon className="h-5 w-5" />
            New Article
          </Link>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6">
          <StatCard
            title="Total Articles"
            value={stats.totalArticles}
            icon={DocumentTextIcon}
            gradient="from-blue-500 to-blue-600"
            trend="+12%"
          />
          <StatCard
            title="Published"
            value={stats.publishedArticles}
            icon={CheckCircleIcon}
            gradient="from-green-500 to-green-600"
            trend="+8%"
          />
          <StatCard
            title="Drafts"
            value={stats.draftArticles}
            icon={DocumentDuplicateIcon}
            gradient="from-amber-500 to-amber-600"
          />
          <StatCard
            title="Scheduled Posts"
            value={stats.scheduledPosts}
            icon={CalendarIcon}
            gradient="from-purple-500 to-purple-600"
          />
          <StatCard
            title="Media Files"
            value={stats.mediaFiles}
            icon={PhotoIcon}
            gradient="from-pink-500 to-pink-600"
          />
        </div>

        {/* Quick Actions */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-5">Quick Actions</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <QuickActionButton
              href="/admin/articles/new"
              icon={PlusCircleIcon}
              title="Create Article"
              description="Start with AI assistance"
              color="blue"
            />
            <QuickActionButton
              href="/admin/articles"
              icon={FolderOpenIcon}
              title="Manage Articles"
              description="View and edit articles"
              color="green"
            />
            <QuickActionButton
              href="/admin/media"
              icon={ArrowUpTrayIcon}
              title="Upload Media"
              description="Add images and files"
              color="purple"
            />
            <QuickActionButton
              href="/admin/social"
              icon={ShareIcon}
              title="Social Posts"
              description="Schedule and manage"
              color="pink"
            />
          </div>
        </div>

        {/* Recent Articles */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
          <div className="px-6 py-5 border-b border-gray-200">
            <h2 className="text-xl font-semibold text-gray-900">Recent Articles</h2>
          </div>
          <div className="divide-y divide-gray-200">
            {recentArticles.length === 0 ? (
              <div className="px-6 py-12 text-center">
                <DocumentTextIcon className="h-12 w-12 text-gray-300 mx-auto mb-3" />
                <p className="text-gray-500 font-medium">No articles yet</p>
                <p className="text-gray-400 text-sm mt-1">Create your first article to get started</p>
              </div>
            ) : (
              recentArticles.map((article) => (
                <Link
                  key={article.id}
                  href={`/admin/articles/${article.id}/edit`}
                  className="px-6 py-4 hover:bg-gray-50 flex justify-between items-center transition-colors group"
                >
                  <div className="flex items-center gap-4 flex-1">
                    <div className="w-10 h-10 bg-gradient-to-br from-blue-50 to-blue-100 rounded-lg flex items-center justify-center group-hover:scale-105 transition-transform">
                      <DocumentTextIcon className="h-5 w-5 text-blue-600" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <h3 className="font-medium text-gray-900 truncate group-hover:text-blue-600 transition-colors">
                        {article.title}
                      </h3>
                      <p className="text-sm text-gray-500 mt-0.5">
                        {new Date(article.created_at).toLocaleDateString('en-US', {
                          month: 'short',
                          day: 'numeric',
                          year: 'numeric',
                        })}
                      </p>
                    </div>
                  </div>
                  <span
                    className={`px-3 py-1 rounded-full text-xs font-medium ${
                      article.status === 'published'
                        ? 'bg-green-50 text-green-700 border border-green-200'
                        : article.status === 'review'
                        ? 'bg-amber-50 text-amber-700 border border-amber-200'
                        : 'bg-gray-50 text-gray-700 border border-gray-200'
                    }`}
                  >
                    {article.status.charAt(0).toUpperCase() + article.status.slice(1)}
                  </span>
                </Link>
              ))
            )}
          </div>
        </div>
      </div>
    </AdminLayout>
  )
}

function StatCard({
  title,
  value,
  icon: Icon,
  gradient,
  trend,
}: {
  title: string
  value: number
  icon: any
  gradient: string
  trend?: string
}) {
  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 hover:shadow-md transition-shadow">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm font-medium text-gray-600 mb-1">{title}</p>
          <p className="text-3xl font-bold text-gray-900">{value.toLocaleString()}</p>
          {trend && (
            <p className="text-xs font-medium text-green-600 mt-2 flex items-center gap-1">
              <ArrowTrendingUpIcon className="h-3 w-3" />
              {trend} from last month
            </p>
          )}
        </div>
        <div className={`bg-gradient-to-br ${gradient} p-3 rounded-xl shadow-sm`}>
          <Icon className="h-6 w-6 text-white" />
        </div>
      </div>
    </div>
  )
}

function QuickActionButton({
  href,
  icon: Icon,
  title,
  description,
  color,
}: {
  href: string
  icon: any
  title: string
  description: string
  color: string
}) {
  const colorClasses = {
    blue: 'bg-blue-50 text-blue-600 group-hover:bg-blue-100',
    green: 'bg-green-50 text-green-600 group-hover:bg-green-100',
    purple: 'bg-purple-50 text-purple-600 group-hover:bg-purple-100',
    pink: 'bg-pink-50 text-pink-600 group-hover:bg-pink-100',
  }

  return (
    <Link
      href={href}
      className="flex items-start gap-4 p-5 border-2 border-gray-200 rounded-xl hover:border-gray-300 hover:shadow-sm transition-all group"
    >
      <div className={`p-3 rounded-lg transition-colors ${colorClasses[color as keyof typeof colorClasses]}`}>
        <Icon className="h-6 w-6" />
      </div>
      <div className="flex-1">
        <h3 className="font-semibold text-gray-900 group-hover:text-gray-800 transition-colors">
          {title}
        </h3>
        <p className="text-sm text-gray-600 mt-0.5">{description}</p>
      </div>
    </Link>
  )
}

export default withAdminAuth(AdminDashboard)
