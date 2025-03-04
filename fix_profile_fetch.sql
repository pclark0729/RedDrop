-- Script to diagnose and fix issues with fetching user profiles

-- 1. Check if profiles table exists and its structure
SELECT EXISTS (
   SELECT FROM information_schema.tables 
   WHERE table_schema = 'public' 
   AND table_name = 'profiles'
) AS profiles_table_exists;

-- 2. Check profiles table structure
SELECT column_name, data_type, is_nullable 
FROM information_schema.columns 
WHERE table_schema = 'public' 
AND table_name = 'profiles'
ORDER BY ordinal_position;

-- 3. Check if RLS is enabled on profiles table
SELECT relname, relrowsecurity 
FROM pg_class 
WHERE relname = 'profiles';

-- 4. Check existing RLS policies on profiles table
SELECT polname, polcmd, polpermissive, polroles::text, polqual::text
FROM pg_policy
WHERE polrelid = 'public.profiles'::regclass;

-- 5. Check for any existing profiles in the table
SELECT COUNT(*) FROM profiles;

-- 6. Check for any auth.users without corresponding profiles
SELECT au.id, au.email, au.created_at
FROM auth.users au
LEFT JOIN profiles p ON au.id = p.id
WHERE p.id IS NULL;

-- 7. Fix missing profiles by creating them for existing users
INSERT INTO profiles (id, email, created_at, updated_at)
SELECT au.id, au.email, NOW(), NOW()
FROM auth.users au
LEFT JOIN profiles p ON au.id = p.id
WHERE p.id IS NULL;

-- 8. Ensure the handle_new_user function is properly defined
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, email, created_at, updated_at)
  VALUES (NEW.id, NEW.email, NOW(), NOW());
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 9. Ensure the trigger is properly set up with error handling
DO $$
BEGIN
    BEGIN
        DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
    EXCEPTION WHEN OTHERS THEN
        RAISE NOTICE 'Could not drop trigger: %', SQLERRM;
    END;
    
    BEGIN
        CREATE TRIGGER on_auth_user_created
        AFTER INSERT ON auth.users
        FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();
    EXCEPTION WHEN duplicate_object THEN
        RAISE NOTICE 'Trigger already exists, skipping creation';
    END;
END
$$;

-- 10. Ensure proper RLS policies are in place for profiles
DO $$
BEGIN
    -- Drop existing policies if they exist
    DROP POLICY IF EXISTS profiles_select_own ON profiles;
    DROP POLICY IF EXISTS profiles_select_public ON profiles;
    DROP POLICY IF EXISTS profiles_insert_own ON profiles;
    DROP POLICY IF EXISTS profiles_update_own ON profiles;
    DROP POLICY IF EXISTS profiles_admin_all ON profiles;
    
    -- Create policies
    CREATE POLICY profiles_select_own ON profiles FOR SELECT 
      USING (auth.uid() = id);
    
    CREATE POLICY profiles_select_public ON profiles FOR SELECT 
      USING (is_donor = TRUE);
    
    CREATE POLICY profiles_insert_own ON profiles FOR INSERT 
      WITH CHECK (auth.uid() = id);
    
    CREATE POLICY profiles_update_own ON profiles FOR UPDATE 
      USING (auth.uid() = id) 
      WITH CHECK (auth.uid() = id);
      
    CREATE POLICY profiles_admin_all ON profiles FOR ALL
      USING (EXISTS (SELECT 1 FROM profiles WHERE profiles.id = auth.uid() AND profiles.is_admin = TRUE));
END
$$;

-- 11. Enable RLS on profiles table
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

-- 12. Grant necessary permissions
GRANT ALL ON profiles TO authenticated;
GRANT ALL ON profiles TO service_role;

-- 13. Check for any errors in recent database operations
SELECT * FROM pg_stat_activity 
WHERE state = 'active' 
AND query LIKE '%profiles%'
AND query NOT LIKE '%pg_stat_activity%';

-- 14. Check for any locks on the profiles table
SELECT relation::regclass, mode, granted
FROM pg_locks l
JOIN pg_class c ON l.relation = c.oid
WHERE relname = 'profiles';

-- 15. Analyze the profiles table to update statistics
ANALYZE profiles; 