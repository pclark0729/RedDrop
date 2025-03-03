import React from 'react';
import { Box, useColorModeValue } from '@chakra-ui/react';
import Header from './Header';
import Footer from './Footer';

interface LayoutProps {
  children: React.ReactNode;
}

const Layout: React.FC<LayoutProps> = ({ children }) => {
  const bgGradient = useColorModeValue(
    'linear-gradient(135deg, rgba(255,245,245,0.9) 0%, rgba(255,255,255,1) 100%)',
    'linear-gradient(135deg, rgba(20,20,20,0.95) 0%, rgba(30,30,30,1) 100%)'
  );
  
  const borderColor = useColorModeValue('red.100', 'red.900');
  
  return (
    <Box 
      minH="100vh" 
      display="flex" 
      flexDirection="column" 
      bgGradient={bgGradient}
      position="relative"
      overflow="hidden"
      _before={{
        content: '""',
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        bgImage: 'url("/assets/grid-pattern.svg")',
        bgSize: '50px 50px',
        opacity: 0.05,
        pointerEvents: 'none',
        zIndex: 0
      }}
    >
      {/* Decorative elements */}
      <Box 
        position="absolute" 
        top="5%" 
        right="5%" 
        w="150px" 
        h="150px" 
        borderRadius="full" 
        bg="red.500" 
        filter="blur(80px)" 
        opacity="0.15" 
        zIndex="0"
      />
      <Box 
        position="absolute" 
        bottom="10%" 
        left="5%" 
        w="200px" 
        h="200px" 
        borderRadius="full" 
        bg="red.600" 
        filter="blur(100px)" 
        opacity="0.1" 
        zIndex="0"
      />
      
      <Header />
      <Box 
        flex="1" 
        position="relative" 
        zIndex="1"
        px={{ base: 4, md: 6, lg: 8 }}
        py={{ base: 6, md: 8, lg: 10 }}
      >
        {children}
      </Box>
      <Footer />
    </Box>
  );
};

export default Layout; 