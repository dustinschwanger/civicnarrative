'use client'

import { useState } from 'react'
import {
  FunnelIcon,
  MagnifyingGlassIcon,
  XMarkIcon,
} from '@heroicons/react/24/outline'

interface SocialFiltersProps {
  platforms: string[]
  statuses: string[]
  search: string
  startDate: string
  endDate: string
  onPlatformsChange: (platforms: string[]) => void
  onStatusesChange: (statuses: string[]) => void
  onSearchChange: (search: string) => void
  onStartDateChange: (date: string) => void
  onEndDateChange: (date: string) => void
  onClearFilters: () => void
}

const PLATFORM_OPTIONS = [
  { value: 'twitter', label: 'Twitter/X', color: 'bg-blue-500' },
  { value: 'facebook', label: 'Facebook', color: 'bg-blue-600' },
  { value: 'linkedin', label: 'LinkedIn', color: 'bg-blue-700' },
  { value: 'instagram', label: 'Instagram', color: 'bg-pink-500' },
]

const STATUS_OPTIONS = [
  { value: 'draft', label: 'Draft', color: 'bg-gray-500' },
  { value: 'scheduled', label: 'Scheduled', color: 'bg-yellow-500' },
  { value: 'published', label: 'Published', color: 'bg-green-500' },
  { value: 'failed', label: 'Failed', color: 'bg-red-500' },
]

export default function SocialFilters({
  platforms,
  statuses,
  search,
  startDate,
  endDate,
  onPlatformsChange,
  onStatusesChange,
  onSearchChange,
  onStartDateChange,
  onEndDateChange,
  onClearFilters,
}: SocialFiltersProps) {
  const [showFilters, setShowFilters] = useState(false)

  const togglePlatform = (platform: string) => {
    if (platforms.includes(platform)) {
      onPlatformsChange(platforms.filter(p => p !== platform))
    } else {
      onPlatformsChange([...platforms, platform])
    }
  }

  const toggleStatus = (status: string) => {
    if (statuses.includes(status)) {
      onStatusesChange(statuses.filter(s => s !== status))
    } else {
      onStatusesChange([...statuses, status])
    }
  }

  const hasActiveFilters = platforms.length > 0 || statuses.length > 0 || search || startDate || endDate

  return (
    <div className="bg-white rounded-lg border border-gray-200 p-4 space-y-4">
      {/* Search Bar and Filter Toggle */}
      <div className="flex flex-col sm:flex-row gap-3">
        {/* Search Input */}
        <div className="flex-1 relative">
          <MagnifyingGlassIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
          <input
            type="text"
            placeholder="Search posts by content..."
            value={search}
            onChange={(e) => onSearchChange(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
          />
        </div>

        {/* Filter Toggle Button */}
        <div className="flex gap-2">
          <button
            onClick={() => setShowFilters(!showFilters)}
            className={`flex items-center gap-2 px-4 py-2.5 border rounded-lg font-medium transition-all ${
              showFilters
                ? 'bg-blue-50 border-blue-300 text-blue-700'
                : 'bg-white border-gray-300 text-gray-700 hover:bg-gray-50'
            }`}
          >
            <FunnelIcon className="h-5 w-5" />
            <span className="hidden sm:inline">Filters</span>
            {hasActiveFilters && (
              <span className="bg-blue-600 text-white text-xs font-bold rounded-full w-5 h-5 flex items-center justify-center">
                {platforms.length + statuses.length + (startDate ? 1 : 0) + (endDate ? 1 : 0)}
              </span>
            )}
          </button>

          {hasActiveFilters && (
            <button
              onClick={onClearFilters}
              className="flex items-center gap-2 px-4 py-2.5 border border-gray-300 rounded-lg font-medium text-gray-700 hover:bg-gray-50 transition-all"
            >
              <XMarkIcon className="h-5 w-5" />
              <span className="hidden sm:inline">Clear</span>
            </button>
          )}
        </div>
      </div>

      {/* Filter Options */}
      {showFilters && (
        <div className="pt-4 border-t border-gray-200 space-y-4 animate-fadeIn">
          {/* Platform Filter */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              Platforms
            </label>
            <div className="flex flex-wrap gap-2">
              {PLATFORM_OPTIONS.map((platform) => (
                <button
                  key={platform.value}
                  onClick={() => togglePlatform(platform.value)}
                  className={`flex items-center gap-2 px-4 py-2 rounded-lg border font-medium transition-all ${
                    platforms.includes(platform.value)
                      ? 'bg-blue-50 border-blue-300 text-blue-700'
                      : 'bg-white border-gray-300 text-gray-700 hover:bg-gray-50'
                  }`}
                >
                  <span className={`w-3 h-3 rounded-full ${platform.color}`}></span>
                  {platform.label}
                </button>
              ))}
            </div>
          </div>

          {/* Status Filter */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              Status
            </label>
            <div className="flex flex-wrap gap-2">
              {STATUS_OPTIONS.map((status) => (
                <button
                  key={status.value}
                  onClick={() => toggleStatus(status.value)}
                  className={`flex items-center gap-2 px-4 py-2 rounded-lg border font-medium transition-all ${
                    statuses.includes(status.value)
                      ? 'bg-blue-50 border-blue-300 text-blue-700'
                      : 'bg-white border-gray-300 text-gray-700 hover:bg-gray-50'
                  }`}
                >
                  <span className={`w-3 h-3 rounded-full ${status.color}`}></span>
                  {status.label}
                </button>
              ))}
            </div>
          </div>

          {/* Date Range Filter */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Start Date
              </label>
              <input
                type="date"
                value={startDate}
                onChange={(e) => onStartDateChange(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
              />
            </div>
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                End Date
              </label>
              <input
                type="date"
                value={endDate}
                onChange={(e) => onEndDateChange(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
              />
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
