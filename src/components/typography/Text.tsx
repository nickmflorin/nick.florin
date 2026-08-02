import { type JSX } from 'react';

import { type TypographyComponent, type TypographyRef } from '~/components/types';

import { Typography, type TypographyProps } from './Typography';

export type TextProps<C extends TypographyComponent<'text'>> = {
  readonly component?: C;
  readonly ref?: TypographyRef<C>;
} & Omit<TypographyProps<'text', C>, 'component' | 'variant'>;

export const Text = <C extends TypographyComponent<'text'>>({
  component = 'div' as C,
  ref,
  ...props
}: TextProps<C>): JSX.Element => {
  const ps = {
    ...props,
    component,
    variant: 'text',
  } as TypographyProps<'text', C>;

  return <Typography {...ps} ref={ref} />;
};
