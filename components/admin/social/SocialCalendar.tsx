'use client'

import { useState, useEffect } from 'react'
import {
  ChevronLeftIcon,
  ChevronRightIcon,
  CalendarIcon,
} from '@heroicons/react/24/outline'
import {
  format,
  startOfMonth,
  endOfMonth,
  startOfWeek,
  endOfWeek,
  addDays,
  addMonths,
  subMonths,
  isSameMonth,
  isSameDay,
  isToday,
  parseISO,
} from 'date-fns'

interface SocialPost {
  id: string
  platform: string
  content: string
  status: string
  scheduled_for: string
  created_at: string
}

const PLATFORM_COLORS = {
  twitter: 'bg-blue-500',
  facebook: 'bg-blue-600',
  linkedin: 'bg-blue-700',
  instagram: 'bg-pink-500',
}

export default function SocialCalendar() {
  const [currentMonth, setCurrentMonth] = useState(new Date())
  const [posts, setPosts] = useState<SocialPost[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedDate, setSelectedDate] = useState<Date | null>(null)

  useEffect(() => {
    fetchScheduledPosts()
  }, [currentMonth])

  const fetchScheduledPosts = async () => {
    setLoading(true)
    try {
      const monthStart = startOfMonth(currentMonth)
      const monthEnd = endOfMonth(currentMonth)

      const params = new URLSearchParams({
        statuses: 'scheduled',
        startDate: monthStart.toISOString(),
        endDate: monthEnd.toISOString(),
        limit: '1000', // Get all posts for the month
      })

      const response = await fetch(`/api/social/posts?${params}`)
      if (!response.ok) throw new Error('Failed to fetch posts')

      const data = await response.json()
      setPosts(data.posts || [])
    } catch (error) {
      console.error('Error fetching scheduled posts:', error)
      setPosts([])
    } finally {
      setLoading(false)
    }
  }

  const getPostsForDate = (date: Date) => {
    return posts.filter((post) => {
      if (!post.scheduled_for) return false
      return isSameDay(parseISO(post.scheduled_for), date)
    })
  }

  const renderHeader = () => {
    return (
      <div className="flex items-center justify-between mb-4 pb-4 border-b border-gray-200">
        <h3 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
          <CalendarIcon className="h-5 w-5" />
          {format(currentMonth, 'MMMM yyyy')}
        </h3>
        <div className="flex gap-2">
          <button
            onClick={() => setCurrentMonth(subMonths(currentMonth, 1))}
            className="p-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
          >
            <ChevronLeftIcon className="h-5 w-5 text-gray-600" />
          </button>
          <button
            onClick={() => setCurrentMonth(new Date())}
            className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors text-sm font-medium"
          >
            Today
          </button>
          <button
            onClick={() => setCurrentMonth(addMonths(currentMonth, 1))}
            className="p-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
          >
            <ChevronRightIcon className="h-5 w-5 text-gray-600" />
          </button>
        </div>
      </div>
    )
  }

  const renderDays = () => {
    const days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']
    return (
      <div className="grid grid-cols-7 gap-px bg-gray-200 mb-px">
        {days.map((day) => (
          <div
            key={day}
            className="bg-gray-50 py-2 text-center text-xs font-semibold text-gray-700"
          >
            {day}
          </div>
        ))}
      </div>
    )
  }

  const renderCells = () => {
    const monthStart = startOfMonth(currentMonth)
    const monthEnd = endOfMonth(currentMonth)
    const startDate = startOfWeek(monthStart)
    const endDate = endOfWeek(monthEnd)

    const rows = []
    let days = []
    let day = startDate

    while (day <= endDate) {
      for (let i = 0; i < 7; i++) {
        const currentDay = day
        const dayPosts = getPostsForDate(currentDay)
        const isCurrentMonth = isSameMonth(currentDay, monthStart)
        const isTodayDate = isToday(currentDay)

        days.push(
          <div
            key={currentDay.toString()}
            className={`min-h-[100px] bg-white p-2 border-r border-b border-gray-200 ${
              !isCurrentMonth ? 'bg-gray-50' : ''
            } ${isTodayDate ? 'bg-blue-50' : ''} hover:bg-gray-50 transition-colors cursor-pointer`}
            onClick={() => setSelectedDate(currentDay)}
          >
            <div className="flex items-center justify-between mb-1">
              <span
                className={`text-sm font-medium ${
                  !isCurrentMonth
                    ? 'text-gray-400'
                    : isTodayDate
                    ? 'text-blue-700 font-bold'
                    : 'text-gray-700'
                }`}
              >
                {format(currentDay, 'd')}
              </span>
              {dayPosts.length > 0 && (
                <span className="text-xs font-semibold text-blue-600 bg-blue-100 px-1.5 py-0.5 rounded">
                  {dayPosts.length}
                </span>
              )}
            </div>
            <div className="space-y-1">
              {dayPosts.slice(0, 3).map((post) => (
                <div
                  key={post.id}
                  className={`text-xs p-1.5 rounded ${
                    PLATFORM_COLORS[post.platform as keyof typeof PLATFORM_COLORS]
                  } text-white truncate`}
                  title={post.content}
                >
                  {post.content.substring(0, 30)}...
                </div>
              ))}
              {dayPosts.length > 3 && (
                <div className="text-xs text-gray-500 font-medium pl-1">
                  +{dayPosts.length - 3} more
                </div>
              )}
            </div>
          </div>
        )
        day = addDays(day, 1)
      }
      rows.push(
        <div key={day.toString()} className="grid grid-cols-7 gap-px bg-gray-200">
          {days}
        </div>
      )
      days = []
    }

    return <div>{rows}</div>
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12 bg-white rounded-lg border border-gray-200">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    )
  }

  return (
    <div className="bg-white rounded-lg border border-gray-200 p-6">
      {renderHeader()}
      {renderDays()}
      {renderCells()}

      {/* Selected Date Modal */}
      {selectedDate && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-2xl w-full mx-4 max-h-[80vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-900">
                Posts for {format(selectedDate, 'MMMM d, yyyy')}
              </h3>
              <button
                onClick={() => setSelectedDate(null)}
                className="text-gray-400 hover:text-gray-600 transition-colors"
              >
                ✕
              </button>
            </div>
            <div className="space-y-3">
              {getPostsForDate(selectedDate).length === 0 ? (
                <p className="text-gray-500 text-center py-8">No posts scheduled for this day</p>
              ) : (
                getPostsForDate(selectedDate).map((post) => (
                  <div
                    key={post.id}
                    className="border border-gray-200 rounded-lg p-4 hover:bg-gray-50 transition-colors"
                  >
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-xs font-medium text-gray-500 uppercase">
                        {post.platform}
                      </span>
                      <span className="text-sm text-gray-600">
                        {format(parseISO(post.scheduled_for), 'h:mm a')}
                      </span>
                    </div>
                    <p className="text-sm text-gray-900">{post.content}</p>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
