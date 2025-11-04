import { NextRequest, NextResponse } from 'next/server'
import { streamChatResponse } from '@/lib/perplexity'
import { createServerClient } from '@/lib/supabase-server'

export async function POST(request: NextRequest) {
  try {
    const { messages, sessionId, documentContext } = await request.json()

    if (!messages || !Array.isArray(messages)) {
      return NextResponse.json(
        { error: 'Messages array is required' },
        { status: 400 }
      )
    }

    const systemPrompt = `You are a professional research assistant for a civic news organization. Your role is to:

1. Help journalists research and gather information for articles
2. Analyze documents and extract key information
3. Provide factual, well-sourced information
4. Draft article content in a clear, objective journalistic style
5. Focus on civic issues, local government, community news, and public interest topics

Guidelines:
- Be thorough and fact-based
- Use clear, accessible language
- Cite sources when possible
- Maintain journalistic objectivity
- Structure information logically
- When drafting articles, use proper formatting with headings and paragraphs

${documentContext ? `\n\n=== DOCUMENT CONTEXT ===
The user has uploaded a document. You MUST use the information from this document to answer their questions. Do NOT make up or hallucinate information. Only use facts directly from the document below.

Document Content:
${documentContext}

=== END DOCUMENT CONTEXT ===\n\n` : ''}`

    // Prepend system message to the messages array
    const allMessages = [
      { role: 'system' as const, content: systemPrompt },
      ...messages,
    ]

    // Create a ReadableStream for Server-Sent Events
    const encoder = new TextEncoder()
    const readable = new ReadableStream({
      async start(controller) {
        try {
          for await (const text of streamChatResponse(allMessages)) {
            controller.enqueue(
              encoder.encode(`data: ${JSON.stringify({ text })}\n\n`)
            )
          }

          // Send done message
          controller.enqueue(encoder.encode('data: [DONE]\n\n'))
          controller.close()

          // Save chat session to database if sessionId provided
          if (sessionId) {
            const supabase = createServerClient()
            await supabase
              .from('ai_chat_sessions')
              .upsert({
                id: sessionId,
                messages: messages,
                updated_at: new Date().toISOString(),
              })
          }
        } catch (error) {
          console.error('Error in AI chat stream:', error)

          // Send error message to client
          const errorMessage = error instanceof Error && error.message.includes('rate_limit')
            ? 'Request too large. Please try with a smaller document or simpler question.'
            : 'An error occurred while processing your request. Please try again.'

          controller.enqueue(
            encoder.encode(`data: ${JSON.stringify({ error: errorMessage })}\n\n`)
          )
          controller.enqueue(encoder.encode('data: [DONE]\n\n'))
          controller.close()
        }
      },
    })

    return new Response(readable, {
      headers: {
        'Content-Type': 'text/event-stream',
        'Cache-Control': 'no-cache',
        Connection: 'keep-alive',
      },
    })
  } catch (error) {
    console.error('Error in POST /api/ai/chat:', error)
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Internal server error' },
      { status: 500 }
    )
  }
}
