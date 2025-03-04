-- RedDrop Database Schema

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "postgis"; -- For geospatial functionality
CREATE EXTENSION IF NOT EXISTS "pg_trgm"; -- For text search

-- Set up custom types
CREATE TYPE blood_type AS ENUM ('A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-');
CREATE TYPE urgency_level AS ENUM ('Normal', 'Urgent', 'Critical');
CREATE TYPE request_status AS ENUM ('Pending', 'Matching', 'Fulfilled', 'Cancelled');
CREATE TYPE donation_status AS ENUM ('Scheduled', 'Completed', 'Cancelled');
CREATE TYPE notification_type AS ENUM ('Request', 'Match', 'Camp', 'System');

-- Profiles table (extends Supabase auth.users)
CREATE TABLE profiles (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    email TEXT NOT NULL,
    first_name TEXT,
    last_name TEXT,
    blood_type TEXT,
    phone_number TEXT,
    address TEXT,
    emergency_contact_name TEXT,
    emergency_contact_phone TEXT,
    medical_conditions TEXT,
    allergies TEXT,
    medications TEXT,
    donation_frequency TEXT DEFAULT 'occasional',
    onboarding_completed BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create a trigger to automatically create a profile when a new user signs up
CREATE OR REPLACE FUNCTION public.handle_new_user() 
RETURNS TRIGGER AS $$
BEGIN
    INSERT INTO public.profiles (id, email, created_at, updated_at)
    VALUES (new.id, new.email, NOW(), NOW());
    RETURN new;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER on_auth_user_created
    AFTER INSERT ON auth.users
    FOR EACH ROW EXECUTE PROCEDURE public.handle_new_user();

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

-- Blood Drives table
CREATE TABLE blood_drives (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name TEXT NOT NULL,
    description TEXT,
    location TEXT NOT NULL,
    drive_date TIMESTAMP WITH TIME ZONE NOT NULL,
    end_date TIMESTAMP WITH TIME ZONE NOT NULL,
    slots_available INTEGER NOT NULL DEFAULT 20,
    urgency_level TEXT DEFAULT 'normal',
    organizer_id UUID REFERENCES profiles(id),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TRIGGER set_timestamp_blood_drives
BEFORE UPDATE ON blood_drives
FOR EACH ROW
EXECUTE FUNCTION update_modified_column();

-- Donations table
CREATE TABLE donations (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    donor_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
    blood_drive_id UUID REFERENCES blood_drives(id),
    donation_date TIMESTAMP WITH TIME ZONE NOT NULL,
    blood_type TEXT,
    amount_ml INTEGER DEFAULT 450,
    location TEXT,
    status TEXT DEFAULT 'completed',
    notes TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TRIGGER set_timestamp_donations
BEFORE UPDATE ON donations
FOR EACH ROW
EXECUTE FUNCTION update_modified_column();

-- Blood Requests table
CREATE TABLE blood_requests (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    requester_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
    patient_name TEXT NOT NULL,
    blood_type TEXT NOT NULL,
    units_needed INTEGER NOT NULL DEFAULT 1,
    hospital TEXT NOT NULL,
    urgency_level TEXT NOT NULL DEFAULT 'normal',
    reason TEXT,
    status TEXT DEFAULT 'pending',
    needed_by TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TRIGGER set_timestamp_blood_requests
BEFORE UPDATE ON blood_requests
FOR EACH ROW
EXECUTE FUNCTION update_modified_column();

-- Donation Appointments table
CREATE TABLE donation_appointments (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    donor_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
    blood_drive_id UUID REFERENCES blood_drives(id),
    appointment_date TIMESTAMP WITH TIME ZONE NOT NULL,
    status TEXT DEFAULT 'scheduled',
    notes TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TRIGGER set_timestamp_donation_appointments
BEFORE UPDATE ON donation_appointments
FOR EACH ROW
EXECUTE FUNCTION update_modified_column();

-- Matches table (connects donations to requests)
CREATE TABLE matches (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    donation_id UUID NOT NULL REFERENCES donations(id) ON DELETE CASCADE,
    request_id UUID NOT NULL REFERENCES blood_requests(id) ON DELETE CASCADE,
    status TEXT DEFAULT 'matched',
    matched_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TRIGGER set_timestamp_matches
BEFORE UPDATE ON matches
FOR EACH ROW
EXECUTE FUNCTION update_modified_column();

-- Notifications table
CREATE TABLE notifications (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
    title TEXT NOT NULL,
    message TEXT NOT NULL,
    type TEXT NOT NULL,
    is_read BOOLEAN DEFAULT FALSE,
    related_entity_id UUID,
    related_entity_type TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Row Level Security Policies

-- Profiles: Users can read all profiles but only update their own
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Profiles are viewable by everyone" 
    ON profiles FOR SELECT 
    USING (true);

CREATE POLICY "Users can update their own profile" 
    ON profiles FOR UPDATE 
    USING (auth.uid() = id);

-- Blood Drives: Anyone can view, only admins can create/update
ALTER TABLE blood_drives ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Blood drives are viewable by everyone" 
    ON blood_drives FOR SELECT 
    USING (true);

-- Donations: Users can view their own donations
ALTER TABLE donations ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own donations" 
    ON donations FOR SELECT 
    USING (auth.uid() = donor_id);

-- Blood Requests: Users can view their own requests
ALTER TABLE blood_requests ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own blood requests" 
    ON blood_requests FOR SELECT 
    USING (auth.uid() = requester_id);

-- Donation Appointments: Users can view and manage their own appointments
ALTER TABLE donation_appointments ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own appointments" 
    ON donation_appointments FOR SELECT 
    USING (auth.uid() = donor_id);

CREATE POLICY "Users can insert their own appointments" 
    ON donation_appointments FOR INSERT 
    WITH CHECK (auth.uid() = donor_id);

CREATE POLICY "Users can update their own appointments" 
    ON donation_appointments FOR UPDATE 
    USING (auth.uid() = donor_id);

-- Notifications: Users can only view their own notifications
ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own notifications" 
    ON notifications FOR SELECT 
    USING (auth.uid() = user_id);

CREATE POLICY "Users can update their own notifications" 
    ON notifications FOR UPDATE 
    USING (auth.uid() = user_id);

-- Create indexes for performance
CREATE INDEX idx_profiles_email ON profiles(email);
CREATE INDEX idx_blood_drives_date ON blood_drives(drive_date);
CREATE INDEX idx_donations_donor ON donations(donor_id);
CREATE INDEX idx_donations_date ON donations(donation_date);
CREATE INDEX idx_blood_requests_requester ON blood_requests(requester_id);
CREATE INDEX idx_blood_requests_blood_type ON blood_requests(blood_type);
CREATE INDEX idx_appointments_donor ON donation_appointments(donor_id);
CREATE INDEX idx_appointments_date ON donation_appointments(appointment_date);
CREATE INDEX idx_notifications_user ON notifications(user_id);
CREATE INDEX idx_notifications_read ON notifications(is_read); 