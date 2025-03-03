export enum CampStatus {
  UPCOMING = 'Upcoming',
  ACTIVE = 'Active',
  COMPLETED = 'Completed',
  CANCELLED = 'Cancelled'
}

export enum RegistrationStatus {
  REGISTERED = 'Registered',
  CHECKED_IN = 'Checked-in',
  COMPLETED = 'Completed',
  CANCELLED = 'Cancelled'
}

export interface DonationCamp {
  id: string;
  created_at: string;
  updated_at: string;
  name: string;
  description: string;
  organizer_id: string;
  start_date: string;
  end_date: string;
  address: string;
  city: string;
  state: string;
  postal_code: string;
  country: string;
  latitude: number | null;
  longitude: number | null;
  contact_phone: string;
  contact_email: string;
  website: string | null;
  max_capacity: number | null;
  registration_required: boolean;
  status: CampStatus;
}

export interface DonationCampFormData {
  name: string;
  description: string;
  start_date: string;
  end_date: string;
  address: string;
  city: string;
  state: string;
  postal_code: string;
  country: string;
  latitude?: number;
  longitude?: number;
  contact_phone: string;
  contact_email: string;
  website?: string;
  max_capacity?: number;
  registration_required: boolean;
}

export interface CampRegistration {
  id: string;
  created_at: string;
  updated_at: string;
  camp_id: string;
  donor_id: string;
  registration_date: string;
  status: RegistrationStatus;
  check_in_time: string | null;
  check_out_time: string | null;
  notes: string | null;
}

export interface CampFilters {
  status?: CampStatus;
  city?: string;
  state?: string;
  startDate?: string;
  endDate?: string;
  searchTerm?: string;
}

export interface CampStatistics {
  totalRegistrations: number;
  checkedInCount: number;
  completedCount: number;
  cancelledCount: number;
  registrationRate: number; // percentage of capacity filled
} 