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
  useToast
} from '@chakra-ui/react';
import { FaHandHoldingHeart, FaCheckCircle, FaTimesCircle, FaHourglassHalf } from 'react-icons/fa';
import { useMatching } from '../hooks/useMatching';
import MatchList from '../components/MatchList';
import { MatchStatus } from '../types';

const DonorMatchesPage: React.FC = () => {
  const { 
    matches, 
    stats, 
    isLoading, 
    error, 
    fetchMatches, 
    updateMatch, 
    cancelMatch 
  } = useMatching();
  const [tabIndex, setTabIndex] = useState(0);
  const toast = useToast();

  const bgColor = useColorModeValue('white', 'gray.800');
  const borderColor = useColorModeValue('gray.200', 'gray.700');
  const statBg = useColorModeValue('brand.50', 'gray.700');

  useEffect(() => {
    fetchMatches();
  }, [fetchMatches]);

  const handleAccept = async (matchId: string) => {
    try {
      await updateMatch(matchId, { status: MatchStatus.ACCEPTED });
      toast({
        title: 'Match accepted',
        description: 'You have successfully accepted this donation match.',
        status: 'success',
        duration: 5000,
        isClosable: true,
      });
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

  const handleDecline = async (matchId: string, reason?: string) => {
    try {
      await updateMatch(matchId, { 
        status: MatchStatus.DECLINED,
        notes: reason || undefined
      });
      toast({
        title: 'Match declined',
        description: 'You have declined this donation match.',
        status: 'info',
        duration: 5000,
        isClosable: true,
      });
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

  const handleComplete = async (matchId: string, notes?: string, donationDate?: string) => {
    try {
      await updateMatch(matchId, { 
        status: MatchStatus.COMPLETED,
        notes: notes || undefined,
        donation_time: donationDate ? new Date(donationDate).toISOString() : new Date().toISOString()
      });
      toast({
        title: 'Donation completed',
        description: 'Thank you for your donation! You have helped save lives.',
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
      toast({
        title: 'Match cancelled',
        description: 'You have cancelled this donation match.',
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

  const pendingMatches = matches.filter(match => match.status === MatchStatus.PENDING);
  const activeMatches = matches.filter(match => match.status === MatchStatus.ACCEPTED);
  const completedMatches = matches.filter(match => 
    match.status === MatchStatus.COMPLETED || 
    match.status === MatchStatus.DECLINED || 
    match.status === MatchStatus.CANCELLED
  );

  return (
    <Container maxW="container.xl" py={8}>
      <Box mb={8}>
        <Heading 
          as="h1" 
          size="xl" 
          mb={2}
          bgGradient="linear(to-r, brand.500, brand.700)"
          bgClip="text"
        >
          My Donation Matches
        </Heading>
        <Text color="gray.600">
          View and manage your blood donation matches. Accept requests, track your donations, and help save lives.
        </Text>
      </Box>

      {/* Stats Cards */}
      <SimpleGrid columns={{ base: 1, md: 3 }} spacing={6} mb={8}>
        <Stat
          px={6}
          py={4}
          bg={statBg}
          borderRadius="lg"
          borderWidth="1px"
          borderColor={borderColor}
          boxShadow="sm"
        >
          <Flex justifyContent="space-between">
            <Box>
              <StatLabel color="gray.600">Pending Matches</StatLabel>
              <StatNumber fontSize="3xl" fontWeight="bold" color="yellow.500">
                {stats?.pending_count || pendingMatches.length}
              </StatNumber>
              <StatHelpText>Awaiting your response</StatHelpText>
            </Box>
            <Flex
              w={12}
              h={12}
              align="center"
              justify="center"
              rounded="full"
              bg="yellow.100"
              color="yellow.500"
            >
              <Icon as={FaHourglassHalf} boxSize={5} />
            </Flex>
          </Flex>
        </Stat>

        <Stat
          px={6}
          py={4}
          bg={statBg}
          borderRadius="lg"
          borderWidth="1px"
          borderColor={borderColor}
          boxShadow="sm"
        >
          <Flex justifyContent="space-between">
            <Box>
              <StatLabel color="gray.600">Active Donations</StatLabel>
              <StatNumber fontSize="3xl" fontWeight="bold" color="green.500">
                {stats?.active_count || activeMatches.length}
              </StatNumber>
              <StatHelpText>Accepted and in progress</StatHelpText>
            </Box>
            <Flex
              w={12}
              h={12}
              align="center"
              justify="center"
              rounded="full"
              bg="green.100"
              color="green.500"
            >
              <Icon as={FaHandHoldingHeart} boxSize={5} />
            </Flex>
          </Flex>
        </Stat>

        <Stat
          px={6}
          py={4}
          bg={statBg}
          borderRadius="lg"
          borderWidth="1px"
          borderColor={borderColor}
          boxShadow="sm"
        >
          <Flex justifyContent="space-between">
            <Box>
              <StatLabel color="gray.600">Completed Donations</StatLabel>
              <StatNumber fontSize="3xl" fontWeight="bold" color="blue.500">
                {stats?.completed_count || completedMatches.filter(m => m.status === MatchStatus.COMPLETED).length}
              </StatNumber>
              <StatHelpText>Lives you've helped save</StatHelpText>
            </Box>
            <Flex
              w={12}
              h={12}
              align="center"
              justify="center"
              rounded="full"
              bg="blue.100"
              color="blue.500"
            >
              <Icon as={FaCheckCircle} boxSize={5} />
            </Flex>
          </Flex>
        </Stat>
      </SimpleGrid>

      <Tabs 
        variant="soft-rounded" 
        colorScheme="brand" 
        index={tabIndex} 
        onChange={setTabIndex}
        mb={6}
      >
        <TabList mb={6}>
          <Tab>All Matches</Tab>
          <Tab>Pending ({pendingMatches.length})</Tab>
          <Tab>Active ({activeMatches.length})</Tab>
          <Tab>History ({completedMatches.length})</Tab>
        </TabList>

        <TabPanels>
          <TabPanel px={0}>
            <MatchList 
              matches={matches}
              isLoading={isLoading}
              error={error}
              onAccept={handleAccept}
              onDecline={handleDecline}
              onComplete={handleComplete}
              onCancel={handleCancel}
              isDonorView={true}
            />
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
                <Text color="gray.500" mb={6}>
                  You don't have any pending blood donation matches at the moment.
                </Text>
                <Button colorScheme="brand" size="md">
                  Find Donation Opportunities
                </Button>
              </Box>
            ) : (
              <MatchList 
                matches={pendingMatches}
                isLoading={isLoading}
                error={error}
                onAccept={handleAccept}
                onDecline={handleDecline}
                isDonorView={true}
                showFilters={false}
              />
            )}
          </TabPanel>
          
          <TabPanel px={0}>
            {activeMatches.length === 0 ? (
              <Box 
                p={8} 
                textAlign="center" 
                borderRadius="lg" 
                bg={bgColor}
                borderWidth="1px"
                borderColor={borderColor}
              >
                <Heading size="md" mb={2} color="gray.600">No active donations</Heading>
                <Text color="gray.500" mb={6}>
                  You don't have any active blood donation matches at the moment.
                </Text>
                <HStack spacing={4} justify="center">
                  <Button colorScheme="brand" size="md">
                    Find Donation Opportunities
                  </Button>
                  <Button variant="outline" colorScheme="brand" size="md">
                    View Pending Matches
                  </Button>
                </HStack>
              </Box>
            ) : (
              <MatchList 
                matches={activeMatches}
                isLoading={isLoading}
                error={error}
                onComplete={handleComplete}
                onCancel={handleCancel}
                isDonorView={true}
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
                <Heading size="md" mb={2} color="gray.600">No donation history</Heading>
                <Text color="gray.500">
                  You haven't completed any blood donations yet.
                </Text>
              </Box>
            ) : (
              <MatchList 
                matches={completedMatches}
                isLoading={isLoading}
                error={error}
                isDonorView={true}
                showFilters={true}
              />
            )}
          </TabPanel>
        </TabPanels>
      </Tabs>
    </Container>
  );
};

export default DonorMatchesPage; 