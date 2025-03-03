import React, { useEffect, useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { RequestStatus } from '../types';
import useBloodRequest from '../hooks/useBloodRequest';
import BloodRequestDetail from '../components/BloodRequestDetail';
import DonationMatchList from '../components/DonationMatchList';

const BloodRequestDetailPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { 
    getBloodRequestById, 
    updateBloodRequestStatus, 
    deleteBloodRequest, 
    matchBloodRequest,
    getRequestMatches,
    updateMatchStatus,
    currentRequest, 
    matches,
    isLoading, 
    error 
  } = useBloodRequest();
  
  const [matchError, setMatchError] = useState<string | null>(null);
  const [matchSuccess, setMatchSuccess] = useState<string | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const [isMatching, setIsMatching] = useState(false);

  useEffect(() => {
    if (id) {
      const fetchData = async () => {
        try {
          await getBloodRequestById(id);
          await getRequestMatches(id);
        } catch (err) {
          console.error('Error fetching blood request:', err);
        }
      };
      
      fetchData();
    }
  }, [id, getBloodRequestById, getRequestMatches]);

  const handleUpdateStatus = async (status: RequestStatus) => {
    if (!id) return;
    
    try {
      await updateBloodRequestStatus(id, status);
    } catch (err) {
      console.error('Error updating blood request status:', err);
    }
  };

  const handleDelete = async () => {
    if (!id) return;
    
    setIsDeleting(true);
    try {
      await deleteBloodRequest(id);
      navigate('/blood-requests');
    } catch (err) {
      console.error('Error deleting blood request:', err);
    } finally {
      setIsDeleting(false);
    }
  };

  const handleMatch = async () => {
    if (!id) return;
    
    setIsMatching(true);
    setMatchError(null);
    setMatchSuccess(null);
    
    try {
      const response = await matchBloodRequest(id);
      
      if (response.matches && response.matches.length > 0) {
        setMatchSuccess(`Found ${response.matches.length} potential donor${response.matches.length > 1 ? 's' : ''}!`);
        await getRequestMatches(id);
      } else {
        setMatchError('No matching donors found. Please try again later.');
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to match blood request';
      setMatchError(errorMessage);
      console.error('Error matching blood request:', err);
    } finally {
      setIsMatching(false);
    }
  };

  const handleUpdateMatchStatus = async (matchId: string, status: 'Accepted' | 'Declined' | 'Completed' | 'Cancelled', notes?: string) => {
    if (!id) return;
    
    try {
      await updateMatchStatus(matchId, status, notes);
      await getRequestMatches(id);
    } catch (err) {
      console.error('Error updating match status:', err);
    }
  };

  if (isLoading && !currentRequest) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-8">
        <div className="flex justify-center items-center py-16">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-red-700"></div>
        </div>
      </div>
    );
  }

  if (error || !currentRequest) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-8">
        <div className="bg-red-50 border-l-4 border-red-500 p-4 mb-6">
          <div className="flex">
            <div className="flex-shrink-0">
              <svg className="h-5 w-5 text-red-400" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
              </svg>
            </div>
            <div className="ml-3">
              <p className="text-sm text-red-700">
                {error ? error.message : 'Blood request not found'}
              </p>
            </div>
          </div>
        </div>
        <Link to="/blood-requests" className="text-red-600 hover:text-red-800">
          &larr; Back to Blood Requests
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      <div className="mb-6 flex justify-between items-center">
        <Link to="/blood-requests" className="text-red-600 hover:text-red-800">
          &larr; Back to Blood Requests
        </Link>
        
        <Link 
          to={`/blood-requests/${id}/edit`} 
          className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-red-600 hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
        >
          Edit Request
        </Link>
      </div>

      {matchError && (
        <div className="mb-6 bg-red-50 border-l-4 border-red-500 p-4">
          <div className="flex">
            <div className="flex-shrink-0">
              <svg className="h-5 w-5 text-red-400" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
              </svg>
            </div>
            <div className="ml-3">
              <p className="text-sm text-red-700">{matchError}</p>
            </div>
          </div>
        </div>
      )}

      {matchSuccess && (
        <div className="mb-6 bg-green-50 border-l-4 border-green-500 p-4">
          <div className="flex">
            <div className="flex-shrink-0">
              <svg className="h-5 w-5 text-green-400" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
              </svg>
            </div>
            <div className="ml-3">
              <p className="text-sm text-green-700">{matchSuccess}</p>
            </div>
          </div>
        </div>
      )}

      <div className="mb-8">
        <BloodRequestDetail 
          request={currentRequest}
          onUpdateStatus={handleUpdateStatus}
          onDelete={handleDelete}
          onMatch={handleMatch}
          isLoading={isLoading || isDeleting || isMatching}
        />
      </div>

      {currentRequest.status === RequestStatus.MATCHING && (
        <div className="mt-8">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">Potential Donors</h2>
          <DonationMatchList 
            matches={matches}
            isLoading={isLoading}
            onUpdateStatus={handleUpdateMatchStatus}
          />
        </div>
      )}
    </div>
  );
};

export default BloodRequestDetailPage; 