import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import DonorRegistrationForm from '../components/DonorRegistrationForm';
import { useAuth } from '../../auth/hooks/useAuth';
import { useDonorProfile } from '../hooks/useDonorProfile';

const DonorRegistrationPage: React.FC = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { donorProfile, isLoading: isProfileLoading, fetchDonorProfile } = useDonorProfile();

  useEffect(() => {
    if (!user) {
      navigate('/auth/login');
      return;
    }
    
    // Check if user already has a donor profile
    fetchDonorProfile();
  }, [user, navigate, fetchDonorProfile]);

  useEffect(() => {
    // If user already has a donor profile, redirect to profile page
    if (donorProfile && !isProfileLoading) {
      navigate('/donor/profile');
    }
  }, [donorProfile, isProfileLoading, navigate]);

  const handleRegistrationSuccess = () => {
    navigate('/donor/profile');
  };

  const handleRegistrationError = (error: Error) => {
    console.error('Registration error:', error);
    // Error is handled in the form component
  };

  if (isProfileLoading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="flex justify-center">
          <div className="animate-pulse w-full max-w-2xl">
            <div className="h-8 bg-gray-200 rounded w-1/2 mb-6 mx-auto"></div>
            <div className="h-64 bg-gray-200 rounded mb-6"></div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex flex-col items-center">
        <h1 className="text-3xl font-bold mb-8 text-center">Become a Blood Donor</h1>
        
        <div className="mb-8 max-w-2xl text-center">
          <p className="text-lg text-gray-700 mb-4">
            Thank you for your interest in becoming a blood donor! By registering, you're taking the first step towards saving lives.
          </p>
          <p className="text-gray-600">
            Please fill out the form below with your information. Your details will be kept confidential and will only be used to match you with compatible blood recipients.
          </p>
        </div>
        
        <DonorRegistrationForm
          onSuccess={handleRegistrationSuccess}
          onError={handleRegistrationError}
        />
        
        <div className="mt-8 max-w-2xl text-center">
          <h2 className="text-xl font-semibold mb-4">Why Become a Donor?</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="bg-red-50 p-4 rounded-lg">
              <h3 className="font-medium text-red-700 mb-2">Save Lives</h3>
              <p className="text-sm">Your donation can save up to 3 lives with a single donation.</p>
            </div>
            <div className="bg-blue-50 p-4 rounded-lg">
              <h3 className="font-medium text-blue-700 mb-2">Quick Process</h3>
              <p className="text-sm">The donation process takes only about 10-15 minutes of your time.</p>
            </div>
            <div className="bg-green-50 p-4 rounded-lg">
              <h3 className="font-medium text-green-700 mb-2">Health Benefits</h3>
              <p className="text-sm">Regular donors receive free health check-ups and reduced risk of heart disease.</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DonorRegistrationPage; 