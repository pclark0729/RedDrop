import supabase from '../../../app/supabase';
import { 
  DonorMatch, 
  MatchStatus, 
  MatchUpdateData, 
  MatchingAlgorithmParams, 
  MatchingResult,
  MatchStatistics,
  MatchFilters
} from '../types';
import { notificationService } from '../../notification';
import { BloodType } from '../../bloodRequest/types';

class MatchingService {
  /**
   * Run the matching algorithm to find compatible donors for a blood request
   */
  async findMatches(params: MatchingAlgorithmParams): Promise<MatchingResult> {
    try {
      const { requestId, maxDistance = 50, maxResults = 20, includeUnavailableDonors = false } = params;
      
      // Call the Supabase function that implements the matching algorithm
      const { data, error } = await supabase.rpc('find_compatible_donors', {
        p_request_id: requestId,
        p_max_distance: maxDistance,
        p_max_results: maxResults,
        p_include_unavailable: includeUnavailableDonors
      });
      
      if (error) throw error;
      
      // Get the request details
      const { data: requestData, error: requestError } = await supabase
        .from('blood_requests')
        .select('id, blood_type, units_needed, hospital_name, hospital_city, hospital_state, urgency_level, required_by_date')
        .eq('id', requestId)
        .single();
      
      if (requestError) throw requestError;
      
      return {
        matches: data.matches || [],
        totalCount: data.total_count || 0,
        requestDetails: requestData
      };
    } catch (error) {
      console.error('Error finding matches:', error);
      throw error;
    }
  }
  
  /**
   * Create donation matches for a blood request
   */
  async createMatches(requestId: string, donorIds: string[]): Promise<DonorMatch[]> {
    try {
      // Prepare the match records
      const matches = donorIds.map(donorId => ({
        request_id: requestId,
        donor_id: donorId,
        status: MatchStatus.PENDING
      }));
      
      // Insert the matches
      const { data, error } = await supabase
        .from('donation_matches')
        .insert(matches)
        .select();
      
      if (error) throw error;
      
      // Send notifications to the donors
      await this.notifyDonorsOfMatch(requestId, donorIds);
      
      return data;
    } catch (error) {
      console.error('Error creating matches:', error);
      throw error;
    }
  }
  
  /**
   * Get all matches for a specific blood request
   */
  async getMatchesByRequestId(requestId: string): Promise<DonorMatch[]> {
    try {
      const { data, error } = await supabase
        .from('donation_matches')
        .select(`
          *,
          donor_profiles:donor_id (
            id,
            profiles:profile_id (
              first_name,
              last_name,
              phone_number,
              email
            ),
            blood_type
          )
        `)
        .eq('request_id', requestId);
      
      if (error) throw error;
      
      // Format the response to match the DonorMatch interface
      return data.map(match => ({
        ...match,
        donor_name: `${match.donor_profiles.profiles.first_name} ${match.donor_profiles.profiles.last_name}`,
        donor_blood_type: match.donor_profiles.blood_type as BloodType,
        donor_phone: match.donor_profiles.profiles.phone_number,
        donor_email: match.donor_profiles.profiles.email
      }));
    } catch (error) {
      console.error('Error getting matches by request ID:', error);
      throw error;
    }
  }
  
  /**
   * Get all matches for the current donor
   */
  async getCurrentDonorMatches(filters?: MatchFilters): Promise<DonorMatch[]> {
    try {
      // Get the current user
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('User not authenticated');
      
      // Get the donor profile ID for the current user
      const { data: donorProfile, error: donorError } = await supabase
        .from('donor_profiles')
        .select('id')
        .eq('profile_id', user.id)
        .single();
      
      if (donorError) throw donorError;
      if (!donorProfile) throw new Error('Donor profile not found');
      
      // Build the query
      let query = supabase
        .from('donation_matches')
        .select(`
          *,
          blood_requests:request_id (
            blood_type,
            units_needed,
            hospital_name,
            hospital_address,
            hospital_city,
            hospital_state,
            urgency_level,
            required_by_date
          )
        `)
        .eq('donor_id', donorProfile.id);
      
      // Apply filters if provided
      if (filters) {
        if (filters.status) {
          query = query.eq('status', filters.status);
        }
        if (filters.city) {
          query = query.eq('blood_requests.hospital_city', filters.city);
        }
        if (filters.state) {
          query = query.eq('blood_requests.hospital_state', filters.state);
        }
        if (filters.startDate) {
          query = query.gte('created_at', filters.startDate);
        }
        if (filters.endDate) {
          query = query.lte('created_at', filters.endDate);
        }
      }
      
      // Execute the query
      const { data, error } = await query;
      
      if (error) throw error;
      
      // Format the response to match the DonorMatch interface
      return data.map(match => ({
        ...match,
        request_blood_type: match.blood_requests.blood_type as BloodType,
        request_units_needed: match.blood_requests.units_needed,
        request_hospital_name: match.blood_requests.hospital_name,
        request_hospital_address: match.blood_requests.hospital_address,
        request_hospital_city: match.blood_requests.hospital_city,
        request_hospital_state: match.blood_requests.hospital_state,
        request_urgency_level: match.blood_requests.urgency_level,
        request_required_by_date: match.blood_requests.required_by_date
      }));
    } catch (error) {
      console.error('Error getting current donor matches:', error);
      throw error;
    }
  }
  
  /**
   * Get a specific match by ID
   */
  async getMatchById(matchId: string): Promise<DonorMatch> {
    try {
      const { data, error } = await supabase
        .from('donation_matches')
        .select(`
          *,
          donor_profiles:donor_id (
            id,
            profiles:profile_id (
              first_name,
              last_name,
              phone_number,
              email
            ),
            blood_type
          ),
          blood_requests:request_id (
            blood_type,
            units_needed,
            hospital_name,
            hospital_address,
            hospital_city,
            hospital_state,
            urgency_level,
            required_by_date
          )
        `)
        .eq('id', matchId)
        .single();
      
      if (error) throw error;
      
      // Format the response to match the DonorMatch interface
      return {
        ...data,
        donor_name: `${data.donor_profiles.profiles.first_name} ${data.donor_profiles.profiles.last_name}`,
        donor_blood_type: data.donor_profiles.blood_type as BloodType,
        donor_phone: data.donor_profiles.profiles.phone_number,
        donor_email: data.donor_profiles.profiles.email,
        request_blood_type: data.blood_requests.blood_type as BloodType,
        request_units_needed: data.blood_requests.units_needed,
        request_hospital_name: data.blood_requests.hospital_name,
        request_hospital_address: data.blood_requests.hospital_address,
        request_hospital_city: data.blood_requests.hospital_city,
        request_hospital_state: data.blood_requests.hospital_state,
        request_urgency_level: data.blood_requests.urgency_level,
        request_required_by_date: data.blood_requests.required_by_date
      };
    } catch (error) {
      console.error('Error getting match by ID:', error);
      throw error;
    }
  }
  
  /**
   * Update a match status and other details
   */
  async updateMatch(matchId: string, updateData: MatchUpdateData): Promise<DonorMatch> {
    try {
      // Get the current user
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('User not authenticated');
      
      // Get the donor profile ID for the current user
      const { data: donorProfile, error: donorError } = await supabase
        .from('donor_profiles')
        .select('id')
        .eq('profile_id', user.id)
        .single();
      
      if (donorError) throw donorError;
      if (!donorProfile) throw new Error('Donor profile not found');
      
      // Get the match to verify ownership
      const { data: match, error: matchError } = await supabase
        .from('donation_matches')
        .select('*')
        .eq('id', matchId)
        .single();
      
      if (matchError) throw matchError;
      
      // Verify that the match belongs to the current donor
      if (match.donor_id !== donorProfile.id) {
        throw new Error('You are not authorized to update this match');
      }
      
      // Prepare the update data
      const updatePayload: any = {
        status: updateData.status
      };
      
      // Add response time if the status is being updated from PENDING
      if (match.status === MatchStatus.PENDING && 
          (updateData.status === MatchStatus.ACCEPTED || updateData.status === MatchStatus.DECLINED)) {
        updatePayload.response_time = new Date().toISOString();
      }
      
      // Add donation time if provided
      if (updateData.donation_time) {
        updatePayload.donation_time = updateData.donation_time;
      }
      
      // Add notes if provided
      if (updateData.notes) {
        updatePayload.notes = updateData.notes;
      }
      
      // Update the match
      const { data, error } = await supabase
        .from('donation_matches')
        .update(updatePayload)
        .eq('id', matchId)
        .select()
        .single();
      
      if (error) throw error;
      
      // If the status was updated to COMPLETED, create a donation history record
      if (updateData.status === MatchStatus.COMPLETED) {
        await this.createDonationHistoryRecord(matchId);
      }
      
      // Notify the requester about the status update
      await this.notifyRequesterOfStatusUpdate(matchId, updateData.status);
      
      return data;
    } catch (error) {
      console.error('Error updating match:', error);
      throw error;
    }
  }
  
  /**
   * Cancel a match (can be done by either the donor or the requester)
   */
  async cancelMatch(matchId: string, reason?: string): Promise<DonorMatch> {
    try {
      // Get the current user
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('User not authenticated');
      
      // Get the match to verify ownership
      const { data: match, error: matchError } = await supabase
        .from('donation_matches')
        .select(`
          *,
          blood_requests:request_id (requester_id)
        `)
        .eq('id', matchId)
        .single();
      
      if (matchError) throw matchError;
      
      // Get the donor profile ID for the current user
      const { data: donorProfile, error: donorError } = await supabase
        .from('donor_profiles')
        .select('id')
        .eq('profile_id', user.id)
        .single();
      
      // Verify that the match belongs to the current donor or requester
      const isDonor = donorProfile && match.donor_id === donorProfile.id;
      const isRequester = match.blood_requests.requester_id === user.id;
      
      if (!isDonor && !isRequester) {
        throw new Error('You are not authorized to cancel this match');
      }
      
      // Update the match status to CANCELLED
      const { data, error } = await supabase
        .from('donation_matches')
        .update({
          status: MatchStatus.CANCELLED,
          notes: reason ? `Cancelled: ${reason}` : 'Cancelled by user'
        })
        .eq('id', matchId)
        .select()
        .single();
      
      if (error) throw error;
      
      // Notify the other party about the cancellation
      if (isDonor) {
        await this.notifyRequesterOfStatusUpdate(matchId, MatchStatus.CANCELLED);
      } else {
        await this.notifyDonorOfCancellation(matchId);
      }
      
      return data;
    } catch (error) {
      console.error('Error cancelling match:', error);
      throw error;
    }
  }
  
  /**
   * Get statistics for matches
   */
  async getMatchStatistics(): Promise<MatchStatistics> {
    try {
      // Get the current user
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('User not authenticated');
      
      // Call the Supabase function that calculates match statistics
      const { data, error } = await supabase.rpc('get_match_statistics', {
        p_user_id: user.id
      });
      
      if (error) throw error;
      
      return {
        totalMatches: data.total_matches || 0,
        pendingMatches: data.pending_matches || 0,
        acceptedMatches: data.accepted_matches || 0,
        completedMatches: data.completed_matches || 0,
        declinedMatches: data.declined_matches || 0,
        cancelledMatches: data.cancelled_matches || 0,
        averageResponseTimeMinutes: data.average_response_time_minutes || 0,
        matchSuccessRate: data.match_success_rate || 0
      };
    } catch (error) {
      console.error('Error getting match statistics:', error);
      throw error;
    }
  }
  
  /**
   * Create a donation history record when a match is completed
   */
  private async createDonationHistoryRecord(matchId: string): Promise<void> {
    try {
      // Get the match details
      const { data: match, error: matchError } = await supabase
        .from('donation_matches')
        .select(`
          *,
          donor_profiles:donor_id (
            id,
            blood_type
          ),
          blood_requests:request_id (
            id,
            hospital_name,
            hospital_city,
            hospital_state
          )
        `)
        .eq('id', matchId)
        .single();
      
      if (matchError) throw matchError;
      
      // Create the donation history record
      const { error } = await supabase
        .from('donation_history')
        .insert({
          donor_id: match.donor_id,
          request_id: match.request_id,
          donation_date: match.donation_time || new Date().toISOString(),
          blood_type: match.donor_profiles.blood_type,
          units_donated: 1, // Default to 1 unit
          location: `${match.blood_requests.hospital_name}, ${match.blood_requests.hospital_city}, ${match.blood_requests.hospital_state}`,
          notes: match.notes || 'Donation completed'
        });
      
      if (error) throw error;
    } catch (error) {
      console.error('Error creating donation history record:', error);
      throw error;
    }
  }
  
  /**
   * Send notifications to donors about a new match
   */
  private async notifyDonorsOfMatch(requestId: string, donorIds: string[]): Promise<void> {
    try {
      // Get the request details
      const { data: request, error: requestError } = await supabase
        .from('blood_requests')
        .select('blood_type, hospital_name, hospital_city')
        .eq('id', requestId)
        .single();
      
      if (requestError) throw requestError;
      
      // Get the profile IDs for the donors
      const { data: donorProfiles, error: donorError } = await supabase
        .from('donor_profiles')
        .select('profile_id')
        .in('id', donorIds);
      
      if (donorError) throw donorError;
      
      // Extract the profile IDs
      const profileIds = donorProfiles.map(profile => profile.profile_id);
      
      // Send notifications to the donors
      await notificationService.createMatchNotification(
        profileIds,
        requestId,
        {
          bloodType: request.blood_type,
          hospitalName: request.hospital_name,
          city: request.hospital_city
        }
      );
    } catch (error) {
      console.error('Error notifying donors of match:', error);
      // Don't throw the error to prevent the main operation from failing
    }
  }
  
  /**
   * Notify the requester about a match status update
   */
  private async notifyRequesterOfStatusUpdate(matchId: string, status: MatchStatus): Promise<void> {
    try {
      // Get the match details
      const { data: match, error: matchError } = await supabase
        .from('donation_matches')
        .select(`
          *,
          donor_profiles:donor_id (
            profiles:profile_id (
              first_name,
              last_name
            ),
            blood_type
          ),
          blood_requests:request_id (
            requester_id,
            hospital_name
          )
        `)
        .eq('id', matchId)
        .single();
      
      if (matchError) throw matchError;
      
      // Prepare the notification message based on the status
      let title = '';
      let message = '';
      
      switch (status) {
        case MatchStatus.ACCEPTED:
          title = 'Donation Match Accepted';
          message = `${match.donor_profiles.profiles.first_name} ${match.donor_profiles.profiles.last_name} has accepted your blood request for ${match.blood_requests.hospital_name}.`;
          break;
        case MatchStatus.DECLINED:
          title = 'Donation Match Declined';
          message = `A donor has declined your blood request for ${match.blood_requests.hospital_name}.`;
          break;
        case MatchStatus.COMPLETED:
          title = 'Donation Completed';
          message = `${match.donor_profiles.profiles.first_name} ${match.donor_profiles.profiles.last_name} has completed their donation for your request at ${match.blood_requests.hospital_name}.`;
          break;
        case MatchStatus.CANCELLED:
          title = 'Donation Match Cancelled';
          message = `A donation match for your request at ${match.blood_requests.hospital_name} has been cancelled.`;
          break;
        default:
          return; // Don't send notification for other statuses
      }
      
      // Send the notification to the requester
      await notificationService.createNotification({
        recipient_id: match.blood_requests.requester_id,
        type: 'Match',
        title,
        message,
        related_entity_id: matchId,
        related_entity_type: 'donation_matches',
        channel: 'In-app'
      });
    } catch (error) {
      console.error('Error notifying requester of status update:', error);
      // Don't throw the error to prevent the main operation from failing
    }
  }
  
  /**
   * Notify the donor about a match cancellation
   */
  private async notifyDonorOfCancellation(matchId: string): Promise<void> {
    try {
      // Get the match details
      const { data: match, error: matchError } = await supabase
        .from('donation_matches')
        .select(`
          *,
          donor_profiles:donor_id (
            profile_id
          ),
          blood_requests:request_id (
            hospital_name
          )
        `)
        .eq('id', matchId)
        .single();
      
      if (matchError) throw matchError;
      
      // Send the notification to the donor
      await notificationService.createNotification({
        recipient_id: match.donor_profiles.profile_id,
        type: 'Match',
        title: 'Donation Match Cancelled',
        message: `A blood request match for ${match.blood_requests.hospital_name} has been cancelled by the requester.`,
        related_entity_id: matchId,
        related_entity_type: 'donation_matches',
        channel: 'In-app'
      });
    } catch (error) {
      console.error('Error notifying donor of cancellation:', error);
      // Don't throw the error to prevent the main operation from failing
    }
  }
}

export default new MatchingService(); 