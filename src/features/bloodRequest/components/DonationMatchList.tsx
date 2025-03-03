import React from 'react';
import { DonationMatch } from '../types';
import { format } from 'date-fns';

interface DonationMatchListProps {
  matches: DonationMatch[];
  isLoading: boolean;
  onUpdateStatus?: (matchId: string, status: 'Accepted' | 'Declined' | 'Completed' | 'Cancelled', notes?: string) => void;
  isDonorView?: boolean;
}

const DonationMatchList: React.FC<DonationMatchListProps> = ({
  matches,
  isLoading,
  onUpdateStatus,
  isDonorView = false
}) => {
  const [selectedMatch, setSelectedMatch] = React.useState<string | null>(null);
  const [notes, setNotes] = React.useState<string>('');
  
  // Format date
  const formatDate = (dateString: string) => {
    try {
      return format(new Date(dateString), 'MMM dd, yyyy');
    } catch (error) {
      return 'Invalid date';
    }
  };

  // Get status badge color
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Pending':
        return 'bg-yellow-100 text-yellow-800';
      case 'Accepted':
        return 'bg-blue-100 text-blue-800';
      case 'Completed':
        return 'bg-green-100 text-green-800';
      case 'Declined':
      case 'Cancelled':
        return 'bg-gray-100 text-gray-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  if (isLoading) {
    return (
      <div className="flex justify-center items-center py-8">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-red-700"></div>
      </div>
    );
  }

  if (matches.length === 0) {
    return (
      <div className="text-center py-8">
        <p className="text-gray-500">No donation matches found.</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="overflow-hidden shadow ring-1 ring-black ring-opacity-5 md:rounded-lg">
        <table className="min-w-full divide-y divide-gray-300">
          <thead className="bg-gray-50">
            <tr>
              {isDonorView ? (
                <th scope="col" className="py-3.5 pl-4 pr-3 text-left text-sm font-semibold text-gray-900 sm:pl-6">
                  Request Details
                </th>
              ) : (
                <th scope="col" className="py-3.5 pl-4 pr-3 text-left text-sm font-semibold text-gray-900 sm:pl-6">
                  Donor
                </th>
              )}
              <th scope="col" className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">
                Match Date
              </th>
              <th scope="col" className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">
                Status
              </th>
              <th scope="col" className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">
                Notes
              </th>
              {onUpdateStatus && (
                <th scope="col" className="relative py-3.5 pl-3 pr-4 sm:pr-6">
                  <span className="sr-only">Actions</span>
                </th>
              )}
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200 bg-white">
            {matches.map((match) => (
              <tr key={match.id}>
                <td className="whitespace-nowrap py-4 pl-4 pr-3 text-sm sm:pl-6">
                  <div className="flex items-center">
                    <div>
                      {isDonorView ? (
                        <>
                          <div className="font-medium text-gray-900">Patient: {match.request_details?.patient_name}</div>
                          <div className="text-gray-500">Hospital: {match.request_details?.hospital_name}</div>
                          <div className="text-gray-500">
                            {match.request_details?.hospital_city}, {match.request_details?.hospital_state}
                          </div>
                        </>
                      ) : (
                        <>
                          <div className="font-medium text-gray-900">{match.donor_details?.first_name} {match.donor_details?.last_name}</div>
                          <div className="text-gray-500">Blood Type: {match.donor_details?.blood_type}</div>
                          <div className="text-gray-500">Distance: {match.distance_km.toFixed(1)} km</div>
                        </>
                      )}
                    </div>
                  </div>
                </td>
                <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500">
                  {formatDate(match.created_at)}
                </td>
                <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500">
                  <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(match.status)}`}>
                    {match.status}
                  </span>
                </td>
                <td className="px-3 py-4 text-sm text-gray-500 max-w-xs truncate">
                  {match.notes || '-'}
                </td>
                {onUpdateStatus && (
                  <td className="relative whitespace-nowrap py-4 pl-3 pr-4 text-right text-sm font-medium sm:pr-6">
                    {match.status === 'Pending' && (
                      <div className="flex space-x-2">
                        <button
                          onClick={() => {
                            setSelectedMatch(match.id);
                            setNotes('');
                          }}
                          className="text-blue-600 hover:text-blue-900"
                        >
                          Accept
                        </button>
                        <button
                          onClick={() => onUpdateStatus(match.id, 'Declined')}
                          className="text-gray-600 hover:text-gray-900"
                        >
                          Decline
                        </button>
                      </div>
                    )}
                    {match.status === 'Accepted' && isDonorView && (
                      <button
                        onClick={() => {
                          setSelectedMatch(match.id);
                          setNotes('');
                        }}
                        className="text-green-600 hover:text-green-900"
                      >
                        Complete Donation
                      </button>
                    )}
                    {match.status === 'Accepted' && !isDonorView && (
                      <button
                        onClick={() => onUpdateStatus(match.id, 'Cancelled')}
                        className="text-gray-600 hover:text-gray-900"
                      >
                        Cancel
                      </button>
                    )}
                  </td>
                )}
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Modal for adding notes when accepting or completing a donation */}
      {selectedMatch && (
        <div className="fixed inset-0 bg-gray-500 bg-opacity-75 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg max-w-md w-full p-6 shadow-xl">
            <h3 className="text-lg font-medium text-gray-900 mb-4">
              {matches.find(m => m.id === selectedMatch)?.status === 'Accepted' 
                ? 'Complete Donation' 
                : 'Accept Donation Request'}
            </h3>
            
            <div className="mb-4">
              <label htmlFor="notes" className="block text-sm font-medium text-gray-700 mb-1">
                Notes (optional)
              </label>
              <textarea
                id="notes"
                rows={4}
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                className="w-full rounded-md border-gray-300 shadow-sm focus:border-red-500 focus:ring-red-500"
                placeholder={matches.find(m => m.id === selectedMatch)?.status === 'Accepted'
                  ? "Add any notes about the donation (e.g., donation certificate number, date, etc.)"
                  : "Add any notes for the requester (e.g., preferred contact method, availability, etc.)"}
              />
            </div>
            
            <div className="flex justify-end space-x-3">
              <button
                type="button"
                onClick={() => setSelectedMatch(null)}
                className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md shadow-sm hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={() => {
                  const match = matches.find(m => m.id === selectedMatch);
                  if (match) {
                    onUpdateStatus!(
                      selectedMatch,
                      match.status === 'Accepted' ? 'Completed' : 'Accepted',
                      notes || undefined
                    );
                  }
                  setSelectedMatch(null);
                }}
                className="px-4 py-2 text-sm font-medium text-white bg-red-600 border border-transparent rounded-md shadow-sm hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
              >
                {matches.find(m => m.id === selectedMatch)?.status === 'Accepted' 
                  ? 'Complete' 
                  : 'Accept'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default DonationMatchList; 