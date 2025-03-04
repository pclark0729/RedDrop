-- Add onboarding_completed column to profiles table
-- This script adds the missing onboarding_completed column to the profiles table

-- First, check if the column already exists to avoid errors
DO $$
BEGIN
    -- Check if the column already exists
    IF NOT EXISTS (
        SELECT 1
        FROM information_schema.columns
        WHERE table_name = 'profiles'
        AND column_name = 'onboarding_completed'
    ) THEN
        -- Add the column with a default value of false
        ALTER TABLE profiles
        ADD COLUMN onboarding_completed BOOLEAN DEFAULT FALSE;
        
        RAISE NOTICE 'Added onboarding_completed column to profiles table';
    ELSE
        RAISE NOTICE 'Column onboarding_completed already exists in profiles table';
    END IF;
END $$;

-- Update existing rows to have onboarding_completed = false
-- This ensures all existing profiles have the correct default value
UPDATE profiles
SET onboarding_completed = FALSE
WHERE onboarding_completed IS NULL;

-- Verify the column was added
SELECT 
    column_name, 
    data_type, 
    is_nullable, 
    column_default
FROM 
    information_schema.columns
WHERE 
    table_name = 'profiles' 
    AND column_name = 'onboarding_completed';

-- Show a sample of profiles with the new column
SELECT 
    id, 
    email, 
    first_name, 
    last_name, 
    onboarding_completed
FROM 
    profiles
LIMIT 5; 