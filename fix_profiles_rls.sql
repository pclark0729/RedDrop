-- Fix for infinite recursion in profiles table RLS policy
-- This script addresses the error: "infinite recursion detected in policy for relation 'profiles'"

-- Begin transaction
BEGIN;

-- First, disable RLS temporarily to ensure we can access the table
ALTER TABLE profiles DISABLE ROW LEVEL SECURITY;

-- Drop all existing policies on the profiles table (using all known naming conventions)
DROP POLICY IF EXISTS "Users can view their own profile" ON profiles;
DROP POLICY IF EXISTS "Users can update their own profile" ON profiles;
DROP POLICY IF EXISTS "Profiles are viewable by owner" ON profiles;
DROP POLICY IF EXISTS "Profiles are editable by owner" ON profiles;
DROP POLICY IF EXISTS "Admins can view all profiles" ON profiles;
DROP POLICY IF EXISTS "Admins can edit all profiles" ON profiles;
DROP POLICY IF EXISTS "Profiles are insertable by owner" ON profiles;
DROP POLICY IF EXISTS "Profiles are viewable by everyone" ON profiles;
DROP POLICY IF EXISTS "Enable read access for current user only" ON profiles;
DROP POLICY IF EXISTS "Enable read for admins to all profiles" ON profiles;
DROP POLICY IF EXISTS "Users can insert their own profile" ON profiles;
DROP POLICY IF EXISTS "Users can delete their own profile" ON profiles;

-- Also try to drop policies with different naming conventions that might exist
DROP POLICY IF EXISTS "profiles_select_own" ON profiles;
DROP POLICY IF EXISTS "profiles_select_public" ON profiles;
DROP POLICY IF EXISTS "profiles_insert_own" ON profiles;
DROP POLICY IF EXISTS "profiles_update_own" ON profiles;
DROP POLICY IF EXISTS "profiles_admin_all" ON profiles;
DROP POLICY IF EXISTS "Enable read access for all users" ON profiles;
DROP POLICY IF EXISTS "Enable insert for authenticated users only" ON profiles;
DROP POLICY IF EXISTS "Enable update for users based on email" ON profiles;

-- Re-enable RLS
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

-- Create simple, non-recursive policies
-- 1. Policy for users to view their own profile
CREATE POLICY "profiles_select_own" ON profiles
  FOR SELECT
  USING (auth.uid() = id);

-- 2. Policy for users to update their own profile
CREATE POLICY "profiles_update_own" ON profiles
  FOR UPDATE
  USING (auth.uid() = id);

-- 3. Policy for users to insert their own profile
CREATE POLICY "profiles_insert_own" ON profiles
  FOR INSERT
  WITH CHECK (auth.uid() = id);

-- 4. Policy for users to delete their own profile (if needed)
CREATE POLICY "profiles_delete_own" ON profiles
  FOR DELETE
  USING (auth.uid() = id);

-- Grant necessary permissions
GRANT SELECT, INSERT, UPDATE, DELETE ON profiles TO authenticated;
GRANT SELECT, INSERT ON profiles TO anon;

-- Verify the policies
SELECT
    schemaname,
    tablename,
    policyname,
    permissive,
    roles,
    cmd,
    qual,
    with_check
FROM
    pg_policies
WHERE
    tablename = 'profiles';

-- Analyze the table to update statistics
ANALYZE profiles;

-- Add onboarding_completed column if it doesn't exist
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1
        FROM information_schema.columns
        WHERE table_name = 'profiles'
        AND column_name = 'onboarding_completed'
    ) THEN
        ALTER TABLE profiles ADD COLUMN onboarding_completed BOOLEAN DEFAULT FALSE;
    END IF;
END $$;

-- Commit transaction
COMMIT;

-- Output success message
DO $$
BEGIN
    RAISE NOTICE 'RLS policies for profiles table have been successfully fixed.';
END $$; 