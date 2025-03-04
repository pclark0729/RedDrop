-- Script to check if onboarding_completed column exists in profiles table
-- and add it if it doesn't exist

-- Check if the column exists
DO $$
DECLARE
    column_exists BOOLEAN;
BEGIN
    -- Check if onboarding_completed column exists
    SELECT EXISTS (
        SELECT 1 
        FROM information_schema.columns 
        WHERE table_schema = 'public' 
        AND table_name = 'profiles' 
        AND column_name = 'onboarding_completed'
    ) INTO column_exists;
    
    -- If column doesn't exist, add it
    IF NOT column_exists THEN
        RAISE NOTICE 'Adding onboarding_completed column to profiles table';
        
        -- Add the column with a default value of false
        ALTER TABLE profiles 
        ADD COLUMN onboarding_completed BOOLEAN DEFAULT FALSE;
        
        -- Update existing records to have onboarding_completed = true if they have certain fields filled
        UPDATE profiles 
        SET onboarding_completed = TRUE 
        WHERE first_name IS NOT NULL 
        AND last_name IS NOT NULL 
        AND phone_number IS NOT NULL;
        
        RAISE NOTICE 'onboarding_completed column added successfully';
    ELSE
        RAISE NOTICE 'onboarding_completed column already exists';
    END IF;
END $$;

-- Show the current structure of the profiles table
SELECT column_name, data_type, is_nullable, column_default
FROM information_schema.columns
WHERE table_schema = 'public' 
AND table_name = 'profiles'
ORDER BY ordinal_position;

-- Count how many profiles have onboarding_completed = true
SELECT 
    COUNT(*) AS total_profiles,
    COUNT(*) FILTER (WHERE onboarding_completed = TRUE) AS completed_onboarding,
    COUNT(*) FILTER (WHERE onboarding_completed = FALSE OR onboarding_completed IS NULL) AS pending_onboarding
FROM profiles; 