import { AuthUser } from '../auth/services/authService';

export type BloodType = 'A+' | 'A-' | 'B+' | 'B-' | 'AB+' | 'AB-' | 'O+' | 'O-';

export interface DonorProfile {
  id: string;
  profile_id: string;
  created_at: string;
  updated_at: string;
  blood_type: BloodType;
  weight: number | null;
  height: number | null;
  medical_conditions: string[];
  medications: string[];
  is_verified: boolean;
  verification_date: string | null;
  last_donation_date: string | null;
  donation_count: number;
  is_available: boolean;
  availability_radius_km: number | null;
  health_documents: any[]; // This would be more specifically typed in a real app
}

export interface DonorProfileFormData {
  blood_type: BloodType;
  weight: number | null;
  height: number | null;
  medical_conditions: string[];
  medications: string[];
  is_available: boolean;
  availability_radius_km: number | null;
}

export interface DonorWithProfile extends AuthUser {
  donorProfile: DonorProfile | null;
}

export interface DonationHistory {
  id: string;
  created_at: string;
  donor_id: string;
  request_id: string | null;
  camp_id: string | null;
  donation_date: string;
  blood_type: BloodType;
  units_donated: number;
  location: string;
  notes: string | null;
  verified_by: string | null;
}

export interface DonorSearchParams {
  blood_type?: BloodType;
  is_available?: boolean;
  location?: {
    latitude: number;
    longitude: number;
    radius_km: number;
  };
}

export interface DonorStats {
  total_donations: number;
  last_donation_date: string | null;
  donation_streak: number;
  lives_impacted: number;
} 