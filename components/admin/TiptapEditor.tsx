'use client'

import { useEditor, EditorContent } from '@tiptap/react'
import StarterKit from '@tiptap/starter-kit'
import Image from '@tiptap/extension-image'
import Link from '@tiptap/extension-link'
import { TextStyle } from '@tiptap/extension-text-style'
import { Color } from '@tiptap/extension-color'
import TextAlign from '@tiptap/extension-text-align'
import { useState, useEffect } from 'react'
import MediaLibrary from './MediaLibrary'
import { MediaFile } from '@/types'

interface TiptapEditorProps {
  value: string
  onChange: (value: string) => void
  placeholder?: string
  height?: string
}

export default function TiptapEditor({
  value,
  onChange,
  placeholder = 'Start writing your article...',
  height = '400px',
}: TiptapEditorProps) {
  const [showMediaLibrary, setShowMediaLibrary] = useState(false)

  const editor = useEditor({
    immediatelyRender: false,
    extensions: [
      StarterKit,
      Image,
      Link.configure({
        openOnClick: false,
        HTMLAttributes: {
          class: 'text-primary underline',
        },
      }),
      TextStyle,
      Color,
      TextAlign.configure({
        types: ['heading', 'paragraph'],
      }),
    ],
    content: value,
    onUpdate: ({ editor }) => {
      onChange(editor.getHTML())
    },
    editorProps: {
      attributes: {
        class: 'prose prose-sm sm:prose lg:prose-lg xl:prose-xl focus:outline-none min-h-[400px] max-w-none p-4',
      },
    },
  })

  // Update editor content when value changes externally
  useEffect(() => {
    if (editor && value !== editor.getHTML()) {
      editor.commands.setContent(value)
    }
  }, [value, editor])

  const addImage = (media: MediaFile | MediaFile[]) => {
    // Handle single file or array
    const file = Array.isArray(media) ? media[0] : media
    if (editor && file && file.file_type === 'image') {
      editor.chain().focus().setImage({ src: file.file_url }).run()
    }
    setShowMediaLibrary(false)
  }

  const setLink = () => {
    const url = window.prompt('Enter URL:')
    if (url && editor) {
      editor.chain().focus().setLink({ href: url }).run()
    }
  }

  if (!editor) {
    return (
      <div className="border border-gray-300 rounded-lg bg-gray-50 flex items-center justify-center" style={{ height }}>
        <div className="spinner h-6 w-6 border-4 border-primary border-t-transparent rounded-full"></div>
      </div>
    )
  }

  return (
    <>
      <div className="border border-gray-300 rounded-lg overflow-hidden">
        {/* Toolbar */}
        <div className="bg-gray-50 border-b border-gray-300 p-2 flex flex-wrap gap-1">
          {/* Text Formatting */}
          <button
            onClick={() => editor.chain().focus().toggleBold().run()}
            className={`px-3 py-1 rounded hover:bg-gray-200 ${editor.isActive('bold') ? 'bg-gray-300' : ''}`}
            type="button"
          >
            <strong>B</strong>
          </button>
          <button
            onClick={() => editor.chain().focus().toggleItalic().run()}
            className={`px-3 py-1 rounded hover:bg-gray-200 ${editor.isActive('italic') ? 'bg-gray-300' : ''}`}
            type="button"
          >
            <em>I</em>
          </button>
          <button
            onClick={() => editor.chain().focus().toggleStrike().run()}
            className={`px-3 py-1 rounded hover:bg-gray-200 ${editor.isActive('strike') ? 'bg-gray-300' : ''}`}
            type="button"
          >
            <s>S</s>
          </button>

          <div className="w-px bg-gray-300 mx-1"></div>

          {/* Headings */}
          <button
            onClick={() => editor.chain().focus().toggleHeading({ level: 1 }).run()}
            className={`px-3 py-1 rounded hover:bg-gray-200 text-sm ${editor.isActive('heading', { level: 1 }) ? 'bg-gray-300' : ''}`}
            type="button"
          >
            H1
          </button>
          <button
            onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()}
            className={`px-3 py-1 rounded hover:bg-gray-200 text-sm ${editor.isActive('heading', { level: 2 }) ? 'bg-gray-300' : ''}`}
            type="button"
          >
            H2
          </button>
          <button
            onClick={() => editor.chain().focus().toggleHeading({ level: 3 }).run()}
            className={`px-3 py-1 rounded hover:bg-gray-200 text-sm ${editor.isActive('heading', { level: 3 }) ? 'bg-gray-300' : ''}`}
            type="button"
          >
            H3
          </button>

          <div className="w-px bg-gray-300 mx-1"></div>

          {/* Lists */}
          <button
            onClick={() => editor.chain().focus().toggleBulletList().run()}
            className={`px-3 py-1 rounded hover:bg-gray-200 ${editor.isActive('bulletList') ? 'bg-gray-300' : ''}`}
            type="button"
          >
            • List
          </button>
          <button
            onClick={() => editor.chain().focus().toggleOrderedList().run()}
            className={`px-3 py-1 rounded hover:bg-gray-200 ${editor.isActive('orderedList') ? 'bg-gray-300' : ''}`}
            type="button"
          >
            1. List
          </button>

          <div className="w-px bg-gray-300 mx-1"></div>

          {/* Quote and Code */}
          <button
            onClick={() => editor.chain().focus().toggleBlockquote().run()}
            className={`px-3 py-1 rounded hover:bg-gray-200 ${editor.isActive('blockquote') ? 'bg-gray-300' : ''}`}
            type="button"
          >
            Quote
          </button>
          <button
            onClick={() => editor.chain().focus().toggleCodeBlock().run()}
            className={`px-3 py-1 rounded hover:bg-gray-200 ${editor.isActive('codeBlock') ? 'bg-gray-300' : ''}`}
            type="button"
          >
            Code
          </button>

          <div className="w-px bg-gray-300 mx-1"></div>

          {/* Link and Image */}
          <button
            onClick={setLink}
            className={`px-3 py-1 rounded hover:bg-gray-200 ${editor.isActive('link') ? 'bg-gray-300' : ''}`}
            type="button"
          >
            Link
          </button>
          <button
            onClick={() => setShowMediaLibrary(true)}
            className="px-3 py-1 rounded hover:bg-gray-200"
            type="button"
          >
            Image
          </button>

          <div className="w-px bg-gray-300 mx-1"></div>

          {/* Alignment */}
          <button
            onClick={() => editor.chain().focus().setTextAlign('left').run()}
            className={`px-3 py-1 rounded hover:bg-gray-200 ${editor.isActive({ textAlign: 'left' }) ? 'bg-gray-300' : ''}`}
            type="button"
          >
            ←
          </button>
          <button
            onClick={() => editor.chain().focus().setTextAlign('center').run()}
            className={`px-3 py-1 rounded hover:bg-gray-200 ${editor.isActive({ textAlign: 'center' }) ? 'bg-gray-300' : ''}`}
            type="button"
          >
            ↔
          </button>
          <button
            onClick={() => editor.chain().focus().setTextAlign('right').run()}
            className={`px-3 py-1 rounded hover:bg-gray-200 ${editor.isActive({ textAlign: 'right' }) ? 'bg-gray-300' : ''}`}
            type="button"
          >
            →
          </button>
        </div>

        {/* Editor Content */}
        <EditorContent
          editor={editor}
          className="bg-white"
          style={{ minHeight: height }}
        />
      </div>

      {/* Media Library Modal */}
      {showMediaLibrary && (
        <MediaLibrary
          onSelect={addImage}
          onClose={() => setShowMediaLibrary(false)}
          maxSelection={1}
          allowedTypes={['image']}
          mode="modal"
        />
      )}

      <style jsx global>{`
        .ProseMirror {
          min-height: ${height};
          padding: 1rem;
        }

        .ProseMirror:focus {
          outline: none;
        }

        .ProseMirror p {
          margin-bottom: 1em;
        }

        .ProseMirror h1 {
          font-size: 2em;
          font-weight: bold;
          margin-bottom: 0.5em;
          margin-top: 0.5em;
        }

        .ProseMirror h2 {
          font-size: 1.5em;
          font-weight: bold;
          margin-bottom: 0.5em;
          margin-top: 0.5em;
        }

        .ProseMirror h3 {
          font-size: 1.25em;
          font-weight: bold;
          margin-bottom: 0.5em;
          margin-top: 0.5em;
        }

        .ProseMirror ul,
        .ProseMirror ol {
          margin-bottom: 1em;
          padding-left: 1.5em;
        }

        .ProseMirror ul {
          list-style-type: disc;
        }

        .ProseMirror ol {
          list-style-type: decimal;
        }

        .ProseMirror li {
          display: list-item;
          margin-left: 0;
        }

        .ProseMirror blockquote {
          border-left: 4px solid #ccc;
          padding-left: 1em;
          margin: 1em 0;
          font-style: italic;
          color: #666;
        }

        .ProseMirror pre {
          background: #f4f4f4;
          padding: 1em;
          border-radius: 0.5em;
          overflow-x: auto;
          margin: 1em 0;
        }

        .ProseMirror code {
          background: #f4f4f4;
          padding: 0.2em 0.4em;
          border-radius: 0.25em;
          font-family: monospace;
        }

        .ProseMirror img {
          max-width: 100%;
          height: auto;
          display: block;
          margin: 1em 0;
          border-radius: 0.5em;
        }

        .ProseMirror a {
          color: #2563eb;
          text-decoration: underline;
        }
      `}</style>
    </>
  )
}
