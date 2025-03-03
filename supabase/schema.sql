-- RedDrop Blood Donation Management System Database Schema
-- This script creates all necessary tables, indexes, functions, and RLS policies

-- Enable necessary extensions
CREATE EXTENSION IF NOT EXISTS "postgis"; -- For geospatial functionality
CREATE EXTENSION IF NOT EXISTS "pg_trgm"; -- For text search

-- Set up custom types
CREATE TYPE blood_type AS ENUM ('A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-');
CREATE TYPE urgency_level AS ENUM ('Normal', 'Urgent', 'Critical');
CREATE TYPE request_status AS ENUM ('Pending', 'Matching', 'Fulfilled', 'Cancelled');
CREATE TYPE match_status AS ENUM ('Pending', 'Accepted', 'Declined', 'Completed', 'Cancelled');
CREATE TYPE camp_status AS ENUM ('Upcoming', 'Active', 'Completed', 'Cancelled');
CREATE TYPE registration_status AS ENUM ('Registered', 'Checked-in', 'Completed', 'Cancelled');
CREATE TYPE notification_type AS ENUM ('Request', 'Match', 'Camp', 'System');
CREATE TYPE notification_channel AS ENUM ('In-app', 'Email', 'SMS');
CREATE TYPE delivery_status AS ENUM ('Pending', 'Sent', 'Failed');

-- Create tables
-- 1. Profiles table (extends auth.users)
CREATE TABLE profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ,
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
  last_active TIMESTAMPTZ
);

-- 2. Donor profiles table
CREATE TABLE donor_profiles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  profile_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ,
  blood_type blood_type NOT NULL,
  weight FLOAT,
  height FLOAT,
  medical_conditions TEXT[],
  medications TEXT[],
  is_verified BOOLEAN NOT NULL DEFAULT FALSE,
  verification_date TIMESTAMPTZ,
  last_donation_date TIMESTAMPTZ,
  donation_count INTEGER NOT NULL DEFAULT 0,
  is_available BOOLEAN NOT NULL DEFAULT TRUE,
  availability_radius_km FLOAT NOT NULL DEFAULT 25.0,
  health_documents JSONB[]
);

-- 3. Blood requests table
CREATE TABLE blood_requests (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ,
  requester_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  patient_name TEXT NOT NULL,
  blood_type blood_type NOT NULL,
  units_needed INTEGER NOT NULL DEFAULT 1,
  hospital_name TEXT NOT NULL,
  hospital_address TEXT NOT NULL,
  hospital_city TEXT NOT NULL,
  hospital_state TEXT NOT NULL,
  hospital_postal_code TEXT,
  hospital_country TEXT NOT NULL DEFAULT 'United States',
  hospital_latitude FLOAT8,
  hospital_longitude FLOAT8,
  urgency_level urgency_level NOT NULL DEFAULT 'Normal',
  required_by_date TIMESTAMPTZ NOT NULL,
  status request_status NOT NULL DEFAULT 'Pending',
  medical_notes TEXT,
  contact_phone TEXT NOT NULL,
  contact_email TEXT NOT NULL
);

-- 4. Donation matches table
CREATE TABLE donation_matches (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ,
  request_id UUID NOT NULL REFERENCES blood_requests(id) ON DELETE CASCADE,
  donor_id UUID NOT NULL REFERENCES donor_profiles(id) ON DELETE CASCADE,
  status match_status NOT NULL DEFAULT 'Pending',
  response_time TIMESTAMPTZ,
  donation_time TIMESTAMPTZ,
  notes TEXT
);

-- 5. Donation camps table
CREATE TABLE donation_camps (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ,
  name TEXT NOT NULL,
  description TEXT,
  organizer_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  start_date TIMESTAMPTZ NOT NULL,
  end_date TIMESTAMPTZ NOT NULL,
  address TEXT NOT NULL,
  city TEXT NOT NULL,
  state TEXT NOT NULL,
  postal_code TEXT,
  country TEXT NOT NULL DEFAULT 'United States',
  latitude FLOAT8,
  longitude FLOAT8,
  contact_phone TEXT,
  contact_email TEXT,
  website TEXT,
  max_capacity INTEGER,
  registration_required BOOLEAN NOT NULL DEFAULT TRUE,
  status camp_status NOT NULL DEFAULT 'Upcoming',
  CONSTRAINT check_end_after_start CHECK (end_date > start_date)
);

-- 6. Camp registrations table
CREATE TABLE camp_registrations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ,
  camp_id UUID NOT NULL REFERENCES donation_camps(id) ON DELETE CASCADE,
  donor_id UUID NOT NULL REFERENCES donor_profiles(id) ON DELETE CASCADE,
  registration_date TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  status registration_status NOT NULL DEFAULT 'Registered',
  check_in_time TIMESTAMPTZ,
  check_out_time TIMESTAMPTZ,
  notes TEXT,
  UNIQUE(camp_id, donor_id)
);

-- 7. Notifications table
CREATE TABLE notifications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  recipient_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  type notification_type NOT NULL,
  title TEXT NOT NULL,
  message TEXT NOT NULL,
  related_entity_id UUID,
  related_entity_type TEXT,
  is_read BOOLEAN NOT NULL DEFAULT FALSE,
  read_at TIMESTAMPTZ,
  delivery_status delivery_status NOT NULL DEFAULT 'Pending',
  channel notification_channel NOT NULL DEFAULT 'In-app'
);

-- 8. Donation history table
CREATE TABLE donation_history (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  donor_id UUID NOT NULL REFERENCES donor_profiles(id) ON DELETE CASCADE,
  request_id UUID REFERENCES blood_requests(id) ON DELETE SET NULL,
  camp_id UUID REFERENCES donation_camps(id) ON DELETE SET NULL,
  donation_date TIMESTAMPTZ NOT NULL,
  blood_type blood_type NOT NULL,
  units_donated FLOAT NOT NULL DEFAULT 1.0,
  location TEXT NOT NULL,
  notes TEXT,
  verified_by UUID REFERENCES profiles(id) ON DELETE SET NULL
);

-- Create indexes for performance
-- Spatial indexes
CREATE INDEX idx_profiles_location ON profiles USING gist (
  ST_SetSRID(ST_MakePoint(longitude, latitude), 4326)
) WHERE latitude IS NOT NULL AND longitude IS NOT NULL;

CREATE INDEX idx_blood_requests_hospital_location ON blood_requests USING gist (
  ST_SetSRID(ST_MakePoint(hospital_longitude, hospital_latitude), 4326)
) WHERE hospital_latitude IS NOT NULL AND hospital_longitude IS NOT NULL;

CREATE INDEX idx_donation_camps_location ON donation_camps USING gist (
  ST_SetSRID(ST_MakePoint(longitude, latitude), 4326)
) WHERE latitude IS NOT NULL AND longitude IS NOT NULL;

-- Blood type indexes
CREATE INDEX idx_donor_profiles_blood_type ON donor_profiles(blood_type);
CREATE INDEX idx_blood_requests_blood_type ON blood_requests(blood_type);
CREATE INDEX idx_donation_history_blood_type ON donation_history(blood_type);

-- Status indexes
CREATE INDEX idx_blood_requests_status ON blood_requests(status);
CREATE INDEX idx_donation_matches_status ON donation_matches(status);
CREATE INDEX idx_donation_camps_status ON donation_camps(status);
CREATE INDEX idx_camp_registrations_status ON camp_registrations(status);

-- Date indexes
CREATE INDEX idx_blood_requests_required_by_date ON blood_requests(required_by_date);
CREATE INDEX idx_donation_camps_start_date ON donation_camps(start_date);
CREATE INDEX idx_donation_camps_end_date ON donation_camps(end_date);
CREATE INDEX idx_donation_history_donation_date ON donation_history(donation_date);

-- Notification indexes
CREATE INDEX idx_notifications_recipient_id ON notifications(recipient_id);
CREATE INDEX idx_notifications_is_read ON notifications(is_read);

-- Create functions for triggers
-- Update timestamp function
CREATE OR REPLACE FUNCTION update_modified_column()
RETURNS TRIGGER AS $$
BEGIN
   NEW.updated_at = NOW();
   RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create triggers for updated_at timestamps
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

-- Function to update donor profile when a match is completed
CREATE OR REPLACE FUNCTION update_donor_after_donation()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.status = 'Completed' AND OLD.status != 'Completed' THEN
    -- Update donor's last donation date and increment donation count
    UPDATE donor_profiles
    SET 
      last_donation_date = NEW.donation_time,
      donation_count = donation_count + 1
    WHERE id = NEW.donor_id;
    
    -- Create donation history record
    INSERT INTO donation_history (
      donor_id,
      request_id,
      donation_date,
      blood_type,
      location,
      notes
    )
    SELECT 
      NEW.donor_id,
      NEW.request_id,
      NEW.donation_time,
      br.blood_type,
      CONCAT(br.hospital_name, ', ', br.hospital_city, ', ', br.hospital_state),
      'Donation in response to blood request'
    FROM blood_requests br
    WHERE br.id = NEW.request_id;
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_update_donor_after_donation
AFTER UPDATE ON donation_matches
FOR EACH ROW
EXECUTE FUNCTION update_donor_after_donation();

-- Function to update request status when a match is completed
CREATE OR REPLACE FUNCTION update_request_after_match()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.status = 'Completed' AND OLD.status != 'Completed' THEN
    -- Update request status to Fulfilled
    UPDATE blood_requests
    SET status = 'Fulfilled'
    WHERE id = NEW.request_id;
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_update_request_after_match
AFTER UPDATE ON donation_matches
FOR EACH ROW
EXECUTE FUNCTION update_request_after_match();

-- Function to create notification when a blood request is created
CREATE OR REPLACE FUNCTION create_blood_request_notification()
RETURNS TRIGGER AS $$
BEGIN
  -- Create notification for admin
  INSERT INTO notifications (
    recipient_id,
    type,
    title,
    message,
    related_entity_id,
    related_entity_type
  )
  SELECT 
    p.id,
    'Request',
    'New Blood Request',
    CONCAT('A new ', NEW.urgency_level, ' blood request for ', NEW.blood_type, ' has been created.'),
    NEW.id,
    'blood_requests'
  FROM profiles p
  WHERE p.is_admin = TRUE;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_create_blood_request_notification
AFTER INSERT ON blood_requests
FOR EACH ROW
EXECUTE FUNCTION create_blood_request_notification();

-- Function to create notification when a match is created
CREATE OR REPLACE FUNCTION create_match_notification()
RETURNS TRIGGER AS $$
DECLARE
  donor_profile_id UUID;
BEGIN
  -- Get the profile_id of the donor
  SELECT profile_id INTO donor_profile_id
  FROM donor_profiles
  WHERE id = NEW.donor_id;
  
  -- Create notification for donor
  INSERT INTO notifications (
    recipient_id,
    type,
    title,
    message,
    related_entity_id,
    related_entity_type
  )
  SELECT 
    donor_profile_id,
    'Match',
    'Blood Donation Match',
    CONCAT('You have been matched with a blood request. Please respond as soon as possible.'),
    NEW.id,
    'donation_matches';
  
  -- Create notification for requester
  INSERT INTO notifications (
    recipient_id,
    type,
    title,
    message,
    related_entity_id,
    related_entity_type
  )
  SELECT 
    br.requester_id,
    'Match',
    'Donor Match Found',
    CONCAT('A potential donor has been matched to your blood request.'),
    NEW.id,
    'donation_matches'
  FROM blood_requests br
  WHERE br.id = NEW.request_id;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_create_match_notification
AFTER INSERT ON donation_matches
FOR EACH ROW
EXECUTE FUNCTION create_match_notification();

-- Function to create notification when a camp is created
CREATE OR REPLACE FUNCTION create_camp_notification()
RETURNS TRIGGER AS $$
BEGIN
  -- Create notification for all donors
  INSERT INTO notifications (
    recipient_id,
    type,
    title,
    message,
    related_entity_id,
    related_entity_type
  )
  SELECT 
    p.id,
    'Camp',
    'New Donation Camp',
    CONCAT('A new blood donation camp has been scheduled in ', NEW.city, ' on ', TO_CHAR(NEW.start_date, 'Mon DD, YYYY'), '.'),
    NEW.id,
    'donation_camps'
  FROM profiles p
  JOIN donor_profiles dp ON p.id = dp.profile_id
  WHERE p.is_donor = TRUE;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_create_camp_notification
AFTER INSERT ON donation_camps
FOR EACH ROW
EXECUTE FUNCTION create_camp_notification();

-- Function to find compatible donors for a blood request
CREATE OR REPLACE FUNCTION find_compatible_donors(request_id UUID)
RETURNS TABLE (
  donor_id UUID,
  profile_id UUID,
  blood_type blood_type,
  distance_km FLOAT,
  last_donation_date TIMESTAMPTZ,
  donation_count INTEGER
) AS $$
DECLARE
  request_blood_type blood_type;
  request_latitude FLOAT8;
  request_longitude FLOAT8;
BEGIN
  -- Get request details
  SELECT 
    br.blood_type, 
    br.hospital_latitude, 
    br.hospital_longitude
  INTO 
    request_blood_type, 
    request_latitude, 
    request_longitude
  FROM blood_requests br
  WHERE br.id = request_id;
  
  -- Return compatible donors sorted by distance and availability
  RETURN QUERY
  SELECT 
    dp.id AS donor_id,
    dp.profile_id,
    dp.blood_type,
    ST_DistanceSphere(
      ST_SetSRID(ST_MakePoint(p.longitude, p.latitude), 4326),
      ST_SetSRID(ST_MakePoint(request_longitude, request_latitude), 4326)
    ) / 1000 AS distance_km,
    dp.last_donation_date,
    dp.donation_count
  FROM donor_profiles dp
  JOIN profiles p ON dp.profile_id = p.id
  WHERE 
    dp.is_available = TRUE AND
    dp.is_verified = TRUE AND
    p.latitude IS NOT NULL AND
    p.longitude IS NOT NULL AND
    (
      -- Blood type compatibility logic
      (request_blood_type = 'A+' AND dp.blood_type IN ('A+', 'A-', 'O+', 'O-')) OR
      (request_blood_type = 'A-' AND dp.blood_type IN ('A-', 'O-')) OR
      (request_blood_type = 'B+' AND dp.blood_type IN ('B+', 'B-', 'O+', 'O-')) OR
      (request_blood_type = 'B-' AND dp.blood_type IN ('B-', 'O-')) OR
      (request_blood_type = 'AB+' AND dp.blood_type IN ('A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-')) OR
      (request_blood_type = 'AB-' AND dp.blood_type IN ('A-', 'B-', 'AB-', 'O-')) OR
      (request_blood_type = 'O+' AND dp.blood_type IN ('O+', 'O-')) OR
      (request_blood_type = 'O-' AND dp.blood_type = 'O-')
    ) AND
    -- Check if donor is within their specified radius
    ST_DistanceSphere(
      ST_SetSRID(ST_MakePoint(p.longitude, p.latitude), 4326),
      ST_SetSRID(ST_MakePoint(request_longitude, request_latitude), 4326)
    ) / 1000 <= dp.availability_radius_km AND
    -- Ensure donor hasn't donated in the last 56 days (8 weeks)
    (dp.last_donation_date IS NULL OR dp.last_donation_date < NOW() - INTERVAL '56 days')
  ORDER BY 
    -- Prioritize exact blood type matches
    (dp.blood_type = request_blood_type) DESC,
    -- Then by distance
    distance_km ASC,
    -- Then by donation count (fewer donations first to distribute load)
    dp.donation_count ASC;
END;
$$ LANGUAGE plpgsql;

-- Function to find nearby donation camps
CREATE OR REPLACE FUNCTION find_nearby_camps(
  lat FLOAT8,
  lng FLOAT8,
  radius_km FLOAT DEFAULT 50,
  from_date TIMESTAMPTZ DEFAULT NOW(),
  to_date TIMESTAMPTZ DEFAULT NULL
)
RETURNS TABLE (
  id UUID,
  name TEXT,
  start_date TIMESTAMPTZ,
  end_date TIMESTAMPTZ,
  address TEXT,
  city TEXT,
  state TEXT,
  distance_km FLOAT,
  status camp_status
) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    dc.id,
    dc.name,
    dc.start_date,
    dc.end_date,
    dc.address,
    dc.city,
    dc.state,
    ST_DistanceSphere(
      ST_SetSRID(ST_MakePoint(lng, lat), 4326),
      ST_SetSRID(ST_MakePoint(dc.longitude, dc.latitude), 4326)
    ) / 1000 AS distance_km,
    dc.status
  FROM donation_camps dc
  WHERE 
    dc.latitude IS NOT NULL AND
    dc.longitude IS NOT NULL AND
    ST_DistanceSphere(
      ST_SetSRID(ST_MakePoint(lng, lat), 4326),
      ST_SetSRID(ST_MakePoint(dc.longitude, dc.latitude), 4326)
    ) / 1000 <= radius_km AND
    dc.status IN ('Upcoming', 'Active') AND
    dc.start_date >= from_date AND
    (to_date IS NULL OR dc.end_date <= to_date)
  ORDER BY 
    distance_km ASC,
    dc.start_date ASC;
END;
$$ LANGUAGE plpgsql;

-- Set up Row Level Security (RLS)
-- Enable RLS on all tables
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE donor_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE blood_requests ENABLE ROW LEVEL SECURITY;
ALTER TABLE donation_matches ENABLE ROW LEVEL SECURITY;
ALTER TABLE donation_camps ENABLE ROW LEVEL SECURITY;
ALTER TABLE camp_registrations ENABLE ROW LEVEL SECURITY;
ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE donation_history ENABLE ROW LEVEL SECURITY;

-- Create policies for profiles table
-- Everyone can view public profile information
CREATE POLICY profiles_view_public ON profiles
  FOR SELECT
  USING (TRUE);

-- Users can update their own profiles
CREATE POLICY profiles_update_own ON profiles
  FOR UPDATE
  USING (auth.uid() = id);

-- Create policies for donor_profiles table
-- Everyone can view verified donor profiles
CREATE POLICY donor_profiles_view_verified ON donor_profiles
  FOR SELECT
  USING (is_verified = TRUE);

-- Users can view their own donor profile even if not verified
CREATE POLICY donor_profiles_view_own ON donor_profiles
  FOR SELECT
  USING (EXISTS (
    SELECT 1 FROM profiles p WHERE p.id = profile_id AND p.id = auth.uid()
  ));

-- Users can update their own donor profile
CREATE POLICY donor_profiles_update_own ON donor_profiles
  FOR UPDATE
  USING (EXISTS (
    SELECT 1 FROM profiles p WHERE p.id = profile_id AND p.id = auth.uid()
  ));

-- Users can insert their own donor profile
CREATE POLICY donor_profiles_insert_own ON donor_profiles
  FOR INSERT
  WITH CHECK (profile_id = auth.uid());

-- Create policies for blood_requests table
-- Everyone can view active blood requests
CREATE POLICY blood_requests_view_active ON blood_requests
  FOR SELECT
  USING (status IN ('Pending', 'Matching'));

-- Users can view all their own requests
CREATE POLICY blood_requests_view_own ON blood_requests
  FOR SELECT
  USING (requester_id = auth.uid());

-- Users can insert their own requests
CREATE POLICY blood_requests_insert_own ON blood_requests
  FOR INSERT
  WITH CHECK (requester_id = auth.uid());

-- Users can update their own requests
CREATE POLICY blood_requests_update_own ON blood_requests
  FOR UPDATE
  USING (requester_id = auth.uid());

-- Create policies for donation_matches table
-- Donors can view matches they are part of
CREATE POLICY donation_matches_view_donor ON donation_matches
  FOR SELECT
  USING (EXISTS (
    SELECT 1 FROM donor_profiles dp 
    WHERE dp.id = donor_id AND dp.profile_id = auth.uid()
  ));

-- Requesters can view matches for their requests
CREATE POLICY donation_matches_view_requester ON donation_matches
  FOR SELECT
  USING (EXISTS (
    SELECT 1 FROM blood_requests br 
    WHERE br.id = request_id AND br.requester_id = auth.uid()
  ));

-- Donors can update matches they are part of
CREATE POLICY donation_matches_update_donor ON donation_matches
  FOR UPDATE
  USING (EXISTS (
    SELECT 1 FROM donor_profiles dp 
    WHERE dp.id = donor_id AND dp.profile_id = auth.uid()
  ));

-- Create policies for donation_camps table
-- Everyone can view active and upcoming camps
CREATE POLICY donation_camps_view_public ON donation_camps
  FOR SELECT
  USING (status IN ('Upcoming', 'Active'));

-- Organizers can view all their camps
CREATE POLICY donation_camps_view_own ON donation_camps
  FOR SELECT
  USING (organizer_id = auth.uid());

-- Organizers can insert their own camps
CREATE POLICY donation_camps_insert_own ON donation_camps
  FOR INSERT
  WITH CHECK (organizer_id = auth.uid());

-- Organizers can update their own camps
CREATE POLICY donation_camps_update_own ON donation_camps
  FOR UPDATE
  USING (organizer_id = auth.uid());

-- Create policies for camp_registrations table
-- Camp organizers can view registrations for their camps
CREATE POLICY camp_registrations_view_organizer ON camp_registrations
  FOR SELECT
  USING (EXISTS (
    SELECT 1 FROM donation_camps dc 
    WHERE dc.id = camp_id AND dc.organizer_id = auth.uid()
  ));

-- Donors can view their own registrations
CREATE POLICY camp_registrations_view_donor ON camp_registrations
  FOR SELECT
  USING (EXISTS (
    SELECT 1 FROM donor_profiles dp 
    WHERE dp.id = donor_id AND dp.profile_id = auth.uid()
  ));

-- Donors can insert their own registrations
CREATE POLICY camp_registrations_insert_donor ON camp_registrations
  FOR INSERT
  WITH CHECK (EXISTS (
    SELECT 1 FROM donor_profiles dp 
    WHERE dp.id = donor_id AND dp.profile_id = auth.uid()
  ));

-- Donors can update their own registrations
CREATE POLICY camp_registrations_update_donor ON camp_registrations
  FOR UPDATE
  USING (EXISTS (
    SELECT 1 FROM donor_profiles dp 
    WHERE dp.id = donor_id AND dp.profile_id = auth.uid()
  ));

-- Create policies for notifications table
-- Users can view their own notifications
CREATE POLICY notifications_view_own ON notifications
  FOR SELECT
  USING (recipient_id = auth.uid());

-- Users can update their own notifications (e.g., mark as read)
CREATE POLICY notifications_update_own ON notifications
  FOR UPDATE
  USING (recipient_id = auth.uid());

-- Create policies for donation_history table
-- Donors can view their own donation history
CREATE POLICY donation_history_view_donor ON donation_history
  FOR SELECT
  USING (EXISTS (
    SELECT 1 FROM donor_profiles dp 
    WHERE dp.id = donor_id AND dp.profile_id = auth.uid()
  ));

-- Requesters can view donation history related to their requests
CREATE POLICY donation_history_view_requester ON donation_history
  FOR SELECT
  USING (EXISTS (
    SELECT 1 FROM blood_requests br 
    WHERE br.id = request_id AND br.requester_id = auth.uid()
  ));

-- Admin policies
-- Create admin policies for all tables
CREATE POLICY admin_all_profiles ON profiles
  FOR ALL
  USING (EXISTS (
    SELECT 1 FROM profiles p WHERE p.id = auth.uid() AND p.is_admin = TRUE
  ));

CREATE POLICY admin_all_donor_profiles ON donor_profiles
  FOR ALL
  USING (EXISTS (
    SELECT 1 FROM profiles p WHERE p.id = auth.uid() AND p.is_admin = TRUE
  ));

CREATE POLICY admin_all_blood_requests ON blood_requests
  FOR ALL
  USING (EXISTS (
    SELECT 1 FROM profiles p WHERE p.id = auth.uid() AND p.is_admin = TRUE
  ));

CREATE POLICY admin_all_donation_matches ON donation_matches
  FOR ALL
  USING (EXISTS (
    SELECT 1 FROM profiles p WHERE p.id = auth.uid() AND p.is_admin = TRUE
  ));

CREATE POLICY admin_all_donation_camps ON donation_camps
  FOR ALL
  USING (EXISTS (
    SELECT 1 FROM profiles p WHERE p.id = auth.uid() AND p.is_admin = TRUE
  ));

CREATE POLICY admin_all_camp_registrations ON camp_registrations
  FOR ALL
  USING (EXISTS (
    SELECT 1 FROM profiles p WHERE p.id = auth.uid() AND p.is_admin = TRUE
  ));

CREATE POLICY admin_all_notifications ON notifications
  FOR ALL
  USING (EXISTS (
    SELECT 1 FROM profiles p WHERE p.id = auth.uid() AND p.is_admin = TRUE
  ));

CREATE POLICY admin_all_donation_history ON donation_history
  FOR ALL
  USING (EXISTS (
    SELECT 1 FROM profiles p WHERE p.id = auth.uid() AND p.is_admin = TRUE
  ));

-- Create a function to handle new user registration
CREATE OR REPLACE FUNCTION handle_new_user() 
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO profiles (id, email, is_donor, is_recipient, created_at)
  VALUES (NEW.id, NEW.email, FALSE, FALSE, NOW());
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger to create a profile when a new user signs up
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION handle_new_user(); 