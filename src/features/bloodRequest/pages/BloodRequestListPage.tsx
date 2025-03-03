import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { BloodType, UrgencyLevel, RequestStatus, BloodRequestFilters } from '../types';
import useBloodRequest from '../hooks/useBloodRequest';
import BloodRequestList from '../components/BloodRequestList';

const BloodRequestListPage: React.FC = () => {
  const { getUserBloodRequests, getPublicBloodRequests, userRequests, publicRequests, isLoading, error } = useBloodRequest();
  const [activeTab, setActiveTab] = useState<'my-requests' | 'public-requests'>('my-requests');
  const [filters, setFilters] = useState<BloodRequestFilters>({});
  const [showFilters, setShowFilters] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
      try {
        await getUserBloodRequests();
        await getPublicBloodRequests();
      } catch (err) {
        console.error('Error fetching blood requests:', err);
      }
    };
    
    fetchData();
  }, [getUserBloodRequests, getPublicBloodRequests]);

  const handleFilterChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const { name, value } = e.target;
    
    if (value === '') {
      const newFilters = { ...filters };
      delete newFilters[name as keyof BloodRequestFilters];
      setFilters(newFilters);
    } else {
      setFilters(prev => ({ ...prev, [name]: value }));
    }
  };

  const applyFilters = async () => {
    try {
      await getPublicBloodRequests(filters);
    } catch (err) {
      console.error('Error applying filters:', err);
    }
  };

  const resetFilters = async () => {
    setFilters({});
    try {
      await getPublicBloodRequests({});
    } catch (err) {
      console.error('Error resetting filters:', err);
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      <div className="mb-8 flex justify-between items-center">
        <h1 className="text-2xl font-bold text-gray-900">Blood Requests</h1>
        <Link
          to="/blood-requests/new"
          className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-red-600 hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
        >
          Create New Request
        </Link>
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

      <div className="mb-6">
        <div className="border-b border-gray-200">
          <nav className="-mb-px flex" aria-label="Tabs">
            <button
              onClick={() => setActiveTab('my-requests')}
              className={`${
                activeTab === 'my-requests'
                  ? 'border-red-500 text-red-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              } w-1/2 py-4 px-1 text-center border-b-2 font-medium text-sm`}
            >
              My Requests
            </button>
            <button
              onClick={() => setActiveTab('public-requests')}
              className={`${
                activeTab === 'public-requests'
                  ? 'border-red-500 text-red-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              } w-1/2 py-4 px-1 text-center border-b-2 font-medium text-sm`}
            >
              Public Requests
            </button>
          </nav>
        </div>
      </div>

      {activeTab === 'public-requests' && (
        <div className="mb-6">
          <div className="flex justify-between items-center mb-4">
            <button
              type="button"
              onClick={() => setShowFilters(!showFilters)}
              className="inline-flex items-center px-3 py-1.5 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
            >
              {showFilters ? 'Hide Filters' : 'Show Filters'}
            </button>
            
            {Object.keys(filters).length > 0 && (
              <button
                type="button"
                onClick={resetFilters}
                className="inline-flex items-center px-3 py-1.5 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
              >
                Reset Filters
              </button>
            )}
          </div>

          {showFilters && (
            <div className="bg-white shadow overflow-hidden sm:rounded-lg p-4 mb-6">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label htmlFor="blood_type" className="block text-sm font-medium text-gray-700 mb-1">
                    Blood Type
                  </label>
                  <select
                    id="blood_type"
                    name="blood_type"
                    value={filters.blood_type || ''}
                    onChange={handleFilterChange}
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-red-500 focus:ring-red-500"
                  >
                    <option value="">Any Blood Type</option>
                    {Object.values(BloodType).map(type => (
                      <option key={type} value={type}>
                        {type.replace('_', '+').replace('NEGATIVE', '-').replace('POSITIVE', '+')}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label htmlFor="urgency_level" className="block text-sm font-medium text-gray-700 mb-1">
                    Urgency Level
                  </label>
                  <select
                    id="urgency_level"
                    name="urgency_level"
                    value={filters.urgency_level || ''}
                    onChange={handleFilterChange}
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-red-500 focus:ring-red-500"
                  >
                    <option value="">Any Urgency</option>
                    <option value={UrgencyLevel.LOW}>Low</option>
                    <option value={UrgencyLevel.NORMAL}>Normal</option>
                    <option value={UrgencyLevel.HIGH}>High</option>
                    <option value={UrgencyLevel.CRITICAL}>Critical</option>
                  </select>
                </div>

                <div>
                  <label htmlFor="status" className="block text-sm font-medium text-gray-700 mb-1">
                    Status
                  </label>
                  <select
                    id="status"
                    name="status"
                    value={filters.status || ''}
                    onChange={handleFilterChange}
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-red-500 focus:ring-red-500"
                  >
                    <option value="">Any Status</option>
                    <option value={RequestStatus.PENDING}>Pending</option>
                    <option value={RequestStatus.MATCHING}>Matching</option>
                    <option value={RequestStatus.FULFILLED}>Fulfilled</option>
                    <option value={RequestStatus.CANCELLED}>Cancelled</option>
                  </select>
                </div>

                <div>
                  <label htmlFor="city" className="block text-sm font-medium text-gray-700 mb-1">
                    City
                  </label>
                  <input
                    type="text"
                    id="city"
                    name="city"
                    value={filters.city || ''}
                    onChange={(e) => setFilters(prev => ({ ...prev, city: e.target.value }))}
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-red-500 focus:ring-red-500"
                    placeholder="Filter by city"
                  />
                </div>

                <div>
                  <label htmlFor="state" className="block text-sm font-medium text-gray-700 mb-1">
                    State
                  </label>
                  <input
                    type="text"
                    id="state"
                    name="state"
                    value={filters.state || ''}
                    onChange={(e) => setFilters(prev => ({ ...prev, state: e.target.value }))}
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-red-500 focus:ring-red-500"
                    placeholder="Filter by state"
                  />
                </div>
              </div>

              <div className="mt-4 flex justify-end">
                <button
                  type="button"
                  onClick={applyFilters}
                  className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-red-600 hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
                >
                  Apply Filters
                </button>
              </div>
            </div>
          )}
        </div>
      )}

      {activeTab === 'my-requests' ? (
        <BloodRequestList
          requests={userRequests}
          isLoading={isLoading}
          emptyMessage="You haven't created any blood requests yet."
        />
      ) : (
        <BloodRequestList
          requests={publicRequests}
          isLoading={isLoading}
          emptyMessage="No public blood requests found."
          showRequesterInfo
        />
      )}
    </div>
  );
};

export default BloodRequestListPage; 