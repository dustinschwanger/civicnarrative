# Civic Narrative CMS - AI-Assisted Content Management System

An intelligent, AI-powered CMS built with Next.js, Supabase, and integrated with Perplexity API for content generation and LATE API for social media management.

## Features

- ✨ **AI-Assisted Content Creation** - Research and draft articles with Perplexity AI
- 📝 **Rich Text Editor** - Professional article editing with React Quill
- 🖼️ **Media Library** - Organized file management with Supabase Storage
- 📱 **Social Media Integration** - Auto-generate and schedule posts via LATE API
- 🔐 **Secure Authentication** - Email OTP and admin session management
- 🎨 **Modern UI** - Responsive design with Tailwind CSS
- 📊 **Analytics Dashboard** - Track content and social media performance

## Tech Stack

- **Framework**: Next.js 14 with App Router & TypeScript
- **Database**: Supabase (PostgreSQL)
- **Styling**: Tailwind CSS
- **AI**: Anthropic Claude / Perplexity API
- **Content Editor**: React Quill
- **Social Media**: LATE API
- **File Storage**: Supabase Storage
- **Authentication**: Supabase Auth

## Getting Started

### Prerequisites

- Node.js 18+ and npm
- Supabase account and project
- Perplexity API or Anthropic API key
- LATE API account (for social media features - free tier available)

### 1. Clone and Install

```bash
cd "/Users/dustinschwanger/Documents/Civic Narrative"
npm install
```

### 2. Set Up Environment Variables

Copy `.env.example` to `.env.local` and fill in your credentials:

```bash
# Supabase
NEXT_PUBLIC_SUPABASE_URL=your-project-url.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
SUPABASE_SERVICE_KEY=your-service-key

# AI APIs
PERPLEXITY_API_KEY=your-perplexity-key
ANTHROPIC_API_KEY=your-anthropic-key

# LATE API
LATE_API_KEY=your-late-api-key

# App Config
NEXT_PUBLIC_SITE_URL=http://localhost:3000
```

### 3. Set Up Supabase Database

#### Option A: Via Supabase Dashboard (Recommended)

1. Go to your Supabase project dashboard
2. Navigate to SQL Editor
3. Copy contents of `supabase/migrations/001_initial_schema.sql`
4. Paste and run in the SQL Editor

#### Option B: Via Supabase CLI

```bash
# Install Supabase CLI
npm install -g supabase

# Link to your project
supabase link --project-ref your-project-ref

# Push migrations
supabase db push
```

### 4. Configure Supabase Storage

1. In Supabase Dashboard, go to Storage
2. Create a new bucket named `media`
3. Set the bucket to **public** for read access
4. Configure upload policies:
   - Allow authenticated users to upload
   - Allow public read access

### 5. Create Your First Admin User

Since this is a fresh database:

1. Run the development server (next step)
2. Go to Supabase Dashboard → Authentication → Users
3. Create a new user with email and password
4. Go to SQL Editor and run:
   ```sql
   UPDATE user_profiles
   SET is_super_admin = true
   WHERE email = 'your-admin-email@example.com';
   ```

### 6. Run the Development Server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) to see the application.

### 7. Access the Admin Panel

1. Navigate to [http://localhost:3000/admin/login](http://localhost:3000/admin/login)
2. Log in with your admin credentials
3. Start creating content!

## Project Structure

```
civic-narrative-cms/
├── app/                      # Next.js app directory
│   ├── admin/               # Admin panel pages
│   │   ├── articles/        # Article management
│   │   ├── media/           # Media library
│   │   ├── social/          # Social posts
│   │   └── login/           # Admin login
│   ├── api/                 # API routes
│   │   ├── articles/        # Article CRUD
│   │   ├── ai/              # AI integration
│   │   ├── media/           # Media management
│   │   └── social/          # LATE API
│   ├── auth/                # Auth callbacks
│   ├── layout.tsx           # Root layout
│   ├── page.tsx             # Homepage
│   └── globals.css          # Global styles
├── components/              # React components
│   ├── admin/              # Admin-specific components
│   │   ├── AdminLayout.tsx
│   │   ├── RichTextEditor.tsx
│   │   ├── MediaLibrary.tsx
│   │   ├── AIResearchChat.tsx
│   │   └── SocialPostGenerator.tsx
│   └── ui/                 # Reusable UI components
├── contexts/               # React contexts
│   ├── AuthContext.tsx     # User authentication
│   └── AdminContext.tsx    # Admin authentication
├── lib/                    # Utility libraries
│   ├── supabase-client.ts  # Supabase client-side
│   ├── supabase-server.ts  # Supabase server-side
│   ├── perplexity.ts       # AI integration
│   ├── late.ts             # LATE API client
│   └── utils.ts            # Helper functions
├── types/                  # TypeScript types
│   └── index.ts
├── supabase/              # Database migrations
│   ├── migrations/
│   └── README.md
└── public/                # Static assets
```

## Key Features & Usage

### AI-Assisted Article Creation

1. Navigate to **New Article** in the admin panel
2. Use the AI Research Chat to:
   - Upload documents for context
   - Ask questions and gather information
   - Generate article drafts
3. Click "Generate Article" to populate the editor
4. Edit and refine the content
5. Add images from the Media Library
6. Publish or save as draft

### Social Media Post Generation

1. Publish an article
2. Click "Draft Social Posts" button
3. AI analyzes the article and generates platform-specific posts:
   - Twitter/X (280 chars with hashtags)
   - Facebook (engaging, conversational)
   - LinkedIn (professional, detailed)
4. Review and edit posts
5. Schedule via LATE API

### Media Library

- Drag-and-drop file upload
- Supports images, videos, and documents
- 10MB file size limit
- Organized with metadata
- Search and filter capabilities

## Development

### Available Scripts

```bash
npm run dev          # Start development server
npm run build        # Build for production
npm run start        # Start production server
npm run lint         # Run ESLint
npm run type-check   # TypeScript type checking
```

### Adding Categories

Categories can be managed through the Supabase dashboard or by creating a categories management page. Default categories are created by the migration:

- Local News
- Government
- Events
- Public Safety
- Education
- Business

## Database Schema

The database includes the following main tables:

- `articles` - Article content and metadata
- `article_images` - Multiple images per article
- `categories` - Article categorization
- `media_library` - File storage metadata
- `social_posts` - Social media post tracking
- `ai_chat_sessions` - AI conversation history
- `user_profiles` - User information
- `admin_sessions` - Admin authentication

See `supabase/README.md` for detailed schema information.

## Security

- Row Level Security (RLS) enabled on all tables
- Admin routes protected with session-based authentication
- Service role required for admin operations
- 8-hour admin session expiration
- Secure file upload policies

## API Integrations

### Perplexity/Anthropic AI

Used for:
- Article content generation
- Social media post creation
- Document analysis and summarization

### LATE API

Used for:
- Scheduling social media posts to 10+ platforms
- Managing multiple platform accounts
- Tracking post status
- Webhook notifications
- Unified API for Facebook, X, LinkedIn, and more

## Troubleshooting

### Database Connection Issues

- Verify Supabase credentials in `.env.local`
- Ensure your IP is whitelisted in Supabase (if using database connection)
- Check that migrations were applied successfully

### AI API Errors

- Verify API keys are correct
- Check API rate limits and quotas
- Ensure API keys have necessary permissions

### LATE API Issues

- Verify LATE API key is valid in `.env.local`
- Ensure social media accounts are connected in LATE dashboard
- Check you have posts remaining in your plan (free tier: 10/month)
- Visit https://www.getlate.dev/ to manage your account

## Deployment

### Vercel (Recommended)

1. Push your code to GitHub
2. Import project in Vercel
3. Add environment variables
4. Deploy

```bash
npm run build  # Test build locally first
```

### Other Platforms

The app can be deployed to any platform that supports Next.js 14:
- Railway
- Render
- AWS Amplify
- DigitalOcean App Platform

## Contributing

This is a custom CMS built for Civic Narrative. For modifications or enhancements, update the codebase directly.

## License

Private - All rights reserved

## Support

For issues or questions about the CMS, refer to:
- Supabase Documentation: https://supabase.com/docs
- Next.js Documentation: https://nextjs.org/docs
- Anthropic API Documentation: https://docs.anthropic.com
- LATE API Documentation: https://docs.getlate.dev/

---

Built with ❤️ for Civic Narrative
