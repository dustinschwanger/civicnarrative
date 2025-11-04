import { NextRequest, NextResponse } from 'next/server'
import { generateArticleContent } from '@/lib/perplexity'

export async function POST(request: NextRequest) {
  try {
    const { prompt, context, chatHistory } = await request.json()

    if (!prompt && !chatHistory) {
      return NextResponse.json(
        { error: 'Either prompt or chatHistory is required' },
        { status: 400 }
      )
    }

    let articlePrompt = prompt

    // If chat history is provided, create a prompt to extract article content
    if (chatHistory && Array.isArray(chatHistory)) {
      const conversationText = chatHistory
        .map((msg: any) => `${msg.role}: ${msg.content}`)
        .join('\n\n')

      articlePrompt = `Based on the following conversation, create a well-structured article. Extract the key information, facts, and insights discussed, and format them into a complete article with:

- A compelling title (add as an H1)
- Clear section headings (H2/H3)
- Well-organized paragraphs
- Proper flow and structure
- Factual accuracy

Conversation:
${conversationText}

${prompt ? `\nAdditional instructions: ${prompt}` : ''}

Write the article now in HTML format:`
    }

    const content = await generateArticleContent(articlePrompt, context)

    // Extract title if present in H1 tags
    const titleMatch = content.match(/<h1[^>]*>(.*?)<\/h1>/i)
    const title = titleMatch ? titleMatch[1].replace(/<[^>]*>/g, '') : ''

    // Generate excerpt from first paragraph
    const excerptMatch = content.match(/<p[^>]*>(.*?)<\/p>/i)
    let excerpt = excerptMatch ? excerptMatch[1].replace(/<[^>]*>/g, '') : ''
    if (excerpt.length > 300) {
      excerpt = excerpt.substring(0, 297) + '...'
    }

    return NextResponse.json({
      content,
      title,
      excerpt,
      ai_generated: true,
      ai_model: 'claude-3-5-sonnet-20241022',
    })
  } catch (error) {
    console.error('Error in POST /api/ai/generate-article:', error)
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to generate article' },
      { status: 500 }
    )
  }
}
