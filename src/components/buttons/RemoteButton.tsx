import { type Ref } from 'react';

import { IconButton, type IconButtonProps } from './generic';

export interface RemoteButtonProps extends Omit<
  IconButtonProps<'button'>,
  'icon' | 'ref' | 'scheme' | 'variant'
> {
  readonly ref?: Ref<HTMLButtonElement>;
}

export const RemoteButton = ({ ref, ...props }: RemoteButtonProps) => (
  <IconButton.Transparent {...props} icon='laptop-code' ref={ref} scheme='light' />
);
