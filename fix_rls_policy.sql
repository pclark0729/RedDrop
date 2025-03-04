-- Fix for infinite recursion in profiles table RLS policy
-- This script fixes the infinite recursion issue in the Row Level Security (RLS) policies for the profiles table

-- First, drop all existing policies on the profiles table
DROP POLICY IF EXISTS "Users can view their own profile" ON profiles;
DROP POLICY IF EXISTS "Users can update their own profile" ON profiles;
DROP POLICY IF EXISTS "Profiles are viewable by owner" ON profiles;
DROP POLICY IF EXISTS "Profiles are editable by owner" ON profiles;
DROP POLICY IF EXISTS "Admins can view all profiles" ON profiles;
DROP POLICY IF EXISTS "Admins can edit all profiles" ON profiles;
DROP POLICY IF EXISTS "Profiles are insertable by owner" ON profiles;

-- Make sure RLS is enabled on the profiles table
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

-- Check if policies already exist and drop them if they do
DO $$
DECLARE
    policy_exists BOOLEAN;
BEGIN
    -- Check for "Profiles are viewable by owner"
    SELECT EXISTS (
        SELECT 1 FROM pg_policies 
        WHERE tablename = 'profiles' AND policyname = 'Profiles are viewable by owner'
    ) INTO policy_exists;
    
    IF policy_exists THEN
        DROP POLICY "Profiles are viewable by owner" ON profiles;
    END IF;
    
    -- Check for "Profiles are editable by owner"
    SELECT EXISTS (
        SELECT 1 FROM pg_policies 
        WHERE tablename = 'profiles' AND policyname = 'Profiles are editable by owner'
    ) INTO policy_exists;
    
    IF policy_exists THEN
        DROP POLICY "Profiles are editable by owner" ON profiles;
    END IF;
    
    -- Check for "Admins can view all profiles"
    SELECT EXISTS (
        SELECT 1 FROM pg_policies 
        WHERE tablename = 'profiles' AND policyname = 'Admins can view all profiles'
    ) INTO policy_exists;
    
    IF policy_exists THEN
        DROP POLICY "Admins can view all profiles" ON profiles;
    END IF;
    
    -- Check for "Admins can update all profiles"
    SELECT EXISTS (
        SELECT 1 FROM pg_policies 
        WHERE tablename = 'profiles' AND policyname = 'Admins can update all profiles'
    ) INTO policy_exists;
    
    IF policy_exists THEN
        DROP POLICY "Admins can update all profiles" ON profiles;
    END IF;
    
    -- Check for "Profiles are insertable by owner"
    SELECT EXISTS (
        SELECT 1 FROM pg_policies 
        WHERE tablename = 'profiles' AND policyname = 'Profiles are insertable by owner'
    ) INTO policy_exists;
    
    IF policy_exists THEN
        DROP POLICY "Profiles are insertable by owner" ON profiles;
    END IF;
END
$$;

-- Create a safer policy for viewing profiles
-- This policy allows users to view their own profile without causing recursion
CREATE POLICY "Profiles are viewable by owner" ON profiles
    FOR SELECT
    USING (auth.uid() = id);

-- Create a safer policy for updating profiles
-- This policy allows users to update their own profile without causing recursion
CREATE POLICY "Profiles are editable by owner" ON profiles
    FOR UPDATE
    USING (auth.uid() = id);

-- Create a policy for admins to view all profiles
-- This uses a direct check against the profiles table for admin status
CREATE POLICY "Admins can view all profiles" ON profiles
    FOR SELECT
    USING (
        EXISTS (
            SELECT 1 FROM profiles
            WHERE profiles.id = auth.uid()
            AND profiles.is_admin = true
        )
    );

-- Create a policy for admins to update all profiles
-- This uses a direct check against the profiles table for admin status
CREATE POLICY "Admins can update all profiles" ON profiles
    FOR UPDATE
    USING (
        EXISTS (
            SELECT 1 FROM profiles
            WHERE profiles.id = auth.uid()
            AND profiles.is_admin = true
        )
    );

-- Create a policy for inserting profiles
-- This policy allows users to insert their own profile
CREATE POLICY "Profiles are insertable by owner" ON profiles
    FOR INSERT
    WITH CHECK (auth.uid() = id);

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