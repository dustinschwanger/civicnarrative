# Debug Admin Login Issue

Your database setup is correct, but login with password "admin" is failing. Let's debug the actual login process.

## Step 1: Check What Error You're Getting

1. **Open the login page:**
   ```
   http://localhost:3000/admin/login
   ```

2. **Open Browser DevTools:**
   - Press **F12** (or right-click → Inspect)
   - Go to **Console** tab
   - Keep it open

3. **Try to log in:**
   - Email: your email
   - Password: admin
   - Click "Sign In"

4. **Check for errors:**
   - Look in the Console tab
   - Also check the **Network** tab for failed requests
   - Share any red error messages you see

## Step 2: Verify the Password in Supabase

The password might not actually be "admin" even if you think you set it to that.

### Check when the user was created:

**In Supabase SQL Editor, run:**
```sql
SELECT
  email,
  created_at,
  last_sign_in_at,
  encrypted_password IS NOT NULL as has_password,
  confirmation_sent_at,
  confirmed_at
FROM auth.users
WHERE email = 'your-email@example.com';
```

**What to look for:**
- `has_password = true` (confirms password exists)
- `last_sign_in_at` - if NULL, user has never logged in successfully
- `confirmed_at` - should have a timestamp

### The Real Issue: Password Mismatch

If you created the user in Supabase Dashboard, the password you entered might have:
- Been auto-generated (not "admin")
- Had special characters you didn't notice
- Been copied/pasted incorrectly
- Had leading/trailing spaces

**The only way to be 100% sure of the password is to reset it to a known value.**

## Step 3: Quick Test - Try a Simple Password Reset

Let's set the password to something you know for certain:

1. **In Supabase Dashboard:**
   - Go to: Authentication → Users
   - Find your user
   - Click **⋮** (three dots)
   - Select **"Send Password Reset Email"**

2. **Check your email and set password to:** `Admin123!`
   - This is a strong password that meets requirements
   - Easy to remember for testing

3. **Try logging in with:** `Admin123!`

## Step 4: Check if Dev Server is Running

Make sure your Next.js dev server is actually running:

```bash
# In terminal, you should see:
npm run dev

# Should show:
# ✓ Ready in 2.3s
# ○ Local: http://localhost:3000
```

If it's not running, start it:
```bash
cd "/Users/dustinschwanger/Documents/Civic Narrative"
npm run dev
```

## Step 5: Check Environment Variables

Make sure `.env.local` exists and has correct values:

```bash
# Verify file exists
ls -la .env.local

# Check contents
cat .env.local
```

Should show:
```
NEXT_PUBLIC_SUPABASE_URL=https://ugzmpykqrugzgdexnkgb.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=sb_publishable_5Dn6kthI0p_fRmRQIyQliA_glD4GQBZ
SUPABASE_SERVICE_KEY=sb_secret_kF_AbIFSEkSJegOdfipU3Q_l4FyV8NV
```

**If you changed .env.local recently:** Restart the dev server!

## Step 6: Test Supabase Connection

Let's verify your app can connect to Supabase:

**In Browser Console (on the login page), run:**
```javascript
// Test if Supabase is accessible
const { createClient } = await import('https://esm.sh/@supabase/supabase-js@2')
const supabase = createClient(
  'https://ugzmpykqrugzgdexnkgb.supabase.co',
  'sb_publishable_5Dn6kthI0p_fRmRQIyQliA_glD4GQBZ'
)

// Try to sign in
const result = await supabase.auth.signInWithPassword({
  email: 'your-email@example.com',
  password: 'admin'
})

console.log('Result:', result)
```

**Check the output:**
- If `error` is null: Password is correct, issue is in the app
- If `error` exists: Check `error.message` for the actual problem

## Step 7: Common Error Messages

### "Invalid login credentials"
**Meaning:** Email or password is wrong
**Fix:** Password is NOT "admin" - reset it to a known value

### "Unauthorized: Admin access required"
**Meaning:** User logged in, but `is_super_admin` is false
**Fix:** Run this SQL:
```sql
UPDATE user_profiles SET is_super_admin = true
WHERE email = 'your-email@example.com';
```

### "Email not confirmed"
**Meaning:** User needs to confirm email
**Fix:** In Supabase Dashboard, find user and manually confirm

### No error message at all
**Meaning:** JavaScript error preventing login
**Fix:** Check browser console for JavaScript errors

## Step 8: Nuclear Option - Create Known Good Admin User

Let's create a completely fresh admin user with a password we know:

```sql
-- Clean up (if you want to delete old user first)
-- Do this in Supabase Dashboard → Authentication → Users → Delete

-- After deleting in dashboard, clean up profile:
DELETE FROM user_profiles WHERE email = 'admin@test.com';
DELETE FROM admin_sessions;
```

**Then in Supabase Dashboard:**
1. Authentication → Users → Add user
2. Email: `admin@test.com`
3. Password: `TestPassword123!`
4. Click "Create user"

**Set super admin:**
```sql
UPDATE user_profiles
SET is_super_admin = true
WHERE email = 'admin@test.com';
```

**Test login:**
- Email: `admin@test.com`
- Password: `TestPassword123!`

## Most Likely Issues (In Order)

1. **Password is not actually "admin"** (90% likely)
   - Solution: Reset password to known value

2. **Browser is caching old login attempts**
   - Solution: Clear browser cache, try incognito mode

3. **Dev server needs restart after .env changes**
   - Solution: Stop server (Ctrl+C) and run `npm run dev` again

4. **Email is not confirmed in Supabase**
   - Solution: Manually confirm in dashboard

5. **CORS or localhost issues**
   - Solution: Make sure you're accessing exactly `http://localhost:3000`

## What to Share for Further Help

If none of this works, share:

1. **The exact error message** from browser console
2. **The output** from Step 6 (Supabase connection test)
3. **Screenshot** of the login page with DevTools open showing the error
4. **Result** of this query:
   ```sql
   SELECT
     au.email,
     au.confirmed_at,
     au.last_sign_in_at,
     up.is_super_admin
   FROM auth.users au
   LEFT JOIN user_profiles up ON au.id = up.auth_id
   WHERE au.email = 'your-email@example.com';
   ```

## Quick Resolution

Honestly, the fastest way to resolve this:

1. Delete current user in Supabase Dashboard
2. Create new user with email `admin@test.com` and password `TestPassword123!`
3. Run SQL to set `is_super_admin = true`
4. Log in with the known credentials
5. This takes 2 minutes and is guaranteed to work

The issue is almost certainly that the password is not what you think it is.
