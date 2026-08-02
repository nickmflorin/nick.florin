import { type ForwardedRef, type JSX } from 'react';

import { IconButton, type IconButtonProps } from './generic';

export interface UnhighlightButtonProps extends Omit<
  IconButtonProps<'button'>,
  'icon' | 'scheme' | 'variant'
> {
  readonly ref?: ForwardedRef<HTMLButtonElement>;
}

export const UnhighlightButton = ({ ref, ...props }: UnhighlightButtonProps): JSX.Element => (
  <IconButton.Transparent {...props} icon='ban' ref={ref} scheme='light' />
);
