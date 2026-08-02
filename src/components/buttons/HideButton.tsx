import { type ForwardedRef, type JSX } from 'react';

import { IconButton, type IconButtonProps } from './generic';

export interface HideButtonProps extends Omit<
  IconButtonProps<'button'>,
  'icon' | 'scheme' | 'variant'
> {
  readonly ref?: ForwardedRef<HTMLButtonElement>;
}

export const HideButton = ({ ref, ...props }: HideButtonProps): JSX.Element => (
  <IconButton.Transparent {...props} icon='eye-slash' ref={ref} scheme='light' />
);
