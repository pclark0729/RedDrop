import React, { useState, useEffect } from 'react';
import { DonorProfile, DonorProfileFormData, BloodType } from '../types';
import Button from '../../../components/common/Button';
import Input from '../../../components/common/Input';
import Card from '../../../components/common/Card';

const bloodTypes: BloodType[] = ['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'];

interface DonorProfileEditFormProps {
  profile: DonorProfile;
  isLoading: boolean;
  onSubmit: (data: DonorProfileFormData) => Promise<void>;
  onCancel: () => void;
}

const DonorProfileEditForm: React.FC<DonorProfileEditFormProps> = ({
  profile,
  isLoading,
  onSubmit,
  onCancel,
}) => {
  const [formData, setFormData] = useState<DonorProfileFormData>({
    blood_type: 'O+',
    weight: null,
    height: null,
    medical_conditions: [],
    medications: [],
    is_available: true,
    availability_radius_km: 20,
  });
  
  const [formErrors, setFormErrors] = useState<Partial<Record<keyof DonorProfileFormData, string>>>({});
  const [medicalCondition, setMedicalCondition] = useState('');
  const [medication, setMedication] = useState('');

  // Initialize form with profile data
  useEffect(() => {
    if (profile) {
      setFormData({
        blood_type: profile.blood_type,
        weight: profile.weight,
        height: profile.height,
        medical_conditions: [...profile.medical_conditions],
        medications: [...profile.medications],
        is_available: profile.is_available,
        availability_radius_km: profile.availability_radius_km,
      });
    }
  }, [profile]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target as HTMLInputElement;
    
    // Handle checkbox inputs
    if (type === 'checkbox') {
      const checked = (e.target as HTMLInputElement).checked;
      setFormData(prev => ({ ...prev, [name]: checked }));
      return;
    }
    
    // Handle number inputs
    if (type === 'number') {
      const numberValue = value === '' ? null : parseFloat(value);
      setFormData(prev => ({ ...prev, [name]: numberValue }));
      return;
    }
    
    // Handle other inputs
    setFormData(prev => ({ ...prev, [name]: value }));
    
    // Clear error when field is edited
    if (formErrors[name as keyof DonorProfileFormData]) {
      setFormErrors(prev => ({ ...prev, [name]: '' }));
    }
  };

  const addMedicalCondition = () => {
    if (medicalCondition.trim()) {
      setFormData(prev => ({
        ...prev,
        medical_conditions: [...prev.medical_conditions, medicalCondition.trim()]
      }));
      setMedicalCondition('');
    }
  };

  const removeMedicalCondition = (index: number) => {
    setFormData(prev => ({
      ...prev,
      medical_conditions: prev.medical_conditions.filter((_, i) => i !== index)
    }));
  };

  const addMedication = () => {
    if (medication.trim()) {
      setFormData(prev => ({
        ...prev,
        medications: [...prev.medications, medication.trim()]
      }));
      setMedication('');
    }
  };

  const removeMedication = (index: number) => {
    setFormData(prev => ({
      ...prev,
      medications: prev.medications.filter((_, i) => i !== index)
    }));
  };

  const validateForm = (): boolean => {
    const errors: Partial<Record<keyof DonorProfileFormData, string>> = {};
    
    if (!formData.blood_type) {
      errors.blood_type = 'Blood type is required';
    }
    
    if (formData.weight !== null && (formData.weight < 45 || formData.weight > 250)) {
      errors.weight = 'Weight must be between 45 and 250 kg';
    }
    
    if (formData.height !== null && (formData.height < 120 || formData.height > 220)) {
      errors.height = 'Height must be between 120 and 220 cm';
    }
    
    if (formData.availability_radius_km !== null && (formData.availability_radius_km < 1 || formData.availability_radius_km > 100)) {
      errors.availability_radius_km = 'Availability radius must be between 1 and 100 km';
    }
    
    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) return;
    
    try {
      await onSubmit(formData);
    } catch (error) {
      console.error('Error updating donor profile:', error);
    }
  };

  return (
    <Card className="w-full max-w-2xl p-6">
      <h2 className="text-2xl font-bold text-center mb-6">Edit Donor Profile</h2>
      
      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="space-y-4">
          <h3 className="text-lg font-semibold">Blood Information</h3>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Blood Type <span className="text-red-500">*</span>
            </label>
            <select
              name="blood_type"
              value={formData.blood_type}
              onChange={handleChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
              required
            >
              {bloodTypes.map(type => (
                <option key={type} value={type}>{type}</option>
              ))}
            </select>
            {formErrors.blood_type && (
              <p className="mt-1 text-sm text-red-600">{formErrors.blood_type}</p>
            )}
          </div>
        </div>
        
        <div className="space-y-4">
          <h3 className="text-lg font-semibold">Physical Information</h3>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Input
                label="Weight (kg)"
                type="number"
                name="weight"
                value={formData.weight === null ? '' : formData.weight.toString()}
                onChange={handleChange}
                error={formErrors.weight}
                placeholder="Enter your weight"
                min={45}
                max={250}
                step={0.1}
              />
            </div>
            
            <div>
              <Input
                label="Height (cm)"
                type="number"
                name="height"
                value={formData.height === null ? '' : formData.height.toString()}
                onChange={handleChange}
                error={formErrors.height}
                placeholder="Enter your height"
                min={120}
                max={220}
                step={0.1}
              />
            </div>
          </div>
        </div>
        
        <div className="space-y-4">
          <h3 className="text-lg font-semibold">Medical Information</h3>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Medical Conditions
            </label>
            <div className="flex space-x-2 mb-2">
              <Input
                type="text"
                value={medicalCondition}
                onChange={(e) => setMedicalCondition(e.target.value)}
                placeholder="Add a medical condition"
                className="flex-grow"
              />
              <Button
                type="button"
                variant="outline"
                onClick={addMedicalCondition}
              >
                Add
              </Button>
            </div>
            {formData.medical_conditions.length > 0 && (
              <div className="mt-2">
                <ul className="bg-gray-50 p-2 rounded-md">
                  {formData.medical_conditions.map((condition, index) => (
                    <li key={index} className="flex justify-between items-center py-1">
                      <span>{condition}</span>
                      <button
                        type="button"
                        onClick={() => removeMedicalCondition(index)}
                        className="text-red-500 hover:text-red-700"
                      >
                        Remove
                      </button>
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Medications
            </label>
            <div className="flex space-x-2 mb-2">
              <Input
                type="text"
                value={medication}
                onChange={(e) => setMedication(e.target.value)}
                placeholder="Add a medication"
                className="flex-grow"
              />
              <Button
                type="button"
                variant="outline"
                onClick={addMedication}
              >
                Add
              </Button>
            </div>
            {formData.medications.length > 0 && (
              <div className="mt-2">
                <ul className="bg-gray-50 p-2 rounded-md">
                  {formData.medications.map((med, index) => (
                    <li key={index} className="flex justify-between items-center py-1">
                      <span>{med}</span>
                      <button
                        type="button"
                        onClick={() => removeMedication(index)}
                        className="text-red-500 hover:text-red-700"
                      >
                        Remove
                      </button>
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        </div>
        
        <div className="space-y-4">
          <h3 className="text-lg font-semibold">Availability</h3>
          
          <div className="flex items-center">
            <input
              type="checkbox"
              id="is_available"
              name="is_available"
              checked={formData.is_available}
              onChange={handleChange}
              className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
            />
            <label htmlFor="is_available" className="ml-2 block text-sm text-gray-700">
              I am available to donate blood
            </label>
          </div>
          
          {formData.is_available && (
            <div>
              <Input
                label="Availability Radius (km)"
                type="number"
                name="availability_radius_km"
                value={formData.availability_radius_km === null ? '' : formData.availability_radius_km.toString()}
                onChange={handleChange}
                error={formErrors.availability_radius_km}
                placeholder="Enter your availability radius"
                min={1}
                max={100}
                step={1}
              />
              <p className="mt-1 text-sm text-gray-500">
                This is the maximum distance you're willing to travel to donate blood.
              </p>
            </div>
          )}
        </div>
        
        <div className="pt-4 flex space-x-4">
          <Button
            type="button"
            variant="outline"
            className="w-1/2"
            onClick={onCancel}
          >
            Cancel
          </Button>
          <Button
            type="submit"
            variant="primary"
            className="w-1/2"
            disabled={isLoading}
          >
            {isLoading ? 'Saving...' : 'Save Changes'}
          </Button>
        </div>
      </form>
    </Card>
  );
};

export default DonorProfileEditForm; 