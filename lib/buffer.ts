const BUFFER_API_BASE = 'https://api.bufferapp.com/1'

export interface BufferProfile {
  id: string
  service: string
  service_username: string
  formatted_service: string
}

export interface BufferUpdateResponse {
  success: boolean
  updates?: Array<{
    id: string
    text: string
    profile_ids: string[]
    scheduled_at: number
  }>
  message?: string
}

export class BufferClient {
  private accessToken: string

  constructor(accessToken: string) {
    this.accessToken = accessToken
  }

  private async request(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<any> {
    const url = `${BUFFER_API_BASE}${endpoint}`
    const response = await fetch(url, {
      ...options,
      headers: {
        Authorization: `Bearer ${this.accessToken}`,
        'Content-Type': 'application/json',
        ...options.headers,
      },
    })

    if (!response.ok) {
      const error = await response.text()
      throw new Error(`Buffer API error: ${response.status} - ${error}`)
    }

    return response.json()
  }

  async getProfiles(): Promise<BufferProfile[]> {
    return this.request('/profiles.json')
  }

  async createPost(params: {
    profileIds: string[]
    text: string
    scheduledAt?: Date
    media?: {
      link?: string
      description?: string
      picture?: string
    }
  }): Promise<BufferUpdateResponse> {
    const body: any = {
      profile_ids: params.profileIds,
      text: params.text,
    }

    if (params.scheduledAt) {
      body.scheduled_at = Math.floor(params.scheduledAt.getTime() / 1000)
    } else {
      body.now = true
    }

    if (params.media) {
      if (params.media.link) body.media = { link: params.media.link }
      if (params.media.description)
        body.media = { ...body.media, description: params.media.description }
      if (params.media.picture)
        body.media = { ...body.media, picture: params.media.picture }
    }

    return this.request('/updates/create.json', {
      method: 'POST',
      body: JSON.stringify(body),
    })
  }

  async getUpdate(updateId: string) {
    return this.request(`/updates/${updateId}.json`)
  }

  async deleteUpdate(updateId: string) {
    return this.request(`/updates/${updateId}/destroy.json`, {
      method: 'POST',
    })
  }

  async getPendingPosts(profileId: string) {
    return this.request(`/profiles/${profileId}/updates/pending.json`)
  }

  async getSentPosts(profileId: string) {
    return this.request(`/profiles/${profileId}/updates/sent.json`)
  }
}

export function getBufferClient(): BufferClient {
  const accessToken = process.env.BUFFER_ACCESS_TOKEN

  if (!accessToken) {
    throw new Error('BUFFER_ACCESS_TOKEN environment variable is not set')
  }

  return new BufferClient(accessToken)
}
