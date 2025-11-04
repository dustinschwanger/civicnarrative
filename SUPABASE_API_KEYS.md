# 🔑 Supabase API Keys Reference

## Current Supabase Naming (2025)

Supabase now uses these names in their dashboard:

### 1. **Publishable key** (formerly "anon key")
- **Location**: Dashboard → Settings → API → "Publishable key" section
- **Starts with**: `eyJ...` or `sb_publishable_...`
- **Safe to use**: In browser/client-side code
- **What it does**: Public access with Row Level Security (RLS) policies enforced
- **Environment variable**: `NEXT_PUBLIC_SUPABASE_ANON_KEY`

### 2. **Secret key** (formerly "service_role key")
- **Location**: Dashboard → Settings → API → "Secret keys" section
- **Starts with**: `eyJ...` or `sb_secret_...`
- **⚠️ NEVER expose**: Server-side only, never in browser
- **What it does**: Full privileged access, bypasses RLS policies
- **Environment variable**: `SUPABASE_SERVICE_KEY`

### 3. **Project URL**
- **Location**: Dashboard → Settings → API → Top of page
- **Format**: `https://xxxxx.supabase.co`
- **Environment variable**: `NEXT_PUBLIC_SUPABASE_URL`

---

## Your `.env.local` Mapping

```bash
# Copy from Supabase Dashboard → Settings → API

# 1. Project URL (copy from top of API settings page)
NEXT_PUBLIC_SUPABASE_URL=https://your-project-id.supabase.co

# 2. Publishable key (copy from "Publishable key" section)
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...

# 3. Secret key (copy from "Secret keys" section - click eye icon to reveal)
SUPABASE_SERVICE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

---

## Where Each Key is Used

### `NEXT_PUBLIC_SUPABASE_ANON_KEY` (Publishable)
✅ Used in:
- Client-side Supabase client (`lib/supabase-client.ts`)
- Browser requests from React components
- Public API endpoints
- Authentication flows

**Safe because:** RLS policies protect your data

### `SUPABASE_SERVICE_KEY` (Secret)
⚠️ Used in:
- Server-side Supabase client (`lib/supabase-server.ts`)
- API routes (`app/api/*`)
- Server Components
- Database operations that need admin access

**Critical:** Never expose this in client-side code!

---

## How to Find Your Keys

### Step-by-Step:

1. Go to [Supabase Dashboard](https://supabase.com/dashboard)
2. Select your project
3. Click **Settings** (gear icon in sidebar)
4. Click **API** (in settings menu)
5. You'll see:
   - **Project URL** at the top
   - **Publishable key** in the first section (copy the long key starting with `eyJ`)
   - **Secret keys** below (click the eye icon 👁️ to reveal, copy the one labeled "default")

---

## Key Formats

### Old Format (JWT-style)
Both keys look like this:
```
eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6...
```

### New Format (Prefixed)
Newer projects may use:
- Publishable: `sb_publishable_5Dn6kthI0p_fRmRQIyQliA_glD4GQBZ`
- Secret: `sb_secret_kF_Ab...`

**Both formats work!** The code accepts either style.

---

## Troubleshooting

### "Missing Supabase environment variables"
→ Check that all three variables are set in `.env.local`

### "Invalid API key"
→ Make sure you copied the full key (they're very long)

### "Unauthorized"
→ You might be using the Publishable key where you need the Secret key (or vice versa)

### Keys don't work after restart
→ Restart your dev server: `npm run dev`

---

## Security Best Practices

✅ **DO:**
- Store Secret key in `.env.local` (never commit to git)
- Use Publishable key in client-side code
- Keep `.env.local` in `.gitignore`

❌ **DON'T:**
- Expose Secret key in browser console
- Commit `.env.local` to version control
- Share Secret key publicly
- Use Secret key in client-side code

---

## Quick Reference Table

| What Supabase Calls It | Old Name | Environment Variable | Where to Use |
|------------------------|----------|---------------------|--------------|
| Publishable key | anon key | `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Client-side |
| Secret key | service_role key | `SUPABASE_SERVICE_KEY` | Server-side only |
| Project URL | URL | `NEXT_PUBLIC_SUPABASE_URL` | Both |

---

**All set!** Just copy the three values from Supabase Dashboard → Settings → API into your `.env.local` file. 🎉
