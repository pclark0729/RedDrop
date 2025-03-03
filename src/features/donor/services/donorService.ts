import supabase from '../../../app/supabase';
import { BloodType, DonorProfile, DonorProfileFormData, DonorSearchParams, DonationHistory, DonorStats } from '../types';
import { authService } from '../../auth/services/authService';

interface ServiceResponse<T = void> {
  data: T | null;
  error: Error | null;
}

class DonorService {
  /**
   * Create a new donor profile for the current user
   */
  async createDonorProfile(profileData: DonorProfileFormData): Promise<ServiceResponse<DonorProfile>> {
    try {
      const currentUser = await authService.getCurrentUser();
      
      if (!currentUser) {
        throw new Error('User not authenticated');
      }
      
      // First, update the main profile to mark as donor
      const { error: profileError } = await supabase
        .from('profiles')
        .update({ is_donor: true })
        .eq('id', currentUser.id);
      
      if (profileError) throw profileError;
      
      // Then create the donor profile
      const { data, error } = await supabase
        .from('donor_profiles')
        .insert({
          profile_id: currentUser.id,
          blood_type: profileData.blood_type,
          weight: profileData.weight,
          height: profileData.height,
          medical_conditions: profileData.medical_conditions || [],
          medications: profileData.medications || [],
          is_verified: false, // New profiles start unverified
          is_available: profileData.is_available,
          availability_radius_km: profileData.availability_radius_km,
          donation_count: 0, // New profiles start with 0 donations
        })
        .select('*')
        .single();
      
      if (error) throw error;
      
      return { data, error: null };
    } catch (error) {
      console.error('Error creating donor profile:', error);
      return { data: null, error: error instanceof Error ? error : new Error('An unknown error occurred') };
    }
  }

  /**
   * Get the donor profile for the current user
   */
  async getCurrentDonorProfile(): Promise<ServiceResponse<DonorProfile>> {
    try {
      const currentUser = await authService.getCurrentUser();
      
      if (!currentUser) {
        throw new Error('User not authenticated');
      }
      
      const { data, error } = await supabase
        .from('donor_profiles')
        .select('*')
        .eq('profile_id', currentUser.id)
        .single();
      
      if (error) {
        // If error is 'not found', return null data without error
        if (error.code === 'PGRST116') {
          return { data: null, error: null };
        }
        throw error;
      }
      
      return { data, error: null };
    } catch (error) {
      console.error('Error getting donor profile:', error);
      return { data: null, error: error instanceof Error ? error : new Error('An unknown error occurred') };
    }
  }

  /**
   * Update the donor profile for the current user
   */
  async updateDonorProfile(profileData: Partial<DonorProfileFormData>): Promise<ServiceResponse> {
    try {
      const currentUser = await authService.getCurrentUser();
      
      if (!currentUser) {
        throw new Error('User not authenticated');
      }
      
      // Get the current donor profile
      const { data: donorProfile, error: fetchError } = await this.getCurrentDonorProfile();
      
      if (fetchError) throw fetchError;
      if (!donorProfile) {
        throw new Error('Donor profile not found');
      }
      
      // Update the donor profile
      const { error } = await supabase
        .from('donor_profiles')
        .update({
          ...profileData,
          updated_at: new Date().toISOString(),
        })
        .eq('id', donorProfile.id);
      
      if (error) throw error;
      
      return { data: null, error: null };
    } catch (error) {
      console.error('Error updating donor profile:', error);
      return { data: null, error: error instanceof Error ? error : new Error('An unknown error occurred') };
    }
  }

  /**
   * Get a donor profile by ID
   */
  async getDonorProfileById(id: string): Promise<ServiceResponse<DonorProfile>> {
    try {
      const { data, error } = await supabase
        .from('donor_profiles')
        .select('*')
        .eq('id', id)
        .single();
      
      if (error) throw error;
      
      return { data, error: null };
    } catch (error) {
      console.error('Error getting donor profile by ID:', error);
      return { data: null, error: error instanceof Error ? error : new Error('An unknown error occurred') };
    }
  }

  /**
   * Search for donors based on criteria
   */
  async searchDonors(params: DonorSearchParams): Promise<ServiceResponse<DonorProfile[]>> {
    try {
      let query = supabase
        .from('donor_profiles')
        .select('*, profiles!inner(*)')
        .eq('is_verified', true); // Only return verified donors
      
      // Apply blood type filter if provided
      if (params.blood_type) {
        query = query.eq('blood_type', params.blood_type);
      }
      
      // Apply availability filter if provided
      if (params.is_available !== undefined) {
        query = query.eq('is_available', params.is_available);
      }
      
      // Apply location filter if provided
      if (params.location) {
        // This would use PostGIS in a real implementation
        // For now, we'll just fetch all and filter client-side
        // In a real app, you'd use a function like ST_DWithin
      }
      
      const { data, error } = await query;
      
      if (error) throw error;
      
      // If location filtering is needed, we'd do it here
      let filteredData = data;
      if (params.location) {
        // Client-side filtering based on distance
        // This is just a placeholder - in a real app, you'd use the database for this
        filteredData = data.filter(donor => {
          const profile = donor.profiles;
          if (!profile.latitude || !profile.longitude) return false;
          
          // Calculate distance (simplified)
          const distance = this.calculateDistance(
            params.location!.latitude,
            params.location!.longitude,
            profile.latitude,
            profile.longitude
          );
          
          return distance <= params.location!.radius_km;
        });
      }
      
      return { data: filteredData, error: null };
    } catch (error) {
      console.error('Error searching donors:', error);
      return { data: null, error: error instanceof Error ? error : new Error('An unknown error occurred') };
    }
  }

  /**
   * Get donation history for the current user
   */
  async getDonationHistory(): Promise<ServiceResponse<DonationHistory[]>> {
    try {
      const currentUser = await authService.getCurrentUser();
      
      if (!currentUser) {
        throw new Error('User not authenticated');
      }
      
      // Get the current donor profile
      const { data: donorProfile, error: fetchError } = await this.getCurrentDonorProfile();
      
      if (fetchError) throw fetchError;
      if (!donorProfile) {
        return { data: [], error: null }; // No donor profile means no donations
      }
      
      const { data, error } = await supabase
        .from('donation_history')
        .select('*')
        .eq('donor_id', donorProfile.id)
        .order('donation_date', { ascending: false });
      
      if (error) throw error;
      
      return { data, error: null };
    } catch (error) {
      console.error('Error getting donation history:', error);
      return { data: null, error: error instanceof Error ? error : new Error('An unknown error occurred') };
    }
  }

  /**
   * Get donor statistics for the current user
   */
  async getDonorStats(): Promise<ServiceResponse<DonorStats>> {
    try {
      const { data: history, error } = await this.getDonationHistory();
      
      if (error) throw error;
      if (!history || history.length === 0) {
        return {
          data: {
            total_donations: 0,
            last_donation_date: null,
            donation_streak: 0,
            lives_impacted: 0
          },
          error: null
        };
      }
      
      // Calculate stats
      const totalDonations = history.length;
      const lastDonationDate = history[0].donation_date; // Already sorted by date desc
      
      // This is a simplified calculation - in a real app, you'd have more complex logic
      const livesImpacted = totalDonations * 3; // Assuming each donation can help up to 3 people
      
      // Simplified streak calculation - in a real app, you'd check for regular donations
      const donationStreak = 1;
      
      return {
        data: {
          total_donations: totalDonations,
          last_donation_date: lastDonationDate,
          donation_streak: donationStreak,
          lives_impacted: livesImpacted
        },
        error: null
      };
    } catch (error) {
      console.error('Error getting donor stats:', error);
      return { data: null, error: error instanceof Error ? error : new Error('An unknown error occurred') };
    }
  }

  /**
   * Upload a health document for the current donor
   */
  async uploadHealthDocument(file: File, documentType: string): Promise<ServiceResponse<string>> {
    try {
      const currentUser = await authService.getCurrentUser();
      
      if (!currentUser) {
        throw new Error('User not authenticated');
      }
      
      // Get the current donor profile
      const { data: donorProfile, error: fetchError } = await this.getCurrentDonorProfile();
      
      if (fetchError) throw fetchError;
      if (!donorProfile) {
        throw new Error('Donor profile not found');
      }
      
      // Create a unique file name
      const fileExt = file.name.split('.').pop();
      const fileName = `${donorProfile.id}-${documentType}-${Math.random().toString(36).substring(2)}.${fileExt}`;
      const filePath = `health_documents/${fileName}`;
      
      // Upload the file
      const { error: uploadError } = await supabase.storage
        .from('donor_documents')
        .upload(filePath, file);
      
      if (uploadError) throw uploadError;
      
      // Get the public URL
      const { data: urlData } = supabase.storage
        .from('donor_documents')
        .getPublicUrl(filePath);
      
      const documentUrl = urlData.publicUrl;
      
      // Update the donor profile with the new document
      const { error: updateError } = await supabase.rpc('add_health_document', {
        donor_id: donorProfile.id,
        document_url: documentUrl,
        document_type: documentType
      });
      
      if (updateError) throw updateError;
      
      return { data: documentUrl, error: null };
    } catch (error) {
      console.error('Error uploading health document:', error);
      return { data: null, error: error instanceof Error ? error : new Error('An unknown error occurred') };
    }
  }

  /**
   * Helper function to calculate distance between two points
   * This is a simplified version using the Haversine formula
   */
  private calculateDistance(lat1: number, lon1: number, lat2: number, lon2: number): number {
    const R = 6371; // Radius of the earth in km
    const dLat = this.deg2rad(lat2 - lat1);
    const dLon = this.deg2rad(lon2 - lon1);
    const a =
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos(this.deg2rad(lat1)) * Math.cos(this.deg2rad(lat2)) *
      Math.sin(dLon / 2) * Math.sin(dLon / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    const distance = R * c; // Distance in km
    return distance;
  }

  private deg2rad(deg: number): number {
    return deg * (Math.PI / 180);
  }
}

export const donorService = new DonorService();
export default donorService; 