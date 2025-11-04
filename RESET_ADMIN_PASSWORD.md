# Reset Admin Password - Quick Guide

Since your diagnostic shows everything is set up correctly, the issue is that you don't know/remember the current password. Here's how to reset it.

## Option 1: Password Reset via Supabase Dashboard (Recommended)

### Step-by-Step:

1. **Go to Supabase Dashboard:**
   ```
   https://app.supabase.com/project/ugzmpykqrugzgdexnkgb/auth/users
   ```
   Or navigate: Authentication → Users

2. **Find your user:**
   - Look for your email in the user list
   - Click anywhere on that row to select it

3. **Reset password:**
   - Click the **three dots (⋮)** on the right side of the row
   - Select **"Send Password Reset Email"**

4. **Check your email:**
   - Look for email from: `noreply@mail.app.supabase.io`
   - Subject: "Reset Your Password"
   - Check spam folder if you don't see it

5. **Click the reset link:**
   - Opens a page to set your new password
   - Enter a strong password (at least 8 characters)
   - Confirm the password

6. **Test login:**
   - Go to: http://localhost:3000/admin/login
   - Enter your email and NEW password
   - Should redirect to /admin dashboard

---

## Option 2: Delete and Recreate User (If email doesn't arrive)

If the password reset email isn't arriving, create a fresh admin user:

### Step 1: Delete Old User

**In Supabase Dashboard:**
1. Go to: Authentication → Users
2. Find your user
3. Click **three dots (⋮)**
4. Click **"Delete user"**
5. Confirm deletion

**Clean up the database (optional):**
```sql
-- In SQL Editor, run:
DELETE FROM user_profiles WHERE email = 'your-email@example.com';
DELETE FROM admin_sessions WHERE auth_id IN (
  SELECT id FROM auth.users WHERE email = 'your-email@example.com'
);
```

### Step 2: Create New User

**In Supabase Dashboard:**
1. Go to: Authentication → Users
2. Click **"Add user"** (top right, green button)
3. Select **"Create new user"**
4. Fill in:
   - **Email**: `your-email@example.com`
   - **Password**: `YourNewPassword123!` (choose something secure)
   - Leave "Auto Confirm User" checked (if available)
5. Click **"Create user"**

### Step 3: Set Super Admin Flag

**In SQL Editor:**
```sql
UPDATE user_profiles
SET is_super_admin = true
WHERE email = 'your-email@example.com';
```

### Step 4: Verify Setup

**In SQL Editor:**
```sql
SELECT
  au.email,
  au.encrypted_password IS NOT NULL as has_password,
  up.is_super_admin,
  CASE
    WHEN au.encrypted_password IS NULL THEN '⚠️ No password'
    WHEN up.is_super_admin = FALSE THEN '⚠️ Not admin'
    ELSE '✅ Ready!'
  END as status
FROM auth.users au
LEFT JOIN user_profiles up ON au.id = up.auth_id
WHERE au.email = 'your-email@example.com';
```

Should show:
- `has_password = true`
- `is_super_admin = true`
- `status = ✅ Ready!`

### Step 5: Test Login

1. Go to: http://localhost:3000/admin/login
2. Email: `your-email@example.com`
3. Password: `YourNewPassword123!` (or whatever you set)
4. Click **"Sign In"**
5. Should redirect to /admin dashboard

---

## Troubleshooting

### "Invalid login credentials" error

**Causes:**
- Wrong password
- Wrong email
- Caps Lock is on
- Password wasn't set properly

**Fix:**
Try Option 2 (delete and recreate) to ensure clean setup.

### "Unauthorized: Admin access required" error

**Cause:** `is_super_admin` flag is not set

**Fix:**
```sql
UPDATE user_profiles
SET is_super_admin = true
WHERE email = 'your-email@example.com';
```

### Password reset email not arriving

**Check:**
1. Spam/junk folder
2. Email provider settings (Supabase → Authentication → Email Templates)
3. Try a different email address
4. Use Option 2 instead (delete and recreate)

### Still can't log in after all this

**Debug:**
1. Open browser DevTools (F12)
2. Go to Console tab
3. Try logging in
4. Check for error messages
5. Share the error here

---

## Quick Commands

### Check if user exists and has password:
```sql
SELECT email, encrypted_password IS NOT NULL as has_password
FROM auth.users
WHERE email = 'your-email@example.com';
```

### Check if super admin flag is set:
```sql
SELECT email, is_super_admin
FROM user_profiles
WHERE email = 'your-email@example.com';
```

### Set super admin flag:
```sql
UPDATE user_profiles
SET is_super_admin = true
WHERE email = 'your-email@example.com';
```

---

## Why You Can't Change Password via SQL

Supabase uses:
- Bcrypt encryption with specific salt
- Internal password hashing format
- Token generation tied to the Auth API

The `encrypted_password` column in `auth.users` cannot be manually set. You must use:
- Supabase Dashboard
- Password reset email
- Supabase Auth API

This is a security feature to prevent unauthorized password changes.

---

## Recommended Approach

Since your diagnostic shows everything is configured correctly:

1. **Try Option 1 first** (password reset email)
   - Fastest if it works
   - No data loss

2. **Use Option 2 if needed** (delete and recreate)
   - 100% guaranteed to work
   - Clean slate with known password

Both will get you logged in within 5 minutes.
