# 🔄 Database Reset Instructions

You have **two options** for resetting your database:

---

## Option 1: Complete Reset (Recommended) ⭐

**Use this if:** You want to cleanly remove everything and start fresh in one step.

### Steps:

1. Go to [Supabase Dashboard](https://supabase.com/dashboard)
2. Navigate to **SQL Editor**
3. Click "New query"
4. Copy ALL contents from `migrations/RESET_DATABASE.sql`
5. Paste into SQL Editor
6. Click **Run** (or press Cmd+Enter)
7. Wait for success message

**This will:**
- ✅ Drop all CMS tables, triggers, functions
- ✅ Recreate everything fresh
- ✅ Add indexes and RLS policies
- ✅ Insert default categories
- ✅ Set up auto-update triggers

**After running:**
- Create your admin user in Supabase Auth
- Run this SQL to make them super admin:
  ```sql
  UPDATE user_profiles
  SET is_super_admin = true
  WHERE email = 'your-admin-email@example.com';
  ```
- Create `media` storage bucket (public)
- Start your dev server: `npm run dev`

---

## Option 2: Two-Step Process

**Use this if:** You want more control over the process.

### Step 1: Cleanup

1. Go to Supabase Dashboard → **SQL Editor**
2. Copy contents from `migrations/000_cleanup.sql`
3. Paste and **Run**
4. This drops all CMS tables and objects

### Step 2: Recreate

1. Stay in **SQL Editor**
2. Copy contents from `migrations/001_initial_schema.sql`
3. Paste and **Run**
4. This recreates everything fresh

---

## What Gets Removed

Both options will remove:
- ❌ All articles
- ❌ All media files metadata (files in Storage remain)
- ❌ All categories
- ❌ All social posts
- ❌ All AI chat sessions
- ❌ All admin sessions
- ❌ User profiles (but NOT auth.users)

**What stays intact:**
- ✅ Auth users (in `auth.users` table)
- ✅ Files in Supabase Storage (you need to manually delete these if wanted)
- ✅ All Supabase system tables

---

## Clean Storage Bucket (Optional)

If you also want to remove all uploaded media files:

1. Go to Supabase Dashboard → **Storage**
2. Click on `media` bucket
3. Select all files
4. Click **Delete**

---

## Verify Reset

After running the reset, check:

1. **SQL Editor** - Run:
   ```sql
   SELECT table_name
   FROM information_schema.tables
   WHERE table_schema = 'public';
   ```
   You should see: articles, categories, article_images, media_library, social_posts, ai_chat_sessions, user_profiles, admin_sessions

2. **Categories** - Run:
   ```sql
   SELECT * FROM categories;
   ```
   You should see 6 default categories

3. **Test Query** - Run:
   ```sql
   SELECT COUNT(*) FROM articles;
   ```
   Should return 0

---

## Troubleshooting

### "relation does not exist"
→ This is fine! It means tables don't exist yet. Continue with the reset.

### "permission denied"
→ Make sure you're running as a superuser or service role in Supabase Dashboard.

### "function already exists"
→ Use `RESET_DATABASE.sql` which includes `DROP FUNCTION IF EXISTS`

### Migration fails partway through
→ Run `000_cleanup.sql` first to clear everything, then run `001_initial_schema.sql`

---

## Quick Reference

| File | Purpose | Use When |
|------|---------|----------|
| `RESET_DATABASE.sql` | Complete reset in one step | You want the easiest option |
| `000_cleanup.sql` | Just drop everything | You want two-step control |
| `001_initial_schema.sql` | Just create everything | After running cleanup |

---

## After Reset Checklist

- [ ] Database reset complete
- [ ] Admin user created in Supabase Auth
- [ ] User set as super admin (SQL update)
- [ ] `media` storage bucket exists and is public
- [ ] `.env.local` has all credentials
- [ ] Dev server running (`npm run dev`)
- [ ] Can log in at `/admin/login`
- [ ] Dashboard loads with 0 articles

---

**Ready to start fresh!** 🎉
