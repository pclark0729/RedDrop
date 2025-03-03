import React, { useState, useEffect } from 'react';
import { DonationCamp, DonationCampFormData } from '../types';
import Button from '../../../components/common/Button';
import Input from '../../../components/common/Input';
import Card from '../../../components/common/Card';

interface DonationCampFormProps {
  initialData?: Partial<DonationCamp>;
  onSubmit: (data: DonationCampFormData) => Promise<void>;
  onCancel?: () => void;
  isSubmitting?: boolean;
}

const DonationCampForm: React.FC<DonationCampFormProps> = ({
  initialData,
  onSubmit,
  onCancel,
  isSubmitting = false,
}) => {
  const [formData, setFormData] = useState<DonationCampFormData>({
    name: '',
    description: '',
    start_date: '',
    end_date: '',
    address: '',
    city: '',
    state: '',
    postal_code: '',
    country: '',
    contact_phone: '',
    contact_email: '',
    registration_required: true,
  });

  const [errors, setErrors] = useState<Partial<Record<keyof DonationCampFormData, string>>>({});

  // Initialize form with initial data if provided
  useEffect(() => {
    if (initialData) {
      setFormData(prev => ({
        ...prev,
        name: initialData.name || '',
        description: initialData.description || '',
        start_date: initialData.start_date ? new Date(initialData.start_date).toISOString().split('T')[0] : '',
        end_date: initialData.end_date ? new Date(initialData.end_date).toISOString().split('T')[0] : '',
        address: initialData.address || '',
        city: initialData.city || '',
        state: initialData.state || '',
        postal_code: initialData.postal_code || '',
        country: initialData.country || '',
        latitude: initialData.latitude || undefined,
        longitude: initialData.longitude || undefined,
        contact_phone: initialData.contact_phone || '',
        contact_email: initialData.contact_email || '',
        website: initialData.website || undefined,
        max_capacity: initialData.max_capacity || undefined,
        registration_required: initialData.registration_required !== undefined 
          ? initialData.registration_required 
          : true,
      }));
    }
  }, [initialData]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target;
    
    // Handle checkbox inputs
    if (type === 'checkbox') {
      const checked = (e.target as HTMLInputElement).checked;
      setFormData(prev => ({ ...prev, [name]: checked }));
      return;
    }
    
    // Handle number inputs
    if (type === 'number') {
      setFormData(prev => ({ ...prev, [name]: value ? Number(value) : undefined }));
      return;
    }
    
    // Handle other inputs
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const validateForm = (): boolean => {
    const newErrors: Partial<Record<keyof DonationCampFormData, string>> = {};
    
    // Required fields
    if (!formData.name.trim()) newErrors.name = 'Name is required';
    if (!formData.description.trim()) newErrors.description = 'Description is required';
    if (!formData.start_date) newErrors.start_date = 'Start date is required';
    if (!formData.end_date) newErrors.end_date = 'End date is required';
    if (!formData.address.trim()) newErrors.address = 'Address is required';
    if (!formData.city.trim()) newErrors.city = 'City is required';
    if (!formData.state.trim()) newErrors.state = 'State is required';
    if (!formData.postal_code.trim()) newErrors.postal_code = 'Postal code is required';
    if (!formData.country.trim()) newErrors.country = 'Country is required';
    if (!formData.contact_phone.trim()) newErrors.contact_phone = 'Contact phone is required';
    if (!formData.contact_email.trim()) newErrors.contact_email = 'Contact email is required';
    
    // Date validation
    if (formData.start_date && formData.end_date) {
      const startDate = new Date(formData.start_date);
      const endDate = new Date(formData.end_date);
      
      if (endDate < startDate) {
        newErrors.end_date = 'End date must be after start date';
      }
    }
    
    // Email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (formData.contact_email && !emailRegex.test(formData.contact_email)) {
      newErrors.contact_email = 'Invalid email format';
    }
    
    // Website validation (if provided)
    if (formData.website) {
      try {
        new URL(formData.website);
      } catch (e) {
        newErrors.website = 'Invalid website URL';
      }
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }
    
    try {
      await onSubmit(formData);
    } catch (error) {
      console.error('Error submitting form:', error);
    }
  };

  return (
    <Card className="w-full max-w-4xl p-6">
      <h2 className="text-2xl font-bold mb-6">
        {initialData ? 'Edit Donation Camp' : 'Create New Donation Camp'}
      </h2>
      
      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Basic Information */}
          <div className="space-y-4 md:col-span-2">
            <h3 className="text-lg font-semibold">Basic Information</h3>
            
            <Input
              label="Camp Name"
              name="name"
              value={formData.name}
              onChange={handleChange}
              error={errors.name}
              required
            />
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Description
              </label>
              <textarea
                name="description"
                value={formData.description}
                onChange={handleChange}
                rows={4}
                className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                  errors.description ? 'border-red-500' : 'border-gray-300'
                }`}
                required
              />
              {errors.description && (
                <p className="mt-1 text-sm text-red-500">{errors.description}</p>
              )}
            </div>
          </div>
          
          {/* Date and Time */}
          <div>
            <Input
              label="Start Date"
              type="date"
              name="start_date"
              value={formData.start_date}
              onChange={handleChange}
              error={errors.start_date}
              required
            />
          </div>
          
          <div>
            <Input
              label="End Date"
              type="date"
              name="end_date"
              value={formData.end_date}
              onChange={handleChange}
              error={errors.end_date}
              required
            />
          </div>
          
          {/* Location Information */}
          <div className="space-y-4 md:col-span-2">
            <h3 className="text-lg font-semibold">Location</h3>
            
            <Input
              label="Address"
              name="address"
              value={formData.address}
              onChange={handleChange}
              error={errors.address}
              required
            />
            
            <div className="grid grid-cols-2 gap-4">
              <Input
                label="City"
                name="city"
                value={formData.city}
                onChange={handleChange}
                error={errors.city}
                required
              />
              
              <Input
                label="State/Province"
                name="state"
                value={formData.state}
                onChange={handleChange}
                error={errors.state}
                required
              />
            </div>
            
            <div className="grid grid-cols-2 gap-4">
              <Input
                label="Postal Code"
                name="postal_code"
                value={formData.postal_code}
                onChange={handleChange}
                error={errors.postal_code}
                required
              />
              
              <Input
                label="Country"
                name="country"
                value={formData.country}
                onChange={handleChange}
                error={errors.country}
                required
              />
            </div>
            
            <div className="grid grid-cols-2 gap-4">
              <Input
                label="Latitude (optional)"
                type="number"
                name="latitude"
                value={formData.latitude?.toString() || ''}
                onChange={handleChange}
                error={errors.latitude}
                step="0.000001"
              />
              
              <Input
                label="Longitude (optional)"
                type="number"
                name="longitude"
                value={formData.longitude?.toString() || ''}
                onChange={handleChange}
                error={errors.longitude}
                step="0.000001"
              />
            </div>
          </div>
          
          {/* Contact Information */}
          <div className="space-y-4 md:col-span-2">
            <h3 className="text-lg font-semibold">Contact Information</h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Input
                label="Contact Phone"
                name="contact_phone"
                value={formData.contact_phone}
                onChange={handleChange}
                error={errors.contact_phone}
                required
              />
              
              <Input
                label="Contact Email"
                type="email"
                name="contact_email"
                value={formData.contact_email}
                onChange={handleChange}
                error={errors.contact_email}
                required
              />
            </div>
            
            <Input
              label="Website (optional)"
              name="website"
              value={formData.website || ''}
              onChange={handleChange}
              error={errors.website}
              placeholder="https://example.com"
            />
          </div>
          
          {/* Additional Settings */}
          <div className="space-y-4 md:col-span-2">
            <h3 className="text-lg font-semibold">Additional Settings</h3>
            
            <Input
              label="Maximum Capacity (optional)"
              type="number"
              name="max_capacity"
              value={formData.max_capacity?.toString() || ''}
              onChange={handleChange}
              error={errors.max_capacity}
              min="1"
            />
            
            <div className="flex items-center">
              <input
                type="checkbox"
                id="registration_required"
                name="registration_required"
                checked={formData.registration_required}
                onChange={handleChange}
                className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
              />
              <label htmlFor="registration_required" className="ml-2 block text-sm text-gray-700">
                Registration required for donors
              </label>
            </div>
          </div>
        </div>
        
        <div className="flex justify-end space-x-4 pt-4">
          {onCancel && (
            <Button
              type="button"
              variant="outline"
              onClick={onCancel}
              disabled={isSubmitting}
            >
              Cancel
            </Button>
          )}
          
          <Button
            type="submit"
            variant="primary"
            disabled={isSubmitting}
          >
            {isSubmitting ? 'Saving...' : initialData ? 'Update Camp' : 'Create Camp'}
          </Button>
        </div>
      </form>
    </Card>
  );
};

export default DonationCampForm; 