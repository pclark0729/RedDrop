import React, { useState, useEffect } from 'react';
import {
  Box,
  VStack,
  HStack,
  Text,
  Select,
  Input,
  Button,
  Tabs,
  TabList,
  TabPanels,
  Tab,
  TabPanel,
  Flex,
  Heading,
  Divider,
  Badge,
  Spinner,
  Center,
  Alert,
  AlertIcon,
  AlertTitle,
  AlertDescription,
  SimpleGrid,
  FormControl,
  FormLabel,
  Stack,
  InputGroup,
  InputLeftElement,
  Icon,
  Menu,
  MenuButton,
  MenuList,
  MenuItem
} from '@chakra-ui/react';
import { MatchCard } from './MatchCard';
import { DonorMatch, MatchStatus, MatchFilters } from '../types';
import { useMatching } from '../hooks/useMatching';
import { format } from 'date-fns';
import { FaSearch, FaFilter, FaChevronDown, FaSortAmountDown, FaSortAmountUp } from 'react-icons/fa';
import { useColorModeValue } from '@chakra-ui/react';

interface MatchListProps {
  initialFilters?: MatchFilters;
}

export const MatchList: React.FC<MatchListProps> = ({ initialFilters }) => {
  const { 
    matches, 
    loading, 
    error, 
    getCurrentDonorMatches,
    getPendingMatches,
    getAcceptedMatches,
    getCompletedMatches,
    getDeclinedMatches,
    getCancelledMatches
  } = useMatching();
  
  const [filters, setFilters] = useState<MatchFilters>(initialFilters || {});
  const [tabIndex, setTabIndex] = useState(0);
  const [cities, setCities] = useState<string[]>([]);
  const [states, setStates] = useState<string[]>([]);
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [sortBy, setSortBy] = useState<string>('created_at');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');

  useEffect(() => {
    loadMatches();
  }, []);

  useEffect(() => {
    if (matches.length > 0) {
      // Extract unique cities and states from matches
      const uniqueCities = [...new Set(matches.map(match => match.request_hospital_city))];
      const uniqueStates = [...new Set(matches.map(match => match.request_hospital_state))];
      
      setCities(uniqueCities.filter(Boolean) as string[]);
      setStates(uniqueStates.filter(Boolean) as string[]);
    }
  }, [matches]);

  const loadMatches = async () => {
    await getCurrentDonorMatches(filters);
  };

  const handleFilterChange = (field: keyof MatchFilters, value: any) => {
    const newFilters = { ...filters, [field]: value || undefined };
    
    // Remove empty values
    Object.keys(newFilters).forEach(key => {
      if (newFilters[key as keyof MatchFilters] === '' || newFilters[key as keyof MatchFilters] === undefined) {
        delete newFilters[key as keyof MatchFilters];
      }
    });
    
    setFilters(newFilters);
  };

  const handleApplyFilters = () => {
    loadMatches();
  };

  const handleResetFilters = () => {
    setFilters({});
    getCurrentDonorMatches({});
  };

  const handleTabChange = (index: number) => {
    setTabIndex(index);
    
    // Update status filter based on selected tab
    let statusFilter: MatchStatus | undefined;
    
    switch (index) {
      case 0: // All
        statusFilter = undefined;
        break;
      case 1: // Pending
        statusFilter = MatchStatus.PENDING;
        break;
      case 2: // Accepted
        statusFilter = MatchStatus.ACCEPTED;
        break;
      case 3: // Completed
        statusFilter = MatchStatus.COMPLETED;
        break;
      case 4: // Declined
        statusFilter = MatchStatus.DECLINED;
        break;
      case 5: // Cancelled
        statusFilter = MatchStatus.CANCELLED;
        break;
    }
    
    handleFilterChange('status', statusFilter);
    
    // If it's not the "All" tab, apply the filter immediately
    if (index !== 0) {
      getCurrentDonorMatches({ ...filters, status: statusFilter });
    } else {
      getCurrentDonorMatches({ ...filters, status: undefined });
    }
  };

  const getMatchesByTab = () => {
    switch (tabIndex) {
      case 0: // All
        return matches;
      case 1: // Pending
        return getPendingMatches();
      case 2: // Accepted
        return getAcceptedMatches();
      case 3: // Completed
        return getCompletedMatches();
      case 4: // Declined
        return getDeclinedMatches();
      case 5: // Cancelled
        return getCancelledMatches();
      default:
        return matches;
    }
  };

  const handleStatusUpdate = (updatedMatch: DonorMatch) => {
    // The match list will be automatically updated by the useMatching hook
    // This function is passed to MatchCard to handle any additional UI updates if needed
  };

  const renderMatchCount = () => {
    const currentMatches = getMatchesByTab();
    return (
      <Text fontSize="sm" color="gray.600">
        Showing {currentMatches.length} {currentMatches.length === 1 ? 'match' : 'matches'}
      </Text>
    );
  };

  const bgColor = useColorModeValue('white', 'gray.800');
  const borderColor = useColorModeValue('gray.200', 'gray.700');

  const filteredMatches = matches.filter(match => {
    // Status filter
    if (statusFilter !== 'all' && match.status !== statusFilter) {
      return false;
    }

    // Search query
    if (searchQuery) {
      const searchLower = searchQuery.toLowerCase();
      const requesterName = `${match.requester_first_name} ${match.requester_last_name}`.toLowerCase();
      const donorName = `${match.donor_first_name} ${match.donor_last_name}`.toLowerCase();
      const hospital = match.request_hospital_name.toLowerCase();
      const location = `${match.request_city} ${match.request_state}`.toLowerCase();

      return (
        requesterName.includes(searchLower) ||
        donorName.includes(searchLower) ||
        hospital.includes(searchLower) ||
        location.includes(searchLower) ||
        match.request_blood_type.toLowerCase().includes(searchLower)
      );
    }

    return true;
  }).sort((a, b) => {
    let valueA, valueB;

    switch (sortBy) {
      case 'created_at':
        valueA = new Date(a.created_at).getTime();
        valueB = new Date(b.created_at).getTime();
        break;
      case 'blood_type':
        valueA = a.request_blood_type;
        valueB = b.request_blood_type;
        break;
      case 'name':
        valueA = `${a.requester_first_name} ${a.requester_last_name}`;
        valueB = `${b.requester_first_name} ${b.requester_last_name}`;
        break;
      case 'location':
        valueA = `${a.request_city}, ${a.request_state}`;
        valueB = `${b.request_city}, ${b.request_state}`;
        break;
      default:
        valueA = new Date(a.created_at).getTime();
        valueB = new Date(b.created_at).getTime();
    }

    if (sortOrder === 'asc') {
      return valueA > valueB ? 1 : -1;
    } else {
      return valueA < valueB ? 1 : -1;
    }
  });

  const toggleSortOrder = () => {
    setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
  };

  return (
    <Box width="100%">
      <VStack spacing={6} align="stretch">
        <Box bg={bgColor} p={4} borderRadius="md" boxShadow="sm" borderWidth="1px" borderColor={borderColor}>
          <Heading size="md" mb={4}>Filter Matches</Heading>
          <SimpleGrid columns={{ base: 1, md: 3 }} spacing={4}>
            <FormControl>
              <FormLabel fontSize="sm">City</FormLabel>
              <Select 
                placeholder="Select city" 
                value={filters.city || ''}
                onChange={(e) => handleFilterChange('city', e.target.value)}
              >
                {cities.map(city => (
                  <option key={city} value={city}>{city}</option>
                ))}
              </Select>
            </FormControl>
            
            <FormControl>
              <FormLabel fontSize="sm">State</FormLabel>
              <Select 
                placeholder="Select state" 
                value={filters.state || ''}
                onChange={(e) => handleFilterChange('state', e.target.value)}
              >
                {states.map(state => (
                  <option key={state} value={state}>{state}</option>
                ))}
              </Select>
            </FormControl>
            
            <Stack direction={{ base: 'column', md: 'row' }} spacing={2} alignItems="flex-end">
              <FormControl>
                <FormLabel fontSize="sm">Date Range</FormLabel>
                <HStack spacing={2}>
                  <Input 
                    type="date" 
                    placeholder="Start date" 
                    value={filters.startDate || ''}
                    onChange={(e) => handleFilterChange('startDate', e.target.value)}
                    size="md"
                  />
                  <Text>to</Text>
                  <Input 
                    type="date" 
                    placeholder="End date" 
                    value={filters.endDate || ''}
                    onChange={(e) => handleFilterChange('endDate', e.target.value)}
                    size="md"
                  />
                </HStack>
              </FormControl>
            </Stack>
          </SimpleGrid>
          
          <HStack mt={4} justifyContent="flex-end">
            <Button variant="outline" onClick={handleResetFilters}>
              Reset
            </Button>
            <Button colorScheme="blue" onClick={handleApplyFilters}>
              Apply Filters
            </Button>
          </HStack>
        </Box>
        
        <Tabs 
          variant="soft-rounded" 
          colorScheme="blue" 
          index={tabIndex} 
          onChange={handleTabChange}
        >
          <TabList overflowX="auto" py={2}>
            <Tab>
              All
              <Badge ml={2} colorScheme="gray" borderRadius="full">
                {matches.length}
              </Badge>
            </Tab>
            <Tab>
              Pending
              <Badge ml={2} colorScheme="yellow" borderRadius="full">
                {getPendingMatches().length}
              </Badge>
            </Tab>
            <Tab>
              Accepted
              <Badge ml={2} colorScheme="green" borderRadius="full">
                {getAcceptedMatches().length}
              </Badge>
            </Tab>
            <Tab>
              Completed
              <Badge ml={2} colorScheme="blue" borderRadius="full">
                {getCompletedMatches().length}
              </Badge>
            </Tab>
            <Tab>
              Declined
              <Badge ml={2} colorScheme="red" borderRadius="full">
                {getDeclinedMatches().length}
              </Badge>
            </Tab>
            <Tab>
              Cancelled
              <Badge ml={2} colorScheme="gray" borderRadius="full">
                {getCancelledMatches().length}
              </Badge>
            </Tab>
          </TabList>
          
          <Box mt={4}>
            <Flex justifyContent="space-between" alignItems="center" mb={4}>
              {renderMatchCount()}
            </Flex>
            
            {loading ? (
              <Center p={8}>
                <Spinner size="xl" color="blue.500" />
              </Center>
            ) : error ? (
              <Alert status="error" borderRadius="md">
                <AlertIcon />
                <AlertTitle>Error!</AlertTitle>
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            ) : getMatchesByTab().length === 0 ? (
              <Alert status="info" borderRadius="md">
                <AlertIcon />
                <AlertTitle>No matches found</AlertTitle>
                <AlertDescription>
                  {tabIndex === 0 
                    ? "You don't have any donation matches yet." 
                    : `You don't have any ${
                        tabIndex === 1 ? 'pending' : 
                        tabIndex === 2 ? 'accepted' : 
                        tabIndex === 3 ? 'completed' : 
                        tabIndex === 4 ? 'declined' : 'cancelled'
                      } matches.`
                  }
                </AlertDescription>
              </Alert>
            ) : (
              <VStack spacing={4} align="stretch">
                {filteredMatches.map(match => (
                  <MatchCard 
                    key={match.id} 
                    match={match} 
                    onStatusUpdate={handleStatusUpdate}
                  />
                ))}
              </VStack>
            )}
          </Box>
        </Tabs>
      </VStack>
    </Box>
  );
}; 