import { useState, useEffect } from 'react';
import { useAuth } from '../../auth/context/AuthContext';
import { donorService } from '../services/donorService';
import { DonorProfile, DonorProfileFormData, DonorStats, DonationHistory } from '../types';

interface UseDonorProfileReturn {
  donorProfile: DonorProfile | null;
  isLoading: boolean;
  error: Error | null;
  donorStats: DonorStats | null;
  donationHistory: DonationHistory[];
  createDonorProfile: (data: DonorProfileFormData) => Promise<void>;
  updateDonorProfile: (data: Partial<DonorProfileFormData>) => Promise<void>;
  uploadHealthDocument: (file: File, documentType: string) => Promise<string | null>;
  refreshProfile: () => Promise<void>;
}

export const useDonorProfile = (): UseDonorProfileReturn => {
  const { user } = useAuth();
  const [donorProfile, setDonorProfile] = useState<DonorProfile | null>(null);
  const [donorStats, setDonorStats] = useState<DonorStats | null>(null);
  const [donationHistory, setDonationHistory] = useState<DonationHistory[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<Error | null>(null);

  const fetchDonorProfile = async () => {
    if (!user) {
      setDonorProfile(null);
      setIsLoading(false);
      return;
    }

    try {
      setIsLoading(true);
      setError(null);
      
      const { data, error } = await donorService.getCurrentDonorProfile();
      
      if (error) throw error;
      setDonorProfile(data);
      
      // If donor profile exists, fetch stats and history
      if (data) {
        const [statsResponse, historyResponse] = await Promise.all([
          donorService.getDonorStats(),
          donorService.getDonationHistory()
        ]);
        
        if (statsResponse.error) throw statsResponse.error;
        if (historyResponse.error) throw historyResponse.error;
        
        setDonorStats(statsResponse.data);
        setDonationHistory(historyResponse.data || []);
      }
    } catch (err) {
      console.error('Error fetching donor profile:', err);
      setError(err instanceof Error ? err : new Error('An unknown error occurred'));
    } finally {
      setIsLoading(false);
    }
  };

  // Fetch donor profile when user changes
  useEffect(() => {
    fetchDonorProfile();
  }, [user]);

  const createDonorProfile = async (data: DonorProfileFormData) => {
    try {
      setIsLoading(true);
      setError(null);
      
      const { data: newProfile, error } = await donorService.createDonorProfile(data);
      
      if (error) throw error;
      
      setDonorProfile(newProfile);
      
      // Initialize stats for new profile
      setDonorStats({
        total_donations: 0,
        last_donation_date: null,
        donation_streak: 0,
        lives_impacted: 0
      });
      
      setDonationHistory([]);
    } catch (err) {
      console.error('Error creating donor profile:', err);
      setError(err instanceof Error ? err : new Error('An unknown error occurred'));
      throw err;
    } finally {
      setIsLoading(false);
    }
  };

  const updateDonorProfile = async (data: Partial<DonorProfileFormData>) => {
    try {
      setIsLoading(true);
      setError(null);
      
      const { error } = await donorService.updateDonorProfile(data);
      
      if (error) throw error;
      
      // Refresh the profile to get updated data
      await fetchDonorProfile();
    } catch (err) {
      console.error('Error updating donor profile:', err);
      setError(err instanceof Error ? err : new Error('An unknown error occurred'));
      throw err;
    } finally {
      setIsLoading(false);
    }
  };

  const uploadHealthDocument = async (file: File, documentType: string): Promise<string | null> => {
    try {
      setIsLoading(true);
      setError(null);
      
      const { data: documentUrl, error } = await donorService.uploadHealthDocument(file, documentType);
      
      if (error) throw error;
      
      // Refresh the profile to get updated data
      await fetchDonorProfile();
      
      return documentUrl;
    } catch (err) {
      console.error('Error uploading health document:', err);
      setError(err instanceof Error ? err : new Error('An unknown error occurred'));
      throw err;
    } finally {
      setIsLoading(false);
    }
  };

  return {
    donorProfile,
    isLoading,
    error,
    donorStats,
    donationHistory,
    createDonorProfile,
    updateDonorProfile,
    uploadHealthDocument,
    refreshProfile: fetchDonorProfile
  };
}; 