import { extendTheme } from '@chakra-ui/react';

const theme = extendTheme({
  colors: {
    brand: {
      900: '#000000', // black
      800: '#1a1a1a',
      700: '#333333',
      600: '#4d4d4d',
      500: '#666666',
      400: '#808080',
      300: '#999999',
      200: '#b3b3b3',
      100: '#cccccc',
      50: '#e6e6e6',
    },
  },
  styles: {
    global: {
      body: {
        bg: 'white',
        color: 'gray.800',
      },
    },
  },
  components: {
    Button: {
      defaultProps: {
        colorScheme: 'brand',
      },
    },
  },
});

export default theme; 