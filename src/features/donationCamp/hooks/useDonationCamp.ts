import { useState, useEffect, useCallback } from 'react';
import { 
  CampFilters, 
  CampRegistration, 
  CampStatus, 
  DonationCamp, 
  DonationCampFormData, 
  RegistrationStatus 
} from '../types';
import donationCampService from '../services/donationCampService';

interface UseDonationCampProps {
  initialCampId?: string;
}

export const useDonationCamp = ({ initialCampId }: UseDonationCampProps = {}) => {
  const [camps, setCamps] = useState<DonationCamp[]>([]);
  const [userCamps, setUserCamps] = useState<DonationCamp[]>([]);
  const [currentCamp, setCurrentCamp] = useState<DonationCamp | null>(null);
  const [campRegistrations, setCampRegistrations] = useState<CampRegistration[]>([]);
  const [userRegistrations, setUserRegistrations] = useState<any[]>([]);
  const [campStatistics, setCampStatistics] = useState<any | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<Error | null>(null);

  // Fetch a specific camp by ID
  const fetchCamp = useCallback(async (campId: string) => {
    setIsLoading(true);
    setError(null);
    
    try {
      const camp = await donationCampService.getDonationCampById(campId);
      setCurrentCamp(camp);
      return camp;
    } catch (err) {
      setError(err instanceof Error ? err : new Error('Failed to fetch camp'));
      return null;
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Fetch all public camps with optional filters
  const fetchPublicCamps = useCallback(async (filters?: CampFilters) => {
    setIsLoading(true);
    setError(null);
    
    try {
      const fetchedCamps = await donationCampService.getPublicDonationCamps(filters);
      setCamps(fetchedCamps);
      return fetchedCamps;
    } catch (err) {
      setError(err instanceof Error ? err : new Error('Failed to fetch public camps'));
      return [];
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Fetch camps organized by the current user
  const fetchUserCamps = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    
    try {
      const fetchedCamps = await donationCampService.getUserOrganizedCamps();
      setUserCamps(fetchedCamps);
      return fetchedCamps;
    } catch (err) {
      setError(err instanceof Error ? err : new Error('Failed to fetch user camps'));
      return [];
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Create a new donation camp
  const createCamp = useCallback(async (campData: DonationCampFormData) => {
    setIsLoading(true);
    setError(null);
    
    try {
      const newCamp = await donationCampService.createDonationCamp(campData);
      setUserCamps(prev => [newCamp, ...prev]);
      setCurrentCamp(newCamp);
      return newCamp;
    } catch (err) {
      setError(err instanceof Error ? err : new Error('Failed to create camp'));
      return null;
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Update an existing donation camp
  const updateCamp = useCallback(async (campId: string, campData: Partial<DonationCampFormData>) => {
    setIsLoading(true);
    setError(null);
    
    try {
      const updatedCamp = await donationCampService.updateDonationCamp(campId, campData);
      
      // Update in userCamps list
      setUserCamps(prev => 
        prev.map(camp => camp.id === campId ? updatedCamp : camp)
      );
      
      // Update currentCamp if it's the one being edited
      if (currentCamp && currentCamp.id === campId) {
        setCurrentCamp(updatedCamp);
      }
      
      return updatedCamp;
    } catch (err) {
      setError(err instanceof Error ? err : new Error('Failed to update camp'));
      return null;
    } finally {
      setIsLoading(false);
    }
  }, [currentCamp]);

  // Update camp status
  const updateCampStatus = useCallback(async (campId: string, status: CampStatus) => {
    setIsLoading(true);
    setError(null);
    
    try {
      const updatedCamp = await donationCampService.updateCampStatus(campId, status);
      
      // Update in userCamps list
      setUserCamps(prev => 
        prev.map(camp => camp.id === campId ? updatedCamp : camp)
      );
      
      // Update currentCamp if it's the one being edited
      if (currentCamp && currentCamp.id === campId) {
        setCurrentCamp(updatedCamp);
      }
      
      return updatedCamp;
    } catch (err) {
      setError(err instanceof Error ? err : new Error('Failed to update camp status'));
      return null;
    } finally {
      setIsLoading(false);
    }
  }, [currentCamp]);

  // Delete a donation camp
  const deleteCamp = useCallback(async (campId: string) => {
    setIsLoading(true);
    setError(null);
    
    try {
      await donationCampService.deleteDonationCamp(campId);
      
      // Remove from userCamps list
      setUserCamps(prev => prev.filter(camp => camp.id !== campId));
      
      // Clear currentCamp if it's the one being deleted
      if (currentCamp && currentCamp.id === campId) {
        setCurrentCamp(null);
      }
      
      return true;
    } catch (err) {
      setError(err instanceof Error ? err : new Error('Failed to delete camp'));
      return false;
    } finally {
      setIsLoading(false);
    }
  }, [currentCamp]);

  // Register for a camp
  const registerForCamp = useCallback(async (campId: string, notes?: string) => {
    setIsLoading(true);
    setError(null);
    
    try {
      const registration = await donationCampService.registerForCamp(campId, notes);
      
      // Refresh user registrations
      const updatedRegistrations = await donationCampService.getUserRegistrations();
      setUserRegistrations(updatedRegistrations);
      
      return registration;
    } catch (err) {
      setError(err instanceof Error ? err : new Error('Failed to register for camp'));
      return null;
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Cancel a registration
  const cancelRegistration = useCallback(async (registrationId: string) => {
    setIsLoading(true);
    setError(null);
    
    try {
      await donationCampService.cancelRegistration(registrationId);
      
      // Refresh user registrations
      const updatedRegistrations = await donationCampService.getUserRegistrations();
      setUserRegistrations(updatedRegistrations);
      
      return true;
    } catch (err) {
      setError(err instanceof Error ? err : new Error('Failed to cancel registration'));
      return false;
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Fetch camp registrations (for organizers)
  const fetchCampRegistrations = useCallback(async (campId: string) => {
    setIsLoading(true);
    setError(null);
    
    try {
      const registrations = await donationCampService.getCampRegistrations(campId);
      setCampRegistrations(registrations);
      return registrations;
    } catch (err) {
      setError(err instanceof Error ? err : new Error('Failed to fetch camp registrations'));
      return [];
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Fetch user's registrations
  const fetchUserRegistrations = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    
    try {
      const registrations = await donationCampService.getUserRegistrations();
      setUserRegistrations(registrations);
      return registrations;
    } catch (err) {
      setError(err instanceof Error ? err : new Error('Failed to fetch user registrations'));
      return [];
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Update registration status (for organizers)
  const updateRegistrationStatus = useCallback(async (registrationId: string, status: RegistrationStatus) => {
    setIsLoading(true);
    setError(null);
    
    try {
      const updatedRegistration = await donationCampService.updateRegistrationStatus(registrationId, status);
      
      // Update in campRegistrations list
      setCampRegistrations(prev => 
        prev.map(reg => reg.id === registrationId ? updatedRegistration : reg)
      );
      
      return updatedRegistration;
    } catch (err) {
      setError(err instanceof Error ? err : new Error('Failed to update registration status'));
      return null;
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Fetch nearby camps
  const fetchNearbyCamps = useCallback(async (latitude: number, longitude: number, radiusKm: number = 50) => {
    setIsLoading(true);
    setError(null);
    
    try {
      const nearbyCamps = await donationCampService.getNearbyCamps(latitude, longitude, radiusKm);
      setCamps(nearbyCamps);
      return nearbyCamps;
    } catch (err) {
      setError(err instanceof Error ? err : new Error('Failed to fetch nearby camps'));
      return [];
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Fetch camp statistics
  const fetchCampStatistics = useCallback(async (campId: string) => {
    setIsLoading(true);
    setError(null);
    
    try {
      const statistics = await donationCampService.getCampStatistics(campId);
      setCampStatistics(statistics);
      return statistics;
    } catch (err) {
      setError(err instanceof Error ? err : new Error('Failed to fetch camp statistics'));
      return null;
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Load initial camp if ID is provided
  useEffect(() => {
    if (initialCampId) {
      fetchCamp(initialCampId);
    }
  }, [initialCampId, fetchCamp]);

  return {
    // State
    camps,
    userCamps,
    currentCamp,
    campRegistrations,
    userRegistrations,
    campStatistics,
    isLoading,
    error,
    
    // Camp operations
    fetchCamp,
    fetchPublicCamps,
    fetchUserCamps,
    createCamp,
    updateCamp,
    updateCampStatus,
    deleteCamp,
    
    // Registration operations
    registerForCamp,
    cancelRegistration,
    fetchCampRegistrations,
    fetchUserRegistrations,
    updateRegistrationStatus,
    
    // Location-based operations
    fetchNearbyCamps,
    
    // Statistics
    fetchCampStatistics
  };
};

export default useDonationCamp; 