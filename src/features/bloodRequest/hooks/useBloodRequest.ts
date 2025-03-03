import { useState, useCallback } from 'react';
import bloodRequestService from '../services/bloodRequestService';
import { 
  BloodRequest, 
  BloodRequestFormData, 
  BloodRequestFilters, 
  DonationMatch,
  MatchRequestResponse
} from '../types';

export const useBloodRequest = () => {
  const [userRequests, setUserRequests] = useState<BloodRequest[]>([]);
  const [publicRequests, setPublicRequests] = useState<BloodRequest[]>([]);
  const [currentRequest, setCurrentRequest] = useState<BloodRequest | null>(null);
  const [matches, setMatches] = useState<DonationMatch[]>([]);
  const [donorMatches, setDonorMatches] = useState<DonationMatch[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<Error | null>(null);

  /**
   * Create a new blood request
   */
  const createBloodRequest = useCallback(async (data: BloodRequestFormData) => {
    try {
      setIsLoading(true);
      setError(null);
      
      const newRequest = await bloodRequestService.createBloodRequest(data);
      
      // Update the user requests list
      setUserRequests(prev => [newRequest, ...prev]);
      
      return newRequest;
    } catch (err) {
      const error = err instanceof Error ? err : new Error('Failed to create blood request');
      setError(error);
      throw error;
    } finally {
      setIsLoading(false);
    }
  }, []);

  /**
   * Get a blood request by ID
   */
  const getBloodRequestById = useCallback(async (id: string) => {
    try {
      setIsLoading(true);
      setError(null);
      
      const request = await bloodRequestService.getBloodRequestById(id);
      setCurrentRequest(request);
      
      return request;
    } catch (err) {
      const error = err instanceof Error ? err : new Error('Failed to get blood request');
      setError(error);
      throw error;
    } finally {
      setIsLoading(false);
    }
  }, []);

  /**
   * Get all blood requests for the current user
   */
  const getUserBloodRequests = useCallback(async () => {
    try {
      setIsLoading(true);
      setError(null);
      
      const requests = await bloodRequestService.getUserBloodRequests();
      setUserRequests(requests);
      
      return requests;
    } catch (err) {
      const error = err instanceof Error ? err : new Error('Failed to get user blood requests');
      setError(error);
      throw error;
    } finally {
      setIsLoading(false);
    }
  }, []);

  /**
   * Get all public blood requests with optional filters
   */
  const getPublicBloodRequests = useCallback(async (filters?: BloodRequestFilters) => {
    try {
      setIsLoading(true);
      setError(null);
      
      const requests = await bloodRequestService.getPublicBloodRequests(filters);
      setPublicRequests(requests);
      
      return requests;
    } catch (err) {
      const error = err instanceof Error ? err : new Error('Failed to get public blood requests');
      setError(error);
      throw error;
    } finally {
      setIsLoading(false);
    }
  }, []);

  /**
   * Update a blood request
   */
  const updateBloodRequest = useCallback(async (id: string, data: Partial<BloodRequestFormData>) => {
    try {
      setIsLoading(true);
      setError(null);
      
      const updatedRequest = await bloodRequestService.updateBloodRequest(id, data);
      
      // Update the current request if it's the one being updated
      if (currentRequest && currentRequest.id === id) {
        setCurrentRequest(updatedRequest);
      }
      
      // Update the user requests list
      setUserRequests(prev => 
        prev.map(request => request.id === id ? updatedRequest : request)
      );
      
      return updatedRequest;
    } catch (err) {
      const error = err instanceof Error ? err : new Error('Failed to update blood request');
      setError(error);
      throw error;
    } finally {
      setIsLoading(false);
    }
  }, [currentRequest]);

  /**
   * Update the status of a blood request
   */
  const updateBloodRequestStatus = useCallback(async (id: string, status: 'Pending' | 'Matching' | 'Fulfilled' | 'Cancelled') => {
    try {
      setIsLoading(true);
      setError(null);
      
      const updatedRequest = await bloodRequestService.updateBloodRequestStatus(id, status);
      
      // Update the current request if it's the one being updated
      if (currentRequest && currentRequest.id === id) {
        setCurrentRequest(updatedRequest);
      }
      
      // Update the user requests list
      setUserRequests(prev => 
        prev.map(request => request.id === id ? updatedRequest : request)
      );
      
      return updatedRequest;
    } catch (err) {
      const error = err instanceof Error ? err : new Error('Failed to update blood request status');
      setError(error);
      throw error;
    } finally {
      setIsLoading(false);
    }
  }, [currentRequest]);

  /**
   * Delete a blood request
   */
  const deleteBloodRequest = useCallback(async (id: string) => {
    try {
      setIsLoading(true);
      setError(null);
      
      await bloodRequestService.deleteBloodRequest(id);
      
      // Remove the request from the user requests list
      setUserRequests(prev => prev.filter(request => request.id !== id));
      
      // Clear the current request if it's the one being deleted
      if (currentRequest && currentRequest.id === id) {
        setCurrentRequest(null);
      }
    } catch (err) {
      const error = err instanceof Error ? err : new Error('Failed to delete blood request');
      setError(error);
      throw error;
    } finally {
      setIsLoading(false);
    }
  }, [currentRequest]);

  /**
   * Match a blood request with potential donors
   */
  const matchBloodRequest = useCallback(async (requestId: string): Promise<MatchRequestResponse> => {
    try {
      setIsLoading(true);
      setError(null);
      
      const response = await bloodRequestService.matchBloodRequest(requestId);
      
      // Update the matches list
      if (response.matches) {
        setMatches(response.matches);
      }
      
      return response;
    } catch (err) {
      const error = err instanceof Error ? err : new Error('Failed to match blood request');
      setError(error);
      throw error;
    } finally {
      setIsLoading(false);
    }
  }, []);

  /**
   * Get all donation matches for a blood request
   */
  const getRequestMatches = useCallback(async (requestId: string) => {
    try {
      setIsLoading(true);
      setError(null);
      
      const matches = await bloodRequestService.getRequestMatches(requestId);
      setMatches(matches);
      
      return matches;
    } catch (err) {
      const error = err instanceof Error ? err : new Error('Failed to get donation matches');
      setError(error);
      throw error;
    } finally {
      setIsLoading(false);
    }
  }, []);

  /**
   * Get all donation matches for the current donor
   */
  const getDonorMatches = useCallback(async () => {
    try {
      setIsLoading(true);
      setError(null);
      
      const matches = await bloodRequestService.getDonorMatches();
      setDonorMatches(matches);
      
      return matches;
    } catch (err) {
      const error = err instanceof Error ? err : new Error('Failed to get donor matches');
      setError(error);
      throw error;
    } finally {
      setIsLoading(false);
    }
  }, []);

  /**
   * Update a donation match status
   */
  const updateMatchStatus = useCallback(async (
    matchId: string, 
    status: 'Accepted' | 'Declined' | 'Completed' | 'Cancelled',
    notes?: string
  ) => {
    try {
      setIsLoading(true);
      setError(null);
      
      const updatedMatch = await bloodRequestService.updateMatchStatus(matchId, status, notes);
      
      // Update the donor matches list
      setDonorMatches(prev => 
        prev.map(match => match.id === matchId ? updatedMatch : match)
      );
      
      return updatedMatch;
    } catch (err) {
      const error = err instanceof Error ? err : new Error('Failed to update donation match');
      setError(error);
      throw error;
    } finally {
      setIsLoading(false);
    }
  }, []);

  return {
    // State
    userRequests,
    publicRequests,
    currentRequest,
    matches,
    donorMatches,
    isLoading,
    error,
    
    // Methods
    createBloodRequest,
    getBloodRequestById,
    getUserBloodRequests,
    getPublicBloodRequests,
    updateBloodRequest,
    updateBloodRequestStatus,
    deleteBloodRequest,
    matchBloodRequest,
    getRequestMatches,
    getDonorMatches,
    updateMatchStatus,
  };
};

export default useBloodRequest; 