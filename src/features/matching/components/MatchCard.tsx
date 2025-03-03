import React from 'react';
import { 
  Box, 
  Card, 
  CardBody, 
  CardFooter, 
  CardHeader, 
  Heading, 
  Text, 
  Badge, 
  Button, 
  HStack, 
  VStack, 
  Divider, 
  Icon, 
  Tooltip,
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
  Input
} from '@chakra-ui/react';
import { FaMapMarkerAlt, FaCalendarAlt, FaHospital, FaTint, FaExclamationCircle } from 'react-icons/fa';
import { format } from 'date-fns';
import { DonorMatch, MatchStatus, MatchUpdateData } from '../types';
import { useMatching } from '../hooks/useMatching';

interface MatchCardProps {
  match: DonorMatch;
  onStatusUpdate?: (match: DonorMatch) => void;
}

export const MatchCard: React.FC<MatchCardProps> = ({ match, onStatusUpdate }) => {
  const { updateMatch, cancelMatch } = useMatching();
  const { isOpen: isDeclineOpen, onOpen: onDeclineOpen, onClose: onDeclineClose } = useDisclosure();
  const { isOpen: isCompleteOpen, onOpen: onCompleteOpen, onClose: onCompleteClose } = useDisclosure();
  const { isOpen: isCancelOpen, onOpen: onCancelOpen, onClose: onCancelClose } = useDisclosure();
  const [declineReason, setDeclineReason] = React.useState('');
  const [completionNotes, setCompletionNotes] = React.useState('');
  const [donationDate, setDonationDate] = React.useState('');
  const [cancelReason, setCancelReason] = React.useState('');

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

  const getUrgencyBadge = (urgencyLevel: string) => {
    switch (urgencyLevel) {
      case 'HIGH':
        return <Badge colorScheme="red">High Urgency</Badge>;
      case 'MEDIUM':
        return <Badge colorScheme="orange">Medium Urgency</Badge>;
      case 'LOW':
        return <Badge colorScheme="green">Low Urgency</Badge>;
      default:
        return null;
    }
  };

  const handleAccept = async () => {
    const updateData: MatchUpdateData = {
      status: MatchStatus.ACCEPTED
    };
    
    const updatedMatch = await updateMatch(match.id, updateData);
    if (updatedMatch && onStatusUpdate) {
      onStatusUpdate(updatedMatch);
    }
  };

  const handleDecline = async () => {
    const updateData: MatchUpdateData = {
      status: MatchStatus.DECLINED,
      notes: declineReason
    };
    
    const updatedMatch = await updateMatch(match.id, updateData);
    if (updatedMatch && onStatusUpdate) {
      onStatusUpdate(updatedMatch);
    }
    
    onDeclineClose();
    setDeclineReason('');
  };

  const handleComplete = async () => {
    const updateData: MatchUpdateData = {
      status: MatchStatus.COMPLETED,
      notes: completionNotes,
      donation_time: donationDate ? new Date(donationDate).toISOString() : new Date().toISOString()
    };
    
    const updatedMatch = await updateMatch(match.id, updateData);
    if (updatedMatch && onStatusUpdate) {
      onStatusUpdate(updatedMatch);
    }
    
    onCompleteClose();
    setCompletionNotes('');
    setDonationDate('');
  };

  const handleCancel = async () => {
    const updatedMatch = await cancelMatch(match.id, cancelReason);
    if (updatedMatch && onStatusUpdate) {
      onStatusUpdate(updatedMatch);
    }
    
    onCancelClose();
    setCancelReason('');
  };

  const renderActionButtons = () => {
    switch (match.status) {
      case MatchStatus.PENDING:
        return (
          <HStack spacing={2} width="100%">
            <Button colorScheme="green" size="sm" onClick={handleAccept} flex={1}>
              Accept
            </Button>
            <Button colorScheme="red" size="sm" onClick={onDeclineOpen} flex={1}>
              Decline
            </Button>
          </HStack>
        );
      case MatchStatus.ACCEPTED:
        return (
          <HStack spacing={2} width="100%">
            <Button colorScheme="blue" size="sm" onClick={onCompleteOpen} flex={1}>
              Mark as Completed
            </Button>
            <Button colorScheme="gray" size="sm" onClick={onCancelOpen} flex={1}>
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

  return (
    <>
      <Card 
        width="100%" 
        borderRadius="lg" 
        boxShadow="md" 
        borderLeft="4px solid" 
        borderLeftColor={
          match.status === MatchStatus.PENDING ? "yellow.400" :
          match.status === MatchStatus.ACCEPTED ? "green.400" :
          match.status === MatchStatus.COMPLETED ? "blue.400" :
          match.status === MatchStatus.DECLINED ? "red.400" :
          "gray.400"
        }
      >
        <CardHeader pb={2}>
          <HStack justifyContent="space-between" alignItems="flex-start">
            <VStack alignItems="flex-start" spacing={1}>
              <Heading size="md">Blood Request Match</Heading>
              <HStack>
                {getStatusBadge(match.status)}
                {getUrgencyBadge(match.request_urgency_level)}
              </HStack>
            </VStack>
            <Text fontSize="sm" color="gray.500">
              Matched on {format(new Date(match.created_at), 'MMM dd, yyyy')}
            </Text>
          </HStack>
        </CardHeader>
        
        <CardBody pt={0}>
          <VStack align="stretch" spacing={3}>
            <HStack>
              <Icon as={FaTint} color="red.500" />
              <Text fontWeight="medium">Blood Type: {match.request_blood_type}</Text>
              <Text fontSize="sm" color="gray.600">({match.request_units_needed} units needed)</Text>
            </HStack>
            
            <HStack>
              <Icon as={FaHospital} color="blue.500" />
              <Text fontWeight="medium">{match.request_hospital_name}</Text>
            </HStack>
            
            <HStack>
              <Icon as={FaMapMarkerAlt} color="green.500" />
              <Text>{match.request_hospital_address || `${match.request_hospital_city}, ${match.request_hospital_state}`}</Text>
            </HStack>
            
            {match.request_required_by_date && (
              <HStack>
                <Icon as={FaCalendarAlt} color="orange.500" />
                <Text>
                  Required by: {format(new Date(match.request_required_by_date), 'MMM dd, yyyy')}
                </Text>
              </HStack>
            )}
            
            {match.notes && (
              <Box mt={2} p={3} bg="gray.50" borderRadius="md">
                <Text fontSize="sm" fontStyle="italic">
                  <Icon as={FaExclamationCircle} mr={2} color="gray.600" />
                  {match.notes}
                </Text>
              </Box>
            )}
          </VStack>
        </CardBody>
        
        {renderActionButtons() && (
          <>
            <Divider />
            <CardFooter pt={2}>
              {renderActionButtons()}
            </CardFooter>
          </>
        )}
      </Card>
      
      {/* Decline Modal */}
      <Modal isOpen={isDeclineOpen} onClose={onDeclineClose}>
        <ModalOverlay />
        <ModalContent>
          <ModalHeader>Decline Donation Match</ModalHeader>
          <ModalCloseButton />
          <ModalBody>
            <FormControl>
              <FormLabel>Reason for declining (optional)</FormLabel>
              <Textarea 
                value={declineReason} 
                onChange={(e) => setDeclineReason(e.target.value)}
                placeholder="Please provide a reason for declining this match"
              />
            </FormControl>
          </ModalBody>
          <ModalFooter>
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
        <ModalOverlay />
        <ModalContent>
          <ModalHeader>Mark Donation as Completed</ModalHeader>
          <ModalCloseButton />
          <ModalBody>
            <VStack spacing={4}>
              <FormControl>
                <FormLabel>Donation Date</FormLabel>
                <Input 
                  type="date" 
                  value={donationDate} 
                  onChange={(e) => setDonationDate(e.target.value)}
                />
              </FormControl>
              <FormControl>
                <FormLabel>Additional Notes (optional)</FormLabel>
                <Textarea 
                  value={completionNotes} 
                  onChange={(e) => setCompletionNotes(e.target.value)}
                  placeholder="Any additional information about the donation"
                />
              </FormControl>
            </VStack>
          </ModalBody>
          <ModalFooter>
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
        <ModalOverlay />
        <ModalContent>
          <ModalHeader>Cancel Donation Match</ModalHeader>
          <ModalCloseButton />
          <ModalBody>
            <FormControl>
              <FormLabel>Reason for cancellation (optional)</FormLabel>
              <Textarea 
                value={cancelReason} 
                onChange={(e) => setCancelReason(e.target.value)}
                placeholder="Please provide a reason for cancelling this match"
              />
            </FormControl>
          </ModalBody>
          <ModalFooter>
            <Button variant="ghost" mr={3} onClick={onCancelClose}>
              Back
            </Button>
            <Button colorScheme="gray" onClick={handleCancel}>
              Cancel Match
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>
    </>
  );
}; 