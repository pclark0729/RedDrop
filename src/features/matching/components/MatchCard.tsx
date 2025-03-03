import React from 'react';
import {
  Box,
  Flex,
  Text,
  Badge,
  Button,
  Avatar,
  HStack,
  VStack,
  useDisclosure,
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalFooter,
  ModalBody,
  ModalCloseButton,
  Icon,
  Divider,
  Tooltip,
  useColorModeValue
} from '@chakra-ui/react';
import { format } from 'date-fns';
import { FaMapMarkerAlt, FaPhoneAlt, FaEnvelope, FaCalendarAlt, FaCheckCircle, FaTimesCircle, FaInfoCircle } from 'react-icons/fa';
import { Link as RouterLink } from 'react-router-dom';
import { DonorMatch, MatchStatus } from '../types';

interface MatchCardProps {
  match: DonorMatch;
  onAccept?: (matchId: string) => void;
  onDecline?: (matchId: string) => void;
  onComplete?: (matchId: string) => void;
  onCancel?: (matchId: string) => void;
  showActions?: boolean;
  isDonorView?: boolean;
}

const MatchCard: React.FC<MatchCardProps> = ({
  match,
  onAccept,
  onDecline,
  onComplete,
  onCancel,
  showActions = true,
  isDonorView = true
}) => {
  const { isOpen, onOpen, onClose } = useDisclosure();
  
  const getStatusColor = (status: MatchStatus) => {
    switch (status) {
      case MatchStatus.PENDING:
        return 'yellow';
      case MatchStatus.ACCEPTED:
        return 'green';
      case MatchStatus.COMPLETED:
        return 'blue';
      case MatchStatus.DECLINED:
      case MatchStatus.CANCELLED:
        return 'red';
      default:
        return 'gray';
    }
  };

  const getStatusText = (status: MatchStatus) => {
    switch (status) {
      case MatchStatus.PENDING:
        return 'Pending';
      case MatchStatus.ACCEPTED:
        return 'Accepted';
      case MatchStatus.COMPLETED:
        return 'Completed';
      case MatchStatus.DECLINED:
        return 'Declined';
      case MatchStatus.CANCELLED:
        return 'Cancelled';
      default:
        return 'Unknown';
    }
  };

  const cardBg = useColorModeValue('white', 'gray.800');
  const borderColor = useColorModeValue('gray.200', 'gray.700');
  const hoverBg = useColorModeValue('gray.50', 'gray.700');

  return (
    <>
      <Box
        borderWidth="1px"
        borderRadius="lg"
        overflow="hidden"
        bg={cardBg}
        borderColor={borderColor}
        boxShadow="sm"
        transition="all 0.2s"
        _hover={{ 
          transform: 'translateY(-2px)', 
          boxShadow: 'md',
          borderColor: 'brand.200',
          bg: hoverBg
        }}
        position="relative"
      >
        {/* Status Badge - Top Right */}
        <Badge
          colorScheme={getStatusColor(match.status)}
          position="absolute"
          top={2}
          right={2}
          px={2}
          py={1}
          borderRadius="full"
          fontSize="xs"
          textTransform="uppercase"
          fontWeight="bold"
        >
          {getStatusText(match.status)}
        </Badge>

        <Box p={4}>
          <Flex direction="column" gap={3}>
            {/* Header with blood type and match date */}
            <Flex justify="space-between" align="center">
              <Badge 
                colorScheme="brand" 
                fontSize="xl" 
                px={3} 
                py={1} 
                borderRadius="md"
                fontWeight="bold"
              >
                {isDonorView ? match.request_blood_type : match.donor_blood_type}
              </Badge>
              <HStack spacing={1} color="gray.500" fontSize="sm">
                <Icon as={FaCalendarAlt} />
                <Text>{format(new Date(match.created_at), 'MMM dd, yyyy')}</Text>
              </HStack>
            </Flex>

            {/* Main content */}
            <Flex mt={2} gap={4}>
              <Avatar 
                size="md" 
                name={isDonorView ? 
                  `${match.requester_first_name} ${match.requester_last_name}` : 
                  `${match.donor_first_name} ${match.donor_last_name}`
                }
                src={isDonorView ? match.requester_avatar_url : match.donor_avatar_url}
                bg="brand.500"
              />
              <VStack align="start" spacing={1} flex={1}>
                <Text fontWeight="bold" fontSize="md">
                  {isDonorView ? 
                    `${match.requester_first_name} ${match.requester_last_name}` : 
                    `${match.donor_first_name} ${match.donor_last_name}`
                  }
                </Text>
                <HStack spacing={1} color="gray.600" fontSize="sm">
                  <Icon as={FaMapMarkerAlt} color="brand.500" />
                  <Text>
                    {isDonorView ? 
                      `${match.request_city}, ${match.request_state}` : 
                      `${match.donor_city}, ${match.donor_state}`
                    }
                  </Text>
                </HStack>
                {match.status === MatchStatus.ACCEPTED && (
                  <HStack spacing={1} color="gray.600" fontSize="sm">
                    <Icon as={FaPhoneAlt} color="brand.500" />
                    <Text>
                      {isDonorView ? match.requester_phone : match.donor_phone}
                    </Text>
                  </HStack>
                )}
              </VStack>
            </Flex>

            {/* Request details */}
            <Box mt={2}>
              <Text fontSize="sm" color="gray.600" noOfLines={2}>
                {match.request_description}
              </Text>
            </Box>

            {/* Action buttons */}
            {showActions && (
              <Flex mt={3} justify="space-between" align="center">
                <Button 
                  size="sm" 
                  variant="outline" 
                  colorScheme="brand"
                  as={RouterLink}
                  to={`/matches/${match.id}`}
                  leftIcon={<FaInfoCircle />}
                >
                  Details
                </Button>
                
                <HStack spacing={2}>
                  {match.status === MatchStatus.PENDING && isDonorView && (
                    <>
                      <Button 
                        size="sm" 
                        colorScheme="green" 
                        onClick={() => onAccept && onAccept(match.id)}
                        leftIcon={<FaCheckCircle />}
                      >
                        Accept
                      </Button>
                      <Button 
                        size="sm" 
                        colorScheme="red" 
                        variant="outline"
                        onClick={() => onDecline && onDecline(match.id)}
                        leftIcon={<FaTimesCircle />}
                      >
                        Decline
                      </Button>
                    </>
                  )}
                  
                  {match.status === MatchStatus.ACCEPTED && (
                    <>
                      {isDonorView && (
                        <Button 
                          size="sm" 
                          colorScheme="blue" 
                          onClick={() => onComplete && onComplete(match.id)}
                        >
                          Mark Complete
                        </Button>
                      )}
                      <Button 
                        size="sm" 
                        colorScheme="red" 
                        variant="outline"
                        onClick={() => onCancel && onCancel(match.id)}
                      >
                        Cancel
                      </Button>
                    </>
                  )}
                </HStack>
              </Flex>
            )}
          </Flex>
        </Box>
      </Box>

      {/* Contact Modal */}
      <Modal isOpen={isOpen} onClose={onClose} isCentered>
        <ModalOverlay backdropFilter="blur(10px)" />
        <ModalContent borderRadius="xl" boxShadow="xl">
          <ModalHeader 
            borderBottomWidth="1px" 
            borderColor="gray.100"
            bg="brand.50"
            borderTopRadius="xl"
          >
            Contact Information
          </ModalHeader>
          <ModalCloseButton />
          <ModalBody py={6}>
            <VStack spacing={4} align="stretch">
              <Flex align="center">
                <Avatar 
                  size="lg" 
                  name={isDonorView ? 
                    `${match.requester_first_name} ${match.requester_last_name}` : 
                    `${match.donor_first_name} ${match.donor_last_name}`
                  }
                  src={isDonorView ? match.requester_avatar_url : match.donor_avatar_url}
                  mr={4}
                />
                <Box>
                  <Text fontWeight="bold" fontSize="lg">
                    {isDonorView ? 
                      `${match.requester_first_name} ${match.requester_last_name}` : 
                      `${match.donor_first_name} ${match.donor_last_name}`
                    }
                  </Text>
                  <Badge colorScheme="brand">
                    {isDonorView ? 'Requester' : 'Donor'}
                  </Badge>
                </Box>
              </Flex>
              
              <Divider />
              
              <VStack spacing={3} align="stretch">
                <Flex align="center">
                  <Icon as={FaPhoneAlt} color="brand.500" mr={3} />
                  <Text>
                    {isDonorView ? match.requester_phone : match.donor_phone}
                  </Text>
                </Flex>
                
                <Flex align="center">
                  <Icon as={FaEnvelope} color="brand.500" mr={3} />
                  <Text>
                    {isDonorView ? match.requester_email : match.donor_email}
                  </Text>
                </Flex>
                
                <Flex align="center">
                  <Icon as={FaMapMarkerAlt} color="brand.500" mr={3} />
                  <Text>
                    {isDonorView ? 
                      `${match.request_city}, ${match.request_state}` : 
                      `${match.donor_city}, ${match.donor_state}`
                    }
                  </Text>
                </Flex>
              </VStack>
              
              <Divider />
              
              <Box>
                <Text fontWeight="medium" mb={2}>Hospital/Donation Center:</Text>
                <Text>{match.request_hospital_name}</Text>
                <Text fontSize="sm" color="gray.600">
                  {match.request_hospital_address}
                </Text>
              </Box>
            </VStack>
          </ModalBody>
          <ModalFooter borderTopWidth="1px" borderColor="gray.100">
            <Button variant="ghost" mr={3} onClick={onClose}>
              Close
            </Button>
            <Button colorScheme="brand">
              Send Message
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>
    </>
  );
};

export default MatchCard; 