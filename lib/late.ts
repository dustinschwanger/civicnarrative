/**
 * LATE API Client
 * https://www.getlate.dev/
 *
 * A unified social media API for scheduling posts to:
 * - Facebook
 * - X (Twitter)
 * - LinkedIn
 * - And 7+ other platforms
 */

const LATE_API_BASE = 'https://getlate.dev/api/v1'

export interface LateAccount {
  _id: string
  platform: 'facebook' | 'twitter' | 'linkedin' | 'instagram' | 'tiktok' | 'youtube' | 'threads' | 'reddit' | 'pinterest' | 'bluesky'
  username: string
  displayName: string
  profileId: string
  isActive: boolean
  avatar?: string
}

export interface LatePostResponse {
  success: boolean
  post_id?: string
  scheduled_at?: string
  status?: 'draft' | 'scheduled' | 'published' | 'failed'
  message?: string
  error?: string
}

export interface LatePost {
  id: string
  text: string
  platforms: string[]
  media_urls?: string[]
  scheduled_at?: string
  published_at?: string
  status: 'draft' | 'scheduled' | 'published' | 'failed'
  created_at: string
}

export class LateClient {
  private apiKey: string

  constructor(apiKey: string) {
    this.apiKey = apiKey
  }

  private async request(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<any> {
    const url = `${LATE_API_BASE}${endpoint}`
    const response = await fetch(url, {
      ...options,
      headers: {
        Authorization: `Bearer ${this.apiKey}`,
        'Content-Type': 'application/json',
        ...options.headers,
      },
    })

    const data = await response.json()

    if (!response.ok) {
      throw new Error(
        `LATE API error: ${response.status} - ${data.error || data.message || 'Unknown error'}`
      )
    }

    return data
  }

  /**
   * Get all connected social media accounts
   */
  async getAccounts(): Promise<LateAccount[]> {
    const response = await this.request('/accounts')
    console.log('LATE API Accounts Response:', JSON.stringify(response, null, 2))
    // Handle if API returns { accounts: [...] } or just [...]
    const accounts = Array.isArray(response) ? response : (response.accounts || response.data || [])
    console.log('Parsed Accounts:', JSON.stringify(accounts, null, 2))
    return accounts
  }

  /**
   * Create and schedule a post to one or more platforms
   */
  async createPost(params: {
    text: string
    platforms: string[]
    accountIds?: string[]
    mediaUrls?: string[]
    scheduledAt?: Date
    link?: string
  }): Promise<LatePostResponse> {
    // Get account IDs for the specified platforms if not provided
    let platformsArray = params.platforms
    let accountIds = params.accountIds || []

    // If no account IDs provided, get all accounts and match by platform
    if (accountIds.length === 0) {
      try {
        const accounts = await this.getAccounts()

        // For each requested platform, find a matching account
        platformsArray.forEach((platform) => {
          const account = accounts.find((acc) => {
            // Defensive check for undefined platform
            if (!acc || !acc.platform || !acc._id) {
              console.warn('Invalid account object:', acc)
              return false
            }
            return acc.platform.toLowerCase() === platform.toLowerCase()
          })
          if (account && account._id) {
            accountIds.push(account._id)
            console.log(`Matched platform ${platform} to account ID: ${account._id}`)
          } else {
            console.warn(`No matching account found for platform: ${platform}`)
          }
        })
      } catch (error) {
        console.warn('Could not fetch accounts, proceeding without account IDs:', error)
      }
    }

    // Build platforms array with account IDs
    const platformsData = platformsArray.map((platform, index) => {
      const data: any = {
        platform: platform.toLowerCase(),
      }

      // Add account ID if available
      if (accountIds[index]) {
        data.accountId = accountIds[index]
      }

      return data
    })

    const body: any = {
      content: params.text,
      platforms: platformsData,
    }

    if (params.mediaUrls && params.mediaUrls.length > 0) {
      body.mediaItems = params.mediaUrls.map((url) => ({
        type: 'image',
        url: url,
      }))
    }

    if (params.link) {
      body.link = params.link
    }

    if (params.scheduledAt) {
      body.scheduledFor = params.scheduledAt.toISOString()
      body.timezone = 'America/New_York' // Default timezone
    } else {
      body.publishNow = true
    }

    try {
      console.log('LATE API Request Body:', JSON.stringify(body, null, 2))

      const response = await this.request('/posts', {
        method: 'POST',
        body: JSON.stringify(body),
      })

      console.log('LATE API Response:', JSON.stringify(response, null, 2))

      return {
        success: true,
        post_id: response.id || response.post_id,
        scheduled_at: response.scheduledFor || response.scheduled_at,
        status: response.status || (params.scheduledAt ? 'scheduled' : 'published'),
      }
    } catch (error) {
      console.error('LATE API Error:', error)
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to create post',
      }
    }
  }

  /**
   * Get a specific post by ID
   */
  async getPost(postId: string): Promise<LatePost> {
    return this.request(`/posts/${postId}`)
  }

  /**
   * Get all posts (with optional filters)
   */
  async getPosts(params?: {
    status?: 'draft' | 'scheduled' | 'published' | 'failed'
    platform?: string
    limit?: number
  }): Promise<LatePost[]> {
    const searchParams = new URLSearchParams()
    if (params?.status) searchParams.append('status', params.status)
    if (params?.platform) searchParams.append('platform', params.platform)
    if (params?.limit) searchParams.append('limit', params.limit.toString())

    const query = searchParams.toString()
    return this.request(`/posts${query ? `?${query}` : ''}`)
  }

  /**
   * Update a scheduled post
   */
  async updatePost(
    postId: string,
    updates: {
      text?: string
      scheduled_at?: Date
      media_urls?: string[]
    }
  ): Promise<LatePostResponse> {
    const body: any = {}
    if (updates.text) body.text = updates.text
    if (updates.scheduled_at) body.scheduled_at = updates.scheduled_at.toISOString()
    if (updates.media_urls) body.media_urls = updates.media_urls

    try {
      const response = await this.request(`/posts/${postId}`, {
        method: 'PATCH',
        body: JSON.stringify(body),
      })

      return {
        success: true,
        post_id: response.id,
      }
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to update post',
      }
    }
  }

  /**
   * Delete a post (if not yet published)
   */
  async deletePost(postId: string): Promise<{ success: boolean; message?: string }> {
    try {
      await this.request(`/posts/${postId}`, {
        method: 'DELETE',
      })

      return {
        success: true,
        message: 'Post deleted successfully',
      }
    } catch (error) {
      return {
        success: false,
        message: error instanceof Error ? error.message : 'Failed to delete post',
      }
    }
  }

  /**
   * Get platform-specific character limits
   */
  static getCharacterLimit(platform: string): number {
    const limits: { [key: string]: number } = {
      twitter: 280,
      facebook: 63206,
      linkedin: 3000,
      instagram: 2200,
      tiktok: 2200,
      youtube: 5000,
      threads: 500,
      reddit: 40000,
      pinterest: 500,
      bluesky: 300,
    }
    return limits[platform.toLowerCase()] || 1000
  }

  /**
   * Map platform names between our DB and LATE API
   */
  static mapPlatform(platform: string): string {
    const mapping: { [key: string]: string } = {
      twitter: 'twitter',
      x: 'twitter',
      facebook: 'facebook',
      fb: 'facebook',
      linkedin: 'linkedin',
      instagram: 'instagram',
      ig: 'instagram',
    }
    return mapping[platform.toLowerCase()] || platform.toLowerCase()
  }
}

/**
 * Get LATE API client instance
 */
export function getLateClient(): LateClient {
  const apiKey = process.env.LATE_API_KEY

  if (!apiKey) {
    throw new Error('LATE_API_KEY environment variable is not set')
  }

  return new LateClient(apiKey)
}

/**
 * Default LATE API client instance
 */
export const lateClient = getLateClient()
