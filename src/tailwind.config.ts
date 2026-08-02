import AspectRatioPlugin from '@tailwindcss/aspect-ratio';
import ContainerQueriesPlugin from '@tailwindcss/container-queries';
import { type Config } from 'tailwindcss';

import { BorderTheme } from './tailwind/borders';
import { ColorTheme } from './tailwind/colors';
import { EffectTheme } from './tailwind/effects';
import { LayoutTheme } from './tailwind/layout';
import { SizingTheme } from './tailwind/sizing';
import { SpacingTheme } from './tailwind/spacing';
import { TypographyTheme } from './tailwind/typography';

const config = {
  content: [
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/features/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  corePlugins: {
    aspectRatio: false,
  },
  // Can alternatively be set to 'class'.
  darkMode: 'media',
  important: true,
  plugins: [ContainerQueriesPlugin, AspectRatioPlugin],
  presets: [],
  theme: {
    ...BorderTheme,
    ...ColorTheme,
    ...EffectTheme,
    ...LayoutTheme,
    ...SizingTheme,
    ...SpacingTheme,
    ...TypographyTheme,
    extend: {
      containers: {
        '2xl': '672px',
        '3xl': '768px',
        '4xl': '896px',
        '5xl': '1024px',
        '6xl': '1152px',
        '7xl': '1280px',
        lg: '512px',
        md: '448px',
        sm: '348px',
        xl: '576px',
        xs: '320px',
      },
      lineHeight: {
        lg: '22px',
        md: '20px',
        sm: '18px',
        smplus: '18px',
        xl: '24px',
        xs: '16px',
        xxs: '14px',
        xxxs: '14px',
      },
    },
  },
} as const satisfies Config;

export default config;
