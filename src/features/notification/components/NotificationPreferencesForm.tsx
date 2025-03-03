import React, { useState, useEffect } from 'react';
import { NotificationPreferences, NotificationType, NotificationChannel } from '../types';
import { useNotification } from '../hooks/useNotification';

const NotificationPreferencesForm: React.FC = () => {
  const { preferences, updatePreferences, loading, error } = useNotification();
  const [formState, setFormState] = useState<NotificationPreferences>({
    email_notifications: true,
    sms_notifications: false,
    request_notifications: true,
    match_notifications: true,
    camp_notifications: true,
    system_notifications: true,
  });
  const [isSaving, setIsSaving] = useState(false);
  const [saveError, setSaveError] = useState<string | null>(null);
  const [saveSuccess, setSaveSuccess] = useState(false);
  
  // Update form state when preferences are loaded
  useEffect(() => {
    if (preferences) {
      setFormState(preferences);
    }
  }, [preferences]);
  
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, checked } = e.target;
    setFormState(prev => ({
      ...prev,
      [name]: checked
    }));
    
    // Reset status messages
    setSaveError(null);
    setSaveSuccess(false);
  };
  
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    setSaveError(null);
    setSaveSuccess(false);
    
    try {
      await updatePreferences(formState);
      setSaveSuccess(true);
      
      // Hide success message after 3 seconds
      setTimeout(() => {
        setSaveSuccess(false);
      }, 3000);
    } catch (err) {
      setSaveError('Failed to save preferences. Please try again.');
    } finally {
      setIsSaving(false);
    }
  };
  
  if (loading) {
    return (
      <div className="p-4 text-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-red-700 mx-auto"></div>
        <p className="mt-2 text-gray-600">Loading preferences...</p>
      </div>
    );
  }
  
  if (error) {
    return (
      <div className="p-4">
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
          <p>Error loading preferences: {error}</p>
        </div>
      </div>
    );
  }
  
  return (
    <div className="bg-white shadow rounded-lg overflow-hidden">
      <div className="p-6">
        <h2 className="text-lg font-medium text-gray-900 mb-4">Notification Preferences</h2>
        
        {saveError && (
          <div className="mb-4 bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
            <p>{saveError}</p>
          </div>
        )}
        
        {saveSuccess && (
          <div className="mb-4 bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded">
            <p>Preferences saved successfully!</p>
          </div>
        )}
        
        <form onSubmit={handleSubmit}>
          <div className="space-y-6">
            <div>
              <h3 className="text-md font-medium text-gray-700 mb-3">Notification Channels</h3>
              <div className="space-y-3">
                <div className="flex items-start">
                  <div className="flex items-center h-5">
                    <input
                      id="email_notifications"
                      name="email_notifications"
                      type="checkbox"
                      checked={formState.email_notifications}
                      onChange={handleChange}
                      className="focus:ring-red-500 h-4 w-4 text-red-600 border-gray-300 rounded"
                    />
                  </div>
                  <div className="ml-3 text-sm">
                    <label htmlFor="email_notifications" className="font-medium text-gray-700">Email Notifications</label>
                    <p className="text-gray-500">Receive notifications via email</p>
                  </div>
                </div>
                
                <div className="flex items-start">
                  <div className="flex items-center h-5">
                    <input
                      id="sms_notifications"
                      name="sms_notifications"
                      type="checkbox"
                      checked={formState.sms_notifications}
                      onChange={handleChange}
                      className="focus:ring-red-500 h-4 w-4 text-red-600 border-gray-300 rounded"
                    />
                  </div>
                  <div className="ml-3 text-sm">
                    <label htmlFor="sms_notifications" className="font-medium text-gray-700">SMS Notifications</label>
                    <p className="text-gray-500">Receive notifications via SMS (requires verified phone number)</p>
                  </div>
                </div>
              </div>
            </div>
            
            <div>
              <h3 className="text-md font-medium text-gray-700 mb-3">Notification Types</h3>
              <div className="space-y-3">
                <div className="flex items-start">
                  <div className="flex items-center h-5">
                    <input
                      id="request_notifications"
                      name="request_notifications"
                      type="checkbox"
                      checked={formState.request_notifications}
                      onChange={handleChange}
                      className="focus:ring-red-500 h-4 w-4 text-red-600 border-gray-300 rounded"
                    />
                  </div>
                  <div className="ml-3 text-sm">
                    <label htmlFor="request_notifications" className="font-medium text-gray-700">Blood Request Notifications</label>
                    <p className="text-gray-500">Updates about blood requests in your area</p>
                  </div>
                </div>
                
                <div className="flex items-start">
                  <div className="flex items-center h-5">
                    <input
                      id="match_notifications"
                      name="match_notifications"
                      type="checkbox"
                      checked={formState.match_notifications}
                      onChange={handleChange}
                      className="focus:ring-red-500 h-4 w-4 text-red-600 border-gray-300 rounded"
                    />
                  </div>
                  <div className="ml-3 text-sm">
                    <label htmlFor="match_notifications" className="font-medium text-gray-700">Donation Match Notifications</label>
                    <p className="text-gray-500">Alerts when you're matched with a blood request</p>
                  </div>
                </div>
                
                <div className="flex items-start">
                  <div className="flex items-center h-5">
                    <input
                      id="camp_notifications"
                      name="camp_notifications"
                      type="checkbox"
                      checked={formState.camp_notifications}
                      onChange={handleChange}
                      className="focus:ring-red-500 h-4 w-4 text-red-600 border-gray-300 rounded"
                    />
                  </div>
                  <div className="ml-3 text-sm">
                    <label htmlFor="camp_notifications" className="font-medium text-gray-700">Donation Camp Notifications</label>
                    <p className="text-gray-500">Updates about donation camps in your area</p>
                  </div>
                </div>
                
                <div className="flex items-start">
                  <div className="flex items-center h-5">
                    <input
                      id="system_notifications"
                      name="system_notifications"
                      type="checkbox"
                      checked={formState.system_notifications}
                      onChange={handleChange}
                      className="focus:ring-red-500 h-4 w-4 text-red-600 border-gray-300 rounded"
                    />
                  </div>
                  <div className="ml-3 text-sm">
                    <label htmlFor="system_notifications" className="font-medium text-gray-700">System Notifications</label>
                    <p className="text-gray-500">Important system updates and announcements</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
          
          <div className="mt-6">
            <button
              type="submit"
              disabled={isSaving}
              className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-red-600 hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 disabled:opacity-50"
            >
              {isSaving ? 'Saving...' : 'Save Preferences'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default NotificationPreferencesForm; 