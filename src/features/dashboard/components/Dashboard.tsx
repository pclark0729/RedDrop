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
} from '@chakra-ui/react';
import { FaCalendarAlt, FaHeart, FaMapMarkerAlt, FaUserFriends } from 'react-icons/fa';
import { useAuthContext } from '../../auth/context/AuthContext';
import { getUserDonations, getUserAppointments, getUpcomingBloodDrives } from '../../../lib/supabase';
import { DonationWithBloodDrive, AppointmentWithBloodDrive, BloodDrive } from '../../../lib/database.types';

const Dashboard: React.FC = () => {
  const { user } = useAuthContext();
  const [donations, setDonations] = useState<DonationWithBloodDrive[]>([]);
  const [appointments, setAppointments] = useState<AppointmentWithBloodDrive[]>([]);
  const [bloodDrives, setBloodDrives] = useState<BloodDrive[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  const cardBg = useColorModeValue('white', 'gray.800');
  const borderColor = useColorModeValue('gray.200', 'gray.700');
  const statBg = useColorModeValue('red.50', 'red.900');
  
  useEffect(() => {
    const fetchData = async () => {
      try {
        setIsLoading(true);
        setError(null);
        
        if (user) {
          // Fetch user's donation history
          const donationsData = await getUserDonations(user.id);
          setDonations(donationsData as DonationWithBloodDrive[]);
          
          // Fetch user's upcoming appointments
          const appointmentsData = await getUserAppointments(user.id);
          setAppointments(appointmentsData as AppointmentWithBloodDrive[]);
          
          // Fetch upcoming blood drives
          const drivesData = await getUpcomingBloodDrives(5);
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
  
  if (isLoading) {
    return (
      <Container maxW="container.xl" py={8}>
        <Flex justify="center" align="center" minH="60vh">
          <VStack spacing={4}>
            <Spinner size="xl" color="red.500" thickness="4px" />
            <Text>Loading your dashboard...</Text>
          </VStack>
        </Flex>
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