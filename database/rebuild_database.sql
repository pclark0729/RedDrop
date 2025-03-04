-- RedDrop Database Rebuild Script
-- This script will drop all existing tables and recreate the database from scratch
-- based on the schema defined in context.md

-- Step 0: Drop existing triggers to avoid conflicts
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
DROP FUNCTION IF EXISTS public.handle_new_user() CASCADE;
DROP FUNCTION IF EXISTS public.update_donor_status() CASCADE;
DROP FUNCTION IF EXISTS public.update_donation_count() CASCADE;
DROP FUNCTION IF EXISTS public.update_camp_status() CASCADE;
DROP FUNCTION IF EXISTS update_updated_at_column() CASCADE;

-- Step 1: Drop existing tables (in reverse order of dependencies)
DROP TABLE IF EXISTS donation_history CASCADE;
DROP TABLE IF EXISTS notifications CASCADE;
DROP TABLE IF EXISTS camp_registrations CASCADE;
DROP TABLE IF EXISTS donation_camps CASCADE;
DROP TABLE IF EXISTS donation_matches CASCADE;
DROP TABLE IF EXISTS blood_requests CASCADE;
DROP TABLE IF EXISTS donor_profiles CASCADE;
DROP TABLE IF EXISTS profiles CASCADE;

-- Step 2: Create tables with proper relations

-- Profiles table (extends auth.users)
CREATE TABLE profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
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
  is_donor BOOLEAN DEFAULT FALSE,
  is_recipient BOOLEAN DEFAULT FALSE,
  is_admin BOOLEAN DEFAULT FALSE,
  notification_preferences JSONB DEFAULT '{"email": true, "sms": false, "push": true}',
  last_active TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Donor profiles table
CREATE TABLE donor_profiles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  profile_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  blood_type TEXT CHECK (blood_type IN ('A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-')),
  weight FLOAT,
  height FLOAT,
  medical_conditions TEXT[],
  medications TEXT[],
  is_verified BOOLEAN DEFAULT FALSE,
  verification_date TIMESTAMP WITH TIME ZONE,
  last_donation_date TIMESTAMP WITH TIME ZONE,
  donation_count INTEGER DEFAULT 0,
  is_available BOOLEAN DEFAULT TRUE,
  availability_radius_km FLOAT DEFAULT 25.0,
  health_documents JSONB[]
);

-- Blood requests table
CREATE TABLE blood_requests (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  requester_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  patient_name TEXT NOT NULL,
  blood_type TEXT NOT NULL CHECK (blood_type IN ('A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-')),
  units_needed INTEGER NOT NULL CHECK (units_needed > 0),
  hospital_name TEXT NOT NULL,
  hospital_address TEXT NOT NULL,
  hospital_city TEXT NOT NULL,
  hospital_state TEXT NOT NULL,
  hospital_postal_code TEXT,
  hospital_latitude FLOAT8,
  hospital_longitude FLOAT8,
  urgency_level TEXT NOT NULL CHECK (urgency_level IN ('Normal', 'Urgent', 'Critical')),
  required_by_date TIMESTAMP WITH TIME ZONE NOT NULL,
  status TEXT NOT NULL CHECK (status IN ('Pending', 'Matching', 'Fulfilled', 'Cancelled')) DEFAULT 'Pending',
  medical_notes TEXT,
  contact_phone TEXT NOT NULL,
  contact_email TEXT NOT NULL
);

-- Donation matches table
CREATE TABLE donation_matches (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  request_id UUID NOT NULL REFERENCES blood_requests(id) ON DELETE CASCADE,
  donor_id UUID NOT NULL REFERENCES donor_profiles(id) ON DELETE CASCADE,
  status TEXT NOT NULL CHECK (status IN ('Pending', 'Accepted', 'Declined', 'Completed', 'Cancelled')) DEFAULT 'Pending',
  response_time TIMESTAMP WITH TIME ZONE,
  donation_time TIMESTAMP WITH TIME ZONE,
  notes TEXT
);

-- Donation camps table
CREATE TABLE donation_camps (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  name TEXT NOT NULL,
  description TEXT,
  organizer_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  start_date TIMESTAMP WITH TIME ZONE NOT NULL,
  end_date TIMESTAMP WITH TIME ZONE NOT NULL,
  address TEXT NOT NULL,
  city TEXT NOT NULL,
  state TEXT NOT NULL,
  postal_code TEXT,
  country TEXT NOT NULL,
  latitude FLOAT8,
  longitude FLOAT8,
  contact_phone TEXT,
  contact_email TEXT,
  website TEXT,
  max_capacity INTEGER,
  registration_required BOOLEAN DEFAULT FALSE,
  status TEXT NOT NULL CHECK (status IN ('Upcoming', 'Active', 'Completed', 'Cancelled')) DEFAULT 'Upcoming'
);

-- Camp registrations table
CREATE TABLE camp_registrations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  camp_id UUID NOT NULL REFERENCES donation_camps(id) ON DELETE CASCADE,
  donor_id UUID NOT NULL REFERENCES donor_profiles(id) ON DELETE CASCADE,
  registration_date TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  status TEXT NOT NULL CHECK (status IN ('Registered', 'Checked-in', 'Completed', 'Cancelled')) DEFAULT 'Registered',
  check_in_time TIMESTAMP WITH TIME ZONE,
  check_out_time TIMESTAMP WITH TIME ZONE,
  notes TEXT
);

-- Notifications table
CREATE TABLE notifications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  recipient_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  type TEXT NOT NULL CHECK (type IN ('Request', 'Match', 'Camp', 'System')),
  title TEXT NOT NULL,
  message TEXT NOT NULL,
  related_entity_id UUID,
  related_entity_type TEXT,
  is_read BOOLEAN DEFAULT FALSE,
  read_at TIMESTAMP WITH TIME ZONE,
  delivery_status TEXT NOT NULL CHECK (delivery_status IN ('Pending', 'Sent', 'Failed')) DEFAULT 'Pending',
  channel TEXT NOT NULL CHECK (channel IN ('In-app', 'Email', 'SMS'))
);

-- Donation history table
CREATE TABLE donation_history (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  donor_id UUID NOT NULL REFERENCES donor_profiles(id) ON DELETE CASCADE,
  request_id UUID REFERENCES blood_requests(id) ON DELETE SET NULL,
  camp_id UUID REFERENCES donation_camps(id) ON DELETE SET NULL,
  donation_date TIMESTAMP WITH TIME ZONE NOT NULL,
  blood_type TEXT NOT NULL CHECK (blood_type IN ('A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-')),
  units_donated FLOAT NOT NULL CHECK (units_donated > 0),
  location TEXT NOT NULL,
  notes TEXT,
  verified_by UUID REFERENCES profiles(id) ON DELETE SET NULL
);

-- Step 3: Create indexes for performance optimization

-- Spatial indexes
CREATE INDEX idx_profiles_location ON profiles USING gist (point(longitude, latitude));
CREATE INDEX idx_blood_requests_hospital_location ON blood_requests USING gist (point(hospital_longitude, hospital_latitude));
CREATE INDEX idx_donation_camps_location ON donation_camps USING gist (point(longitude, latitude));

-- Blood type indexes
CREATE INDEX idx_donor_profiles_blood_type ON donor_profiles(blood_type);
CREATE INDEX idx_blood_requests_blood_type ON blood_requests(blood_type);
CREATE INDEX idx_donation_history_blood_type ON donation_history(blood_type);

-- Status indexes
CREATE INDEX idx_blood_requests_status ON blood_requests(status);
CREATE INDEX idx_donation_matches_status ON donation_matches(status);
CREATE INDEX idx_donation_camps_status ON donation_camps(status);
CREATE INDEX idx_camp_registrations_status ON camp_registrations(status);

-- Other useful indexes
CREATE INDEX idx_profiles_is_donor ON profiles(is_donor) WHERE is_donor = TRUE;
CREATE INDEX idx_profiles_is_recipient ON profiles(is_recipient) WHERE is_recipient = TRUE;
CREATE INDEX idx_profiles_is_admin ON profiles(is_admin) WHERE is_admin = TRUE;
CREATE INDEX idx_donor_profiles_is_available ON donor_profiles(is_available) WHERE is_available = TRUE;
CREATE INDEX idx_notifications_is_read ON notifications(is_read) WHERE is_read = FALSE;

-- Step 4: Set up Row Level Security (RLS) policies

-- Enable RLS on all tables
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE donor_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE blood_requests ENABLE ROW LEVEL SECURITY;
ALTER TABLE donation_matches ENABLE ROW LEVEL SECURITY;
ALTER TABLE donation_camps ENABLE ROW LEVEL SECURITY;
ALTER TABLE camp_registrations ENABLE ROW LEVEL SECURITY;
ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE donation_history ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if they exist
DO $$
DECLARE
  tables TEXT[] := ARRAY['profiles', 'donor_profiles', 'blood_requests', 'donation_matches', 
                         'donation_camps', 'camp_registrations', 'notifications', 'donation_history'];
  policies TEXT[] := ARRAY['_select_own', '_select_public', '_insert_own', '_update_own', 
                           '_select_requester', '_select_donor', '_insert_system', '_update_donor',
                           '_select_all', '_insert_organizer', '_update_organizer', '_select_camp_organizer',
                           '_select_recipient', '_update_recipient', '_select_admin', '_insert_admin',
                           '_update_admin', '_admin_all'];
  t TEXT;
  p TEXT;
BEGIN
  FOREACH t IN ARRAY tables
  LOOP
    FOREACH p IN ARRAY policies
    LOOP
      EXECUTE format('DROP POLICY IF EXISTS %I%I ON %I', t, p, t);
    END LOOP;
  END LOOP;
END;
$$;

-- Profiles table policies
CREATE POLICY profiles_select_own ON profiles FOR SELECT 
  USING (auth.uid() = id);

CREATE POLICY profiles_select_public ON profiles FOR SELECT 
  USING (is_donor = TRUE);

CREATE POLICY profiles_insert_own ON profiles FOR INSERT 
  WITH CHECK (auth.uid() = id);

CREATE POLICY profiles_update_own ON profiles FOR UPDATE 
  USING (auth.uid() = id) 
  WITH CHECK (auth.uid() = id);

-- Donor profiles table policies
CREATE POLICY donor_profiles_select_own ON donor_profiles FOR SELECT 
  USING (auth.uid() = profile_id);

CREATE POLICY donor_profiles_select_public ON donor_profiles FOR SELECT 
  USING (EXISTS (SELECT 1 FROM profiles WHERE profiles.id = donor_profiles.profile_id AND profiles.is_donor = TRUE));

CREATE POLICY donor_profiles_insert_own ON donor_profiles FOR INSERT 
  WITH CHECK (auth.uid() = profile_id);

CREATE POLICY donor_profiles_update_own ON donor_profiles FOR UPDATE 
  USING (auth.uid() = profile_id) 
  WITH CHECK (auth.uid() = profile_id);

-- Blood requests table policies
CREATE POLICY blood_requests_select_own ON blood_requests FOR SELECT 
  USING (auth.uid() = requester_id);

CREATE POLICY blood_requests_select_donor ON blood_requests FOR SELECT 
  USING (EXISTS (SELECT 1 FROM profiles WHERE profiles.id = auth.uid() AND profiles.is_donor = TRUE));

CREATE POLICY blood_requests_insert_own ON blood_requests FOR INSERT 
  WITH CHECK (auth.uid() = requester_id);

CREATE POLICY blood_requests_update_own ON blood_requests FOR UPDATE 
  USING (auth.uid() = requester_id) 
  WITH CHECK (auth.uid() = requester_id);

-- Donation matches table policies
CREATE POLICY donation_matches_select_requester ON donation_matches FOR SELECT 
  USING (EXISTS (SELECT 1 FROM blood_requests WHERE blood_requests.id = donation_matches.request_id AND blood_requests.requester_id = auth.uid()));

CREATE POLICY donation_matches_select_donor ON donation_matches FOR SELECT 
  USING (EXISTS (SELECT 1 FROM donor_profiles WHERE donor_profiles.id = donation_matches.donor_id AND donor_profiles.profile_id = auth.uid()));

CREATE POLICY donation_matches_insert_system ON donation_matches FOR INSERT 
  WITH CHECK (EXISTS (SELECT 1 FROM profiles WHERE profiles.id = auth.uid() AND profiles.is_admin = TRUE));

CREATE POLICY donation_matches_update_donor ON donation_matches FOR UPDATE 
  USING (EXISTS (SELECT 1 FROM donor_profiles WHERE donor_profiles.id = donation_matches.donor_id AND donor_profiles.profile_id = auth.uid())) 
  WITH CHECK (EXISTS (SELECT 1 FROM donor_profiles WHERE donor_profiles.id = donation_matches.donor_id AND donor_profiles.profile_id = auth.uid()));

-- Donation camps table policies
CREATE POLICY donation_camps_select_all ON donation_camps FOR SELECT USING (TRUE);

CREATE POLICY donation_camps_insert_organizer ON donation_camps FOR INSERT 
  WITH CHECK (auth.uid() = organizer_id);

CREATE POLICY donation_camps_update_organizer ON donation_camps FOR UPDATE 
  USING (auth.uid() = organizer_id) 
  WITH CHECK (auth.uid() = organizer_id);

-- Camp registrations table policies
CREATE POLICY camp_registrations_select_camp_organizer ON camp_registrations FOR SELECT 
  USING (EXISTS (SELECT 1 FROM donation_camps WHERE donation_camps.id = camp_registrations.camp_id AND donation_camps.organizer_id = auth.uid()));

CREATE POLICY camp_registrations_select_donor ON camp_registrations FOR SELECT 
  USING (EXISTS (SELECT 1 FROM donor_profiles WHERE donor_profiles.id = camp_registrations.donor_id AND donor_profiles.profile_id = auth.uid()));

CREATE POLICY camp_registrations_insert_donor ON camp_registrations FOR INSERT 
  WITH CHECK (EXISTS (SELECT 1 FROM donor_profiles WHERE donor_profiles.id = camp_registrations.donor_id AND donor_profiles.profile_id = auth.uid()));

CREATE POLICY camp_registrations_update_donor ON camp_registrations FOR UPDATE 
  USING (EXISTS (SELECT 1 FROM donor_profiles WHERE donor_profiles.id = camp_registrations.donor_id AND donor_profiles.profile_id = auth.uid())) 
  WITH CHECK (EXISTS (SELECT 1 FROM donor_profiles WHERE donor_profiles.id = camp_registrations.donor_id AND donor_profiles.profile_id = auth.uid()));

-- Notifications table policies
CREATE POLICY notifications_select_recipient ON notifications FOR SELECT 
  USING (auth.uid() = recipient_id);

CREATE POLICY notifications_insert_system ON notifications FOR INSERT 
  WITH CHECK (EXISTS (SELECT 1 FROM profiles WHERE profiles.id = auth.uid() AND profiles.is_admin = TRUE));

CREATE POLICY notifications_update_recipient ON notifications FOR UPDATE 
  USING (auth.uid() = recipient_id) 
  WITH CHECK (auth.uid() = recipient_id);

-- Donation history table policies
CREATE POLICY donation_history_select_donor ON donation_history FOR SELECT 
  USING (EXISTS (SELECT 1 FROM donor_profiles WHERE donor_profiles.id = donation_history.donor_id AND donor_profiles.profile_id = auth.uid()));

CREATE POLICY donation_history_select_admin ON donation_history FOR SELECT 
  USING (EXISTS (SELECT 1 FROM profiles WHERE profiles.id = auth.uid() AND profiles.is_admin = TRUE));

CREATE POLICY donation_history_insert_admin ON donation_history FOR INSERT 
  WITH CHECK (EXISTS (SELECT 1 FROM profiles WHERE profiles.id = auth.uid() AND profiles.is_admin = TRUE));

CREATE POLICY donation_history_update_admin ON donation_history FOR UPDATE 
  USING (EXISTS (SELECT 1 FROM profiles WHERE profiles.id = auth.uid() AND profiles.is_admin = TRUE)) 
  WITH CHECK (EXISTS (SELECT 1 FROM profiles WHERE profiles.id = auth.uid() AND profiles.is_admin = TRUE));

-- Step 5: Create functions and triggers

-- Function to update the updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
   NEW.updated_at = NOW();
   RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Apply the updated_at trigger to all tables
CREATE TRIGGER update_profiles_updated_at
BEFORE UPDATE ON profiles
FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_donor_profiles_updated_at
BEFORE UPDATE ON donor_profiles
FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_blood_requests_updated_at
BEFORE UPDATE ON blood_requests
FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_donation_matches_updated_at
BEFORE UPDATE ON donation_matches
FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_donation_camps_updated_at
BEFORE UPDATE ON donation_camps
FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_camp_registrations_updated_at
BEFORE UPDATE ON camp_registrations
FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_notifications_updated_at
BEFORE UPDATE ON notifications
FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Function to create a profile after a user signs up
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, email, created_at, updated_at)
  VALUES (NEW.id, NEW.email, NOW(), NOW());
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger to create a profile after a user signs up
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_trigger 
    WHERE tgname = 'on_auth_user_created' 
    AND tgrelid = 'auth.users'::regclass
  ) THEN
    CREATE TRIGGER on_auth_user_created
      AFTER INSERT ON auth.users
      FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();
  END IF;
END
$$;

-- Function to update donor status when donor_profile is created
CREATE OR REPLACE FUNCTION public.update_donor_status()
RETURNS TRIGGER AS $$
BEGIN
  UPDATE public.profiles
  SET is_donor = TRUE
  WHERE id = NEW.profile_id;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger to update donor status when donor_profile is created
CREATE TRIGGER on_donor_profile_created
  AFTER INSERT ON public.donor_profiles
  FOR EACH ROW EXECUTE FUNCTION public.update_donor_status();

-- Function to update donation count when donation history is added
CREATE OR REPLACE FUNCTION public.update_donation_count()
RETURNS TRIGGER AS $$
BEGIN
  UPDATE public.donor_profiles
  SET 
    donation_count = donation_count + 1,
    last_donation_date = NEW.donation_date
  WHERE id = NEW.donor_id;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger to update donation count when donation history is added
CREATE TRIGGER on_donation_history_created
  AFTER INSERT ON public.donation_history
  FOR EACH ROW EXECUTE FUNCTION public.update_donation_count();

-- Function to update camp status based on dates
CREATE OR REPLACE FUNCTION public.update_camp_status()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.start_date <= NOW() AND NEW.end_date >= NOW() THEN
    NEW.status = 'Active';
  ELSIF NEW.end_date < NOW() THEN
    NEW.status = 'Completed';
  ELSE
    NEW.status = 'Upcoming';
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger to update camp status based on dates
CREATE TRIGGER before_camp_insert_update
  BEFORE INSERT OR UPDATE ON public.donation_camps
  FOR EACH ROW EXECUTE FUNCTION public.update_camp_status();

-- Step 6: Create a scheduled function to update camp statuses daily
CREATE EXTENSION IF NOT EXISTS pg_cron;

-- Drop existing scheduled job if it exists
DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM pg_extension WHERE extname = 'pg_cron') THEN
    IF EXISTS (SELECT 1 FROM cron.job WHERE jobname = 'update-camp-statuses') THEN
      PERFORM cron.unschedule('update-camp-statuses');
    END IF;
  END IF;
END
$$;

SELECT cron.schedule(
  'update-camp-statuses',
  '0 0 * * *',  -- Run at midnight every day
  $$
    UPDATE public.donation_camps
    SET status = 
      CASE 
        WHEN start_date <= NOW() AND end_date >= NOW() THEN 'Active'
        WHEN end_date < NOW() THEN 'Completed'
        ELSE 'Upcoming'
      END
    WHERE status != 'Cancelled';
  $$
);

-- Step 7: Create a function to find matching donors for a blood request
CREATE OR REPLACE FUNCTION find_matching_donors(request_id UUID)
RETURNS TABLE (
  donor_id UUID,
  profile_id UUID,
  first_name TEXT,
  last_name TEXT,
  email TEXT,
  blood_type TEXT,
  distance_km FLOAT,
  last_donation_date TIMESTAMP WITH TIME ZONE
) AS $$
DECLARE
  req_blood_type TEXT;
  req_latitude FLOAT8;
  req_longitude FLOAT8;
BEGIN
  -- Get request details
  SELECT 
    blood_type, 
    hospital_latitude, 
    hospital_longitude 
  INTO 
    req_blood_type, 
    req_latitude, 
    req_longitude
  FROM blood_requests
  WHERE id = request_id;

  -- Return matching donors
  RETURN QUERY
  SELECT 
    dp.id AS donor_id,
    p.id AS profile_id,
    p.first_name,
    p.last_name,
    p.email,
    dp.blood_type,
    -- Calculate distance in kilometers using the Haversine formula
    (6371 * acos(cos(radians(req_latitude)) * cos(radians(p.latitude)) * 
     cos(radians(p.longitude) - radians(req_longitude)) + 
     sin(radians(req_latitude)) * sin(radians(p.latitude)))) AS distance_km,
    dp.last_donation_date
  FROM donor_profiles dp
  JOIN profiles p ON dp.profile_id = p.id
  WHERE 
    dp.is_available = TRUE AND
    dp.is_verified = TRUE AND
    -- Blood type compatibility logic
    ((req_blood_type = 'A+' AND dp.blood_type IN ('A+', 'A-', 'O+', 'O-')) OR
     (req_blood_type = 'A-' AND dp.blood_type IN ('A-', 'O-')) OR
     (req_blood_type = 'B+' AND dp.blood_type IN ('B+', 'B-', 'O+', 'O-')) OR
     (req_blood_type = 'B-' AND dp.blood_type IN ('B-', 'O-')) OR
     (req_blood_type = 'AB+' AND dp.blood_type IN ('A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-')) OR
     (req_blood_type = 'AB-' AND dp.blood_type IN ('A-', 'B-', 'AB-', 'O-')) OR
     (req_blood_type = 'O+' AND dp.blood_type IN ('O+', 'O-')) OR
     (req_blood_type = 'O-' AND dp.blood_type = 'O-')) AND
    -- Distance within donor's availability radius
    (6371 * acos(cos(radians(req_latitude)) * cos(radians(p.latitude)) * 
     cos(radians(p.longitude) - radians(req_longitude)) + 
     sin(radians(req_latitude)) * sin(radians(p.latitude)))) <= dp.availability_radius_km
  ORDER BY 
    -- Prioritize exact blood type matches
    (dp.blood_type = req_blood_type) DESC,
    -- Then by distance
    distance_km ASC,
    -- Then by last donation date (prioritize those who haven't donated recently)
    dp.last_donation_date ASC NULLS FIRST;
END;
$$ LANGUAGE plpgsql;

-- Step 8: Create admin policies for all tables
DO $$
DECLARE
  tables TEXT[] := ARRAY['profiles', 'donor_profiles', 'blood_requests', 'donation_matches', 
                         'donation_camps', 'camp_registrations', 'notifications', 'donation_history'];
  t TEXT;
BEGIN
  FOREACH t IN ARRAY tables
  LOOP
    EXECUTE format('CREATE POLICY %I_admin_all ON %I FOR ALL TO authenticated USING (EXISTS (SELECT 1 FROM profiles WHERE profiles.id = auth.uid() AND profiles.is_admin = TRUE))', t, t);
  END LOOP;
END;
$$; 