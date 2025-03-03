import supabase from '../../../app/supabase';
import { 
  BloodRequest, 
  BloodRequestFormData, 
  BloodRequestFilters, 
  DonationMatch,
  MatchRequestResponse
} from '../types';

class BloodRequestService {
  /**
   * Create a new blood request
   */
  async createBloodRequest(data: BloodRequestFormData): Promise<BloodRequest> {
    try {
      // Get current user
      const { data: user, error: userError } = await supabase.auth.getUser();
      
      if (userError || !user.user) {
        throw new Error('You must be logged in to create a blood request');
      }
      
      // Create the blood request
      const { data: request, error } = await supabase
        .from('blood_requests')
        .insert({
          requester_id: user.user.id,
          patient_name: data.patient_name,
          blood_type: data.blood_type,
          units_needed: data.units_needed,
          hospital_name: data.hospital_name,
          hospital_address: data.hospital_address,
          hospital_city: data.hospital_city,
          hospital_state: data.hospital_state,
          hospital_postal_code: data.hospital_postal_code,
          urgency_level: data.urgency_level,
          required_by_date: data.required_by_date,
          status: 'Pending',
          medical_notes: data.medical_notes || null,
          contact_phone: data.contact_phone,
          contact_email: data.contact_email,
        })
        .select('*')
        .single();
      
      if (error) {
        throw new Error(`Failed to create blood request: ${error.message}`);
      }
      
      return request;
    } catch (error) {
      console.error('Error creating blood request:', error);
      throw error;
    }
  }

  /**
   * Get a blood request by ID
   */
  async getBloodRequestById(id: string): Promise<BloodRequest> {
    try {
      const { data, error } = await supabase
        .from('blood_requests')
        .select('*')
        .eq('id', id)
        .single();
      
      if (error) {
        throw new Error(`Failed to get blood request: ${error.message}`);
      }
      
      return data;
    } catch (error) {
      console.error('Error getting blood request:', error);
      throw error;
    }
  }

  /**
   * Get all blood requests for the current user
   */
  async getUserBloodRequests(): Promise<BloodRequest[]> {
    try {
      // Get current user
      const { data: user, error: userError } = await supabase.auth.getUser();
      
      if (userError || !user.user) {
        throw new Error('You must be logged in to view your blood requests');
      }
      
      // Get user's blood requests
      const { data, error } = await supabase
        .from('blood_requests')
        .select('*')
        .eq('requester_id', user.user.id)
        .order('created_at', { ascending: false });
      
      if (error) {
        throw new Error(`Failed to get blood requests: ${error.message}`);
      }
      
      return data || [];
    } catch (error) {
      console.error('Error getting user blood requests:', error);
      throw error;
    }
  }

  /**
   * Get all public blood requests with optional filters
   */
  async getPublicBloodRequests(filters?: BloodRequestFilters): Promise<BloodRequest[]> {
    try {
      let query = supabase
        .from('blood_requests')
        .select('*')
        .in('status', ['Pending', 'Matching'])
        .order('urgency_level', { ascending: false })
        .order('created_at', { ascending: false });
      
      // Apply filters if provided
      if (filters) {
        if (filters.blood_type) {
          query = query.eq('blood_type', filters.blood_type);
        }
        
        if (filters.urgency_level) {
          query = query.eq('urgency_level', filters.urgency_level);
        }
        
        if (filters.status) {
          query = query.eq('status', filters.status);
        }
        
        if (filters.city) {
          query = query.ilike('hospital_city', `%${filters.city}%`);
        }
        
        if (filters.state) {
          query = query.ilike('hospital_state', `%${filters.state}%`);
        }
      }
      
      const { data, error } = await query;
      
      if (error) {
        throw new Error(`Failed to get public blood requests: ${error.message}`);
      }
      
      return data || [];
    } catch (error) {
      console.error('Error getting public blood requests:', error);
      throw error;
    }
  }

  /**
   * Update a blood request
   */
  async updateBloodRequest(id: string, data: Partial<BloodRequestFormData>): Promise<BloodRequest> {
    try {
      // Get current user
      const { data: user, error: userError } = await supabase.auth.getUser();
      
      if (userError || !user.user) {
        throw new Error('You must be logged in to update a blood request');
      }
      
      // Check if the user owns this request
      const { data: request, error: requestError } = await supabase
        .from('blood_requests')
        .select('requester_id')
        .eq('id', id)
        .single();
      
      if (requestError) {
        throw new Error(`Failed to verify blood request ownership: ${requestError.message}`);
      }
      
      if (request.requester_id !== user.user.id) {
        throw new Error('You do not have permission to update this blood request');
      }
      
      // Update the blood request
      const { data: updatedRequest, error } = await supabase
        .from('blood_requests')
        .update(data)
        .eq('id', id)
        .select('*')
        .single();
      
      if (error) {
        throw new Error(`Failed to update blood request: ${error.message}`);
      }
      
      return updatedRequest;
    } catch (error) {
      console.error('Error updating blood request:', error);
      throw error;
    }
  }

  /**
   * Update the status of a blood request
   */
  async updateBloodRequestStatus(id: string, status: 'Pending' | 'Matching' | 'Fulfilled' | 'Cancelled'): Promise<BloodRequest> {
    try {
      // Get current user
      const { data: user, error: userError } = await supabase.auth.getUser();
      
      if (userError || !user.user) {
        throw new Error('You must be logged in to update a blood request status');
      }
      
      // Check if the user owns this request
      const { data: request, error: requestError } = await supabase
        .from('blood_requests')
        .select('requester_id')
        .eq('id', id)
        .single();
      
      if (requestError) {
        throw new Error(`Failed to verify blood request ownership: ${requestError.message}`);
      }
      
      if (request.requester_id !== user.user.id) {
        throw new Error('You do not have permission to update this blood request');
      }
      
      // Update the blood request status
      const { data: updatedRequest, error } = await supabase
        .from('blood_requests')
        .update({ status })
        .eq('id', id)
        .select('*')
        .single();
      
      if (error) {
        throw new Error(`Failed to update blood request status: ${error.message}`);
      }
      
      return updatedRequest;
    } catch (error) {
      console.error('Error updating blood request status:', error);
      throw error;
    }
  }

  /**
   * Delete a blood request
   */
  async deleteBloodRequest(id: string): Promise<void> {
    try {
      // Get current user
      const { data: user, error: userError } = await supabase.auth.getUser();
      
      if (userError || !user.user) {
        throw new Error('You must be logged in to delete a blood request');
      }
      
      // Check if the user owns this request
      const { data: request, error: requestError } = await supabase
        .from('blood_requests')
        .select('requester_id')
        .eq('id', id)
        .single();
      
      if (requestError) {
        throw new Error(`Failed to verify blood request ownership: ${requestError.message}`);
      }
      
      if (request.requester_id !== user.user.id) {
        throw new Error('You do not have permission to delete this blood request');
      }
      
      // Delete the blood request
      const { error } = await supabase
        .from('blood_requests')
        .delete()
        .eq('id', id);
      
      if (error) {
        throw new Error(`Failed to delete blood request: ${error.message}`);
      }
    } catch (error) {
      console.error('Error deleting blood request:', error);
      throw error;
    }
  }

  /**
   * Match a blood request with potential donors
   */
  async matchBloodRequest(requestId: string): Promise<MatchRequestResponse> {
    try {
      // Get current user
      const { data: user, error: userError } = await supabase.auth.getUser();
      
      if (userError || !user.user) {
        throw new Error('You must be logged in to match a blood request');
      }
      
      // Check if the user owns this request
      const { data: request, error: requestError } = await supabase
        .from('blood_requests')
        .select('*')
        .eq('id', requestId)
        .single();
      
      if (requestError) {
        throw new Error(`Failed to verify blood request ownership: ${requestError.message}`);
      }
      
      if (request.requester_id !== user.user.id) {
        throw new Error('You do not have permission to match this blood request');
      }
      
      // Call the find_compatible_donors function
      const { data, error } = await supabase
        .rpc('find_compatible_donors', {
          request_id: requestId,
          max_distance_km: 50 // Default max distance
        });
      
      if (error) {
        throw new Error(`Failed to match blood request: ${error.message}`);
      }
      
      // Update the blood request status to Matching
      await this.updateBloodRequestStatus(requestId, 'Matching');
      
      return {
        success: true,
        matches: data || [],
        message: data && data.length > 0 
          ? `Found ${data.length} potential donors` 
          : 'No matching donors found'
      };
    } catch (error) {
      console.error('Error matching blood request:', error);
      throw error;
    }
  }

  /**
   * Get all donation matches for a blood request
   */
  async getRequestMatches(requestId: string): Promise<DonationMatch[]> {
    try {
      // Get current user
      const { data: user, error: userError } = await supabase.auth.getUser();
      
      if (userError || !user.user) {
        throw new Error('You must be logged in to view donation matches');
      }
      
      // Check if the user owns this request
      const { data: request, error: requestError } = await supabase
        .from('blood_requests')
        .select('requester_id')
        .eq('id', requestId)
        .single();
      
      if (requestError) {
        throw new Error(`Failed to verify blood request ownership: ${requestError.message}`);
      }
      
      if (request.requester_id !== user.user.id) {
        throw new Error('You do not have permission to view matches for this blood request');
      }
      
      // Get donation matches
      const { data, error } = await supabase
        .from('donation_matches')
        .select(`
          *,
          donor:donor_profiles(
            id,
            profile_id,
            blood_type,
            profiles:profiles(
              first_name,
              last_name,
              phone_number,
              email
            )
          )
        `)
        .eq('request_id', requestId)
        .order('created_at', { ascending: false });
      
      if (error) {
        throw new Error(`Failed to get donation matches: ${error.message}`);
      }
      
      // Format the data to match the DonationMatch interface
      const formattedMatches = data.map((match: any) => {
        const donorProfile = match.donor?.profiles || {};
        return {
          ...match,
          donor: match.donor ? {
            id: match.donor.id,
            profile_id: match.donor.profile_id,
            blood_type: match.donor.blood_type,
            first_name: donorProfile.first_name,
            last_name: donorProfile.last_name,
            phone_number: donorProfile.phone_number,
            email: donorProfile.email
          } : undefined
        };
      });
      
      return formattedMatches || [];
    } catch (error) {
      console.error('Error getting donation matches:', error);
      throw error;
    }
  }

  /**
   * Get all donation matches for the current donor
   */
  async getDonorMatches(): Promise<DonationMatch[]> {
    try {
      // Get current user
      const { data: user, error: userError } = await supabase.auth.getUser();
      
      if (userError || !user.user) {
        throw new Error('You must be logged in to view your donation matches');
      }
      
      // Get donor profile ID
      const { data: donorProfile, error: donorError } = await supabase
        .from('donor_profiles')
        .select('id')
        .eq('profile_id', user.user.id)
        .single();
      
      if (donorError) {
        throw new Error('You must be registered as a donor to view donation matches');
      }
      
      // Get donation matches
      const { data, error } = await supabase
        .from('donation_matches')
        .select(`
          *,
          request:blood_requests(*)
        `)
        .eq('donor_id', donorProfile.id)
        .order('created_at', { ascending: false });
      
      if (error) {
        throw new Error(`Failed to get donation matches: ${error.message}`);
      }
      
      return data || [];
    } catch (error) {
      console.error('Error getting donor matches:', error);
      throw error;
    }
  }

  /**
   * Update a donation match status
   */
  async updateMatchStatus(
    matchId: string, 
    status: 'Accepted' | 'Declined' | 'Completed' | 'Cancelled',
    notes?: string
  ): Promise<DonationMatch> {
    try {
      // Get current user
      const { data: user, error: userError } = await supabase.auth.getUser();
      
      if (userError || !user.user) {
        throw new Error('You must be logged in to update a donation match');
      }
      
      // Get donor profile ID
      const { data: donorProfile, error: donorError } = await supabase
        .from('donor_profiles')
        .select('id')
        .eq('profile_id', user.user.id)
        .single();
      
      if (donorError) {
        throw new Error('You must be registered as a donor to update donation matches');
      }
      
      // Check if the user is the donor for this match
      const { data: match, error: matchError } = await supabase
        .from('donation_matches')
        .select('donor_id, request_id')
        .eq('id', matchId)
        .single();
      
      if (matchError) {
        throw new Error(`Failed to verify donation match: ${matchError.message}`);
      }
      
      if (match.donor_id !== donorProfile.id) {
        throw new Error('You do not have permission to update this donation match');
      }
      
      // Update the donation match
      const updateData: any = { 
        status,
        response_time: new Date().toISOString()
      };
      
      if (notes) {
        updateData.notes = notes;
      }
      
      if (status === 'Completed') {
        updateData.donation_time = new Date().toISOString();
        
        // Also update the blood request status to Fulfilled
        await supabase
          .from('blood_requests')
          .update({ status: 'Fulfilled' })
          .eq('id', match.request_id);
      }
      
      const { data: updatedMatch, error } = await supabase
        .from('donation_matches')
        .update(updateData)
        .eq('id', matchId)
        .select('*')
        .single();
      
      if (error) {
        throw new Error(`Failed to update donation match: ${error.message}`);
      }
      
      return updatedMatch;
    } catch (error) {
      console.error('Error updating donation match:', error);
      throw error;
    }
  }
}

export default new BloodRequestService(); 