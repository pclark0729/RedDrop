-- RedDrop Blood Donation Management System - Schema Update Script
-- This script updates the existing schema to match the current implementation
-- without dropping tables or losing data

-- First, ensure all required extensions are available
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "postgis";
CREATE EXTENSION IF NOT EXISTS "pg_trgm";

-- Update the handle_new_user function to match the current implementation
CREATE OR REPLACE FUNCTION public.handle_new_user() 
RETURNS TRIGGER AS $$
BEGIN
    INSERT INTO public.profiles (
        id, 
        email, 
        first_name,
        last_name,
        is_donor, 
        is_recipient, 
        is_admin,
        created_at, 
        updated_at,
        onboarding_completed
    )
    VALUES (
        new.id, 
        new.email, 
        new.raw_user_meta_data->>'first_name',
        new.raw_user_meta_data->>'last_name',
        FALSE, 
        FALSE, 
        FALSE,
        NOW(), 
        NOW(),
        FALSE
    );
    RETURN new;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Ensure the trigger exists
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
    AFTER INSERT ON auth.users
    FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Add onboarding_completed column to profiles if it doesn't exist
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 
        FROM information_schema.columns 
        WHERE table_name = 'profiles' AND column_name = 'onboarding_completed'
    ) THEN
        ALTER TABLE profiles ADD COLUMN onboarding_completed BOOLEAN DEFAULT FALSE;
    END IF;
END $$;

-- Function to safely create policies (only if they don't exist)
CREATE OR REPLACE FUNCTION create_policy_if_not_exists(
    policy_name TEXT,
    table_name TEXT,
    command TEXT,
    using_expr TEXT DEFAULT NULL,
    check_expr TEXT DEFAULT NULL,
    roles TEXT[] DEFAULT NULL
) RETURNS VOID AS $$
DECLARE
    policy_exists BOOLEAN;
    sql_command TEXT;
BEGIN
    -- Check if policy exists
    SELECT EXISTS (
        SELECT 1 FROM pg_policies 
        WHERE policyname = policy_name AND tablename = table_name
    ) INTO policy_exists;
    
    -- If policy doesn't exist, create it
    IF NOT policy_exists THEN
        sql_command := format('CREATE POLICY %I ON %I FOR %s', policy_name, table_name, command);
        
        IF using_expr IS NOT NULL THEN
            sql_command := sql_command || format(' USING (%s)', using_expr);
        END IF;
        
        IF check_expr IS NOT NULL THEN
            sql_command := sql_command || format(' WITH CHECK (%s)', check_expr);
        END IF;
        
        IF roles IS NOT NULL AND array_length(roles, 1) > 0 THEN
            sql_command := sql_command || format(' TO %s', array_to_string(roles, ', '));
        END IF;
        
        EXECUTE sql_command;
    END IF;
END;
$$ LANGUAGE plpgsql;

-- Function to drop all policies for a table
CREATE OR REPLACE FUNCTION drop_all_policies_for_table(table_name TEXT) RETURNS VOID AS $$
DECLARE
    policy_rec RECORD;
BEGIN
    FOR policy_rec IN 
        SELECT policyname 
        FROM pg_policies 
        WHERE tablename = table_name
    LOOP
        EXECUTE format('DROP POLICY IF EXISTS %I ON %I', policy_rec.policyname, table_name);
    END LOOP;
END;
$$ LANGUAGE plpgsql;

-- Drop all existing policies
SELECT drop_all_policies_for_table('profiles');
SELECT drop_all_policies_for_table('donor_profiles');
SELECT drop_all_policies_for_table('blood_requests');
SELECT drop_all_policies_for_table('donation_matches');
SELECT drop_all_policies_for_table('donation_camps');
SELECT drop_all_policies_for_table('camp_registrations');
SELECT drop_all_policies_for_table('notifications');
SELECT drop_all_policies_for_table('donation_history');

-- Create new policies for all tables
DO $$
BEGIN
    -- Create new policies for profiles
    PERFORM create_policy_if_not_exists(
        'Users can view their own profile',
        'profiles',
        'SELECT',
        'auth.uid() = id'
    );

    PERFORM create_policy_if_not_exists(
        'Users can update their own profile',
        'profiles',
        'UPDATE',
        'auth.uid() = id'
    );

    PERFORM create_policy_if_not_exists(
        'Admins can view all profiles',
        'profiles',
        'SELECT',
        'auth.uid() = id OR EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND is_admin = TRUE)'
    );

    PERFORM create_policy_if_not_exists(
        'Admins can update all profiles',
        'profiles',
        'UPDATE',
        'auth.uid() = id OR EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND is_admin = TRUE)'
    );

    PERFORM create_policy_if_not_exists(
        'Users can insert their own profile',
        'profiles',
        'INSERT',
        NULL,
        'auth.uid() = id'
    );

    PERFORM create_policy_if_not_exists(
        'Users can delete their own profile',
        'profiles',
        'DELETE',
        'auth.uid() = id'
    );

    -- Create new policies for donor_profiles
    PERFORM create_policy_if_not_exists(
        'Everyone can view verified donor profiles',
        'donor_profiles',
        'SELECT',
        'is_verified = TRUE'
    );

    PERFORM create_policy_if_not_exists(
        'Users can view their own donor profile',
        'donor_profiles',
        'SELECT',
        'EXISTS (SELECT 1 FROM profiles p WHERE p.id = profile_id AND p.id = auth.uid())'
    );

    PERFORM create_policy_if_not_exists(
        'Users can update their own donor profile',
        'donor_profiles',
        'UPDATE',
        'EXISTS (SELECT 1 FROM profiles p WHERE p.id = profile_id AND p.id = auth.uid())'
    );

    PERFORM create_policy_if_not_exists(
        'Users can insert their own donor profile',
        'donor_profiles',
        'INSERT',
        NULL,
        'profile_id = auth.uid()'
    );

    PERFORM create_policy_if_not_exists(
        'Admins can manage all donor profiles',
        'donor_profiles',
        'ALL',
        'EXISTS (SELECT 1 FROM profiles p WHERE p.id = auth.uid() AND p.is_admin = TRUE)'
    );

    -- Create new policies for blood_requests
    PERFORM create_policy_if_not_exists(
        'Everyone can view active blood requests',
        'blood_requests',
        'SELECT',
        'status IN (''Pending'', ''Matching'')'
    );

    PERFORM create_policy_if_not_exists(
        'Users can view all their own requests',
        'blood_requests',
        'SELECT',
        'requester_id = auth.uid()'
    );

    PERFORM create_policy_if_not_exists(
        'Users can insert their own requests',
        'blood_requests',
        'INSERT',
        NULL,
        'requester_id = auth.uid()'
    );

    PERFORM create_policy_if_not_exists(
        'Users can update their own requests',
        'blood_requests',
        'UPDATE',
        'requester_id = auth.uid()'
    );

    PERFORM create_policy_if_not_exists(
        'Admins can manage all blood requests',
        'blood_requests',
        'ALL',
        'EXISTS (SELECT 1 FROM profiles p WHERE p.id = auth.uid() AND p.is_admin = TRUE)'
    );

    -- Create new policies for donation_matches
    PERFORM create_policy_if_not_exists(
        'Donors can view matches they are part of',
        'donation_matches',
        'SELECT',
        'EXISTS (SELECT 1 FROM donor_profiles dp WHERE dp.id = donor_id AND dp.profile_id = auth.uid())'
    );

    PERFORM create_policy_if_not_exists(
        'Requesters can view matches for their requests',
        'donation_matches',
        'SELECT',
        'EXISTS (SELECT 1 FROM blood_requests br WHERE br.id = request_id AND br.requester_id = auth.uid())'
    );

    PERFORM create_policy_if_not_exists(
        'Donors can update matches they are part of',
        'donation_matches',
        'UPDATE',
        'EXISTS (SELECT 1 FROM donor_profiles dp WHERE dp.id = donor_id AND dp.profile_id = auth.uid())'
    );

    PERFORM create_policy_if_not_exists(
        'Admins can manage all donation matches',
        'donation_matches',
        'ALL',
        'EXISTS (SELECT 1 FROM profiles p WHERE p.id = auth.uid() AND p.is_admin = TRUE)'
    );

    -- Create new policies for donation_camps
    PERFORM create_policy_if_not_exists(
        'Everyone can view active and upcoming camps',
        'donation_camps',
        'SELECT',
        'status IN (''Upcoming'', ''Active'')'
    );

    PERFORM create_policy_if_not_exists(
        'Organizers can view all their camps',
        'donation_camps',
        'SELECT',
        'organizer_id = auth.uid()'
    );

    PERFORM create_policy_if_not_exists(
        'Organizers can insert their own camps',
        'donation_camps',
        'INSERT',
        NULL,
        'organizer_id = auth.uid()'
    );

    PERFORM create_policy_if_not_exists(
        'Organizers can update their own camps',
        'donation_camps',
        'UPDATE',
        'organizer_id = auth.uid()'
    );

    PERFORM create_policy_if_not_exists(
        'Admins can manage all donation camps',
        'donation_camps',
        'ALL',
        'EXISTS (SELECT 1 FROM profiles p WHERE p.id = auth.uid() AND p.is_admin = TRUE)'
    );

    -- Create new policies for camp_registrations
    PERFORM create_policy_if_not_exists(
        'Camp organizers can view registrations for their camps',
        'camp_registrations',
        'SELECT',
        'EXISTS (SELECT 1 FROM donation_camps dc WHERE dc.id = camp_id AND dc.organizer_id = auth.uid())'
    );

    PERFORM create_policy_if_not_exists(
        'Donors can view their own registrations',
        'camp_registrations',
        'SELECT',
        'EXISTS (SELECT 1 FROM donor_profiles dp WHERE dp.id = donor_id AND dp.profile_id = auth.uid())'
    );

    PERFORM create_policy_if_not_exists(
        'Donors can insert their own registrations',
        'camp_registrations',
        'INSERT',
        NULL,
        'EXISTS (SELECT 1 FROM donor_profiles dp WHERE dp.id = donor_id AND dp.profile_id = auth.uid())'
    );

    PERFORM create_policy_if_not_exists(
        'Donors can update their own registrations',
        'camp_registrations',
        'UPDATE',
        'EXISTS (SELECT 1 FROM donor_profiles dp WHERE dp.id = donor_id AND dp.profile_id = auth.uid())'
    );

    PERFORM create_policy_if_not_exists(
        'Admins can manage all camp registrations',
        'camp_registrations',
        'ALL',
        'EXISTS (SELECT 1 FROM profiles p WHERE p.id = auth.uid() AND p.is_admin = TRUE)'
    );

    -- Create new policies for notifications
    PERFORM create_policy_if_not_exists(
        'Users can view their own notifications',
        'notifications',
        'SELECT',
        'recipient_id = auth.uid()'
    );

    PERFORM create_policy_if_not_exists(
        'Users can update their own notifications',
        'notifications',
        'UPDATE',
        'recipient_id = auth.uid()'
    );

    PERFORM create_policy_if_not_exists(
        'Admins can manage all notifications',
        'notifications',
        'ALL',
        'EXISTS (SELECT 1 FROM profiles p WHERE p.id = auth.uid() AND p.is_admin = TRUE)'
    );

    -- Create new policies for donation_history
    PERFORM create_policy_if_not_exists(
        'Donors can view their own donation history',
        'donation_history',
        'SELECT',
        'EXISTS (SELECT 1 FROM donor_profiles dp WHERE dp.id = donor_id AND dp.profile_id = auth.uid())'
    );

    PERFORM create_policy_if_not_exists(
        'Requesters can view donation history related to their requests',
        'donation_history',
        'SELECT',
        'EXISTS (SELECT 1 FROM blood_requests br WHERE br.id = request_id AND br.requester_id = auth.uid())'
    );

    PERFORM create_policy_if_not_exists(
        'Admins can manage all donation history',
        'donation_history',
        'ALL',
        'EXISTS (SELECT 1 FROM profiles p WHERE p.id = auth.uid() AND p.is_admin = TRUE)'
    );
END $$;

-- Grant necessary permissions to authenticated users
GRANT SELECT, UPDATE ON profiles TO authenticated;
GRANT SELECT, INSERT, UPDATE ON donor_profiles TO authenticated;
GRANT SELECT, INSERT, UPDATE ON blood_requests TO authenticated;
GRANT SELECT, INSERT, UPDATE ON donation_matches TO authenticated;
GRANT SELECT, INSERT, UPDATE ON donation_camps TO authenticated;
GRANT SELECT, INSERT, UPDATE ON camp_registrations TO authenticated;
GRANT SELECT, UPDATE ON notifications TO authenticated;
GRANT SELECT ON donation_history TO authenticated;

-- Verify the policies
SELECT tablename, policyname, permissive, roles, cmd, qual, with_check 
FROM pg_policies 
WHERE tablename IN (
    'profiles', 
    'donor_profiles', 
    'blood_requests', 
    'donation_matches', 
    'donation_camps', 
    'camp_registrations', 
    'notifications', 
    'donation_history'
);

-- Add a comment explaining the update
COMMENT ON DATABASE postgres IS 'RedDrop Blood Donation Management System - Updated Schema'; 