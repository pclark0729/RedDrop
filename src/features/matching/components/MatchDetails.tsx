import React, { useState } from 'react';
import {
  Box,
  VStack,
  HStack,
  Text,
  Button,
  Heading,
  Badge,
  Divider,
  Icon,
  Spinner,
  Center,
  Alert,
  AlertIcon,
  AlertTitle,
  AlertDescription,
  useDisclosure,
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalFooter,
  ModalCloseButton,
  FormControl,
  FormLabel,
  Textarea,
  Input,
  Grid,
  GridItem,
  Stat,
  StatLabel,
  StatNumber,
  StatHelpText,
  Link,
  Flex,
  Avatar,
  useColorModeValue,
  Tooltip
} from '@chakra-ui/react';
import { 
  FaMapMarkerAlt, 
  FaCalendarAlt, 
  FaHospital, 
  FaTint, 
  FaExclamationCircle, 
  FaUser, 
  FaPhone, 
  FaEnvelope, 
  FaClock,
  FaCheckCircle,
  FaTimesCircle,
  FaArrowLeft,
  FaInfoCircle,
  FaClipboardCheck
} from 'react-icons/fa';
import { format, formatDistance } from 'date-fns';
import { DonorMatch, MatchStatus, MatchUpdateData } from '../types';
import { useMatching } from '../hooks/useMatching';
import { useNavigate } from 'react-router-dom';

interface MatchDetailsProps {
  matchId: string;
  onBack?: () => void;
}

export const MatchDetails: React.FC<MatchDetailsProps> = ({ matchId, onBack }) => {
  const { 
    selectedMatch, 
    loading, 
    error, 
    getMatchById, 
    updateMatch, 
    cancelMatch 
  } = useMatching();
  const navigate = useNavigate();
  
  const { isOpen: isDeclineOpen, onOpen: onDeclineOpen, onClose: onDeclineClose } = useDisclosure();
  const { isOpen: isCompleteOpen, onOpen: onCompleteOpen, onClose: onCompleteClose } = useDisclosure();
  const { isOpen: isCancelOpen, onOpen: onCancelOpen, onClose: onCancelClose } = useDisclosure();
  
  const [declineReason, setDeclineReason] = useState('');
  const [completionNotes, setCompletionNotes] = useState('');
  const [donationDate, setDonationDate] = useState('');
  const [cancelReason, setCancelReason] = useState('');

  const bgColor = useColorModeValue('white', 'gray.800');
  const borderColor = useColorModeValue('gray.200', 'gray.700');
  const accentBg = useColorModeValue('brand.50', 'gray.700');

  React.useEffect(() => {
    loadMatchDetails();
  }, [matchId]);

  const loadMatchDetails = async () => {
    await getMatchById(matchId);
  };

  const handleBack = () => {
    if (onBack) {
      onBack();
    } else {
      navigate(-1);
    }
  };

  const getStatusBadge = (status: MatchStatus) => {
    switch (status) {
      case MatchStatus.PENDING:
        return <Badge colorScheme="yellow" fontSize="md" px={2} py={1}>Pending</Badge>;
      case MatchStatus.ACCEPTED:
        return <Badge colorScheme="green" fontSize="md" px={2} py={1}>Accepted</Badge>;
      case MatchStatus.DECLINED:
        return <Badge colorScheme="red" fontSize="md" px={2} py={1}>Declined</Badge>;
      case MatchStatus.COMPLETED:
        return <Badge colorScheme="blue" fontSize="md" px={2} py={1}>Completed</Badge>;
      case MatchStatus.CANCELLED:
        return <Badge colorScheme="gray" fontSize="md" px={2} py={1}>Cancelled</Badge>;
      default:
        return <Badge fontSize="md" px={2} py={1}>Unknown</Badge>;
    }
  };

  const getUrgencyBadge = (urgencyLevel: string) => {
    switch (urgencyLevel) {
      case 'HIGH':
        return <Badge colorScheme="red" fontSize="md">High Urgency</Badge>;
      case 'MEDIUM':
        return <Badge colorScheme="orange" fontSize="md">Medium Urgency</Badge>;
      case 'LOW':
        return <Badge colorScheme="green" fontSize="md">Low Urgency</Badge>;
      default:
        return null;
    }
  };

  const handleAccept = async () => {
    const updateData: MatchUpdateData = {
      status: MatchStatus.ACCEPTED
    };
    
    await updateMatch(matchId, updateData);
  };

  const handleDecline = async () => {
    const updateData: MatchUpdateData = {
      status: MatchStatus.DECLINED,
      notes: declineReason
    };
    
    await updateMatch(matchId, updateData);
    onDeclineClose();
    setDeclineReason('');
  };

  const handleComplete = async () => {
    const updateData: MatchUpdateData = {
      status: MatchStatus.COMPLETED,
      notes: completionNotes,
      donation_time: donationDate ? new Date(donationDate).toISOString() : new Date().toISOString()
    };
    
    await updateMatch(matchId, updateData);
    onCompleteClose();
    setCompletionNotes('');
    setDonationDate('');
  };

  const handleCancel = async () => {
    await cancelMatch(matchId, cancelReason);
    onCancelClose();
    setCancelReason('');
  };

  const renderActionButtons = () => {
    if (!selectedMatch) return null;
    
    switch (selectedMatch.status) {
      case MatchStatus.PENDING:
        return (
          <HStack spacing={4} width="100%">
            <Button colorScheme="green" onClick={handleAccept} flex={1}>
              Accept
            </Button>
            <Button colorScheme="red" onClick={onDeclineOpen} flex={1}>
              Decline
            </Button>
          </HStack>
        );
      case MatchStatus.ACCEPTED:
        return (
          <HStack spacing={4} width="100%">
            <Button colorScheme="blue" onClick={onCompleteOpen} flex={1}>
              Mark as Completed
            </Button>
            <Button colorScheme="gray" onClick={onCancelOpen} flex={1}>
              Cancel
            </Button>
          </HStack>
        );
      case MatchStatus.COMPLETED:
      case MatchStatus.DECLINED:
      case MatchStatus.CANCELLED:
        return null;
      default:
        return null;
    }
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

  if (!selectedMatch) {
    return (
      <Alert status="info" borderRadius="md">
        <AlertIcon />
        <AlertTitle>Match not found</AlertTitle>
        <AlertDescription>
          The requested match could not be found or you don't have permission to view it.
        </AlertDescription>
      </Alert>
    );
  }

  return (
    <>
      <Box width="100%">
        <Button 
          leftIcon={<FaArrowLeft />} 
          variant="ghost" 
          mb={4} 
          onClick={handleBack}
        >
          Back to Matches
        </Button>
        
        <Box 
          bg={bgColor} 
          p={6} 
          borderRadius="lg" 
          boxShadow="md" 
          borderLeft="4px solid" 
          borderLeftColor={
            selectedMatch.status === MatchStatus.PENDING ? "yellow.400" :
            selectedMatch.status === MatchStatus.ACCEPTED ? "green.400" :
            selectedMatch.status === MatchStatus.COMPLETED ? "blue.400" :
            selectedMatch.status === MatchStatus.DECLINED ? "red.400" :
            "gray.400"
          }
        >
          <VStack spacing={6} align="stretch">
            <HStack justifyContent="space-between" alignItems="flex-start">
              <VStack alignItems="flex-start" spacing={1}>
                <Heading size="lg">Blood Donation Match</Heading>
                <HStack>
                  {getStatusBadge(selectedMatch.status)}
                  {getUrgencyBadge(selectedMatch.request_urgency_level)}
                </HStack>
              </VStack>
              <VStack alignItems="flex-end" spacing={1}>
                <Text fontSize="sm" color="gray.500">
                  Match ID: {selectedMatch.id}
                </Text>
                <Text fontSize="sm" color="gray.500">
                  Created {formatDistance(new Date(selectedMatch.created_at), new Date(), { addSuffix: true })}
                </Text>
              </VStack>
            </HStack>
            
            <Divider />
            
            <Grid templateColumns={{ base: "1fr", md: "repeat(2, 1fr)" }} gap={6}>
              {/* Request Information */}
              <GridItem>
                <Box>
                  <Heading size="md" mb={4}>Request Information</Heading>
                  
                  <VStack align="stretch" spacing={4}>
                    <HStack>
                      <Icon as={FaTint} color="red.500" boxSize={5} />
                      <VStack align="start" spacing={0}>
                        <Text fontWeight="bold">Blood Type</Text>
                        <Text>{selectedMatch.request_blood_type} ({selectedMatch.request_units_needed} units needed)</Text>
                      </VStack>
                    </HStack>
                    
                    <HStack>
                      <Icon as={FaHospital} color="blue.500" boxSize={5} />
                      <VStack align="start" spacing={0}>
                        <Text fontWeight="bold">Hospital</Text>
                        <Text>{selectedMatch.request_hospital_name}</Text>
                      </VStack>
                    </HStack>
                    
                    <HStack>
                      <Icon as={FaMapMarkerAlt} color="green.500" boxSize={5} />
                      <VStack align="start" spacing={0}>
                        <Text fontWeight="bold">Location</Text>
                        <Text>
                          {selectedMatch.request_hospital_address || 
                            `${selectedMatch.request_hospital_city}, ${selectedMatch.request_hospital_state}`}
                        </Text>
                      </VStack>
                    </HStack>
                    
                    {selectedMatch.request_required_by_date && (
                      <HStack>
                        <Icon as={FaCalendarAlt} color="orange.500" boxSize={5} />
                        <VStack align="start" spacing={0}>
                          <Text fontWeight="bold">Required By</Text>
                          <Text>{format(new Date(selectedMatch.request_required_by_date), 'MMMM dd, yyyy')}</Text>
                        </VStack>
                      </HStack>
                    )}
                  </VStack>
                </Box>
              </GridItem>
              
              {/* Match Status Information */}
              <GridItem>
                <Box>
                  <Heading size="md" mb={4}>Match Status</Heading>
                  
                  <VStack align="stretch" spacing={4}>
                    <Stat>
                      <StatLabel>Current Status</StatLabel>
                      <StatNumber>
                        <HStack>
                          <Icon 
                            as={
                              selectedMatch.status === MatchStatus.COMPLETED || 
                              selectedMatch.status === MatchStatus.ACCEPTED ? 
                                FaCheckCircle : 
                              selectedMatch.status === MatchStatus.DECLINED || 
                              selectedMatch.status === MatchStatus.CANCELLED ? 
                                FaTimesCircle : 
                                FaClock
                            } 
                            color={
                              selectedMatch.status === MatchStatus.COMPLETED || 
                              selectedMatch.status === MatchStatus.ACCEPTED ? 
                                "green.500" : 
                              selectedMatch.status === MatchStatus.DECLINED || 
                              selectedMatch.status === MatchStatus.CANCELLED ? 
                                "red.500" : 
                                "yellow.500"
                            }
                          />
                          <Text>
                            {selectedMatch.status === MatchStatus.PENDING ? "Pending Response" :
                             selectedMatch.status === MatchStatus.ACCEPTED ? "Accepted" :
                             selectedMatch.status === MatchStatus.DECLINED ? "Declined" :
                             selectedMatch.status === MatchStatus.COMPLETED ? "Completed" :
                             selectedMatch.status === MatchStatus.CANCELLED ? "Cancelled" :
                             "Unknown"}
                          </Text>
                        </HStack>
                      </StatNumber>
                      {selectedMatch.response_time && (
                        <StatHelpText>
                          Responded {formatDistance(new Date(selectedMatch.response_time), new Date(selectedMatch.created_at))} after matching
                        </StatHelpText>
                      )}
                    </Stat>
                    
                    {selectedMatch.donation_time && (
                      <HStack>
                        <Icon as={FaCalendarAlt} color="blue.500" boxSize={5} />
                        <VStack align="start" spacing={0}>
                          <Text fontWeight="bold">Donation Date</Text>
                          <Text>{format(new Date(selectedMatch.donation_time), 'MMMM dd, yyyy')}</Text>
                        </VStack>
                      </HStack>
                    )}
                    
                    {selectedMatch.notes && (
                      <Box p={3} bg="gray.50" borderRadius="md">
                        <HStack align="start" mb={1}>
                          <Icon as={FaExclamationCircle} color="gray.600" mt={1} />
                          <Text fontWeight="bold">Notes</Text>
                        </HStack>
                        <Text ml={6}>{selectedMatch.notes}</Text>
                      </Box>
                    )}
                  </VStack>
                </Box>
              </GridItem>
            </Grid>
            
            {renderActionButtons() && (
              <>
                <Divider />
                <Box>
                  {renderActionButtons()}
                </Box>
              </>
            )}
          </VStack>
        </Box>
      </Box>
      
      {/* Decline Modal */}
      <Modal isOpen={isDeclineOpen} onClose={onDeclineClose}>
        <ModalOverlay backdropFilter="blur(10px)" />
        <ModalContent borderRadius="xl">
          <ModalHeader borderBottomWidth="1px" borderColor="gray.100">
            Decline Donation Match
          </ModalHeader>
          <ModalCloseButton />
          <ModalBody py={6}>
            <FormControl>
              <FormLabel>Reason for declining (optional)</FormLabel>
              <Textarea 
                value={declineReason} 
                onChange={(e) => setDeclineReason(e.target.value)}
                placeholder="Please provide a reason for declining this match"
                borderRadius="md"
              />
            </FormControl>
          </ModalBody>
          <ModalFooter borderTopWidth="1px" borderColor="gray.100">
            <Button variant="ghost" mr={3} onClick={onDeclineClose}>
              Cancel
            </Button>
            <Button colorScheme="red" onClick={handleDecline}>
              Decline Match
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>
      
      {/* Complete Modal */}
      <Modal isOpen={isCompleteOpen} onClose={onCompleteClose}>
        <ModalOverlay backdropFilter="blur(10px)" />
        <ModalContent borderRadius="xl">
          <ModalHeader borderBottomWidth="1px" borderColor="gray.100">
            Mark Donation as Completed
          </ModalHeader>
          <ModalCloseButton />
          <ModalBody py={6}>
            <VStack spacing={4}>
              <FormControl>
                <FormLabel>Donation Date</FormLabel>
                <Input 
                  type="date" 
                  value={donationDate} 
                  onChange={(e) => setDonationDate(e.target.value)}
                  borderRadius="md"
                />
              </FormControl>
              <FormControl>
                <FormLabel>Additional Notes (optional)</FormLabel>
                <Textarea 
                  value={completionNotes} 
                  onChange={(e) => setCompletionNotes(e.target.value)}
                  placeholder="Any additional information about the donation"
                  borderRadius="md"
                />
              </FormControl>
            </VStack>
          </ModalBody>
          <ModalFooter borderTopWidth="1px" borderColor="gray.100">
            <Button variant="ghost" mr={3} onClick={onCompleteClose}>
              Cancel
            </Button>
            <Button colorScheme="blue" onClick={handleComplete}>
              Complete Donation
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>
      
      {/* Cancel Modal */}
      <Modal isOpen={isCancelOpen} onClose={onCancelClose}>
        <ModalOverlay backdropFilter="blur(10px)" />
        <ModalContent borderRadius="xl">
          <ModalHeader borderBottomWidth="1px" borderColor="gray.100">
            Cancel Donation Match
          </ModalHeader>
          <ModalCloseButton />
          <ModalBody py={6}>
            <FormControl>
              <FormLabel>Reason for cancellation (optional)</FormLabel>
              <Textarea 
                value={cancelReason} 
                onChange={(e) => setCancelReason(e.target.value)}
                placeholder="Please provide a reason for cancelling this match"
                borderRadius="md"
              />
            </FormControl>
          </ModalBody>
          <ModalFooter borderTopWidth="1px" borderColor="gray.100">
            <Button variant="ghost" mr={3} onClick={onCancelClose}>
              Back
            </Button>
            <Button colorScheme="red" onClick={handleCancel}>
              Cancel Match
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>
    </>
  );
}; 