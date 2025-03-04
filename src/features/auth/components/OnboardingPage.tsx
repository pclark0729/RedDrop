import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Box,
  Button,
  Container,
  Flex,
  FormControl,
  FormLabel,
  Heading,
  Input,
  Select,
  Stack,
  Text,
  Textarea,
  useToast,
  VStack,
  HStack,
  Progress,
  useColorModeValue,
  FormErrorMessage,
  Spinner,
  Center,
  Alert,
  AlertIcon,
  AlertTitle,
  AlertDescription,
} from '@chakra-ui/react';
import { useAuthContext } from '../context/AuthContext';
import MapboxAddressInput from '../../../components/common/MapboxAddressInput';
import MapboxProvider from '../../../components/common/MapboxProvider';
import supabase from '../../../app/supabase';

// Blood type options
const BLOOD_TYPES = ['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-', 'Unknown'];

// Donation frequency options
const DONATION_FREQUENCIES = [
  { value: 'first_time', label: 'First Time Donor' },
  { value: 'occasional', label: 'Occasional Donor (1-2 times per year)' },
  { value: 'regular', label: 'Regular Donor (3-4 times per year)' },
  { value: 'frequent', label: 'Frequent Donor (5+ times per year)' },
];

// Mapbox access token from environment variables
const MAPBOX_ACCESS_TOKEN = import.meta.env.VITE_MAPBOX_ACCESS_TOKEN || '';

const OnboardingPage: React.FC = () => {
  const { user, completeOnboarding, isLoading } = useAuthContext();
  const navigate = useNavigate();
  const toast = useToast();
  const bgColor = useColorModeValue('white', 'gray.800');
  const borderColor = useColorModeValue('gray.200', 'gray.700');
  
  // State to track if we're in forced access mode
  const [forcedAccess, setForcedAccess] = useState(false);
  const [loadingUser, setLoadingUser] = useState(false);
  const [loadingError, setLoadingError] = useState<string | null>(null);

  // Check for forced access and try to get user data from session storage
  useEffect(() => {
    const checkForcedAccess = async () => {
      const forcedAccessFlag = sessionStorage.getItem('force_onboarding_access') === 'true';
      const userId = sessionStorage.getItem('user_id');
      const userEmail = sessionStorage.getItem('user_email');
      
      if (forcedAccessFlag && !user && userId) {
        console.log('OnboardingPage: Forced access mode detected, attempting to load user data');
        setForcedAccess(true);
        setLoadingUser(true);
        
        try {
          // Try to fetch the user profile directly
          const { data: profileData, error: profileError } = await supabase
            .from('profiles')
            .select('*')
            .eq('id', userId)
            .single();
            
          if (profileError) {
            console.error('Error fetching profile in forced access mode:', profileError);
            setLoadingError('Could not load your profile data. Please try signing in again.');
          } else if (profileData) {
            console.log('Successfully loaded profile in forced access mode:', profileData);
            // Update form data with profile data
            setFormData(prev => ({
              ...prev,
              first_name: profileData.first_name || '',
              last_name: profileData.last_name || '',
              phone_number: profileData.phone_number || '',
              address: profileData.address || '',
              city: profileData.city || '',
              state: profileData.state || '',
              postal_code: profileData.postal_code || '',
              country: profileData.country || '',
              latitude: profileData.latitude || null,
              longitude: profileData.longitude || null,
              blood_type: profileData.blood_type || '',
            }));
          } else {
            // Create default form data with email
            setFormData(prev => ({
              ...prev,
              email: userEmail || '',
            }));
          }
        } catch (err) {
          console.error('Unexpected error in forced access mode:', err);
          setLoadingError('An unexpected error occurred. Please try signing in again.');
        } finally {
          setLoadingUser(false);
        }
      }
    };
    
    checkForcedAccess();
  }, [user]);

  // State for multi-step form
  const [step, setStep] = useState(1);
  const [formData, setFormData] = useState({
    first_name: user?.first_name || '',
    last_name: user?.last_name || '',
    phone_number: user?.phone_number || '',
    address: user?.address || '',
    city: user?.city || '',
    state: user?.state || '',
    postal_code: user?.postal_code || '',
    country: user?.country || '',
    latitude: user?.latitude || null,
    longitude: user?.longitude || null,
    blood_type: user?.blood_type || '',
    emergency_contact_name: '',
    emergency_contact_phone: '',
    medical_conditions: '',
    allergies: '',
    medications: '',
    donation_frequency: 'occasional',
    email: user?.email || '',
  });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);

  // Handle input changes
  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    
    // Clear error for this field if it exists
    if (errors[name]) {
      setErrors(prev => {
        const newErrors = { ...prev };
        delete newErrors[name];
        return newErrors;
      });
    }
  };

  // Handle address change from Mapbox
  const handleAddressChange = (address: string, coordinates?: { lat: number; lng: number }) => {
    console.log('Address selected:', address);
    console.log('Coordinates:', coordinates);
    
    // Default to current values
    let updatedAddress = address || formData.address || '';
    let city = formData.city || '';
    let state = formData.state || '';
    let postalCode = formData.postal_code || '';
    let country = formData.country || '';
    let latitude = coordinates?.lat ?? formData.latitude;
    let longitude = coordinates?.lng ?? formData.longitude;
    
    // Only try to extract components if we have a valid address string
    if (address && typeof address === 'string' && address.trim() !== '') {
      try {
        // Extract postal code (ZIP code in US format)
        const zipMatch = address.match(/\b\d{5}(-\d{4})?\b/);
        if (zipMatch) {
          postalCode = zipMatch[0];
          console.log('Extracted postal code:', postalCode);
        }
        
        // Extract state (2-letter code in US format)
        const stateMatch = address.match(/\b[A-Z]{2}\b/);
        if (stateMatch) {
          state = stateMatch[0];
          console.log('Extracted state:', state);
        }
        
        // Try to extract city and country from address parts
        const parts = address.split(',').map(part => part.trim()).filter(Boolean);
        console.log('Address parts:', parts);
        
        // Handle different address formats based on number of parts
        if (parts.length >= 2) {
          // For US addresses with format: "Street, City, State ZIP, Country"
          // For international: "Street, City, Region, Country"
          
          // Street address is typically the first part
          const streetAddress = parts[0];
          
          // For addresses with 2 parts: "Street, City"
          if (parts.length === 2) {
            city = parts[1];
          }
          // For addresses with 3 parts: "Street, City, State/Country"
          else if (parts.length === 3) {
            city = parts[1];
            
            // Last part could be state+zip or country
            const lastPart = parts[2];
            
            // Check if it contains a ZIP code
            const zipInLastPart = lastPart.match(/\b\d{5}(-\d{4})?\b/);
            if (zipInLastPart) {
              // Format like "Illinois 62221"
              const statePart = lastPart.replace(zipInLastPart[0], '').trim();
              state = statePart;
              postalCode = zipInLastPart[0];
            } 
            // Check if it's a state code
            else if (lastPart.length === 2 && lastPart === lastPart.toUpperCase()) {
              state = lastPart;
            }
            // Otherwise assume it's a country
            else {
              country = lastPart;
            }
          }
          // For addresses with 4 parts: "Street, City, State ZIP, Country"
          else if (parts.length === 4) {
            city = parts[1];
            
            // Third part is typically State+ZIP
            const thirdPart = parts[2];
            
            // Extract state and ZIP if present
            const zipInThirdPart = thirdPart.match(/\b\d{5}(-\d{4})?\b/);
            if (zipInThirdPart) {
              postalCode = zipInThirdPart[0];
              state = thirdPart.replace(zipInThirdPart[0], '').trim();
            } else {
              state = thirdPart;
            }
            
            // Fourth part is country
            country = parts[3];
          }
          // For addresses with 5+ parts: handle complex cases
          else if (parts.length >= 5) {
            // Second part is typically city
            city = parts[1];
            
            // Look for state and ZIP in the parts
            for (let i = 2; i < parts.length - 1; i++) {
              const part = parts[i];
              
              // Check for ZIP code
              const zipMatch = part.match(/\b\d{5}(-\d{4})?\b/);
              if (zipMatch) {
                postalCode = zipMatch[0];
                // If ZIP is found, the state is likely in the same part or the previous part
                const statePart = part.replace(zipMatch[0], '').trim();
                if (statePart) {
                  state = statePart;
                } else if (i > 2) {
                  state = parts[i-1];
                }
                break;
              }
              
              // Check for state code
              const stateCodeMatch = part.match(/\b[A-Z]{2}\b/);
              if (stateCodeMatch && part.length <= 3) {
                state = stateCodeMatch[0];
                break;
              }
            }
            
            // Last part is typically country
            country = parts[parts.length - 1];
          }
          
          console.log('Extracted components:');
          console.log('- Street:', streetAddress);
          console.log('- City:', city);
          console.log('- State:', state);
          console.log('- Postal Code:', postalCode);
          console.log('- Country:', country);
        }
      } catch (error) {
        console.error('Error parsing address components:', error);
      }
    }
    
    // Update form data with the address and any extracted components
    setFormData(prev => {
      const updatedData = {
        ...prev,
        address: updatedAddress,
        city: city || prev.city || '',
        state: state || prev.state || '',
        postal_code: postalCode || prev.postal_code || '',
        country: country || prev.country || '',
        latitude,
        longitude
      };
      
      console.log('Updated form data with address:', updatedData);
      return updatedData;
    });
    
    // Clear error for address if it exists
    if (errors.address) {
      setErrors(prev => {
        const newErrors = { ...prev };
        delete newErrors.address;
        return newErrors;
      });
    }
  };

  // Validate the current step
  const validateStep = () => {
    const newErrors: Record<string, string> = {};
    
    // Validate based on current step
    if (step === 1) {
      if (!formData.first_name) newErrors.first_name = 'First name is required';
      if (!formData.last_name) newErrors.last_name = 'Last name is required';
      if (!formData.phone_number) newErrors.phone_number = 'Phone number is required';
      if (!formData.address) newErrors.address = 'Address is required';
    } else if (step === 2) {
      if (!formData.emergency_contact_name) {
        newErrors.emergency_contact_name = 'Emergency contact name is required';
      }
      if (!formData.emergency_contact_phone) {
        newErrors.emergency_contact_phone = 'Emergency contact phone is required';
      }
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };
  
  // Validate all steps for final submission
  const validateAllSteps = () => {
    const newErrors: Record<string, string> = {};
    
    // Step 1 validation
    if (!formData.first_name) newErrors.first_name = 'First name is required';
    if (!formData.last_name) newErrors.last_name = 'Last name is required';
    if (!formData.phone_number) newErrors.phone_number = 'Phone number is required';
    if (!formData.address) newErrors.address = 'Address is required';
    
    // Step 2 validation
    if (!formData.emergency_contact_name) {
      newErrors.emergency_contact_name = 'Emergency contact name is required';
    }
    if (!formData.emergency_contact_phone) {
      newErrors.emergency_contact_phone = 'Emergency contact phone is required';
    }
    
    // Update errors state
    setErrors(newErrors);
    
    // Return true if no errors
    return Object.keys(newErrors).length === 0;
  };

  // Handle next step
  const handleNext = () => {
    if (validateStep()) {
      setStep(prev => prev + 1);
    }
  };

  // Handle previous step
  const handlePrevious = () => {
    setStep(prev => prev - 1);
  };

  // Handle form submission
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setSubmitError('');

    try {
      console.log('Submitting onboarding form with data:', formData);
      
      // Validate the current step before submission
      const stepErrors = validateStep();
      if (Object.keys(stepErrors).length > 0) {
        setErrors(stepErrors);
        setIsSubmitting(false);
        return;
      }

      // Get the current user ID
      const userId = user?.id;
      if (!userId) {
        throw new Error('User ID not found');
      }

      // If we're in forced access mode, we need to create or update the profile
      if (forcedAccess) {
        console.log('Updating profile in forced access mode');
        
        // Simplified update to avoid RLS recursion issues
        const { error: updateError } = await supabase
          .from('profiles')
          .update({
            first_name: formData.first_name,
            last_name: formData.last_name,
            phone_number: formData.phone_number,
            address: formData.address,
            city: formData.city || '',
            state: formData.state || '',
            postal_code: formData.postal_code || '',
            country: formData.country || '',
            latitude: formData.latitude,
            longitude: formData.longitude,
            updated_at: new Date().toISOString()
          })
          .eq('id', userId);
          
        if (updateError) {
          console.error('Failed to update profile:', updateError);
          throw updateError;
        }
        
        // Separate call to update onboarding_completed flag
        const { error: completionError } = await supabase
          .from('profiles')
          .update({
            onboarding_completed: true
          })
          .eq('id', userId);
          
        if (completionError) {
          console.error('Failed to mark onboarding as completed:', completionError);
          throw completionError;
        }
      }
    } catch (error) {
      console.error('Error completing onboarding:', error);
      setSubmitError('Failed to complete onboarding. Please try again.');
      setIsSubmitting(false);
      return;
    }
    
    // If we're here, the profile was created or updated successfully
    console.log('Onboarding completed successfully in forced access mode');
    
    // Complete the onboarding process
    try {
      await completeOnboarding();
      navigate('/dashboard');
    } catch (error) {
      console.error('Error completing onboarding:', error);
      setSubmitError('Failed to complete onboarding. Please try again.');
      setIsSubmitting(false);
    }
  };

  // Show loading state
  if (isLoading || loadingUser) {
    return (
      <Center h="100vh">
        <VStack spacing={4}>
          <Spinner size="xl" color="red.500" />
          <Text>Loading your profile...</Text>
        </VStack>
      </Center>
    );
  }

  // Show error state
  if (loadingError) {
    return (
      <Container maxW="container.md" py={8}>
        <Alert status="error" borderRadius="md">
          <AlertIcon />
          <VStack align="start">
            <AlertTitle>Error Loading Profile</AlertTitle>
            <AlertDescription>{loadingError}</AlertDescription>
            <Button 
              mt={4} 
              colorScheme="red" 
              onClick={() => {
                sessionStorage.removeItem('force_onboarding_access');
                navigate('/signin', { replace: true });
              }}
            >
              Return to Sign In
            </Button>
          </VStack>
        </Alert>
      </Container>
    );
  }

  // Render step content
  const renderStepContent = () => {
    switch (step) {
      case 1:
        return (
          <VStack spacing={4} align="stretch">
            <Heading size="md" mb={2}>Personal Information</Heading>
            <Text color="gray.600" mb={4}>
              Let's start with your basic information.
            </Text>
            
            <FormControl isRequired isInvalid={!!errors.first_name}>
              <FormLabel>First Name</FormLabel>
              <Input
                name="first_name"
                value={formData.first_name}
                onChange={handleChange}
                placeholder="Enter your first name"
              />
              {errors.first_name && <FormErrorMessage>{errors.first_name}</FormErrorMessage>}
            </FormControl>
            
            <FormControl isRequired isInvalid={!!errors.last_name}>
              <FormLabel>Last Name</FormLabel>
              <Input
                name="last_name"
                value={formData.last_name}
                onChange={handleChange}
                placeholder="Enter your last name"
              />
              {errors.last_name && <FormErrorMessage>{errors.last_name}</FormErrorMessage>}
            </FormControl>
            
            <FormControl isRequired isInvalid={!!errors.phone_number}>
              <FormLabel>Phone Number</FormLabel>
              <Input
                name="phone_number"
                value={formData.phone_number}
                onChange={handleChange}
                placeholder="Enter your phone number"
              />
              {errors.phone_number && <FormErrorMessage>{errors.phone_number}</FormErrorMessage>}
            </FormControl>
            
            {MAPBOX_ACCESS_TOKEN ? (
              <MapboxAddressInput
                label="Address"
                value={formData.address}
                onChange={handleAddressChange}
                placeholder="Enter your address"
                isRequired={true}
                error={errors.address}
                mapboxAccessToken={MAPBOX_ACCESS_TOKEN}
              />
            ) : (
              <FormControl isRequired isInvalid={!!errors.address}>
                <FormLabel>Address</FormLabel>
                <Textarea
                  name="address"
                  value={formData.address}
                  onChange={handleChange}
                  placeholder="Enter your address"
                />
                {errors.address && <FormErrorMessage>{errors.address}</FormErrorMessage>}
              </FormControl>
            )}
            
            <FormControl>
              <FormLabel>Blood Type (if known)</FormLabel>
              <Select
                name="blood_type"
                value={formData.blood_type}
                onChange={handleChange}
                placeholder="Select blood type"
              >
                {BLOOD_TYPES.map(type => (
                  <option key={type} value={type}>{type}</option>
                ))}
              </Select>
            </FormControl>
          </VStack>
        );
      
      case 2:
        return (
          <VStack spacing={4} align="stretch">
            <Heading size="md" mb={2}>Medical Information</Heading>
            <Text color="gray.600" mb={4}>
              Please provide some medical information to help us better serve you.
            </Text>
            
            <FormControl isRequired isInvalid={!!errors.emergency_contact_name}>
              <FormLabel>Emergency Contact Name</FormLabel>
              <Input
                name="emergency_contact_name"
                value={formData.emergency_contact_name}
                onChange={handleChange}
                placeholder="Enter emergency contact name"
              />
              {errors.emergency_contact_name && <FormErrorMessage>{errors.emergency_contact_name}</FormErrorMessage>}
            </FormControl>
            
            <FormControl isRequired isInvalid={!!errors.emergency_contact_phone}>
              <FormLabel>Emergency Contact Phone</FormLabel>
              <Input
                name="emergency_contact_phone"
                value={formData.emergency_contact_phone}
                onChange={handleChange}
                placeholder="Enter emergency contact phone"
              />
              {errors.emergency_contact_phone && <FormErrorMessage>{errors.emergency_contact_phone}</FormErrorMessage>}
            </FormControl>
            
            <FormControl>
              <FormLabel>Medical Conditions</FormLabel>
              <Textarea
                name="medical_conditions"
                value={formData.medical_conditions}
                onChange={handleChange}
                placeholder="List any medical conditions"
              />
            </FormControl>
            
            <FormControl>
              <FormLabel>Allergies</FormLabel>
              <Textarea
                name="allergies"
                value={formData.allergies}
                onChange={handleChange}
                placeholder="List any allergies"
              />
            </FormControl>
            
            <FormControl>
              <FormLabel>Medications</FormLabel>
              <Textarea
                name="medications"
                value={formData.medications}
                onChange={handleChange}
                placeholder="List any medications you are currently taking"
              />
            </FormControl>
            
            <FormControl>
              <FormLabel>Donation Frequency</FormLabel>
              <Select
                name="donation_frequency"
                value={formData.donation_frequency}
                onChange={handleChange}
              >
                {DONATION_FREQUENCIES.map(option => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </Select>
            </FormControl>
          </VStack>
        );
      
      case 3:
        return (
          <VStack spacing={4} align="stretch">
            <Heading size="md" mb={2}>Review Your Information</Heading>
            <Text color="gray.600" mb={4}>
              Please review your information before submitting.
            </Text>
            
            <Box p={4} borderWidth="1px" borderRadius="md" bg="gray.50">
              <VStack align="stretch" spacing={3}>
                <Flex justify="space-between">
                  <Text fontWeight="bold">Name:</Text>
                  <Text>{formData.first_name} {formData.last_name}</Text>
                </Flex>
                <Flex justify="space-between">
                  <Text fontWeight="bold">Phone:</Text>
                  <Text>{formData.phone_number}</Text>
                </Flex>
                <Flex justify="space-between">
                  <Text fontWeight="bold">Address:</Text>
                  <Text>{formData.address}</Text>
                </Flex>
                {formData.latitude && formData.longitude && (
                  <Flex justify="space-between">
                    <Text fontWeight="bold">Coordinates:</Text>
                    <Text>{formData.latitude}, {formData.longitude}</Text>
                  </Flex>
                )}
                <Flex justify="space-between">
                  <Text fontWeight="bold">Blood Type:</Text>
                  <Text>{formData.blood_type || 'Unknown'}</Text>
                </Flex>
                <Flex justify="space-between">
                  <Text fontWeight="bold">Emergency Contact:</Text>
                  <Text>{formData.emergency_contact_name} ({formData.emergency_contact_phone})</Text>
                </Flex>
                <Flex justify="space-between">
                  <Text fontWeight="bold">Donation Frequency:</Text>
                  <Text>
                    {DONATION_FREQUENCIES.find(df => df.value === formData.donation_frequency)?.label || formData.donation_frequency}
                  </Text>
                </Flex>
              </VStack>
            </Box>
          </VStack>
        );
      
      default:
        return null;
    }
  };

  // Helper function to render the main content
  const renderContent = () => {
    return (
      <Box
        bg={bgColor}
        p={8}
        borderRadius="lg"
        boxShadow="md"
        border="1px solid"
        borderColor={borderColor}
      >
        <VStack spacing={6} align="stretch">
          <Heading as="h1" size="xl" textAlign="center" mb={2}>
            Complete Your Profile
          </Heading>
          <Text textAlign="center" color="gray.600" mb={4}>
            Please provide some additional information to complete your registration.
          </Text>
          
          {/* Progress indicator */}
          <Box mb={6}>
            <Progress value={(step / 3) * 100} size="sm" colorScheme="red" borderRadius="full" />
            <Flex justify="space-between" mt={2}>
              <Text fontWeight={step === 1 ? "bold" : "normal"} color={step === 1 ? "red.500" : "gray.500"}>
                Personal Info
              </Text>
              <Text fontWeight={step === 2 ? "bold" : "normal"} color={step === 2 ? "red.500" : "gray.500"}>
                Medical Info
              </Text>
              <Text fontWeight={step === 3 ? "bold" : "normal"} color={step === 3 ? "red.500" : "gray.500"}>
                Review
              </Text>
            </Flex>
          </Box>
          
          {/* Form steps */}
          {renderStepContent()}
          
          {/* Error message */}
          {submitError && (
            <Alert status="error" borderRadius="md">
              <AlertIcon />
              <AlertTitle mr={2}>Error!</AlertTitle>
              <AlertDescription>{submitError}</AlertDescription>
            </Alert>
          )}
          
          {/* Navigation buttons */}
          <Flex justify="space-between" mt={6}>
            {step > 1 ? (
              <Button onClick={handlePrevious} variant="outline">
                Previous
              </Button>
            ) : (
              <Box></Box>
            )}
            
            {step < 3 ? (
              <Button onClick={handleNext} colorScheme="red">
                Next
              </Button>
            ) : (
              <Button 
                onClick={handleSubmit} 
                colorScheme="red" 
                isLoading={isSubmitting}
                loadingText="Submitting"
                isDisabled={isSubmitting}
              >
                Complete Registration
              </Button>
            )}
          </Flex>
        </VStack>
      </Box>
    );
  };

  // Wrap the component with MapboxProvider if access token is available
  return (
    <Container maxW="container.md" py={8}>
      {MAPBOX_ACCESS_TOKEN ? (
        <MapboxProvider accessToken={MAPBOX_ACCESS_TOKEN}>
          {renderContent()}
        </MapboxProvider>
      ) : (
        renderContent()
      )}
    </Container>
  );
};

export default OnboardingPage; 