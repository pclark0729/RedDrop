import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { CampFilters, CampStatus } from '../types';
import { useDonationCamp } from '../hooks/useDonationCamp';
import DonationCampCard from '../components/DonationCampCard';
import Button from '../../../components/common/Button';
import Input from '../../../components/common/Input';
import Card from '../../../components/common/Card';

const DonationCampListPage: React.FC = () => {
  const navigate = useNavigate();
  const { 
    camps, 
    isLoading, 
    error, 
    fetchPublicCamps,
    fetchUserRegistrations,
    userRegistrations
  } = useDonationCamp();
  
  const [filters, setFilters] = useState<CampFilters>({
    status: CampStatus.UPCOMING,
    searchTerm: '',
    city: '',
    state: '',
  });
  
  const [showFilters, setShowFilters] = useState(false);
  
  // Load camps on initial render and when filters change
  useEffect(() => {
    fetchPublicCamps(filters);
    fetchUserRegistrations();
  }, [fetchPublicCamps, fetchUserRegistrations, filters]);
  
  const handleFilterChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFilters(prev => ({ ...prev, [name]: value }));
  };
  
  const resetFilters = () => {
    setFilters({
      status: CampStatus.UPCOMING,
      searchTerm: '',
      city: '',
      state: '',
    });
  };
  
  const handleRegister = (campId: string) => {
    navigate(`/camps/${campId}/register`);
  };
  
  const handleCancelRegistration = (registrationId: string) => {
    navigate(`/camps/registrations/${registrationId}/cancel`);
  };
  
  // Check if user is registered for a camp
  const isRegisteredForCamp = (campId: string) => {
    return userRegistrations.some(reg => reg.camp_id === campId);
  };
  
  // Get registration ID for a camp
  const getRegistrationId = (campId: string) => {
    const registration = userRegistrations.find(reg => reg.camp_id === campId);
    return registration ? registration.id : null;
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-6">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Donation Camps</h1>
          <p className="text-gray-600 mt-1">Find and register for blood donation camps near you</p>
        </div>
        
        <div className="mt-4 md:mt-0 flex space-x-2">
          <Button 
            variant="outline" 
            onClick={() => setShowFilters(!showFilters)}
          >
            {showFilters ? 'Hide Filters' : 'Show Filters'}
          </Button>
          
          <Button 
            variant="primary" 
            onClick={() => navigate('/camps/create')}
          >
            Create Camp
          </Button>
        </div>
      </div>
      
      {showFilters && (
        <Card className="mb-6 p-4">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div>
              <label htmlFor="status" className="block text-sm font-medium text-gray-700 mb-1">
                Status
              </label>
              <select
                id="status"
                name="status"
                value={filters.status || ''}
                onChange={handleFilterChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="">All Statuses</option>
                {Object.values(CampStatus).map(status => (
                  <option key={status} value={status}>{status}</option>
                ))}
              </select>
            </div>
            
            <div>
              <Input
                label="City"
                name="city"
                value={filters.city || ''}
                onChange={handleFilterChange}
                placeholder="Filter by city"
              />
            </div>
            
            <div>
              <Input
                label="State/Province"
                name="state"
                value={filters.state || ''}
                onChange={handleFilterChange}
                placeholder="Filter by state"
              />
            </div>
            
            <div>
              <Input
                label="Search"
                name="searchTerm"
                value={filters.searchTerm || ''}
                onChange={handleFilterChange}
                placeholder="Search camps..."
              />
            </div>
          </div>
          
          <div className="flex justify-end mt-4">
            <Button 
              variant="outline" 
              onClick={resetFilters}
            >
              Reset Filters
            </Button>
          </div>
        </Card>
      )}
      
      {isLoading && (
        <div className="flex justify-center items-center py-12">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
        </div>
      )}
      
      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded mb-6">
          <p>Error loading donation camps: {error.message}</p>
        </div>
      )}
      
      {!isLoading && !error && camps.length === 0 && (
        <div className="bg-gray-50 border border-gray-200 rounded-md p-6 text-center">
          <h3 className="text-lg font-medium text-gray-900 mb-2">No donation camps found</h3>
          <p className="text-gray-600 mb-4">
            {filters.searchTerm || filters.city || filters.state 
              ? 'Try adjusting your filters to see more results'
              : 'There are no upcoming donation camps at this time'}
          </p>
          <Button 
            variant="primary" 
            onClick={() => navigate('/camps/create')}
          >
            Create a Donation Camp
          </Button>
        </div>
      )}
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {camps.map(camp => (
          <DonationCampCard
            key={camp.id}
            camp={camp}
            isRegistered={isRegisteredForCamp(camp.id)}
            onRegister={() => handleRegister(camp.id)}
            onCancelRegistration={() => {
              const regId = getRegistrationId(camp.id);
              if (regId) handleCancelRegistration(regId);
            }}
          />
        ))}
      </div>
    </div>
  );
};

export default DonationCampListPage; 