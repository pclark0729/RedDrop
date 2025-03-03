import React, { useEffect, useState } from 'react';
import {
  Box,
  Container,
  Heading,
  Text,
  Tabs,
  TabList,
  TabPanels,
  Tab,
  TabPanel,
  Flex,
  Stat,
  StatLabel,
  StatNumber,
  StatHelpText,
  SimpleGrid,
  Icon,
  useColorModeValue,
  Button,
  HStack,
  VStack,
  Badge,
  Divider,
  useToast,
  Spinner,
  Alert,
  AlertIcon,
  AlertTitle,
  AlertDescription,
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink
} from '@chakra-ui/react';
import { Link as RouterLink, useParams, useNavigate } from 'react-router-dom';
import { FaUsers, FaCheckCircle, FaTimesCircle, FaHourglassHalf, FaChevronRight, FaArrowLeft } from 'react-icons/fa';
import { useMatching } from '../hooks/useMatching';
import MatchList from '../components/MatchList';
import { MatchStatus } from '../types';

const RequestMatchesPage: React.FC = () => {
  const { requestId } = useParams<{ requestId: string }>();
  const { 
    getMatchesByRequestId, 
    getBloodRequestById,
    updateMatch, 
    cancelMatch, 
    isLoading, 
    error 
  } = useMatching();
  const [matches, setMatches] = useState([]);
  const [request, setRequest] = useState(null);
  const [tabIndex, setTabIndex] = useState(0);
  const navigate = useNavigate();
  const toast = useToast();

  const bgColor = useColorModeValue('white', 'gray.800');
  const borderColor = useColorModeValue('gray.200', 'gray.700');
  const statBg = useColorModeValue('brand.50', 'gray.700');

  useEffect(() => {
    if (requestId) {
      loadData(requestId);
    }
  }, [requestId]);

  const loadData = async (id: string) => {
    try {
      const [matchesData, requestData] = await Promise.all([
        getMatchesByRequestId(id),
        getBloodRequestById(id)
      ]);
      
      if (matchesData) {
        setMatches(matchesData);
      }
      
      if (requestData) {
        setRequest(requestData);
      }
    } catch (err) {
      toast({
        title: 'Error loading data',
        description: 'There was a problem loading the matches for this request.',
        status: 'error',
        duration: 5000,
        isClosable: true,
      });
    }
  };

  const handleComplete = async (matchId: string, notes?: string, donationDate?: string) => {
    try {
      await updateMatch(matchId, { 
        status: MatchStatus.COMPLETED,
        notes: notes || undefined,
        donation_time: donationDate ? new Date(donationDate).toISOString() : new Date().toISOString()
      });
      
      // Refresh matches after update
      if (requestId) {
        const updatedMatches = await getMatchesByRequestId(requestId);
        if (updatedMatches) {
          setMatches(updatedMatches);
        }
      }
      
      toast({
        title: 'Donation completed',
        description: 'The donation has been marked as completed.',
        status: 'success',
        duration: 5000,
        isClosable: true,
      });
    } catch (err) {
      toast({
        title: 'Error completing donation',
        description: 'There was a problem marking this donation as complete. Please try again.',
        status: 'error',
        duration: 5000,
        isClosable: true,
      });
    }
  };

  const handleCancel = async (matchId: string, reason?: string) => {
    try {
      await cancelMatch(matchId, reason);
      
      // Refresh matches after update
      if (requestId) {
        const updatedMatches = await getMatchesByRequestId(requestId);
        if (updatedMatches) {
          setMatches(updatedMatches);
        }
      }
      
      toast({
        title: 'Match cancelled',
        description: 'The donation match has been cancelled.',
        status: 'info',
        duration: 5000,
        isClosable: true,
      });
    } catch (err) {
      toast({
        title: 'Error cancelling match',
        description: 'There was a problem cancelling this match. Please try again.',
        status: 'error',
        duration: 5000,
        isClosable: true,
      });
    }
  };

  const handleGoBack = () => {
    navigate('/requests');
  };

  const pendingMatches = matches.filter(match => match.status === MatchStatus.PENDING);
  const acceptedMatches = matches.filter(match => match.status === MatchStatus.ACCEPTED);
  const completedMatches = matches.filter(match => match.status === MatchStatus.COMPLETED);
  const declinedMatches = matches.filter(match => 
    match.status === MatchStatus.DECLINED || match.status === MatchStatus.CANCELLED
  );

  if (isLoading) {
    return (
      <Container maxW="container.xl" py={8}>
        <Flex justify="center" align="center" direction="column" minH="50vh">
          <Spinner size="xl" color="brand.500" thickness="4px" speed="0.65s" />
          <Text mt={4} color="gray.600">Loading matches...</Text>
        </Flex>
      </Container>
    );
  }

  if (error) {
    return (
      <Container maxW="container.xl" py={8}>
        <Alert status="error" borderRadius="md" mb={6}>
          <AlertIcon />
          <AlertTitle mr={2}>Error loading matches!</AlertTitle>
          <AlertDescription>{error}</AlertDescription>
        </Alert>
        <Button leftIcon={<FaArrowLeft />} onClick={handleGoBack} colorScheme="brand" variant="outline">
          Back to Requests
        </Button>
      </Container>
    );
  }

  if (!request) {
    return (
      <Container maxW="container.xl" py={8}>
        <Alert status="warning" borderRadius="md" mb={6}>
          <AlertIcon />
          <AlertTitle mr={2}>Request not found!</AlertTitle>
          <AlertDescription>The blood request you're looking for doesn't exist or has been removed.</AlertDescription>
        </Alert>
        <Button leftIcon={<FaArrowLeft />} onClick={handleGoBack} colorScheme="brand" variant="outline">
          Back to Requests
        </Button>
      </Container>
    );
  }

  return (
    <Container maxW="container.xl" py={8}>
      <VStack spacing={6} align="stretch">
        <Box>
          <Breadcrumb separator={<Icon as={FaChevronRight} color="gray.500" fontSize="xs" />} mb={4}>
            <BreadcrumbItem>
              <BreadcrumbLink as={RouterLink} to="/dashboard" color="brand.500">
                Dashboard
              </BreadcrumbLink>
            </BreadcrumbItem>
            <BreadcrumbItem>
              <BreadcrumbLink as={RouterLink} to="/requests" color="brand.500">
                My Requests
              </BreadcrumbLink>
            </BreadcrumbItem>
            <BreadcrumbItem isCurrentPage>
              <BreadcrumbLink color="gray.500">Request Matches</BreadcrumbLink>
            </BreadcrumbItem>
          </Breadcrumb>

          <Flex 
            justify="space-between" 
            align={{ base: "flex-start", md: "center" }}
            direction={{ base: "column", md: "row" }}
            gap={4}
            mb={6}
          >
            <Box>
              <Heading 
                as="h1" 
                size="xl" 
                mb={2}
                bgGradient="linear(to-r, brand.500, brand.700)"
                bgClip="text"
              >
                Matches for Blood Request
              </Heading>
              <Text color="gray.600">
                View and manage potential donors for your blood request
              </Text>
            </Box>
            <Button 
              leftIcon={<FaArrowLeft />} 
              onClick={handleGoBack}
              colorScheme="brand" 
              variant="outline"
              size="md"
            >
              Back to Requests
            </Button>
          </Flex>
        </Box>

        {/* Request Details */}
        <Box 
          p={6} 
          borderRadius="lg" 
          bg={bgColor}
          borderWidth="1px"
          borderColor={borderColor}
          boxShadow="md"
        >
          <SimpleGrid columns={{ base: 1, md: 2 }} spacing={6}>
            <VStack align="stretch" spacing={4}>
              <Heading size="md">Request Details</Heading>
              <Divider />
              <HStack>
                <Text fontWeight="bold" minW="120px">Blood Type:</Text>
                <Badge 
                  colorScheme="brand" 
                  fontSize="lg" 
                  px={3} 
                  py={1} 
                  borderRadius="md"
                >
                  {request.blood_type}
                </Badge>
              </HStack>
              <HStack>
                <Text fontWeight="bold" minW="120px">Units Needed:</Text>
                <Text>{request.units_needed}</Text>
              </HStack>
              <HStack>
                <Text fontWeight="bold" minW="120px">Urgency:</Text>
                <Badge 
                  colorScheme={
                    request.urgency_level === 'HIGH' ? 'red' : 
                    request.urgency_level === 'MEDIUM' ? 'orange' : 'green'
                  }
                >
                  {request.urgency_level}
                </Badge>
              </HStack>
              <HStack align="flex-start">
                <Text fontWeight="bold" minW="120px">Hospital:</Text>
                <VStack align="start" spacing={0}>
                  <Text>{request.hospital_name}</Text>
                  <Text fontSize="sm" color="gray.600">{request.hospital_address}</Text>
                </VStack>
              </HStack>
              {request.description && (
                <VStack align="stretch">
                  <Text fontWeight="bold">Description:</Text>
                  <Text>{request.description}</Text>
                </VStack>
              )}
            </VStack>

            <VStack align="stretch" spacing={4}>
              <Heading size="md">Match Statistics</Heading>
              <Divider />
              <SimpleGrid columns={{ base: 1, sm: 2 }} spacing={4}>
                <Stat
                  px={4}
                  py={3}
                  bg={statBg}
                  borderRadius="md"
                  borderWidth="1px"
                  borderColor={borderColor}
                >
                  <Flex justifyContent="space-between">
                    <Box>
                      <StatLabel color="gray.600">Total Matches</StatLabel>
                      <StatNumber fontSize="2xl" fontWeight="bold" color="brand.500">
                        {matches.length}
                      </StatNumber>
                    </Box>
                    <Flex
                      w={10}
                      h={10}
                      align="center"
                      justify="center"
                      rounded="full"
                      bg="brand.100"
                      color="brand.500"
                    >
                      <Icon as={FaUsers} boxSize={4} />
                    </Flex>
                  </Flex>
                </Stat>

                <Stat
                  px={4}
                  py={3}
                  bg={statBg}
                  borderRadius="md"
                  borderWidth="1px"
                  borderColor={borderColor}
                >
                  <Flex justifyContent="space-between">
                    <Box>
                      <StatLabel color="gray.600">Accepted</StatLabel>
                      <StatNumber fontSize="2xl" fontWeight="bold" color="green.500">
                        {acceptedMatches.length}
                      </StatNumber>
                    </Box>
                    <Flex
                      w={10}
                      h={10}
                      align="center"
                      justify="center"
                      rounded="full"
                      bg="green.100"
                      color="green.500"
                    >
                      <Icon as={FaCheckCircle} boxSize={4} />
                    </Flex>
                  </Flex>
                </Stat>

                <Stat
                  px={4}
                  py={3}
                  bg={statBg}
                  borderRadius="md"
                  borderWidth="1px"
                  borderColor={borderColor}
                >
                  <Flex justifyContent="space-between">
                    <Box>
                      <StatLabel color="gray.600">Pending</StatLabel>
                      <StatNumber fontSize="2xl" fontWeight="bold" color="yellow.500">
                        {pendingMatches.length}
                      </StatNumber>
                    </Box>
                    <Flex
                      w={10}
                      h={10}
                      align="center"
                      justify="center"
                      rounded="full"
                      bg="yellow.100"
                      color="yellow.500"
                    >
                      <Icon as={FaHourglassHalf} boxSize={4} />
                    </Flex>
                  </Flex>
                </Stat>

                <Stat
                  px={4}
                  py={3}
                  bg={statBg}
                  borderRadius="md"
                  borderWidth="1px"
                  borderColor={borderColor}
                >
                  <Flex justifyContent="space-between">
                    <Box>
                      <StatLabel color="gray.600">Completed</StatLabel>
                      <StatNumber fontSize="2xl" fontWeight="bold" color="blue.500">
                        {completedMatches.length}
                      </StatNumber>
                      <StatHelpText fontSize="xs">
                        {request.units_needed > 0 && 
                          `${Math.round((completedMatches.length / request.units_needed) * 100)}% of needed units`
                        }
                      </StatHelpText>
                    </Box>
                    <Flex
                      w={10}
                      h={10}
                      align="center"
                      justify="center"
                      rounded="full"
                      bg="blue.100"
                      color="blue.500"
                    >
                      <Icon as={FaCheckCircle} boxSize={4} />
                    </Flex>
                  </Flex>
                </Stat>
              </SimpleGrid>
            </VStack>
          </SimpleGrid>
        </Box>

        {/* Matches */}
        <Box mt={4}>
          <Tabs 
            variant="soft-rounded" 
            colorScheme="brand" 
            index={tabIndex} 
            onChange={setTabIndex}
            mb={6}
          >
            <TabList mb={6}>
              <Tab>All Matches ({matches.length})</Tab>
              <Tab>Accepted ({acceptedMatches.length})</Tab>
              <Tab>Pending ({pendingMatches.length})</Tab>
              <Tab>Completed ({completedMatches.length})</Tab>
              <Tab>Declined ({declinedMatches.length})</Tab>
            </TabList>

            <TabPanels>
              <TabPanel px={0}>
                <MatchList 
                  matches={matches}
                  isLoading={isLoading}
                  error={error}
                  onComplete={handleComplete}
                  onCancel={handleCancel}
                  isDonorView={false}
                />
              </TabPanel>
              
              <TabPanel px={0}>
                {acceptedMatches.length === 0 ? (
                  <Box 
                    p={8} 
                    textAlign="center" 
                    borderRadius="lg" 
                    bg={bgColor}
                    borderWidth="1px"
                    borderColor={borderColor}
                  >
                    <Heading size="md" mb={2} color="gray.600">No accepted matches</Heading>
                    <Text color="gray.500">
                      No donors have accepted your blood request yet.
                    </Text>
                  </Box>
                ) : (
                  <MatchList 
                    matches={acceptedMatches}
                    isLoading={isLoading}
                    error={error}
                    onComplete={handleComplete}
                    onCancel={handleCancel}
                    isDonorView={false}
                    showFilters={false}
                  />
                )}
              </TabPanel>
              
              <TabPanel px={0}>
                {pendingMatches.length === 0 ? (
                  <Box 
                    p={8} 
                    textAlign="center" 
                    borderRadius="lg" 
                    bg={bgColor}
                    borderWidth="1px"
                    borderColor={borderColor}
                  >
                    <Heading size="md" mb={2} color="gray.600">No pending matches</Heading>
                    <Text color="gray.500">
                      There are no donors waiting for a response.
                    </Text>
                  </Box>
                ) : (
                  <MatchList 
                    matches={pendingMatches}
                    isLoading={isLoading}
                    error={error}
                    isDonorView={false}
                    showFilters={false}
                  />
                )}
              </TabPanel>
              
              <TabPanel px={0}>
                {completedMatches.length === 0 ? (
                  <Box 
                    p={8} 
                    textAlign="center" 
                    borderRadius="lg" 
                    bg={bgColor}
                    borderWidth="1px"
                    borderColor={borderColor}
                  >
                    <Heading size="md" mb={2} color="gray.600">No completed donations</Heading>
                    <Text color="gray.500">
                      No donations have been completed for this request yet.
                    </Text>
                  </Box>
                ) : (
                  <MatchList 
                    matches={completedMatches}
                    isLoading={isLoading}
                    error={error}
                    isDonorView={false}
                    showFilters={false}
                  />
                )}
              </TabPanel>
              
              <TabPanel px={0}>
                {declinedMatches.length === 0 ? (
                  <Box 
                    p={8} 
                    textAlign="center" 
                    borderRadius="lg" 
                    bg={bgColor}
                    borderWidth="1px"
                    borderColor={borderColor}
                  >
                    <Heading size="md" mb={2} color="gray.600">No declined matches</Heading>
                    <Text color="gray.500">
                      No donors have declined your blood request.
                    </Text>
                  </Box>
                ) : (
                  <MatchList 
                    matches={declinedMatches}
                    isLoading={isLoading}
                    error={error}
                    isDonorView={false}
                    showFilters={false}
                  />
                )}
              </TabPanel>
            </TabPanels>
          </Tabs>
        </Box>
      </VStack>
    </Container>
  );
};

export default RequestMatchesPage; 