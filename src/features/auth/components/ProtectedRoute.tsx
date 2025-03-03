import React from 'react';
import { Navigate, Outlet, useLocation } from 'react-router-dom';
import { Flex, Spinner } from '@chakra-ui/react';
import { useAuth } from '../hooks/useAuth';

const ProtectedRoute: React.FC = () => {
  const { user, isLoading } = useAuth();
  const location = useLocation();

  // Show loading state while checking authentication
  if (isLoading) {
    return (
      <Flex justify="center" align="center" height="100vh">
        <Spinner size="xl" color="red.500" thickness="4px" />
      </Flex>
    );
  }

  // Redirect to login if not authenticated
  if (!user) {
    return <Navigate to="/auth/signin" state={{ from: location }} replace />;
  }

  // Render child routes if authenticated
  return <Outlet />;
};

export default ProtectedRoute; 