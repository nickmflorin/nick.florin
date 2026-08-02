import { type ForwardedRef } from 'react';

import { IconButton, type IconButtonProps } from './generic';

export interface HighlightButtonProps extends Omit<
  IconButtonProps<'button'>,
  'icon' | 'scheme' | 'variant'
> {
  readonly ref?: ForwardedRef<HTMLButtonElement>;
}

export const HighlightButton = ({ ref, ...props }: HighlightButtonProps) => (
  <IconButton.Transparent {...props} icon='star' ref={ref} scheme='light' />
);
