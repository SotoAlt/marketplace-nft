// theme.ts
import { extendTheme, ThemeConfig } from '@chakra-ui/react';

export const chakraThemeConfig: ThemeConfig = {
  initialColorMode: 'dark',
  useSystemColorMode: false,
};

export const chakraTheme = extendTheme({
  config: chakraThemeConfig,
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
  styles: {
    global: {
      /* keyframes */
      '@keyframes shine': {
        '0%': { backgroundPosition: '0% 0%' },
        '50%': { backgroundPosition: '100% 100%' },
        '100%': { backgroundPosition: '0% 0%' },
      },
      /* clase utilitaria opcional (imitando 'motion-safe:animate-shine') */
      '.animate-shine': {
        animation: 'shine var(--duration,14s) linear infinite',
      },
    },
  },
});
