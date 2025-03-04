import React, { useEffect, useState } from 'react';
import { Routes, Route, Navigate, useNavigate, Link as RouterLink, useLocation } from 'react-router-dom';
import { 
  Box, 
  Heading, 
  Text, 
  Button, 
  Center, 
  VStack, 
  Container, 
  Grid, 
  GridItem, 
  Image, 
  Flex, 
  Badge, 
  useColorModeValue, 
  Icon,
  HStack,
  Divider,
  Input,
  FormControl,
  FormLabel,
  InputGroup,
  InputRightElement,
  IconButton,
  Card,
  CardBody,
  Stack,
  Stat,
  StatLabel,
  StatNumber,
  StatHelpText,
  SimpleGrid,
  Spinner,
  Alert,
  AlertIcon,
  AlertTitle,
  AlertDescription,
  Select,
  Textarea
} from '@chakra-ui/react';
import { FaArrowRight, FaUser, FaLock, FaHeart, FaHandHoldingHeart, FaUserPlus, FaChartLine, FaExclamationTriangle } from 'react-icons/fa';
import Layout from '../components/layout/Layout';
import { useAuthContext } from '../features/auth/context/AuthContext';
import supabase from '../app/supabase';
import OnboardingPage from '../features/auth/components/OnboardingPage';
import Dashboard from '../features/dashboard/components/Dashboard';

// Protected Route Component
const ProtectedRoute = ({ children }: { children: React.ReactNode }) => {
  const { user, isLoading } = useAuthContext();
  const location = useLocation();

  if (isLoading) {
    return (
      <Center h="100vh">
        <Spinner size="xl" color="red.500" />
      </Center>
    );
  }

  if (!user) {
    console.log('ProtectedRoute: No user found, redirecting to sign-in page');
    return <Navigate to="/signin" state={{ from: location }} replace />;
  }

  // If user is authenticated, render the protected content
  return <>{children}</>;
};

// Onboarding Route Component
const OnboardingRoute = ({ children }: { children: React.ReactNode }) => {
  const { user, isLoading, isOnboarding } = useAuthContext();
  const location = useLocation();
  const [timeoutOccurred, setTimeoutOccurred] = useState(false);

  // Add a safety timeout to prevent infinite loading
  useEffect(() => {
    const timer = setTimeout(() => {
      if (isLoading) {
        console.log('OnboardingRoute: Loading timeout occurred, rendering content anyway');
        setTimeoutOccurred(true);
      }
    }, 3000);
    
    return () => clearTimeout(timer);
  }, [isLoading]);

  // If loading and timeout hasn't occurred yet, show spinner
  if (isLoading && !timeoutOccurred) {
    return (
      <Center h="100vh">
        <VStack spacing={4}>
          <Spinner size="xl" color="red.500" />
          <Text>Loading your profile...</Text>
        </VStack>
      </Center>
    );
  }

  // Check if we have a forced access flag in session storage
  const forcedAccess = sessionStorage.getItem('force_onboarding_access') === 'true';
  
  // If no user but we have forced access, render the content anyway
  if (!user && forcedAccess) {
    console.log('OnboardingRoute: No user but forced access is enabled, rendering content');
    return <>{children}</>;
  }
  
  // If no user and no forced access, redirect to sign-in
  if (!user && !forcedAccess) {
    console.log('OnboardingRoute: No user found, redirecting to sign-in page');
    return <Navigate to="/signin" state={{ from: location }} replace />;
  }

  // If user exists but doesn't need onboarding and no forced access, redirect to dashboard
  if (user && !isOnboarding && !forcedAccess) {
    console.log('OnboardingRoute: User already completed onboarding, redirecting to dashboard');
    return <Navigate to="/dashboard" replace />;
  }

  // Otherwise, render the onboarding content
  return <>{children}</>;
};

// Direct Onboarding Access Component - a special route that bypasses auth checks
const DirectOnboardingAccess = () => {
  const navigate = useNavigate();
  
  useEffect(() => {
    console.log('Setting forced onboarding access flag and redirecting');
    // Set a flag in session storage to indicate forced access
    sessionStorage.setItem('force_onboarding_access', 'true');
    // Navigate to the actual onboarding page
    navigate('/onboarding', { replace: true });
  }, [navigate]);
  
  return (
    <Center h="100vh">
      <VStack spacing={4}>
        <Spinner size="xl" color="red.500" />
        <Text>Preparing onboarding page...</Text>
      </VStack>
    </Center>
  );
};

// Cyberpunk-inspired button component
const CyberButton = ({ children, icon, onClick, ...props }: { children: React.ReactNode; icon?: React.ElementType; onClick?: () => void; [x: string]: any }) => {
  const bgColor = useColorModeValue('red.500', 'red.600');
  const hoverBgColor = useColorModeValue('red.600', 'red.700');
  const glowColor = useColorModeValue('red.200', 'red.900');
  
  return (
    <Button
      position="relative"
      colorScheme="red"
      size="lg"
      px={8}
      py={6}
      overflow="hidden"
      onClick={onClick}
      _before={{
        content: '""',
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        bg: bgColor,
        transform: 'translateY(100%)',
        transition: 'transform 0.3s ease-out',
        zIndex: -1,
      }}
      _hover={{
        bg: hoverBgColor,
        transform: 'translateY(-2px)',
        boxShadow: `0 0 20px ${glowColor}`,
        _before: {
          transform: 'translateY(0)',
        },
      }}
      _active={{
        transform: 'translateY(0)',
        boxShadow: 'none',
      }}
      transition="all 0.3s"
      rightIcon={icon && <Icon as={icon} />}
      {...props}
    >
      {children}
    </Button>
  );
};

// Cyberpunk-inspired card component
const CyberCard = ({ children, ...props }: { children: React.ReactNode; [x: string]: any }) => {
  const bgColor = useColorModeValue('white', 'gray.800');
  const borderColor = useColorModeValue('red.100', 'red.900');
  
  return (
    <Box
      bg={bgColor}
      borderRadius="md"
      overflow="hidden"
      boxShadow="md"
      position="relative"
      borderLeft="3px solid"
      borderColor="red.500"
      _before={{
        content: '""',
        position: 'absolute',
        top: 0,
        left: 0,
        width: '100%',
        height: '100%',
        background: 'linear-gradient(45deg, transparent 98%, red.500 98%)',
        zIndex: 0,
      }}
      _hover={{
        transform: 'translateY(-5px)',
        boxShadow: 'lg',
      }}
      transition="all 0.3s ease"
      {...props}
    >
      {children}
    </Box>
  );
};

// Landing Page
const LandingPage = () => {
  const navigate = useNavigate();
  const headingColor = useColorModeValue('gray.800', 'white');
  const textColor = useColorModeValue('gray.600', 'gray.300');
  const statBg = useColorModeValue('white', 'gray.800');
  
  const handleBecomeDonor = () => {
    navigate('/donor/register');
  };
  
  const handleLearnMore = () => {
    navigate('/about');
  };
  
  return (
    <>
      {/* Hero Section */}
      <Container maxW="container.xl" pt={{ base: 10, md: 20 }} pb={{ base: 16, md: 28 }}>
        <Grid templateColumns={{ base: '1fr', lg: '1fr 1fr' }} gap={10} alignItems="center">
          <GridItem>
            <Box position="relative">
              <Badge 
                colorScheme="red" 
                position="absolute" 
                top="-10px" 
                left="0" 
                px={3} 
                py={1} 
                borderRadius="full"
                fontWeight="bold"
              >
                Life-Saving Platform
              </Badge>
              <Heading 
                as="h1" 
                size="3xl" 
                lineHeight="1.2" 
                mb={6} 
                color={headingColor}
                bgGradient="linear(to-r, red.500, red.700)"
                bgClip="text"
              >
                Connect Blood Donors with Those in Need
              </Heading>
              <Text fontSize="xl" mb={8} color={textColor}>
                RedDrop uses cutting-edge technology to match blood donors with recipients, 
                making the donation process seamless and efficient.
              </Text>
              <HStack spacing={4}>
                <CyberButton icon={FaHandHoldingHeart} onClick={handleBecomeDonor}>
                  Become a Donor
                </CyberButton>
                <Button 
                  variant="outline" 
                  colorScheme="red" 
                  size="lg" 
                  rightIcon={<Icon as={FaArrowRight} />}
                  onClick={handleLearnMore}
                >
                  Learn More
                </Button>
              </HStack>
            </Box>
          </GridItem>
          <GridItem display={{ base: 'none', lg: 'block' }}>
            <Image 
              src="/assets/hero-image.png" 
              alt="Blood Donation" 
              borderRadius="md"
              fallbackSrc="https://via.placeholder.com/600x400?text=RedDrop"
            />
          </GridItem>
        </Grid>
      </Container>
      
      {/* Stats Section */}
      <Box bg={useColorModeValue('gray.50', 'gray.900')} py={16}>
        <Container maxW="container.xl">
          <SimpleGrid columns={{ base: 1, md: 3 }} spacing={10}>
            <Stat 
              bg={statBg} 
              p={6} 
              borderRadius="md" 
              boxShadow="md" 
              borderLeft="3px solid" 
              borderColor="red.500"
            >
              <StatLabel fontSize="lg" fontWeight="medium">Donors</StatLabel>
              <StatNumber fontSize="4xl" fontWeight="bold" color="red.500">5,000+</StatNumber>
              <StatHelpText>Active blood donors</StatHelpText>
            </Stat>
            <Stat 
              bg={statBg} 
              p={6} 
              borderRadius="md" 
              boxShadow="md" 
              borderLeft="3px solid" 
              borderColor="red.500"
            >
              <StatLabel fontSize="lg" fontWeight="medium">Donations</StatLabel>
              <StatNumber fontSize="4xl" fontWeight="bold" color="red.500">12,500+</StatNumber>
              <StatHelpText>Successful donations</StatHelpText>
            </Stat>
            <Stat 
              bg={statBg} 
              p={6} 
              borderRadius="md" 
              boxShadow="md" 
              borderLeft="3px solid" 
              borderColor="red.500"
            >
              <StatLabel fontSize="lg" fontWeight="medium">Lives Saved</StatLabel>
              <StatNumber fontSize="4xl" fontWeight="bold" color="red.500">37,500+</StatNumber>
              <StatHelpText>People helped</StatHelpText>
            </Stat>
          </SimpleGrid>
        </Container>
      </Box>
    </>
  );
};

// Session storage helpers
const sessionHelpers = {
  // Getters
  getAuthSuccess: () => sessionStorage.getItem('auth_success') === 'true',
  getSignInComplete: () => sessionStorage.getItem('sign_in_complete') === 'true',
  getNeedsOnboarding: () => sessionStorage.getItem('needs_onboarding') === 'true',
  getRlsPolicyError: () => sessionStorage.getItem('rls_policy_error') === 'true',
  
  // Clear functions
  clearAuthSuccess: () => {
    sessionStorage.removeItem('auth_success');
    sessionStorage.removeItem('sign_in_complete');
  }
};

// Sign In Page
const SignInPage = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { signIn } = useAuthContext();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  
  // Check for stored auth status on component mount
  useEffect(() => {
    const checkStoredAuthStatus = () => {
      const signInComplete = sessionHelpers.getSignInComplete();
      const authSuccess = sessionHelpers.getAuthSuccess();
      const needsOnboarding = sessionHelpers.getNeedsOnboarding();
      const hasRlsError = sessionHelpers.getRlsPolicyError();
      
      console.log('Checking stored auth status:', { 
        signInComplete, 
        authSuccess, 
        needsOnboarding,
        hasRlsError
      });
      
      if (signInComplete && authSuccess) {
        console.log('Found stored auth success, attempting navigation');
        
        // Clear the flags
        sessionHelpers.clearAuthSuccess();
        
        // Navigate based on onboarding status
        if (needsOnboarding) {
          console.log('User needs onboarding based on session storage, navigating');
          navigate('/onboarding');
        } else {
          console.log('User authenticated based on session storage, navigating');
          navigate('/dashboard');
        }
      }
      
      // Show a warning if RLS policy error was detected
      if (hasRlsError) {
        setError('Database policy error detected. Some features may be limited. Please complete your profile to continue.');
      }
    };
    
    // Run the check with a small delay to ensure all session storage is set
    const timer = setTimeout(checkStoredAuthStatus, 100);
    return () => clearTimeout(timer);
  }, [navigate]);
  
  // Handle form submission
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validate inputs
    if (!email || !password) {
      setError('Email and password are required');
      return;
    }
    
    try {
      // Start loading
      setIsLoading(true);
      setError(null);
      
      console.log('Attempting to sign in with:', { email });
      
      // Call the sign in function
      const user = await signIn({ email, password });
      
      console.log('Sign-in authentication successful, user:', user.id);
      
      // Reset loading state immediately
      setIsLoading(false);
      
      // Navigate to dashboard immediately after successful authentication
      // Profile loading will happen in the background
      navigate('/dashboard');
    } catch (err) {
      console.error('Sign-in error:', err);
      setError('Invalid email or password. Please try again.');
      setIsLoading(false);
    }
  };
  
  // Navigate to sign up page
  const handleSignUpClick = () => {
    navigate('/signup');
  };
  
  // Add a safety timeout to reset loading state if it gets stuck
  useEffect(() => {
    let loadingTimer: NodeJS.Timeout | null = null;
    
    if (isLoading) {
      // Reset loading state after 10 seconds as a safety measure
      loadingTimer = setTimeout(() => {
        console.log('Loading timeout triggered - resetting loading state');
        setIsLoading(false);
      }, 10000);
    }
    
    return () => {
      if (loadingTimer) clearTimeout(loadingTimer);
    };
  }, [isLoading]);
  
  return (
    <Container maxW="md" py={12}>
      <VStack spacing={6} align="stretch">
        {/* Header */}
        <VStack spacing={2} align="center">
          <Heading 
            size="xl" 
            bgGradient="linear(to-r, red.500, red.700)"
            bgClip="text"
          >
            Welcome Back
          </Heading>
          <Text color="gray.500">
            Sign in to continue to your account
          </Text>
        </VStack>
        
        {/* Error message */}
        {error && (
          <Alert status="error" borderRadius="md">
            <AlertIcon />
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}
        
        {/* Sign in form */}
        <form onSubmit={handleSubmit}>
          <VStack spacing={4}>
            <FormControl isRequired>
              <FormLabel>Email</FormLabel>
              <Input 
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Your email address"
                disabled={isLoading}
              />
            </FormControl>
            
            <FormControl isRequired>
              <FormLabel>Password</FormLabel>
              <Input 
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Your password"
                disabled={isLoading}
              />
            </FormControl>
            
            <Button
              type="submit"
              colorScheme="red"
              size="lg"
              width="100%"
              isLoading={isLoading}
              loadingText="Signing In"
              mt={2}
            >
              Sign In
            </Button>
          </VStack>
        </form>
        
        {/* Sign up link */}
        <Text textAlign="center" mt={4}>
          Don't have an account?{' '}
          <Text
            as="span"
            color="red.500"
            fontWeight="medium"
            cursor="pointer"
            _hover={{ textDecoration: 'underline' }}
            onClick={handleSignUpClick}
          >
            Sign Up
          </Text>
        </Text>
      </VStack>
    </Container>
  );
};

// Sign Up Page
const SignUpPage = () => {
  const navigate = useNavigate();
  const { signUp } = useAuthContext();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    password: '',
    confirmPassword: ''
  });
  
  // Email validation function
  const validateEmail = (email: string) => {
    const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return re.test(email);
  };
  
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };
  
  const handleCreateAccount = async () => {
    // Validate form data
    if (!formData.email || !formData.password || !formData.confirmPassword) {
      setError('All fields are required');
      return;
    }
    
    if (!validateEmail(formData.email)) {
      setError('Please enter a valid email address');
      return;
    }
    
    if (formData.password.length < 6) {
      setError('Password must be at least 6 characters');
      return;
    }
    
    if (formData.password !== formData.confirmPassword) {
      setError('Passwords do not match');
      return;
    }
    
    try {
      setIsLoading(true);
      setError(null);
      
      // Register user with Supabase
      await signUp({ 
        email: formData.email, 
        password: formData.password,
        firstName: formData.firstName,
        lastName: formData.lastName
      });
      
      // Navigate to onboarding page
      navigate('/onboarding');
    } catch (err) {
      console.error('Registration error:', err);
      
      // Display more specific error messages
      if (err instanceof Error) {
        if (err.message.includes('Database error')) {
          setError('Database error creating user profile. Please try again or contact support.');
        } else if (err.message.includes('User already registered')) {
          setError('This email is already registered. Please sign in instead.');
        } else if (err.message.includes('Password')) {
          setError('Password error: ' + err.message);
        } else {
          setError(err.message || 'Failed to create account. Please try again.');
        }
      } else {
        setError('Failed to create account. Please try again.');
      }
    } finally {
      setIsLoading(false);
    }
  };
  
  const handleSignIn = () => {
    navigate('/signin');
  };
  
  return (
    <Container maxW="md" py={12}>
      <VStack spacing={8} align="stretch">
        <VStack spacing={2} align="center">
          <Heading 
            size="xl" 
            textAlign="center"
            bgGradient="linear(to-r, red.500, red.700)"
            bgClip="text"
          >
            Create Your Account
          </Heading>
          <Text color="gray.500" textAlign="center">
            Join RedDrop and start saving lives today
          </Text>
        </VStack>
        
        {error && (
          <Alert status="error" borderRadius="md">
            <AlertIcon />
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}
        
        <VStack spacing={4} align="stretch">
          <HStack spacing={4}>
            <FormControl>
              <FormLabel>First Name</FormLabel>
              <Input 
                name="firstName"
                value={formData.firstName}
                onChange={handleInputChange}
                placeholder="First name"
              />
            </FormControl>
            
            <FormControl>
              <FormLabel>Last Name</FormLabel>
              <Input 
                name="lastName"
                value={formData.lastName}
                onChange={handleInputChange}
                placeholder="Last name"
              />
            </FormControl>
          </HStack>
          
          <FormControl isRequired>
            <FormLabel>Email</FormLabel>
            <Input 
              name="email"
              type="email"
              value={formData.email}
              onChange={handleInputChange}
              placeholder="Your email address"
            />
          </FormControl>
          
          <FormControl isRequired>
            <FormLabel>Password</FormLabel>
            <InputGroup>
              <Input 
                name="password"
                type="password"
                value={formData.password}
                onChange={handleInputChange}
                placeholder="Create a password"
              />
            </InputGroup>
          </FormControl>
          
          <FormControl isRequired>
            <FormLabel>Confirm Password</FormLabel>
            <InputGroup>
              <Input 
                name="confirmPassword"
                type="password"
                value={formData.confirmPassword}
                onChange={handleInputChange}
                placeholder="Confirm your password"
              />
            </InputGroup>
          </FormControl>
          
          <Button
            colorScheme="red"
            size="lg"
            onClick={handleCreateAccount}
            isLoading={isLoading}
            loadingText="Creating Account"
            mt={2}
          >
            Create Account
          </Button>
          
          <Divider />
          
          <Text textAlign="center">
            Already have an account?{' '}
            <Button variant="link" colorScheme="red" onClick={handleSignIn}>
              Sign In
            </Button>
          </Text>
        </VStack>
      </VStack>
    </Container>
  );
};

// Force navigation to a specific route with fallback mechanisms
const handleForceNavigation = (path: string, navigateFunc?: NavigateFunction) => {
  console.log(`Forcing navigation to ${path} with fallback mechanisms`);
  
  // Store the path in session storage first as a fallback
  sessionStorage.setItem('redirectPath', path);
  
  // For onboarding, set the forced access flag
  if (path === '/onboarding') {
    sessionStorage.setItem('force_onboarding_access', 'true');
  }
  
  // Try multiple navigation methods
  try {
    // Method 1: Use React Router's navigate if available
    if (navigateFunc) {
      console.log('Using React Router navigate');
      navigateFunc(path);
      return;
    }
    
    // Method 2: Direct location change as fallback
    console.log('Falling back to direct location change');
    window.location.href = path;
  } catch (err) {
    console.error('Navigation failed, trying alternative:', err);
    
    // Method 3: Use the direct access route for onboarding
    if (path === '/onboarding') {
      window.location.href = '/direct-onboarding';
    } else {
      // For other paths, try to reload
      window.location.reload();
    }
  }
};

const AppRoutes = () => {
  return (
    <Routes>
      {/* Public Routes */}
      <Route path="/" element={<Layout><LandingPage /></Layout>} />
      <Route path="/signin" element={<Layout><SignInPage /></Layout>} />
      <Route path="/signup" element={<Layout><SignUpPage /></Layout>} />
      
      {/* Direct Access Route - bypasses auth checks */}
      <Route path="/direct-onboarding" element={<DirectOnboardingAccess />} />
      
      {/* Onboarding Route */}
      <Route 
        path="/onboarding" 
        element={
          <OnboardingRoute>
            <Layout>
              <OnboardingPage />
            </Layout>
          </OnboardingRoute>
        } 
      />
      
      {/* Protected Routes */}
      <Route 
        path="/dashboard" 
        element={
          <ProtectedRoute>
            <Layout>
              <Dashboard />
            </Layout>
          </ProtectedRoute>
        } 
      />
      
      {/* Fallback Route */}
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
};

export default AppRoutes; 