import React, { useEffect, useState } from 'react';
import {
  Box,
  Container,
  Heading,
  Text,
  Button,
  HStack,
  VStack,
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  Icon,
  Flex,
  useColorModeValue,
  Spinner,
  Alert,
  AlertIcon,
  AlertTitle,
  AlertDescription,
  useToast
} from '@chakra-ui/react';
import { Link as RouterLink, useParams, useNavigate } from 'react-router-dom';
import { FaArrowLeft, FaChevronRight } from 'react-icons/fa';
import { useMatching } from '../hooks/useMatching';
import MatchDetails from '../components/MatchDetails';
import { MatchStatus } from '../types';

const MatchDetailsPage: React.FC = () => {
  const { matchId } = useParams<{ matchId: string }>();
  const { 
    getMatchById, 
    updateMatch, 
    cancelMatch, 
    isLoading, 
    error 
  } = useMatching();
  const [match, setMatch] = useState(null);
  const navigate = useNavigate();
  const toast = useToast();

  const bgColor = useColorModeValue('white', 'gray.800');
  const borderColor = useColorModeValue('gray.200', 'gray.700');

  useEffect(() => {
    if (matchId) {
      loadMatch(matchId);
    }
  }, [matchId]);

  const loadMatch = async (id: string) => {
    const matchData = await getMatchById(id);
    if (matchData) {
      setMatch(matchData);
    }
  };

  const handleAccept = async (id: string) => {
    try {
      const updatedMatch = await updateMatch(id, { status: MatchStatus.ACCEPTED });
      if (updatedMatch) {
        setMatch(updatedMatch);
        toast({
          title: 'Match accepted',
          description: 'You have successfully accepted this donation match.',
          status: 'success',
          duration: 5000,
          isClosable: true,
        });
      }
    } catch (err) {
      toast({
        title: 'Error accepting match',
        description: 'There was a problem accepting this match. Please try again.',
        status: 'error',
        duration: 5000,
        isClosable: true,
      });
    }
  };

  const handleDecline = async (id: string, reason?: string) => {
    try {
      const updatedMatch = await updateMatch(id, { 
        status: MatchStatus.DECLINED,
        notes: reason || undefined
      });
      if (updatedMatch) {
        setMatch(updatedMatch);
        toast({
          title: 'Match declined',
          description: 'You have declined this donation match.',
          status: 'info',
          duration: 5000,
          isClosable: true,
        });
      }
    } catch (err) {
      toast({
        title: 'Error declining match',
        description: 'There was a problem declining this match. Please try again.',
        status: 'error',
        duration: 5000,
        isClosable: true,
      });
    }
  };

  const handleComplete = async (id: string, notes?: string, donationDate?: string) => {
    try {
      const updatedMatch = await updateMatch(id, { 
        status: MatchStatus.COMPLETED,
        notes: notes || undefined,
        donation_time: donationDate ? new Date(donationDate).toISOString() : new Date().toISOString()
      });
      if (updatedMatch) {
        setMatch(updatedMatch);
        toast({
          title: 'Donation completed',
          description: 'Thank you for your donation! You have helped save lives.',
          status: 'success',
          duration: 5000,
          isClosable: true,
        });
      }
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

  const handleCancel = async (id: string, reason?: string) => {
    try {
      const updatedMatch = await cancelMatch(id, reason);
      if (updatedMatch) {
        setMatch(updatedMatch);
        toast({
          title: 'Match cancelled',
          description: 'You have cancelled this donation match.',
          status: 'info',
          duration: 5000,
          isClosable: true,
        });
      }
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
    navigate(-1);
  };

  if (isLoading) {
    return (
      <Container maxW="container.xl" py={8}>
        <Flex justify="center" align="center" direction="column" minH="50vh">
          <Spinner size="xl" color="brand.500" thickness="4px" speed="0.65s" />
          <Text mt={4} color="gray.600">Loading match details...</Text>
        </Flex>
      </Container>
    );
  }

  if (error) {
    return (
      <Container maxW="container.xl" py={8}>
        <Alert status="error" borderRadius="md" mb={6}>
          <AlertIcon />
          <AlertTitle mr={2}>Error loading match details!</AlertTitle>
          <AlertDescription>{error}</AlertDescription>
        </Alert>
        <Button leftIcon={<FaArrowLeft />} onClick={handleGoBack} colorScheme="brand" variant="outline">
          Go Back
        </Button>
      </Container>
    );
  }

  if (!match) {
    return (
      <Container maxW="container.xl" py={8}>
        <Alert status="warning" borderRadius="md" mb={6}>
          <AlertIcon />
          <AlertTitle mr={2}>Match not found!</AlertTitle>
          <AlertDescription>The match you're looking for doesn't exist or has been removed.</AlertDescription>
        </Alert>
        <Button leftIcon={<FaArrowLeft />} onClick={handleGoBack} colorScheme="brand" variant="outline">
          Go Back
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
              <BreadcrumbLink as={RouterLink} to="/donor/matches" color="brand.500">
                My Matches
              </BreadcrumbLink>
            </BreadcrumbItem>
            <BreadcrumbItem isCurrentPage>
              <BreadcrumbLink color="gray.500">Match Details</BreadcrumbLink>
            </BreadcrumbItem>
          </Breadcrumb>

          <Flex 
            justify="space-between" 
            align={{ base: "flex-start", md: "center" }}
            direction={{ base: "column", md: "row" }}
            gap={4}
            mb={6}
          >
            <Heading 
              as="h1" 
              size="xl"
              bgGradient="linear(to-r, brand.500, brand.700)"
              bgClip="text"
            >
              Match Details
            </Heading>
            <Button 
              leftIcon={<FaArrowLeft />} 
              onClick={handleGoBack}
              colorScheme="brand" 
              variant="outline"
              size="md"
            >
              Back to Matches
            </Button>
          </Flex>
        </Box>

        <MatchDetails 
          match={match}
          onAccept={handleAccept}
          onDecline={handleDecline}
          onComplete={handleComplete}
          onCancel={handleCancel}
          isDonorView={true}
        />
      </VStack>
    </Container>
  );
};

export default MatchDetailsPage; 