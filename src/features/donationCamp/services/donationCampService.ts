import supabase from '../../../app/supabase';
import { 
  CampFilters, 
  CampRegistration, 
  CampStatus, 
  DonationCamp, 
  DonationCampFormData, 
  RegistrationStatus 
} from '../types';

class DonationCampService {
  /**
   * Create a new donation camp
   */
  async createDonationCamp(campData: DonationCampFormData): Promise<DonationCamp> {
    const { data: user, error: userError } = await supabase.auth.getUser();
    
    if (userError || !user.user) {
      throw new Error('You must be logged in to create a donation camp');
    }
    
    const { data, error } = await supabase
      .from('donation_camps')
      .insert({
        organizer_id: user.user.id,
        name: campData.name,
        description: campData.description,
        start_date: campData.start_date,
        end_date: campData.end_date,
        address: campData.address,
        city: campData.city,
        state: campData.state,
        postal_code: campData.postal_code,
        country: campData.country,
        latitude: campData.latitude || null,
        longitude: campData.longitude || null,
        contact_phone: campData.contact_phone,
        contact_email: campData.contact_email,
        website: campData.website || null,
        max_capacity: campData.max_capacity || null,
        registration_required: campData.registration_required,
        status: CampStatus.UPCOMING
      })
      .select()
      .single();
    
    if (error) {
      throw new Error(`Failed to create donation camp: ${error.message}`);
    }
    
    return data;
  }
  
  /**
   * Get a donation camp by ID
   */
  async getDonationCampById(campId: string): Promise<DonationCamp> {
    const { data, error } = await supabase
      .from('donation_camps')
      .select('*')
      .eq('id', campId)
      .single();
    
    if (error) {
      throw new Error(`Failed to get donation camp: ${error.message}`);
    }
    
    return data;
  }
  
  /**
   * Get donation camps organized by the current user
   */
  async getUserOrganizedCamps(): Promise<DonationCamp[]> {
    const { data: user, error: userError } = await supabase.auth.getUser();
    
    if (userError || !user.user) {
      throw new Error('You must be logged in to view your organized camps');
    }
    
    const { data, error } = await supabase
      .from('donation_camps')
      .select('*')
      .eq('organizer_id', user.user.id)
      .order('start_date', { ascending: false });
    
    if (error) {
      throw new Error(`Failed to get user organized camps: ${error.message}`);
    }
    
    return data || [];
  }
  
  /**
   * Get all public donation camps with optional filters
   */
  async getPublicDonationCamps(filters?: CampFilters): Promise<DonationCamp[]> {
    let query = supabase
      .from('donation_camps')
      .select('*')
      .order('start_date', { ascending: true });
    
    // Apply filters if provided
    if (filters) {
      if (filters.status) {
        query = query.eq('status', filters.status);
      }
      
      if (filters.city) {
        query = query.ilike('city', `%${filters.city}%`);
      }
      
      if (filters.state) {
        query = query.ilike('state', `%${filters.state}%`);
      }
      
      if (filters.startDate) {
        query = query.gte('start_date', filters.startDate);
      }
      
      if (filters.endDate) {
        query = query.lte('end_date', filters.endDate);
      }
      
      if (filters.searchTerm) {
        query = query.or(`name.ilike.%${filters.searchTerm}%,description.ilike.%${filters.searchTerm}%`);
      }
    }
    
    const { data, error } = await query;
    
    if (error) {
      throw new Error(`Failed to get donation camps: ${error.message}`);
    }
    
    return data || [];
  }
  
  /**
   * Update a donation camp
   */
  async updateDonationCamp(campId: string, campData: Partial<DonationCampFormData>): Promise<DonationCamp> {
    const { data: user, error: userError } = await supabase.auth.getUser();
    
    if (userError || !user.user) {
      throw new Error('You must be logged in to update a donation camp');
    }
    
    // Check if user is the organizer
    const { data: camp, error: campError } = await supabase
      .from('donation_camps')
      .select('organizer_id')
      .eq('id', campId)
      .single();
    
    if (campError) {
      throw new Error(`Failed to verify camp ownership: ${campError.message}`);
    }
    
    if (camp.organizer_id !== user.user.id) {
      throw new Error('You do not have permission to update this camp');
    }
    
    const { data, error } = await supabase
      .from('donation_camps')
      .update(campData)
      .eq('id', campId)
      .select()
      .single();
    
    if (error) {
      throw new Error(`Failed to update donation camp: ${error.message}`);
    }
    
    return data;
  }
  
  /**
   * Update the status of a donation camp
   */
  async updateCampStatus(campId: string, status: CampStatus): Promise<DonationCamp> {
    const { data: user, error: userError } = await supabase.auth.getUser();
    
    if (userError || !user.user) {
      throw new Error('You must be logged in to update camp status');
    }
    
    // Check if user is the organizer
    const { data: camp, error: campError } = await supabase
      .from('donation_camps')
      .select('organizer_id')
      .eq('id', campId)
      .single();
    
    if (campError) {
      throw new Error(`Failed to verify camp ownership: ${campError.message}`);
    }
    
    if (camp.organizer_id !== user.user.id) {
      throw new Error('You do not have permission to update this camp status');
    }
    
    const { data, error } = await supabase
      .from('donation_camps')
      .update({ status })
      .eq('id', campId)
      .select()
      .single();
    
    if (error) {
      throw new Error(`Failed to update camp status: ${error.message}`);
    }
    
    return data;
  }
  
  /**
   * Delete a donation camp
   */
  async deleteDonationCamp(campId: string): Promise<void> {
    const { data: user, error: userError } = await supabase.auth.getUser();
    
    if (userError || !user.user) {
      throw new Error('You must be logged in to delete a donation camp');
    }
    
    // Check if user is the organizer
    const { data: camp, error: campError } = await supabase
      .from('donation_camps')
      .select('organizer_id')
      .eq('id', campId)
      .single();
    
    if (campError) {
      throw new Error(`Failed to verify camp ownership: ${campError.message}`);
    }
    
    if (camp.organizer_id !== user.user.id) {
      throw new Error('You do not have permission to delete this camp');
    }
    
    const { error } = await supabase
      .from('donation_camps')
      .delete()
      .eq('id', campId);
    
    if (error) {
      throw new Error(`Failed to delete donation camp: ${error.message}`);
    }
  }
  
  /**
   * Register a donor for a donation camp
   */
  async registerForCamp(campId: string, notes?: string): Promise<CampRegistration> {
    const { data: user, error: userError } = await supabase.auth.getUser();
    
    if (userError || !user.user) {
      throw new Error('You must be logged in to register for a camp');
    }
    
    // Check if the user is a donor
    const { data: donorProfile, error: donorError } = await supabase
      .from('donor_profiles')
      .select('id')
      .eq('profile_id', user.user.id)
      .single();
    
    if (donorError || !donorProfile) {
      throw new Error('You must have a donor profile to register for a camp');
    }
    
    // Check if already registered
    const { data: existingReg, error: regCheckError } = await supabase
      .from('camp_registrations')
      .select('id, status')
      .eq('camp_id', campId)
      .eq('donor_id', donorProfile.id)
      .maybeSingle();
    
    if (regCheckError) {
      throw new Error(`Failed to check registration status: ${regCheckError.message}`);
    }
    
    if (existingReg) {
      if (existingReg.status === RegistrationStatus.CANCELLED) {
        // If previously cancelled, update the registration
        const { data, error } = await supabase
          .from('camp_registrations')
          .update({
            status: RegistrationStatus.REGISTERED,
            registration_date: new Date().toISOString(),
            notes: notes || null
          })
          .eq('id', existingReg.id)
          .select()
          .single();
        
        if (error) {
          throw new Error(`Failed to update registration: ${error.message}`);
        }
        
        return data;
      } else {
        throw new Error('You are already registered for this camp');
      }
    }
    
    // Create new registration
    const { data, error } = await supabase
      .from('camp_registrations')
      .insert({
        camp_id: campId,
        donor_id: donorProfile.id,
        registration_date: new Date().toISOString(),
        status: RegistrationStatus.REGISTERED,
        notes: notes || null
      })
      .select()
      .single();
    
    if (error) {
      throw new Error(`Failed to register for camp: ${error.message}`);
    }
    
    return data;
  }
  
  /**
   * Cancel a camp registration
   */
  async cancelRegistration(registrationId: string): Promise<CampRegistration> {
    const { data: user, error: userError } = await supabase.auth.getUser();
    
    if (userError || !user.user) {
      throw new Error('You must be logged in to cancel a registration');
    }
    
    // Check if the user is the registrant
    const { data: donorProfile, error: donorError } = await supabase
      .from('donor_profiles')
      .select('id')
      .eq('profile_id', user.user.id)
      .single();
    
    if (donorError || !donorProfile) {
      throw new Error('Donor profile not found');
    }
    
    const { data: registration, error: regError } = await supabase
      .from('camp_registrations')
      .select('donor_id')
      .eq('id', registrationId)
      .single();
    
    if (regError) {
      throw new Error(`Failed to verify registration: ${regError.message}`);
    }
    
    if (registration.donor_id !== donorProfile.id) {
      throw new Error('You do not have permission to cancel this registration');
    }
    
    const { data, error } = await supabase
      .from('camp_registrations')
      .update({ status: RegistrationStatus.CANCELLED })
      .eq('id', registrationId)
      .select()
      .single();
    
    if (error) {
      throw new Error(`Failed to cancel registration: ${error.message}`);
    }
    
    return data;
  }
  
  /**
   * Get all registrations for a camp (organizer only)
   */
  async getCampRegistrations(campId: string): Promise<CampRegistration[]> {
    const { data: user, error: userError } = await supabase.auth.getUser();
    
    if (userError || !user.user) {
      throw new Error('You must be logged in to view camp registrations');
    }
    
    // Check if user is the organizer
    const { data: camp, error: campError } = await supabase
      .from('donation_camps')
      .select('organizer_id')
      .eq('id', campId)
      .single();
    
    if (campError) {
      throw new Error(`Failed to verify camp ownership: ${campError.message}`);
    }
    
    if (camp.organizer_id !== user.user.id) {
      throw new Error('You do not have permission to view these registrations');
    }
    
    const { data, error } = await supabase
      .from('camp_registrations')
      .select(`
        *,
        donor:donor_profiles(
          id,
          profile:profiles(
            id,
            first_name,
            last_name,
            email,
            phone_number
          )
        )
      `)
      .eq('camp_id', campId)
      .order('registration_date', { ascending: false });
    
    if (error) {
      throw new Error(`Failed to get camp registrations: ${error.message}`);
    }
    
    return data || [];
  }
  
  /**
   * Get user's camp registrations
   */
  async getUserRegistrations(): Promise<any[]> {
    const { data: user, error: userError } = await supabase.auth.getUser();
    
    if (userError || !user.user) {
      throw new Error('You must be logged in to view your registrations');
    }
    
    // Get donor profile
    const { data: donorProfile, error: donorError } = await supabase
      .from('donor_profiles')
      .select('id')
      .eq('profile_id', user.user.id)
      .single();
    
    if (donorError || !donorProfile) {
      throw new Error('Donor profile not found');
    }
    
    const { data, error } = await supabase
      .from('camp_registrations')
      .select(`
        *,
        camp:donation_camps(
          id,
          name,
          description,
          start_date,
          end_date,
          address,
          city,
          state,
          status
        )
      `)
      .eq('donor_id', donorProfile.id)
      .order('registration_date', { ascending: false });
    
    if (error) {
      throw new Error(`Failed to get user registrations: ${error.message}`);
    }
    
    return data || [];
  }
  
  /**
   * Update registration status (check-in, check-out, etc.) - organizer only
   */
  async updateRegistrationStatus(
    registrationId: string, 
    status: RegistrationStatus
  ): Promise<CampRegistration> {
    const { data: user, error: userError } = await supabase.auth.getUser();
    
    if (userError || !user.user) {
      throw new Error('You must be logged in to update registration status');
    }
    
    // Get the registration and camp info
    const { data: registration, error: regError } = await supabase
      .from('camp_registrations')
      .select('camp_id')
      .eq('id', registrationId)
      .single();
    
    if (regError) {
      throw new Error(`Failed to get registration: ${regError.message}`);
    }
    
    // Check if user is the organizer
    const { data: camp, error: campError } = await supabase
      .from('donation_camps')
      .select('organizer_id')
      .eq('id', registration.camp_id)
      .single();
    
    if (campError) {
      throw new Error(`Failed to verify camp ownership: ${campError.message}`);
    }
    
    if (camp.organizer_id !== user.user.id) {
      throw new Error('You do not have permission to update this registration');
    }
    
    // Prepare update data
    const updateData: any = { status };
    
    // Add timestamps based on status
    if (status === RegistrationStatus.CHECKED_IN) {
      updateData.check_in_time = new Date().toISOString();
    } else if (status === RegistrationStatus.COMPLETED) {
      updateData.check_out_time = new Date().toISOString();
    }
    
    const { data, error } = await supabase
      .from('camp_registrations')
      .update(updateData)
      .eq('id', registrationId)
      .select()
      .single();
    
    if (error) {
      throw new Error(`Failed to update registration status: ${error.message}`);
    }
    
    return data;
  }
  
  /**
   * Get nearby donation camps based on user location
   */
  async getNearbyCamps(latitude: number, longitude: number, radiusKm: number = 50): Promise<DonationCamp[]> {
    // This would ideally use PostGIS for spatial queries
    // For now, we'll use a simplified approach with a Supabase function
    const { data, error } = await supabase.rpc('find_nearby_camps', {
      user_lat: latitude,
      user_lng: longitude,
      radius_km: radiusKm
    });
    
    if (error) {
      throw new Error(`Failed to get nearby camps: ${error.message}`);
    }
    
    return data || [];
  }
  
  /**
   * Get camp statistics
   */
  async getCampStatistics(campId: string): Promise<any> {
    const { data: user, error: userError } = await supabase.auth.getUser();
    
    if (userError || !user.user) {
      throw new Error('You must be logged in to view camp statistics');
    }
    
    // Check if user is the organizer
    const { data: camp, error: campError } = await supabase
      .from('donation_camps')
      .select('organizer_id, max_capacity')
      .eq('id', campId)
      .single();
    
    if (campError) {
      throw new Error(`Failed to verify camp ownership: ${campError.message}`);
    }
    
    if (camp.organizer_id !== user.user.id) {
      throw new Error('You do not have permission to view these statistics');
    }
    
    // Get registration counts
    const { data, error } = await supabase.rpc('get_camp_statistics', {
      camp_id: campId
    });
    
    if (error) {
      throw new Error(`Failed to get camp statistics: ${error.message}`);
    }
    
    // Calculate registration rate if max capacity is set
    let registrationRate = 0;
    if (camp.max_capacity && camp.max_capacity > 0) {
      registrationRate = (data.total_registrations / camp.max_capacity) * 100;
    }
    
    return {
      ...data,
      registrationRate
    };
  }
}

export const donationCampService = new DonationCampService();
export default donationCampService; 