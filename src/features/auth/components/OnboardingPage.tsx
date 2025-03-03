import React, { useState } from 'react';
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
} from '@chakra-ui/react';
import { useAuthContext } from '../context/AuthContext';

// Blood type options
const BLOOD_TYPES = ['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-', 'Unknown'];

// Donation frequency options
const DONATION_FREQUENCIES = [
  { value: 'first_time', label: 'First Time Donor' },
  { value: 'occasional', label: 'Occasional Donor (1-2 times per year)' },
  { value: 'regular', label: 'Regular Donor (3-4 times per year)' },
  { value: 'frequent', label: 'Frequent Donor (5+ times per year)' },
];

const OnboardingPage: React.FC = () => {
  const { user, completeOnboarding, isLoading } = useAuthContext();
  const navigate = useNavigate();
  const toast = useToast();
  const bgColor = useColorModeValue('white', 'gray.800');
  const borderColor = useColorModeValue('gray.200', 'gray.700');

  // State for multi-step form
  const [step, setStep] = useState(1);
  const [formData, setFormData] = useState({
    first_name: user?.first_name || '',
    last_name: user?.last_name || '',
    phone_number: user?.phone_number || '',
    address: user?.address || '',
    blood_type: user?.blood_type || '',
    emergency_contact_name: '',
    emergency_contact_phone: '',
    medical_conditions: '',
    allergies: '',
    medications: '',
    donation_frequency: 'occasional',
  });
  const [errors, setErrors] = useState<Record<string, string>>({});

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

  // Validate current step
  const validateStep = () => {
    const newErrors: Record<string, string> = {};
    
    if (step === 1) {
      if (!formData.first_name) newErrors.first_name = 'First name is required';
      if (!formData.last_name) newErrors.last_name = 'Last name is required';
      if (!formData.phone_number) newErrors.phone_number = 'Phone number is required';
    }
    
    if (step === 2) {
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
  const handleSubmit = async () => {
    if (!validateStep()) return;
    
    try {
      await completeOnboarding(formData);
      
      toast({
        title: 'Profile completed',
        description: 'Your profile has been successfully set up.',
        status: 'success',
        duration: 5000,
        isClosable: true,
      });
      
      // Navigate to dashboard
      navigate('/dashboard');
    } catch (error) {
      console.error('Onboarding error:', error);
      toast({
        title: 'Error',
        description: 'Failed to complete your profile. Please try again.',
        status: 'error',
        duration: 5000,
        isClosable: true,
      });
    }
  };

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
            
            <FormControl>
              <FormLabel>Address</FormLabel>
              <Textarea
                name="address"
                value={formData.address}
                onChange={handleChange}
                placeholder="Enter your address"
              />
            </FormControl>
            
            <FormControl>
              <FormLabel>Blood Type (if known)</FormLabel>
              <Select
                name="blood_type"
                value={formData.blood_type}
                onChange={handleChange}
                placeholder="Select your blood type"
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
            <Heading size="md" mb={2}>Emergency Contact</Heading>
            <Text color="gray.600" mb={4}>
              Please provide emergency contact information.
            </Text>
            
            <FormControl isRequired isInvalid={!!errors.emergency_contact_name}>
              <FormLabel>Emergency Contact Name</FormLabel>
              <Input
                name="emergency_contact_name"
                value={formData.emergency_contact_name}
                onChange={handleChange}
                placeholder="Enter emergency contact name"
              />
              {errors.emergency_contact_name && (
                <FormErrorMessage>{errors.emergency_contact_name}</FormErrorMessage>
              )}
            </FormControl>
            
            <FormControl isRequired isInvalid={!!errors.emergency_contact_phone}>
              <FormLabel>Emergency Contact Phone</FormLabel>
              <Input
                name="emergency_contact_phone"
                value={formData.emergency_contact_phone}
                onChange={handleChange}
                placeholder="Enter emergency contact phone"
              />
              {errors.emergency_contact_phone && (
                <FormErrorMessage>{errors.emergency_contact_phone}</FormErrorMessage>
              )}
            </FormControl>
          </VStack>
        );
        
      case 3:
        return (
          <VStack spacing={4} align="stretch">
            <Heading size="md" mb={2}>Medical Information</Heading>
            <Text color="gray.600" mb={4}>
              This information helps us ensure your safety during blood donation.
            </Text>
            
            <FormControl>
              <FormLabel>Medical Conditions (if any)</FormLabel>
              <Textarea
                name="medical_conditions"
                value={formData.medical_conditions}
                onChange={handleChange}
                placeholder="List any medical conditions"
              />
            </FormControl>
            
            <FormControl>
              <FormLabel>Allergies (if any)</FormLabel>
              <Textarea
                name="allergies"
                value={formData.allergies}
                onChange={handleChange}
                placeholder="List any allergies"
              />
            </FormControl>
            
            <FormControl>
              <FormLabel>Medications (if any)</FormLabel>
              <Textarea
                name="medications"
                value={formData.medications}
                onChange={handleChange}
                placeholder="List any medications you're currently taking"
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
                  <option key={option.value} value={option.value}>{option.label}</option>
                ))}
              </Select>
            </FormControl>
          </VStack>
        );
        
      default:
        return null;
    }
  };

  return (
    <Container maxW="container.md" py={8}>
      <Box
        bg={bgColor}
        borderRadius="lg"
        borderWidth="1px"
        borderColor={borderColor}
        p={6}
        boxShadow="md"
      >
        <VStack spacing={6} align="stretch">
          <Heading textAlign="center" size="lg" color="red.600">
            Complete Your Profile
          </Heading>
          
          <Text textAlign="center" color="gray.600">
            Please complete your profile to continue. This information helps us provide you with the best experience.
          </Text>
          
          {/* Progress indicator */}
          <Box>
            <Flex justify="space-between" mb={2}>
              <Text fontWeight={step === 1 ? 'bold' : 'normal'} color={step === 1 ? 'red.500' : 'gray.500'}>
                Personal Info
              </Text>
              <Text fontWeight={step === 2 ? 'bold' : 'normal'} color={step === 2 ? 'red.500' : 'gray.500'}>
                Emergency Contact
              </Text>
              <Text fontWeight={step === 3 ? 'bold' : 'normal'} color={step === 3 ? 'red.500' : 'gray.500'}>
                Medical Info
              </Text>
            </Flex>
            <Progress value={(step / 3) * 100} size="sm" colorScheme="red" borderRadius="full" />
          </Box>
          
          {/* Form content */}
          <Box py={4}>
            {renderStepContent()}
          </Box>
          
          {/* Navigation buttons */}
          <Flex justify="space-between" mt={4}>
            <Button
              variant="outline"
              colorScheme="red"
              onClick={handlePrevious}
              isDisabled={step === 1}
            >
              Previous
            </Button>
            
            {step < 3 ? (
              <Button colorScheme="red" onClick={handleNext}>
                Next
              </Button>
            ) : (
              <Button
                colorScheme="red"
                onClick={handleSubmit}
                isLoading={isLoading}
                loadingText="Saving"
              >
                Complete Profile
              </Button>
            )}
          </Flex>
        </VStack>
      </Box>
    </Container>
  );
};

export default OnboardingPage; 