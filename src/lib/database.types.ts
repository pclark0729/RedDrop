export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export interface Database {
  public: {
    Tables: {
      profiles: {
        Row: {
          id: string
          email: string
          first_name: string | null
          last_name: string | null
          blood_type: string | null
          phone_number: string | null
          address: string | null
          emergency_contact_name: string | null
          emergency_contact_phone: string | null
          medical_conditions: string | null
          allergies: string | null
          medications: string | null
          donation_frequency: string
          onboarding_completed: boolean
          created_at: string
          updated_at: string
        }
        Insert: {
          id: string
          email: string
          first_name?: string | null
          last_name?: string | null
          blood_type?: string | null
          phone_number?: string | null
          address?: string | null
          emergency_contact_name?: string | null
          emergency_contact_phone?: string | null
          medical_conditions?: string | null
          allergies?: string | null
          medications?: string | null
          donation_frequency?: string
          onboarding_completed?: boolean
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          email?: string
          first_name?: string | null
          last_name?: string | null
          blood_type?: string | null
          phone_number?: string | null
          address?: string | null
          emergency_contact_name?: string | null
          emergency_contact_phone?: string | null
          medical_conditions?: string | null
          allergies?: string | null
          medications?: string | null
          donation_frequency?: string
          onboarding_completed?: boolean
          created_at?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "profiles_id_fkey"
            columns: ["id"]
            isOneToOne: true
            referencedRelation: "users"
            referencedColumns: ["id"]
          }
        ]
      }
      blood_drives: {
        Row: {
          id: string
          name: string
          description: string | null
          location: string
          drive_date: string
          end_date: string
          slots_available: number
          urgency_level: string
          organizer_id: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          name: string
          description?: string | null
          location: string
          drive_date: string
          end_date: string
          slots_available?: number
          urgency_level?: string
          organizer_id?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          name?: string
          description?: string | null
          location?: string
          drive_date?: string
          end_date?: string
          slots_available?: number
          urgency_level?: string
          organizer_id?: string | null
          created_at?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "blood_drives_organizer_id_fkey"
            columns: ["organizer_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          }
        ]
      }
      donations: {
        Row: {
          id: string
          donor_id: string
          blood_drive_id: string | null
          donation_date: string
          blood_type: string | null
          amount_ml: number
          location: string | null
          status: string
          notes: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          donor_id: string
          blood_drive_id?: string | null
          donation_date: string
          blood_type?: string | null
          amount_ml?: number
          location?: string | null
          status?: string
          notes?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          donor_id?: string
          blood_drive_id?: string | null
          donation_date?: string
          blood_type?: string | null
          amount_ml?: number
          location?: string | null
          status?: string
          notes?: string | null
          created_at?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "donations_blood_drive_id_fkey"
            columns: ["blood_drive_id"]
            isOneToOne: false
            referencedRelation: "blood_drives"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "donations_donor_id_fkey"
            columns: ["donor_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          }
        ]
      }
      blood_requests: {
        Row: {
          id: string
          requester_id: string
          patient_name: string
          blood_type: string
          units_needed: number
          hospital: string
          urgency_level: string
          reason: string | null
          status: string
          needed_by: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          requester_id: string
          patient_name: string
          blood_type: string
          units_needed?: number
          hospital: string
          urgency_level?: string
          reason?: string | null
          status?: string
          needed_by?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          requester_id?: string
          patient_name?: string
          blood_type?: string
          units_needed?: number
          hospital?: string
          urgency_level?: string
          reason?: string | null
          status?: string
          needed_by?: string | null
          created_at?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "blood_requests_requester_id_fkey"
            columns: ["requester_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          }
        ]
      }
      donation_appointments: {
        Row: {
          id: string
          donor_id: string
          blood_drive_id: string | null
          appointment_date: string
          status: string
          notes: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          donor_id: string
          blood_drive_id?: string | null
          appointment_date: string
          status?: string
          notes?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          donor_id?: string
          blood_drive_id?: string | null
          appointment_date?: string
          status?: string
          notes?: string | null
          created_at?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "donation_appointments_blood_drive_id_fkey"
            columns: ["blood_drive_id"]
            isOneToOne: false
            referencedRelation: "blood_drives"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "donation_appointments_donor_id_fkey"
            columns: ["donor_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          }
        ]
      }
      matches: {
        Row: {
          id: string
          donation_id: string
          request_id: string
          status: string
          matched_at: string
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          donation_id: string
          request_id: string
          status?: string
          matched_at?: string
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          donation_id?: string
          request_id?: string
          status?: string
          matched_at?: string
          created_at?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "matches_donation_id_fkey"
            columns: ["donation_id"]
            isOneToOne: false
            referencedRelation: "donations"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "matches_request_id_fkey"
            columns: ["request_id"]
            isOneToOne: false
            referencedRelation: "blood_requests"
            referencedColumns: ["id"]
          }
        ]
      }
      notifications: {
        Row: {
          id: string
          user_id: string
          title: string
          message: string
          type: string
          is_read: boolean
          related_entity_id: string | null
          related_entity_type: string | null
          created_at: string
        }
        Insert: {
          id?: string
          user_id: string
          title: string
          message: string
          type: string
          is_read?: boolean
          related_entity_id?: string | null
          related_entity_type?: string | null
          created_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          title?: string
          message?: string
          type?: string
          is_read?: boolean
          related_entity_id?: string | null
          related_entity_type?: string | null
          created_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "notifications_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          }
        ]
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      [_ in never]: never
    }
    Enums: {
      [_ in never]: never
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

// Helper types for common entities
export type Profile = Database['public']['Tables']['profiles']['Row']
export type BloodDrive = Database['public']['Tables']['blood_drives']['Row']
export type Donation = Database['public']['Tables']['donations']['Row']
export type BloodRequest = Database['public']['Tables']['blood_requests']['Row']
export type DonationAppointment = Database['public']['Tables']['donation_appointments']['Row']
export type Notification = Database['public']['Tables']['notifications']['Row']

// Types with joined data
export type DonationWithBloodDrive = Donation & {
  blood_drive: Pick<BloodDrive, 'name' | 'location'> | null
}

export type AppointmentWithBloodDrive = DonationAppointment & {
  blood_drive: Pick<BloodDrive, 'name' | 'location' | 'drive_date'> | null
} 