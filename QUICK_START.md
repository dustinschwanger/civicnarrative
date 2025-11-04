# ⚡ Quick Start - Get Running in 10 Minutes

## 1. Install Dependencies (Already Done!)
```bash
cd "/Users/dustinschwanger/Documents/Civic Narrative"
npm install  # Already completed ✅
```

## 2. Set Up Supabase Database

### Run Migration
1. Go to [Supabase Dashboard](https://supabase.com/dashboard)
2. Navigate to **SQL Editor**
3. Copy ALL contents from `supabase/migrations/001_initial_schema.sql`
4. Paste and click **Run**

### Create Storage Bucket
1. Go to **Storage** in Supabase
2. Click "Create bucket"
3. Name: `media`
4. Make it **public**
5. Save

## 3. Fill in `.env.local`

```bash
# Supabase (Dashboard → Settings → API)
# URL: Copy "Project URL"
# ANON_KEY: Copy "Publishable key" (the one that starts with eyJ...)
# SERVICE_KEY: Copy "Secret key" (click eye icon to reveal, starts with eyJ...)
NEXT_PUBLIC_SUPABASE_URL=https://xxxxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJxxx...
SUPABASE_SERVICE_KEY=eyJxxx...

# Get from Anthropic or Perplexity
ANTHROPIC_API_KEY=sk-ant-xxx...

# Get from LATE (https://www.getlate.dev/)
LATE_API_KEY=late_xxx...

# Keep as is for development
NEXT_PUBLIC_SITE_URL=http://localhost:3000
```

## 4. Start Development Server

```bash
npm run dev
```

Open: http://localhost:3000

## 5. Create Admin User

### In Supabase Dashboard → Authentication → Users
1. Click "Add user"
2. Email: `admin@example.com`
3. Password: `your-password`
4. Check "Auto Confirm User"
5. Click "Create user"

### Make them Super Admin
Go to **SQL Editor** and run:

```sql
UPDATE user_profiles
SET is_super_admin = true
WHERE email = 'admin@example.com';
```

## 6. Log In & Create First Article

1. Go to http://localhost:3000/admin/login
2. Enter your admin credentials
3. Click "New Article"
4. Chat with AI in left panel
5. Click "Generate Article"
6. Review, edit, and publish!

---

## 🎯 That's It!

You now have a fully functional AI-assisted CMS.

### What You Can Do:
- ✨ Research and draft articles with AI
- 📝 Edit with rich text editor
- 🖼️ Upload and manage media
- 📱 Generate social media posts
- 📊 View analytics dashboard

### Next Steps:
- Read `SETUP_GUIDE.md` for detailed information
- Read `CMS_README.md` for feature documentation
- Configure Buffer for social media automation

---

## 🚨 Common Issues

### "Missing Supabase environment variables"
→ Check `.env.local` has all 3 Supabase keys

### "Unauthorized: Admin access required"
→ Run the SQL to set `is_super_admin = true`

### Media upload fails
→ Create `media` bucket in Supabase Storage

### AI doesn't respond
→ Verify ANTHROPIC_API_KEY or PERPLEXITY_API_KEY in `.env.local`

---

**Need help?** Check SETUP_GUIDE.md for detailed troubleshooting!
