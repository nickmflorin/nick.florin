import { type ForwardedRef } from 'react';

import { IconButton, type IconButtonProps } from './generic';

export interface ShowButtonProps extends Omit<
  IconButtonProps<'button'>,
  'icon' | 'scheme' | 'variant'
> {
  readonly ref?: ForwardedRef<HTMLButtonElement>;
}

export const ShowButton = ({ ref, ...props }: ShowButtonProps) => (
  <IconButton.Transparent {...props} icon='eye' ref={ref} scheme='light' />
);
