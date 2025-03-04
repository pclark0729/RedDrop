-- RedDrop Database Schema Fix Script
-- This script will update the database schema to match the required structure
-- while preserving existing data where possible

-- First, let's check if the required extensions are installed
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "postgis";
CREATE EXTENSION IF NOT EXISTS "pg_trgm";

-- Create or update ENUM types
DO $$
BEGIN
    -- Check if blood_type enum exists and create if not
    IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'blood_type') THEN
        CREATE TYPE blood_type AS ENUM ('A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-');
    END IF;

    -- Check if urgency_level enum exists and create if not
    IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'urgency_level') THEN
        CREATE TYPE urgency_level AS ENUM ('Normal', 'Urgent', 'Critical');
    END IF;

    -- Check if request_status enum exists and create if not
    IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'request_status') THEN
        CREATE TYPE request_status AS ENUM ('Pending', 'Matching', 'Fulfilled', 'Cancelled');
    END IF;

    -- Check if match_status enum exists and create if not
    IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'match_status') THEN
        CREATE TYPE match_status AS ENUM ('Pending', 'Accepted', 'Declined', 'Completed', 'Cancelled');
    END IF;

    -- Check if camp_status enum exists and create if not
    IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'camp_status') THEN
        CREATE TYPE camp_status AS ENUM ('Upcoming', 'Active', 'Completed', 'Cancelled');
    END IF;

    -- Check if registration_status enum exists and create if not
    IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'registration_status') THEN
        CREATE TYPE registration_status AS ENUM ('Registered', 'Checked-in', 'Completed', 'Cancelled');
    END IF;

    -- Check if notification_type enum exists and create if not
    IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'notification_type') THEN
        CREATE TYPE notification_type AS ENUM ('Request', 'Match', 'Camp', 'System');
    END IF;

    -- Check if notification_channel enum exists and create if not
    IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'notification_channel') THEN
        CREATE TYPE notification_channel AS ENUM ('In-app', 'Email', 'SMS');
    END IF;

    -- Check if delivery_status enum exists and create if not
    IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'delivery_status') THEN
        CREATE TYPE delivery_status AS ENUM ('Pending', 'Sent', 'Failed');
    END IF;
END$$;

-- Update the profiles table if it exists, or create it if it doesn't
DO $$
BEGIN
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'profiles') THEN
        -- Table exists, add missing columns if needed
        BEGIN
            ALTER TABLE profiles ADD COLUMN IF NOT EXISTS is_donor BOOLEAN NOT NULL DEFAULT FALSE;
            ALTER TABLE profiles ADD COLUMN IF NOT EXISTS is_recipient BOOLEAN NOT NULL DEFAULT FALSE;
            ALTER TABLE profiles ADD COLUMN IF NOT EXISTS is_admin BOOLEAN NOT NULL DEFAULT FALSE;
            ALTER TABLE profiles ADD COLUMN IF NOT EXISTS date_of_birth DATE;
            ALTER TABLE profiles ADD COLUMN IF NOT EXISTS city TEXT;
            ALTER TABLE profiles ADD COLUMN IF NOT EXISTS state TEXT;
            ALTER TABLE profiles ADD COLUMN IF NOT EXISTS postal_code TEXT;
            ALTER TABLE profiles ADD COLUMN IF NOT EXISTS country TEXT;
            ALTER TABLE profiles ADD COLUMN IF NOT EXISTS latitude FLOAT8;
            ALTER TABLE profiles ADD COLUMN IF NOT EXISTS longitude FLOAT8;
            ALTER TABLE profiles ADD COLUMN IF NOT EXISTS avatar_url TEXT;
            ALTER TABLE profiles ADD COLUMN IF NOT EXISTS notification_preferences JSONB DEFAULT '{"email": true, "sms": false, "push": true}'::JSONB;
            ALTER TABLE profiles ADD COLUMN IF NOT EXISTS last_active TIMESTAMPTZ;
            ALTER TABLE profiles ADD COLUMN IF NOT EXISTS onboarding_completed BOOLEAN DEFAULT FALSE;
        EXCEPTION
            WHEN duplicate_column THEN
                -- Do nothing, column already exists
        END;
    ELSE
        -- Create the profiles table
        CREATE TABLE profiles (
            id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
            created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
            updated_at TIMESTAMPTZ DEFAULT NOW(),
            email TEXT UNIQUE NOT NULL,
            first_name TEXT,
            last_name TEXT,
            phone_number TEXT,
            date_of_birth DATE,
            address TEXT,
            city TEXT,
            state TEXT,
            postal_code TEXT,
            country TEXT,
            latitude FLOAT8,
            longitude FLOAT8,
            avatar_url TEXT,
            is_donor BOOLEAN NOT NULL DEFAULT FALSE,
            is_recipient BOOLEAN NOT NULL DEFAULT FALSE,
            is_admin BOOLEAN NOT NULL DEFAULT FALSE,
            notification_preferences JSONB DEFAULT '{"email": true, "sms": false, "push": true}'::JSONB,
            last_active TIMESTAMPTZ,
            emergency_contact_name TEXT,
            emergency_contact_phone TEXT,
            medical_conditions TEXT,
            allergies TEXT,
            medications TEXT,
            donation_frequency TEXT DEFAULT 'occasional',
            onboarding_completed BOOLEAN DEFAULT FALSE
        );
    END IF;
END$$;

-- Create donor_profiles table if it doesn't exist
CREATE TABLE IF NOT EXISTS donor_profiles (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    profile_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    blood_type blood_type,
    is_available BOOLEAN DEFAULT TRUE,
    is_verified BOOLEAN DEFAULT FALSE,
    last_donation_date TIMESTAMPTZ,
    donation_count INTEGER DEFAULT 0,
    availability_radius_km INTEGER DEFAULT 50,
    preferred_donation_center TEXT,
    health_conditions TEXT,
    medications TEXT,
    allergies TEXT,
    eligibility_status TEXT DEFAULT 'eligible',
    eligibility_notes TEXT,
    UNIQUE(profile_id)
);

-- Create blood_requests table if it doesn't exist
CREATE TABLE IF NOT EXISTS blood_requests (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    requester_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    patient_name TEXT NOT NULL,
    blood_type blood_type NOT NULL,
    units_needed INTEGER NOT NULL DEFAULT 1,
    hospital_name TEXT NOT NULL,
    hospital_address TEXT,
    hospital_city TEXT,
    hospital_state TEXT,
    hospital_latitude FLOAT8,
    hospital_longitude FLOAT8,
    urgency_level urgency_level NOT NULL DEFAULT 'Normal',
    reason TEXT,
    status request_status NOT NULL DEFAULT 'Pending',
    required_by_date TIMESTAMPTZ,
    fulfilled_date TIMESTAMPTZ,
    notes TEXT
);

-- Create donation_matches table if it doesn't exist
CREATE TABLE IF NOT EXISTS donation_matches (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    request_id UUID NOT NULL REFERENCES blood_requests(id) ON DELETE CASCADE,
    donor_id UUID NOT NULL REFERENCES donor_profiles(id) ON DELETE CASCADE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    status match_status NOT NULL DEFAULT 'Pending',
    response_date TIMESTAMPTZ,
    scheduled_date TIMESTAMPTZ,
    completed_date TIMESTAMPTZ,
    notes TEXT,
    UNIQUE(request_id, donor_id)
);

-- Create donation_camps table if it doesn't exist
CREATE TABLE IF NOT EXISTS donation_camps (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    name TEXT NOT NULL,
    description TEXT,
    organizer_id UUID REFERENCES profiles(id),
    start_date TIMESTAMPTZ NOT NULL,
    end_date TIMESTAMPTZ NOT NULL,
    location TEXT NOT NULL,
    address TEXT,
    city TEXT,
    state TEXT,
    latitude FLOAT8,
    longitude FLOAT8,
    status camp_status NOT NULL DEFAULT 'Upcoming',
    total_slots INTEGER NOT NULL DEFAULT 50,
    available_slots INTEGER NOT NULL DEFAULT 50,
    blood_types_needed TEXT[],
    contact_email TEXT,
    contact_phone TEXT,
    additional_info TEXT
);

-- Create camp_registrations table if it doesn't exist
CREATE TABLE IF NOT EXISTS camp_registrations (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    camp_id UUID NOT NULL REFERENCES donation_camps(id) ON DELETE CASCADE,
    donor_id UUID NOT NULL REFERENCES donor_profiles(id) ON DELETE CASCADE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    scheduled_time TIMESTAMPTZ,
    status registration_status NOT NULL DEFAULT 'Registered',
    check_in_time TIMESTAMPTZ,
    completion_time TIMESTAMPTZ,
    notes TEXT,
    UNIQUE(camp_id, donor_id)
);

-- Create notifications table if it doesn't exist
CREATE TABLE IF NOT EXISTS notifications (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    recipient_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    type notification_type NOT NULL,
    title TEXT NOT NULL,
    message TEXT NOT NULL,
    is_read BOOLEAN NOT NULL DEFAULT FALSE,
    read_at TIMESTAMPTZ,
    channel notification_channel NOT NULL DEFAULT 'In-app',
    delivery_status delivery_status NOT NULL DEFAULT 'Pending',
    related_entity_id UUID,
    related_entity_type TEXT,
    action_url TEXT,
    metadata JSONB
);

-- Create donations table if it doesn't exist
CREATE TABLE IF NOT EXISTS donations (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    donor_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
    blood_drive_id UUID REFERENCES donation_camps(id),
    donation_date TIMESTAMPTZ NOT NULL,
    blood_type TEXT,
    amount_ml INTEGER DEFAULT 450,
    location TEXT,
    status TEXT DEFAULT 'completed',
    notes TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create donation_appointments table if it doesn't exist
CREATE TABLE IF NOT EXISTS donation_appointments (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    donor_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
    blood_drive_id UUID REFERENCES donation_camps(id),
    appointment_date TIMESTAMPTZ NOT NULL,
    status TEXT DEFAULT 'scheduled',
    notes TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Update timestamp function
CREATE OR REPLACE FUNCTION update_modified_column()
RETURNS TRIGGER AS $$
BEGIN
   NEW.updated_at = NOW();
   RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create triggers for updated_at timestamps
DO $$
BEGIN
    -- Drop existing triggers if they exist
    DROP TRIGGER IF EXISTS set_timestamp_profiles ON profiles;
    DROP TRIGGER IF EXISTS set_timestamp_donor_profiles ON donor_profiles;
    DROP TRIGGER IF EXISTS set_timestamp_blood_requests ON blood_requests;
    DROP TRIGGER IF EXISTS set_timestamp_donation_matches ON donation_matches;
    DROP TRIGGER IF EXISTS set_timestamp_donation_camps ON donation_camps;
    DROP TRIGGER IF EXISTS set_timestamp_camp_registrations ON camp_registrations;
    DROP TRIGGER IF EXISTS set_timestamp_donations ON donations;
    DROP TRIGGER IF EXISTS set_timestamp_donation_appointments ON donation_appointments;
    
    -- Create new triggers
    CREATE TRIGGER set_timestamp_profiles
    BEFORE UPDATE ON profiles
    FOR EACH ROW
    EXECUTE FUNCTION update_modified_column();
    
    CREATE TRIGGER set_timestamp_donor_profiles
    BEFORE UPDATE ON donor_profiles
    FOR EACH ROW
    EXECUTE FUNCTION update_modified_column();
    
    CREATE TRIGGER set_timestamp_blood_requests
    BEFORE UPDATE ON blood_requests
    FOR EACH ROW
    EXECUTE FUNCTION update_modified_column();
    
    CREATE TRIGGER set_timestamp_donation_matches
    BEFORE UPDATE ON donation_matches
    FOR EACH ROW
    EXECUTE FUNCTION update_modified_column();
    
    CREATE TRIGGER set_timestamp_donation_camps
    BEFORE UPDATE ON donation_camps
    FOR EACH ROW
    EXECUTE FUNCTION update_modified_column();
    
    CREATE TRIGGER set_timestamp_camp_registrations
    BEFORE UPDATE ON camp_registrations
    FOR EACH ROW
    EXECUTE FUNCTION update_modified_column();
    
    CREATE TRIGGER set_timestamp_donations
    BEFORE UPDATE ON donations
    FOR EACH ROW
    EXECUTE FUNCTION update_modified_column();
    
    CREATE TRIGGER set_timestamp_donation_appointments
    BEFORE UPDATE ON donation_appointments
    FOR EACH ROW
    EXECUTE FUNCTION update_modified_column();
END$$;

-- Fix the handle_new_user function to match the Supabase schema
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
        onboarding_completed,
        created_at, 
        updated_at
    )
    VALUES (
        new.id, 
        new.email, 
        new.raw_user_meta_data->>'first_name',
        new.raw_user_meta_data->>'last_name',
        FALSE, 
        FALSE, 
        FALSE,
        FALSE,
        NOW(), 
        NOW()
    );
    RETURN new;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Drop the existing trigger if it exists
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;

-- Recreate the trigger
CREATE TRIGGER on_auth_user_created
    AFTER INSERT ON auth.users
    FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_profiles_is_donor ON profiles(is_donor) WHERE is_donor = TRUE;
CREATE INDEX IF NOT EXISTS idx_profiles_is_recipient ON profiles(is_recipient) WHERE is_recipient = TRUE;
CREATE INDEX IF NOT EXISTS idx_donor_profiles_blood_type ON donor_profiles(blood_type);
CREATE INDEX IF NOT EXISTS idx_donor_profiles_is_available ON donor_profiles(is_available) WHERE is_available = TRUE;
CREATE INDEX IF NOT EXISTS idx_blood_requests_status ON blood_requests(status);
CREATE INDEX IF NOT EXISTS idx_blood_requests_blood_type ON blood_requests(blood_type);
CREATE INDEX IF NOT EXISTS idx_donation_matches_status ON donation_matches(status);
CREATE INDEX IF NOT EXISTS idx_donation_camps_status ON donation_camps(status);
CREATE INDEX IF NOT EXISTS idx_notifications_recipient_is_read ON notifications(recipient_id, is_read) WHERE is_read = FALSE;

-- Add RLS policies for security
-- Profiles: Users can read their own profile
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own profile"
  ON profiles FOR SELECT
  USING (auth.uid() = id);

CREATE POLICY "Users can update their own profile"
  ON profiles FOR UPDATE
  USING (auth.uid() = id);

-- Donor profiles: Users can read their own donor profile
ALTER TABLE donor_profiles ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own donor profile"
  ON donor_profiles FOR SELECT
  USING (EXISTS (
    SELECT 1 FROM profiles
    WHERE profiles.id = donor_profiles.profile_id
    AND profiles.id = auth.uid()
  ));

CREATE POLICY "Users can update their own donor profile"
  ON donor_profiles FOR UPDATE
  USING (EXISTS (
    SELECT 1 FROM profiles
    WHERE profiles.id = donor_profiles.profile_id
    AND profiles.id = auth.uid()
  ));

-- Blood requests: Users can read their own requests
ALTER TABLE blood_requests ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own blood requests"
  ON blood_requests FOR SELECT
  USING (requester_id = auth.uid());

CREATE POLICY "Users can update their own blood requests"
  ON blood_requests FOR UPDATE
  USING (requester_id = auth.uid());

-- Notifications: Users can read their own notifications
ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own notifications"
  ON notifications FOR SELECT
  USING (recipient_id = auth.uid());

CREATE POLICY "Users can update their own notifications"
  ON notifications FOR UPDATE
  USING (recipient_id = auth.uid());

-- Donations: Users can read their own donations
ALTER TABLE donations ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own donations"
  ON donations FOR SELECT
  USING (donor_id = auth.uid());

-- Donation appointments: Users can read their own appointments
ALTER TABLE donation_appointments ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own appointments"
  ON donation_appointments FOR SELECT
  USING (donor_id = auth.uid());

CREATE POLICY "Users can update their own appointments"
  ON donation_appointments FOR UPDATE
  USING (donor_id = auth.uid());

-- Add public read policies for donation camps
ALTER TABLE donation_camps ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view donation camps"
  ON donation_camps FOR SELECT
  USING (true);

-- Add public read policies for camp registrations
ALTER TABLE camp_registrations ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own camp registrations"
  ON camp_registrations FOR SELECT
  USING (EXISTS (
    SELECT 1 FROM donor_profiles
    WHERE donor_profiles.id = camp_registrations.donor_id
    AND donor_profiles.profile_id = auth.uid()
  ));

CREATE POLICY "Users can update their own camp registrations"
  ON camp_registrations FOR UPDATE
  USING (EXISTS (
    SELECT 1 FROM donor_profiles
    WHERE donor_profiles.id = camp_registrations.donor_id
    AND donor_profiles.profile_id = auth.uid()
  ));

-- Add public read policies for donation matches
ALTER TABLE donation_matches ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own donation matches"
  ON donation_matches FOR SELECT
  USING (EXISTS (
    SELECT 1 FROM donor_profiles
    WHERE donor_profiles.id = donation_matches.donor_id
    AND donor_profiles.profile_id = auth.uid()
  ) OR EXISTS (
    SELECT 1 FROM blood_requests
    WHERE blood_requests.id = donation_matches.request_id
    AND blood_requests.requester_id = auth.uid()
  ));

CREATE POLICY "Users can update their own donation matches"
  ON donation_matches FOR UPDATE
  USING (EXISTS (
    SELECT 1 FROM donor_profiles
    WHERE donor_profiles.id = donation_matches.donor_id
    AND donor_profiles.profile_id = auth.uid()
  ));

-- Add a function to find compatible donors
CREATE OR REPLACE FUNCTION find_compatible_donors(
  p_request_id UUID,
  p_max_distance INTEGER DEFAULT 50,
  p_max_results INTEGER DEFAULT 20,
  p_include_unavailable BOOLEAN DEFAULT FALSE
)
RETURNS TABLE (
  matches JSON,
  total_count INTEGER
) AS $$
DECLARE
  v_request_blood_type blood_type;
  v_request_latitude FLOAT8;
  v_request_longitude FLOAT8;
  v_compatible_donors JSON;
  v_total_count INTEGER;
BEGIN
  -- Get request details
  SELECT 
    br.blood_type, 
    br.hospital_latitude, 
    br.hospital_longitude
  INTO 
    v_request_blood_type, 
    v_request_latitude, 
    v_request_longitude
  FROM blood_requests br
  WHERE br.id = p_request_id;
  
  -- Find compatible donors
  WITH compatible_donors AS (
    SELECT 
      dp.id AS donor_id,
      dp.profile_id,
      p.first_name,
      p.last_name,
      dp.blood_type,
      ST_DistanceSphere(
        ST_SetSRID(ST_MakePoint(p.longitude, p.latitude), 4326),
        ST_SetSRID(ST_MakePoint(v_request_longitude, v_request_latitude), 4326)
      ) / 1000 AS distance_km,
      dp.last_donation_date,
      dp.donation_count,
      dp.is_available
    FROM donor_profiles dp
    JOIN profiles p ON dp.profile_id = p.id
    WHERE 
      (dp.is_available = TRUE OR p_include_unavailable = TRUE) AND
      dp.is_verified = TRUE AND
      p.latitude IS NOT NULL AND
      p.longitude IS NOT NULL AND
      (
        -- Blood type compatibility logic
        (v_request_blood_type = 'A+' AND dp.blood_type IN ('A+', 'A-', 'O+', 'O-')) OR
        (v_request_blood_type = 'A-' AND dp.blood_type IN ('A-', 'O-')) OR
        (v_request_blood_type = 'B+' AND dp.blood_type IN ('B+', 'B-', 'O+', 'O-')) OR
        (v_request_blood_type = 'B-' AND dp.blood_type IN ('B-', 'O-')) OR
        (v_request_blood_type = 'AB+' AND dp.blood_type IN ('A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-')) OR
        (v_request_blood_type = 'AB-' AND dp.blood_type IN ('A-', 'B-', 'AB-', 'O-')) OR
        (v_request_blood_type = 'O+' AND dp.blood_type IN ('O+', 'O-')) OR
        (v_request_blood_type = 'O-' AND dp.blood_type = 'O-')
      ) AND
      -- Check if donor is within the specified radius
      ST_DistanceSphere(
        ST_SetSRID(ST_MakePoint(p.longitude, p.latitude), 4326),
        ST_SetSRID(ST_MakePoint(v_request_longitude, v_request_latitude), 4326)
      ) / 1000 <= p_max_distance AND
      -- Ensure donor hasn't donated in the last 56 days (8 weeks)
      (dp.last_donation_date IS NULL OR dp.last_donation_date < NOW() - INTERVAL '56 days')
  )
  SELECT 
    json_agg(cd.*) AS matches,
    COUNT(*) AS total_count
  INTO 
    v_compatible_donors,
    v_total_count
  FROM (
    SELECT * FROM compatible_donors
    ORDER BY 
      is_available DESC,
      distance_km ASC
    LIMIT p_max_results
  ) cd;
  
  RETURN QUERY SELECT v_compatible_donors, v_total_count;
END;
$$ LANGUAGE plpgsql; 