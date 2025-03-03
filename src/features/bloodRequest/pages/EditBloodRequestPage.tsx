import React, { useEffect, useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { BloodRequestFormData } from '../types';
import BloodRequestForm from '../components/BloodRequestForm';
import useBloodRequest from '../hooks/useBloodRequest';

const EditBloodRequestPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { getBloodRequestById, updateBloodRequest, currentRequest, isLoading, error } = useBloodRequest();
  const [submitError, setSubmitError] = useState<string | null>(null);

  useEffect(() => {
    if (id) {
      const fetchData = async () => {
        try {
          await getBloodRequestById(id);
        } catch (err) {
          console.error('Error fetching blood request:', err);
        }
      };
      
      fetchData();
    }
  }, [id, getBloodRequestById]);

  const handleSubmit = async (data: BloodRequestFormData) => {
    if (!id) return;
    
    try {
      setSubmitError(null);
      await updateBloodRequest(id, data);
      navigate(`/blood-requests/${id}`);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to update blood request';
      setSubmitError(errorMessage);
      console.error('Error updating blood request:', err);
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

  // Convert the current request to form data format
  const initialData: BloodRequestFormData = {
    patient_name: currentRequest.patient_name,
    blood_type: currentRequest.blood_type,
    units_needed: currentRequest.units_needed,
    hospital_name: currentRequest.hospital_name,
    hospital_address: currentRequest.hospital_address,
    hospital_city: currentRequest.hospital_city,
    hospital_state: currentRequest.hospital_state,
    hospital_postal_code: currentRequest.hospital_postal_code,
    urgency_level: currentRequest.urgency_level,
    required_by_date: currentRequest.required_by_date,
    medical_notes: currentRequest.medical_notes || '',
    contact_phone: currentRequest.contact_phone,
    contact_email: currentRequest.contact_email,
  };

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      <div className="mb-6 flex justify-between items-center">
        <Link to={`/blood-requests/${id}`} className="text-red-600 hover:text-red-800">
          &larr; Back to Request Details
        </Link>
      </div>

      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900">Edit Blood Request</h1>
        <p className="mt-2 text-gray-600">
          Update the information for your blood donation request.
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
          initialData={initialData}
          onSubmit={handleSubmit} 
          isLoading={isLoading} 
        />
      </div>
    </div>
  );
};

export default EditBloodRequestPage; 