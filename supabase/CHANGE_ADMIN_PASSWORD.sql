-- ====================================================
-- Change Admin Password Guide
-- ====================================================
-- IMPORTANT: You CANNOT change auth.users passwords via SQL
-- Passwords are encrypted and managed by Supabase Auth API
-- Use one of the methods below instead

-- ====================================================
-- METHOD 1: Via Supabase Dashboard (Easiest)
-- ====================================================
-- 1. Go to: https://app.supabase.com/project/ugzmpykqrugzgdexnkgb/auth/users
-- 2. Find your user by email
-- 3. Click the three dots (⋮) on the right
-- 4. Select "Reset Password" or "Send Password Reset Email"
-- 5. Check your email for the reset link
-- 6. Click the link and set your new password
-- 7. Try logging in at http://localhost:3000/admin/login


-- ====================================================
-- METHOD 2: Via SQL - Trigger Password Reset Email
-- ====================================================
-- This uses Supabase's RPC function to send a password reset email

-- First, check if the function exists:
SELECT routine_name
FROM information_schema.routines
WHERE routine_schema = 'auth'
  AND routine_name = 'send_magic_link';

-- If it exists, you can trigger a reset email:
-- NOTE: This may not work depending on your Supabase setup
-- It's better to use METHOD 1 above


-- ====================================================
-- METHOD 3: Manually Set Password (Advanced - NOT RECOMMENDED)
-- ====================================================
-- WARNING: This method bypasses Supabase's password hashing
-- and will NOT work because you need to use their specific
-- encryption format. DO NOT ATTEMPT THIS.

-- The auth.users table uses encrypted_password column which requires:
-- - bcrypt hashing with specific salt
-- - Supabase's internal password format
-- - Proper authentication token generation

-- This is why you MUST use METHOD 1 or METHOD 2


-- ====================================================
-- METHOD 4: Via Supabase CLI (Terminal)
-- ====================================================
-- If you have Supabase CLI installed, you can trigger a reset:

-- Step 1: Install Supabase CLI (if not already installed)
-- npm install -g supabase

-- Step 2: Link to your project
-- supabase link --project-ref ugzmpykqrugzgdexnkgb

-- Step 3: Use the CLI to manage users
-- supabase db reset  # This will reset the database (NOT RECOMMENDED)

-- Unfortunately, Supabase CLI doesn't have a direct password change command
-- So METHOD 1 is still your best option


-- ====================================================
-- METHOD 5: Temporary Workaround - Delete and Recreate User
-- ====================================================
-- If you absolutely cannot access your email for password reset,
-- you can delete the user and create a new one with a known password

-- Step 1: Delete existing admin sessions (optional cleanup)
DELETE FROM admin_sessions
WHERE auth_id IN (
  SELECT id FROM auth.users WHERE email = 'your-email@example.com'
);

-- Step 2: Delete user profile (optional - will auto-recreate)
DELETE FROM user_profiles
WHERE email = 'your-email@example.com';

-- Step 3: Delete auth user (YOU MUST DO THIS IN SUPABASE DASHBOARD)
-- Go to: Authentication → Users
-- Find your user
-- Click three dots (⋮)
-- Click "Delete user"

-- Step 4: Create new user with known password (IN SUPABASE DASHBOARD)
-- Go to: Authentication → Users
-- Click "Add user"
-- Select "Create new user"
-- Email: your-email@example.com
-- Password: YourNewPassword123!
-- Click "Create user"

-- Step 5: Set super admin flag for the new user
UPDATE user_profiles
SET is_super_admin = true
WHERE email = 'your-email@example.com';

-- Step 6: Verify it worked
SELECT
  au.email,
  au.encrypted_password IS NOT NULL as has_password,
  up.is_super_admin
FROM auth.users au
LEFT JOIN user_profiles up ON au.id = up.auth_id
WHERE au.email = 'your-email@example.com';


-- ====================================================
-- VERIFY YOUR EMAIL SETTINGS (If reset emails don't arrive)
-- ====================================================
-- Check if email auth is enabled in your project

-- 1. Go to: https://app.supabase.com/project/ugzmpykqrugzgdexnkgb/auth/providers
-- 2. Ensure "Email" provider is enabled
-- 3. Check SMTP settings if using custom email
-- 4. Check spam folder for reset emails


-- ====================================================
-- QUICK REFERENCE: What Password Reset Email Looks Like
-- ====================================================
-- Subject: "Reset Your Password"
-- From: noreply@mail.app.supabase.io (or your custom domain)
-- Contains: Link like "https://ugzmpykqrugzgdexnkgb.supabase.co/auth/v1/verify?token=..."
-- Click the link to set new password


-- ====================================================
-- RECOMMENDED SOLUTION
-- ====================================================
-- 1. Use METHOD 1 (Supabase Dashboard password reset)
-- 2. If that doesn't work, use METHOD 5 (delete and recreate)
-- 3. Never try to manually update auth.users encrypted_password


-- ====================================================
-- After Password is Changed
-- ====================================================
-- Test your login:
-- 1. Go to: http://localhost:3000/admin/login
-- 2. Enter your email
-- 3. Enter your NEW password
-- 4. Should redirect to /admin dashboard

-- If login still fails, run the diagnostic query:
/*
SELECT
  au.id as auth_id,
  au.email as auth_email,
  au.encrypted_password IS NOT NULL as has_password,
  up.is_super_admin,
  CASE
    WHEN au.encrypted_password IS NULL THEN '⚠️ No password set'
    WHEN up.is_super_admin = FALSE THEN '⚠️ Not super admin'
    WHEN up.is_super_admin = TRUE THEN '✅ Ready to log in!'
  END as status
FROM auth.users au
LEFT JOIN user_profiles up ON au.id = up.auth_id
WHERE au.email = 'your-email@example.com';
*/
