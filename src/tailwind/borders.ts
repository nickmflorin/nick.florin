import { type ThemeConfig, type ThemePluginUtils } from './types';

/**
 * Defines the portions of the Tailwind theme that control borders, outlines, rings and
 * strokes, exclusive of the colors that are applied to them.
 */
export const BorderTheme = {
  borderRadius: {
    '2xl': '16px',
    '3xl': '24px',
    full: '9999px',
    lg: '8px',
    md: '6px',
    none: '0px',
    sm: '4px',
    xl: '12px',
    xs: '2px',
  },
  borderWidth: {
    0: '0px',
    2: '2px',
    4: '4px',
    8: '8px',
    DEFAULT: '1px',
  },
  divideWidth: ({ theme }: ThemePluginUtils) => theme('borderWidth'),
  outlineOffset: {
    0: '0px',
    1: '1px',
    2: '2px',
    4: '4px',
    8: '8px',
  },
  outlineWidth: {
    0: '0px',
    1: '1px',
    2: '2px',
    4: '4px',
    8: '8px',
  },
  ringOffsetWidth: {
    0: '0px',
    1: '1px',
    2: '2px',
    4: '4px',
    8: '8px',
  },
  ringWidth: {
    0: '0px',
    1: '1px',
    2: '2px',
    4: '4px',
    8: '8px',
    DEFAULT: '3px',
  },
  strokeWidth: {
    0: '0',
    1: '1',
    2: '2',
  },
} as const satisfies ThemeConfig;
