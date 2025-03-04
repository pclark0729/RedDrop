import React from 'react';
import {
  Box,
  Flex,
  HStack,
  Button,
  Text,
  useColorModeValue,
  Container,
  IconButton,
  useDisclosure,
  Drawer,
  DrawerOverlay,
  DrawerContent,
  DrawerCloseButton,
  DrawerBody,
  VStack,
  Divider,
  Menu,
  MenuButton,
  MenuList,
  MenuItem,
  Avatar
} from '@chakra-ui/react';
import { Link as RouterLink, useLocation, useNavigate } from 'react-router-dom';
import { HamburgerIcon, ChevronDownIcon } from '@chakra-ui/icons';
import { useAuthContext } from '../../features/auth/context/AuthContext';

const NavLink = ({ to, children, isActive }: { to: string; children: React.ReactNode; isActive?: boolean }) => {
  const activeBg = useColorModeValue('red.50', 'red.900');
  const hoverBg = useColorModeValue('red.50', 'red.900');
  const activeColor = useColorModeValue('red.600', 'red.200');
  const color = useColorModeValue('gray.700', 'gray.200');
  
  return (
    <Box
      as={RouterLink}
      to={to}
      px={3}
      py={2}
      rounded="md"
      position="relative"
      fontWeight="medium"
      color={isActive ? activeColor : color}
      bg={isActive ? activeBg : 'transparent'}
      _hover={{
        bg: hoverBg,
        color: activeColor,
      }}
      _after={isActive ? {
        content: '""',
        position: 'absolute',
        bottom: '0',
        left: '50%',
        transform: 'translateX(-50%)',
        width: '20px',
        height: '2px',
        bg: 'red.500',
      } : {}}
      transition="all 0.2s"
    >
      {children}
    </Box>
  );
};

const Header = () => {
  const { isOpen, onOpen, onClose } = useDisclosure();
  const location = useLocation();
  const navigate = useNavigate();
  const { user, signOut, isOnboarding } = useAuthContext();
  
  const bgColor = useColorModeValue('rgba(255, 255, 255, 0.8)', 'rgba(26, 32, 44, 0.8)');
  const borderColor = useColorModeValue('red.100', 'red.900');
  const logoColor = useColorModeValue('red.600', 'red.300');
  
  const isActive = (path: string) => location.pathname === path;

  const handleSignOut = async () => {
    try {
      console.log('Header: Initiating sign out process');
      
      // Show loading state if needed
      // You could add a loading state here if you want to show a loading indicator
      
      await signOut();
      // No need to navigate here as the AuthContext signOut function already redirects
      console.log('Header: Sign out function called successfully');
    } catch (error) {
      console.error('Header: Sign out error:', error);
      // If there's an error during sign out, try to navigate to home page as a fallback
      console.log('Header: Attempting fallback navigation to home page');
      navigate('/');
    }
  };

  // Get user display name
  const getUserDisplayName = () => {
    if (!user) return '';
    
    if (user.first_name && user.last_name) {
      return `${user.first_name} ${user.last_name}`;
    } else if (user.first_name) {
      return user.first_name;
    } else {
      // Extract username from email
      return user.email.split('@')[0];
    }
  };

  return (
    <Box
      as="header"
      position="sticky"
      top="0"
      zIndex="10"
      bg={bgColor}
      backdropFilter="blur(10px)"
      borderBottom="1px"
      borderColor={borderColor}
      boxShadow="sm"
    >
      <Container maxW="container.xl" py={3}>
        <Flex justify="space-between" align="center">
          {/* Logo */}
          <Flex align="center">
            <Text
              as={RouterLink}
              to="/"
              fontSize="2xl"
              fontWeight="bold"
              letterSpacing="tight"
              bgGradient="linear(to-r, red.500, red.700)"
              bgClip="text"
              _hover={{
                bgGradient: "linear(to-r, red.600, red.800)",
              }}
            >
              RedDrop<Box as="span" color={logoColor} ml={1}>.</Box>
            </Text>
          </Flex>

          {/* Desktop Navigation */}
          <HStack spacing={4} display={{ base: 'none', md: 'flex' }}>
            <NavLink to="/" isActive={isActive('/')}>Home</NavLink>
            
            {/* Conditional navigation based on authentication */}
            {user ? (
              <>
                {!isOnboarding && (
                  <>
                    <NavLink to="/dashboard" isActive={isActive('/dashboard')}>Dashboard</NavLink>
                    <NavLink to="/donations" isActive={isActive('/donations')}>My Donations</NavLink>
                  </>
                )}
                
                <Menu>
                  <MenuButton
                    as={Button}
                    variant="ghost"
                    rightIcon={<ChevronDownIcon />}
                    _hover={{ bg: 'red.50' }}
                  >
                    <Flex align="center">
                      <Avatar 
                        size="xs" 
                        name={getUserDisplayName()} 
                        mr={2} 
                        bg="red.500"
                        color="white"
                      />
                      <Text>{getUserDisplayName()}</Text>
                    </Flex>
                  </MenuButton>
                  <MenuList>
                    {isOnboarding ? (
                      <MenuItem as={RouterLink} to="/onboarding">Complete Profile</MenuItem>
                    ) : (
                      <>
                        <MenuItem as={RouterLink} to="/profile">Profile</MenuItem>
                        <MenuItem as={RouterLink} to="/settings">Settings</MenuItem>
                      </>
                    )}
                    <Divider />
                    <MenuItem onClick={handleSignOut} color="red.500">Sign Out</MenuItem>
                  </MenuList>
                </Menu>
              </>
            ) : (
              <>
                <NavLink to="/signin" isActive={isActive('/signin')}>Sign In</NavLink>
                <NavLink to="/signup" isActive={isActive('/signup')}>Sign Up</NavLink>
                
                <Button
                  as={RouterLink}
                  to="/donor/register"
                  colorScheme="red"
                  size="sm"
                  ml={2}
                  fontWeight="medium"
                  _hover={{
                    transform: 'translateY(-2px)',
                    boxShadow: 'md',
                  }}
                  transition="all 0.2s"
                >
                  Become a Donor
                </Button>
              </>
            )}
          </HStack>

          {/* Mobile Navigation Button */}
          <IconButton
            display={{ base: 'flex', md: 'none' }}
            aria-label="Open menu"
            icon={<HamburgerIcon />}
            onClick={onOpen}
            variant="ghost"
            colorScheme="red"
          />
        </Flex>
      </Container>

      {/* Mobile Navigation Drawer */}
      <Drawer isOpen={isOpen} placement="right" onClose={onClose}>
        <DrawerOverlay />
        <DrawerContent>
          <DrawerCloseButton />
          <DrawerBody pt={10}>
            <VStack spacing={4} align="stretch">
              <Text
                fontSize="xl"
                fontWeight="bold"
                bgGradient="linear(to-r, red.500, red.700)"
                bgClip="text"
                mb={4}
              >
                RedDrop
              </Text>
              
              {user && (
                <Flex align="center" mb={2}>
                  <Avatar 
                    size="sm" 
                    name={getUserDisplayName()} 
                    mr={2} 
                    bg="red.500"
                    color="white"
                  />
                  <Text fontWeight="medium">{getUserDisplayName()}</Text>
                </Flex>
              )}
              
              <Divider />
              <Box as={RouterLink} to="/" py={2} onClick={onClose}>Home</Box>
              
              {/* Conditional mobile navigation based on authentication */}
              {user ? (
                <>
                  {!isOnboarding && (
                    <>
                      <Box as={RouterLink} to="/dashboard" py={2} onClick={onClose}>Dashboard</Box>
                      <Box as={RouterLink} to="/donations" py={2} onClick={onClose}>My Donations</Box>
                    </>
                  )}
                  
                  {isOnboarding ? (
                    <Box as={RouterLink} to="/onboarding" py={2} onClick={onClose}>Complete Profile</Box>
                  ) : (
                    <>
                      <Box as={RouterLink} to="/profile" py={2} onClick={onClose}>Profile</Box>
                      <Box as={RouterLink} to="/settings" py={2} onClick={onClose}>Settings</Box>
                    </>
                  )}
                  
                  <Divider />
                  <Box py={2} onClick={() => { handleSignOut(); onClose(); }} color="red.500" cursor="pointer">
                    Sign Out
                  </Box>
                </>
              ) : (
                <>
                  <Box as={RouterLink} to="/signin" py={2} onClick={onClose}>Sign In</Box>
                  <Box as={RouterLink} to="/signup" py={2} onClick={onClose}>Sign Up</Box>
                  <Divider />
                  <Button
                    as={RouterLink}
                    to="/donor/register"
                    colorScheme="red"
                    onClick={onClose}
                  >
                    Become a Donor
                  </Button>
                </>
              )}
            </VStack>
          </DrawerBody>
        </DrawerContent>
      </Drawer>
    </Box>
  );
};

export default Header; 