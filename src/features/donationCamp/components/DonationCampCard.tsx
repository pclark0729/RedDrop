import React from 'react';
import { Link } from 'react-router-dom';
import { DonationCamp, CampStatus } from '../types';
import Card from '../../../components/common/Card';
import Button from '../../../components/common/Button';

interface DonationCampCardProps {
  camp: DonationCamp;
  isUserCamp?: boolean;
  onRegister?: () => void;
  onEdit?: () => void;
  onDelete?: () => void;
  isRegistered?: boolean;
  onCancelRegistration?: () => void;
  className?: string;
}

const DonationCampCard: React.FC<DonationCampCardProps> = ({
  camp,
  isUserCamp = false,
  onRegister,
  onEdit,
  onDelete,
  isRegistered = false,
  onCancelRegistration,
  className = '',
}) => {
  // Format dates for display
  const formatDate = (dateString: string) => {
    const options: Intl.DateTimeFormatOptions = { 
      year: 'numeric', 
      month: 'long', 
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    };
    return new Date(dateString).toLocaleDateString(undefined, options);
  };
  
  // Get status badge color
  const getStatusColor = (status: CampStatus) => {
    switch (status) {
      case CampStatus.UPCOMING:
        return 'bg-blue-100 text-blue-800';
      case CampStatus.ACTIVE:
        return 'bg-green-100 text-green-800';
      case CampStatus.COMPLETED:
        return 'bg-gray-100 text-gray-800';
      case CampStatus.CANCELLED:
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };
  
  // Check if camp is active (current date is between start and end date)
  const isActive = () => {
    const now = new Date();
    const startDate = new Date(camp.start_date);
    const endDate = new Date(camp.end_date);
    return now >= startDate && now <= endDate;
  };
  
  // Check if camp is upcoming (current date is before start date)
  const isUpcoming = () => {
    const now = new Date();
    const startDate = new Date(camp.start_date);
    return now < startDate;
  };
  
  // Check if camp is completed (current date is after end date)
  const isCompleted = () => {
    const now = new Date();
    const endDate = new Date(camp.end_date);
    return now > endDate;
  };
  
  // Determine if registration is possible
  const canRegister = () => {
    return (
      !isUserCamp && 
      !isRegistered && 
      (camp.status === CampStatus.UPCOMING || camp.status === CampStatus.ACTIVE) &&
      (isUpcoming() || isActive())
    );
  };
  
  // Determine if cancellation is possible
  const canCancel = () => {
    return (
      isRegistered && 
      (camp.status === CampStatus.UPCOMING || camp.status === CampStatus.ACTIVE) &&
      (isUpcoming() || isActive())
    );
  };

  return (
    <Card className={`overflow-hidden ${className}`}>
      <div className="p-5">
        <div className="flex justify-between items-start mb-3">
          <h3 className="text-xl font-bold text-gray-900 truncate">{camp.name}</h3>
          <span className={`px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(camp.status)}`}>
            {camp.status}
          </span>
        </div>
        
        <p className="text-gray-600 mb-4 line-clamp-2">{camp.description}</p>
        
        <div className="space-y-2 mb-4">
          <div className="flex items-start">
            <svg className="h-5 w-5 text-gray-500 mr-2 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
            </svg>
            <div>
              <p className="text-sm text-gray-700">
                <span className="font-medium">Start:</span> {formatDate(camp.start_date)}
              </p>
              <p className="text-sm text-gray-700">
                <span className="font-medium">End:</span> {formatDate(camp.end_date)}
              </p>
            </div>
          </div>
          
          <div className="flex items-start">
            <svg className="h-5 w-5 text-gray-500 mr-2 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
            </svg>
            <div>
              <p className="text-sm text-gray-700">{camp.address}</p>
              <p className="text-sm text-gray-700">{camp.city}, {camp.state} {camp.postal_code}</p>
              <p className="text-sm text-gray-700">{camp.country}</p>
            </div>
          </div>
          
          {camp.max_capacity && (
            <div className="flex items-center">
              <svg className="h-5 w-5 text-gray-500 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
              </svg>
              <p className="text-sm text-gray-700">
                <span className="font-medium">Capacity:</span> {camp.max_capacity} donors
              </p>
            </div>
          )}
          
          <div className="flex items-center">
            <svg className="h-5 w-5 text-gray-500 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
            </svg>
            <p className="text-sm text-gray-700">{camp.contact_phone}</p>
          </div>
          
          <div className="flex items-center">
            <svg className="h-5 w-5 text-gray-500 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
            </svg>
            <p className="text-sm text-gray-700">{camp.contact_email}</p>
          </div>
          
          {camp.website && (
            <div className="flex items-center">
              <svg className="h-5 w-5 text-gray-500 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 12a9 9 0 01-9 9m9-9a9 9 0 00-9-9m9 9H3m9 9a9 9 0 01-9-9m9 9c1.657 0 3-4.03 3-9s-1.343-9-3-9m0 18c-1.657 0-3-4.03-3-9s1.343-9 3-9m-9 9a9 9 0 019-9" />
              </svg>
              <a 
                href={camp.website} 
                target="_blank" 
                rel="noopener noreferrer" 
                className="text-sm text-blue-600 hover:underline"
              >
                {camp.website}
              </a>
            </div>
          )}
        </div>
        
        <div className="flex flex-wrap gap-2 mt-4">
          <Link to={`/camps/${camp.id}`}>
            <Button variant="outline" size="sm">
              View Details
            </Button>
          </Link>
          
          {isUserCamp && onEdit && (
            <Button variant="outline" size="sm" onClick={onEdit}>
              Edit
            </Button>
          )}
          
          {isUserCamp && onDelete && (
            <Button variant="danger" size="sm" onClick={onDelete}>
              Delete
            </Button>
          )}
          
          {canRegister() && onRegister && (
            <Button variant="primary" size="sm" onClick={onRegister}>
              Register
            </Button>
          )}
          
          {canCancel() && onCancelRegistration && (
            <Button variant="danger" size="sm" onClick={onCancelRegistration}>
              Cancel Registration
            </Button>
          )}
          
          {isRegistered && !canCancel() && (
            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
              Registered
            </span>
          )}
        </div>
      </div>
    </Card>
  );
};

export default DonationCampCard; 