-- =====================================================
-- CLEANUP SCRIPT - Drops all CMS tables and objects
-- =====================================================
-- Run this BEFORE running 001_initial_schema.sql if you want a clean start
-- This will remove all CMS data but preserve Supabase auth tables

-- Drop all triggers first
DROP TRIGGER IF EXISTS update_articles_updated_at ON articles;
DROP TRIGGER IF EXISTS update_article_images_updated_at ON article_images;
DROP TRIGGER IF EXISTS update_ai_chat_sessions_updated_at ON ai_chat_sessions;
DROP TRIGGER IF EXISTS update_user_profiles_updated_at ON user_profiles;
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;

-- Drop all functions
DROP FUNCTION IF EXISTS update_updated_at_column();
DROP FUNCTION IF EXISTS public.handle_new_user();

-- Drop all tables (in reverse dependency order)
DROP TABLE IF EXISTS social_posts CASCADE;
DROP TABLE IF EXISTS ai_chat_sessions CASCADE;
DROP TABLE IF EXISTS article_images CASCADE;
DROP TABLE IF EXISTS media_library CASCADE;
DROP TABLE IF EXISTS articles CASCADE;
DROP TABLE IF EXISTS categories CASCADE;
DROP TABLE IF EXISTS admin_sessions CASCADE;
DROP TABLE IF EXISTS user_profiles CASCADE;

-- Success message
DO $$
BEGIN
  RAISE NOTICE 'All CMS tables, triggers, and functions have been dropped successfully!';
  RAISE NOTICE 'You can now run 001_initial_schema.sql to recreate the database.';
END $$;
