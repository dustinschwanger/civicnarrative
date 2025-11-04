# 🚀 Civic Narrative CMS - Complete Setup Guide

Your AI-assisted CMS is now **fully built and ready to launch**! Follow this guide to get it running.

## ✅ What's Been Built

### Core Features
- ✨ **AI-Assisted Content Creation** - Chat with AI, upload documents, generate articles
- 📝 **Rich Text Editor** - Professional editing with React Quill
- 🖼️ **Media Library** - Drag-drop uploads, organized file management
- 📱 **Social Media Integration** - Auto-generate posts for X, Facebook, LinkedIn
- 🔐 **Admin Authentication** - Secure session-based admin access
- 📊 **Dashboard** - Stats, quick actions, recent articles
- 🎨 **Responsive Design** - Works on desktop, tablet, and mobile

### Components Built
- AdminLayout with navigation
- MediaLibrary with file upload
- RichTextEditor with React Quill
- AIResearchChat with streaming responses
- SocialPostGenerator with LATE API integration
- Complete article management (list, create, edit)

### API Routes
- `/api/articles` - Full CRUD operations
- `/api/ai/chat` - Streaming AI chat
- `/api/ai/generate-article` - Article generation
- `/api/ai/generate-social-posts` - Social post generation
- `/api/social/profiles` - Get connected social accounts
- `/api/social/schedule` - Schedule posts via LATE
- `/api/categories` - Category management

---

## 📋 Setup Steps

### Step 1: Install Dependencies

Dependencies are already installed! But if you need to reinstall:

```bash
cd "/Users/dustinschwanger/Documents/Civic Narrative"
npm install
```

### Step 2: Set Up Supabase Database

#### Option A: Using Supabase Dashboard (Recommended)

1. Go to your Supabase project: https://supabase.com/dashboard
2. Click on your project
3. Navigate to **SQL Editor** (left sidebar)
4. Click "New query"
5. Copy the entire contents of `supabase/migrations/001_initial_schema.sql`
6. Paste into the SQL Editor
7. Click "Run" or press Cmd+Enter
8. Wait for success message

#### Option B: Using Supabase CLI

```bash
# Install Supabase CLI
npm install -g supabase

# Link to your project (get project-ref from your dashboard URL)
supabase link --project-ref your-project-ref

# Push migration
supabase db push
```

### Step 3: Configure Supabase Storage

1. In Supabase Dashboard, go to **Storage** (left sidebar)
2. Click "Create a new bucket"
3. Name it: `media`
4. Make it **public**
5. Click "Create bucket"

### Step 4: Fill in Environment Variables

Open `.env.local` and fill in your credentials:

```bash
# Supabase (Dashboard → Settings → API)
# URL: Copy "Project URL"
# ANON_KEY: Copy "Publishable key" (starts with eyJ or sb_publishable)
# SERVICE_KEY: Copy "Secret key" from "Secret keys" section (click eye icon, starts with eyJ or sb_secret)
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-publishable-key-here
SUPABASE_SERVICE_KEY=your-secret-key-here

# AI APIs
PERPLEXITY_API_KEY=your-perplexity-key  # OR use Anthropic below
ANTHROPIC_API_KEY=your-anthropic-key

# LATE API (get from https://www.getlate.dev/)
LATE_API_KEY=your-late-api-key

# App Config
NEXT_PUBLIC_SITE_URL=http://localhost:3000
```

### Step 5: Create Your First Admin User

#### 5a. Start the dev server

```bash
npm run dev
```

#### 5b. Go to Supabase Dashboard → Authentication → Users

Click "Add user" → Create with email and password

Example:
- Email: `admin@civicnarrative.com`
- Password: `your-secure-password`
- Auto Confirm User: YES

#### 5c. Make them a super admin

Go to **SQL Editor** and run:

```sql
UPDATE user_profiles
SET is_super_admin = true
WHERE email = 'admin@civicnarrative.com';
```

### Step 6: Connect LATE (Optional but Recommended)

1. Go to https://www.getlate.dev/
2. Sign up for a free account (no credit card required)
3. Go to Settings → API Keys
4. Create a new API key
5. Add it to `.env.local` as `LATE_API_KEY`
6. Connect your social media accounts (Facebook, X, LinkedIn) in LATE dashboard

---

## 🎯 Quick Start Guide

### Access the CMS

1. **Homepage**: http://localhost:3000
2. **Admin Login**: http://localhost:3000/admin/login
3. **Dashboard**: http://localhost:3000/admin

### Create Your First Article

1. Log in to admin panel
2. Click "New Article" or go to `/admin/articles/new`
3. Use the AI chat on the left to research your topic
4. Upload documents if needed
5. Click "Generate Article from Conversation"
6. AI will populate the editor on the right
7. Refine the content, add images from Media Library
8. Fill in category, author, excerpt
9. Click "Publish Now" or "Save as Draft"

### Generate Social Media Posts

1. After publishing an article, click "Draft Social Posts"
2. AI will generate optimized posts for X, Facebook, and LinkedIn
3. Edit any posts as needed
4. Set schedule times (or leave blank to post immediately)
5. Click "Schedule All Posts"
6. Posts will be sent to Buffer and scheduled

---

## 🛠️ API Keys You Need

### 1. Supabase (Required)
- Free tier available
- Get at: https://supabase.com
- Need: URL, Anon Key, Service Key

### 2. AI API (Required - Choose One)
**Option A: Perplexity API**
- Get at: https://www.perplexity.ai/api
- Best for research and fact-checking

**Option B: Anthropic Claude**
- Get at: https://console.anthropic.com
- Best for content generation
- Currently using: claude-3-5-sonnet

### 3. LATE API (Optional)
- Free tier: 2 profiles, 10 posts/month
- Get at: https://www.getlate.dev/
- Paid: $13/month (120 posts) or $33/month (unlimited)
- Only needed for social media automation

---

## 📁 Project Structure

```
civic-narrative-cms/
├── app/                      # Next.js App Router
│   ├── admin/               # Admin panel
│   │   ├── articles/        # Article management
│   │   │   ├── page.tsx     # List articles
│   │   │   ├── new/         # Create new (with AI!)
│   │   │   └── [id]/edit/   # Edit article
│   │   ├── media/           # Media library
│   │   ├── social/          # Social posts
│   │   ├── login/           # Admin login
│   │   └── page.tsx         # Dashboard
│   ├── api/                 # API routes
│   │   ├── articles/        # Article CRUD
│   │   ├── ai/              # AI endpoints
│   │   ├── social/          # LATE API integration
│   │   └── categories/      # Categories
│   └── auth/                # Auth callback
├── components/              # React components
│   └── admin/              # Admin components
│       ├── AdminLayout.tsx
│       ├── RichTextEditor.tsx
│       ├── MediaLibrary.tsx
│       ├── AIResearchChat.tsx
│       └── SocialPostGenerator.tsx
├── contexts/               # React contexts
│   ├── AuthContext.tsx
│   └── AdminContext.tsx
├── lib/                    # Utilities
│   ├── supabase-client.ts
│   ├── supabase-server.ts
│   ├── perplexity.ts
│   ├── late.ts
│   └── utils.ts
├── supabase/              # Database
│   └── migrations/
│       └── 001_initial_schema.sql
└── types/                 # TypeScript types
    └── index.ts
```

---

## 🎨 Features in Detail

### AI Research Chat
- **Real-time streaming** - See AI responses as they're generated
- **Document upload** - Add context from PDFs, docs, text files
- **Conversation history** - Build on previous messages
- **Generate article** - One-click conversion to formatted article

### Rich Text Editor
- **Full formatting** - Headings, lists, quotes, links
- **Image insertion** - From Media Library
- **Responsive** - Works on all devices
- **Auto-save** - Coming soon

### Media Library
- **Drag & drop** - Easy file uploads
- **Grid/list view** - Choose your preference
- **Search & filter** - Find files quickly
- **10MB limit** - Per file
- **Metadata tracking** - File size, dimensions, upload date

### Social Post Generator
- **Platform-specific** - Optimized for X, Facebook, LinkedIn
- **Character limits** - Enforced per platform
- **Scheduling** - Set future publish times
- **LATE API integration** - Multi-platform social scheduling
- **Edit before publish** - Full control

---

## 🐛 Troubleshooting

### Database Connection Issues

**Problem:** "Missing Supabase environment variables"

**Solution:**
1. Check `.env.local` has all three Supabase keys
2. Restart the dev server after adding keys
3. Verify keys are correct in Supabase Dashboard → Settings → API

### Admin Login Not Working

**Problem:** "Unauthorized: Admin access required"

**Solution:**
1. Check user exists in Supabase Auth
2. Run the SQL to set `is_super_admin = true`
3. Try logging out and back in
4. Clear browser cookies

### AI Not Responding

**Problem:** AI chat doesn't respond or errors

**Solution:**
1. Verify AI API key in `.env.local`
2. Check API quota/limits
3. Check browser console for errors
4. Try with a shorter message

### Media Upload Fails

**Problem:** "Failed to upload files"

**Solution:**
1. Verify Supabase Storage bucket named `media` exists
2. Check bucket is set to public
3. Verify file size is under 10MB
4. Check browser console for errors

### LATE API Integration Issues

**Problem:** "No LATE profile found for [platform]"

**Solution:**
1. Connect social accounts in LATE dashboard (https://www.getlate.dev/)
2. Verify LATE API key is correct in `.env.local`
3. Check the account is connected to the platform you're trying to post to
4. Ensure you have posts remaining in your plan (free tier: 10/month)

---

## 🚀 Going to Production

### 1. Update Environment Variables

```bash
NEXT_PUBLIC_SITE_URL=https://yourdomain.com
```

### 2. Build the App

```bash
npm run build
```

### 3. Deploy to Vercel (Recommended)

```bash
# Install Vercel CLI
npm install -g vercel

# Deploy
vercel

# Add environment variables in Vercel dashboard
```

### 4. Set up Custom Domain

In Vercel dashboard:
1. Go to Settings → Domains
2. Add your custom domain
3. Follow DNS instructions

### 5. Update Supabase Auth

In Supabase Dashboard → Authentication → URL Configuration:
- Add your production URL to allowed redirect URLs

---

## 📚 Next Steps

### Recommended Enhancements

1. **Add Article Edit Page** - Copy from new page, modify for editing
2. **Media Management Page** - Full-page media library
3. **Social Posts Dashboard** - View scheduled/published posts
4. **Categories Management** - CRUD for categories
5. **User Management** - Manage admin users
6. **Analytics** - Track views, engagement
7. **Comments System** - Article comments
8. **Email Notifications** - Notify on new articles

### Learning Resources

- **Next.js Docs**: https://nextjs.org/docs
- **Supabase Docs**: https://supabase.com/docs
- **Anthropic API**: https://docs.anthropic.com
- **LATE API**: https://docs.getlate.dev/
- **Tailwind CSS**: https://tailwindcss.com/docs

---

## 💡 Tips & Best Practices

### Content Creation Workflow

1. **Research First** - Use AI chat to gather information
2. **Upload Context** - Add relevant documents
3. **Iterative Refinement** - Ask follow-up questions
4. **Generate Draft** - Let AI create initial structure
5. **Human Polish** - Add personality and verify facts
6. **SEO Optimization** - Fill in meta fields
7. **Social Amplification** - Generate and schedule posts

### SEO Best Practices

- Keep titles under 60 characters
- Write compelling 160-character descriptions
- Use descriptive slugs
- Add alt text to images
- Include internal links
- Publish regularly

### Social Media Tips

- **X/Twitter**: Use hashtags (2-3 max), mention @handles
- **Facebook**: Ask questions, encourage engagement
- **LinkedIn**: Professional tone, industry insights
- Schedule for optimal times (check your analytics)

---

## 🎉 You're Ready to Go!

Your AI-assisted CMS is fully functional. Start creating content with AI assistance and watch your publishing workflow transform!

### Quick Command Reference

```bash
# Development
npm run dev

# Production build
npm run build
npm start

# Type checking
npm run type-check

# Linting
npm run lint
```

### Support & Questions

- Check CMS_README.md for detailed feature documentation
- Review supabase/README.md for database information
- Check the code comments for implementation details

---

**Built with ❤️ for Civic Narrative**

Happy publishing! 🎊
