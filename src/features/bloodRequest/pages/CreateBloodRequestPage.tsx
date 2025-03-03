import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { BloodRequestFormData } from '../types';
import BloodRequestForm from '../components/BloodRequestForm';
import useBloodRequest from '../hooks/useBloodRequest';

const CreateBloodRequestPage: React.FC = () => {
  const navigate = useNavigate();
  const { createBloodRequest, isLoading, error } = useBloodRequest();
  const [submitError, setSubmitError] = useState<string | null>(null);

  const handleSubmit = async (data: BloodRequestFormData) => {
    try {
      setSubmitError(null);
      const newRequest = await createBloodRequest(data);
      navigate(`/blood-requests/${newRequest.id}`);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to create blood request';
      setSubmitError(errorMessage);
      console.error('Error creating blood request:', err);
    }
  };

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900">Create Blood Request</h1>
        <p className="mt-2 text-gray-600">
          Fill out the form below to create a new blood donation request. Please provide accurate information
          to help us find suitable donors for your request.
        </p>
      </div>

      {submitError && (
        <div className="mb-6 bg-red-50 border-l-4 border-red-500 p-4">
          <div className="flex">
            <div className="flex-shrink-0">
              <svg className="h-5 w-5 text-red-400" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
              </svg>
            </div>
            <div className="ml-3">
              <p className="text-sm text-red-700">
                {submitError}
              </p>
            </div>
          </div>
        </div>
      )}

      <div className="bg-white shadow overflow-hidden sm:rounded-lg p-6">
        <BloodRequestForm 
          onSubmit={handleSubmit} 
          isLoading={isLoading} 
        />
      </div>
    </div>
  );
};

export default CreateBloodRequestPage; 