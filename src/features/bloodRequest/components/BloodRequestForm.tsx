import React, { useState } from 'react';
import { useForm, Controller } from 'react-hook-form';
import { BloodRequestFormData, BloodType, UrgencyLevel } from '../types';

interface BloodRequestFormProps {
  initialData?: Partial<BloodRequestFormData>;
  onSubmit: (data: BloodRequestFormData) => void;
  isLoading: boolean;
}

const BloodRequestForm: React.FC<BloodRequestFormProps> = ({
  initialData,
  onSubmit,
  isLoading
}) => {
  const { register, handleSubmit, control, formState: { errors } } = useForm<BloodRequestFormData>({
    defaultValues: {
      patient_name: initialData?.patient_name || '',
      blood_type: initialData?.blood_type || BloodType.A_POSITIVE,
      units_needed: initialData?.units_needed || 1,
      hospital_name: initialData?.hospital_name || '',
      hospital_address: initialData?.hospital_address || '',
      hospital_city: initialData?.hospital_city || '',
      hospital_state: initialData?.hospital_state || '',
      hospital_postal_code: initialData?.hospital_postal_code || '',
      urgency_level: initialData?.urgency_level || UrgencyLevel.NORMAL,
      required_by_date: initialData?.required_by_date || '',
      medical_notes: initialData?.medical_notes || '',
      contact_phone: initialData?.contact_phone || '',
      contact_email: initialData?.contact_email || '',
    }
  });

  const bloodTypeOptions = Object.values(BloodType).map(type => ({
    value: type,
    label: type.replace('_', '+').replace('NEGATIVE', '-').replace('POSITIVE', '+')
  }));

  const urgencyOptions = [
    { value: UrgencyLevel.LOW, label: 'Low' },
    { value: UrgencyLevel.NORMAL, label: 'Normal' },
    { value: UrgencyLevel.HIGH, label: 'High' },
    { value: UrgencyLevel.CRITICAL, label: 'Critical' },
  ];

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
      <div className="space-y-4">
        <h3 className="text-lg font-medium">Patient Information</h3>
        
        <div>
          <label htmlFor="patient_name" className="block text-sm font-medium text-gray-700">
            Patient Name
          </label>
          <input
            id="patient_name"
            type="text"
            {...register('patient_name', { required: 'Patient name is required' })}
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-red-500 focus:ring-red-500"
          />
          {errors.patient_name && (
            <p className="mt-1 text-sm text-red-600">{errors.patient_name.message}</p>
          )}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label htmlFor="blood_type" className="block text-sm font-medium text-gray-700">
              Blood Type
            </label>
            <Controller
              control={control}
              name="blood_type"
              rules={{ required: 'Blood type is required' }}
              render={({ field }) => (
                <select
                  id="blood_type"
                  {...field}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-red-500 focus:ring-red-500"
                >
                  {bloodTypeOptions.map(option => (
                    <option key={option.value} value={option.value}>
                      {option.label}
                    </option>
                  ))}
                </select>
              )}
            />
            {errors.blood_type && (
              <p className="mt-1 text-sm text-red-600">{errors.blood_type.message}</p>
            )}
          </div>

          <div>
            <label htmlFor="units_needed" className="block text-sm font-medium text-gray-700">
              Units Needed
            </label>
            <input
              id="units_needed"
              type="number"
              min="1"
              {...register('units_needed', { 
                required: 'Units needed is required',
                min: { value: 1, message: 'At least 1 unit is required' }
              })}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-red-500 focus:ring-red-500"
            />
            {errors.units_needed && (
              <p className="mt-1 text-sm text-red-600">{errors.units_needed.message}</p>
            )}
          </div>
        </div>
      </div>

      <div className="space-y-4">
        <h3 className="text-lg font-medium">Hospital Information</h3>
        
        <div>
          <label htmlFor="hospital_name" className="block text-sm font-medium text-gray-700">
            Hospital Name
          </label>
          <input
            id="hospital_name"
            type="text"
            {...register('hospital_name', { required: 'Hospital name is required' })}
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-red-500 focus:ring-red-500"
          />
          {errors.hospital_name && (
            <p className="mt-1 text-sm text-red-600">{errors.hospital_name.message}</p>
          )}
        </div>

        <div>
          <label htmlFor="hospital_address" className="block text-sm font-medium text-gray-700">
            Hospital Address
          </label>
          <input
            id="hospital_address"
            type="text"
            {...register('hospital_address', { required: 'Hospital address is required' })}
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-red-500 focus:ring-red-500"
          />
          {errors.hospital_address && (
            <p className="mt-1 text-sm text-red-600">{errors.hospital_address.message}</p>
          )}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label htmlFor="hospital_city" className="block text-sm font-medium text-gray-700">
              City
            </label>
            <input
              id="hospital_city"
              type="text"
              {...register('hospital_city', { required: 'City is required' })}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-red-500 focus:ring-red-500"
            />
            {errors.hospital_city && (
              <p className="mt-1 text-sm text-red-600">{errors.hospital_city.message}</p>
            )}
          </div>

          <div>
            <label htmlFor="hospital_state" className="block text-sm font-medium text-gray-700">
              State
            </label>
            <input
              id="hospital_state"
              type="text"
              {...register('hospital_state', { required: 'State is required' })}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-red-500 focus:ring-red-500"
            />
            {errors.hospital_state && (
              <p className="mt-1 text-sm text-red-600">{errors.hospital_state.message}</p>
            )}
          </div>

          <div>
            <label htmlFor="hospital_postal_code" className="block text-sm font-medium text-gray-700">
              Postal Code
            </label>
            <input
              id="hospital_postal_code"
              type="text"
              {...register('hospital_postal_code', { required: 'Postal code is required' })}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-red-500 focus:ring-red-500"
            />
            {errors.hospital_postal_code && (
              <p className="mt-1 text-sm text-red-600">{errors.hospital_postal_code.message}</p>
            )}
          </div>
        </div>
      </div>

      <div className="space-y-4">
        <h3 className="text-lg font-medium">Request Details</h3>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label htmlFor="urgency_level" className="block text-sm font-medium text-gray-700">
              Urgency Level
            </label>
            <Controller
              control={control}
              name="urgency_level"
              rules={{ required: 'Urgency level is required' }}
              render={({ field }) => (
                <select
                  id="urgency_level"
                  {...field}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-red-500 focus:ring-red-500"
                >
                  {urgencyOptions.map(option => (
                    <option key={option.value} value={option.value}>
                      {option.label}
                    </option>
                  ))}
                </select>
              )}
            />
            {errors.urgency_level && (
              <p className="mt-1 text-sm text-red-600">{errors.urgency_level.message}</p>
            )}
          </div>

          <div>
            <label htmlFor="required_by_date" className="block text-sm font-medium text-gray-700">
              Required By Date
            </label>
            <input
              id="required_by_date"
              type="date"
              {...register('required_by_date', { required: 'Required by date is required' })}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-red-500 focus:ring-red-500"
            />
            {errors.required_by_date && (
              <p className="mt-1 text-sm text-red-600">{errors.required_by_date.message}</p>
            )}
          </div>
        </div>

        <div>
          <label htmlFor="medical_notes" className="block text-sm font-medium text-gray-700">
            Medical Notes (Optional)
          </label>
          <textarea
            id="medical_notes"
            rows={3}
            {...register('medical_notes')}
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-red-500 focus:ring-red-500"
          />
        </div>
      </div>

      <div className="space-y-4">
        <h3 className="text-lg font-medium">Contact Information</h3>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label htmlFor="contact_phone" className="block text-sm font-medium text-gray-700">
              Contact Phone
            </label>
            <input
              id="contact_phone"
              type="tel"
              {...register('contact_phone', { required: 'Contact phone is required' })}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-red-500 focus:ring-red-500"
            />
            {errors.contact_phone && (
              <p className="mt-1 text-sm text-red-600">{errors.contact_phone.message}</p>
            )}
          </div>

          <div>
            <label htmlFor="contact_email" className="block text-sm font-medium text-gray-700">
              Contact Email
            </label>
            <input
              id="contact_email"
              type="email"
              {...register('contact_email', { 
                required: 'Contact email is required',
                pattern: {
                  value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
                  message: 'Invalid email address'
                }
              })}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-red-500 focus:ring-red-500"
            />
            {errors.contact_email && (
              <p className="mt-1 text-sm text-red-600">{errors.contact_email.message}</p>
            )}
          </div>
        </div>
      </div>

      <div className="pt-4">
        <button
          type="submit"
          disabled={isLoading}
          className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-red-600 hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 disabled:bg-red-300"
        >
          {isLoading ? 'Submitting...' : initialData?.patient_name ? 'Update Request' : 'Create Request'}
        </button>
      </div>
    </form>
  );
};

export default BloodRequestForm; 