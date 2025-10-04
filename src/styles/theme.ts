import { extendTheme } from '@chakra-ui/react';

const theme = extendTheme({
  fonts: {
    heading: 'var(--font-pixelify), sans-serif',
    body: 'var(--font-roboto), sans-serif',
  },
  components: {
    Button: {
      baseStyle: {
        fontFamily: 'var(--font-pixelify), sans-serif',
        fontWeight: 'normal',
        letterSpacing: '0.5px',
      },
    },
    Heading: {
      baseStyle: {
        fontFamily: 'var(--font-pixelify), sans-serif',
        fontWeight: 'normal',
      },
    },
    Stat: {
      baseStyle: {
        label: {
          fontFamily: 'var(--font-roboto), sans-serif',
        },
        number: {
          fontFamily: 'var(--font-pixelify), sans-serif',
        },
      },
    },
    Badge: {
      baseStyle: {
        fontFamily: 'var(--font-pixelify), sans-serif',
      },
    },
    Tab: {
      baseStyle: {
        fontFamily: 'var(--font-pixelify), sans-serif',
      },
    },
  },
});

export default theme;