'use client'

import { useState, useRef, useEffect } from 'react'
import ReactMarkdown from 'react-markdown'
import { AIChatMessage } from '@/types'
import { useDropzone } from 'react-dropzone'
import { supabase } from '@/lib/supabase-client'

interface AIResearchChatProps {
  onContentGenerated?: (content: {
    content: string
    title: string
    excerpt: string
  }) => void
  sessionId?: string
}

export default function AIResearchChat({
  onContentGenerated,
  sessionId,
}: AIResearchChatProps) {
  const [messages, setMessages] = useState<AIChatMessage[]>([])
  const [input, setInput] = useState('')
  const [loading, setLoading] = useState(false)
  const [generating, setGenerating] = useState(false)
  const [documentContext, setDocumentContext] = useState<string>('')
  const messagesEndRef = useRef<HTMLDivElement>(null)

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }

  useEffect(() => {
    scrollToBottom()
  }, [messages])

  const onDrop = async (acceptedFiles: File[]) => {
    const file = acceptedFiles[0]
    if (!file) return

    try {
      let text = ''

      // Handle different file types
      if (file.type === 'application/pdf') {
        // Parse PDF via API
        const formData = new FormData()
        formData.append('file', file)

        const response = await fetch('/api/parse-pdf', {
          method: 'POST',
          body: formData,
        })

        if (!response.ok) {
          const error = await response.json()
          throw new Error(error.error || 'Failed to parse PDF')
        }

        const data = await response.json()
        text = data.text
      } else {
        // Read as plain text for other file types
        text = await file.text()
      }

      // Limit document context to ~100k characters (roughly 25k tokens)
      // This prevents hitting OpenAI's token limits
      const MAX_CHARS = 100000
      let documentText = text
      let wasTruncated = false

      if (text.length > MAX_CHARS) {
        documentText = text.substring(0, MAX_CHARS)
        wasTruncated = true
      }

      setDocumentContext(documentText)

      // Add system message about document upload
      const sizeKB = (file.size / 1024).toFixed(2)
      const extractedChars = text.length
      const truncationNote = wasTruncated
        ? ` (truncated to first 100,000 characters due to size limits)`
        : ''

      setMessages((prev) => [
        ...prev,
        {
          role: 'system',
          content: `Document uploaded: ${file.name} (${sizeKB}KB, ${extractedChars.toLocaleString()} characters extracted)${truncationNote}`,
        },
      ])
    } catch (error) {
      console.error('Error reading file:', error)
      alert(error instanceof Error ? error.message : 'Failed to read file. Please try again.')
    }
  }

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    maxFiles: 1,
    accept: {
      'text/*': ['.txt', '.md'],
      'application/pdf': ['.pdf'],
    },
  })

  const handleSendMessage = async () => {
    if (!input.trim() || loading) return

    const userMessage: AIChatMessage = {
      role: 'user',
      content: input,
      timestamp: new Date().toISOString(),
    }

    setMessages((prev) => [...prev, userMessage])
    setInput('')
    setLoading(true)

    // Add placeholder for assistant response
    const assistantMessageIndex = messages.length + 1
    setMessages((prev) => [
      ...prev,
      {
        role: 'assistant',
        content: '',
        timestamp: new Date().toISOString(),
      },
    ])

    try {
      const response = await fetch('/api/ai/chat', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          messages: [...messages, userMessage].map((msg) => ({
            role: msg.role === 'system' ? 'user' : msg.role,
            content: msg.content,
          })),
          sessionId,
          documentContext: documentContext || undefined,
        }),
      })

      if (!response.ok) {
        throw new Error('Failed to get response from AI')
      }

      const reader = response.body?.getReader()
      const decoder = new TextDecoder()

      if (!reader) {
        throw new Error('No reader available')
      }

      let assistantContent = ''

      while (true) {
        const { done, value } = await reader.read()
        if (done) break

        const chunk = decoder.decode(value)
        const lines = chunk.split('\n')

        for (const line of lines) {
          if (line.startsWith('data: ')) {
            const data = line.slice(6)
            if (data === '[DONE]') {
              break
            }

            try {
              const parsed = JSON.parse(data)
              if (parsed.text) {
                assistantContent += parsed.text
                setMessages((prev) => {
                  const newMessages = [...prev]
                  newMessages[assistantMessageIndex] = {
                    role: 'assistant',
                    content: assistantContent,
                    timestamp: new Date().toISOString(),
                  }
                  return newMessages
                })
              } else if (parsed.error) {
                // Handle error messages from the stream
                setMessages((prev) => {
                  const newMessages = [...prev]
                  newMessages[assistantMessageIndex] = {
                    role: 'assistant',
                    content: parsed.error,
                    timestamp: new Date().toISOString(),
                  }
                  return newMessages
                })
                break
              }
            } catch (e) {
              // Ignore parsing errors
            }
          }
        }
      }
    } catch (error) {
      console.error('Error sending message:', error)
      let errorMessage = 'Sorry, there was an error processing your request. Please try again.'

      // Provide more specific error messages
      if (error instanceof Error) {
        if (error.message.includes('rate limit') || error.message.includes('too large')) {
          errorMessage = 'The request was too large for the AI model. Try uploading a smaller document or asking a simpler question.'
        } else if (error.message.includes('Failed to get response')) {
          errorMessage = 'Failed to get response from AI. Please check your internet connection and try again.'
        }
      }

      setMessages((prev) => {
        const newMessages = [...prev]
        newMessages[assistantMessageIndex] = {
          role: 'assistant',
          content: errorMessage,
          timestamp: new Date().toISOString(),
        }
        return newMessages
      })
    } finally {
      setLoading(false)
    }
  }

  const handleGenerateArticle = async () => {
    if (messages.length === 0) {
      alert('Please have a conversation first before generating an article.')
      return
    }

    setGenerating(true)

    try {
      const response = await fetch('/api/ai/generate-article', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          chatHistory: messages.filter((msg) => msg.role !== 'system'),
          context: documentContext || undefined,
        }),
      })

      if (!response.ok) {
        throw new Error('Failed to generate article')
      }

      const data = await response.json()

      if (onContentGenerated) {
        onContentGenerated({
          content: data.content,
          title: data.title,
          excerpt: data.excerpt,
        })
      }
    } catch (error) {
      console.error('Error generating article:', error)
      alert('Failed to generate article. Please try again.')
    } finally {
      setGenerating(false)
    }
  }

  const handleClearChat = () => {
    if (confirm('Are you sure you want to clear the chat history?')) {
      setMessages([])
      setDocumentContext('')
    }
  }

  return (
    <div className="flex flex-col h-full bg-white rounded-lg border border-gray-200 overflow-hidden">
      {/* Header */}
      <div className="p-4 border-b border-gray-200 bg-gradient-to-r from-primary to-primary-dark">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-lg font-semibold text-white">AI Research Assistant</h3>
            <p className="text-sm text-white/80">Ask questions, research topics, and draft articles</p>
          </div>
          <div className="flex gap-2">
            <button
              onClick={handleClearChat}
              className="px-3 py-1 text-sm bg-white/20 hover:bg-white/30 text-white rounded transition-colors"
              disabled={messages.length === 0}
            >
              Clear Chat
            </button>
          </div>
        </div>
      </div>

      {/* Document Upload Area */}
      {!documentContext && (
        <div className="p-4 border-b border-gray-200 bg-gray-50">
          <div
            {...getRootProps()}
            className={`border-2 border-dashed rounded-lg p-4 text-center cursor-pointer transition-colors ${
              isDragActive ? 'border-primary bg-primary/5' : 'border-gray-300 hover:border-primary'
            }`}
          >
            <input {...getInputProps()} />
            <p className="text-sm text-gray-600">
              {isDragActive ? 'Drop document here' : 'Drop a document or click to upload (optional)'}
            </p>
          </div>
        </div>
      )}

      {documentContext && (
        <div className="p-4 border-b border-gray-200 bg-green-50">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <svg className="w-5 h-5 text-green-600" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M4 4a2 2 0 012-2h4.586A2 2 0 0112 2.586L15.414 6A2 2 0 0116 7.414V16a2 2 0 01-2 2H6a2 2 0 01-2-2V4z" clipRule="evenodd" />
              </svg>
              <span className="text-sm font-medium text-green-900">Document loaded</span>
            </div>
            <button
              onClick={() => setDocumentContext('')}
              className="text-sm text-red-600 hover:text-red-800"
            >
              Remove
            </button>
          </div>
        </div>
      )}

      {/* Messages Area */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages.length === 0 ? (
          <div className="text-center text-gray-500 py-12">
            <svg className="w-16 h-16 mx-auto mb-4 text-gray-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z" />
            </svg>
            <p className="font-medium">Start a conversation</p>
            <p className="text-sm mt-1">Ask questions or request research on any topic</p>
          </div>
        ) : (
          messages.map((message, index) => (
            <div
              key={index}
              className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}
            >
              <div
                className={`max-w-[80%] rounded-lg p-3 ${
                  message.role === 'user'
                    ? 'bg-primary text-white'
                    : message.role === 'system'
                    ? 'bg-gray-100 text-gray-600 text-sm italic'
                    : 'bg-gray-100 text-gray-900'
                }`}
              >
                {message.role === 'assistant' ? (
                  <div className="prose prose-sm max-w-none">
                    <ReactMarkdown>{message.content}</ReactMarkdown>
                  </div>
                ) : (
                  <p className="whitespace-pre-wrap">{message.content}</p>
                )}
              </div>
            </div>
          ))
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Input Area */}
      <div className="p-4 border-t border-gray-200 bg-gray-50">
        <div className="flex gap-2 mb-2">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyPress={(e) => e.key === 'Enter' && !e.shiftKey && handleSendMessage()}
            placeholder="Type your message..."
            disabled={loading}
            className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent outline-none disabled:bg-gray-100 disabled:cursor-not-allowed"
          />
          <button
            onClick={handleSendMessage}
            disabled={loading || !input.trim()}
            className="px-6 py-2 bg-primary text-white rounded-lg hover:bg-primary-dark transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
          >
            {loading ? (
              <>
                <div className="spinner h-4 w-4 border-2 border-white border-t-transparent rounded-full"></div>
                Thinking...
              </>
            ) : (
              <>
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                  <path d="M10.894 2.553a1 1 0 00-1.788 0l-7 14a1 1 0 001.169 1.409l5-1.429A1 1 0 009 15.571V11a1 1 0 112 0v4.571a1 1 0 00.725.962l5 1.428a1 1 0 001.17-1.408l-7-14z" />
                </svg>
                Send
              </>
            )}
          </button>
        </div>

        {onContentGenerated && messages.length > 0 && (
          <button
            onClick={handleGenerateArticle}
            disabled={generating || loading}
            className="w-full px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
          >
            {generating ? (
              <>
                <div className="spinner h-4 w-4 border-2 border-white border-t-transparent rounded-full"></div>
                Generating Article...
              </>
            ) : (
              <>
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M4 4a2 2 0 012-2h4.586A2 2 0 0112 2.586L15.414 6A2 2 0 0116 7.414V16a2 2 0 01-2 2H6a2 2 0 01-2-2V4zm2 6a1 1 0 011-1h6a1 1 0 110 2H7a1 1 0 01-1-1zm1 3a1 1 0 100 2h6a1 1 0 100-2H7z" clipRule="evenodd" />
                </svg>
                Generate Article from Conversation
              </>
            )}
          </button>
        )}
      </div>
    </div>
  )
}
