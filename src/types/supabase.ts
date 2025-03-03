export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[];

export interface Database {
  public: {
    Tables: {
      profiles: {
        Row: {
          id: string;
          created_at: string;
          updated_at: string | null;
          email: string;
          first_name: string | null;
          last_name: string | null;
          phone_number: string | null;
          date_of_birth: string | null;
          address: string | null;
          city: string | null;
          state: string | null;
          postal_code: string | null;
          country: string | null;
          latitude: number | null;
          longitude: number | null;
          avatar_url: string | null;
          is_donor: boolean;
          is_recipient: boolean;
          is_admin: boolean;
          notification_preferences: Json | null;
          last_active: string | null;
        };
        Insert: {
          id: string;
          created_at?: string;
          updated_at?: string | null;
          email: string;
          first_name?: string | null;
          last_name?: string | null;
          phone_number?: string | null;
          date_of_birth?: string | null;
          address?: string | null;
          city?: string | null;
          state?: string | null;
          postal_code?: string | null;
          country?: string | null;
          latitude?: number | null;
          longitude?: number | null;
          avatar_url?: string | null;
          is_donor?: boolean;
          is_recipient?: boolean;
          is_admin?: boolean;
          notification_preferences?: Json | null;
          last_active?: string | null;
        };
        Update: {
          id?: string;
          created_at?: string;
          updated_at?: string | null;
          email?: string;
          first_name?: string | null;
          last_name?: string | null;
          phone_number?: string | null;
          date_of_birth?: string | null;
          address?: string | null;
          city?: string | null;
          state?: string | null;
          postal_code?: string | null;
          country?: string | null;
          latitude?: number | null;
          longitude?: number | null;
          avatar_url?: string | null;
          is_donor?: boolean;
          is_recipient?: boolean;
          is_admin?: boolean;
          notification_preferences?: Json | null;
          last_active?: string | null;
        };
      };
      // Add other tables as needed
    };
    Views: {
      [_ in never]: never;
    };
    Functions: {
      [_ in never]: never;
    };
    Enums: {
      [_ in never]: never;
    };
  };
} 