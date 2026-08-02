import { type JSX } from 'react';

import { type TypographyComponent, type TypographyRef } from '~/components/types';

import { Typography, type TypographyProps } from './Typography';

export type LabelProps<C extends TypographyComponent<'label'>> = {
  readonly component?: C;
  readonly ref?: TypographyRef<C>;
} & Omit<TypographyProps<'label', C>, 'component' | 'variant'>;

export const Label = <C extends TypographyComponent<'label'>>({
  component = 'div' as C,
  ref,
  ...props
}: LabelProps<C>): JSX.Element => {
  const ps = {
    ...props,
    component,
    variant: 'label',
  } as TypographyProps<'label', C>;

  return <Typography {...ps} ref={ref} />;
};
