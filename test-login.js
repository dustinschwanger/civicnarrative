/**
 * Test Admin Login Credentials
 *
 * This script tests if your email/password combination works with Supabase
 * Run with: node test-login.js
 */

require('dotenv').config({ path: '.env.local' })
const { createClient } = require('@supabase/supabase-js')

// Your Supabase credentials
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

console.log('\n🔍 Testing Admin Login\n')
console.log('Supabase URL:', supabaseUrl)
console.log('Anon Key:', supabaseAnonKey ? supabaseAnonKey.substring(0, 20) + '...' : 'MISSING')
console.log('')

// Create Supabase client
const supabase = createClient(supabaseUrl, supabaseAnonKey)

// CHANGE THESE TO YOUR ACTUAL CREDENTIALS
const TEST_EMAIL = 'dustinschwanger@gmail.com'  // ← Change this!
const TEST_PASSWORD = 'admin'  // ← Or change this if different

async function testLogin() {
  try {
    console.log(`📧 Testing login for: ${TEST_EMAIL}`)
    console.log(`🔑 Using password: ${TEST_PASSWORD}`)
    console.log('')

    // Step 1: Try to sign in
    console.log('Step 1: Attempting sign in with Supabase Auth...')
    const { data: authData, error: authError } = await supabase.auth.signInWithPassword({
      email: TEST_EMAIL,
      password: TEST_PASSWORD,
    })

    if (authError) {
      console.error('❌ Authentication failed!')
      console.error('Error:', authError.message)
      console.error('')
      console.error('Common causes:')
      console.error('  • Password is incorrect (not "admin")')
      console.error('  • Email is incorrect')
      console.error('  • User does not exist')
      console.error('  • Email is not confirmed')
      console.error('')
      console.error('💡 Try resetting your password in Supabase Dashboard')
      process.exit(1)
    }

    console.log('✅ Authentication successful!')
    console.log('User ID:', authData.user.id)
    console.log('Email:', authData.user.email)
    console.log('')

    // Step 2: Check user profile
    console.log('Step 2: Checking user profile...')
    const { data: profile, error: profileError } = await supabase
      .from('user_profiles')
      .select('*')
      .eq('auth_id', authData.user.id)
      .single()

    if (profileError) {
      console.error('❌ Profile fetch failed!')
      console.error('Error:', profileError.message)
      console.error('')
      console.error('The user profile might not exist. Run this SQL:')
      console.error(`
INSERT INTO user_profiles (auth_id, email, is_super_admin)
VALUES ('${authData.user.id}', '${authData.user.email}', true)
ON CONFLICT (auth_id) DO UPDATE
SET is_super_admin = true;
      `)
      process.exit(1)
    }

    console.log('✅ Profile found!')
    console.log('Profile ID:', profile.id)
    console.log('Email:', profile.email)
    console.log('Is Super Admin:', profile.is_super_admin)
    console.log('')

    // Step 3: Check super admin status
    if (!profile.is_super_admin) {
      console.error('❌ User is not a super admin!')
      console.error('')
      console.error('Run this SQL to fix it:')
      console.error(`
UPDATE user_profiles
SET is_super_admin = true
WHERE auth_id = '${authData.user.id}';
      `)
      process.exit(1)
    }

    console.log('✅ User is a super admin!')
    console.log('')
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━')
    console.log('🎉 ALL CHECKS PASSED!')
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━')
    console.log('')
    console.log('Your credentials are correct:')
    console.log(`  Email: ${TEST_EMAIL}`)
    console.log(`  Password: ${TEST_PASSWORD}`)
    console.log('')
    console.log('You should be able to log in at:')
    console.log('  http://localhost:3000/admin/login')
    console.log('')
    console.log('If login still fails on the website:')
    console.log('  1. Clear browser cache')
    console.log('  2. Try incognito/private mode')
    console.log('  3. Check browser console for errors (F12)')
    console.log('  4. Restart dev server: npm run dev')
    console.log('')

    // Clean up: sign out
    await supabase.auth.signOut()

  } catch (err) {
    console.error('❌ Unexpected error:', err.message)
    console.error(err)
  }
}

// Run the test
if (!supabaseUrl || !supabaseAnonKey) {
  console.error('❌ Environment variables not loaded!')
  console.error('')
  console.error('Make sure .env.local exists and contains:')
  console.error('  NEXT_PUBLIC_SUPABASE_URL=your-url')
  console.error('  NEXT_PUBLIC_SUPABASE_ANON_KEY=your-key')
  process.exit(1)
}

if (TEST_EMAIL === 'your-email@example.com') {
  console.error('❌ Please edit test-login.js and set your actual email!')
  console.error('')
  console.error('Change line 22:')
  console.error('  const TEST_EMAIL = \'your-actual-email@example.com\'')
  process.exit(1)
}

testLogin()
