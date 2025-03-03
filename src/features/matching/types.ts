import { BloodType } from '../bloodRequest/types';

export enum MatchStatus {
  PENDING = 'Pending',
  ACCEPTED = 'Accepted',
  DECLINED = 'Declined',
  COMPLETED = 'Completed',
  CANCELLED = 'Cancelled'
}

export interface DonorMatch {
  id: string;
  created_at: string;
  updated_at: string;
  request_id: string;
  donor_id: string;
  status: MatchStatus;
  response_time: string | null;
  donation_time: string | null;
  notes: string | null;
  
  // Expanded properties (from joins)
  donor_name?: string;
  donor_blood_type?: BloodType;
  donor_phone?: string;
  donor_email?: string;
  request_blood_type?: BloodType;
  request_hospital_name?: string;
  request_hospital_address?: string;
  request_hospital_city?: string;
  request_hospital_state?: string;
  request_units_needed?: number;
  request_urgency_level?: string;
  request_required_by_date?: string;
  distance_km?: number;
}

export interface MatchFilters {
  status?: MatchStatus;
  bloodType?: BloodType;
  city?: string;
  state?: string;
  startDate?: string;
  endDate?: string;
}

export interface MatchUpdateData {
  status: MatchStatus;
  donation_time?: string;
  notes?: string;
}

export interface MatchingAlgorithmParams {
  requestId: string;
  maxDistance?: number;
  maxResults?: number;
  includeUnavailableDonors?: boolean;
}

export interface MatchingResult {
  matches: DonorMatch[];
  totalCount: number;
  requestDetails: {
    id: string;
    blood_type: BloodType;
    units_needed: number;
    hospital_name: string;
    hospital_city: string;
    hospital_state: string;
    urgency_level: string;
    required_by_date: string;
  };
}

export interface MatchStatistics {
  totalMatches: number;
  pendingMatches: number;
  acceptedMatches: number;
  completedMatches: number;
  declinedMatches: number;
  cancelledMatches: number;
  averageResponseTimeMinutes: number;
  matchSuccessRate: number; // Percentage of accepted/completed matches
}

export interface BloodCompatibility {
  donorType: BloodType;
  recipientTypes: BloodType[];
}

// Blood type compatibility chart
export const BLOOD_COMPATIBILITY: BloodCompatibility[] = [
  {
    donorType: BloodType.O_NEGATIVE,
    recipientTypes: [
      BloodType.O_NEGATIVE, BloodType.O_POSITIVE, 
      BloodType.A_NEGATIVE, BloodType.A_POSITIVE, 
      BloodType.B_NEGATIVE, BloodType.B_POSITIVE, 
      BloodType.AB_NEGATIVE, BloodType.AB_POSITIVE
    ]
  },
  {
    donorType: BloodType.O_POSITIVE,
    recipientTypes: [
      BloodType.O_POSITIVE, 
      BloodType.A_POSITIVE, 
      BloodType.B_POSITIVE, 
      BloodType.AB_POSITIVE
    ]
  },
  {
    donorType: BloodType.A_NEGATIVE,
    recipientTypes: [
      BloodType.A_NEGATIVE, BloodType.A_POSITIVE, 
      BloodType.AB_NEGATIVE, BloodType.AB_POSITIVE
    ]
  },
  {
    donorType: BloodType.A_POSITIVE,
    recipientTypes: [
      BloodType.A_POSITIVE, 
      BloodType.AB_POSITIVE
    ]
  },
  {
    donorType: BloodType.B_NEGATIVE,
    recipientTypes: [
      BloodType.B_NEGATIVE, BloodType.B_POSITIVE, 
      BloodType.AB_NEGATIVE, BloodType.AB_POSITIVE
    ]
  },
  {
    donorType: BloodType.B_POSITIVE,
    recipientTypes: [
      BloodType.B_POSITIVE, 
      BloodType.AB_POSITIVE
    ]
  },
  {
    donorType: BloodType.AB_NEGATIVE,
    recipientTypes: [
      BloodType.AB_NEGATIVE, BloodType.AB_POSITIVE
    ]
  },
  {
    donorType: BloodType.AB_POSITIVE,
    recipientTypes: [
      BloodType.AB_POSITIVE
    ]
  }
];

// Helper function to check if donor blood type is compatible with recipient blood type
export function isBloodTypeCompatible(donorType: BloodType, recipientType: BloodType): boolean {
  const compatibility = BLOOD_COMPATIBILITY.find(c => c.donorType === donorType);
  return compatibility ? compatibility.recipientTypes.includes(recipientType) : false;
} 