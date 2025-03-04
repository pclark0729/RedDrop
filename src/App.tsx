import React, { ErrorInfo, ReactNode, useEffect } from 'react';
import { ChakraProvider, Box, Text, Button, VStack, Heading } from '@chakra-ui/react';
import { BrowserRouter as Router } from 'react-router-dom';
import theme from './app/theme';
import { AuthProvider } from './features/auth/context/AuthContext';
import AppRoutes from './routes';
import OnboardingCheck from './features/auth/components/OnboardingCheck';

// Error boundary component to catch rendering errors
class ErrorBoundary extends React.Component<
  { children: ReactNode },
  { hasError: boolean; error: Error | null; errorInfo: ErrorInfo | null }
> {
  constructor(props: { children: ReactNode }) {
    super(props);
    this.state = { hasError: false, error: null, errorInfo: null };
  }

  static getDerivedStateFromError(error: Error) {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error("Rendering error:", error, errorInfo);
    this.setState({ errorInfo });
  }

  render() {
    if (this.state.hasError) {
      return (
        <Box p={8} maxW="800px" mx="auto" textAlign="center">
          <VStack spacing={6}>
            <Heading as="h1" color="red.500">Something went wrong</Heading>
            <Text>We encountered an error while rendering the application.</Text>
            <Box 
              bg="gray.50" 
              p={4} 
              borderRadius="md" 
              width="100%" 
              overflowX="auto"
              textAlign="left"
            >
              <Text fontWeight="bold" mb={2}>Error:</Text>
              <Text color="red.500">{this.state.error && this.state.error.toString()}</Text>
              
              {this.state.errorInfo && (
                <>
                  <Text fontWeight="bold" mt={4} mb={2}>Component Stack:</Text>
                  <Text as="pre" fontSize="sm" whiteSpace="pre-wrap">
                    {this.state.errorInfo.componentStack}
                  </Text>
                </>
              )}
            </Box>
            <Button 
              colorScheme="red" 
              onClick={() => window.location.href = '/'}
            >
              Go to Home
            </Button>
            <Button 
              colorScheme="blue" 
              onClick={() => window.location.reload()}
            >
              Reload Page
            </Button>
          </VStack>
        </Box>
      );
    }

    return this.props.children;
  }
}

// Debug component to log when App renders
const DebugLogger: React.FC<{ children: ReactNode }> = ({ children }) => {
  useEffect(() => {
    console.log('App component rendered');
    
    // Check for stored redirect path on app mount
    const storedPath = sessionStorage.getItem('redirectPath');
    if (storedPath) {
      console.log('Found stored redirect path at app level:', storedPath);
      sessionStorage.removeItem('redirectPath');
      // Use direct navigation to avoid router issues
      window.location.href = storedPath;
    }
    
    // Add global navigation error handler
    window.addEventListener('error', (event) => {
      console.error('Global error caught:', event.error);
      if (event.error && event.error.message && 
          event.error.message.includes('navigation') || 
          event.error.message.includes('route')) {
        console.warn('Navigation error detected, attempting recovery');
        // If there's a navigation error, try to recover
        const currentPath = window.location.pathname;
        if (currentPath === '/signin' || currentPath === '/') {
          window.location.href = '/dashboard';
        }
      }
    });
  }, []);
  
  return <>{children}</>;
};

function App() {
  return (
    <ErrorBoundary>
      <DebugLogger>
        <ChakraProvider theme={theme}>
          <Router>
            <AuthProvider>
              <OnboardingCheck />
              <AppRoutes />
            </AuthProvider>
          </Router>
        </ChakraProvider>
      </DebugLogger>
    </ErrorBoundary>
  );
}

export default App;
