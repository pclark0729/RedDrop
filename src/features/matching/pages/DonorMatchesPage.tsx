import React, { useState } from 'react';
import {
  Box,
  Container,
  Heading,
  Text,
  VStack,
  HStack,
  Stat,
  StatLabel,
  StatNumber,
  StatHelpText,
  SimpleGrid,
  Icon,
  Divider,
  useDisclosure,
  Drawer,
  DrawerBody,
  DrawerHeader,
  DrawerOverlay,
  DrawerContent,
  DrawerCloseButton,
  Button
} from '@chakra-ui/react';
import { FaCheckCircle, FaTimesCircle, FaClock, FaChartLine } from 'react-icons/fa';
import { MatchList } from '../components/MatchList';
import { MatchDetails } from '../components/MatchDetails';
import { useMatching } from '../hooks/useMatching';
import { MatchStatus } from '../types';

export const DonorMatchesPage: React.FC = () => {
  const { 
    statistics, 
    getMatchStatistics,
    selectedMatch,
    clearSelectedMatch
  } = useMatching();
  
  const [selectedMatchId, setSelectedMatchId] = useState<string | null>(null);
  const { isOpen, onOpen, onClose } = useDisclosure();

  React.useEffect(() => {
    loadStatistics();
  }, []);

  const loadStatistics = async () => {
    await getMatchStatistics();
  };

  const handleViewMatchDetails = (matchId: string) => {
    setSelectedMatchId(matchId);
    onOpen();
  };

  const handleCloseDetails = () => {
    clearSelectedMatch();
    setSelectedMatchId(null);
    onClose();
  };

  return (
    <Container maxW="container.xl" py={8}>
      <VStack spacing={8} align="stretch">
        <Box>
          <Heading size="xl" mb={2}>My Donation Matches</Heading>
          <Text color="gray.600">
            View and manage your blood donation matches
          </Text>
        </Box>
        
        {statistics && (
          <Box bg="white" p={6} borderRadius="lg" boxShadow="md">
            <Heading size="md" mb={4}>
              <HStack>
                <Icon as={FaChartLine} color="blue.500" />
                <Text>Match Statistics</Text>
              </HStack>
            </Heading>
            
            <SimpleGrid columns={{ base: 2, md: 4 }} spacing={6}>
              <Stat>
                <StatLabel>Total Matches</StatLabel>
                <StatNumber>{statistics.totalMatches}</StatNumber>
                <StatHelpText>All time</StatHelpText>
              </Stat>
              
              <Stat>
                <HStack>
                  <Icon as={FaClock} color="yellow.500" />
                  <StatLabel>Pending</StatLabel>
                </HStack>
                <StatNumber>{statistics.pendingMatches}</StatNumber>
                <StatHelpText>Awaiting your response</StatHelpText>
              </Stat>
              
              <Stat>
                <HStack>
                  <Icon as={FaCheckCircle} color="green.500" />
                  <StatLabel>Completed</StatLabel>
                </HStack>
                <StatNumber>{statistics.completedMatches}</StatNumber>
                <StatHelpText>Successful donations</StatHelpText>
              </Stat>
              
              <Stat>
                <HStack>
                  <Icon as={FaTimesCircle} color="red.500" />
                  <StatLabel>Declined/Cancelled</StatLabel>
                </HStack>
                <StatNumber>{statistics.declinedMatches + statistics.cancelledMatches}</StatNumber>
                <StatHelpText>Not completed</StatHelpText>
              </Stat>
            </SimpleGrid>
            
            {statistics.averageResponseTimeMinutes > 0 && (
              <Box mt={4} pt={4} borderTopWidth="1px" borderTopColor="gray.200">
                <SimpleGrid columns={{ base: 1, md: 2 }} spacing={6}>
                  <Stat>
                    <StatLabel>Average Response Time</StatLabel>
                    <StatNumber>
                      {Math.floor(statistics.averageResponseTimeMinutes / 60)} hours {Math.floor(statistics.averageResponseTimeMinutes % 60)} minutes
                    </StatNumber>
                    <StatHelpText>Time to accept or decline</StatHelpText>
                  </Stat>
                  
                  <Stat>
                    <StatLabel>Success Rate</StatLabel>
                    <StatNumber>{Math.round(statistics.matchSuccessRate * 100)}%</StatNumber>
                    <StatHelpText>Completed donations</StatHelpText>
                  </Stat>
                </SimpleGrid>
              </Box>
            )}
          </Box>
        )}
        
        <Divider />
        
        <MatchList />
      </VStack>
      
      <Drawer
        isOpen={isOpen}
        placement="right"
        onClose={handleCloseDetails}
        size="lg"
      >
        <DrawerOverlay />
        <DrawerContent>
          <DrawerCloseButton />
          <DrawerHeader borderBottomWidth="1px">
            Match Details
          </DrawerHeader>
          <DrawerBody p={4}>
            {selectedMatchId && (
              <MatchDetails 
                matchId={selectedMatchId} 
                onBack={handleCloseDetails} 
              />
            )}
          </DrawerBody>
        </DrawerContent>
      </Drawer>
    </Container>
  );
}; 