// theme.ts
import { extendTheme, ThemeConfig } from '@chakra-ui/react';

export const chakraThemeConfig: ThemeConfig = {
  initialColorMode: 'dark',
  useSystemColorMode: false,
};

export const chakraTheme = extendTheme({
  config: chakraThemeConfig,
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
