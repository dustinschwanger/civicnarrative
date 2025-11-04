// Database types
export interface Article {
  id: string
  title: string
  slug: string
  content: string
  excerpt: string
  author_name: string | null
  category_id: string | null
  status: 'draft' | 'review' | 'published'
  featured: boolean
  hide_main_image: boolean
  image_url: string | null
  seo_title: string | null
  seo_description: string | null
  ai_generated: boolean
  ai_prompt: string | null
  ai_model: string | null
  generation_date: string | null
  published_at: string | null
  created_at: string
  updated_at: string
  created_by: string | null
  updated_by: string | null
  category?: Category
}

export interface Category {
  id: string
  name: string
  slug: string
  description: string | null
  created_at: string
}

export interface ArticleImage {
  id: string
  article_id: string
  image_url: string
  caption: string | null
  alt_text: string | null
  is_featured: boolean
  display_order: number
  created_at: string
  updated_at: string
}

export interface MediaFile {
  id: string
  filename: string
  file_url: string
  file_type: 'image' | 'video' | 'document'
  file_size: number
  width: number | null
  height: number | null
  uploaded_by: string | null
  created_at: string
}

export interface SocialPost {
  id: string
  article_id: string | null
  platform: 'twitter' | 'facebook' | 'linkedin' | 'instagram'
  content: string
  scheduled_for: string | null
  published_at: string | null
  buffer_post_id: string | null
  status: 'draft' | 'scheduled' | 'published' | 'failed'
  created_at: string
}

export interface AIChatMessage {
  role: 'user' | 'assistant' | 'system'
  content: string
  timestamp?: string
}

export interface AIChatSession {
  id: string
  article_id: string | null
  messages: AIChatMessage[]
  created_at: string
  updated_at: string
}

export interface UserProfile {
  id: string
  auth_id: string
  email: string
  is_super_admin: boolean
  created_at: string
  updated_at: string
}

export interface AdminSession {
  id: string
  auth_id: string
  token: string
  expires_at: string
  created_at: string
}

// Form types
export interface ArticleFormData {
  title: string
  slug: string
  content: string
  excerpt: string
  author_name: string
  category_id: string
  status: 'draft' | 'review' | 'published'
  featured: boolean
  hide_main_image: boolean
  image_url: string
  seo_title: string
  seo_description: string
}

// API response types
export interface ApiResponse<T> {
  data?: T
  error?: string
  message?: string
}

export interface ArticlesResponse {
  articles: Article[]
  count: number
  total?: number
}

// Buffer API types
export interface BufferProfile {
  id: string
  service: string
  service_username: string
  formatted_service: string
}

export interface BufferPostResponse {
  success: boolean
  buffer_post_id?: string
  message?: string
}
