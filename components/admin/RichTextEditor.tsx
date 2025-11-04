'use client'

import { useRef, useState } from 'react'
import dynamic from 'next/dynamic'
import 'react-quill/dist/quill.snow.css'
import MediaLibrary from './MediaLibrary'
import { MediaFile } from '@/types'

// Import ReactQuill with no SSR
const ReactQuill = dynamic(() => import('react-quill'), {
  ssr: false,
})

interface RichTextEditorProps {
  value: string
  onChange: (value: string) => void
  placeholder?: string
  height?: string
}

export default function RichTextEditor({
  value,
  onChange,
  placeholder = 'Start writing your article...',
  height = '400px',
}: RichTextEditorProps) {
  const quillRef = useRef<any>(null)
  const [showMediaLibrary, setShowMediaLibrary] = useState(false)

  const imageHandler = () => {
    setShowMediaLibrary(true)
  }

  const insertMedia = (media: MediaFile | MediaFile[]) => {
    const quill = quillRef.current?.getEditor()
    if (quill) {
      // Handle single file or array
      const file = Array.isArray(media) ? media[0] : media
      if (!file) return

      const range = quill.getSelection(true)
      if (file.file_type === 'image') {
        quill.insertEmbed(range.index, 'image', file.file_url)
      } else {
        quill.insertText(range.index, file.filename)
        quill.setSelection(range.index, file.filename.length)
        quill.format('link', file.file_url)
      }
    }
    setShowMediaLibrary(false)
  }

  const modules = {
    toolbar: {
      container: [
        [{ header: [1, 2, 3, false] }],
        [{ font: [] }],
        [{ size: ['small', false, 'large', 'huge'] }],
        ['bold', 'italic', 'underline', 'strike'],
        [{ color: [] }, { background: [] }],
        [{ script: 'sub' }, { script: 'super' }],
        [{ list: 'ordered' }, { list: 'bullet' }],
        [{ indent: '-1' }, { indent: '+1' }],
        [{ align: [] }],
        ['blockquote', 'code-block'],
        ['link', 'image', 'video'],
        ['clean'],
      ],
      handlers: {
        image: imageHandler,
      },
    },
    clipboard: {
      matchVisual: false,
    },
  }

  const formats = [
    'header',
    'font',
    'size',
    'bold',
    'italic',
    'underline',
    'strike',
    'color',
    'background',
    'script',
    'list',
    'bullet',
    'indent',
    'align',
    'blockquote',
    'code-block',
    'link',
    'image',
    'video',
  ]

  return (
    <>
      <div className="rich-text-editor" style={{ minHeight: height }}>
        <ReactQuill
          // @ts-ignore - ReactQuill ref typing issue with dynamic import
          ref={quillRef}
          theme="snow"
          value={value || ''}
          onChange={onChange}
          modules={modules}
          formats={formats}
          placeholder={placeholder}
          style={{ height }}
        />
      </div>

      {showMediaLibrary && (
        <MediaLibrary
          onSelect={insertMedia}
          onClose={() => setShowMediaLibrary(false)}
          maxSelection={1}
          allowedTypes={['image']}
          mode="modal"
        />
      )}

      <style jsx global>{`
        .rich-text-editor {
          position: relative;
        }

        .rich-text-editor .ql-container {
          font-family: inherit;
          font-size: 1rem;
          min-height: ${height};
          border-bottom-left-radius: 0.5rem;
          border-bottom-right-radius: 0.5rem;
        }

        .rich-text-editor .ql-editor {
          min-height: calc(${height} - 42px);
          max-height: 600px;
          overflow-y: auto;
        }

        .rich-text-editor .ql-toolbar {
          border-top-left-radius: 0.5rem;
          border-top-right-radius: 0.5rem;
          background-color: #f9fafb;
        }

        .rich-text-editor .ql-editor p {
          margin-bottom: 1em;
        }

        .rich-text-editor .ql-editor h1 {
          font-size: 2em;
          font-weight: bold;
          margin-bottom: 0.5em;
        }

        .rich-text-editor .ql-editor h2 {
          font-size: 1.5em;
          font-weight: bold;
          margin-bottom: 0.5em;
        }

        .rich-text-editor .ql-editor h3 {
          font-size: 1.25em;
          font-weight: bold;
          margin-bottom: 0.5em;
        }

        .rich-text-editor .ql-editor ul,
        .rich-text-editor .ql-editor ol {
          margin-bottom: 1em;
          padding-left: 1.5em;
        }

        .rich-text-editor .ql-editor blockquote {
          border-left: 4px solid #ccc;
          padding-left: 1em;
          margin: 1em 0;
          font-style: italic;
        }

        .rich-text-editor .ql-editor img {
          max-width: 100%;
          height: auto;
          display: block;
          margin: 1em 0;
        }

        .rich-text-editor .ql-editor a {
          color: #2563eb;
          text-decoration: underline;
        }

        .rich-text-editor .ql-snow .ql-picker {
          font-size: 14px;
        }
      `}</style>
    </>
  )
}
