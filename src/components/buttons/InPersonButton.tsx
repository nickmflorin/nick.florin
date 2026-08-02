import { type ForwardedRef } from 'react';

import { IconButton, type IconButtonProps } from './generic';

export interface InPersonButtonProps extends Omit<
  IconButtonProps<'button'>,
  'icon' | 'scheme' | 'variant'
> {
  readonly ref?: ForwardedRef<HTMLButtonElement>;
}

export const InPersonButton = ({ ref, ...props }: InPersonButtonProps) => (
  <IconButton.Transparent {...props} icon='house-person-return' ref={ref} scheme='light' />
);
