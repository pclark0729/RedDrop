import React from 'react';
import { Link } from 'react-router-dom';
import { BloodRequest, RequestStatus, UrgencyLevel } from '../types';
import { format } from 'date-fns';

interface BloodRequestListProps {
  requests: BloodRequest[];
  isLoading: boolean;
  emptyMessage?: string;
  showRequesterInfo?: boolean;
}

const BloodRequestList: React.FC<BloodRequestListProps> = ({
  requests,
  isLoading,
  emptyMessage = 'No blood requests found.',
  showRequesterInfo = false
}) => {
  // Format blood type for display
  const formatBloodType = (type: string) => {
    return type.replace('_', '+').replace('NEGATIVE', '-').replace('POSITIVE', '+');
  };

  // Get urgency level label and color
  const getUrgencyInfo = (level: UrgencyLevel) => {
    switch (level) {
      case UrgencyLevel.LOW:
        return { label: 'Low', color: 'bg-blue-100 text-blue-800' };
      case UrgencyLevel.NORMAL:
        return { label: 'Normal', color: 'bg-green-100 text-green-800' };
      case UrgencyLevel.HIGH:
        return { label: 'High', color: 'bg-yellow-100 text-yellow-800' };
      case UrgencyLevel.CRITICAL:
        return { label: 'Critical', color: 'bg-red-100 text-red-800' };
      default:
        return { label: 'Unknown', color: 'bg-gray-100 text-gray-800' };
    }
  };

  // Get status label and color
  const getStatusInfo = (status: RequestStatus) => {
    switch (status) {
      case RequestStatus.PENDING:
        return { label: 'Pending', color: 'bg-yellow-100 text-yellow-800' };
      case RequestStatus.MATCHING:
        return { label: 'Matching', color: 'bg-blue-100 text-blue-800' };
      case RequestStatus.FULFILLED:
        return { label: 'Fulfilled', color: 'bg-green-100 text-green-800' };
      case RequestStatus.CANCELLED:
        return { label: 'Cancelled', color: 'bg-gray-100 text-gray-800' };
      default:
        return { label: 'Unknown', color: 'bg-gray-100 text-gray-800' };
    }
  };

  // Format date
  const formatDate = (dateString: string) => {
    try {
      return format(new Date(dateString), 'MMM dd, yyyy');
    } catch (error) {
      return 'Invalid date';
    }
  };

  if (isLoading) {
    return (
      <div className="flex justify-center items-center py-8">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-red-700"></div>
      </div>
    );
  }

  if (requests.length === 0) {
    return (
      <div className="text-center py-8">
        <p className="text-gray-500">{emptyMessage}</p>
      </div>
    );
  }

  return (
    <div className="overflow-hidden shadow ring-1 ring-black ring-opacity-5 md:rounded-lg">
      <table className="min-w-full divide-y divide-gray-300">
        <thead className="bg-gray-50">
          <tr>
            <th scope="col" className="py-3.5 pl-4 pr-3 text-left text-sm font-semibold text-gray-900 sm:pl-6">
              Patient
            </th>
            <th scope="col" className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">
              Blood Type
            </th>
            <th scope="col" className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">
              Units
            </th>
            <th scope="col" className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">
              Hospital
            </th>
            <th scope="col" className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">
              Required By
            </th>
            <th scope="col" className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">
              Status
            </th>
            <th scope="col" className="relative py-3.5 pl-3 pr-4 sm:pr-6">
              <span className="sr-only">View</span>
            </th>
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-200 bg-white">
          {requests.map((request) => {
            const urgencyInfo = getUrgencyInfo(request.urgency_level);
            const statusInfo = getStatusInfo(request.status);
            
            return (
              <tr key={request.id}>
                <td className="whitespace-nowrap py-4 pl-4 pr-3 text-sm sm:pl-6">
                  <div className="flex items-center">
                    <div>
                      <div className="font-medium text-gray-900">{request.patient_name}</div>
                      {showRequesterInfo && (
                        <div className="text-gray-500">Requested by {request.requester_id}</div>
                      )}
                    </div>
                  </div>
                </td>
                <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500">
                  <div className="text-gray-900 font-medium">{formatBloodType(request.blood_type)}</div>
                  <div className="mt-1">
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${urgencyInfo.color}`}>
                      {urgencyInfo.label}
                    </span>
                  </div>
                </td>
                <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500">
                  {request.units_needed}
                </td>
                <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500">
                  <div className="text-gray-900">{request.hospital_name}</div>
                  <div>{request.hospital_city}, {request.hospital_state}</div>
                </td>
                <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500">
                  {formatDate(request.required_by_date)}
                </td>
                <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500">
                  <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${statusInfo.color}`}>
                    {statusInfo.label}
                  </span>
                </td>
                <td className="relative whitespace-nowrap py-4 pl-3 pr-4 text-right text-sm font-medium sm:pr-6">
                  <Link 
                    to={`/blood-requests/${request.id}`} 
                    className="text-red-600 hover:text-red-900"
                  >
                    View<span className="sr-only">, {request.patient_name}</span>
                  </Link>
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
};

export default BloodRequestList; 