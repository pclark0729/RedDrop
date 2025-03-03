import React, { useEffect } from 'react';
import useBloodRequest from '../hooks/useBloodRequest';
import DonationMatchList from '../components/DonationMatchList';

const DonorMatchesPage: React.FC = () => {
  const { getDonorMatches, updateMatchStatus, donorMatches, isLoading, error } = useBloodRequest();

  useEffect(() => {
    const fetchData = async () => {
      try {
        await getDonorMatches();
      } catch (err) {
        console.error('Error fetching donor matches:', err);
      }
    };
    
    fetchData();
  }, [getDonorMatches]);

  const handleUpdateMatchStatus = async (matchId: string, status: 'Accepted' | 'Declined' | 'Completed' | 'Cancelled', notes?: string) => {
    try {
      await updateMatchStatus(matchId, status, notes);
      await getDonorMatches();
    } catch (err) {
      console.error('Error updating match status:', err);
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900">My Donation Matches</h1>
        <p className="mt-2 text-gray-600">
          View and manage your blood donation matches. Accept requests to help those in need or mark donations as completed.
        </p>
      </div>

      {error && (
        <div className="mb-6 bg-red-50 border-l-4 border-red-500 p-4">
          <div className="flex">
            <div className="flex-shrink-0">
              <svg className="h-5 w-5 text-red-400" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
              </svg>
            </div>
            <div className="ml-3">
              <p className="text-sm text-red-700">
                {error.message}
              </p>
            </div>
          </div>
        </div>
      )}

      <div className="bg-white shadow overflow-hidden sm:rounded-lg">
        <div className="px-4 py-5 sm:px-6">
          <h2 className="text-lg leading-6 font-medium text-gray-900">Donation Matches</h2>
          <p className="mt-1 max-w-2xl text-sm text-gray-500">
            These are blood donation requests that match your blood type and location.
          </p>
        </div>
        
        <div className="border-t border-gray-200">
          <DonationMatchList 
            matches={donorMatches}
            isLoading={isLoading}
            onUpdateStatus={handleUpdateMatchStatus}
            isDonorView={true}
          />
        </div>
      </div>
    </div>
  );
};

export default DonorMatchesPage; 