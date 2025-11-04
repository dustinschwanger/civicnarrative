// OpenAI API client for AI features
import OpenAI from 'openai'

const OPENAI_API_KEY = process.env.OPENAI_API_KEY

if (!OPENAI_API_KEY) {
  console.warn('Warning: OPENAI_API_KEY not found. AI features will not work.')
}

const openai = new OpenAI({
  apiKey: OPENAI_API_KEY,
})

interface Message {
  role: 'system' | 'user' | 'assistant'
  content: string
}

export async function generateArticleContent(prompt: string, context?: string) {
  const systemPrompt = `You are a professional content writer for a civic news organization. Your task is to create information-focused, straightforward articles based on the information provided.

Guidelines:
- Write in a clear, objective journalistic style
- Focus on facts and information
- Use proper grammar and AP style
- Structure content with clear headings and paragraphs
- Include relevant details and context
- Avoid sensationalism or bias
- Make the content engaging but professional

Format your response as HTML with proper heading tags (h2, h3), paragraph tags (p), and lists (ul, ol) where appropriate.`

  const userMessage = context
    ? `Context/Source Material:\n${context}\n\nTask: ${prompt}`
    : prompt

  const messages: Message[] = [
    { role: 'system', content: systemPrompt },
    { role: 'user', content: userMessage },
  ]

  const completion = await openai.chat.completions.create({
    model: 'gpt-4o-mini', // Fast and cost-effective
    messages,
    temperature: 0.7,
    max_tokens: 4000,
  })

  return completion.choices[0].message.content || ''
}

export async function generateSocialPosts(articleTitle: string, articleExcerpt: string) {
  const systemPrompt = `You are a social media expert. Generate engaging, platform-specific posts for Twitter/X, Facebook, LinkedIn, and Instagram based on the provided article.

Requirements:
- Twitter/X: Max 280 characters, use 1-2 relevant hashtags, engaging and concise
- Facebook: 1-2 paragraphs, conversational tone, encourage engagement
- LinkedIn: Professional tone, 2-3 paragraphs, focus on insights and value
- Instagram: Visual-focused caption, use 3-5 relevant hashtags, engaging and inspiring, max 2200 characters

Return your response as a JSON array with this exact structure:
[
  {
    "platform": "twitter",
    "content": "Your twitter post here with #hashtags"
  },
  {
    "platform": "facebook",
    "content": "Your facebook post here..."
  },
  {
    "platform": "linkedin",
    "content": "Your linkedin post here..."
  },
  {
    "platform": "instagram",
    "content": "Your instagram post here with #hashtags"
  }
]

Important: Return ONLY the JSON array, no other text.`

  const userMessage = `Article Title: ${articleTitle}\n\nArticle Excerpt: ${articleExcerpt}\n\nGenerate social media posts for all four platforms.`

  const completion = await openai.chat.completions.create({
    model: 'gpt-4o-mini',
    messages: [
      { role: 'system', content: systemPrompt },
      { role: 'user', content: userMessage },
    ],
    temperature: 0.7,
    max_tokens: 1000,
  })

  const response = completion.choices[0].message.content || ''

  // Parse JSON from response
  try {
    // Try to extract JSON from the response
    const jsonMatch = response.match(/\[[\s\S]*\]/)
    if (jsonMatch) {
      return JSON.parse(jsonMatch[0])
    }

    // If no JSON found, return default structure
    console.warn('Could not parse JSON from OpenAI response, using fallback')
    return [
      {
        platform: 'twitter',
        content: `${articleTitle}\n\n${articleExcerpt.substring(0, 200)}...`,
      },
      {
        platform: 'facebook',
        content: `📢 ${articleTitle}\n\n${articleExcerpt}`,
      },
      {
        platform: 'linkedin',
        content: `${articleTitle}\n\n${articleExcerpt}\n\n#CivicEngagement #LocalNews`,
      },
      {
        platform: 'instagram',
        content: `${articleTitle}\n\n${articleExcerpt}\n\n#Community #LocalNews #CivicEngagement`,
      },
    ]
  } catch (error) {
    console.error('Error parsing social posts JSON:', error)
    throw new Error('Failed to parse social posts from AI response')
  }
}

// For streaming chat responses
export async function* streamChatResponse(messages: Message[], model = 'gpt-4o-mini') {
  if (!OPENAI_API_KEY) {
    throw new Error('OPENAI_API_KEY environment variable is not set')
  }

  const stream = await openai.chat.completions.create({
    model,
    messages,
    temperature: 0.7,
    max_tokens: 4000,
    stream: true,
  })

  for await (const chunk of stream) {
    const content = chunk.choices[0]?.delta?.content
    if (content) {
      yield content
    }
  }
}
