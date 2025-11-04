-- ====================================================
-- Admin User Troubleshooting & Setup Script
-- ====================================================
-- Use this script to diagnose and fix admin login issues

-- ====================================================
-- STEP 1: Check if user exists in auth.users
-- ====================================================
-- Replace 'your-email@example.com' with your actual email
SELECT
  id as auth_id,
  email,
  created_at,
  email_confirmed_at,
  last_sign_in_at,
  encrypted_password IS NOT NULL as has_password
FROM auth.users
WHERE email = 'your-email@example.com';

-- Expected result:
-- - Should show one row with your email
-- - has_password should be TRUE
-- - If no rows: User doesn't exist, create it in Step 4
-- - If has_password is FALSE: Password not set, reset it in Step 5


-- ====================================================
-- STEP 2: Check if user_profile exists and has admin flag
-- ====================================================
-- Replace 'your-email@example.com' with your actual email
SELECT
  up.id,
  up.auth_id,
  up.email,
  up.is_super_admin,
  up.created_at,
  au.email as auth_email
FROM user_profiles up
LEFT JOIN auth.users au ON up.auth_id = au.id
WHERE up.email = 'your-email@example.com';

-- Expected result:
-- - Should show one row
-- - is_super_admin should be TRUE
-- - auth_id should not be NULL
-- - auth_email should match your email (confirms link is correct)
-- - If no rows: Profile doesn't exist, will be auto-created on first login
-- - If is_super_admin is FALSE: Run Step 3


-- ====================================================
-- STEP 3: Set super admin flag (if needed)
-- ====================================================
-- Replace 'your-email@example.com' with your actual email
UPDATE user_profiles
SET is_super_admin = true
WHERE email = 'your-email@example.com';

-- Check it worked:
SELECT email, is_super_admin
FROM user_profiles
WHERE email = 'your-email@example.com';


-- ====================================================
-- STEP 4: Create admin user (if doesn't exist)
-- ====================================================
-- IMPORTANT: You CANNOT create auth.users via SQL
-- You must use ONE of these methods:

-- METHOD A: Via Supabase Dashboard (Recommended)
-- 1. Go to: Authentication → Users
-- 2. Click "Add user" (top right)
-- 3. Select "Create new user"
-- 4. Enter email and password
-- 5. Click "Create user"
-- 6. Then run STEP 3 above to set super admin flag

-- METHOD B: Via Sign Up Page (if you have one)
-- 1. Create a sign-up page or use Supabase Auth UI
-- 2. Register with your admin email
-- 3. Then run STEP 3 above to set super admin flag

-- METHOD C: Via API call (advanced)
-- You can use Supabase CLI or API to create the user programmatically


-- ====================================================
-- STEP 5: Reset password (if login still fails)
-- ====================================================
-- IMPORTANT: You CANNOT reset password via SQL directly
-- Use ONE of these methods:

-- METHOD A: Via Supabase Dashboard
-- 1. Go to: Authentication → Users
-- 2. Find your user
-- 3. Click the three dots (⋮) on the right
-- 4. Select "Reset Password" or "Send Password Reset Email"
-- 5. Check your email and set a new password

-- METHOD B: Via Password Reset Email
-- 1. On the admin login page, add a "Forgot Password" link
-- 2. Or manually trigger password reset via Supabase dashboard


-- ====================================================
-- STEP 6: Verify everything is set up correctly
-- ====================================================
-- Run this query to see the complete picture:
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
    WHEN up.id IS NULL THEN '⚠️ User exists but no profile (will auto-create on login)'
    WHEN up.auth_id IS NULL THEN '❌ Profile exists but auth_id is NULL'
    WHEN up.auth_id != au.id THEN '❌ Profile auth_id does not match auth user id'
    WHEN up.is_super_admin = FALSE THEN '⚠️ Profile exists but is_super_admin is FALSE'
    WHEN up.is_super_admin = TRUE THEN '✅ Everything looks good!'
    ELSE '⚠️ Unknown issue'
  END as status
FROM auth.users au
FULL OUTER JOIN user_profiles up ON au.id = up.auth_id
WHERE au.email = 'your-email@example.com' OR up.email = 'your-email@example.com';


-- ====================================================
-- STEP 7: Clean up old admin sessions (optional)
-- ====================================================
-- If you have stale sessions causing issues, delete them:
DELETE FROM admin_sessions
WHERE auth_id IN (
  SELECT id FROM auth.users WHERE email = 'your-email@example.com'
);


-- ====================================================
-- COMMON ISSUES & SOLUTIONS
-- ====================================================

-- Issue 1: "Invalid login credentials"
-- Solution: Password is wrong or not set. Reset password via Supabase dashboard.

-- Issue 2: "Unauthorized: Admin access required"
-- Solution: is_super_admin is FALSE. Run STEP 3 to set it to TRUE.

-- Issue 3: User profile doesn't exist
-- Solution: The trigger should auto-create it on first login attempt.
--          But if it doesn't, manually create it:
/*
INSERT INTO user_profiles (auth_id, email, is_super_admin)
SELECT id, email, true
FROM auth.users
WHERE email = 'your-email@example.com'
ON CONFLICT (auth_id) DO UPDATE
SET is_super_admin = true;
*/

-- Issue 4: Profile exists but auth_id is NULL
-- Solution: Update the profile to link to the auth user:
/*
UPDATE user_profiles
SET auth_id = (SELECT id FROM auth.users WHERE email = 'your-email@example.com')
WHERE email = 'your-email@example.com' AND auth_id IS NULL;
*/


-- ====================================================
-- COMPLETE RESET (Nuclear Option)
-- ====================================================
-- If all else fails, delete the user and start fresh:
/*
-- WARNING: This will delete the user and all associated data!

-- 1. Delete user profile
DELETE FROM user_profiles WHERE email = 'your-email@example.com';

-- 2. Delete admin sessions
DELETE FROM admin_sessions WHERE auth_id IN (
  SELECT id FROM auth.users WHERE email = 'your-email@example.com'
);

-- 3. Delete auth user (do this in Supabase Dashboard - Authentication → Users → Delete)

-- 4. Then create a fresh admin user using METHOD A in STEP 4 above
*/
