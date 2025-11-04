'use client'

import { useState, useEffect } from 'react'
import { useDropzone } from 'react-dropzone'
import { supabase } from '@/lib/supabase-client'
import { MediaFile } from '@/types'
import { formatFileSize, formatRelativeTime } from '@/lib/utils'
import Image from 'next/image'
import {
  Squares2X2Icon,
  ListBulletIcon,
  XMarkIcon,
  CloudArrowUpIcon,
  VideoCameraIcon,
  DocumentTextIcon,
  PhotoIcon,
  TrashIcon,
  CheckCircleIcon,
  MagnifyingGlassIcon,
} from '@heroicons/react/24/outline'

interface MediaLibraryProps {
  onSelect?: (media: MediaFile | MediaFile[]) => void
  onClose?: () => void
  maxSelection?: number
  allowedTypes?: ('image' | 'video' | 'document')[]
  mode?: 'modal' | 'page'
}

export default function MediaLibrary({
  onSelect,
  onClose,
  maxSelection = 1,
  allowedTypes = ['image', 'video', 'document'],
  mode = 'modal',
}: MediaLibraryProps) {
  const [files, setFiles] = useState<MediaFile[]>([])
  const [loading, setLoading] = useState(true)
  const [uploading, setUploading] = useState(false)
  const [selected, setSelected] = useState<Set<string>>(new Set())
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid')
  const [searchTerm, setSearchTerm] = useState('')
  const [filterType, setFilterType] = useState<string>('all')

  useEffect(() => {
    loadFiles()
  }, [filterType])

  const loadFiles = async () => {
    try {
      setLoading(true)
      let query = supabase
        .from('media_library')
        .select('*')
        .order('created_at', { ascending: false })

      if (filterType !== 'all') {
        query = query.eq('file_type', filterType)
      }

      const { data, error } = await query

      if (error) throw error
      setFiles(data || [])
    } catch (error) {
      console.error('Error loading files:', error)
    } finally {
      setLoading(false)
    }
  }

  const onDrop = async (acceptedFiles: File[]) => {
    setUploading(true)
    try {
      for (const file of acceptedFiles) {
        // Generate unique filename
        const timestamp = Date.now()
        const random = Math.random().toString(36).substring(7)
        const ext = file.name.split('.').pop()
        const filename = `${timestamp}-${random}.${ext}`

        // Upload to Supabase Storage
        const { data: uploadData, error: uploadError } = await supabase.storage
          .from('media')
          .upload(filename, file, {
            cacheControl: '3600',
            upsert: false,
          })

        if (uploadError) throw uploadError

        // Get public URL
        const {
          data: { publicUrl },
        } = supabase.storage.from('media').getPublicUrl(filename)

        // Get image dimensions if it's an image
        let width = null
        let height = null
        if (file.type.startsWith('image/')) {
          const dimensions = await getImageDimensions(file)
          width = dimensions.width
          height = dimensions.height
        }

        // Save metadata to database
        const { error: dbError } = await supabase.from('media_library').insert({
          filename: file.name,
          file_url: publicUrl,
          file_type: getFileType(file.type),
          file_size: file.size,
          width,
          height,
        })

        if (dbError) throw dbError
      }

      // Reload files
      await loadFiles()
    } catch (error) {
      console.error('Error uploading files:', error)
      alert('Failed to upload one or more files')
    } finally {
      setUploading(false)
    }
  }

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    maxSize: 10 * 1024 * 1024, // 10MB
    accept: {
      'image/*': ['.png', '.jpg', '.jpeg', '.gif', '.webp'],
      'video/*': ['.mp4', '.mov', '.avi'],
      'application/pdf': ['.pdf'],
      'application/msword': ['.doc'],
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document': ['.docx'],
    },
  })

  const getImageDimensions = (file: File): Promise<{ width: number; height: number }> => {
    return new Promise((resolve) => {
      const img = document.createElement('img')
      img.onload = () => {
        resolve({ width: img.width, height: img.height })
        URL.revokeObjectURL(img.src)
      }
      img.src = URL.createObjectURL(file)
    })
  }

  const getFileType = (mimeType: string): 'image' | 'video' | 'document' => {
    if (mimeType.startsWith('image/')) return 'image'
    if (mimeType.startsWith('video/')) return 'video'
    return 'document'
  }

  const toggleSelection = (fileId: string) => {
    const newSelected = new Set(selected)
    if (newSelected.has(fileId)) {
      newSelected.delete(fileId)
    } else {
      if (maxSelection === 1) {
        newSelected.clear()
      } else if (newSelected.size >= maxSelection) {
        return // Max selection reached
      }
      newSelected.add(fileId)
    }
    setSelected(newSelected)
  }

  const handleInsert = () => {
    const selectedFiles = files.filter((f) => selected.has(f.id))
    if (onSelect) {
      onSelect(maxSelection === 1 ? selectedFiles[0] : selectedFiles)
    }
    if (onClose) {
      onClose()
    }
  }

  const handleDelete = async (fileId: string) => {
    if (!confirm('Are you sure you want to delete this file?')) return

    try {
      const file = files.find((f) => f.id === fileId)
      if (!file) return

      // Extract filename from URL
      const urlParts = file.file_url.split('/')
      const filename = urlParts[urlParts.length - 1]

      // Delete from storage
      const { error: storageError } = await supabase.storage
        .from('media')
        .remove([filename])

      if (storageError) throw storageError

      // Delete from database
      const { error: dbError } = await supabase
        .from('media_library')
        .delete()
        .eq('id', fileId)

      if (dbError) throw dbError

      // Reload files
      await loadFiles()
    } catch (error) {
      console.error('Error deleting file:', error)
      alert('Failed to delete file')
    }
  }

  const filteredFiles = files.filter((file) =>
    file.filename.toLowerCase().includes(searchTerm.toLowerCase())
  )

  const Container = mode === 'modal' ? 'div' : 'div'

  return (
    <Container className={mode === 'modal' ? 'fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4' : ''}>
      <div className={mode === 'modal' ? 'bg-white rounded-lg shadow-xl w-full max-w-6xl max-h-[90vh] flex flex-col' : 'bg-white rounded-lg shadow'}>
        {/* Header */}
        <div className="flex justify-between items-center p-6 border-b border-gray-200 bg-gray-50">
          <div>
            <h2 className="text-2xl font-semibold text-gray-900">Media Library</h2>
            <p className="text-sm text-gray-600 mt-1">Manage your images, videos, and documents</p>
          </div>
          <div className="flex gap-2">
            <button
              onClick={() => setViewMode('grid')}
              className={`p-2.5 rounded-lg transition-all ${
                viewMode === 'grid'
                  ? 'bg-blue-600 text-white shadow-sm'
                  : 'bg-white text-gray-600 hover:bg-gray-100 border border-gray-200'
              }`}
              title="Grid view"
            >
              <Squares2X2Icon className="w-5 h-5" />
            </button>
            <button
              onClick={() => setViewMode('list')}
              className={`p-2.5 rounded-lg transition-all ${
                viewMode === 'list'
                  ? 'bg-blue-600 text-white shadow-sm'
                  : 'bg-white text-gray-600 hover:bg-gray-100 border border-gray-200'
              }`}
              title="List view"
            >
              <ListBulletIcon className="w-5 h-5" />
            </button>
            {mode === 'modal' && onClose && (
              <button
                onClick={onClose}
                className="p-2.5 rounded-lg bg-white text-gray-600 hover:bg-gray-100 border border-gray-200 transition-all"
                title="Close"
              >
                <XMarkIcon className="w-5 h-5" />
              </button>
            )}
          </div>
        </div>

        {/* Filters */}
        <div className="flex gap-4 p-6 border-b border-gray-200 bg-white">
          <div className="flex-1 relative">
            <MagnifyingGlassIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
            <input
              type="search"
              placeholder="Search files..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all"
            />
          </div>
          <select
            value={filterType}
            onChange={(e) => setFilterType(e.target.value)}
            className="px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none bg-white transition-all"
          >
            <option value="all">All Types</option>
            <option value="image">Images</option>
            <option value="video">Videos</option>
            <option value="document">Documents</option>
          </select>
        </div>

        {/* Upload Area */}
        <div className="p-6 border-b border-gray-200 bg-white">
          <div
            {...getRootProps()}
            className={`border-2 border-dashed rounded-xl p-10 text-center cursor-pointer transition-all ${
              isDragActive
                ? 'border-blue-500 bg-blue-50'
                : uploading
                ? 'border-green-400 bg-green-50'
                : 'border-gray-300 hover:border-blue-400 hover:bg-gray-50'
            }`}
          >
            <input {...getInputProps()} />
            <div className="flex flex-col items-center gap-3">
              <div className={`p-4 rounded-full ${uploading ? 'bg-green-100' : 'bg-blue-50'}`}>
                <CloudArrowUpIcon className={`w-10 h-10 ${uploading ? 'text-green-600' : 'text-blue-600'}`} />
              </div>
              <div>
                <p className="text-lg font-semibold text-gray-900">
                  {uploading ? 'Uploading...' : isDragActive ? 'Drop files here' : 'Upload files'}
                </p>
                <p className="text-sm text-gray-600 mt-1">
                  {uploading ? 'Please wait...' : 'Drag and drop or click to browse • Max 10MB per file'}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* File Grid/List */}
        <div className="flex-1 overflow-y-auto p-6">
          {loading ? (
            <div className="flex items-center justify-center h-64">
              <div className="spinner h-8 w-8 border-4 border-primary border-t-transparent rounded-full"></div>
            </div>
          ) : filteredFiles.length === 0 ? (
            <div className="text-center text-gray-500 py-12">
              No files found. Upload some files to get started.
            </div>
          ) : viewMode === 'grid' ? (
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6 gap-4">
              {filteredFiles.map((file) => (
                <FileCard
                  key={file.id}
                  file={file}
                  selected={selected.has(file.id)}
                  onSelect={() => toggleSelection(file.id)}
                  onDelete={() => handleDelete(file.id)}
                />
              ))}
            </div>
          ) : (
            <div className="space-y-2">
              {filteredFiles.map((file) => (
                <FileRow
                  key={file.id}
                  file={file}
                  selected={selected.has(file.id)}
                  onSelect={() => toggleSelection(file.id)}
                  onDelete={() => handleDelete(file.id)}
                />
              ))}
            </div>
          )}
        </div>

        {/* Footer */}
        {mode === 'modal' && (
          <div className="flex justify-between items-center p-6 border-t border-gray-200">
            <div className="text-sm text-gray-600">
              {selected.size} selected {maxSelection > 1 && `(max ${maxSelection})`}
            </div>
            <div className="flex gap-2">
              {onClose && (
                <button
                  onClick={onClose}
                  className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  Cancel
                </button>
              )}
              <button
                onClick={handleInsert}
                disabled={selected.size === 0}
                className="px-6 py-2 bg-primary text-white rounded-lg hover:bg-primary-dark transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Insert Selected
              </button>
            </div>
          </div>
        )}
      </div>
    </Container>
  )
}

function FileCard({
  file,
  selected,
  onSelect,
  onDelete,
}: {
  file: MediaFile
  selected: boolean
  onSelect: () => void
  onDelete: () => void
}) {
  return (
    <div
      className={`relative group border-2 rounded-lg overflow-hidden cursor-pointer transition-all ${
        selected ? 'border-primary ring-2 ring-primary' : 'border-gray-200 hover:border-primary'
      }`}
      onClick={onSelect}
    >
      <div className="aspect-square bg-gray-100 flex items-center justify-center">
        {file.file_type === 'image' ? (
          <Image
            src={file.file_url}
            alt={file.filename}
            width={200}
            height={200}
            className="w-full h-full object-cover"
          />
        ) : file.file_type === 'video' ? (
          <svg className="w-12 h-12 text-gray-400" fill="currentColor" viewBox="0 0 20 20">
            <path d="M2 6a2 2 0 012-2h6a2 2 0 012 2v8a2 2 0 01-2 2H4a2 2 0 01-2-2V6zM14.553 7.106A1 1 0 0014 8v4a1 1 0 00.553.894l2 1A1 1 0 0018 13V7a1 1 0 00-1.447-.894l-2 1z" />
          </svg>
        ) : (
          <svg className="w-12 h-12 text-gray-400" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M4 4a2 2 0 012-2h4.586A2 2 0 0112 2.586L15.414 6A2 2 0 0116 7.414V16a2 2 0 01-2 2H6a2 2 0 01-2-2V4z" clipRule="evenodd" />
          </svg>
        )}
      </div>
      <div className="p-2">
        <p className="text-xs font-medium text-gray-900 truncate">{file.filename}</p>
        <p className="text-xs text-gray-500">{formatFileSize(file.file_size)}</p>
      </div>
      <button
        onClick={(e) => {
          e.stopPropagation()
          onDelete()
        }}
        className="absolute top-2 right-2 p-1 bg-red-500 text-white rounded opacity-0 group-hover:opacity-100 transition-opacity"
      >
        <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
          <path fillRule="evenodd" d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9zM7 8a1 1 0 012 0v6a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v6a1 1 0 102 0V8a1 1 0 00-1-1z" clipRule="evenodd" />
        </svg>
      </button>
      {selected && (
        <div className="absolute top-2 left-2 bg-primary text-white rounded-full p-1">
          <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
          </svg>
        </div>
      )}
    </div>
  )
}

function FileRow({
  file,
  selected,
  onSelect,
  onDelete,
}: {
  file: MediaFile
  selected: boolean
  onSelect: () => void
  onDelete: () => void
}) {
  const FileIcon = file.file_type === 'video' ? VideoCameraIcon : DocumentTextIcon

  return (
    <div
      className={`flex items-center gap-4 p-4 border-2 rounded-lg cursor-pointer transition-all ${
        selected ? 'border-blue-500 bg-blue-50' : 'border-gray-200 hover:border-gray-300 hover:shadow-sm'
      }`}
      onClick={onSelect}
    >
      <div className="w-16 h-16 bg-gray-100 rounded-lg flex items-center justify-center flex-shrink-0 overflow-hidden">
        {file.file_type === 'image' ? (
          <Image
            src={file.file_url}
            alt={file.filename}
            width={64}
            height={64}
            className="w-full h-full object-cover"
          />
        ) : (
          <FileIcon className="h-8 w-8 text-gray-400" />
        )}
      </div>
      <div className="flex-1 min-w-0">
        <p className="font-semibold text-gray-900 truncate">{file.filename}</p>
        <p className="text-sm text-gray-500 mt-0.5">
          {formatFileSize(file.file_size)} • {formatRelativeTime(file.created_at)}
        </p>
      </div>
      {selected && (
        <CheckCircleIcon className="h-6 w-6 text-blue-600 flex-shrink-0" />
      )}
      <button
        onClick={(e) => {
          e.stopPropagation()
          onDelete()
        }}
        className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors flex-shrink-0"
      >
        <TrashIcon className="w-5 h-5" />
      </button>
    </div>
  )
}
