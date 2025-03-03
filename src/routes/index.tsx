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
  const { user, isLoading, isOnboarding } = useAuthContext();
  const location = useLocation();
  const navigate = useNavigate();

  useEffect(() => {
    // If user is authenticated but needs to complete onboarding,
    // redirect to onboarding page unless they're already there
    if (user && isOnboarding && location.pathname !== '/onboarding') {
      navigate('/onboarding', { replace: true });
    }
  }, [user, isOnboarding, location.pathname, navigate]);

  if (isLoading) {
    return (
      <Center h="100vh">
        <Spinner size="xl" color="red.500" />
      </Center>
    );
  }

  if (!user) {
    return <Navigate to="/signin" state={{ from: location }} replace />;
  }

  // If user is authenticated and has completed onboarding (or is on the onboarding page),
  // render the protected content
  return <>{children}</>;
};

// Onboarding Route Component
const OnboardingRoute = ({ children }: { children: React.ReactNode }) => {
  const { user, isLoading, isOnboarding } = useAuthContext();
  const location = useLocation();
  const navigate = useNavigate();

  useEffect(() => {
    // If user is authenticated but has already completed onboarding,
    // redirect to dashboard
    if (user && !isOnboarding) {
      navigate('/dashboard', { replace: true });
    }
  }, [user, isOnboarding, navigate]);

  if (isLoading) {
    return (
      <Center h="100vh">
        <Spinner size="xl" color="red.500" />
      </Center>
    );
  }

  if (!user) {
    return <Navigate to="/signin" state={{ from: location }} replace />;
  }

  // If user is authenticated and needs to complete onboarding,
  // render the onboarding content
  return <>{children}</>;
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
    <Layout>
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
    </Layout>
  );
};

// Sign In Page
const SignInPage = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { signIn, isOnboarding } = useAuthContext();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [credentials, setCredentials] = useState({
    email: '',
    password: ''
  });
  
  // Get the redirect path from location state, or default to dashboard
  const from = location.state?.from?.pathname || '/dashboard';
  
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setCredentials(prev => ({
      ...prev,
      [name]: value
    }));
  };
  
  const handleSignIn = async () => {
    // Validate form
    if (!credentials.email || !credentials.password) {
      setError('Email and password are required');
      return;
    }
    
    try {
      setIsLoading(true);
      setError(null);
      
      // Sign in with Supabase
      await signIn({ 
        email: credentials.email, 
        password: credentials.password 
      });
      
      // Navigate to onboarding if needed, otherwise to the intended destination
      if (isOnboarding) {
        navigate('/onboarding');
      } else {
        navigate(from, { replace: true });
      }
    } catch (err) {
      console.error('Authentication error:', err);
      setError('Invalid email or password. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };
  
  const handleSignUp = () => {
    navigate('/signup');
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
            Welcome Back
          </Heading>
          <Text color="gray.500" textAlign="center">
            Sign in to continue to your account
          </Text>
        </VStack>
        
        {error && (
          <Alert status="error" borderRadius="md">
            <AlertIcon />
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}
        
        <VStack spacing={4} align="stretch">
          <FormControl isRequired>
            <FormLabel>Email</FormLabel>
            <Input 
              name="email"
              type="email"
              value={credentials.email}
              onChange={handleChange}
              placeholder="Your email address"
            />
          </FormControl>
          
          <FormControl isRequired>
            <FormLabel>Password</FormLabel>
            <InputGroup>
              <Input 
                name="password"
                type="password"
                value={credentials.password}
                onChange={handleChange}
                placeholder="Your password"
              />
            </InputGroup>
          </FormControl>
          
          <Button
            colorScheme="red"
            size="lg"
            onClick={handleSignIn}
            isLoading={isLoading}
            loadingText="Signing In"
            mt={2}
          >
            Sign In
          </Button>
          
          <Divider />
          
          <Text textAlign="center">
            Don't have an account?{' '}
            <Button variant="link" colorScheme="red" onClick={handleSignUp}>
              Sign Up
            </Button>
          </Text>
        </VStack>
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
  
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };
  
  const handleCreateAccount = async () => {
    // Validate form
    if (!formData.email || !formData.password) {
      setError('Email and password are required');
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
      setError('Failed to create account. Please try again.');
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
                onChange={handleChange}
                placeholder="First name"
              />
            </FormControl>
            
            <FormControl>
              <FormLabel>Last Name</FormLabel>
              <Input 
                name="lastName"
                value={formData.lastName}
                onChange={handleChange}
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
              onChange={handleChange}
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
                onChange={handleChange}
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
                onChange={handleChange}
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

const AppRoutes = () => {
  return (
    <Routes>
      {/* Public Routes */}
      <Route path="/" element={<Layout><LandingPage /></Layout>} />
      <Route path="/signin" element={<Layout><SignInPage /></Layout>} />
      <Route path="/signup" element={<Layout><SignUpPage /></Layout>} />
      
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