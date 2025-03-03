import React from 'react';
import { Box, Container, Text, Link, HStack, Flex, useColorModeValue, Divider, Icon } from '@chakra-ui/react';
import { Link as RouterLink } from 'react-router-dom';
import { FaTwitter, FaInstagram, FaFacebook, FaGithub } from 'react-icons/fa';

const SocialIcon = ({ icon, href }: { icon: React.ElementType; href: string }) => {
  const iconColor = useColorModeValue('gray.600', 'gray.400');
  const hoverColor = useColorModeValue('red.500', 'red.300');
  
  return (
    <Link href={href} isExternal>
      <Icon 
        as={icon} 
        w={5} 
        h={5} 
        color={iconColor} 
        _hover={{ color: hoverColor, transform: 'translateY(-2px)' }}
        transition="all 0.2s"
      />
    </Link>
  );
};

const Footer = () => {
  const bgColor = useColorModeValue('rgba(255, 255, 255, 0.7)', 'rgba(26, 32, 44, 0.7)');
  const borderColor = useColorModeValue('red.100', 'red.900');
  const textColor = useColorModeValue('gray.600', 'gray.400');
  const accentColor = useColorModeValue('red.500', 'red.300');
  
  return (
    <Box 
      bg={bgColor} 
      py={6} 
      borderTop="1px" 
      borderColor={borderColor}
      backdropFilter="blur(10px)"
      position="relative"
      zIndex="1"
    >
      <Container maxW="container.xl">
        <Flex 
          direction={{ base: 'column', md: 'row' }} 
          justify="space-between" 
          align={{ base: 'center', md: 'flex-start' }}
        >
          <Box mb={{ base: 6, md: 0 }} textAlign={{ base: 'center', md: 'left' }}>
            <Text 
              fontSize="lg" 
              fontWeight="bold" 
              bgGradient={`linear(to-r, ${accentColor}, red.700)`}
              bgClip="text"
              mb={2}
            >
              RedDrop
            </Text>
            <Text fontSize="sm" color={textColor} maxW="300px">
              Connecting blood donors with those in need through innovative technology.
            </Text>
          </Box>
          
          <HStack spacing={8} align="flex-start" flexWrap="wrap" justify={{ base: 'center', md: 'flex-end' }}>
            <Box>
              <Text fontWeight="medium" mb={3} color={accentColor}>Links</Text>
              <Flex direction="column" gap={2}>
                <Link as={RouterLink} to="/" fontSize="sm" color={textColor} _hover={{ color: accentColor }}>
                  Home
                </Link>
                <Link as={RouterLink} to="/about" fontSize="sm" color={textColor} _hover={{ color: accentColor }}>
                  About
                </Link>
                <Link as={RouterLink} to="/privacy" fontSize="sm" color={textColor} _hover={{ color: accentColor }}>
                  Privacy
                </Link>
              </Flex>
            </Box>
            
            <Box>
              <Text fontWeight="medium" mb={3} color={accentColor}>Support</Text>
              <Flex direction="column" gap={2}>
                <Link as={RouterLink} to="/faq" fontSize="sm" color={textColor} _hover={{ color: accentColor }}>
                  FAQ
                </Link>
                <Link as={RouterLink} to="/contact" fontSize="sm" color={textColor} _hover={{ color: accentColor }}>
                  Contact
                </Link>
                <Link as={RouterLink} to="/terms" fontSize="sm" color={textColor} _hover={{ color: accentColor }}>
                  Terms
                </Link>
              </Flex>
            </Box>
          </HStack>
        </Flex>
        
        <Divider my={6} borderColor={borderColor} />
        
        <Flex 
          direction={{ base: 'column', sm: 'row' }} 
          justify="space-between" 
          align="center"
          gap={4}
        >
          <Text fontSize="xs" color={textColor}>
            &copy; {new Date().getFullYear()} RedDrop Blood Donation System. All rights reserved.
          </Text>
          
          <HStack spacing={4}>
            <SocialIcon icon={FaTwitter} href="https://twitter.com" />
            <SocialIcon icon={FaInstagram} href="https://instagram.com" />
            <SocialIcon icon={FaFacebook} href="https://facebook.com" />
            <SocialIcon icon={FaGithub} href="https://github.com" />
          </HStack>
        </Flex>
      </Container>
    </Box>
  );
};

export default Footer; 