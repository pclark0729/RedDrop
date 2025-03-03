import React from 'react';
import { Link } from 'react-router-dom';
import { DonorProfile, DonationHistoryItem } from '../types';
import Card from '../../../components/common/Card';
import Button from '../../../components/common/Button';

interface DonorProfileViewProps {
  profile: DonorProfile | null;
  donationHistory: DonationHistoryItem[];
  isLoading: boolean;
  onEditClick: () => void;
}

const DonorProfileView: React.FC<DonorProfileViewProps> = ({
  profile,
  donationHistory,
  isLoading,
  onEditClick,
}) => {
  if (isLoading) {
    return (
      <Card className="w-full max-w-2xl p-6">
        <div className="animate-pulse">
          <div className="h-8 bg-gray-200 rounded w-1/2 mb-6"></div>
          <div className="h-4 bg-gray-200 rounded w-3/4 mb-3"></div>
          <div className="h-4 bg-gray-200 rounded w-1/2 mb-3"></div>
          <div className="h-4 bg-gray-200 rounded w-2/3 mb-3"></div>
          <div className="h-4 bg-gray-200 rounded w-1/3 mb-6"></div>
          <div className="h-10 bg-gray-200 rounded w-1/4"></div>
        </div>
      </Card>
    );
  }

  if (!profile) {
    return (
      <Card className="w-full max-w-2xl p-6 text-center">
        <h2 className="text-2xl font-bold mb-4">No Donor Profile Found</h2>
        <p className="text-gray-600 mb-6">
          You haven't registered as a donor yet. Register now to start helping others!
        </p>
        <Link to="/donor/register">
          <Button variant="primary">Register as Donor</Button>
        </Link>
      </Card>
    );
  }

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return new Intl.DateTimeFormat('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    }).format(date);
  };

  return (
    <div className="space-y-6 w-full max-w-2xl">
      <Card className="p-6">
        <div className="flex justify-between items-start mb-6">
          <h2 className="text-2xl font-bold">Donor Profile</h2>
          <Button variant="outline" onClick={onEditClick}>
            Edit Profile
          </Button>
        </div>

        <div className="space-y-6">
          <div>
            <h3 className="text-lg font-semibold mb-3">Blood Information</h3>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-sm text-gray-500">Blood Type</p>
                <p className="font-medium">{profile.blood_type}</p>
              </div>
              <div>
                <p className="text-sm text-gray-500">Donor Status</p>
                <p className="font-medium">
                  {profile.is_verified ? (
                    <span className="text-green-600">Verified</span>
                  ) : (
                    <span className="text-yellow-600">Pending Verification</span>
                  )}
                </p>
              </div>
            </div>
          </div>

          <div>
            <h3 className="text-lg font-semibold mb-3">Physical Information</h3>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-sm text-gray-500">Weight</p>
                <p className="font-medium">
                  {profile.weight ? `${profile.weight} kg` : 'Not provided'}
                </p>
              </div>
              <div>
                <p className="text-sm text-gray-500">Height</p>
                <p className="font-medium">
                  {profile.height ? `${profile.height} cm` : 'Not provided'}
                </p>
              </div>
            </div>
          </div>

          <div>
            <h3 className="text-lg font-semibold mb-3">Medical Information</h3>
            
            <div className="mb-4">
              <p className="text-sm text-gray-500 mb-1">Medical Conditions</p>
              {profile.medical_conditions.length > 0 ? (
                <ul className="list-disc list-inside">
                  {profile.medical_conditions.map((condition, index) => (
                    <li key={index} className="font-medium">{condition}</li>
                  ))}
                </ul>
              ) : (
                <p className="font-medium">None reported</p>
              )}
            </div>
            
            <div>
              <p className="text-sm text-gray-500 mb-1">Medications</p>
              {profile.medications.length > 0 ? (
                <ul className="list-disc list-inside">
                  {profile.medications.map((medication, index) => (
                    <li key={index} className="font-medium">{medication}</li>
                  ))}
                </ul>
              ) : (
                <p className="font-medium">None reported</p>
              )}
            </div>
          </div>

          <div>
            <h3 className="text-lg font-semibold mb-3">Availability</h3>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-sm text-gray-500">Status</p>
                <p className="font-medium">
                  {profile.is_available ? (
                    <span className="text-green-600">Available</span>
                  ) : (
                    <span className="text-red-600">Not Available</span>
                  )}
                </p>
              </div>
              {profile.is_available && (
                <div>
                  <p className="text-sm text-gray-500">Radius</p>
                  <p className="font-medium">{profile.availability_radius_km} km</p>
                </div>
              )}
            </div>
          </div>
        </div>
      </Card>

      <Card className="p-6">
        <h2 className="text-2xl font-bold mb-6">Donation History</h2>
        
        {donationHistory.length === 0 ? (
          <div className="text-center py-6">
            <p className="text-gray-600">No donation history yet.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Date
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Location
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Amount
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Type
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {donationHistory.map((donation, index) => (
                  <tr key={index}>
                    <td className="px-6 py-4 whitespace-nowrap">
                      {formatDate(donation.donation_date)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      {donation.location}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      {donation.amount_ml} ml
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      {donation.donation_type}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </Card>

      <Card className="p-6">
        <h2 className="text-2xl font-bold mb-4">Donor Statistics</h2>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="bg-blue-50 p-4 rounded-lg text-center">
            <p className="text-sm text-gray-600">Total Donations</p>
            <p className="text-3xl font-bold text-blue-600">{donationHistory.length}</p>
          </div>
          
          <div className="bg-green-50 p-4 rounded-lg text-center">
            <p className="text-sm text-gray-600">Total Volume</p>
            <p className="text-3xl font-bold text-green-600">
              {donationHistory.reduce((total, donation) => total + donation.amount_ml, 0)} ml
            </p>
          </div>
          
          <div className="bg-purple-50 p-4 rounded-lg text-center">
            <p className="text-sm text-gray-600">Last Donation</p>
            <p className="text-xl font-bold text-purple-600">
              {donationHistory.length > 0
                ? formatDate(donationHistory[0].donation_date)
                : 'Never'}
            </p>
          </div>
        </div>
      </Card>
    </div>
  );
};

export default DonorProfileView; 