import { type Ref } from 'react';

import { IconButton, type IconButtonProps } from './generic';

export interface DeprioritizeButtonProps extends Omit<
  IconButtonProps<'button'>,
  'icon' | 'ref' | 'scheme' | 'variant'
> {
  readonly ref?: Ref<HTMLButtonElement>;
}

export const DeprioritizeButton = ({ ref, ...props }: DeprioritizeButtonProps) => (
  <IconButton.Transparent {...props} icon='arrow-down-1-9' ref={ref} scheme='light' />
);
