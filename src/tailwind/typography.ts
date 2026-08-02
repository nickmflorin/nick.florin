import { type ThemeConfig, type ThemePluginUtils } from './types';

/**
 * Defines the portions of the Tailwind theme that control typography, namely the font, text and
 * list scales, exclusive of the colors that text is rendered in.
 */
export const TypographyTheme = {
  content: {
    none: 'none',
  },
  fontFamily: {
    body: ['var(--font-inter)'],
    inter: ['var(--font-inter)', 'ui-sans-serif', 'system-ui', 'sans-serif'],
    label: ['var(--font-inter)'],
    mono: [
      'ui-monospace',
      'SFMono-Regular',
      'Menlo',
      'Monaco',
      'Consolas',

      '"Liberation Mono"',
      '"Courier New"',

      'monospace',
    ],
    sans: ['var(--font-inter)', 'ui-sans-serif', 'system-ui', 'sans-serif'],
    serif: ['var(--font-inter)', 'ui-serif', 'serif'],
    title: ['var(--font-inter)'],
  },
  fontSize: {
    lg: ['18px', { lineHeight: '22px' }],
    md: ['16px', { lineHeight: '20px' }],
    sm: ['14px', { lineHeight: '18px' }],
    smplus: ['15px', { lineHeight: '18px' }],
    'title-lg': ['20px', { lineHeight: '24px' }],
    'title-md': ['18px', { lineHeight: '22px' }],
    'title-sm': ['16px', { lineHeight: '20px' }],
    'title-smplus': ['17px', { lineHeight: '20px' }],
    'title-xl': ['22px', { lineHeight: '26px' }],
    'title-xs': ['14px', { lineHeight: '18px' }],
    'title-xxs': ['13px', { lineHeight: '16px' }],
    'title-xxxs': ['12px', { lineHeight: '16px' }],
    xl: ['20px', { lineHeight: '24px' }],
    xs: ['13px', { lineHeight: '16px' }],
    xxs: ['12px', { lineHeight: '14px' }],
    xxxs: ['11px', { lineHeight: '14px' }],
  },
  fontWeight: {
    bold: '700',
    light: '300',
    medium: '500',
    regular: '400',
    semibold: '600',
  },
  letterSpacing: {
    normal: '0em',
    tight: '-0.025em',
    tighter: '-0.05em',
    wide: '0.025em',
    wider: '0.05em',
    widest: '0.1em',
  },
  lineClamp: {
    1: '1',
    2: '2',
    3: '3',
    4: '4',
    5: '5',
    6: '6',
  },
  lineHeight: {
    3: '.75rem',
    4: '1rem',
    5: '1.25rem',
    6: '1.5rem',
    7: '1.75rem',
    8: '2rem',
    9: '2.25rem',
    10: '2.5rem',
    loose: '2',
    none: '1',
    normal: '1.5',
    relaxed: '1.625',
    snug: '1.375',
    tight: '1.25',
  },
  listStyleImage: {
    none: 'none',
  },
  listStyleType: {
    decimal: 'decimal',
    disc: 'disc',
    none: 'none',
  },
  textDecorationThickness: {
    0: '0px',
    1: '1px',
    2: '2px',
    4: '4px',
    8: '8px',
    auto: 'auto',
    'from-font': 'from-font',
  },
  textIndent: ({ theme }: ThemePluginUtils) => ({
    ...theme('spacing'),
  }),
  textUnderlineOffset: {
    0: '0px',
    1: '1px',
    2: '2px',
    4: '4px',
    8: '8px',
    auto: 'auto',
  },
} as const satisfies ThemeConfig;
