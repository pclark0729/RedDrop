export type BloodType = 'A+' | 'A-' | 'B+' | 'B-' | 'AB+' | 'AB-' | 'O+' | 'O-';
export type UrgencyLevel = 'Normal' | 'Urgent' | 'Critical';
export type RequestStatus = 'Pending' | 'Matching' | 'Fulfilled' | 'Cancelled';

export interface BloodRequest {
  id: string;
  created_at: string;
  updated_at: string;
  requester_id: string;
  patient_name: string;
  blood_type: BloodType;
  units_needed: number;
  hospital_name: string;
  hospital_address: string;
  hospital_city: string;
  hospital_state: string;
  hospital_postal_code: string;
  hospital_latitude: number | null;
  hospital_longitude: number | null;
  urgency_level: UrgencyLevel;
  required_by_date: string;
  status: RequestStatus;
  medical_notes: string | null;
  contact_phone: string;
  contact_email: string;
}

export interface BloodRequestFormData {
  patient_name: string;
  blood_type: BloodType;
  units_needed: number;
  hospital_name: string;
  hospital_address: string;
  hospital_city: string;
  hospital_state: string;
  hospital_postal_code: string;
  urgency_level: UrgencyLevel;
  required_by_date: string;
  medical_notes?: string;
  contact_phone: string;
  contact_email: string;
}

export interface BloodRequestFilters {
  blood_type?: BloodType;
  urgency_level?: UrgencyLevel;
  status?: RequestStatus;
  city?: string;
  state?: string;
}

export interface DonationMatch {
  id: string;
  created_at: string;
  updated_at: string;
  request_id: string;
  donor_id: string;
  status: 'Pending' | 'Accepted' | 'Declined' | 'Completed' | 'Cancelled';
  response_time: string | null;
  donation_time: string | null;
  notes: string | null;
  request?: BloodRequest;
  donor?: {
    id: string;
    profile_id: string;
    blood_type: BloodType;
    first_name?: string;
    last_name?: string;
    phone_number?: string;
    email?: string;
  };
}

export interface MatchRequestResponse {
  success: boolean;
  matches: DonationMatch[];
  message?: string;
} 