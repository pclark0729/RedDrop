import { extendTheme } from '@chakra-ui/react';

const theme = extendTheme({
  colors: {
    brand: {
      50: '#ffe5e5',
      100: '#fbb8b8',
      200: '#f58a8a',
      300: '#f05c5c',
      400: '#eb2e2e',
      500: '#d21515',
      600: '#a40f0f',
      700: '#760a0a',
      800: '#480505',
      900: '#1e0000',
    },
    gray: {
      50: '#f7f7f7',
      100: '#eeeeee',
      200: '#e2e2e2',
      300: '#d0d0d0',
      400: '#ababab',
      500: '#8a8a8a',
      600: '#636363',
      700: '#505050',
      800: '#323232',
      900: '#121212',
    },
  },
  fonts: {
    heading: '"Inter", -apple-system, BlinkMacSystemFont, "Segoe UI", Helvetica, Arial, sans-serif',
    body: '"Inter", -apple-system, BlinkMacSystemFont, "Segoe UI", Helvetica, Arial, sans-serif',
  },
  components: {
    Button: {
      baseStyle: {
        fontWeight: 'medium',
        borderRadius: 'md',
        _focus: {
          boxShadow: 'none',
        },
      },
      variants: {
        solid: {
          bg: 'brand.500',
          color: 'white',
          _hover: {
            bg: 'brand.600',
          },
          _active: {
            bg: 'brand.700',
          },
        },
        outline: {
          border: '1px solid',
          borderColor: 'brand.500',
          color: 'brand.500',
          _hover: {
            bg: 'brand.50',
          },
        },
        ghost: {
          color: 'brand.500',
          _hover: {
            bg: 'brand.50',
          },
        },
      },
    },
    Card: {
      baseStyle: {
        container: {
          borderRadius: 'lg',
          overflow: 'hidden',
          boxShadow: 'sm',
          transition: 'all 0.2s ease-in-out',
          _hover: {
            boxShadow: 'md',
          },
        },
      },
    },
    Badge: {
      baseStyle: {
        borderRadius: 'full',
        textTransform: 'capitalize',
        fontWeight: 'medium',
      },
      variants: {
        solid: {
          bg: 'brand.500',
          color: 'white',
        },
      },
    },
    Tabs: {
      variants: {
        'soft-rounded': {
          tab: {
            borderRadius: 'full',
            fontWeight: 'medium',
            _selected: {
              color: 'white',
              bg: 'brand.500',
            },
          },
        },
      },
    },
    Heading: {
      baseStyle: {
        fontWeight: 'semibold',
      },
    },
  },
  styles: {
    global: {
      body: {
        bg: 'gray.50',
        color: 'gray.800',
      },
    },
  },
});

export default theme; 