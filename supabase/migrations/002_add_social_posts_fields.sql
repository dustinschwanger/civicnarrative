-- Add new fields to social_posts table
ALTER TABLE social_posts
ADD COLUMN IF NOT EXISTS image_url TEXT,
ADD COLUMN IF NOT EXISTS link TEXT,
ADD COLUMN IF NOT EXISTS post_url TEXT,
ADD COLUMN IF NOT EXISTS media_urls JSONB DEFAULT '[]'::jsonb;

-- Create index for faster lookups by post_url
CREATE INDEX IF NOT EXISTS idx_social_posts_post_url ON social_posts(post_url) WHERE post_url IS NOT NULL;
