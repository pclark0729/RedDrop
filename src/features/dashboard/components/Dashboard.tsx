import React, { useEffect, useState } from 'react';
import {
  Box,
  Container,
  Heading,
  Text,
  SimpleGrid,
  Stat,
  StatLabel,
  StatNumber,
  StatHelpText,
  Card,
  CardBody,
  Stack,
  Divider,
  Button,
  Flex,
  Badge,
  VStack,
  HStack,
  Icon,
  Spinner,
  useColorModeValue,
  Alert,
  AlertIcon,
  Avatar,
  Center,
} from '@chakra-ui/react';
import { FaCalendarAlt, FaHeart, FaMapMarkerAlt, FaUserFriends } from 'react-icons/fa';
import { useAuthContext } from '../../auth/context/AuthContext';
import supabase from '../../../app/supabase';
import { DonationWithBloodDrive, AppointmentWithBloodDrive, BloodDrive } from '../../../lib/database.types';
import { useNavigate } from 'react-router-dom';

// Safe storage utility
const safeStorage = {
  getItem: (key: string): string | null => {
    try {
      if (typeof window !== 'undefined' && window.sessionStorage) {
        return window.sessionStorage.getItem(key);
      }
    } catch (error) {
      console.warn(`Failed to get sessionStorage item "${key}":`, error);
    }
    return null;
  },
  removeItem: (key: string): void => {
    try {
      if (typeof window !== 'undefined' && window.sessionStorage) {
        window.sessionStorage.removeItem(key);
      }
    } catch (error) {
      console.warn(`Failed to remove sessionStorage item "${key}":`, error);
    }
  }
};

const Dashboard: React.FC = () => {
  const { user, isLoading: authLoading, isOnboarding } = useAuthContext();
  const navigate = useNavigate();
  const [donations, setDonations] = useState<DonationWithBloodDrive[]>([]);
  const [appointments, setAppointments] = useState<AppointmentWithBloodDrive[]>([]);
  const [bloodDrives, setBloodDrives] = useState<BloodDrive[]>([]);
  const [checkingProfile, setCheckingProfile] = useState(true);
  const [profileError, setProfileError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  const cardBg = useColorModeValue('white', 'gray.800');
  const borderColor = useColorModeValue('gray.200', 'gray.700');
  const statBg = useColorModeValue('red.50', 'red.900');
  
  useEffect(() => {
    const checkOnboardingStatus = () => {
      // If profile fetch is still pending, wait a bit
      const profileFetchPending = safeStorage.getItem('profile_fetch_pending') === 'true';
      const profileFetchError = safeStorage.getItem('profile_fetch_error');
      const hasRlsError = safeStorage.getItem('rls_policy_error') === 'true';
      const rlsErrorDetails = safeStorage.getItem('rls_error_details');
      
      if (profileFetchPending) {
        console.log('Dashboard: Profile fetch is still pending, waiting...');
        // Check again in 1 second
        setTimeout(checkOnboardingStatus, 1000);
        return;
      }
      
      setCheckingProfile(false);
      
      // Check if there was an RLS error
      if (hasRlsError && rlsErrorDetails) {
        try {
          const errorInfo = JSON.parse(rlsErrorDetails);
          console.error('Dashboard: RLS Policy Error:', errorInfo);
          setProfileError(`${errorInfo.title}: ${errorInfo.message}\n\nTechnical details: ${errorInfo.technical} (Code: ${errorInfo.code})`);
          return;
        } catch (e) {
          console.error('Error parsing RLS error details:', e);
        }
      }
      
      // Check if there was an error fetching the profile
      if (profileFetchError) {
        console.error('Dashboard: Error fetching profile:', profileFetchError);
        try {
          const errorObj = JSON.parse(profileFetchError);
          setProfileError(`Error fetching profile: ${errorObj.message || profileFetchError}`);
        } catch (e) {
          setProfileError(`Error fetching profile: ${profileFetchError}`);
        }
        // Clear the error so we don't keep showing it
        safeStorage.removeItem('profile_fetch_error');
        return;
      }
      
      // Check if user needs onboarding
      const needsOnboarding = safeStorage.getItem('needs_onboarding') === 'true';
      
      console.log('Dashboard: Checking if user needs onboarding:', { 
        needsOnboarding, 
        isOnboarding, 
        hasRlsError,
        user: user ? { id: user.id, email: user.email } : 'No user'
      });
      
      if (needsOnboarding || isOnboarding) {
        console.log('Dashboard: User needs onboarding, redirecting...');
        navigate('/onboarding');
      }
    };
    
    // Start checking after a short delay to allow auth context to update
    const timer = setTimeout(checkOnboardingStatus, 500);
    return () => clearTimeout(timer);
  }, [navigate, isOnboarding, user]);
  
  useEffect(() => {
    const fetchData = async () => {
      try {
        if (checkingProfile) {
          // Don't fetch data until we've confirmed the profile status
          return;
        }
        
        if (user) {
          // Fetch user's donation history
          const { data: donationsData, error: donationsError } = await supabase
            .from('donations')
            .select(`
              *,
              blood_drive:blood_drive_id (name, location)
            `)
            .eq('donor_id', user.id)
            .order('donation_date', { ascending: false });
            
          if (donationsError) {
            console.error('Error fetching user donations:', donationsError);
            throw donationsError;
          }
          setDonations(donationsData as DonationWithBloodDrive[]);
          
          // Fetch user's upcoming appointments
          const { data: appointmentsData, error: appointmentsError } = await supabase
            .from('donation_appointments')
            .select(`
              *,
              blood_drive:blood_drive_id (name, location, drive_date)
            `)
            .eq('donor_id', user.id)
            .gte('appointment_date', new Date().toISOString())
            .order('appointment_date', { ascending: true });
            
          if (appointmentsError) {
            console.error('Error fetching user appointments:', appointmentsError);
            throw appointmentsError;
          }
          setAppointments(appointmentsData as AppointmentWithBloodDrive[]);
          
          // Fetch upcoming blood drives
          const { data: drivesData, error: drivesError } = await supabase
            .from('blood_drives')
            .select('*')
            .gte('drive_date', new Date().toISOString())
            .order('drive_date', { ascending: true })
            .limit(5);
            
          if (drivesError) {
            console.error('Error fetching upcoming blood drives:', drivesError);
            throw drivesError;
          }
          setBloodDrives(drivesData);
        }
      } catch (err) {
        console.error('Error fetching dashboard data:', err);
        setError('Failed to load dashboard data. Please try again later.');
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchData();
  }, [user]);
  
  // Format date for display
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };
  
  // Calculate total donations
  const totalDonations = donations.length;
  
  // Calculate total blood volume donated (in ml)
  const totalVolume = donations.reduce((sum, donation) => sum + (donation.amount_ml || 0), 0);
  
  // Get the most recent donation date
  const lastDonationDate = donations.length > 0 
    ? formatDate(donations[0].donation_date)
    : 'No donations yet';
  
  // Get the next appointment date
  const nextAppointmentDate = appointments.length > 0
    ? formatDate(appointments[0].appointment_date)
    : 'No upcoming appointments';
  
  if (authLoading || isLoading || checkingProfile) {
    return (
      <Container maxW="container.xl" py={8}>
        <Flex justify="center" align="center" minH="60vh">
          <VStack spacing={4}>
            <Spinner size="xl" color="red.500" thickness="4px" />
            <Text>Loading your dashboard...</Text>
            {checkingProfile && (
              <Text fontSize="sm" color="gray.500">Verifying profile information...</Text>
            )}
          </VStack>
        </Flex>
      </Container>
    );
  }
  
  if (profileError) {
    const isRlsError = profileError.includes('infinite recursion detected in policy');
    
    return (
      <Container maxW="container.xl" py={8}>
        <Alert 
          status="error" 
          mb={6} 
          borderRadius="md" 
          flexDirection="column" 
          alignItems="flex-start"
        >
          <Flex w="100%" mb={2}>
            <AlertIcon />
            <Box flex="1">
              <Text fontWeight="bold">Error loading your profile</Text>
              <Text whiteSpace="pre-wrap">{profileError}</Text>
            </Box>
          </Flex>
          
          {isRlsError && (
            <Box mt={4} p={4} bg="gray.50" borderRadius="md" w="100%">
              <Text fontWeight="bold" mb={2}>For Administrators:</Text>
              <Text mb={2}>This error is caused by an infinite recursion in the Row Level Security (RLS) policy for the profiles table.</Text>
              <Text mb={2}>To fix this issue:</Text>
              <VStack align="start" pl={4} spacing={1}>
                <Text>1. Go to your Supabase dashboard</Text>
                <Text>2. Open the SQL Editor</Text>
                <Text>3. Run the SQL script from the "fix_rls_policy.sql" file</Text>
                <Text>4. The script will fix the RLS policies to prevent recursion</Text>
              </VStack>
            </Box>
          )}
        </Alert>
        
        <Center>
          <HStack spacing={4}>
            <Button 
              colorScheme="red" 
              onClick={() => {
                // Clear error state
                setProfileError(null);
                // Clear session storage
                safeStorage.removeItem('profile_fetch_error');
                safeStorage.removeItem('rls_error_details');
                // Reload the page to retry
                window.location.reload();
              }}
            >
              Retry
            </Button>
            
            <Button 
              variant="outline" 
              colorScheme="blue" 
              onClick={() => navigate('/onboarding')}
            >
              Go to Onboarding
            </Button>
          </HStack>
        </Center>
      </Container>
    );
  }
  
  return (
    <Container maxW="container.xl" py={8}>
      {error && (
        <Alert status="error" mb={6} borderRadius="md">
          <AlertIcon />
          {error}
        </Alert>
      )}
      
      <Box mb={8}>
        <Flex align="center" mb={4}>
          <Avatar 
            size="lg" 
            name={`${user?.first_name || ''} ${user?.last_name || ''}`}
            bg="red.500"
            color="white"
            mr={4}
          />
          <Box>
            <Heading size="lg">
              Welcome, {user?.first_name || user?.email.split('@')[0]}!
            </Heading>
            <Text color="gray.500">
              {user?.blood_type ? `Blood Type: ${user.blood_type}` : 'Complete your profile to add your blood type'}
            </Text>
          </Box>
        </Flex>
      </Box>
      
      {/* Stats Overview */}
      <SimpleGrid columns={{ base: 1, md: 2, lg: 4 }} spacing={6} mb={8}>
        <Card bg={cardBg} borderColor={borderColor} borderWidth="1px" boxShadow="sm">
          <CardBody>
            <Stat>
              <StatLabel>Total Donations</StatLabel>
              <StatNumber>{totalDonations}</StatNumber>
              <StatHelpText>Lifetime donations</StatHelpText>
            </Stat>
          </CardBody>
        </Card>
        
        <Card bg={cardBg} borderColor={borderColor} borderWidth="1px" boxShadow="sm">
          <CardBody>
            <Stat>
              <StatLabel>Blood Volume</StatLabel>
              <StatNumber>{totalVolume} ml</StatNumber>
              <StatHelpText>Total donated</StatHelpText>
            </Stat>
          </CardBody>
        </Card>
        
        <Card bg={cardBg} borderColor={borderColor} borderWidth="1px" boxShadow="sm">
          <CardBody>
            <Stat>
              <StatLabel>Last Donation</StatLabel>
              <StatNumber fontSize="lg">{lastDonationDate}</StatNumber>
              <StatHelpText>Most recent</StatHelpText>
            </Stat>
          </CardBody>
        </Card>
        
        <Card bg={cardBg} borderColor={borderColor} borderWidth="1px" boxShadow="sm">
          <CardBody>
            <Stat>
              <StatLabel>Next Appointment</StatLabel>
              <StatNumber fontSize="lg">{nextAppointmentDate}</StatNumber>
              <StatHelpText>Upcoming</StatHelpText>
            </Stat>
          </CardBody>
        </Card>
      </SimpleGrid>
      
      {/* Main Dashboard Content */}
      <SimpleGrid columns={{ base: 1, lg: 2 }} spacing={8}>
        {/* Donation History */}
        <Card bg={cardBg} borderColor={borderColor} borderWidth="1px" boxShadow="sm">
          <CardBody>
            <Heading size="md" mb={4}>
              <Flex align="center">
                <Icon as={FaHeart} color="red.500" mr={2} />
                Donation History
              </Flex>
            </Heading>
            
            <Divider mb={4} />
            
            {donations.length === 0 ? (
              <Box py={4} textAlign="center">
                <Text color="gray.500" mb={4}>You haven't made any donations yet.</Text>
                <Button colorScheme="red" size="sm">Schedule Your First Donation</Button>
              </Box>
            ) : (
              <VStack spacing={4} align="stretch">
                {donations.slice(0, 5).map((donation) => (
                  <Card key={donation.id} variant="outline" size="sm">
                    <CardBody>
                      <Flex justify="space-between" align="center">
                        <Box>
                          <Text fontWeight="bold">
                            {donation.blood_drive?.name || 'Independent Donation'}
                          </Text>
                          <HStack spacing={2} mt={1}>
                            <Icon as={FaCalendarAlt} color="gray.500" />
                            <Text fontSize="sm" color="gray.500">
                              {formatDate(donation.donation_date)}
                            </Text>
                            
                            {donation.blood_drive?.location && (
                              <>
                                <Icon as={FaMapMarkerAlt} color="gray.500" ml={2} />
                                <Text fontSize="sm" color="gray.500">
                                  {donation.blood_drive.location}
                                </Text>
                              </>
                            )}
                          </HStack>
                        </Box>
                        <Badge colorScheme={donation.status === 'completed' ? 'green' : 'yellow'}>
                          {donation.status}
                        </Badge>
                      </Flex>
                    </CardBody>
                  </Card>
                ))}
                
                {donations.length > 5 && (
                  <Button variant="link" colorScheme="red" alignSelf="center">
                    View All Donations
                  </Button>
                )}
              </VStack>
            )}
          </CardBody>
        </Card>
        
        {/* Upcoming Blood Drives */}
        <Card bg={cardBg} borderColor={borderColor} borderWidth="1px" boxShadow="sm">
          <CardBody>
            <Heading size="md" mb={4}>
              <Flex align="center">
                <Icon as={FaCalendarAlt} color="red.500" mr={2} />
                Upcoming Blood Drives
              </Flex>
            </Heading>
            
            <Divider mb={4} />
            
            {bloodDrives.length === 0 ? (
              <Box py={4} textAlign="center">
                <Text color="gray.500">No upcoming blood drives at this time.</Text>
              </Box>
            ) : (
              <VStack spacing={4} align="stretch">
                {bloodDrives.map((drive) => (
                  <Card key={drive.id} variant="outline" size="sm">
                    <CardBody>
                      <Flex justify="space-between" align="flex-start">
                        <Box>
                          <Text fontWeight="bold">{drive.name}</Text>
                          <HStack spacing={2} mt={1}>
                            <Icon as={FaCalendarAlt} color="gray.500" />
                            <Text fontSize="sm" color="gray.500">
                              {formatDate(drive.drive_date)}
                            </Text>
                          </HStack>
                          <HStack spacing={2} mt={1}>
                            <Icon as={FaMapMarkerAlt} color="gray.500" />
                            <Text fontSize="sm" color="gray.500">
                              {drive.location}
                            </Text>
                          </HStack>
                        </Box>
                        <VStack align="flex-end">
                          <Badge colorScheme={drive.urgency_level === 'high' ? 'red' : 'blue'}>
                            {drive.urgency_level === 'high' ? 'Urgent' : 'Regular'}
                          </Badge>
                          <Text fontSize="sm" fontWeight="bold" mt={1}>
                            {drive.slots_available} slots available
                          </Text>
                        </VStack>
                      </Flex>
                      <Button 
                        colorScheme="red" 
                        size="sm" 
                        mt={3} 
                        width="full"
                        variant="outline"
                      >
                        Schedule Appointment
                      </Button>
                    </CardBody>
                  </Card>
                ))}
              </VStack>
            )}
          </CardBody>
        </Card>
      </SimpleGrid>
    </Container>
  );
};

export default Dashboard; 