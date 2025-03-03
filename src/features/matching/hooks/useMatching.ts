import { useState, useEffect, useCallback } from 'react';
import { 
  DonorMatch, 
  MatchStatus, 
  MatchUpdateData, 
  MatchingAlgorithmParams, 
  MatchingResult,
  MatchStatistics,
  MatchFilters
} from '../types';
import matchingService from '../services/matchingService';
import { useToast } from '../../../app/hooks/useToast';

export const useMatching = () => {
  const [matches, setMatches] = useState<DonorMatch[]>([]);
  const [matchingResult, setMatchingResult] = useState<MatchingResult | null>(null);
  const [statistics, setStatistics] = useState<MatchStatistics | null>(null);
  const [selectedMatch, setSelectedMatch] = useState<DonorMatch | null>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const { showToast } = useToast();

  /**
   * Find compatible donors for a blood request
   */
  const findMatches = useCallback(async (params: MatchingAlgorithmParams) => {
    setLoading(true);
    setError(null);
    try {
      const result = await matchingService.findMatches(params);
      setMatchingResult(result);
      return result;
    } catch (err: any) {
      setError(err.message || 'Failed to find matches');
      showToast({
        title: 'Error',
        description: err.message || 'Failed to find matches',
        status: 'error'
      });
      return null;
    } finally {
      setLoading(false);
    }
  }, [showToast]);

  /**
   * Create donation matches for a blood request
   */
  const createMatches = useCallback(async (requestId: string, donorIds: string[]) => {
    setLoading(true);
    setError(null);
    try {
      const result = await matchingService.createMatches(requestId, donorIds);
      showToast({
        title: 'Success',
        description: `Created ${result.length} donation matches`,
        status: 'success'
      });
      return result;
    } catch (err: any) {
      setError(err.message || 'Failed to create matches');
      showToast({
        title: 'Error',
        description: err.message || 'Failed to create matches',
        status: 'error'
      });
      return null;
    } finally {
      setLoading(false);
    }
  }, [showToast]);

  /**
   * Get all matches for a specific blood request
   */
  const getMatchesByRequestId = useCallback(async (requestId: string) => {
    setLoading(true);
    setError(null);
    try {
      const result = await matchingService.getMatchesByRequestId(requestId);
      setMatches(result);
      return result;
    } catch (err: any) {
      setError(err.message || 'Failed to get matches');
      showToast({
        title: 'Error',
        description: err.message || 'Failed to get matches',
        status: 'error'
      });
      return [];
    } finally {
      setLoading(false);
    }
  }, [showToast]);

  /**
   * Get all matches for the current donor
   */
  const getCurrentDonorMatches = useCallback(async (filters?: MatchFilters) => {
    setLoading(true);
    setError(null);
    try {
      const result = await matchingService.getCurrentDonorMatches(filters);
      setMatches(result);
      return result;
    } catch (err: any) {
      setError(err.message || 'Failed to get donor matches');
      showToast({
        title: 'Error',
        description: err.message || 'Failed to get donor matches',
        status: 'error'
      });
      return [];
    } finally {
      setLoading(false);
    }
  }, [showToast]);

  /**
   * Get a specific match by ID
   */
  const getMatchById = useCallback(async (matchId: string) => {
    setLoading(true);
    setError(null);
    try {
      const result = await matchingService.getMatchById(matchId);
      setSelectedMatch(result);
      return result;
    } catch (err: any) {
      setError(err.message || 'Failed to get match details');
      showToast({
        title: 'Error',
        description: err.message || 'Failed to get match details',
        status: 'error'
      });
      return null;
    } finally {
      setLoading(false);
    }
  }, [showToast]);

  /**
   * Update a match status and other details
   */
  const updateMatch = useCallback(async (matchId: string, updateData: MatchUpdateData) => {
    setLoading(true);
    setError(null);
    try {
      const result = await matchingService.updateMatch(matchId, updateData);
      
      // Update the matches list with the updated match
      setMatches(prevMatches => 
        prevMatches.map(match => 
          match.id === matchId ? { ...match, ...result } : match
        )
      );
      
      // Update the selected match if it's the one being updated
      if (selectedMatch && selectedMatch.id === matchId) {
        setSelectedMatch({ ...selectedMatch, ...result });
      }
      
      // Show appropriate toast message based on the status
      let toastMessage = 'Match updated successfully';
      if (updateData.status === MatchStatus.ACCEPTED) {
        toastMessage = 'You have accepted this donation request';
      } else if (updateData.status === MatchStatus.DECLINED) {
        toastMessage = 'You have declined this donation request';
      } else if (updateData.status === MatchStatus.COMPLETED) {
        toastMessage = 'Donation marked as completed';
      }
      
      showToast({
        title: 'Success',
        description: toastMessage,
        status: 'success'
      });
      
      return result;
    } catch (err: any) {
      setError(err.message || 'Failed to update match');
      showToast({
        title: 'Error',
        description: err.message || 'Failed to update match',
        status: 'error'
      });
      return null;
    } finally {
      setLoading(false);
    }
  }, [selectedMatch, showToast]);

  /**
   * Cancel a match
   */
  const cancelMatch = useCallback(async (matchId: string, reason?: string) => {
    setLoading(true);
    setError(null);
    try {
      const result = await matchingService.cancelMatch(matchId, reason);
      
      // Update the matches list with the cancelled match
      setMatches(prevMatches => 
        prevMatches.map(match => 
          match.id === matchId ? { ...match, ...result } : match
        )
      );
      
      // Update the selected match if it's the one being cancelled
      if (selectedMatch && selectedMatch.id === matchId) {
        setSelectedMatch({ ...selectedMatch, ...result });
      }
      
      showToast({
        title: 'Success',
        description: 'Donation match cancelled',
        status: 'success'
      });
      
      return result;
    } catch (err: any) {
      setError(err.message || 'Failed to cancel match');
      showToast({
        title: 'Error',
        description: err.message || 'Failed to cancel match',
        status: 'error'
      });
      return null;
    } finally {
      setLoading(false);
    }
  }, [selectedMatch, showToast]);

  /**
   * Get statistics for matches
   */
  const getMatchStatistics = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const result = await matchingService.getMatchStatistics();
      setStatistics(result);
      return result;
    } catch (err: any) {
      setError(err.message || 'Failed to get match statistics');
      showToast({
        title: 'Error',
        description: err.message || 'Failed to get match statistics',
        status: 'error'
      });
      return null;
    } finally {
      setLoading(false);
    }
  }, [showToast]);

  /**
   * Filter matches by status
   */
  const filterMatchesByStatus = useCallback((status: MatchStatus) => {
    return matches.filter(match => match.status === status);
  }, [matches]);

  /**
   * Get pending matches
   */
  const getPendingMatches = useCallback(() => {
    return filterMatchesByStatus(MatchStatus.PENDING);
  }, [filterMatchesByStatus]);

  /**
   * Get accepted matches
   */
  const getAcceptedMatches = useCallback(() => {
    return filterMatchesByStatus(MatchStatus.ACCEPTED);
  }, [filterMatchesByStatus]);

  /**
   * Get completed matches
   */
  const getCompletedMatches = useCallback(() => {
    return filterMatchesByStatus(MatchStatus.COMPLETED);
  }, [filterMatchesByStatus]);

  /**
   * Get declined matches
   */
  const getDeclinedMatches = useCallback(() => {
    return filterMatchesByStatus(MatchStatus.DECLINED);
  }, [filterMatchesByStatus]);

  /**
   * Get cancelled matches
   */
  const getCancelledMatches = useCallback(() => {
    return filterMatchesByStatus(MatchStatus.CANCELLED);
  }, [filterMatchesByStatus]);

  /**
   * Clear the selected match
   */
  const clearSelectedMatch = useCallback(() => {
    setSelectedMatch(null);
  }, []);

  /**
   * Clear the matching result
   */
  const clearMatchingResult = useCallback(() => {
    setMatchingResult(null);
  }, []);

  return {
    matches,
    matchingResult,
    statistics,
    selectedMatch,
    loading,
    error,
    findMatches,
    createMatches,
    getMatchesByRequestId,
    getCurrentDonorMatches,
    getMatchById,
    updateMatch,
    cancelMatch,
    getMatchStatistics,
    filterMatchesByStatus,
    getPendingMatches,
    getAcceptedMatches,
    getCompletedMatches,
    getDeclinedMatches,
    getCancelledMatches,
    clearSelectedMatch,
    clearMatchingResult
  };
}; 