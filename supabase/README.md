# Supabase Setup

## Database Migrations

This directory contains SQL migration files for setting up the Civic Narrative CMS database.

### Applying Migrations

You have two options to apply these migrations:

#### Option 1: Supabase Dashboard (Recommended for initial setup)

1. Go to your Supabase project dashboard
2. Navigate to the SQL Editor
3. Copy the contents of `migrations/001_initial_schema.sql`
4. Paste into the SQL Editor and run

#### Option 2: Supabase CLI

If you have the Supabase CLI installed:

```bash
# Install Supabase CLI (if not already installed)
npm install -g supabase

# Link to your project
supabase link --project-ref your-project-ref

# Push migrations
supabase db push
```

### Migration Files

- `001_initial_schema.sql` - Initial database schema including:
  - Categories table
  - Articles table with AI tracking fields
  - Article images table
  - Media library table
  - Social posts table
  - AI chat sessions table
  - User profiles table
  - Admin sessions table
  - All necessary indexes, RLS policies, and triggers

### Post-Migration Setup

After running the migrations:

1. **Create your first admin user**:
   - Sign up through Supabase Auth in your application
   - Manually set `is_super_admin = true` in the `user_profiles` table for this user

2. **Configure Supabase Storage** (for media uploads):
   - Create a bucket named `media` in Supabase Storage
   - Set the bucket to public for read access
   - Configure appropriate upload policies

3. **Environment Variables**:
   - Make sure all Supabase environment variables are set in `.env.local`
   - You'll need: `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY`, and `SUPABASE_SERVICE_KEY`

### Database Schema Overview

The schema supports:
- **Content Management**: Articles with rich metadata, categories, and media
- **AI Integration**: Tracking AI-generated content, chat sessions, and prompts
- **Social Media**: Managing posts across multiple platforms with Buffer integration
- **Authentication**: User profiles with admin role support
- **Media Library**: Organized file storage with metadata

### Security

- Row Level Security (RLS) is enabled on all tables
- Public users can only read published content
- Authenticated users can upload media
- All admin operations require service role access
- User profiles are automatically created on signup via trigger
