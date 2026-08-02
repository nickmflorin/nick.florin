import { type ForwardedRef } from 'react';

import { IconButton, type IconButtonProps } from './generic';

export interface PrioritizeButtonProps extends Omit<
  IconButtonProps<'button'>,
  'icon' | 'scheme' | 'variant'
> {
  readonly ref?: ForwardedRef<HTMLButtonElement>;
}

export const PrioritizeButton = ({ ref, ...props }: PrioritizeButtonProps) => (
  <IconButton.Transparent {...props} icon='arrow-up-1-9' ref={ref} scheme='light' />
);
