import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useDonorProfile } from '../hooks/useDonorProfile';
import { DonorProfileFormData } from '../types';
import DonorProfileView from '../components/DonorProfileView';
import DonorProfileEditForm from '../components/DonorProfileEditForm';
import { useAuth } from '../../auth/hooks/useAuth';

const DonorProfilePage: React.FC = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { 
    donorProfile, 
    donorStats, 
    donationHistory, 
    isLoading, 
    error, 
    fetchDonorProfile, 
    updateDonorProfile 
  } = useDonorProfile();
  
  const [isEditing, setIsEditing] = useState(false);

  useEffect(() => {
    if (!user) {
      navigate('/auth/login');
      return;
    }
    
    fetchDonorProfile();
  }, [user, navigate, fetchDonorProfile]);

  const handleEditClick = () => {
    setIsEditing(true);
  };

  const handleCancelEdit = () => {
    setIsEditing(false);
  };

  const handleUpdateProfile = async (formData: DonorProfileFormData) => {
    try {
      await updateDonorProfile(formData);
      setIsEditing(false);
    } catch (error) {
      console.error('Error updating profile:', error);
    }
  };

  if (error) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded relative" role="alert">
          <strong className="font-bold">Error: </strong>
          <span className="block sm:inline">{error.message || 'Failed to load donor profile'}</span>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex flex-col items-center">
        {isEditing && donorProfile ? (
          <DonorProfileEditForm
            profile={donorProfile}
            isLoading={isLoading}
            onSubmit={handleUpdateProfile}
            onCancel={handleCancelEdit}
          />
        ) : (
          <DonorProfileView
            profile={donorProfile}
            donationHistory={donationHistory}
            isLoading={isLoading}
            onEditClick={handleEditClick}
          />
        )}
      </div>
    </div>
  );
};

export default DonorProfilePage; 