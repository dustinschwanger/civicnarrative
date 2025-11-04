import { NextRequest, NextResponse } from 'next/server'
import OpenAI from 'openai'

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
})

export async function POST(request: NextRequest) {
  try {
    const { content, title, currentPosts } = await request.json()

    if (!content && !title) {
      return NextResponse.json(
        { error: 'Content or title is required' },
        { status: 400 }
      )
    }

    // Build context about what's already been generated
    const existingContext = currentPosts
      ? `\n\nNOTE: These posts have already been generated, create DIFFERENT angles:\n${currentPosts.map((p: any) => `- ${p.platform}: ${p.content.substring(0, 100)}`).join('\n')}`
      : ''

    const prompt = `You are a social media expert who creates engaging, diverse content for multiple platforms.

Article Title: ${title || 'Not provided'}
Article Content: ${content}
${existingContext}

Generate 8 unique social media post variations with DIFFERENT approaches and angles. Each should feel distinct and target different audiences or aspects of the content.

**Angle Types to Use (mix these up):**
1. Question Hook - Start with a compelling question
2. Statistic/Data - Lead with an interesting number or data point
3. Story/Narrative - Use storytelling approach
4. Problem/Solution - Identify pain point, offer solution
5. Hot Take - Bold or controversial statement
6. How-To - Actionable tips format
7. List/Thread - Numbered points
8. Quote/Insight - Highlight key wisdom
9. Behind-the-Scenes - Inside look
10. Call-to-Action - Direct engagement request

**Platform Optimization:**
- Twitter/X: Max 280 characters, punchy, 1-2 hashtags
- Facebook: 1-2 paragraphs, conversational, engagement-focused
- LinkedIn: Professional tone, 2-3 paragraphs, business insights
- Instagram: Visual-focused, 3-5 hashtags, max 2200 chars

**Requirements:**
- Each post must use a DIFFERENT angle
- Vary the opening hooks significantly
- Mix up the platforms recommended
- Include relevant hashtags
- Make each one shareable and engaging

Return a JSON array with exactly 8 variations:
[
  {
    "angle": "Question Hook",
    "platform": "twitter",
    "text": "The actual post text with hashtags",
    "rationale": "Why this angle works for this content"
  },
  ...
]`

    const completion = await openai.chat.completions.create({
      model: 'gpt-4o-mini',
      messages: [
        {
          role: 'system',
          content: 'You are a social media expert who creates diverse, engaging content. Always return valid JSON.',
        },
        {
          role: 'user',
          content: prompt,
        },
      ],
      temperature: 0.8, // Higher for more creativity
      max_tokens: 2500,
    })

    const responseText = completion.choices[0]?.message?.content || ''

    // Try to parse JSON from the response
    let variations = []
    try {
      // Extract JSON if wrapped in markdown code blocks
      const jsonMatch = responseText.match(/```(?:json)?\s*([\s\S]*?)\s*```/) || responseText.match(/\[[\s\S]*\]/)
      const jsonText = jsonMatch ? (jsonMatch[1] || jsonMatch[0]) : responseText
      variations = JSON.parse(jsonText)
    } catch (parseError) {
      console.error('Failed to parse AI response as JSON:', parseError)
      console.error('Response was:', responseText)

      // Fallback: generate basic variations
      variations = generateFallbackVariations(title || '', content)
    }

    // Ensure each variation has required fields
    variations = variations.map((v: any, index: number) => ({
      angle: v.angle || `Variation ${index + 1}`,
      platform: v.platform || 'twitter',
      text: v.text || v.content || '',
      rationale: v.rationale || 'Engaging approach for this content',
    }))

    return NextResponse.json({
      variations: variations.slice(0, 10), // Max 10 variations
    })
  } catch (error: any) {
    console.error('Error generating post variations:', error)
    return NextResponse.json(
      { error: error.message || 'Failed to generate variations' },
      { status: 500 }
    )
  }
}

// Fallback function if AI parsing fails
function generateFallbackVariations(title: string, content: string) {
  const excerpt = content.substring(0, 200)

  return [
    {
      angle: 'Question Hook',
      platform: 'twitter',
      text: `${title}\n\nWhat are your thoughts? 🤔`,
      rationale: 'Engages audience with direct question',
    },
    {
      angle: 'Direct Statement',
      platform: 'facebook',
      text: `${title}\n\n${excerpt}...\n\n#civictech #localgov`,
      rationale: 'Clear and informative for Facebook audience',
    },
    {
      angle: 'Professional Insight',
      platform: 'linkedin',
      text: `${title}\n\nKey insights:\n• ${excerpt.substring(0, 100)}\n\n#PublicSector #Government`,
      rationale: 'Professional tone for LinkedIn network',
    },
    {
      angle: 'Visual Focus',
      platform: 'instagram',
      text: `${title} ✨\n\n${excerpt.substring(0, 100)}...\n\n#civictech #community #innovation`,
      rationale: 'Visual and engaging for Instagram',
    },
    {
      angle: 'Call to Action',
      platform: 'twitter',
      text: `${title}\n\nRead more about this important topic →`,
      rationale: 'Direct CTA for engagement',
    },
  ]
}
