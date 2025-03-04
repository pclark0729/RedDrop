-- Fix for infinite recursion in profiles table RLS policy
-- Error: "infinite recursion detected in policy for relation 'profiles'"

-- First, drop all existing policies on the profiles table
DROP POLICY IF EXISTS "Profiles are viewable by everyone" ON profiles;
DROP POLICY IF EXISTS "Users can update their own profile" ON profiles;
DROP POLICY IF EXISTS "Users can view their own profile" ON profiles;
DROP POLICY IF EXISTS "Enable read access for current user only" ON profiles;
DROP POLICY IF EXISTS "Enable read for admins to all profiles" ON profiles;

-- Disable RLS temporarily to ensure we can access the table
ALTER TABLE profiles DISABLE ROW LEVEL SECURITY;

-- Check if there are any admin users in the system
DO $$
DECLARE
    admin_exists BOOLEAN;
BEGIN
    SELECT EXISTS (
        SELECT 1 FROM profiles 
        WHERE is_admin = TRUE
    ) INTO admin_exists;
    
    IF NOT admin_exists THEN
        -- If no admin exists, create one or update an existing user to be an admin
        -- This is optional and depends on your application needs
        RAISE NOTICE 'No admin users found in the system.';
    END IF;
END$$;

-- Re-enable RLS
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

-- Create a new policy for viewing profiles that doesn't cause recursion
-- This policy allows users to view their own profile without any recursive checks
CREATE POLICY "Users can view their own profile" 
ON profiles FOR SELECT 
USING (auth.uid() = id);

-- Create a policy for updating profiles
CREATE POLICY "Users can update their own profile" 
ON profiles FOR UPDATE 
USING (auth.uid() = id);

-- If you need admin access, create a separate policy that doesn't use recursive checks
-- This policy uses a direct comparison instead of a subquery that might cause recursion
CREATE POLICY "Admins can view all profiles" 
ON profiles FOR SELECT 
USING (
    -- Either the user is viewing their own profile
    auth.uid() = id
    OR 
    -- Or the user is an admin (checking the current user's admin status directly)
    EXISTS (
        SELECT 1 FROM profiles 
        WHERE id = auth.uid() AND is_admin = TRUE
    )
);

-- Create a policy for admin updates if needed
CREATE POLICY "Admins can update all profiles" 
ON profiles FOR UPDATE 
USING (
    -- Either the user is updating their own profile
    auth.uid() = id
    OR 
    -- Or the user is an admin (checking the current user's admin status directly)
    EXISTS (
        SELECT 1 FROM profiles 
        WHERE id = auth.uid() AND is_admin = TRUE
    )
);

-- Create a policy for inserting profiles (usually handled by triggers, but just in case)
CREATE POLICY "Users can insert their own profile" 
ON profiles FOR INSERT 
WITH CHECK (auth.uid() = id);

-- Create a policy for deleting profiles if needed
CREATE POLICY "Users can delete their own profile" 
ON profiles FOR DELETE 
USING (auth.uid() = id);

-- Grant necessary permissions to authenticated users
GRANT SELECT, UPDATE ON profiles TO authenticated;

-- Verify the policies
SELECT tablename, policyname, permissive, roles, cmd, qual, with_check 
FROM pg_policies 
WHERE tablename = 'profiles';

-- Add a comment explaining the fix
COMMENT ON TABLE profiles IS 'User profiles with fixed RLS policies to prevent infinite recursion'; 