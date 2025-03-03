import React from 'react';
import { Container, Box } from '@chakra-ui/react';
import { MatchDetails } from '../components/MatchDetails';
import { useParams, Navigate } from 'react-router-dom';

export const MatchDetailsPage: React.FC = () => {
  const { matchId } = useParams<{ matchId: string }>();
  
  if (!matchId) {
    return <Navigate to="/donor/matches" replace />;
  }
  
  return (
    <Container maxW="container.lg" py={8}>
      <Box bg="white" borderRadius="lg" boxShadow="md" overflow="hidden">
        <MatchDetails matchId={matchId} />
      </Box>
    </Container>
  );
}; 