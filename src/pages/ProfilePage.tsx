import React, { useState } from 'react';
import { useAuth } from '../features/auth';
import { NotificationPreferencesForm } from '../features/notification';

const ProfilePage: React.FC = () => {
  const { user, updateProfile, loading, error } = useAuth();
  const [activeTab, setActiveTab] = useState<'profile' | 'preferences' | 'security'>('profile');
  const [formData, setFormData] = useState({
    first_name: user?.first_name || '',
    last_name: user?.last_name || '',
    email: user?.email || '',
    phone_number: user?.phone_number || '',
    address: user?.address || '',
    city: user?.city || '',
    state: user?.state || '',
    postal_code: user?.postal_code || '',
    country: user?.country || '',
  });
  const [isEditing, setIsEditing] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [saveError, setSaveError] = useState<string | null>(null);
  const [saveSuccess, setSaveSuccess] = useState(false);
  
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };
  
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    setSaveError(null);
    setSaveSuccess(false);
    
    try {
      await updateProfile(formData);
      setSaveSuccess(true);
      setIsEditing(false);
      
      // Hide success message after 3 seconds
      setTimeout(() => {
        setSaveSuccess(false);
      }, 3000);
    } catch (err) {
      setSaveError('Failed to update profile. Please try again.');
    } finally {
      setIsSaving(false);
    }
  };
  
  if (loading) {
    return (
      <div className="container mx-auto px-4 py-8 max-w-6xl">
        <div className="p-4 text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-red-700 mx-auto"></div>
          <p className="mt-2 text-gray-600">Loading profile...</p>
        </div>
      </div>
    );
  }
  
  if (error) {
    return (
      <div className="container mx-auto px-4 py-8 max-w-6xl">
        <div className="p-4">
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
            <p>Error loading profile: {error}</p>
          </div>
        </div>
      </div>
    );
  }
  
  return (
    <div className="container mx-auto px-4 py-8 max-w-6xl">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">My Profile</h1>
        <p className="text-gray-600 mt-2">
          Manage your account settings and preferences
        </p>
      </div>
      
      {/* Profile Tabs */}
      <div className="border-b border-gray-200 mb-6">
        <nav className="-mb-px flex space-x-8">
          <button
            onClick={() => setActiveTab('profile')}
            className={`${
              activeTab === 'profile'
                ? 'border-red-500 text-red-600'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            } whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm`}
          >
            Profile Information
          </button>
          <button
            onClick={() => setActiveTab('preferences')}
            className={`${
              activeTab === 'preferences'
                ? 'border-red-500 text-red-600'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            } whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm`}
          >
            Notification Preferences
          </button>
          <button
            onClick={() => setActiveTab('security')}
            className={`${
              activeTab === 'security'
                ? 'border-red-500 text-red-600'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            } whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm`}
          >
            Security
          </button>
        </nav>
      </div>
      
      {/* Tab Content */}
      <div>
        {activeTab === 'profile' && (
          <div className="bg-white shadow rounded-lg overflow-hidden">
            <div className="p-6">
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-lg font-medium text-gray-900">Profile Information</h2>
                {!isEditing && (
                  <button
                    onClick={() => setIsEditing(true)}
                    className="inline-flex items-center px-3 py-2 border border-transparent text-sm leading-4 font-medium rounded-md text-white bg-red-600 hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
                  >
                    Edit Profile
                  </button>
                )}
              </div>
              
              {saveError && (
                <div className="mb-4 bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
                  <p>{saveError}</p>
                </div>
              )}
              
              {saveSuccess && (
                <div className="mb-4 bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded">
                  <p>Profile updated successfully!</p>
                </div>
              )}
              
              {isEditing ? (
                <form onSubmit={handleSubmit}>
                  <div className="grid grid-cols-1 gap-y-6 gap-x-4 sm:grid-cols-6">
                    <div className="sm:col-span-3">
                      <label htmlFor="first_name" className="block text-sm font-medium text-gray-700">
                        First name
                      </label>
                      <div className="mt-1">
                        <input
                          type="text"
                          name="first_name"
                          id="first_name"
                          value={formData.first_name}
                          onChange={handleChange}
                          className="shadow-sm focus:ring-red-500 focus:border-red-500 block w-full sm:text-sm border-gray-300 rounded-md"
                        />
                      </div>
                    </div>
                    
                    <div className="sm:col-span-3">
                      <label htmlFor="last_name" className="block text-sm font-medium text-gray-700">
                        Last name
                      </label>
                      <div className="mt-1">
                        <input
                          type="text"
                          name="last_name"
                          id="last_name"
                          value={formData.last_name}
                          onChange={handleChange}
                          className="shadow-sm focus:ring-red-500 focus:border-red-500 block w-full sm:text-sm border-gray-300 rounded-md"
                        />
                      </div>
                    </div>
                    
                    <div className="sm:col-span-4">
                      <label htmlFor="email" className="block text-sm font-medium text-gray-700">
                        Email address
                      </label>
                      <div className="mt-1">
                        <input
                          type="email"
                          name="email"
                          id="email"
                          value={formData.email}
                          onChange={handleChange}
                          className="shadow-sm focus:ring-red-500 focus:border-red-500 block w-full sm:text-sm border-gray-300 rounded-md"
                          disabled
                        />
                      </div>
                    </div>
                    
                    <div className="sm:col-span-4">
                      <label htmlFor="phone_number" className="block text-sm font-medium text-gray-700">
                        Phone number
                      </label>
                      <div className="mt-1">
                        <input
                          type="text"
                          name="phone_number"
                          id="phone_number"
                          value={formData.phone_number}
                          onChange={handleChange}
                          className="shadow-sm focus:ring-red-500 focus:border-red-500 block w-full sm:text-sm border-gray-300 rounded-md"
                        />
                      </div>
                    </div>
                    
                    <div className="sm:col-span-6">
                      <label htmlFor="address" className="block text-sm font-medium text-gray-700">
                        Street address
                      </label>
                      <div className="mt-1">
                        <input
                          type="text"
                          name="address"
                          id="address"
                          value={formData.address}
                          onChange={handleChange}
                          className="shadow-sm focus:ring-red-500 focus:border-red-500 block w-full sm:text-sm border-gray-300 rounded-md"
                        />
                      </div>
                    </div>
                    
                    <div className="sm:col-span-2">
                      <label htmlFor="city" className="block text-sm font-medium text-gray-700">
                        City
                      </label>
                      <div className="mt-1">
                        <input
                          type="text"
                          name="city"
                          id="city"
                          value={formData.city}
                          onChange={handleChange}
                          className="shadow-sm focus:ring-red-500 focus:border-red-500 block w-full sm:text-sm border-gray-300 rounded-md"
                        />
                      </div>
                    </div>
                    
                    <div className="sm:col-span-2">
                      <label htmlFor="state" className="block text-sm font-medium text-gray-700">
                        State / Province
                      </label>
                      <div className="mt-1">
                        <input
                          type="text"
                          name="state"
                          id="state"
                          value={formData.state}
                          onChange={handleChange}
                          className="shadow-sm focus:ring-red-500 focus:border-red-500 block w-full sm:text-sm border-gray-300 rounded-md"
                        />
                      </div>
                    </div>
                    
                    <div className="sm:col-span-2">
                      <label htmlFor="postal_code" className="block text-sm font-medium text-gray-700">
                        ZIP / Postal code
                      </label>
                      <div className="mt-1">
                        <input
                          type="text"
                          name="postal_code"
                          id="postal_code"
                          value={formData.postal_code}
                          onChange={handleChange}
                          className="shadow-sm focus:ring-red-500 focus:border-red-500 block w-full sm:text-sm border-gray-300 rounded-md"
                        />
                      </div>
                    </div>
                    
                    <div className="sm:col-span-3">
                      <label htmlFor="country" className="block text-sm font-medium text-gray-700">
                        Country
                      </label>
                      <div className="mt-1">
                        <input
                          type="text"
                          name="country"
                          id="country"
                          value={formData.country}
                          onChange={handleChange}
                          className="shadow-sm focus:ring-red-500 focus:border-red-500 block w-full sm:text-sm border-gray-300 rounded-md"
                        />
                      </div>
                    </div>
                  </div>
                  
                  <div className="mt-6 flex justify-end space-x-3">
                    <button
                      type="button"
                      onClick={() => setIsEditing(false)}
                      className="bg-white py-2 px-4 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      disabled={isSaving}
                      className="inline-flex justify-center py-2 px-4 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-red-600 hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 disabled:opacity-50"
                    >
                      {isSaving ? 'Saving...' : 'Save'}
                    </button>
                  </div>
                </form>
              ) : (
                <div className="grid grid-cols-1 gap-y-6 gap-x-4 sm:grid-cols-6">
                  <div className="sm:col-span-3">
                    <h3 className="text-sm font-medium text-gray-500">First name</h3>
                    <p className="mt-1 text-sm text-gray-900">{user?.first_name || 'Not provided'}</p>
                  </div>
                  
                  <div className="sm:col-span-3">
                    <h3 className="text-sm font-medium text-gray-500">Last name</h3>
                    <p className="mt-1 text-sm text-gray-900">{user?.last_name || 'Not provided'}</p>
                  </div>
                  
                  <div className="sm:col-span-4">
                    <h3 className="text-sm font-medium text-gray-500">Email address</h3>
                    <p className="mt-1 text-sm text-gray-900">{user?.email || 'Not provided'}</p>
                  </div>
                  
                  <div className="sm:col-span-4">
                    <h3 className="text-sm font-medium text-gray-500">Phone number</h3>
                    <p className="mt-1 text-sm text-gray-900">{user?.phone_number || 'Not provided'}</p>
                  </div>
                  
                  <div className="sm:col-span-6">
                    <h3 className="text-sm font-medium text-gray-500">Street address</h3>
                    <p className="mt-1 text-sm text-gray-900">{user?.address || 'Not provided'}</p>
                  </div>
                  
                  <div className="sm:col-span-2">
                    <h3 className="text-sm font-medium text-gray-500">City</h3>
                    <p className="mt-1 text-sm text-gray-900">{user?.city || 'Not provided'}</p>
                  </div>
                  
                  <div className="sm:col-span-2">
                    <h3 className="text-sm font-medium text-gray-500">State / Province</h3>
                    <p className="mt-1 text-sm text-gray-900">{user?.state || 'Not provided'}</p>
                  </div>
                  
                  <div className="sm:col-span-2">
                    <h3 className="text-sm font-medium text-gray-500">ZIP / Postal code</h3>
                    <p className="mt-1 text-sm text-gray-900">{user?.postal_code || 'Not provided'}</p>
                  </div>
                  
                  <div className="sm:col-span-3">
                    <h3 className="text-sm font-medium text-gray-500">Country</h3>
                    <p className="mt-1 text-sm text-gray-900">{user?.country || 'Not provided'}</p>
                  </div>
                </div>
              )}
            </div>
          </div>
        )}
        
        {activeTab === 'preferences' && (
          <NotificationPreferencesForm />
        )}
        
        {activeTab === 'security' && (
          <div className="bg-white shadow rounded-lg overflow-hidden">
            <div className="p-6">
              <h2 className="text-lg font-medium text-gray-900 mb-6">Security Settings</h2>
              
              <div className="space-y-6">
                <div>
                  <h3 className="text-md font-medium text-gray-700 mb-3">Change Password</h3>
                  <button
                    type="button"
                    className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-red-600 hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
                  >
                    Change Password
                  </button>
                </div>
                
                <div className="pt-6 border-t border-gray-200">
                  <h3 className="text-md font-medium text-gray-700 mb-3">Two-Factor Authentication</h3>
                  <p className="text-sm text-gray-500 mb-3">
                    Add an extra layer of security to your account by enabling two-factor authentication.
                  </p>
                  <button
                    type="button"
                    className="inline-flex items-center px-4 py-2 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
                  >
                    Enable Two-Factor Authentication
                  </button>
                </div>
                
                <div className="pt-6 border-t border-gray-200">
                  <h3 className="text-md font-medium text-gray-700 mb-3">Delete Account</h3>
                  <p className="text-sm text-gray-500 mb-3">
                    Permanently delete your account and all associated data. This action cannot be undone.
                  </p>
                  <button
                    type="button"
                    className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-red-600 hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
                  >
                    Delete Account
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default ProfilePage; 