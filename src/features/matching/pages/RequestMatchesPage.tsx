import React, { useState, useEffect } from 'react';
import {
  Box,
  Container,
  Heading,
  Text,
  VStack,
  HStack,
  Button,
  Tabs,
  TabList,
  TabPanels,
  Tab,
  TabPanel,
  Badge,
  Flex,
  Spinner,
  Center,
  Alert,
  AlertIcon,
  AlertTitle,
  AlertDescription,
  SimpleGrid,
  Card,
  CardHeader,
  CardBody,
  CardFooter,
  Divider,
  Icon,
  useDisclosure,
  Drawer,
  DrawerBody,
  DrawerHeader,
  DrawerOverlay,
  DrawerContent,
  DrawerCloseButton,
  Select,
  FormControl,
  FormLabel
} from '@chakra-ui/react';
import { 
  FaUserCheck, 
  FaUserTimes, 
  FaUserClock, 
  FaCheckCircle, 
  FaTimesCircle, 
  FaHospital, 
  FaTint, 
  FaCalendarAlt,
  FaMapMarkerAlt,
  FaSearch
} from 'react-icons/fa';
import { format } from 'date-fns';
import { useParams, useNavigate } from 'react-router-dom';
import { useMatching } from '../hooks/useMatching';
import { DonorMatch, MatchStatus } from '../types';
import { useBloodRequest } from '../../bloodRequest/hooks/useBloodRequest';
import { BloodRequest } from '../../bloodRequest/types';

export const RequestMatchesPage: React.FC = () => {
  const { requestId } = useParams<{ requestId: string }>();
  const navigate = useNavigate();
  const { 
    matches, 
    loading, 
    error, 
    getMatchesByRequestId 
  } = useMatching();
  const { getBloodRequestById } = useBloodRequest();
  
  const [request, setRequest] = useState<BloodRequest | null>(null);
  const [statusFilter, setStatusFilter] = useState<MatchStatus | 'ALL'>('ALL');
  const [filteredMatches, setFilteredMatches] = useState<DonorMatch[]>([]);
  
  useEffect(() => {
    if (requestId) {
      loadData();
    }
  }, [requestId]);
  
  useEffect(() => {
    if (matches.length > 0) {
      filterMatches();
    }
  }, [matches, statusFilter]);
  
  const loadData = async () => {
    if (requestId) {
      await getMatchesByRequestId(requestId);
      const requestData = await getBloodRequestById(requestId);
      if (requestData) {
        setRequest(requestData);
      }
    }
  };
  
  const filterMatches = () => {
    if (statusFilter === 'ALL') {
      setFilteredMatches(matches);
    } else {
      setFilteredMatches(matches.filter(match => match.status === statusFilter));
    }
  };
  
  const handleStatusFilterChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setStatusFilter(e.target.value as MatchStatus | 'ALL');
  };
  
  const getStatusIcon = (status: MatchStatus) => {
    switch (status) {
      case MatchStatus.PENDING:
        return <Icon as={FaUserClock} color="yellow.500" boxSize={5} />;
      case MatchStatus.ACCEPTED:
        return <Icon as={FaUserCheck} color="green.500" boxSize={5} />;
      case MatchStatus.DECLINED:
        return <Icon as={FaUserTimes} color="red.500" boxSize={5} />;
      case MatchStatus.COMPLETED:
        return <Icon as={FaCheckCircle} color="blue.500" boxSize={5} />;
      case MatchStatus.CANCELLED:
        return <Icon as={FaTimesCircle} color="gray.500" boxSize={5} />;
      default:
        return null;
    }
  };
  
  const getStatusBadge = (status: MatchStatus) => {
    switch (status) {
      case MatchStatus.PENDING:
        return <Badge colorScheme="yellow">Pending</Badge>;
      case MatchStatus.ACCEPTED:
        return <Badge colorScheme="green">Accepted</Badge>;
      case MatchStatus.DECLINED:
        return <Badge colorScheme="red">Declined</Badge>;
      case MatchStatus.COMPLETED:
        return <Badge colorScheme="blue">Completed</Badge>;
      case MatchStatus.CANCELLED:
        return <Badge colorScheme="gray">Cancelled</Badge>;
      default:
        return <Badge>Unknown</Badge>;
    }
  };
  
  const renderMatchCard = (match: DonorMatch) => {
    return (
      <Card key={match.id} borderRadius="lg" boxShadow="md" overflow="hidden">
        <CardHeader bg="gray.50" pb={3}>
          <HStack justifyContent="space-between">
            <HStack>
              {getStatusIcon(match.status)}
              <Heading size="md">
                {match.donor_name || 'Anonymous Donor'}
              </Heading>
            </HStack>
            {getStatusBadge(match.status)}
          </HStack>
        </CardHeader>
        
        <CardBody>
          <VStack align="stretch" spacing={3}>
            <HStack>
              <Icon as={FaTint} color="red.500" />
              <Text fontWeight="medium">Blood Type: {match.donor_blood_type}</Text>
            </HStack>
            
            {match.response_time && match.status !== MatchStatus.PENDING && (
              <HStack>
                <Icon as={FaCalendarAlt} color="blue.500" />
                <Text>
                  Responded on {format(new Date(match.response_time), 'MMM dd, yyyy')}
                </Text>
              </HStack>
            )}
            
            {match.donation_time && match.status === MatchStatus.COMPLETED && (
              <HStack>
                <Icon as={FaCalendarAlt} color="green.500" />
                <Text>
                  Donated on {format(new Date(match.donation_time), 'MMM dd, yyyy')}
                </Text>
              </HStack>
            )}
            
            {match.notes && (
              <Box mt={2} p={3} bg="gray.50" borderRadius="md">
                <Text fontSize="sm" fontStyle="italic">
                  {match.notes}
                </Text>
              </Box>
            )}
          </VStack>
        </CardBody>
        
        {(match.donor_phone || match.donor_email) && match.status === MatchStatus.ACCEPTED && (
          <>
            <Divider />
            <CardFooter pt={3}>
              <VStack align="stretch" width="100%" spacing={2}>
                <Heading size="xs" color="gray.600">Contact Information</Heading>
                {match.donor_phone && (
                  <Text fontSize="sm">
                    Phone: {match.donor_phone}
                  </Text>
                )}
                {match.donor_email && (
                  <Text fontSize="sm">
                    Email: {match.donor_email}
                  </Text>
                )}
              </VStack>
            </CardFooter>
          </>
        )}
      </Card>
    );
  };
  
  if (loading) {
    return (
      <Center p={8}>
        <Spinner size="xl" color="blue.500" />
      </Center>
    );
  }
  
  if (error) {
    return (
      <Alert status="error" borderRadius="md">
        <AlertIcon />
        <AlertTitle>Error!</AlertTitle>
        <AlertDescription>{error}</AlertDescription>
      </Alert>
    );
  }
  
  return (
    <Container maxW="container.xl" py={8}>
      <VStack spacing={8} align="stretch">
        <Box>
          <Button 
            variant="link" 
            colorScheme="blue" 
            onClick={() => navigate('/requests')}
            mb={4}
          >
            ← Back to Blood Requests
          </Button>
          
          <Heading size="xl" mb={2}>
            Donation Matches
          </Heading>
          
          {request && (
            <Box bg="white" p={4} borderRadius="md" boxShadow="sm" mb={6}>
              <Heading size="md" mb={3}>Request Details</Heading>
              <SimpleGrid columns={{ base: 1, md: 3 }} spacing={4}>
                <HStack>
                  <Icon as={FaTint} color="red.500" />
                  <Text fontWeight="medium">
                    Blood Type: {request.blood_type} ({request.units_needed} units)
                  </Text>
                </HStack>
                
                <HStack>
                  <Icon as={FaHospital} color="blue.500" />
                  <Text fontWeight="medium">{request.hospital_name}</Text>
                </HStack>
                
                <HStack>
                  <Icon as={FaMapMarkerAlt} color="green.500" />
                  <Text>
                    {request.hospital_city}, {request.hospital_state}
                  </Text>
                </HStack>
              </SimpleGrid>
            </Box>
          )}
        </Box>
        
        <Box>
          <Flex justifyContent="space-between" alignItems="center" mb={4}>
            <Heading size="md">
              <HStack>
                <Icon as={FaSearch} color="blue.500" />
                <Text>Donor Matches</Text>
              </HStack>
            </Heading>
            
            <FormControl maxW="200px">
              <Select 
                value={statusFilter} 
                onChange={handleStatusFilterChange}
                size="sm"
              >
                <option value="ALL">All Statuses</option>
                <option value={MatchStatus.PENDING}>Pending</option>
                <option value={MatchStatus.ACCEPTED}>Accepted</option>
                <option value={MatchStatus.COMPLETED}>Completed</option>
                <option value={MatchStatus.DECLINED}>Declined</option>
                <option value={MatchStatus.CANCELLED}>Cancelled</option>
              </Select>
            </FormControl>
          </Flex>
          
          {filteredMatches.length === 0 ? (
            <Alert status="info" borderRadius="md">
              <AlertIcon />
              <AlertTitle>No matches found</AlertTitle>
              <AlertDescription>
                {statusFilter === 'ALL' 
                  ? "There are no donor matches for this blood request yet." 
                  : `There are no ${statusFilter.toLowerCase()} matches for this blood request.`
                }
              </AlertDescription>
            </Alert>
          ) : (
            <SimpleGrid columns={{ base: 1, md: 2, lg: 3 }} spacing={6}>
              {filteredMatches.map(match => renderMatchCard(match))}
            </SimpleGrid>
          )}
        </Box>
      </VStack>
    </Container>
  );
}; 