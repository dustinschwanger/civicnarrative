# Admin Login Troubleshooting Guide

You created an admin user and set the `is_super_admin` flag, but can't log in? This guide will help you diagnose and fix the issue.

## Understanding the Login Flow

The admin login requires THREE things to work:

1. **A user in Supabase Auth** (`auth.users` table)
   - Must have email AND password set
   - This is the authentication layer

2. **A user profile** (`user_profiles` table)
   - Must have `is_super_admin = true`
   - Must have matching `auth_id` linking to the auth user
   - This is the authorization layer

3. **Matching records**
   - The `auth_id` in `user_profiles` must equal the `id` in `auth.users`

## Quick Diagnosis

### Step 1: Check Your Setup in Supabase Dashboard

1. Go to your Supabase project: https://ugzmpykqrugzgdexnkgb.supabase.co
2. Navigate to **Authentication** → **Users**
3. Find your admin user by email

**What to check:**
- Does the user exist?
- Is there a value in the "Last Sign In" column? (Shows password is set)
- Is "Email Confirmed" checked?

### Step 2: Run Diagnostic SQL

1. In Supabase Dashboard, go to **SQL Editor**
2. Copy and paste this query (replace with your actual email):

```sql
-- Comprehensive diagnostic query
SELECT
  au.id as auth_id,
  au.email as auth_email,
  au.email_confirmed_at,
  au.encrypted_password IS NOT NULL as has_password,
  up.id as profile_id,
  up.email as profile_email,
  up.is_super_admin,
  up.auth_id as profile_auth_id,
  CASE
    WHEN au.id IS NULL THEN '❌ User does not exist in auth.users'
    WHEN au.encrypted_password IS NULL THEN '⚠️ User exists but has no password'
    WHEN up.id IS NULL THEN '⚠️ User exists but no profile'
    WHEN up.auth_id IS NULL THEN '❌ Profile exists but auth_id is NULL'
    WHEN up.auth_id != au.id THEN '❌ Profile auth_id mismatch'
    WHEN up.is_super_admin = FALSE THEN '⚠️ is_super_admin is FALSE'
    WHEN up.is_super_admin = TRUE THEN '✅ Everything looks good!'
    ELSE '⚠️ Unknown issue'
  END as status
FROM auth.users au
FULL OUTER JOIN user_profiles up ON au.id = up.auth_id
WHERE au.email = 'your-email@example.com' OR up.email = 'your-email@example.com';
```

3. Click **Run**
4. Check the `status` column for your issue

## Common Issues & Solutions

### Issue 1: "❌ User does not exist in auth.users"

**Problem:** You haven't created the user in Supabase Auth yet.

**Solution:**

1. In Supabase Dashboard, go to **Authentication** → **Users**
2. Click **"Add user"** (top right, green button)
3. Select **"Create new user"**
4. Enter your admin email and a strong password
5. Click **"Create user"**
6. Then go to SQL Editor and run:

```sql
UPDATE user_profiles
SET is_super_admin = true
WHERE email = 'your-email@example.com';
```

### Issue 2: "⚠️ User exists but has no password"

**Problem:** The user was created without a password (possibly via email OTP or social login).

**Solution - Reset Password:**

1. In Supabase Dashboard, go to **Authentication** → **Users**
2. Find your user
3. Click the **three dots (⋮)** on the right side
4. Select **"Send Password Reset Email"**
5. Check your email
6. Click the reset link and set a new password
7. Try logging in again

**Alternative - Delete and Recreate:**

1. Delete the user from Supabase Dashboard
2. Recreate with email + password (see Issue 1 solution)

### Issue 3: "⚠️ User exists but no profile"

**Problem:** The user profile wasn't auto-created by the database trigger.

**Solution:**

The profile should auto-create on first login attempt, but you can manually create it:

```sql
INSERT INTO user_profiles (auth_id, email, is_super_admin)
SELECT id, email, true
FROM auth.users
WHERE email = 'your-email@example.com'
ON CONFLICT (auth_id) DO UPDATE
SET is_super_admin = true;
```

### Issue 4: "⚠️ is_super_admin is FALSE"

**Problem:** The profile exists but the admin flag isn't set.

**Solution:**

```sql
UPDATE user_profiles
SET is_super_admin = true
WHERE email = 'your-email@example.com';
```

### Issue 5: "❌ Profile exists but auth_id is NULL"

**Problem:** The profile and auth user aren't linked.

**Solution:**

```sql
UPDATE user_profiles
SET auth_id = (SELECT id FROM auth.users WHERE email = 'your-email@example.com')
WHERE email = 'your-email@example.com' AND auth_id IS NULL;
```

### Issue 6: "Invalid login credentials" error when trying to log in

**Problem:** The password is incorrect.

**Solution:**

1. Make sure you're using the correct email
2. Check Caps Lock isn't on
3. If unsure, reset the password (see Issue 2 solution)

## Step-by-Step: Create Admin User from Scratch

If you want to start fresh, here's the complete process:

### Method 1: Via Supabase Dashboard (Easiest)

1. **Create the auth user:**
   - Go to **Authentication** → **Users**
   - Click **"Add user"**
   - Select **"Create new user"**
   - Email: `admin@example.com`
   - Password: `YourStrongPassword123!`
   - Click **"Create user"**

2. **Set super admin flag:**
   - Go to **SQL Editor**
   - Run this query:
   ```sql
   UPDATE user_profiles
   SET is_super_admin = true
   WHERE email = 'admin@example.com';
   ```

3. **Verify it worked:**
   - Go to **SQL Editor**
   - Run this query:
   ```sql
   SELECT
     au.email,
     au.encrypted_password IS NOT NULL as has_password,
     up.is_super_admin
   FROM auth.users au
   JOIN user_profiles up ON au.id = up.auth_id
   WHERE au.email = 'admin@example.com';
   ```
   - Should show: `has_password = true`, `is_super_admin = true`

4. **Test the login:**
   - Go to: http://localhost:3000/admin/login
   - Enter your email and password
   - Should redirect to `/admin` dashboard

### Method 2: Via SQL (Advanced)

You **cannot** create `auth.users` via SQL. You must use the Supabase Dashboard or API.

But after creating the user in the dashboard, you can run:

```sql
-- Ensure profile exists and link it to auth user
INSERT INTO user_profiles (auth_id, email, is_super_admin)
SELECT id, email, true
FROM auth.users
WHERE email = 'admin@example.com'
ON CONFLICT (auth_id) DO UPDATE
SET is_super_admin = true;
```

## Verify Your Database Trigger is Working

The database has a trigger that should auto-create `user_profiles` when a user signs up. Check if it exists:

```sql
-- Check if trigger exists
SELECT
  trigger_name,
  event_manipulation,
  event_object_table
FROM information_schema.triggers
WHERE trigger_name = 'on_auth_user_created';
```

If it doesn't exist, run the migration script in `supabase/migrations/001_initial_schema.sql`.

## Still Having Issues?

### Check Browser Console

1. Open the admin login page: http://localhost:3000/admin/login
2. Open browser DevTools (F12 or right-click → Inspect)
3. Go to **Console** tab
4. Try logging in
5. Look for error messages

Common errors:
- `"Invalid login credentials"` → Password is wrong
- `"Unauthorized: Admin access required"` → `is_super_admin` is false
- `"No user data returned"` → Auth issue

### Check Environment Variables

Make sure your `.env.local` has the correct Supabase credentials:

```bash
NEXT_PUBLIC_SUPABASE_URL=https://ugzmpykqrugzgdexnkgb.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=sb_publishable_5Dn6kthI0p_fRmRQIyQliA_glD4GQBZ
SUPABASE_SERVICE_KEY=sb_secret_kF_AbIFSEkSJegOdfipU3Q_l4FyV8NV
```

After changing `.env.local`, restart your dev server:

```bash
npm run dev
```

### Clean Up Stale Sessions

If you have old admin sessions causing issues:

```sql
-- Delete all admin sessions for your user
DELETE FROM admin_sessions
WHERE auth_id IN (
  SELECT id FROM auth.users WHERE email = 'your-email@example.com'
);
```

## Complete Reset (Last Resort)

If nothing works, start completely fresh:

1. **Delete the user in Supabase Dashboard:**
   - Authentication → Users
   - Find your user
   - Click three dots (⋮)
   - Click "Delete user"

2. **Clean up database:**
   ```sql
   -- Delete any orphaned profiles
   DELETE FROM user_profiles WHERE email = 'your-email@example.com';

   -- Delete any admin sessions
   DELETE FROM admin_sessions WHERE auth_id IN (
     SELECT id FROM auth.users WHERE email = 'your-email@example.com'
   );
   ```

3. **Create fresh admin user** (follow Method 1 above)

## Test Checklist

Once you think it's fixed, verify:

- [ ] User exists in Authentication → Users
- [ ] User has "Last Sign In" timestamp (proves password is set)
- [ ] `user_profiles` has record with `is_super_admin = true`
- [ ] `auth_id` in profile matches `id` in auth.users
- [ ] Can log in at http://localhost:3000/admin/login
- [ ] Redirects to http://localhost:3000/admin after login
- [ ] Dashboard loads without errors

## Summary

The most common issue is creating a user in Supabase without properly setting a password. Make sure to:

1. **Create user with password** in Supabase Dashboard (Authentication → Users → Add user)
2. **Set super admin flag** via SQL Editor
3. **Test login** at /admin/login

If you followed these steps and still can't log in, run the diagnostic query in Step 2 and check which specific error you're getting, then follow the corresponding solution above.
